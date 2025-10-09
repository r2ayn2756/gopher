"use client"

import * as React from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { LogoutButton } from '@/components/auth/logout-button'
import { usePathname } from 'next/navigation'

export function AppNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    const supabase = createSupabaseBrowser()
    ;(async () => {
      try {
        const cached = window.sessionStorage.getItem('gopher:isAdmin')
        if (cached === 'true') setIsAdmin(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) return
        if (!mounted) return

        const admin = (data as any)?.role === 'admin'
        setIsAdmin(admin)
        try {
          window.sessionStorage.setItem('gopher:isAdmin', admin ? 'true' : 'false')
        } catch {}
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/home" className="flex items-center">
          <img src="/gopher-logo.png" alt="Gopher" className="h-12 w-auto md:h-14" />
        </a>

        <nav className="flex items-center gap-8">
          <a
            href="/home"
            className={`text-sm font-medium transition ${isActive('/home') ? 'text-[#32ff00]' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Home
          </a>
          <a
            href="/chat"
            className={`text-sm font-medium transition ${isActive('/chat') ? 'text-[#32ff00]' : 'text-gray-700 hover:text-gray-900'}`}
          >
            AI Chat
          </a>

          {!loading && isAdmin && (
            <>
              <a
                href="/rubric-builder"
                className={`text-sm font-medium transition ${isActive('/rubric-builder') ? 'text-[#32ff00]' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Rubric Builder
              </a>
              <a
                href="/class-planner"
                className={`text-sm font-medium transition ${isActive('/class-planner') ? 'text-[#32ff00]' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Class Planner
              </a>
              <a
                href="/admin"
                className={`text-sm font-medium transition ${isActive('/admin') ? 'text-[#32ff00]' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Admin
              </a>
            </>
          )}

          <LogoutButton />
        </nav>
      </div>
    </div>
  )
}
