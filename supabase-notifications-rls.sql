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
