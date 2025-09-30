import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ensureEnvLoaded } from '@/lib/utils/env'

export async function GET() {
  ensureEnvLoaded()
  const raw = (process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '').trim()
  const hasKey = raw.length > 10
  const masked = hasKey ? `${raw.slice(0, 6)}...${raw.slice(-4)}` : ''

  // Inspect .env.local presence and key line (masked)
  const cwd = process.cwd()
  const envPath = path.join(cwd, '.env.local')
  let envFileFound = false
  let envFileMasked = ''
  try {
    const content = await readFile(envPath, 'utf8')
    envFileFound = true
    const match = content.match(/^(OPENAI_API_KEY|NEXT_PUBLIC_OPENAI_API_KEY)\s*=\s*(.+)$/m)
    if (match && match[2]) {
      const v = (match[2] || '').trim()
      envFileMasked = v.length > 10 ? `${v.slice(0, 6)}...${v.slice(-4)}` : '(present but too short)'
    }
  } catch {
    envFileFound = false
  }

  return NextResponse.json({
    ok: true,
    provider: 'openai',
    hasKey,
    masked,
    cwd,
    nodeEnv: process.env.NODE_ENV,
    aiProviderEnv: process.env.AI_PROVIDER || 'openai',
    envFileFound,
    envFileMasked,
  })
}


