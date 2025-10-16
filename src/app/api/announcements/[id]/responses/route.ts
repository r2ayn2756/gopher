import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const CreateResponseSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
})

// GET /api/announcements/[id]/responses - Get responses to an announcement
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const announcementId = params.id

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

    // Verify announcement exists and user has access
    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single()

    if (announcementError) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('class_code, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check access: user must be in same class or be the teacher
    const hasAccess =
      profile.class_code === announcement.class_code ||
      announcement.teacher_id === user.id

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch responses with sender info
    const { data: responses, error: responsesError } = await supabase
      .from('announcement_responses')
      .select(`
        *,
        sender:profiles!announcement_responses_sender_id_fkey(username, full_name)
      `)
      .eq('announcement_id', announcementId)
      .order('created_at', { ascending: true })

    if (responsesError) {
      return NextResponse.json({ error: responsesError.message }, { status: 500 })
    }

    return NextResponse.json({ responses: responses || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}

// POST /api/announcements/[id]/responses - Create a response to an announcement
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const announcementId = params.id
    const json = await req.json()
    const parsed = CreateResponseSchema.safeParse(json)

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

    // Verify announcement exists
    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .select('class_code')
      .eq('id', announcementId)
      .single()

    if (announcementError) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('class_code')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user is in the same class
    if (profile.class_code !== announcement.class_code) {
      return NextResponse.json({ error: 'You can only respond to announcements in your class' }, { status: 403 })
    }

    const { content } = parsed.data

    // Create response
    const { data: response, error: createError } = await supabase
      .from('announcement_responses')
      .insert({
        announcement_id: announcementId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ response }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal server error' }, { status: 500 })
  }
}
