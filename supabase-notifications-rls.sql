-- Notifications privacy hardening
-- Review and run in the Supabase SQL Editor.
-- These policies keep customer notification access scoped to auth.uid()
-- while preserving admin/staff operational access when profiles.role exists.

alter table public.notifications enable row level security;

drop policy if exists "Customers can select own notifications" on public.notifications;
drop policy if exists "Customers can update own notifications" on public.notifications;
drop policy if exists "Customers can delete own notifications" on public.notifications;
drop policy if exists "Customers can insert own notifications" on public.notifications;
drop policy if exists "Admin staff can manage notifications" on public.notifications;
drop policy if exists "Admin staff can select staff notifications" on public.notifications;
drop policy if exists "Admin staff can update own staff notifications" on public.notifications;
drop policy if exists "Admin staff can delete own staff notifications" on public.notifications;
drop policy if exists "Admin staff can insert staff notifications" on public.notifications;

-- Optional admin/staff notification hardening.
-- This keeps operational notifications separate from customer-private notifications
-- and lets customer-triggered events create admin notifications without exposing
-- a service role key in the frontend.

alter table public.notifications
  add column if not exists audience text,
  add column if not exists role_target text,
  add column if not exists category text,
  add column if not exists related_booking_id text,
  add column if not exists related_parcel_id text,
  add column if not exists related_queue_id text,
  add column if not exists related_tracking_id text,
  add column if not exists related_queue_number text;

create index if not exists notifications_admin_lookup_idx
  on public.notifications (audience, role_target, user_id, created_at desc);

create policy "Customers can select own notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "Customers can update own notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Customers can delete own notifications"
on public.notifications
for delete
to authenticated
using (user_id = auth.uid());

create policy "Customers can insert own notifications"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Admin staff can select staff notifications"
on public.notifications
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
  and (
    user_id = auth.uid()
    or (
      user_id is null
      and audience in ('admin', 'staff')
      and role_target in ('admin', 'staff')
    )
  )
);

create policy "Admin staff can update own staff notifications"
on public.notifications
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
);

create policy "Admin staff can delete own staff notifications"
on public.notifications
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
);

create policy "Admin staff can insert staff notifications"
on public.notifications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
  and audience in ('admin', 'staff')
  and role_target in ('admin', 'staff')
);

create or replace function public.create_admin_notification(
  p_title text,
  p_message text,
  p_type text,
  p_related_id text default null,
  p_related_booking_id text default null,
  p_related_tracking_id text default null,
  p_related_queue_number text default null
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification public.notifications;
  v_staff record;
begin
  select *
  into v_notification
  from public.notifications
  where audience = 'admin'
    and role_target = 'staff'
    and type = p_type
    and coalesce(related_id, '') = coalesce(p_related_id, '')
    and coalesce(related_booking_id, '') = coalesce(p_related_booking_id, '')
    and coalesce(related_tracking_id, '') = coalesce(p_related_tracking_id, '')
    and created_at > now() - interval '30 seconds'
  order by created_at desc
  limit 1;

  if found then
    return v_notification;
  end if;

  for v_staff in
    select id
    from public.profiles
    where role in ('admin', 'staff')
  loop
    insert into public.notifications (
      user_id,
      audience,
      role_target,
      category,
      title,
      message,
      type,
      related_id,
      related_booking_id,
      related_parcel_id,
      related_queue_id,
      related_tracking_id,
      related_queue_number,
      is_read
    )
    values (
      v_staff.id,
      'admin',
      'staff',
      'operations',
      p_title,
      p_message,
      p_type,
      p_related_id,
      p_related_booking_id,
      p_related_tracking_id,
      p_related_queue_number,
      p_related_tracking_id,
      p_related_queue_number,
      false
    )
    returning * into v_notification;
  end loop;

  return v_notification;
end;
$$;

grant execute on function public.create_admin_notification(
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

create or replace function public.notify_admin_pickup_booking_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tracking_ids text;
  v_title text;
  v_type text;
begin
  v_tracking_ids := array_to_string(coalesce(new.tracking_ids, '{}'), ', ');

  if tg_op = 'INSERT' then
    v_title := 'New Pickup Booking';
    v_type := 'new_booking';
  elsif coalesce(old.status, '') <> coalesce(new.status, '') then
    v_title := case
      when new.status = 'cancelled' then 'Pickup Booking Cancelled'
      when new.status in ('collected', 'completed') then 'Parcel Collected'
      else 'Queue Updated'
    end;
    v_type := case
      when new.status = 'cancelled' then 'booking_cancelled'
      when new.status in ('collected', 'completed') then 'parcel_collected'
      else 'queue_updated'
    end;
  elsif coalesce(old.preparation_status, '') <> coalesce(new.preparation_status, '') then
    v_title := 'Queue Updated';
    v_type := 'queue_updated';
  elsif coalesce(old.tracking_ids, '{}') <> coalesce(new.tracking_ids, '{}') then
    v_title := 'Pickup Booking Updated';
    v_type := 'pickup_booking_updated';
  else
    return new;
  end if;

  perform public.create_admin_notification(
    v_title,
    case
      when tg_op = 'INSERT' then concat(
        'A new pickup booking has been created by ',
        coalesce(new.customer_name, 'Customer'),
        ' for ',
        coalesce(new.pickup_date::text, 'an unscheduled date'),
        ' at ',
        coalesce(new.time_slot, 'an unscheduled time'),
        '.'
      )
      when coalesce(new.status, '') = 'cancelled' then concat(
        'Pickup booking ',
        coalesce(new.pickup_code, '-'),
        ' for ',
        coalesce(new.customer_name, 'Customer'),
        ' has been cancelled.'
      )
      when coalesce(new.status, '') in ('collected', 'completed') then concat(
        'Parcel ',
        case when v_tracking_ids <> '' then v_tracking_ids else coalesce(new.pickup_code, '-') end,
        ' has been collected successfully by ',
        coalesce(new.customer_name, 'Customer'),
        '.'
      )
      else concat(
        'Queue ',
        coalesce(new.queue_number, '-'),
        ' has been updated to ',
        coalesce(new.status, coalesce(new.preparation_status, 'updated')),
        '.'
      )
    end,
    v_type,
    new.pickup_code,
    new.pickup_code,
    nullif(v_tracking_ids, ''),
    new.queue_number
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_admin_pickup_booking_change on public.pickup_bookings;
create trigger trg_notify_admin_pickup_booking_change
after insert or update on public.pickup_bookings
for each row
execute function public.notify_admin_pickup_booking_change();

create or replace function public.notify_admin_parcel_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_type text;
begin
  if tg_op = 'INSERT' then
    v_title := 'Parcel Registered';
    v_type := 'parcel_registered';
  elsif coalesce(old.status, '') <> coalesce(new.status, '') then
    v_title := case
      when new.status in ('ready', 'ready-for-pickup') then 'Parcel Ready to Pickup'
      when new.status in ('collected', 'completed', 'delivered') then 'Parcel Collected'
      else 'Parcel Status Updated'
    end;
    v_type := case
      when new.status in ('collected', 'completed', 'delivered') then 'parcel_collected'
      else 'parcel_status_updated'
    end;
  else
    return new;
  end if;

  perform public.create_admin_notification(
    v_title,
    case
      when tg_op = 'INSERT' then concat(
        'Parcel ',
        coalesce(new.tracking_id, new.id::text),
        ' has been registered in the system.'
      )
      when coalesce(new.status, '') in ('collected', 'completed', 'delivered') then concat(
        'Parcel ',
        coalesce(new.tracking_id, new.id::text),
        ' has been collected successfully',
        case when new.receiver is not null then concat(' by ', new.receiver) else '' end,
        '.'
      )
      else concat(
        'Parcel ',
        coalesce(new.tracking_id, new.id::text),
        ' status changed from ',
        coalesce(old.status, 'unknown'),
        ' to ',
        coalesce(new.status, 'unknown'),
        '.'
      )
    end,
    v_type,
    coalesce(new.tracking_id, new.id::text),
    null,
    coalesce(new.tracking_id, new.id::text),
    null
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_admin_parcel_change on public.parcels;
create trigger trg_notify_admin_parcel_change
after insert or update on public.parcels
for each row
execute function public.notify_admin_parcel_change();
