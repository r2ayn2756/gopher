"use client"

import * as React from 'react'

type Testimonial = {
  quote: string
  author: string
  role: string
}

const ITEMS: Testimonial[] = [
  { quote: 'Gopher helps my students think for themselves.', author: 'Alicia R.', role: '8th Grade Science' },
  { quote: 'The nudges are just right—no shortcuts.', author: 'Marcus T.', role: 'Algebra II' },
  { quote: 'Finally, an AI I can use in class.', author: 'Priya S.', role: 'Instructional Coach' },
]

export function Testimonials() {
  const [index, setIndex] = React.useState(0)
  const total = ITEMS.length

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 5000)
    return () => clearInterval(id)
  }, [total])

  return (
    <section className="border-b border-[rgba(50,255,0,0.2)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-gray-900 md:text-3xl">What educators say</h2>
        <div className="relative mt-8 overflow-hidden">
          <div className="relative flex w-full items-stretch">
            {ITEMS.map((t, i) => (
              <article key={i} className={`min-w-0 flex-1 transition-opacity duration-500 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0 absolute inset-0'}`}>
                <div className="mx-auto max-w-3xl rounded-2xl border border-[#32ff00]/20 bg-white/70 p-8 text-center shadow-[0_8px_60px_-12px_rgba(50,255,0,0.25)] backdrop-blur">
                  <p className="text-lg text-gray-800">“{t.quote}”</p>
                  <div className="mt-4 text-sm text-gray-600">— {t.author}, {t.role}</div>
                </div>
              </article>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {ITEMS.map((_, i) => (
              <button key={i} aria-label={`Go to testimonial ${i + 1}`} onClick={() => setIndex(i)} className={`h-2 w-6 rounded-full transition ${i === index ? 'bg-[#32ff00]' : 'bg-[#32ff00]/30 hover:bg-[#32ff00]/60'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}



