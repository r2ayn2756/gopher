import type { ReactNode } from 'react'
import { AppNav } from '@/components/site/app-nav'

export default function RubricBuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 text-black">
      <AppNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
