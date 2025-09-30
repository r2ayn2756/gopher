import { NextResponse } from 'next/server'
import { ensureEnvLoaded } from '@/lib/utils/env'

function mask(v?: string | null) {
  if (!v) return ''
  const t = v.trim()
  if (t.length < 12) return '(too short)'
  return `${t.slice(0, 6)}...${t.slice(-4)}`
}

export async function GET() {
  ensureEnvLoaded()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  return NextResponse.json({
    cwd: process.cwd(),
    hasUrl: Boolean(url),
    hasAnon: anon.length > 10,
    hasService: service.length > 10,
    urlMasked: url,
    anonMasked: mask(anon),
    serviceMasked: mask(service),
  })
}


