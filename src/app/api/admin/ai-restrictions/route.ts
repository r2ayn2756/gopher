import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseService } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const SettingsSchema = z.object({
  explainDefinitions: z.boolean(),
  modelPhysicsEngineering: z.boolean(),
  showWorkings: z.boolean(),
  avoidDirectAnswers: z.boolean(),
})

export async function GET() {
  const supabase = createSupabaseServer()
  let service: ReturnType<typeof createSupabaseService> | null = null
  try { service = createSupabaseService() } catch {}
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: prof, error: profErr } = await (service || supabase)
    .from('profiles').select('role, class_code').eq('id', user.id as any).single()
  if (profErr) return NextResponse.json({ error: 'Cannot verify role' }, { status: 500 })
  if (!prof || (prof as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const classCode = (prof as any)?.class_code
  if (!classCode) return NextResponse.json({ settings: null })

  const { data } = await (service || supabase)
    .from('teacher_settings').select('settings').eq('class_code', classCode).single()
  return NextResponse.json({ settings: (data as any)?.settings ?? null })
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer()
  let service: ReturnType<typeof createSupabaseService> | null = null
  try { service = createSupabaseService() } catch {}
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = SettingsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 })

  const { data: prof, error: profErr } = await (service || supabase)
    .from('profiles').select('role, class_code').eq('id', user.id as any).single()
  if (profErr) return NextResponse.json({ error: 'Cannot verify role' }, { status: 500 })
  if (!prof || (prof as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const classCode = (prof as any)?.class_code
  if (!classCode) return NextResponse.json({ error: 'No class code on admin profile' }, { status: 400 })

  const upsert = await (service || supabase)
    .from('teacher_settings')
    .upsert({ class_code: classCode, admin_id: user.id, settings: parsed.data as any } as any)
    .select('class_code')
    .single()
  if (upsert.error) return NextResponse.json({ error: upsert.error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}


