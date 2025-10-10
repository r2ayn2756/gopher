"use client"

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Sparkles, TrendingUp, Clock, Brain } from 'lucide-react'

type MockMessage = {
  role: 'user' | 'assistant'
  content: string
  hintLevel?: number
}

const GOPHER_SCRIPT: MockMessage[] = [
  { role: 'user', content: "I'm stuck on factoring $x^2 + 5x + 6$. Any hints?" },
  { role: 'assistant', content: 'Let\'s try a hint. Look for two numbers that multiply to 6 and add to 5.', hintLevel: 1 },
  { role: 'user', content: 'Maybe 2 and 3?' },
  { role: 'assistant', content: 'Great! Use those to factor. What does the expression become?', hintLevel: 2 },
  { role: 'user', content: '$(x + 2)(x + 3)$?' },
  { role: 'assistant', content: 'Nice. Now verify by expanding. What do you get?', hintLevel: 3 },
]

function GopherMockChat() {
  const [visibleCount, setVisibleCount] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (visibleCount < GOPHER_SCRIPT.length) {
      const delay = 1000 + visibleCount * 400
      const id = setTimeout(() => setVisibleCount((c) => c + 1), delay)
      return () => clearTimeout(id)
    }
  }, [visibleCount])

  return (
    <div ref={containerRef} className="relative h-80 md:h-96 w-full overflow-y-auto overscroll-contain rounded-2xl border-2 border-[#32ff00]/40 bg-white p-4 shadow-[0_8px_40px_-12px_rgba(50,255,0,0.2)]">
      <ul className="flex min-h-full flex-col justify-end gap-3">
        {GOPHER_SCRIPT.slice(0, visibleCount).map((m, i) => (
          <li key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] md:text-[16px] shadow-sm animate-[fadeIn_.5s_ease] ${m.role === 'user' ? 'bg-white border border-[var(--color-border)]' : 'bg-[#32ff00]/15 border border-[#32ff00]/40'}`}>
              {typeof m.hintLevel === 'number' && m.role === 'assistant' && (
                <span className="mb-1 mr-2 inline-block rounded-full bg-[#32ff00]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#064e00]">Hint L{m.hintLevel}</span>
              )}
              <div className="prose prose-sm max-w-none text-black leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

export function CinematicHero() {
  const calendlyUrl = (typeof window !== 'undefined' ? (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_CALENDLY_URL : undefined) || 'https://calendly.com/cc283-rice/30min'

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-b from-white via-gray-50/30 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#32ff00]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        {/* Main headline */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#32ff00]/10 px-4 py-2 text-sm font-semibold text-[#064e00] mb-6">
            <Sparkles size={16} />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-black mb-6">
            AI that <span className="underline decoration-[length:6px] decoration-[#32ff00]/40 underline-offset-8">guides</span>, not answers.
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4">
            Save time. Understand your students better.
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Students learn by thinking, not copying. You gain insights into what they're struggling with.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center rounded-full bg-[#32ff00]/90 px-6 py-3 text-black shadow-[0_3px_16px_rgba(0,0,0,0.12)] transition hover:bg-[#2be600] focus:outline-none focus:ring-2 focus:ring-[#32ff00]/30">
              <span>Book a Demo</span>
              <svg className="ml-2 h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </a>
            <a href="#features" className="inline-flex items-center rounded-full border border-[#32ff00]/40 bg-white px-6 py-3 text-gray-900 transition hover:bg-[#32ff00]/5 focus:outline-none focus:ring-2 focus:ring-[#32ff00]/30">See how it works</a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/15 text-[#32ff00]">🔒</span>
            <span>FERPA & COPPA compliant · Your data stays yours</span>
          </div>
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center mt-16">
          {/* Left: Chat demo */}
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32ff00] text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg z-10">
              ✨ Socratic Guidance
            </div>
            <GopherMockChat />
            <div aria-hidden className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-[#32ff00]/8 blur-2xl" />
          </div>

          {/* Right: Key benefits */}
          <div className="space-y-6">
            <div className="group rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(50,255,0,0.3)] hover:border-[#32ff00]/40">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32ff00]/10 text-[#064e00] transition-all duration-300 group-hover:bg-[#32ff00]/20">
                  <Brain size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Students learn by thinking</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    No more copied answers. Gopher guides students through problems with questions and hints, building real understanding.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(50,255,0,0.3)] hover:border-[#32ff00]/40">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32ff00]/10 text-[#064e00] transition-all duration-300 group-hover:bg-[#32ff00]/20">
                  <TrendingUp size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">See what concepts students struggle with</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Admin dashboard shows trending topics and questions across your school. Identify gaps before they become problems.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(50,255,0,0.3)] hover:border-[#32ff00]/40">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32ff00]/10 text-[#064e00] transition-all duration-300 group-hover:bg-[#32ff00]/20">
                  <Clock size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Reduce time spent re-explaining</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    24/7 Socratic guidance means students get unstuck anytime. Less office hours, more time for what matters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


