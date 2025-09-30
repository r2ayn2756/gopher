-- Gopher DB Schema (Step 2.2)
-- Requirements: UUID PKs, proper FKs with cascades, indexes, updated_at triggers, check constraints

-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

do $$ begin
  create type app_role as enum ('student', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type conversation_status as enum ('active', 'ended', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role as enum ('user', 'assistant', 'system');
exception when duplicate_object then null; end $$;

-- Trigger: updated_at maintenance
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles: extends auth.users via 1:1
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username ~ '^[A-Za-z0-9_]+$'),
  full_name text,
  role app_role not null default 'student',
  school_id text,
  grade_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function set_updated_at();

-- conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  subject text,
  problem_statement text,
  status conversation_status not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status <> 'ended') or (ended_at is not null))
);

drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function set_updated_at();

create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_status on public.conversations(status);
create index if not exists idx_conversations_started_at on public.conversations(started_at);

-- messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role message_role not null,
  content text not null,
  hint_level int,
  created_at timestamptz not null default now(),
  check (hint_level is null or hint_level between 1 and 5)
);

create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- analytics
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_user_id on public.analytics(user_id);
create index if not exists idx_analytics_event_type on public.analytics(event_type);
create index if not exists idx_analytics_created_at on public.analytics(created_at);
