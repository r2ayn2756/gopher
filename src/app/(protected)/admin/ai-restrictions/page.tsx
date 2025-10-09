"use client"
import * as React from 'react'
import { AiRestrictionsSection } from '@/components/admin/ai-restrictions-section'

export default function AdminAiRestrictionsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 text-black">
      <h1 className="text-2xl font-semibold text-gray-900">AI Restrictions</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Configure how AI guidance behaves for your class. Changes will apply to your students.</p>
      <AiRestrictionsSection />
    </div>
  )
}


