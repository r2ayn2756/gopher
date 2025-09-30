import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'
import type { TablesUpdate } from '@/types/supabase'

const PatchSchema = z.object({
  status: z.enum(['active','ended','deleted']).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServer()
  const db: any = supabase
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await db
    .from('conversations')
    .select('id, user_id, title, subject, problem_statement, status, started_at, ended_at, metadata, profiles:profiles!conversations_user_id_fkey(class_code), messages(id, role, content, hint_level, created_at)')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if ((data as any).user_id !== user.id) {
    const { data: prof } = await db
      .from('profiles')
      .select('role, class_code')
      .eq('id', user.id as any)
      .single()
    const isAdmin = (prof as any)?.role === 'admin'
    if (!isAdmin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const adminClass = (prof as any)?.class_code
    const studentClass = (data as any)?.profiles?.class_code
    if (!adminClass || !studentClass || adminClass !== studentClass) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServer()
  const db: any = supabase
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { status } = parsed.data
  const { data: conv, error: convErr } = await db.from('conversations').select('user_id').eq('id', id).single()
  if (convErr || !conv || (conv as any).user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (typeof status === 'undefined') {
    return NextResponse.json({ ok: true })
  }
  const updates: TablesUpdate<'conversations'> = { status: status as any }
  const { error } = await db.from('conversations').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServer()
  const db: any = supabase
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: conv, error: convErr } = await db.from('conversations').select('user_id').eq('id', id).single()
  if (convErr || !conv || (conv as any).user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { error } = await db.from('conversations').update({ status: 'deleted' }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}


