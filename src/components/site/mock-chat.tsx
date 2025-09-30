"use client"

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

type MockMessage = {
  role: 'user' | 'assistant'
  content: string
  hintLevel?: number
}

const SCRIPT: MockMessage[] = [
  { role: 'user', content: "I'm stuck on factoring $x^2 + 5x + 6$. Any hints?" },
  { role: 'assistant', content: 'Let\'s try a hint. Look for two numbers that multiply to 6 and add to 5.', hintLevel: 1 },
  { role: 'user', content: 'Maybe 2 and 3?' },
  { role: 'assistant', content: 'Great! Use those to factor. What does the expression become?', hintLevel: 2 },
  { role: 'user', content: '$(x + 2)(x + 3)$?' },
  { role: 'assistant', content: 'Nice. Now verify by expanding. What do you get?', hintLevel: 3 },
  { role: 'user', content: '$(x+2)(x+3)=x^2+5x+6$' },
  { role: 'assistant', content: 'Exactly. Quick extension: if the constant were $-6$, what numbers multiply to $-6$ and add to $5$?', hintLevel: 2 },
  { role: 'user', content: '$6$ and $-1$.' },
  { role: 'assistant', content: 'Good. Then the factorization would be…', hintLevel: 2 },
  { role: 'user', content: '$(x+6)(x-1)$' },
  { role: 'assistant', content: 'Well done. Pattern check: we pick $m,n$ with $m+n=b$ and $mn=c$, then write $(x+m)(x+n)$.', hintLevel: 1 },
]

export function MockChat() {
  const [visibleCount, setVisibleCount] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (visibleCount < SCRIPT.length) {
      const delay = 1000 + visibleCount * 300
      const id = setTimeout(() => setVisibleCount((c) => c + 1), delay)
      return () => clearTimeout(id)
    }
  }, [visibleCount])

  return (
    <div ref={containerRef} className="relative h-80 md:h-96 w-full overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
      <ul className="flex min-h-full flex-col justify-end gap-3">
        {SCRIPT.slice(0, visibleCount).map((m, i) => (
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


