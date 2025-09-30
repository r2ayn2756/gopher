"use client"

import * as React from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type Item = {
  id: string
  title: string | null
  status: string
  started_at: string
}

export function ConversationSidebar({ onOpen }: { onOpen: (id: string) => void }) {
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthorized')
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, status, started_at')
        .neq('status', 'deleted')
        .order('started_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setItems(data || [])
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/conversations/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemStatement: 'New chat' }),
                credentials: 'include',
              })
              if (!res.ok) {
                if (res.status === 409) {
                  // Missing profile; send user to registration
                  window.location.href = '/register'
                  return
                }
                throw new Error(await res.text())
              }
              const j = await res.json()
              await load()
              if (j?.id) { setActiveId(j.id); onOpen(j.id) }
            } catch (e) {
              console.error('new chat failed', e)
              setError('Failed to create chat')
            }
          }}
          className="w-full rounded-3xl bg-lime-500 px-6 py-3 text-lg font-semibold text-white shadow-[0_8px_24px_rgba(132,204,22,0.35)] transition hover:bg-lime-600 hover:-translate-y-0.5 active:translate-y-0 transform"
        >
          + New Chat
        </button>
      </div>
      {error && <div className="mb-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{error}</div>}
      {loading ? (
        <div className="text-sm text-[var(--color-muted)]">Loading…</div>
      ) : (
        <ul className="space-y-3 overflow-y-auto">
          {items.map((it) => (
            <li key={it.id} className="group flex items-center gap-2">
              <button
                onClick={() => { setActiveId(it.id); onOpen(it.id) }}
                className={`block w-full rounded-2xl p-4 text-left transition transform hover:-translate-y-0.5 ${
                  activeId === it.id
                    ? 'bg-lime-500 text-white shadow-lg'
                    : 'bg-white border border-[var(--color-border)] hover:bg-black/5'
                }`}
              >
                <div className="text-base font-semibold whitespace-normal break-words">{it.title || 'Untitled conversation'}</div>
                <div className={`text-sm whitespace-normal break-words ${activeId === it.id ? 'text-white/90' : 'text-[var(--color-muted)]'}`}>{new Date(it.started_at).toLocaleString()} · {it.status}</div>
              </button>
              <button
                aria-label="Delete conversation"
                title="Delete"
                onClick={async (e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  // Optimistic removal for instant UI response
                  setItems((prev) => prev.filter((x) => x.id !== it.id))
                  // Fire-and-forget backend delete
                  fetch(`/api/conversations/${it.id}`, { method: 'DELETE' })
                    .then(async (res) => {
                      if (!res.ok) {
                        console.error('delete failed', await res.text().catch(() => ''))
                      }
                    })
                    .catch((err) => console.error('delete error', err))
                }}
                className="invisible rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 transition hover:bg-red-50 hover:-translate-y-0.5 transform group-hover:visible"
              >
                Delete
              </button>
            </li>
          ))}
          {!items.length && <li className="text-sm text-[var(--color-muted)]">No conversations yet.</li>}
        </ul>
      )}
    </div>
  )
}


