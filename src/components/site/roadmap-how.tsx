"use client"

import * as React from 'react'

type Step = {
  title: string
  desc: string
}

const STEPS: Step[] = [
  { title: 'The reality: shortcut answers', desc: 'Students lean on answer‑giving AI. Learning suffers.' },
  { title: 'Reduce access to cheating AI', desc: 'Policy, filters, and norms limit quick‑answer tools.' },
  { title: 'Introduce Gopher in class & homework', desc: 'Socratic guidance when students get stuck—not answers.' },
  { title: 'Mastery grows with guided practice', desc: 'Students think through problems and explain their steps.' },
]

const PATH_D = "M20,320 C220,220 360,380 540,300 S900,220 1180,260"

export function RoadmapHow() {
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const pathRef = React.useRef<SVGPathElement | null>(null)
  const [length, setLength] = React.useState(1)
  const [progress, setProgress] = React.useState(0)
  const [displayProgress, setDisplayProgress] = React.useState(0)
  const [cardPositions, setCardPositions] = React.useState<{x:number;y:number}[]>([])

  React.useEffect(() => {
    const compute = () => {
      const path = pathRef.current
      if (!path) return
      const L = path.getTotalLength()
      setLength(L)
      // Fractions along path for 4 steps
      const fracs = [0.06, 0.35, 0.62, 0.92]
      const pts = fracs.map(f => path.getPointAtLength(L * f))
      // Offsets to keep cards from overlapping the path
      const offs = [ {x:0,y:60}, {x:0,y:-110}, {x:0,y:70}, {x:0,y:-100} ]
      setCardPositions(pts.map((p, i) => ({ x: (p?.x ?? 0) + (offs[i]?.x ?? 0), y: (p?.y ?? 0) + (offs[i]?.y ?? 0) })))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  // Timed animation: finishes quickly after the section enters view
  React.useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1)
      setDisplayProgress(1)
      return
    }
    let raf = 0
    let startTs = 0
    const ANIM_MS = 1800
    const io = new IntersectionObserver((entries) => {
      const e = entries?.[0]
      if (e && e.isIntersecting) {
        // start once, ignore subsequent
        if (startTs) return
        startTs = performance.now()
        const tick = (ts: number) => {
          const t = Math.min(1, (ts - startTs) / ANIM_MS)
          setProgress(t)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    io.observe(el)
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [])

  // Smooth the visual progress with easing (lerp) for the tracker and path
  React.useEffect(() => {
    let raf = 0
    const tick = () => {
      setDisplayProgress((prev) => {
        const next = prev + (progress - prev) * 0.18
        if (Math.abs(next - progress) < 0.002) {
          return progress
        }
        raf = requestAnimationFrame(tick)
        return next
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  // Step thresholds evenly across progress 0..1 so the last step appears at 1.0
  const stepThreshold = (i: number) => (i / (STEPS.length - 1))
  const activeIndex = Math.max(0, Math.min(
    STEPS.length - 1,
    Math.floor(progress * (STEPS.length - 1) + 0.0001)
  ))

  return (
    <section id="how" ref={sectionRef as any} className="border-b border-[var(--color-border)] bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-gray-900">How it works</h2>

        {/* Desktop winding map */}
        <div className="relative mt-10 hidden h-[420px] w-full md:block">
          <svg viewBox="0 0 1200 400" className="absolute inset-0 h-full w-full">
            {/* Background dotted path */}
            <path
              ref={pathRef as any}
              d={PATH_D}
              fill="none"
              stroke="#32ff00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 10"
              opacity={0.3}
            />
            {/* Drawing overlay (solid) */}
            <path
              d={PATH_D}
              fill="none"
              stroke="#32ff00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${length}`}
              strokeDashoffset={`${length * (1 - displayProgress)}`}
              style={{ transition: 'stroke-dashoffset 60ms linear' }}
              opacity={0.85}
            />

            {/* Tracker dot */}
            {length > 1 && (() => {
              const path = pathRef.current
              const t = Math.max(0, Math.min(length, length * displayProgress))
              const pt = path ? path.getPointAtLength(t) : { x: 0, y: 0 }
              const prev = path ? path.getPointAtLength(Math.max(0, t - 2)) : { x: 0, y: 0 }
              const angle = Math.atan2(pt.y - prev.y, pt.x - prev.x) * 180 / Math.PI
              return (
                <g style={{ transform: `translate(${pt.x}px, ${pt.y}px) rotate(${angle}deg)`, transformOrigin: '0 0' }}>
                  <polygon points="0,0 -12,6 -12,-6" fill="#32ff00" stroke="black" strokeOpacity="0.15" strokeWidth="1.5" />
                </g>
              )
            })()}
          </svg>

          {/* Step cards positioned along the path */}
          {STEPS.map((s, i) => {
            const thr = stepThreshold(i)
            const visible = progress >= thr - 0.001
            return (
            <div
              key={`${s.title}-${i}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[320px] rounded-2xl border bg-white p-6 shadow-sm transition duration-300 ease-out ${visible ? 'opacity-100 scale-100 border-[#32ff00]/40 shadow-[0_12px_32px_-24px_rgba(50,255,0,0.25)] ring-1 ring-[#32ff00]/20 hover:-translate-y-2 hover:shadow-[0_22px_60px_-24px_rgba(50,255,0,0.35)] hover:ring-[#32ff00]/40 cursor-pointer' : 'pointer-events-none opacity-0 scale-95 border-[var(--color-border)]'}`}
              style={{ left: `${cardPositions[i]?.x ?? 0}px`, top: `${cardPositions[i]?.y ?? 0}px` }}
            >
              <div className="text-[15px] font-semibold text-gray-900">{s.title}</div>
              <div className="mt-2 text-[13px] text-gray-600">{s.desc}</div>
            </div>
          )})}
        </div>

        {/* Mobile vertical fallback */}
        <div className="md:hidden">
          <ol className="relative ml-4 border-l border-[var(--color-border)]">
            {STEPS.slice(0, activeIndex + 1).map((s, i) => (
              <li key={`${s.title}-${i}`} className="relative pl-6 py-4">
                <span className={`absolute -left-1.5 top-5 h-3 w-3 rounded-full bg-[#32ff00]`} />
                <div className={`rounded-xl border bg-white p-5 text-[15px] border-[#32ff00]/40 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-24px_rgba(50,255,0,0.35)] hover:ring-1 hover:ring-[#32ff00]/30 cursor-pointer`}>
                  <div className="font-semibold text-gray-900">{s.title}</div>
                  <div className="mt-1 text-[13px] text-gray-600">{s.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <style jsx>{`
          @media (prefers-reduced-motion: reduce) {
            svg path { transition: none !important; }
          }
        `}</style>
      </div>
    </section>
  )
}


