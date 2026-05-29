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

create policy "Admin staff can manage notifications"
on public.notifications
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
  )
);

-- Optional admin/staff notification hardening.
-- This keeps operational notifications separate from customer-private notifications
-- and lets customer-triggered events create admin notifications without exposing
-- a service role key in the frontend.

alter table public.notifications
  add column if not exists audience text,
  add column if not exists role_target text,
  add column if not exists related_booking_id text,
  add column if not exists related_tracking_id text,
  add column if not exists related_queue_number text;

create index if not exists notifications_admin_lookup_idx
  on public.notifications (audience, role_target, created_at desc);

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

  insert into public.notifications (
    user_id,
    audience,
    role_target,
    title,
    message,
    type,
    related_id,
    related_booking_id,
    related_tracking_id,
    related_queue_number,
    is_read
  )
  values (
    null,
    'admin',
    'staff',
    p_title,
    p_message,
    p_type,
    p_related_id,
    p_related_booking_id,
    p_related_tracking_id,
    p_related_queue_number,
    false
  )
  returning * into v_notification;

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
    v_type := 'pickup_booking_created';
  elsif coalesce(old.status, '') <> coalesce(new.status, '') then
    v_title := case
      when new.status = 'cancelled' then 'Pickup Booking Cancelled'
      when new.status in ('collected', 'completed') then 'Pickup Collected'
      else 'Pickup Queue Updated'
    end;
    v_type := case
      when new.status = 'cancelled' then 'pickup_booking_cancelled'
      else 'pickup_queue_updated'
    end;
  elsif coalesce(old.preparation_status, '') <> coalesce(new.preparation_status, '') then
    v_title := 'Pickup Queue Updated';
    v_type := 'pickup_queue_updated';
  elsif coalesce(old.tracking_ids, '{}') <> coalesce(new.tracking_ids, '{}') then
    v_title := 'Pickup Booking Updated';
    v_type := 'pickup_booking_updated';
  else
    return new;
  end if;

  perform public.create_admin_notification(
    v_title,
    concat(
      coalesce(new.customer_name, 'Customer'),
      ' - queue ',
      coalesce(new.queue_number, '-'),
      case when v_tracking_ids <> '' then concat(' for ', v_tracking_ids) else '' end,
      '. Status: ',
      coalesce(new.status, 'unknown'),
      '.'
    ),
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
    v_type := 'parcel_status';
  else
    return new;
  end if;

  perform public.create_admin_notification(
    v_title,
    concat(
      'Parcel ',
      coalesce(new.tracking_id, new.id::text),
      ' is ',
      coalesce(new.status, 'registered'),
      case when new.receiver is not null then concat(' for ', new.receiver) else '' end,
      '.'
    ),
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
