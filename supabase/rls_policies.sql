-- Gopher RLS Policies (Step 2.3)
-- Ensure RLS is enabled on all tables

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.analytics enable row level security;

-- Helper: current user id from auth.jwt()
create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select coalesce((auth.uid())::uuid, null)
$$;

-- Helper: admin check without triggering RLS recursion
create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = p_uid and role = 'admin'
  );
$$;

-- Students can read their own profile
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
using (id = public.current_user_id());

-- Students can update their own profile (except role)
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
using (id = public.current_user_id())
with check (
  id = public.current_user_id() and coalesce(role, 'student') = role
);

-- Admins can read all profiles
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
on public.profiles for select
using (public.is_admin(public.current_user_id()));

-- Only authentication system can insert profiles
revoke insert on public.profiles from anon, authenticated;
-- Inserts are typically handled by backend with service key

-- CONVERSATIONS
-- Students can read/write their own conversations
drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own
on public.conversations for select
using (user_id = public.current_user_id());

drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own
on public.conversations for insert
with check (user_id = public.current_user_id());

drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own
on public.conversations for update
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

-- Admins can read all conversations
drop policy if exists conversations_select_admin on public.conversations;
create policy conversations_select_admin
on public.conversations for select
using (public.is_admin(public.current_user_id()));

-- Students cannot modify ended conversations
drop policy if exists conversations_no_update_when_ended on public.conversations;
create policy conversations_no_update_when_ended
on public.conversations for update
using (user_id = public.current_user_id() and status <> 'ended')
with check (status <> 'ended');

-- MESSAGES
-- Users can read messages from their conversations
drop policy if exists messages_select_own on public.messages;
create policy messages_select_own
on public.messages for select
using (exists (
  select 1 from public.conversations c
  where c.id = messages.conversation_id
  and (c.user_id = public.current_user_id() or public.is_admin(public.current_user_id()))
));

-- Only backend can insert messages (service key)
revoke insert, update, delete on public.messages from anon, authenticated;

-- ANALYTICS
-- Only backend can write
revoke insert, update, delete on public.analytics from anon, authenticated;

-- Admins can read all
drop policy if exists analytics_select_admin on public.analytics;
create policy analytics_select_admin
on public.analytics for select
using (public.is_admin(public.current_user_id()));

-- Students cannot access
revoke select on public.analytics from authenticated;
