"use client"
import * as React from 'react'
import { AiRestrictionsSection } from '@/components/admin/ai-restrictions-section'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type Item = {
  id: string
  user_id: string
  title: string | null
  status: string
  started_at: string
  ended_at: string | null
  profiles?: { username?: string | null; full_name?: string | null } | null
}

export default function AdminPage() {
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedUser, setSelectedUser] = React.useState<string | 'all'>('all')
  const [users, setUsers] = React.useState<Array<{ id: string; name: string }>>([])
  const [viewId, setViewId] = React.useState<string | null>(null)
  const [myClassCode, setMyClassCode] = React.useState<string | null>(null)

  // Load class code from URL first (after registration redirect), else fetch from profile
  React.useEffect(() => {
    const url = new URL(window.location.href)
    const urlClass = url.searchParams.get('class')
    if (urlClass) {
      setMyClassCode(urlClass)
      return
    }
    let active = true
    ;(async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: userRes } = await supabase.auth.getUser()
        const uid = userRes.user?.id
        if (!uid) return
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('class_code, role')
          .eq('id', uid)
          .single()
        if (profErr) return
        if (!active) return
        if ((prof as any)?.role === 'admin' && (prof as any)?.class_code) {
          setMyClassCode((prof as any).class_code as string)
        }
      } catch {
        // ignore
      }
    })()
    return () => { active = false }
  }, [])

  React.useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams({ page: '1', pageSize: '10' }) // Reduce page size for faster loading
        if (selectedUser !== 'all') qs.set('userId', selectedUser)
        const res = await fetch(`/api/conversations/list?${qs.toString()}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load conversations')
        const j = await res.json()
        if (!active) return
        setItems(j.items || [])
        const uniqueUsers = new Map<string, string>()
        ;(j.items || []).forEach((it: Item) => {
          if (it.user_id) {
            const name = it.profiles?.full_name || it.profiles?.username || it.user_id
            if (!uniqueUsers.has(it.user_id)) uniqueUsers.set(it.user_id, name)
          }
        })
        setUsers(Array.from(uniqueUsers.entries()).map(([id, name]) => ({ id, name })))
      } catch (e: any) {
        if (!active) return
        setError(e?.message ?? 'Failed to load conversations')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [selectedUser])

  return (
    <div className="mx-auto max-w-6xl p-6 text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor AI chats across users.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin/ai-restrictions" className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-gray-900 transition hover:bg-gray-50">AI Restrictions</a>
        </div>
      </div>

      {myClassCode && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <div className="font-medium">Your class code</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded-md bg-white px-2 py-1 text-base font-semibold text-green-800 ring-1 ring-inset ring-green-200">
              {myClassCode}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(myClassCode)}
              className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
            >
              Copy
            </button>
          </div>
          <div className="mt-1 text-[13px] text-green-800/80">Share this code with your students so they can register under your class.</div>
        </div>
      )}

      <AiRestrictionsSection />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-700">Filter by user</label>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-600"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value as any)}
        >
          <option value="all">All users</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-green-50 text-green-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Conversation</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Started</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading…</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No conversations found</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-t border-gray-100 hover:bg-green-50/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{it.title || 'Untitled conversation'}</div>
                    <div className="text-xs text-gray-500">{it.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{it.profiles?.full_name || it.profiles?.username || 'Unknown user'}</div>
                    <div className="text-xs text-gray-500">{it.user_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs capitalize text-green-800 ring-1 ring-inset ring-green-200">{it.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(it.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewId(it.id)}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-white shadow-sm transition hover:bg-green-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer for transcript */}
      {viewId && (
        <TranscriptDrawer id={viewId} onClose={() => setViewId(null)} />
      )}
    </div>
  )
}

function TranscriptDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [conv, setConv] = React.useState<any>(null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/conversations/${id}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load conversation')
        const j = await res.json()
        if (!active) return
        setConv(j)
      } catch (e: any) {
        if (!active) return
        setError(e?.message ?? 'Failed to load conversation')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="h-full w-full flex-1 bg-black/40" onClick={onClose} />
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-gray-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="font-semibold text-gray-900">Conversation Transcript</div>
          <button onClick={onClose} className="rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700">Close</button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : error ? (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : !conv ? (
            <div className="text-gray-500">Not found</div>
          ) : (
            <div className="space-y-4">
              {(conv.messages || []).map((m: any) => (
                <div key={m.id} className={m.role === 'user' ? 'text-gray-900' : 'text-gray-800'}>
                  <div className="mb-1 text-xs font-medium text-green-700">{m.role === 'user' ? 'Student' : 'Gopher'}</div>
                  <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



