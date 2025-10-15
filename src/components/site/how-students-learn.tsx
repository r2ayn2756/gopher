"use client"

import * as React from 'react'
import { MessageCircle, Lightbulb, TrendingUp } from 'lucide-react'

const steps = [
  {
    icon: MessageCircle,
    title: 'Student gets stuck',
    description: 'Instead of searching for answers online, they ask Gopher for help with their specific problem.',
    color: 'from-blue-500/10 to-blue-500/5',
    iconColor: 'text-blue-600',
  },
  {
    icon: Lightbulb,
    title: 'Gopher guides with questions',
    description: 'Rather than giving the answer, Gopher asks leading questions and provides hints to help them think through it.',
    color: 'from-yellow-500/10 to-yellow-500/5',
    iconColor: 'text-yellow-600',
  },
  {
    icon: TrendingUp,
    title: 'Real learning happens',
    description: 'Students build genuine understanding by working through the problem themselves. Knowledge that sticks.',
    color: 'from-[#32ff00]/10 to-[#32ff00]/5',
    iconColor: 'text-[#064e00]',
  },
]

export function HowStudentsLearn() {
  const [activeStep, setActiveStep] = React.useState(0)
  const sectionRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // Cycle through steps when in view
          let current = 0
          const interval = setInterval(() => {
            current = (current + 1) % steps.length
            setActiveStep(current)
          }, 3000)

          return () => clearInterval(interval)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how" ref={sectionRef} className="relative border-b border-[var(--color-border)] bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#32ff00]/5 blur-3xl" />
        <div className="absolute right-1/3 bottom-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Learning that <span className="text-[#32ff00]">sticks</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to deeper understanding
          </p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1">
            <div className="mx-auto max-w-4xl">
              <div className="h-full bg-gradient-to-r from-blue-500/20 via-yellow-500/20 to-[#32ff00]/20 rounded-full" />
              {/* Progress indicator */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-[#32ff00] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = i === activeStep

              return (
                <div
                  key={step.title}
                  className={`relative transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100 opacity-70 md:opacity-100'}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Card */}
                  <div className={`relative rounded-3xl border bg-white p-8 shadow-sm transition-all duration-500 ${
                    isActive
                      ? 'border-[#32ff00]/50 shadow-[0_20px_60px_-24px_rgba(50,255,0,0.4)] -translate-y-2'
                      : 'border-[var(--color-border)] hover:border-[#32ff00]/30 hover:-translate-y-1'
                  }`}>
                    {/* Step number */}
                    <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#32ff00] text-sm font-bold text-[#064e00] shadow-sm">
                      {i + 1}
                    </div>

                    {/* Icon */}
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} ${step.iconColor} transition-all duration-300 ${
                      isActive ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                    }`}>
                      <Icon size={32} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <h3 className="mt-6 text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <div className="h-2 w-2 rounded-full bg-[#32ff00] animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Arrow (desktop only, except last item) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-20 -right-4 z-10">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-40'}`}>
                        <path d="M8 16h16m0 0l-6-6m6 6l-6 6" stroke={isActive ? '#32ff00' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress dots (mobile) */}
        <div className="flex md:hidden justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeStep ? 'w-8 bg-[#32ff00]' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
