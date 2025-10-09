import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options })
      },
    },
  })

  // Refresh session if needed
  await supabase.auth.getSession()

  const { data: { user } } = await supabase.auth.getUser()
  const url = new URL(req.url)
  const pathname = url.pathname

  const isProtected = pathname.startsWith('/chat') || pathname.startsWith('/admin') || pathname.startsWith('/home') || pathname.startsWith('/notes') || pathname.startsWith('/assignment-proofer') || pathname.startsWith('/rubric-builder') || pathname.startsWith('/class-planner')
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/assignment-proofer') || pathname.startsWith('/rubric-builder') || pathname.startsWith('/class-planner')

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (!isProtected) return res

  if (!user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute) {
    // Validate admin role via profiles table
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (prof && (prof as any).role !== 'admin') {
      return NextResponse.redirect(new URL('/home', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/admin/:path*',
    '/home/:path*',
    '/notes/:path*',
    '/assignment-proofer/:path*',
    '/rubric-builder/:path*',
    '/class-planner/:path*',
  ],
}
