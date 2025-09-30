export function removePII(text: string): string {
  let out = text
  out = out.replace(/\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[email]')
  out = out.replace(/\b\+?\d[\d\s().-]{7,}\b/g, '[phone]')
  out = out.replace(/\b\d{1,5}\s+[A-Za-z0-9'.\-\s]+\b/g, '[address]')
  return out
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function sanitizeForAI(text: string): string {
  const withoutPII = removePII(text)
  // Basic prompt injection guardrails
  return withoutPII.replace(/(?<=\n|^)\s*ignore\s+previous\s+instructions.*$/gim, '[instruction removed]')
}

export function anonymizeUser<T extends Record<string, unknown>>(userData: T): T {
  const clone = { ...userData }
  for (const key of Object.keys(clone)) {
    if (/name|email|phone|address|id/i.test(key)) (clone as any)[key] = undefined
  }
  return clone
}

export function validateMessageContent(text: string): { ok: boolean; reason?: string } {
  if (text.length > 1000) return { ok: false, reason: 'Message too long' }
  if (/\b(?:(?:kill|suicide)|(?:credit\s*card))\b/i.test(text)) return { ok: false, reason: 'Inappropriate content' }
  return { ok: true }
}


