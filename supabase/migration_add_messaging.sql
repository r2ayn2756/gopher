-- Add messaging/announcements feature
-- Teachers can send announcements to their class, students can respond

-- Announcements table: teachers send messages to entire class
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_code text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_teacher_id ON public.announcements(teacher_id);
CREATE INDEX IF NOT EXISTS idx_announcements_class_code ON public.announcements(class_code);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Announcement responses: students respond to announcements or direct message teachers
CREATE TABLE IF NOT EXISTS public.announcement_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES public.announcements(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_response CHECK (
    (announcement_id IS NOT NULL AND recipient_id IS NULL) OR
    (announcement_id IS NULL AND recipient_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_responses_announcement_id ON public.announcement_responses(announcement_id);
CREATE INDEX IF NOT EXISTS idx_responses_sender_id ON public.announcement_responses(sender_id);
CREATE INDEX IF NOT EXISTS idx_responses_recipient_id ON public.announcement_responses(recipient_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON public.announcement_responses(created_at DESC);

-- RLS Policies for announcements

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_responses ENABLE ROW LEVEL SECURITY;

-- Teachers can create announcements for their own class_code
CREATE POLICY "Teachers can create announcements" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.class_code = announcements.class_code
    )
  );

-- Teachers can read their own announcements
CREATE POLICY "Teachers can read own announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

-- Students can read announcements for their class
CREATE POLICY "Students can read class announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.class_code = announcements.class_code
    )
  );

-- Teachers can update their own announcements
CREATE POLICY "Teachers can update own announcements" ON public.announcements
  FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Teachers can delete their own announcements
CREATE POLICY "Teachers can delete own announcements" ON public.announcements
  FOR DELETE TO authenticated
  USING (teacher_id = auth.uid());

-- RLS Policies for responses

-- Students can create responses to announcements in their class
CREATE POLICY "Students can respond to announcements" ON public.announcement_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    announcement_id IS NOT NULL AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.announcements a
      INNER JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = announcement_responses.announcement_id
      AND p.class_code = a.class_code
    )
  );

-- Users can send direct messages to teachers
CREATE POLICY "Users can send direct messages" ON public.announcement_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    recipient_id IS NOT NULL AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = announcement_responses.recipient_id
      AND profiles.role = 'admin'
    )
  );

-- Users can read responses they sent
CREATE POLICY "Users can read own responses" ON public.announcement_responses
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid());

-- Teachers can read responses to their announcements
CREATE POLICY "Teachers can read announcement responses" ON public.announcement_responses
  FOR SELECT TO authenticated
  USING (
    announcement_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.announcements
      WHERE announcements.id = announcement_responses.announcement_id
      AND announcements.teacher_id = auth.uid()
    )
  );

-- Teachers can read direct messages sent to them
CREATE POLICY "Teachers can read direct messages" ON public.announcement_responses
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());
