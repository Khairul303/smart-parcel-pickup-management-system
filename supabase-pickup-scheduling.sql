-- Pickup Scheduling quota upgrade
-- Run this in Supabase SQL Editor.
-- It keeps the existing pickup_bookings table and adds only optional metadata.

alter table public.pickup_bookings
  add column if not exists user_id uuid references auth.users(id),
  add column if not exists estimated_minutes integer not null default 1,
  add column if not exists estimated_wait_minutes integer not null default 0;

create index if not exists pickup_bookings_slot_lookup_idx
  on public.pickup_bookings (pickup_date, time_slot, status, created_at);

create index if not exists pickup_bookings_slot_user_lookup_idx
  on public.pickup_bookings (pickup_date, time_slot, user_id, status, created_at);

drop policy if exists "Admin staff can delete pickup bookings" on public.pickup_bookings;

create policy "Admin staff can delete pickup bookings"
on public.pickup_bookings
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
);

create or replace function public.pickup_estimated_minutes(p_tracking_ids text[])
returns integer
language sql
immutable
as $$
  select least(greatest(coalesce(array_length(p_tracking_ids, 1), 1), 1), 4);
$$;

update public.pickup_bookings
set estimated_minutes = public.pickup_estimated_minutes(tracking_ids)
where estimated_minutes is null
   or estimated_minutes <> public.pickup_estimated_minutes(tracking_ids);

create or replace function public.get_available_slots(p_date date)
returns table(time_slot text, remaining integer)
language sql
stable
security definer
set search_path = public
as $$
  with slots(time_slot) as (
    values
      ('11:00 - 12:00'),
      ('12:00 - 13:00'),
      ('13:00 - 14:00'),
      ('14:00 - 15:00'),
      ('15:00 - 16:00'),
      ('16:00 - 17:00'),
      ('17:00 - 18:00'),
      ('18:00 - 19:00')
  ),
  used as (
    select
      pb.time_slot,
      sum(
        least(
          greatest(
            coalesce(pb.estimated_minutes, public.pickup_estimated_minutes(pb.tracking_ids)),
            1
          ),
          4
        )
      )::integer as used_quota
    from public.pickup_bookings pb
    where pb.pickup_date = p_date
      and pb.status in ('booked', 'upcoming', 'checked_in')
    group by pb.time_slot
  )
  select
    slots.time_slot,
    greatest(60 - coalesce(used.used_quota, 0), 0)::integer as remaining
  from slots
  left join used on used.time_slot = slots.time_slot
  order by slots.time_slot;
$$;

create or replace function public.preview_pickup_queue(
  p_date date,
  p_time_slot text
)
returns table(
  queue_number integer,
  estimated_wait_minutes integer,
  available_quota integer
)
language sql
stable
security definer
set search_path = public
as $$
  with unique_queue_customers as (
    select distinct on (coalesce(pb.user_id::text, pb.pickup_code))
      pb.created_at,
      coalesce(pb.user_id::text, pb.pickup_code) as customer_queue_key,
      nullif(regexp_replace(coalesce(pb.queue_number, ''), '\D', '', 'g'), '')::integer as queue_sort
    from public.pickup_bookings pb
    where pb.pickup_date = p_date
      and pb.time_slot = p_time_slot
      and pb.status in ('booked', 'upcoming', 'checked_in')
    order by
      coalesce(pb.user_id::text, pb.pickup_code),
      nullif(regexp_replace(coalesce(pb.queue_number, ''), '\D', '', 'g'), '')::integer nulls last,
      pb.created_at
  ),
  active_queue_customers as (
    select
      row_number() over (
        order by queue_sort nulls last, created_at
      )::integer as queue_position,
      customer_queue_key
    from unique_queue_customers
  ),
  current_customer_queue as (
    select queue_position
    from active_queue_customers
    where customer_queue_key = auth.uid()::text
    limit 1
  ),
  active_booking_quota as (
    select
      least(
        greatest(
          coalesce(pb.estimated_minutes, public.pickup_estimated_minutes(pb.tracking_ids)),
          1
        ),
        4
      ) as estimated_minutes
    from public.pickup_bookings pb
    where pb.pickup_date = p_date
      and pb.time_slot = p_time_slot
      and pb.status in ('booked', 'upcoming', 'checked_in')
  )
  select
    coalesce(
      (select queue_position from current_customer_queue),
      (select count(*) + 1 from active_queue_customers)
    )::integer as queue_number,
    (
      greatest(
        coalesce(
          (select queue_position from current_customer_queue),
          (select count(*) + 1 from active_queue_customers)
        ) - 1,
        0
      ) * 5
    )::integer as estimated_wait_minutes,
    greatest(60 - coalesce((select sum(estimated_minutes) from active_booking_quota), 0), 0)::integer as available_quota;
$$;

create or replace function public.preview_queue_number(
  p_date date,
  p_time_slot text
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select queue_number
  from public.preview_pickup_queue(p_date, p_time_slot);
$$;

create or replace function public.assert_pickup_tracking_ids_available(
  p_tracking_ids text[] default '{}'
)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tracking_id text;
  v_clean_tracking_ids text[];
  v_parcel record;
begin
  v_clean_tracking_ids := array(
    select trim(value)
    from unnest(coalesce(p_tracking_ids, '{}')) as value
    where trim(value) <> ''
  );

  if coalesce(array_length(v_clean_tracking_ids, 1), 0) = 0 then
    return '{}';
  end if;

  if array_length(v_clean_tracking_ids, 1) <> (
    select count(distinct lower(value))
    from unnest(v_clean_tracking_ids) as value
  ) then
    raise exception 'This tracking ID has already been added to this booking.';
  end if;

  foreach v_tracking_id in array v_clean_tracking_ids loop
    select id, tracking_id, status
    into v_parcel
    from public.parcels
    where lower(tracking_id) = lower(v_tracking_id)
    limit 1;

    if not found then
      raise exception 'Tracking ID not found.';
    end if;

    if lower(coalesce(v_parcel.status, '')) not in (
      'ready',
      'ready-for-pickup',
      'ready_to_pickup',
      'arrived'
    ) then
      raise exception 'This parcel is not currently available for pickup.';
    end if;

    if exists (
      select 1
      from public.pickup_bookings pb
      cross join unnest(coalesce(pb.tracking_ids, '{}')) as existing_tracking_id
      where pb.status in ('booked', 'upcoming', 'pending', 'checked_in')
        and lower(existing_tracking_id) = lower(v_tracking_id)
    ) then
      raise exception 'This parcel has already been added to an active pickup booking.';
    end if;
  end loop;

  return v_clean_tracking_ids;
end;
$$;

create or replace function public.validate_manual_tracking_id(
  p_tracking_id text,
  p_current_tracking_ids text[] default '{}'
)
returns table(
  parcel_id text,
  tracking_id text,
  courier text,
  current_status text,
  receiver_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tracking_id text := trim(coalesce(p_tracking_id, ''));
  v_parcel record;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to validate a tracking ID.';
  end if;

  if v_tracking_id = '' then
    raise exception 'Tracking ID not found.';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_current_tracking_ids, '{}')) as current_tracking_id
    where lower(trim(current_tracking_id)) = lower(v_tracking_id)
  ) then
    raise exception 'This tracking ID has already been added to this booking.';
  end if;

  perform public.assert_pickup_tracking_ids_available(array[v_tracking_id]);

  select id, tracking_id, status, receiver
  into v_parcel
  from public.parcels
  where lower(tracking_id) = lower(v_tracking_id)
  limit 1;

  return query
  select
    v_parcel.id::text as parcel_id,
    v_parcel.tracking_id::text as tracking_id,
    null::text as courier,
    v_parcel.status::text as current_status,
    case
      when v_parcel.receiver is null or trim(v_parcel.receiver::text) = '' then null::text
      when char_length(v_parcel.receiver::text) <= 1 then '*'
      else left(v_parcel.receiver::text, 1) || repeat('*', greatest(char_length(v_parcel.receiver::text) - 1, 1))
    end as receiver_name;
end;
$$;

create or replace function public.delete_cancelled_pickup_booking(
  p_pickup_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_deleted_code text;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to delete a cancelled booking.';
  end if;

  delete from public.pickup_bookings
  where pickup_code = p_pickup_code
    and lower(coalesce(customer_email, '')) = v_user_email
    and status = 'cancelled'
  returning pickup_code into v_deleted_code;

  if v_deleted_code is not null then
    return true;
  end if;

  if exists (
    select 1
    from public.pickup_bookings
    where pickup_code = p_pickup_code
      and lower(coalesce(customer_email, '')) = v_user_email
  ) then
    raise exception 'Only cancelled bookings can be deleted from pickup history.';
  end if;

  raise exception 'Cancelled booking not found.';
end;
$$;

drop function if exists public.book_pickup_confirmed(
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text[]
);

create or replace function public.book_pickup_confirmed(
  p_date date,
  p_time_slot text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_pickup_address text,
  p_parcel_details text,
  p_tracking_ids text[] default '{}',
  p_booking_parcels jsonb default '[]'::jsonb
)
returns table(
  pickup_code text,
  queue_number text,
  tracking_ids text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estimated_minutes integer;
  v_preview record;
  v_slot_start time;
  v_slot_end time;
  v_malaysia_now timestamp;
  v_tracking_ids text[];
  v_user_id text := auth.uid()::text;
  v_user_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_booking_parcel jsonb;
  v_parcel_id text;
  v_tracking_id text;
  v_source text;
  v_parcel record;
  v_pickup_code text;
  v_queue_number text;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to book a pickup.';
  end if;

  if lower(coalesce(p_customer_email, '')) <> v_user_email then
    raise exception 'You can only book pickups for your own account.';
  end if;

  if jsonb_typeof(coalesce(p_booking_parcels, '[]'::jsonb)) <> 'array' then
    raise exception 'One or more tracking IDs are invalid.';
  end if;

  if jsonb_array_length(coalesce(p_booking_parcels, '[]'::jsonb)) > 0 then
    v_tracking_ids := '{}';

    for v_booking_parcel in
      select value from jsonb_array_elements(p_booking_parcels) as item(value)
    loop
      v_parcel_id := trim(coalesce(v_booking_parcel ->> 'parcel_id', ''));
      v_tracking_id := trim(coalesce(v_booking_parcel ->> 'tracking_id', ''));
      v_source := lower(trim(coalesce(v_booking_parcel ->> 'source', '')));

      if v_parcel_id = '' or v_tracking_id = '' or v_source not in ('registered', 'manual') then
        raise exception 'One or more tracking IDs are invalid.';
      end if;

      select *
      into v_parcel
      from public.parcels p
      where p.id::text = v_parcel_id
        and lower(p.tracking_id) = lower(v_tracking_id)
      limit 1;

      if not found then
        raise exception 'One or more tracking IDs are invalid.';
      end if;

      if v_source = 'registered' and not (
        coalesce(v_parcel.user_id::text, '') = v_user_id
        or coalesce(v_parcel.customer_id::text, '') = v_user_id
        or coalesce(v_parcel.profile_id::text, '') = v_user_id
        or lower(coalesce(v_parcel.receiver_email::text, '')) = v_user_email
      ) then
        raise exception 'One or more tracking IDs are invalid.';
      end if;

      v_tracking_ids := array_append(v_tracking_ids, v_parcel.tracking_id::text);
    end loop;
  else
    v_tracking_ids := p_tracking_ids;
  end if;

  v_tracking_ids := public.assert_pickup_tracking_ids_available(v_tracking_ids);

  if coalesce(array_length(v_tracking_ids, 1), 0) = 0 then
    raise exception 'Please add at least one tracking ID before confirming the pickup.';
  end if;

  v_estimated_minutes := public.pickup_estimated_minutes(v_tracking_ids);
  v_malaysia_now := now() at time zone 'Asia/Kuala_Lumpur';

  if p_time_slot !~ '^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}$' then
    raise exception 'Invalid pickup time slot.';
  end if;

  v_slot_start := split_part(p_time_slot, ' - ', 1)::time;
  v_slot_end := split_part(p_time_slot, ' - ', 2)::time;

  if p_date < v_malaysia_now::date then
    raise exception 'This pickup date has already passed.';
  end if;

  if extract(isodow from p_date) = 6 then
    raise exception 'PostCentre Batu Pahat is closed on Saturday.';
  end if;

  if v_slot_start < time '11:00'
     or v_slot_end > time '19:00'
     or v_slot_end <= v_slot_start then
    raise exception 'This time slot is outside working hours.';
  end if;

  if p_date = v_malaysia_now::date and v_malaysia_now::time >= v_slot_start then
    raise exception 'This time slot has already started. Please choose another slot.';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_date::text || '|' || p_time_slot));

  select *
  into v_preview
  from public.preview_pickup_queue(p_date, p_time_slot);

  if v_preview.available_quota < v_estimated_minutes then
    raise exception
      'This time slot only has % quota left. Your booking needs %.',
      v_preview.available_quota,
      v_estimated_minutes;
  end if;

  v_pickup_code := 'PU-' || to_char(now() at time zone 'Asia/Kuala_Lumpur', 'YYYYMMDDHH24MISS') ||
    '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_queue_number := 'Q-' || lpad(v_preview.queue_number::text, 3, '0');

  insert into public.pickup_bookings (
    user_id,
    pickup_code,
    pickup_date,
    time_slot,
    queue_number,
    customer_name,
    customer_phone,
    customer_email,
    pickup_address,
    parcel_details,
    tracking_ids,
    status,
    preparation_status,
    estimated_minutes,
    estimated_wait_minutes,
    created_at,
    updated_at
  )
  values (
    auth.uid(),
    v_pickup_code,
    p_date,
    p_time_slot,
    v_queue_number,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_pickup_address,
    p_parcel_details,
    coalesce(v_tracking_ids, '{}'),
    'booked',
    'pending',
    v_estimated_minutes,
    v_preview.estimated_wait_minutes,
    now(),
    now()
  );

  return query select v_pickup_code, v_queue_number, v_tracking_ids;
end;
$$;
grant execute on function public.get_available_slots(date) to authenticated;
grant execute on function public.preview_pickup_queue(date, text) to authenticated;
grant execute on function public.preview_queue_number(date, text) to authenticated;
grant execute on function public.validate_manual_tracking_id(text, text[]) to authenticated;
grant execute on function public.delete_cancelled_pickup_booking(text) to authenticated;
grant execute on function public.book_pickup_confirmed(
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  jsonb
) to authenticated;


