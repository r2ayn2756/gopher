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
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-6 py-6 text-[16px] md:text-[17px]">
      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error} <button className="ml-2 underline" onClick={clearError}>Dismiss</button>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="h-[70vh] min-h-0 overflow-hidden">
          <MessageList messages={messages} loading={loading} />
        </div>
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  )
}


