import { create } from 'zustand'
import type { ChatMessage } from '@/components/chat/message-list'

type State = {
  conversationId: string | null
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  cache: Record<string, ChatMessage[]>
}

type Actions = {
  startNewConversation: (subject?: string, problemStatement?: string) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  clearError: () => void
  loadConversation: (id: string) => Promise<void>
}

export const useChatStore = create<State & Actions>((set, get) => ({
  conversationId: null,
  messages: [],
  loading: false,
  error: null,
  cache: {},

  clearError: () => set({ error: null }),

  loadConversation: async (id: string) => {
    const cached = get().cache[id]
    if (cached) {
      set({ conversationId: id, messages: cached, error: null })
      return
    }
    set({ loading: true, error: null, conversationId: id, messages: [] })
    const res = await fetch(`/api/conversations/${id}` , { credentials: 'include' })
    if (!res.ok) {
      const j = await res.json().catch(() => null)
      set({ loading: false, error: j?.error || 'Failed to load conversation' })
      return
    }
    const j = await res.json()
    const msgs = (j.messages || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      hintLevel: m.hint_level ?? null,
      createdAt: m.created_at,
    }))
    set((s) => ({ loading: false, messages: msgs, cache: { ...s.cache, [id]: msgs } }))
  },

  startNewConversation: async (subject?: string, problemStatement?: string) => {
    set({ loading: true, error: null })
    const res = await fetch('/api/conversations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, problemStatement }),
      credentials: 'include',
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let message = 'Failed to start conversation'
      try { const j = JSON.parse(text); message = j?.error || message } catch {}
      console.error('create conversation failed', res.status, text)
      set({ loading: false, error: message })
      return
    }
    const j = await res.json()
    set({ conversationId: j.id, loading: false })
  },

  sendMessage: async (text: string) => {
    const id = get().conversationId
    if (!id) {
      // Use the first outbound message as the initial problem statement
      await get().startNewConversation(undefined, text)
    }
    const conversationId = get().conversationId
    if (!conversationId) {
      set({ error: 'No conversation (could not create). Please try again.' })
      return
    }
    const tempId = crypto.randomUUID()
    set({ messages: [...get().messages, { id: tempId, role: 'user', content: text }] })
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message: text }),
      credentials: 'include',
    })
    if (!res.ok) {
      const j = await res.json().catch(() => null)
      set({ error: j?.error || 'AI request failed' })
      return
    }
    const j = await res.json()
    set({ messages: [...get().messages, { id: crypto.randomUUID(), role: 'assistant', content: j.reply, hintLevel: j.hintLevel }] })
  },
}))


