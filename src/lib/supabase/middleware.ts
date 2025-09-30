import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createSupabaseMiddlewareClient(_req: Request, resHeaders: Headers) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // Minimal cookie adapter for Next.js middleware
  const cookies = new Map<string, string>()

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)
      },
      set(name: string, value: string, _options: CookieOptions) {
        cookies.set(name, value)
        resHeaders.append('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
      },
      remove(name: string, _options: CookieOptions) {
        cookies.delete(name)
        resHeaders.append('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
      },
    },
  })
}
