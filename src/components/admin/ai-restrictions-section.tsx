"use client"
import * as React from 'react'

export function AiRestrictionsSection() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  const [options, setOptions] = React.useState({
    explainDefinitions: true,
    modelPhysicsEngineering: false,
    showWorkings: true,
    avoidDirectAnswers: true,
  })

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/ai-restrictions', { credentials: 'include' })
        if (!res.ok) return
        const j = await res.json().catch(() => null)
        if (!active) return
        if (j?.settings) setOptions((prev) => ({ ...prev, ...j.settings }))
      } catch {}
    })()
    return () => { active = false }
  }, [])

  const onSave = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/ai-restrictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(options),
      })
      if (!res.ok) throw new Error((await res.text().catch(() => 'Failed to save')) || 'Failed to save')
      setSaved(true)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Restrictions</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Configure how AI guidance behaves for your class.</p>
        </div>
        <button
          onClick={onSave}
          disabled={loading}
          className="rounded-full bg-[#32ff00] px-4 py-2 text-sm font-semibold text-black shadow-[0_6px_24px_rgba(0,0,0,0.15)] transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {saved && !error && (
        <div className="mt-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">Saved. These settings now shape the AI context for your class.</div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_12px_32px_-24px_rgba(50,255,0,0.18)]">
          <div className="text-lg font-medium text-gray-900">Allowable Guidance</div>
          <div className="mt-3 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-800">Explain definitions</span>
              <button
                type="button"
                role="switch"
                aria-checked={options.explainDefinitions}
                onClick={() => setOptions(o => ({...o, explainDefinitions: !o.explainDefinitions}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${options.explainDefinitions ? 'bg-[#32ff00]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${options.explainDefinitions ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-800">Model physics & engineering problems</span>
              <button
                type="button"
                role="switch"
                aria-checked={options.modelPhysicsEngineering}
                onClick={() => setOptions(o => ({...o, modelPhysicsEngineering: !o.modelPhysicsEngineering}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${options.modelPhysicsEngineering ? 'bg-[#32ff00]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${options.modelPhysicsEngineering ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-800">Show intermediate workings/steps</span>
              <button
                type="button"
                role="switch"
                aria-checked={options.showWorkings}
                onClick={() => setOptions(o => ({...o, showWorkings: !o.showWorkings}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${options.showWorkings ? 'bg-[#32ff00]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${options.showWorkings ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-800">Avoid direct answers</span>
              <button
                type="button"
                role="switch"
                aria-checked={options.avoidDirectAnswers}
                onClick={() => setOptions(o => ({...o, avoidDirectAnswers: !o.avoidDirectAnswers}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${options.avoidDirectAnswers ? 'bg-[#32ff00]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${options.avoidDirectAnswers ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-muted)]">
        These settings shape the context and constraints passed to the AI for students in your class.
      </div>
    </section>
  )
}


