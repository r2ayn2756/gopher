"use client"

import * as React from 'react'
import { TrendingUp, Users, Clock, Award } from 'lucide-react'

const STATS = [
  { icon: Clock, value: '[X]', label: 'Hours saved per teacher per week', color: 'from-blue-500/10 to-blue-500/5', iconColor: 'text-blue-600' },
  { icon: TrendingUp, value: '[X]%', label: 'Improvement in concept mastery', color: 'from-[#32ff00]/10 to-[#32ff00]/5', iconColor: 'text-[#064e00]' },
  { icon: Users, value: '[X]+', label: 'Schools using Gopher', color: 'from-purple-500/10 to-purple-500/5', iconColor: 'text-purple-600' },
  { icon: Award, value: '[X]k+', label: 'Students guided daily', color: 'from-orange-500/10 to-orange-500/5', iconColor: 'text-orange-600' },
]

export function SocialProof() {
  return (
    <section className="relative border-b border-[var(--color-border)] bg-gradient-to-b from-white via-gray-50/50 to-white py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#32ff00]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Stats section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-12">
            Trusted by educators <span className="text-[#32ff00]">nationwide</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(50,255,0,0.25)] hover:border-[#32ff00]/30"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} ${stat.iconColor} mb-4`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
