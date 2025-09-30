import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseService } from '@/lib/supabase/service'

const BodySchema = z.object({
  subject: z.string().max(100).optional(),
  problemStatement: z.string().min(1).max(1000),
})

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServer()
    const admin = createSupabaseService()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr) console.error('auth.getUser error', userErr)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure the user has a profile row to satisfy FK on conversations.user_id
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found. Please complete registration before starting a chat.' }, { status: 409 })
    }

    const json = await req.json().catch((e) => { console.error('json parse error', e); return null })
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 })

    const { subject, problemStatement } = parsed.data
    const { data, error } = await admin
      .from('conversations')
      .insert({ user_id: user.id, subject, problem_statement: problemStatement } as any)
      .select('id')
      .single()
    if (error) {
      console.error('insert conversation error', error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }
    return NextResponse.json({ id: (data as any).id })
  } catch (e: any) {
    console.error('create conversation unhandled', e)
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    return NextResponse.json({
      ok: false,
      hint: 'POST to this route to create; this GET is for diagnostics only.',
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnon: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').length > 10,
      hasService: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').length > 10,
      userId: user?.id ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}


