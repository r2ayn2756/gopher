"use client"
import type { ReactNode } from 'react'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { useRouter } from 'next/navigation'
import { AppNav } from '@/components/site/app-nav'
import { useChatStore } from '@/stores/chat-store'

export default function ChatLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const loadConversation = useChatStore((s) => s.loadConversation)
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-white text-black text-[15px] md:text-base">
      <AppNav />
      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[360px_1fr]">
        <aside className="hidden overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 lg:block">
          <ConversationSidebar onOpen={async (id) => {
            await loadConversation(id)
            router.push('/chat?id=' + id)
          }} />
        </aside>
        <main className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex-1 min-h-0">{children}</div>
        </main>
      </div>
    </div>
  )
}


