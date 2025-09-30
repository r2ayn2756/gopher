import { removePII, sanitizeForAI } from '@/lib/security/sanitizer'
import { computeHintLevel } from './hint-manager'
import { buildSocraticPrompt, type AiRestrictions } from './prompts'

export type AIProvider = 'openai' | 'anthropic'

export type AIMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export type AIRequest = {
  subject?: string
  problemStatement?: string
  userText?: string
  history?: AIMessage[]
  attempts: number
  restrictions?: AiRestrictions
  avoidPhrases?: string[]
}

export type AIResponse = {
  text: string
  hintLevel: number
}

export class AIService {
  private provider: AIProvider
  constructor(provider?: AIProvider) {
    this.provider = provider || (process.env.AI_PROVIDER as AIProvider) || 'openai'
  }

  async generate(req: AIRequest): Promise<AIResponse> {
    const hintLevel = computeHintLevel({ attempts: req.attempts })
    const system = buildSocraticPrompt(
      req.subject,
      req.problemStatement,
      hintLevel,
      req.restrictions,
      req.avoidPhrases,
    )

    let messages: AIMessage[] = [{ role: 'system', content: system }]
    if (req.history && req.history.length) {
      const trimmed = req.history.slice(-10)
      const sanitized = trimmed.map((m) =>
        m.role === 'user'
          ? { ...m, content: sanitizeForAI(removePII(m.content)) }
          : m
      )
      messages = messages.concat(sanitized)
    } else if (req.userText) {
      const userContent = sanitizeForAI(removePII(req.userText))
      messages.push({ role: 'user', content: userContent })
    }

    const text = await this.callProvider(messages)
    return { text, hintLevel }
  }

  private async callProvider(messages: AIMessage[]): Promise<string> {
    // Use OpenAI by default. Anthropic support can be re-enabled later if needed.
    const { OpenAI } = await import('openai')
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY in server environment')
    }
    const client = new OpenAI({ apiKey })
    const model = (process.env.AI_MODEL || 'gpt-4o-mini').trim()
    try {
      const res = await client.chat.completions.create({
        model,
        temperature: 0.5,
        max_tokens: 200, // Reduce for faster responses
        messages: messages as any,
      }, {
        timeout: 15000, // 15s timeout to prevent hanging
      })
      const out = res.choices?.[0]?.message?.content?.trim() || 'What is your current approach?'
      return out
    } catch (err: any) {
      // Normalize common OpenAI API errors for clearer UI messages
      const status = err?.status || err?.code || err?.response?.status
      const detail = err?.message || err?.response?.data?.error?.message || 'Unknown error'
      if (status === 401) throw new Error('OpenAI authentication failed (401). Check OPENAI_API_KEY.')
      if (status === 429) throw new Error('OpenAI rate limit hit (429). Please wait and try again.')
      if (status === 404) throw new Error(`OpenAI model not found: ${model}. Set AI_MODEL or update your access.`)
      throw new Error(`OpenAI error: ${detail}`)
    }
  }
}


