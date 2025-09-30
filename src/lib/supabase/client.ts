import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createSupabaseBrowser() {
  // Prefer statically injected env; fall back to a runtime-injected window var
  const win: any = typeof window !== 'undefined' ? window : {}
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || win.__PUBLIC_ENV?.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || win.__PUBLIC_ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}


