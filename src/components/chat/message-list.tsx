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
      <div onWheel={onWheel} className="h-full overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-border)] p-6 bg-white">
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  if (!messages?.length) {
    return (
      <div onWheel={onWheel} className="h-full overscroll-contain rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-white to-gray-50 p-12">
        <div className="flex min-h-full flex-col items-center justify-center text-center">
          <img src="/gopher-logo.png" alt="Gopher" className="mb-6 h-16 w-auto" />
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Ready to learn!</h2>
          <p className="mt-3 max-w-2xl text-base text-gray-600">
            Start a conversation with Gopher to explore AI in a safe and educational way. Ask questions, get help with homework, or learn something new!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} onWheel={onWheel} className="h-full overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-border)] p-6 bg-white">
      <ul className="space-y-6">
        {messages.map((m) => (
          <li key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block max-w-[80%] rounded-3xl px-5 py-3.5 text-[16px] md:text-[17px] shadow-sm ${m.role === 'user' ? 'bg-white text-black border border-[var(--color-border)]' : 'bg-[#32ff00]/10 text-gray-900 border border-[#32ff00]/30'}`}>
              {typeof m.hintLevel === 'number' && m.role === 'assistant' && (
                <span className="mb-2 inline-block rounded-full bg-[#32ff00]/20 text-gray-900 px-3 py-1 text-xs font-semibold">Hint L{m.hintLevel}</span>
              )}
              <div className={`prose prose-lg max-w-none font-medium leading-relaxed ${m.role === 'assistant' ? 'text-gray-900' : 'text-black'}`}>
                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                  {normalizeMathDelimiters(m.content)}
                </ReactMarkdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


