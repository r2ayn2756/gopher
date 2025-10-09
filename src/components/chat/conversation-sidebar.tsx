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
          className="w-full rounded-3xl bg-[#32ff00] px-6 py-3.5 text-base font-bold text-black shadow-[0_8px_24px_rgba(50,255,0,0.35)] transition-all hover:bg-[#2be600] hover:shadow-[0_10px_32px_rgba(50,255,0,0.45)] hover:-translate-y-0.5 active:translate-y-0 transform"
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </span>
        </button>
      </div>
      {error && <div className="mb-3 rounded-2xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
      {loading ? (
        <div className="text-sm text-gray-500">Loading conversations…</div>
      ) : (
        <ul className="space-y-2.5 overflow-y-auto">
          {items.map((it) => (
            <li key={it.id} className="group flex items-center gap-2">
              <button
                onClick={() => { setActiveId(it.id); onOpen(it.id) }}
                className={`block w-full rounded-2xl p-4 text-left transition-all transform ${
                  activeId === it.id
                    ? 'bg-gradient-to-br from-[#32ff00]/90 to-[#32ff00] text-black shadow-[0_6px_24px_rgba(50,255,0,0.3)] scale-[1.02]'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
                }`}
              >
                <div className={`text-sm font-bold whitespace-normal break-words ${activeId === it.id ? 'text-black' : 'text-gray-900'}`}>
                  {it.title || 'Untitled conversation'}
                </div>
                <div className={`text-xs whitespace-normal break-words mt-1.5 ${activeId === it.id ? 'text-black/70' : 'text-gray-500'}`}>
                  {new Date(it.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {it.status}
                </div>
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
                className="opacity-0 group-hover:opacity-100 rounded-full border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300 hover:-translate-y-0.5 transform"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
          {!items.length && (
            <li className="text-center text-sm text-gray-400 py-8">
              <div className="text-4xl mb-2">💬</div>
              No conversations yet
            </li>
          )}
        </ul>
      )}
    </div>
  )
}


