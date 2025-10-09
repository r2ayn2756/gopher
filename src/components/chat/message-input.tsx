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
    <div className="mt-4 rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, max))}
        rows={3}
        className="w-full resize-none bg-transparent px-2 outline-none text-base text-gray-900 placeholder:text-gray-400"
        placeholder="Ask your question... (Shift+Enter for new line)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        aria-label="Message"
      />
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500 text-sm">{value.length}/{max} characters</span>
        <div className="flex gap-2">
          <button
            onClick={() => setValue('')}
            className="rounded-full border border-gray-200 px-4 py-2 text-gray-700 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!value}
          >
            Clear
          </button>
          <button
            onClick={submit}
            disabled={sending || disabled || !value.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[#32ff00] px-6 py-2.5 text-sm font-semibold text-black shadow-[0_4px_16px_rgba(50,255,0,0.25)] transition-all hover:bg-[#2be600] hover:shadow-[0_6px_24px_rgba(50,255,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transform"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


