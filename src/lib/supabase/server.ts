import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import { ensureEnvLoaded } from '@/lib/utils/env'

export function createSupabaseServer() {
  ensureEnvLoaded()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const cookieMethods = {
    // Single cookie helpers
    get(name: string) {
      try { return (cookies() as any).get(name)?.value } catch { return undefined }
    },
    set(name: string, value: string, options?: any) {
      try { (cookies() as any).set(name, value, options) } catch {}
    },
    remove(name: string, options?: any) {
      try { (cookies() as any).set(name, '', { ...(options || {}), maxAge: 0 }) } catch {}
    },
    // Back-compat helpers some @supabase/ssr versions expect
    getAll() {
      try { return ((cookies() as any).getAll?.() || []).map((c: any) => ({ name: c.name, value: c.value })) } catch { return [] }
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      try { for (const c of cookiesToSet) (cookies() as any).set(c.name, c.value, c.options) } catch {}
    },
  }

  return createServerClient<Database>(supabaseUrl, supabaseKey, { cookies: cookieMethods as any })
}

export async function getServerSession() {
  const supabase = createSupabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getServerUser() {
  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}


