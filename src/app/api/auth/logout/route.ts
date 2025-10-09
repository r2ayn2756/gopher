import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.signOut()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Logout failed' }, { status: 500 })
  }
}


