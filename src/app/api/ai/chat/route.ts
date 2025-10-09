import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseService } from '@/lib/supabase/service'
import { AIService } from '@/lib/ai/ai-service'
import { validateMessageContent } from '@/lib/security/sanitizer'

const BodySchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(1000),
})

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const admin = createSupabaseService()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await req.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 })

    const { conversationId, message } = parsed.data
    const validation = validateMessageContent(message)
    if (!validation.ok) return NextResponse.json({ error: validation.reason }, { status: 400 })

    // Load conversation and messages
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select('id, user_id, subject, problem_statement, metadata')
      .eq('id', conversationId as any)
      .single()
    if (convErr || !conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((conversation as any).user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Determine attempts from message count (use limit for faster query)
    const { data: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'estimated', head: true })
      .eq('conversation_id', conversationId as any)
      .limit(1)
    const count = messageCount || 0

    // Save user message (requires service role per RLS)
    await admin.from('messages').insert({
      conversation_id: conversationId,
      role: 'user' as any,
      content: message,
    } as any)

    // Load recent conversation history (including the new user message)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId as any)
      .order('created_at', { ascending: false })
      .limit(10) // Reduce to 10 for faster queries and AI context efficiency

    const history = (recentMessages || []).reverse().map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    // Load teacher restrictions by class_code for this student (cached lookup)
    let restrictions: any = null
    try {
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('class_code')
        .eq('id', (conversation as any).user_id as any)
        .single()
      const classCode = (studentProfile as any)?.class_code
      if (classCode) {
        const { data: teacher } = await admin
          .from('teacher_settings')
          .select('settings')
          .eq('class_code', classCode)
          .single()
        restrictions = (teacher as any)?.settings ?? null
      }
    } catch {
      // Fallback to no restrictions if lookup fails to avoid blocking AI response
      restrictions = null
    }

    // Extract a small set of recent assistant/user phrase stems to avoid repeating verbatim
    const lastPhrases = (recentMessages || [])
      .slice(-6)
      .map((m: any) => (m.content || ''))
      .flatMap((c: string) => c.split(/\.|!|\?/).map(s => s.trim()))
      .filter((s: string) => Boolean(s) && s.length >= 4)
      .filter((s: string) => !/interesting question/i.test(s))
      .slice(-12)

    const ai = new AIService()
    const aiResp = await ai.generate({
      subject: (conversation as any).subject ?? undefined,
      problemStatement: (conversation as any).problem_statement ?? undefined,
      history: history as any,
      attempts: history.length || (typeof count === 'number' ? count + 1 : 1),
      restrictions: restrictions || undefined,
      avoidPhrases: lastPhrases,
    })

    // Save assistant message (requires service role per RLS)
    await admin.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant' as any,
      content: aiResp.text,
      hint_level: aiResp.hintLevel,
    } as any)

    // Update analytics (basic)
    await admin.from('analytics').insert({
      user_id: user.id,
      event_type: 'ai_response' as any,
      event_data: { conversation_id: conversationId, hint_level: aiResp.hintLevel },
    } as any)

    return NextResponse.json({ reply: aiResp.text, hintLevel: aiResp.hintLevel })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}


