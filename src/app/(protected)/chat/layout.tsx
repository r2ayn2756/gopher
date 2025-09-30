"use client"
import type { ReactNode } from 'react'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { useRouter } from 'next/navigation'
import { AdminNavLink } from '@/components/site/admin-nav-link'
import { useChatStore } from '@/stores/chat-store'

export default function ChatLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const loadConversation = useChatStore((s) => s.loadConversation)
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-white text-black text-[15px] md:text-base">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4 text-base">
          <a href="/" className="flex items-center pl-2">
            <span className="inline-flex items-center gap-2">
              <img src="/gopher-logo.png" alt="Gopher" className="h-16 w-auto md:h-20" />
              <span className="sr-only">Gopher</span>
            </span>
          </a>
          <nav>
            <ul className="flex items-center gap-10">
              <li><a href="/" className="text-lime-600 hover:text-lime-700 font-semibold">Home</a></li>
              <li><a href="/chat" className="text-lime-600 hover:text-lime-700 font-semibold">AI Chat</a></li>
              <li><a href="/notes" className="text-lime-600 hover:text-lime-700 font-semibold">Notes</a></li>
              <AdminNavLink />
            </ul>
          </nav>
        </div>
      </div>
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


