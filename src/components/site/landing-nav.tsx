"use client"

import * as React from 'react'

export function LandingNav() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const calendlyUrl = (typeof window !== 'undefined' ? (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_CALENDLY_URL : undefined) || 'https://calendly.com/cc283-rice/30min'

  return (
    <div className={`sticky top-0 z-50 ${scrolled ? 'backdrop-blur bg-white/70 border-b border-[rgba(0,0,0,0.08)]' : 'bg-white/40 backdrop-blur border-b border-[rgba(0,0,0,0.06)]'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <a href="/" className="inline-flex items-center gap-2">
          <img src="/gopher-logo.png" alt="Gopher" className="h-12 w-auto md:h-16" />
          <span className="sr-only">Gopher</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <a href="#how" className="hover:text-black leading-8">How it works</a>
          <a href="/login" className="hover:text-black leading-8">Sign in</a>
          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-full bg-[#32ff00]/90 px-4 text-black shadow-[0_3px_12px_rgba(0,0,0,0.12)] transition hover:bg-[#2be600] focus:outline-none focus:ring-2 focus:ring-[#32ff00]/30">
            Book a Demo
          </a>
        </nav>
        <div className="md:hidden">
          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-[#32ff00]/90 px-4 py-2 text-black shadow-[0_3px_12px_rgba(0,0,0,0.12)] transition hover:bg-[#2be600] focus:outline-none focus:ring-2 focus:ring-[#32ff00]/30">
            Book a Demo
          </a>
        </div>
      </div>
    </div>
  )
}


