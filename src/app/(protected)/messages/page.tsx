"use client"

import * as React from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { AnnouncementForm } from '@/components/messages/announcement-form'
import { AnnouncementList } from '@/components/messages/announcement-list'

export default function MessagesPage() {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkRole = async () => {
      const supabase = createSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }
      setLoading(false)
    }

    checkRole()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">
            {isAdmin
              ? 'Send announcements to your class and view student responses'
              : 'View announcements from your teacher and respond'}
          </p>
        </div>

        {isAdmin && (
          <div className="mb-8">
            <AnnouncementForm />
          </div>
        )}

        <AnnouncementList isTeacher={isAdmin} />
      </div>
    </div>
  )
}
