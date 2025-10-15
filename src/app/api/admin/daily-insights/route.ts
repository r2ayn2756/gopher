import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { AIService } from '@/lib/ai/ai-service'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role and get class_code
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, class_code')
      .eq('id', user.id)
      .single()

    if (!profile || (profile as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClassCode = (profile as any)?.class_code

    // CRITICAL: Reject NULL or empty class codes to prevent data leakage
    if (!adminClassCode || adminClassCode.trim() === '') {
      console.warn('Admin has no class code or empty class code, returning empty results')
      return NextResponse.json({ insights: [] })
    }

    // Get time range from query params (default to last 7 days)
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get student user IDs in the admin's class
    const { data: studentsInClass } = await supabase
      .from('profiles')
      .select('id')
      .eq('class_code', adminClassCode)
      .eq('role', 'student')

    if (!studentsInClass || studentsInClass.length === 0) {
      return NextResponse.json({ insights: [] })
    }

    const studentUserIds = studentsInClass.map((s: any) => s.id)

    // Get conversation IDs for students in the admin's class
    const { data: conversationIds } = await supabase
      .from('conversations')
      .select('id')
      .in('user_id', studentUserIds)

    if (!conversationIds || conversationIds.length === 0) {
      return NextResponse.json({ insights: [] })
    }

    // Get all student messages from the last N days
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        content,
        created_at,
        conversations!messages_conversation_id_fkey(
          user_id,
          profiles!conversations_user_id_fkey(full_name, username)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('role', 'user')
      .in('conversation_id', conversationIds.map((c: any) => c.id))
      .order('created_at', { ascending: true })

    if (!messages || messages.length === 0) {
      return NextResponse.json({ insights: [] })
    }

    // Group messages by day and generate insights
    const dailyInsights = new Map<string, {
      date: string
      totalQuestions: number
      uniqueStudents: Set<string>
      sampleQuestions: string[]
      topTopics: { topic: string; count: number }[]
    }>()

    messages.forEach((msg: any) => {
      const date = new Date(msg.created_at)
      const dateKey = date.toISOString().split('T')[0] || date.toISOString() // YYYY-MM-DD format

      if (!dailyInsights.has(dateKey)) {
        dailyInsights.set(dateKey, {
          date: dateKey,
          totalQuestions: 0,
          uniqueStudents: new Set(),
          sampleQuestions: [],
          topTopics: []
        })
      }

      const dayData = dailyInsights.get(dateKey)!
      dayData.totalQuestions++
      dayData.uniqueStudents.add(msg.conversations?.user_id)

      // Add to sample questions (limit to 3 per day)
      if (dayData.sampleQuestions.length < 3) {
        dayData.sampleQuestions.push(msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''))
      }
    })

    // Convert to array and use AI to generate insights
    const aiService = new AIService()
    const insightsWithAI = await Promise.all(
      Array.from(dailyInsights.entries()).map(async ([dateKey, data]) => {
        // Use AI to analyze student questions for this day
        let aiAnalysis
        try {
          aiAnalysis = await aiService.analyzeStudentConversations(data.sampleQuestions)
        } catch (error) {
          console.error('AI analysis failed for date:', dateKey, error)
          // Fallback to simple topic extraction
          const topics = extractTopics(data.sampleQuestions)
          aiAnalysis = {
            summary: `${data.totalQuestions} questions from ${data.uniqueStudents.size} students`,
            strugglingTopics: topics.slice(0, 5).map(t => t.topic),
            teachingRecommendations: [],
            commonMisconceptions: [],
            engagementLevel: data.totalQuestions > 10 ? 'high' as const : data.totalQuestions > 5 ? 'medium' as const : 'low' as const
          }
        }

        return {
          date: data.date,
          totalQuestions: data.totalQuestions,
          uniqueStudents: data.uniqueStudents.size,
          sampleQuestions: data.sampleQuestions,
          summary: aiAnalysis.summary,
          strugglingTopics: aiAnalysis.strugglingTopics,
          teachingRecommendations: aiAnalysis.teachingRecommendations,
          commonMisconceptions: aiAnalysis.commonMisconceptions,
          engagement: aiAnalysis.engagementLevel,
          topTopics: aiAnalysis.strugglingTopics.map((topic, idx) => ({ topic, count: data.sampleQuestions.length - idx }))
        }
      })
    )

    const insights = insightsWithAI.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Daily insights error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Simple topic extraction function (could be enhanced with AI)
function extractTopics(questions: string[]): { topic: string; count: number }[] {
  const topicCounts = new Map<string, number>()

  questions.forEach(question => {
    // Simple keyword extraction
    const words = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)

    words.forEach(word => {
      if (!['what', 'when', 'where', 'which', 'that', 'this', 'with', 'from', 'they', 'have', 'been'].includes(word)) {
        topicCounts.set(word, (topicCounts.get(word) || 0) + 1)
      }
    })
  })

  return Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }))
}
