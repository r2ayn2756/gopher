"use client"

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  hintLevel?: number | null
  createdAt?: string
}

export function MessageList({ messages, loading }: { messages: ChatMessage[]; loading?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])
  const normalizeMathDelimiters = (text: string): string => {
    // remark-math parses $ ... $ and $$ ... $$, not \( ... \) or \[ ... \)
    // 1) Convert existing \( ... \) -> $ ... $ and \[ ... \] -> $$ ... $$
    let out = text
      .replace(/\\\(([\s\S]*?)\\\)/g, (_m, body) => `$${body.trim()}$`)
      .replace(/\\\[([\s\S]*?)\\\]/g, (_m, body) => `$$${body.trim()}$$`)

    // 2) Convert patterns like ( \\frac{a}{b} ) to $ ... $
    const inlineLatex = /\(\s*(\\(?:frac|sqrt|sum|int|lim|log|sin|cos|tan|pi|cdot|times|alpha|beta|gamma|delta|theta|lambda|mu|sigma|phi|psi|omega|left|right|overline|underline|hat|vec|mathrm|mathbf|mathit|partial|nabla|leq|geq|neq|approx|sim|infty|pm|mp|forall|exists|Rightarrow|rightarrow)[^)]*)\s*\)/g
    out = out.replace(inlineLatex, (_m, body) => `$${body.trim()}$`)

    return out
  }
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget
    const atTop = el.scrollTop <= 0
    const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  if (loading) {
    return (
      <div onWheel={onWheel} className="h-full overflow-y-auto overscroll-contain rounded-3xl border border-[var(--color-border)] p-8 bg-gradient-to-b from-white to-gray-50/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)]">
        <div className="space-y-4">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#32ff00]/10" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!messages?.length) {
    return (
      <div onWheel={onWheel} className="h-full overscroll-contain rounded-3xl border border-[var(--color-border)] bg-gradient-to-b from-white via-gray-50/30 to-white p-12 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex min-h-full flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <img src="/gopher-logo.png" alt="Gopher" className="h-20 w-auto relative z-10" />
            <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-[#32ff00]/10 blur-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Ready to dig deeper!</h2>
          <p className="mt-4 max-w-md text-base text-gray-600 leading-relaxed">
            Ask me anything about your homework. I'll guide you with questions and hints—never give you the answer directly.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#32ff00]/10 text-[#32ff00] text-xs font-bold">S</span>
            <span>Socratic method · Think, don't copy</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} onWheel={onWheel} className="h-full overflow-y-auto overscroll-contain rounded-3xl border border-[var(--color-border)] p-6 md:p-8 bg-gradient-to-b from-white to-gray-50/30 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)]">
      <ul className="space-y-6">
        {messages.map((m) => (
          <li key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[80%] ${m.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
              {typeof m.hintLevel === 'number' && m.role === 'assistant' && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#32ff00]/15 px-3 py-1 text-xs font-bold text-[#064e00] ring-1 ring-[#32ff00]/30">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    Hint Level {m.hintLevel}
                  </span>
                </div>
              )}
              <div className={`rounded-3xl px-5 py-4 text-[15.5px] md:text-[16.5px] shadow-sm transition-all duration-200 ${
                m.role === 'user'
                  ? 'bg-white text-gray-900 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                  : 'bg-gradient-to-br from-[#32ff00]/8 to-[#32ff00]/12 text-gray-900 border border-[#32ff00]/20 shadow-[0_4px_16px_-4px_rgba(50,255,0,0.15)] hover:shadow-[0_6px_24px_-6px_rgba(50,255,0,0.25)]'
              }`}>
                <div className={`prose prose-sm md:prose-base max-w-none font-medium leading-relaxed ${m.role === 'assistant' ? 'text-gray-900' : 'text-gray-800'}`}>
                  <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                    {normalizeMathDelimiters(m.content)}
                  </ReactMarkdown>
                </div>
              </div>
              {m.createdAt && (
                <div className={`mt-1.5 px-2 text-xs text-gray-400 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


