Gopher Supabase Schema

Apply schema.sql in the Supabase SQL Editor:

1. Open your project  SQL Editor.
2. Paste the contents of schema.sql and run.
3. Verify tables (profiles, conversations, messages, nalytics) appear.
4. Confirm extensions enabled: pgcrypto.
5. Ensure profiles.id references uth.users(id) and conversations.user_id references profiles(id).

Notes
- UUIDs are generated via gen_random_uuid().
- updated_at is maintained by trigger on profiles and conversations.
- Indices added for common query paths.
- RLS policies are not included here; add them in Step 2.3.
Update: Apply RLS policies after creating schema.

Apply ls_policies.sql in SQL Editor after schema.sql:
1) Run schema.sql first
2) Confirm tables created
3) Run ls_policies.sql
4) Test with a normal user vs admin

Testing tips
- Profiles: non-admin should only select/update their own
- Conversations: owner can read/write; ended conversations cannot be modified by student
- Messages: only readable via owned conversations; inserts via backend (service key)
- Analytics: only admin can select; only backend can write
Update: Apply functions after schema and policies.

Apply unctions.sql in SQL Editor after schema.sql and ls_policies.sql:
1) Run schema.sql
2) Run ls_policies.sql
3) Run unctions.sql

Validation:
- Update a conversation to status 'ended'  ended_at auto-filled and analytics event added
- Insert first user message  conversation title seeds from message intro
- Call select public.bump_hint_level('<conversation-uuid>');  metadata.hint_level increments up to 5
- View public.conversation_stats shows duration_seconds
