"use client"

import * as React from 'react'
import { MockChat } from '@/components/site/mock-chat'
import { Sparkles } from 'lucide-react'

export function SocraticDemo() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-b from-white via-gray-50/30 to-white py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#32ff00]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#32ff00]/10 px-4 py-2 text-sm font-semibold text-[#064e00] mb-4">
            <Sparkles size={16} />
            Powered by Claude AI
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Not just <span className="relative">
              <span className="relative z-10">smarter</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#32ff00]/30 -z-0"></span>
            </span>, but <span className="text-[#32ff00]">better</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See the Socratic method in action—guiding students with questions, not answers
          </p>
        </div>

        {/* Demo */}
        <div className="relative mx-auto max-w-3xl">
          <div className="relative rounded-3xl border-2 border-[#32ff00] bg-white p-5 shadow-[0_8px_32px_rgba(50,255,0,0.2)]">
            {/* Highlight badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32ff00] text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
              ✨ The Gopher Way
            </div>
            <MockChat />
          </div>
          <div aria-hidden className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-[#32ff00]/8 blur-2xl" />
        </div>

        {/* Claude Attribution */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50">
              <svg className="h-7 w-7 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Powered by Claude</p>
              <p className="text-xs text-gray-600">Advanced AI from Anthropic</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
