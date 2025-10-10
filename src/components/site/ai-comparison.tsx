"use client"

import * as React from 'react'
import { Bot, Lightbulb, MessageSquare, Sparkles } from 'lucide-react'

export function AIComparison() {
  const [activeStep, setActiveStep] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  const normalAISteps = [
    { role: 'user', text: 'How do I solve x² + 5x + 6 = 0?' },
    { role: 'ai', text: 'The solutions are x = -2 and x = -3. Here\'s the complete work:\n\nUsing factoring: (x + 2)(x + 3) = 0\nTherefore x = -2 or x = -3' },
  ]

  const gopherSteps = [
    { role: 'user', text: 'How do I solve x² + 5x + 6 = 0?' },
    { role: 'gopher', text: 'Great question! What method have you learned for solving quadratic equations?', hint: 1 },
    { role: 'user', text: 'Factoring?' },
    { role: 'gopher', text: 'Exactly! For factoring, we need two numbers that multiply to 6 and add to 5. What numbers might work?', hint: 2 },
    { role: 'user', text: '2 and 3?' },
    { role: 'gopher', text: 'Perfect! Now can you write the factored form using those numbers?', hint: 3 },
  ]

  React.useEffect(() => {
    if (isPaused) return
    const maxSteps = Math.max(normalAISteps.length, gopherSteps.length)
    if (activeStep < maxSteps - 1) {
      const timer = setTimeout(() => setActiveStep(prev => prev + 1), 2500)
      return () => clearTimeout(timer)
    } else {
      const resetTimer = setTimeout(() => setActiveStep(0), 3000)
      return () => clearTimeout(resetTimer)
    }
  }, [activeStep, isPaused])

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-b from-white via-gray-50/30 to-white py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#32ff00]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#32ff00]/10 px-4 py-2 text-sm font-semibold text-[#064e00] mb-4">
            <Sparkles size={16} />
            Powered by Claude AI
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Not just <span className="relative">
              <span className="relative z-10">smarter</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#32ff00]/30 -z-0"></span>
            </span>, but <span className="text-[#32ff00]">better</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See the difference between getting answers and actually learning
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Regular AI Side */}
          <div
            className="relative rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Bot size={20} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Traditional AI</h3>
                  <p className="text-xs text-gray-500">Instant answers</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 min-h-[400px]">
              {normalAISteps.slice(0, activeStep + 1).map((step, idx) => (
                <div
                  key={idx}
                  className={`animate-fadeIn ${
                    step.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      step.role === 'user'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100/50 text-gray-900 border border-blue-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {activeStep >= normalAISteps.length - 1 && (
              <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-900">Problem</p>
                    <p className="text-xs text-red-700 mt-1">Student copies answer without understanding the process</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gopher Side */}
          <div
            className="relative rounded-3xl border-2 border-[#32ff00] bg-white p-6 shadow-[0_8px_32px_rgba(50,255,0,0.2)]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Highlight badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#32ff00] text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
              ✨ The Gopher Way
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#32ff00]/10">
                  <img src="/gopher-logo.png" alt="Gopher" className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Gopher AI</h3>
                  <p className="text-xs text-gray-600">Socratic guidance</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 min-h-[400px]">
              {gopherSteps.slice(0, activeStep + 1).map((step, idx) => (
                <div
                  key={idx}
                  className={`animate-fadeIn ${
                    step.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div className="max-w-[85%]">
                    {step.role === 'gopher' && step.hint && (
                      <div className="mb-1 flex items-center gap-1.5 text-xs">
                        <Lightbulb size={12} className="text-[#32ff00]" />
                        <span className="font-semibold text-[#064e00]">Hint Level {step.hint}</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        step.role === 'user'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-gradient-to-br from-[#32ff00]/10 to-[#32ff00]/5 text-gray-900 border border-[#32ff00]/30'
                      }`}
                    >
                      <p className="text-sm">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeStep >= gopherSteps.length - 1 && (
              <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-green-900">Success</p>
                    <p className="text-xs text-green-700 mt-1">Student builds understanding step-by-step</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center items-center gap-2">
          {[...Array(Math.max(normalAISteps.length, gopherSteps.length))].map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx <= activeStep ? 'w-8 bg-[#32ff00]' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Claude Attribution */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50">
              <svg className="h-7 w-7 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Powered by Claude</p>
              <p className="text-xs text-gray-600">Advanced AI from Anthropic</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
