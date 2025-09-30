export type HintContext = {
  attempts: number
  lastUpdatedAt?: number
  subject?: string
  stuckSinceMs?: number
  overrideLevel?: number
}

export function computeHintLevel(ctx: HintContext): number {
  if (ctx.overrideLevel) return clamp(ctx.overrideLevel, 1, 5)

  const base = Math.ceil(ctx.attempts / 2) // 1-2→1, 3-4→2, 5-6→3, 7-8→4, 9+→5
  let level = clamp(base, 1, 5)

  if (ctx.stuckSinceMs && ctx.stuckSinceMs > 5 * 60 * 1000) {
    level = clamp(level + 1, 1, 5)
  }

  // Subject-specific adjustments (placeholder hook)
  if (ctx.subject === 'math' && level < 5) level = level // no change now

  return level
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}


