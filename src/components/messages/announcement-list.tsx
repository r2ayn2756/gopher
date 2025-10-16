"use client"

import * as React from 'react'
import { ResponseForm } from './response-form'
import { formatDistanceToNow } from 'date-fns'

type Announcement = {
  id: string
  subject: string
  content: string
  created_at: string
  teacher: {
    username: string | null
    full_name: string | null
  }
}

type Response = {
  id: string
  content: string
  created_at: string
  sender: {
    username: string | null
    full_name: string | null
  }
}

export function AnnouncementList({ isTeacher }: { isTeacher: boolean }) {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [responses, setResponses] = React.useState<Record<string, Response[]>>({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch announcements')
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const fetchResponses = async (announcementId: string) => {
    if (responses[announcementId]) return // Already fetched

    try {
      const res = await fetch(`/api/announcements/${announcementId}/responses`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch responses')
      const data = await res.json()
      setResponses(prev => ({ ...prev, [announcementId]: data.responses || [] }))
    } catch (e: any) {
      console.error('Failed to load responses:', e)
    }
  }

  React.useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      fetchResponses(id)
    }
  }

  const handleResponseSuccess = (announcementId: string) => {
    // Refresh responses for this announcement
    fetch(`/api/announcements/${announcementId}/responses`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setResponses(prev => ({ ...prev, [announcementId]: data.responses || [] })))
      .catch(console.error)
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading announcements...</div>
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No announcements yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map(announcement => {
        const isExpanded = expandedId === announcement.id
        const announcementResponses = responses[announcement.id] || []

        return (
          <div
            key={announcement.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div
              className="cursor-pointer p-6"
              onClick={() => handleExpand(announcement.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.subject}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {announcement.teacher?.full_name || announcement.teacher?.username || 'Teacher'} •{' '}
                    {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                  </p>
                </div>
                <button className="text-gray-400 transition hover:text-gray-600">
                  <svg
                    className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 p-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  Responses ({announcementResponses.length})
                </h4>

                {announcementResponses.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {announcementResponses.map(response => (
                      <div key={response.id} className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {response.sender?.full_name || response.sender?.username || 'Student'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{response.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!isTeacher && (
                  <ResponseForm
                    announcementId={announcement.id}
                    onSuccess={() => handleResponseSuccess(announcement.id)}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
