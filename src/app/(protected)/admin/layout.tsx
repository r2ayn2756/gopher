import type { ReactNode } from 'react'
import { AppNav } from '@/components/site/app-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 text-black text-[15px] md:text-base">
      <AppNav />
      <main className="flex min-h-0 flex-1 flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}


