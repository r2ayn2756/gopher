"use client"

import * as React from 'react'
import { MessageCircleQuestion, BarChart3, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: MessageCircleQuestion,
    title: 'Socratic by design',
    description: 'Never gives answers—only asks questions and provides hints. Students build genuine understanding by thinking through problems themselves.',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-500/10 to-blue-500/5',
  },
  {
    icon: BarChart3,
    title: 'Admin analytics dashboard',
    description: 'See what topics students ask about most, identify struggling concepts early, and make data-driven curriculum decisions.',
    gradient: 'from-[#32ff00] to-[#28dd00]',
    bgGradient: 'from-[#32ff00]/10 to-[#32ff00]/5',
  },
  {
    icon: Shield,
    title: 'Privacy & compliance first',
    description: 'FERPA & COPPA compliant. Zero PII sent to AI providers. All processing happens server-side with enterprise-grade security.',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-500/10 to-purple-500/5',
  },
  {
    icon: Zap,
    title: 'Works across all subjects',
    description: 'Math, science, history, literature—Gopher provides Socratic guidance for any high school subject. One tool for everything.',
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-500/10 to-orange-500/5',
  },
]

export function KeyFeatures() {
  return (
    <section className="relative border-b border-[var(--color-border)] bg-white py-20">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(50, 255, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(50, 255, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px'
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Everything you need in <span className="text-[#32ff00]">one platform</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features that help students learn and give educators insights
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_rgba(50,255,0,0.3)] hover:border-[#32ff00]/40"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Animated gradient background on hover */}
                <div className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${feature.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                {/* Icon with gradient */}
                <div className="relative mb-6">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon size={32} strokeWidth={2} />
                  </div>
                  {/* Glow effect behind icon */}
                  <div className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-xl transition-all duration-500 group-hover:opacity-40`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center gap-2 text-[#32ff00] font-semibold text-sm opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span>Learn more</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
