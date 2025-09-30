-- Gopher DB Functions and Triggers (Step 2.4)

-- 1) Automatically update updated_at timestamps (generic handled in schema via set_updated_at())
--    Here we ensure messages also get a created_at default and disallow updates (enforced by lack of update policy).

-- 2) Calculate conversation duration on end
create or replace function public.set_conversation_ended_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'ended' and new.ended_at is null then
    new.ended_at = now();
  end if;
  return new;
end
$$;

drop trigger if exists trg_conversations_end_set on public.conversations;
create trigger trg_conversations_end_set
before update on public.conversations
for each row execute function public.set_conversation_ended_at();

-- Optional view to expose duration in seconds
create or replace view public.conversation_stats as
select
  id,
  user_id,
  started_at,
  ended_at,
  extract(epoch from coalesce(ended_at, now()) - started_at)::int as duration_seconds
from public.conversations;

-- 3) Increment hint level counter
-- Store last hint level per conversation in metadata
create or replace function public.bump_hint_level(p_conversation_id uuid)
returns int language plpgsql as $$
declare
  prev int;
  next_hint int;
begin
  select coalesce((metadata->>'hint_level')::int, 0) into prev
  from public.conversations where id = p_conversation_id;

  next_hint := least(coalesce(prev,0) + 1, 5);

  update public.conversations
  set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{hint_level}', to_jsonb(next_hint), true),
      updated_at = now()
  where id = p_conversation_id;

  return next_hint;
end
$$;

-- 4) Generate conversation titles from first message
create or replace function public.set_conversation_title_from_first_message()
returns trigger language plpgsql as $$
begin
  -- Only set if title is null/empty and this is the first user message
  if new.role = 'user' then
    update public.conversations c
    set title = coalesce(c.title, left(new.content, 60))
    where c.id = new.conversation_id and (c.title is null or length(c.title) = 0);
  end if;
  return new;
end
$$;

drop trigger if exists trg_messages_title_seed on public.messages;
create trigger trg_messages_title_seed
after insert on public.messages
for each row execute function public.set_conversation_title_from_first_message();

-- 5) Track user session analytics (basic example)
-- Logs a simple event when a conversation is created or ended
create or replace function public.log_conversation_event()
returns trigger
language plpgsql
security definer
set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.analytics(user_id, event_type, event_data)
    values (new.user_id, 'conversation_started', jsonb_build_object('conversation_id', new.id));
  elsif tg_op = 'UPDATE' and new.status = 'ended' and old.status <> 'ended' then
    insert into public.analytics(user_id, event_type, event_data)
    values (new.user_id, 'conversation_ended', jsonb_build_object('conversation_id', new.id, 'duration_seconds', extract(epoch from (new.ended_at - new.started_at))::int));
  end if;
  return new;
end
$$;

drop trigger if exists trg_conversations_log_event on public.conversations;
create trigger trg_conversations_log_event
after insert or update on public.conversations
for each row execute function public.log_conversation_event();
