"use client"

import * as React from 'react'

export function AnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const [subject, setSubject] = React.useState('')
  const [content, setContent] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject, content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create announcement')
      }

      setSuccess(true)
      setSubject('')
      setContent('')
      onSuccess?.()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">New Announcement</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-[#32ff00]"
            placeholder="e.g., Homework due Monday"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={5000}
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-[#32ff00]"
            placeholder="Write your announcement..."
          />
          <div className="mt-1 text-xs text-gray-500">{content.length}/5000 characters</div>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Announcement posted successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-[#32ff00] px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-[#2be600] disabled:opacity-60"
        >
          {submitting ? 'Posting...' : 'Post Announcement'}
        </button>
      </form>
    </div>
  )
}
