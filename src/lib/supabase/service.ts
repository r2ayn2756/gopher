import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createSupabaseService() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}


