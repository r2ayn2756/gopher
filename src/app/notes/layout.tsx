import type { ReactNode } from 'react'
import { AppNav } from '@/components/site/app-nav'

export default function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white text-black text-[15px] md:text-base">
      <AppNav />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 min-h-0">{children}</div>
      </main>
    </div>
  )
}


