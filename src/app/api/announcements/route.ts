import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const CreateAnnouncementSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  content: z.string().min(1, 'Content is required').max(5000),
})

// GET /api/announcements - List announcements for user's class
export async function GET(_req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile to check class_code and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('class_code, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch announcements for user's class with teacher info
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select(`
        *,
        teacher:profiles!announcements_teacher_id_fkey(username, full_name)
      `)
      .eq('class_code', profile.class_code)
      .order('created_at', { ascending: false })

    if (announcementsError) {
      return NextResponse.json({ error: announcementsError.message }, { status: 500 })
    }

    return NextResponse.json({ announcements: announcements || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}

// POST /api/announcements - Create announcement (teachers only)
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = CreateAnnouncementSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile to verify they're an admin/teacher
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('class_code, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only teachers can create announcements' }, { status: 403 })
    }

    if (!profile.class_code) {
      return NextResponse.json({ error: 'Teacher must have a class code' }, { status: 400 })
    }

    const { subject, content } = parsed.data

    // Create announcement
    const { data: announcement, error: createError } = await supabase
      .from('announcements')
      .insert({
        teacher_id: user.id,
        class_code: profile.class_code,
        subject,
        content,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
