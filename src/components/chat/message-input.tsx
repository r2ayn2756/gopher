"use client"

import * as React from 'react'

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const max = 1000

  const submit = async () => {
    if (!value.trim()) return
    setSending(true)
    try {
      await onSend(value.trim())
      setValue('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, max))}
        rows={1}
        className="w-full resize-none bg-transparent px-2 outline-none text-base"
        placeholder="Ask your question..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        aria-label="Message"
      />
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-[var(--color-muted)] text-base">{value.length}/{max}</span>
        <div className="flex gap-2">
          <button onClick={() => setValue('')} className="rounded-md border border-[var(--color-border)] px-3 py-1" disabled={!value}>Clear</button>
          <button
            onClick={submit}
            disabled={sending || disabled || !value.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-lime-500 px-5 py-2 text-white shadow-sm transition hover:bg-lime-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transform"
          >
            <span className="inline-block h-4 w-4 rounded-full bg-white/30" />
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}


