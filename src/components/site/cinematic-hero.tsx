"use client"

import * as React from 'react'
import { MockChat } from '@/components/site/mock-chat'

export function CinematicHero() {
  const calendlyUrl = (typeof window !== 'undefined' ? (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_CALENDLY_URL : undefined) || 'https://calendly.com/cc283-rice/30min'

  return (
    <section className="relative overflow-hidden border-b border-[rgba(50,255,0,0.2)] bg-white">

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
        <div>
          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-black md:text-6xl">
            AI that <span className="underline decoration-[length:6px] decoration-[#32ff00]/40 underline-offset-8">guides</span>, not answers.
          </h1>
          <p className="mt-5 text-lg text-gray-700">Socratic tutoring that builds mastery—private, compliant, classroom‑ready.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center rounded-full bg-[#32ff00]/90 px-6 py-3 text-black shadow-[0_3px_16px_rgba(0,0,0,0.12)] transition hover:bg-[#2be600] focus:outline-none focus:ring-2 focus:ring-[#32ff00]/30">
              <span>Book a Demo</span>
              <svg className="ml-2 h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </a>
            <a href="#how" className="inline-flex items-center rounded-full border border-[#32ff00]/40 bg-white px-6 py-3 text-gray-900 transition hover:bg-[#32ff00]/5 focus:outline-none focus:ring-2 focus:ring-[#32ff00]/30">See how it works</a>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/15 text-[#32ff00]">🔒</span>
            <span>FERPA & COPPA compliant · Your data stays yours</span>
          </div>
        </div>
        <div className="relative">
          <div className="relative rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.2)]">
            <MockChat />
          </div>
          <div aria-hidden className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-[#32ff00]/8 blur-2xl" />
        </div>
      </div>

    </section>
  )
}


