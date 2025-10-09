"use client"
import * as React from 'react'
import { AiRestrictionsSection } from '@/components/admin/ai-restrictions-section'
import { StudentInsights } from '@/components/admin/student-insights'
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
  const [showClassCode, setShowClassCode] = React.useState(false)
  const [studentInsights, setStudentInsights] = React.useState<any[]>([])
  const [insightsLoading, setInsightsLoading] = React.useState(true)
  
  
  // Summary stats
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalMessages: 0,
    activeConversations: 0,
    totalConversations: 0
  })

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


  // Calculate summary stats
  React.useEffect(() => {
    const totalMessages = studentInsights.reduce((sum, insight) => sum + insight.totalQuestions, 0)
    const totalStudents = users.length
    const activeConversations = items.filter(item => item.status === 'active').length
    const totalConversations = items.length

    setStats({
      totalStudents,
      totalMessages,
      activeConversations,
      totalConversations
    })
  }, [studentInsights, items, users])

  // Load student insights
  React.useEffect(() => {
    let active = true
    ;(async () => {
      setInsightsLoading(true)
      try {
        const res = await fetch('/api/admin/daily-insights?days=7', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load student insights')
        const json = await res.json()
        if (!active) return
        setStudentInsights(json.insights || [])
      } catch (error) {
        console.error('Failed to load student insights:', error)
      } finally {
        if (active) setInsightsLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const refreshInsights = async () => {
    setInsightsLoading(true)
    try {
      const res = await fetch('/api/admin/daily-insights?days=7', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load student insights')
      const json = await res.json()
      setStudentInsights(json.insights || [])
    } catch (error) {
      console.error('Failed to refresh student insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 text-black">

      {myClassCode && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <div className="font-medium">Your class code</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded-md bg-white px-2 py-1 text-base font-semibold text-green-800 ring-1 ring-inset ring-green-200">
              {showClassCode ? myClassCode : '•'.repeat(myClassCode.length)}
            </code>
            <button
              type="button"
              aria-pressed={showClassCode}
              onClick={() => setShowClassCode(v => !v)}
              className="rounded-md border border-green-600 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-600/10"
            >
              {showClassCode ? 'Hide' : 'Show'}
            </button>
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

      {/* Summary Statistics Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last 7 days</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Conversations</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeConversations}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Student Insights Section */}
      <StudentInsights
        insights={studentInsights}
        loading={insightsLoading}
        onRefresh={refreshInsights}
      />


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

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Live Student Conversations</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
            Live
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-900">
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
                <tr key={it.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{it.title || 'Untitled conversation'}</div>
                    <div className="text-xs text-gray-500">{it.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{it.profiles?.full_name || it.profiles?.username || 'Unknown user'}</div>
                    <div className="text-xs text-gray-500">{it.user_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ring-1 ring-inset ${
                      it.status === 'active'
                        ? 'bg-green-100 text-green-800 ring-green-200'
                        : 'bg-gray-100 text-gray-800 ring-gray-200'
                    }`}>{it.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(it.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewId(it.id)}
                      className="rounded-md bg-[#32ff00] px-3 py-1.5 text-black font-medium shadow-sm transition hover:bg-[#2be600]"
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
          <button onClick={onClose} className="rounded-md bg-[#32ff00] px-3 py-1.5 text-black font-medium hover:bg-[#2be600]">Close</button>
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
                  <div className="mb-1 text-xs font-medium text-gray-600">{m.role === 'user' ? 'Student' : 'Gopher AI'}</div>
                  <div className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gray-100 border border-gray-200'
                      : 'bg-[#32ff00]/10 border border-[#32ff00]/20'
                  }`}>
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



