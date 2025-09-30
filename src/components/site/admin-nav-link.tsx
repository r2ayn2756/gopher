"use client"
import * as React from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export function AdminNavLink() {
  const [mounted, setMounted] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)

  React.useEffect(() => {
    let mounted = true
    setMounted(true)
    const supabase = createSupabaseBrowser()
    ;(async () => {
      try {
        try {
          const cached = window.sessionStorage.getItem('gopher:isAdmin')
          if (cached === 'true') setIsAdmin(true)
        } catch {}
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
        try { window.sessionStorage.setItem('gopher:isAdmin', admin ? 'true' : 'false') } catch {}
      } catch {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!mounted || !isAdmin) return null

  return (
    <>
      <li><a href="/assignment-proofer" className="text-lime-600 hover:text-lime-700 font-semibold">Assignment AI Proofer</a></li>
      <li><a href="/admin" className="text-lime-600 hover:text-lime-700 font-semibold">Admin</a></li>
    </>
  )
}



