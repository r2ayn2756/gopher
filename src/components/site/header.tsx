"use client"

import { usePathname } from 'next/navigation'
import * as React from 'react'

export function Header() {
  const pathname = usePathname()
  const [logoOk, setLogoOk] = React.useState(true)
  const hideHeader =
    pathname === '/' ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/assignment-proofer') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/login')

  if (hideHeader) return null

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm md:py-5">
        <a href="/" className="font-semibold text-gray-900">
          <span className="inline-flex items-center gap-2">
            {logoOk ? (
              <img
                src="/gopher-logo.png"
                alt="Gopher"
                className="h-8 w-8"
                onError={() => setLogoOk(false)}
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-sm font-semibold text-white">G</span>
            )}
            <span className="text-base md:text-lg">Gopher</span>
          </span>
        </a>
        <nav>
          <ul className="flex items-center gap-8 text-lime-600">
            <li><a href="/" className="hover:text-lime-700">Home</a></li>
            <li><a href="/chat" className="hover:text-lime-700">AI Chat</a></li>
            <li><a href="/notes" className="hover:text-lime-700">Notes</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}


