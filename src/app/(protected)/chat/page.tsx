"use client"

import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { useChatStore } from '@/stores/chat-store'

export default function ChatPage() {
  const messages = useChatStore((s) => s.messages)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const error = useChatStore((s) => s.error)
  const clearError = useChatStore((s) => s.clearError)
  const loading = useChatStore((s) => s.loading)

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 md:px-6 py-6 text-[16px] md:text-[17px]">
      {error && (
        <div className="mb-4 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 px-4 py-3 text-sm text-red-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            className="ml-4 rounded-full px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200/50 transition-colors"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageList messages={messages} loading={loading} />
        </div>
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  )
}


