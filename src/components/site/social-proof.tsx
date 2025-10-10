"use client"

import * as React from 'react'
import { TrendingUp, Users, Clock, Award } from 'lucide-react'

type Testimonial = {
  quote: string
  author: string
  role: string
}

const TESTIMONIALS: Testimonial[] = [
  { quote: 'Gopher helps my students think for themselves. I finally have time to focus on the students who need me most.', author: 'Alicia R.', role: '8th Grade Science Teacher' },
  { quote: 'The nudges are just right—no shortcuts. My students are actually learning, not just getting answers.', author: 'Marcus T.', role: 'Algebra II Instructor' },
  { quote: 'Finally, an AI tool I can confidently use in class. The analytics help me spot struggling concepts before test day.', author: 'Priya S.', role: 'Instructional Coach' },
  { quote: 'Setup took 5 minutes. Students love it. Academic integrity stays intact. What more could I ask for?', author: 'James L.', role: 'AP Calculus Teacher' },
]

const STATS = [
  { icon: Clock, value: '[X]', label: 'Hours saved per teacher per week', color: 'from-blue-500/10 to-blue-500/5', iconColor: 'text-blue-600' },
  { icon: TrendingUp, value: '[X]%', label: 'Improvement in concept mastery', color: 'from-[#32ff00]/10 to-[#32ff00]/5', iconColor: 'text-[#064e00]' },
  { icon: Users, value: '[X]+', label: 'Schools using Gopher', color: 'from-purple-500/10 to-purple-500/5', iconColor: 'text-purple-600' },
  { icon: Award, value: '[X]k+', label: 'Students guided daily', color: 'from-orange-500/10 to-orange-500/5', iconColor: 'text-orange-600' },
]

export function SocialProof() {
  const [activeTestimonial, setActiveTestimonial] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

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

        {/* Testimonials section */}
        <div className="mt-20">
          <h3 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            What educators say
          </h3>

          {/* Testimonial carousel */}
          <div className="relative mx-auto max-w-4xl">
            <div className="relative min-h-[200px] md:min-h-[160px]">
              {TESTIMONIALS.map((testimonial, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-700 ${
                    i === activeTestimonial
                      ? 'opacity-100 translate-x-0'
                      : i < activeTestimonial
                      ? 'opacity-0 -translate-x-full pointer-events-none'
                      : 'opacity-0 translate-x-full pointer-events-none'
                  }`}
                >
                  <div className="rounded-3xl border-2 border-[#32ff00]/30 bg-white/90 backdrop-blur p-8 md:p-10 shadow-[0_8px_60px_-12px_rgba(50,255,0,0.25)]">
                    <div className="flex items-start gap-4">
                      {/* Quote icon */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#32ff00]/10 text-[#064e00]">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-4">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#32ff00]/20 to-[#32ff00]/10 flex items-center justify-center text-[#064e00] font-bold text-sm">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{testimonial.author}</div>
                            <div className="text-sm text-gray-600">{testimonial.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? 'w-8 bg-[#32ff00]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
