import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

function parseDotEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    // Remove surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1)
    }
    if (key && !(key in out)) out[key] = val
  }
  return out
}

export function ensureEnvLoaded() {
  // No-op in the browser: client env is statically injected at build time
  if (typeof window !== 'undefined') return

  // If keys already present, skip
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return

  const cwd = process.cwd()
  const parent = path.resolve(cwd, '..')
  const candidates = [
    path.join(cwd, '.env.local'),
    path.join(cwd, '.env.development.local'),
    path.join(cwd, '.env'),
    path.join(parent, '.env.local'),
    path.join(parent, '.env.development.local'),
    path.join(parent, '.env'),
  ]

  for (const envPath of candidates) {
    try {
      if (!existsSync(envPath)) continue
      let raw = readFileSync(envPath, 'utf8')
      // Strip BOM if present
      if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1)
      }
      const kv = parseDotEnv(raw)
      for (const [k, v] of Object.entries(kv)) {
        if (!process.env[k]) process.env[k] = v
      }
      // If we successfully loaded required keys, stop searching
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return
    } catch {
      // ignore and try next candidate
    }
  }
}


