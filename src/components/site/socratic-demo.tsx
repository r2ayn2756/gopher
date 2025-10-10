"use client"

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Sparkles, X } from 'lucide-react'

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
  { role: 'user', content: '$(x+2)(x+3)=x^2+5x+6$' },
  { role: 'assistant', content: 'Exactly. Quick extension: if the constant were $-6$, what numbers multiply to $-6$ and add to $5$?', hintLevel: 2 },
]

const CHATGPT_SCRIPT: MockMessage[] = [
  { role: 'user', content: "I'm stuck on factoring $x^2 + 5x + 6$. Any hints?" },
  {
    role: 'assistant',
    content: `To factor $x^2 + 5x + 6$, you're looking for two binomials of the form $(x + a)(x + b)$ where $a$ and $b$ are numbers that satisfy two conditions:

1. $a \\times b = 6$ (the constant term)
2. $a + b = 5$ (the coefficient of $x$)

The numbers that work are 2 and 3, since $2 \\times 3 = 6$ and $2 + 3 = 5$.

Therefore, the factored form is: $(x + 2)(x + 3)$

You can verify this by expanding: $(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6$ ✓`
  },
]

function ChatGPTMockChat() {
  const [visibleCount, setVisibleCount] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (visibleCount < CHATGPT_SCRIPT.length) {
      const delay = visibleCount === 0 ? 1000 : 1500
      const id = setTimeout(() => setVisibleCount((c) => c + 1), delay)
      return () => clearTimeout(id)
    }
  }, [visibleCount])

  return (
    <div ref={containerRef} className="relative h-80 md:h-96 w-full overflow-y-auto overscroll-contain rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
      <ul className="flex min-h-full flex-col justify-end gap-3">
        {CHATGPT_SCRIPT.slice(0, visibleCount).map((m, i) => (
          <li key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] md:text-[16px] animate-[fadeIn_.5s_ease] ${m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
              <div className="prose prose-sm max-w-none leading-relaxed prose-invert">
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

function GopherMockChat() {
  const [visibleCount, setVisibleCount] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (visibleCount < GOPHER_SCRIPT.length) {
      const delay = 1000 + visibleCount * 300
      const id = setTimeout(() => setVisibleCount((c) => c + 1), delay)
      return () => clearTimeout(id)
    }
  }, [visibleCount])

  return (
    <div ref={containerRef} className="relative h-80 md:h-96 w-full overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
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

export function SocraticDemo() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-b from-white via-gray-50/30 to-white py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#32ff00]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
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
            Compare the difference: answers vs. guidance
          </p>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Traditional AI */}
          <div className="relative">
            <div className="relative rounded-3xl border border-gray-300 bg-gray-50 p-5 shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                <X size={12} />
                Traditional AI
              </div>
              <ChatGPTMockChat />
              <div className="mt-3 text-center text-xs text-gray-500 font-medium">
                Gives you the answer immediately
              </div>
            </div>
          </div>

          {/* Gopher */}
          <div className="relative">
            <div className="relative rounded-3xl border-2 border-[#32ff00] bg-white p-5 shadow-[0_8px_32px_rgba(50,255,0,0.2)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32ff00] text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                ✨ The Gopher Way
              </div>
              <GopherMockChat />
              <div className="mt-3 text-center text-xs text-[#064e00] font-bold">
                Guides you to discover it yourself
              </div>
            </div>
            <div aria-hidden className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-[#32ff00]/8 blur-2xl" />
          </div>
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
