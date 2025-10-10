"use client"

import * as React from 'react'
import { BarChart3, Lightbulb, ShieldCheck, Zap } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'Save hours every week',
    description: 'Students get unstuck 24/7 without waiting for office hours. Spend less time re-explaining, more time making an impact.',
    stat: '[X] hours saved per teacher per week',
  },
  {
    icon: BarChart3,
    title: 'Understand what students need',
    description: 'See real-time analytics on which topics students ask about most. Identify struggling concepts before the next test.',
    stat: 'Track trends across [X] schools',
  },
  {
    icon: ShieldCheck,
    title: 'Academic integrity built-in',
    description: 'Guides thinking instead of giving answers. Students can\'t copy—they have to understand. Perfect for homework and exams.',
    stat: '[X]% reduction in copied work',
  },
  {
    icon: Zap,
    title: 'Zero training required',
    description: 'Students start learning immediately. No complicated setup, no new workflow. Just share the link and they\'re ready.',
    stat: 'Setup in under [X] minutes',
  },
]

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

export function ForTeachers() {
  return (
    <section className="relative border-b border-[var(--color-border)] bg-white py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#32ff00]/5 blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#32ff00]/20 bg-[#32ff00]/5 px-4 py-2 text-sm font-semibold text-[#064e00] mb-4">
            <Lightbulb size={16} />
            For Educators & Administrators
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Built for educators, <span className="relative">
              <span className="relative z-10">not just students</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#32ff00]/30 -z-0"></span>
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We understand how hard teaching can be. Gopher helps you make a difference in students' lives.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="group relative rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-24px_rgba(50,255,0,0.35)] hover:border-[#32ff00]/50"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#32ff00]/0 to-[#32ff00]/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-[#32ff00]/10 group-hover:to-[#32ff00]/5 group-hover:opacity-100" />

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#32ff00]/10 to-[#32ff00]/5 text-[#064e00] transition-all duration-300 group-hover:scale-110 group-hover:from-[#32ff00]/20 group-hover:to-[#32ff00]/10">
                  <Icon size={28} strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Stat placeholder */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#32ff00]/20 bg-[#32ff00]/5 px-3 py-1 text-xs font-semibold text-[#064e00]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#32ff00] animate-pulse" />
                  {benefit.stat}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
