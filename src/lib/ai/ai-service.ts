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

  async sendMessage(messages: AIMessage[]): Promise<string> {
    return await this.callProviderForAnalysis(messages)
  }

  async analyzeStudentConversations(questions: string[]): Promise<{
    summary: string
    strugglingTopics: string[]
    teachingRecommendations: string[]
    commonMisconceptions: string[]
    engagementLevel: 'low' | 'medium' | 'high'
  }> {
    if (!questions || questions.length === 0) {
      return {
        summary: 'No student activity to analyze.',
        strugglingTopics: [],
        teachingRecommendations: [],
        commonMisconceptions: [],
        engagementLevel: 'low'
      }
    }

    const systemPrompt = `You are an expert educational analyst helping teachers understand their students' learning patterns.

Analyze the following student questions and provide actionable insights for the teacher.

Your response must be in valid JSON format with this exact structure:
{
  "summary": "A brief 1-2 sentence overview of student activity and engagement",
  "strugglingTopics": ["topic1", "topic2", "topic3"],
  "teachingRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "commonMisconceptions": ["misconception1", "misconception2"],
  "engagementLevel": "low|medium|high"
}

Guidelines:
- Be specific and actionable in recommendations
- Focus on patterns, not individual questions
- Identify subject areas where students need more support
- Suggest concrete teaching strategies
- Keep each item concise (1 sentence max)
- Engagement: low (< 5 questions), medium (5-15), high (> 15)`

    const userPrompt = `Student Questions:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nProvide your analysis in JSON format.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    try {
      const response = await this.callProviderForAnalysis(messages)

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI')
      }

      const analysis = JSON.parse(jsonMatch[0])

      return {
        summary: analysis.summary || 'Analysis completed.',
        strugglingTopics: Array.isArray(analysis.strugglingTopics) ? analysis.strugglingTopics.slice(0, 5) : [],
        teachingRecommendations: Array.isArray(analysis.teachingRecommendations) ? analysis.teachingRecommendations.slice(0, 5) : [],
        commonMisconceptions: Array.isArray(analysis.commonMisconceptions) ? analysis.commonMisconceptions.slice(0, 3) : [],
        engagementLevel: ['low', 'medium', 'high'].includes(analysis.engagementLevel) ? analysis.engagementLevel : 'medium'
      }
    } catch (error) {
      console.error('Error analyzing student conversations:', error)
      // Return fallback analysis
      return {
        summary: `Analyzed ${questions.length} student questions.`,
        strugglingTopics: [],
        teachingRecommendations: ['Continue monitoring student questions for patterns'],
        commonMisconceptions: [],
        engagementLevel: questions.length > 15 ? 'high' : questions.length > 5 ? 'medium' : 'low'
      }
    }
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

  private async callProviderForAnalysis(messages: AIMessage[]): Promise<string> {
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
        temperature: 0.3, // Lower temperature for more consistent JSON
        max_tokens: 1000, // More tokens for detailed analysis
        messages: messages as any,
        response_format: { type: 'json_object' } // Request JSON format
      }, {
        timeout: 30000, // 30s timeout for analysis
      })
      const out = res.choices?.[0]?.message?.content?.trim() || '{}'
      return out
    } catch (err: any) {
      const status = err?.status || err?.code || err?.response?.status
      const detail = err?.message || err?.response?.data?.error?.message || 'Unknown error'
      if (status === 401) throw new Error('OpenAI authentication failed (401). Check OPENAI_API_KEY.')
      if (status === 429) throw new Error('OpenAI rate limit hit (429). Please wait and try again.')
      if (status === 404) throw new Error(`OpenAI model not found: ${model}. Set AI_MODEL or update your access.`)
      throw new Error(`OpenAI error: ${detail}`)
    }
  }
}


