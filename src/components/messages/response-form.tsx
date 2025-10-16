"use client"

import * as React from 'react'

export function ResponseForm({ announcementId, onSuccess }: { announcementId: string; onSuccess?: () => void }) {
  const [content, setContent] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`/api/announcements/${announcementId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit response')
      }

      setContent('')
      onSuccess?.()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={2000}
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#32ff00]"
          placeholder="Write your response..."
        />
        <div className="mt-1 text-xs text-gray-500">{content.length}/2000 characters</div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="inline-flex items-center rounded-full bg-[#32ff00] px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-[#2be600] disabled:opacity-60"
      >
        {submitting ? 'Sending...' : 'Send Response'}
      </button>
    </form>
  )
}
