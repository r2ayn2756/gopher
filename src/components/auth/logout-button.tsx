"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const onClick = async () => {
    if (!confirm('Are you sure you want to log out?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
      router.replace('/')
    } catch {
      // noop for MVP; could show toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-black/5 disabled:opacity-60"
    >
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  )
}


