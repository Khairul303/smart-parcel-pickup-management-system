-- Pickup Scheduling quota upgrade
-- Run this in Supabase SQL Editor.
-- It keeps the existing pickup_bookings table and adds only optional metadata.

alter table public.pickup_bookings
  add column if not exists estimated_minutes integer not null default 1,
  add column if not exists estimated_wait_minutes integer not null default 0;

create index if not exists pickup_bookings_slot_lookup_idx
  on public.pickup_bookings (pickup_date, time_slot, status, created_at);

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
      ('09:00 - 10:00'),
      ('10:00 - 11:00'),
      ('11:00 - 12:00'),
      ('12:00 - 13:00'),
      ('13:00 - 14:00'),
      ('14:00 - 15:00'),
      ('15:00 - 16:00'),
      ('16:00 - 17:00')
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
    greatest(5 - coalesce(used.used_quota, 0), 0)::integer as remaining
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
  with active_bookings as (
    select
      pb.created_at,
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
    (count(*) + 1)::integer as queue_number,
    coalesce(sum(estimated_minutes), 0)::integer as estimated_wait_minutes,
    greatest(5 - coalesce(sum(estimated_minutes), 0), 0)::integer as available_quota
  from active_bookings;
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

create or replace function public.book_pickup_confirmed(
  p_date date,
  p_time_slot text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_pickup_address text,
  p_parcel_details text,
  p_tracking_ids text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estimated_minutes integer;
  v_preview record;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to book a pickup.';
  end if;

  if lower(coalesce(p_customer_email, '')) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'You can only book pickups for your own account.';
  end if;

  v_estimated_minutes := public.pickup_estimated_minutes(p_tracking_ids);

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

  insert into public.pickup_bookings (
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
    'PU-' || to_char(now() at time zone 'Asia/Kuala_Lumpur', 'YYYYMMDDHH24MISS') ||
      '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    p_date,
    p_time_slot,
    'Q-' || lpad(v_preview.queue_number::text, 3, '0'),
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_pickup_address,
    p_parcel_details,
    coalesce(p_tracking_ids, '{}'),
    'booked',
    'pending',
    v_estimated_minutes,
    v_preview.estimated_wait_minutes,
    now(),
    now()
  );
  return;
end;
$$;

grant execute on function public.get_available_slots(date) to authenticated;
grant execute on function public.preview_pickup_queue(date, text) to authenticated;
grant execute on function public.preview_queue_number(date, text) to authenticated;
grant execute on function public.book_pickup_confirmed(
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text[]
) to authenticated;
