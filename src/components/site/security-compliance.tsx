"use client"

import * as React from 'react'
import { ShieldCheck, Lock, Eye, FileCheck } from 'lucide-react'

export function SecurityCompliance() {
  return (
    <section id="security" className="relative border-b border-[var(--color-border)] bg-white py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(50, 255, 0, 0.08) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#32ff00]/20 bg-[#32ff00]/5 px-4 py-2 text-sm font-semibold text-[#064e00] mb-4">
            <ShieldCheck size={16} />
            Enterprise-Grade Security
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            District-approved <span className="text-[#32ff00]">security</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Built with privacy by design. FERPA & COPPA compliant from day one.
          </p>
        </div>

        {/* Two-column compliance cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* FERPA */}
          <div className="group relative rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-24px_rgba(50,255,0,0.35)] hover:border-[#32ff00]/50">
            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#32ff00]/0 to-[#32ff00]/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-[#32ff00]/10 group-hover:to-[#32ff00]/5 group-hover:opacity-100" />

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32ff00]/10 text-[#064e00]">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">FERPA Compliance</h3>
            </div>

            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Zero PII to AI providers:</span> All prompts anonymized and sanitized server-side before processing</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Row-level security:</span> Students access only their data; admins have governed oversight</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Server-side tokens only:</span> API keys never exposed to browsers</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Complete audit trail:</span> Session logs available for export upon authorized request</span>
              </li>
            </ul>
          </div>

          {/* COPPA */}
          <div className="group relative rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-24px_rgba(50,255,0,0.35)] hover:border-[#32ff00]/50">
            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#32ff00]/0 to-[#32ff00]/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-[#32ff00]/10 group-hover:to-[#32ff00]/5 group-hover:opacity-100" />

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#32ff00]/10 text-[#064e00]">
                <Eye size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">COPPA & Child Safety</h3>
            </div>

            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">School/parent consent:</span> Accounts provisioned by schools with verifiable authorization</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Data minimization:</span> Collect only what's necessary for learning—no behavioral advertising</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Content guardrails:</span> Multi-layer safety checks on all inputs and outputs</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#32ff00]/20 text-[#064e00] flex-shrink-0">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><span className="font-semibold">Secure sessions:</span> Strict cookie settings, token rotation, and regular security reviews</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges / additional info */}
        <div className="flex flex-wrap justify-center gap-4 items-center">
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-gray-50 px-4 py-2 text-sm text-gray-700">
            <FileCheck size={16} className="text-[#064e00]" />
            <span className="font-medium">SOC 2 [Type X] Certified</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-gray-50 px-4 py-2 text-sm text-gray-700">
            <ShieldCheck size={16} className="text-[#064e00]" />
            <span className="font-medium">Annual Security Audits</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-gray-50 px-4 py-2 text-sm text-gray-700">
            <Lock size={16} className="text-[#064e00]" />
            <span className="font-medium">AES-256 Encryption</span>
          </div>
        </div>
      </div>
    </section>
  )
}
