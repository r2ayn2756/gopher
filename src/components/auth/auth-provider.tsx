"use client"

import React from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signInWithPassword: (email: string, password: string, remember?: boolean) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: () => boolean
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createSupabaseBrowser(), [])
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    async function init() {
      setLoading(true)
      setError(null)
      const [{ data: sessionRes }, { data: userRes }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ])
      if (!isMounted) return
      setSession(sessionRes.session ?? null)
      setUser(userRes.user ?? null)
      setLoading(false)
    }
    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithPassword = React.useCallback(
    async (email: string, password: string, remember = true) => {
      setError(null)
      setLoading(true)
      try {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (err) throw err
        if (!remember) {
          // If not remembering, immediately set the session to non-persistent by signing in, then clearing local storage tokens.
          // Supabase JS v2 persists by default in browser; for stricter control, handle at app level.
          // No-op here beyond default behavior.
        }
      } catch (e: any) {
        setError(e?.message ?? 'Login failed')
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const signOut = React.useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signOut()
      if (err) throw err
    } catch (e: any) {
      setError(e?.message ?? 'Logout failed')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const isAdmin = React.useCallback(() => {
    // For MVP, rely on a custom claim or fallback to profiles query later (server-side preferred).
    // Here, we conservatively return false; admin checks should be enforced server-side via RLS.
    return false
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signInWithPassword,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}


