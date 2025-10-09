import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { AIService } from '@/lib/ai/ai-service'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      subject,
      gradeLevel,
      topic,
      duration,
      learningObjectives,
      studentNeeds,
    } = body

    if (!subject || !topic) {
      return NextResponse.json(
        { error: 'Subject and topic are required' },
        { status: 400 }
      )
    }

    // Generate lesson plan using AI
    const ai = new AIService()

    const prompt = `You are an expert educator creating a detailed lesson plan using research-based teaching strategies.

Subject: ${subject}
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}
Topic: ${topic}
Lesson Duration: ${duration} minutes
${learningObjectives ? `Teacher's Learning Objectives: ${learningObjectives}` : ''}
${studentNeeds ? `Student Needs/Differentiation: ${studentNeeds}` : ''}

Create a comprehensive lesson plan using these evidence-based frameworks:
1. Backward Design: Start with clear, measurable SMART objectives
2. Gradual Release of Responsibility: "I do, We do, You do" model
3. Active Learning: Include engagement strategies
4. Differentiation: Provide multiple entry points and supports

The lesson should include these phases with appropriate time allocations:
- Hook/Engagement (5-10% of time)
- Direct Instruction/Modeling (20-30% of time)
- Guided Practice (30-40% of time)
- Independent Practice (20-30% of time)
- Closure/Assessment (5-10% of time)

Return ONLY a valid JSON object in this exact format:
{
  "id": "unique-id",
  "title": "Lesson title",
  "duration": "${duration} minutes",
  "objectives": ["SMART objective 1", "SMART objective 2", "..."],
  "materials": ["Material 1", "Material 2", "..."],
  "activities": [
    {
      "phase": "Hook/Engagement",
      "duration": "X minutes",
      "description": "Detailed description of what teacher and students do"
    },
    {
      "phase": "Direct Instruction",
      "duration": "X minutes",
      "description": "Detailed description"
    },
    {
      "phase": "Guided Practice",
      "duration": "X minutes",
      "description": "Detailed description"
    },
    {
      "phase": "Independent Practice",
      "duration": "X minutes",
      "description": "Detailed description"
    },
    {
      "phase": "Closure/Assessment",
      "duration": "X minutes",
      "description": "Detailed description"
    }
  ],
  "assessment": "Specific formative and/or summative assessment strategies",
  "differentiation": ["Strategy 1", "Strategy 2", "..."],
  "homework": "Optional homework or extension activity"
}

Make it practical, specific, and immediately usable for a teacher.`

    const response = await ai.sendMessage([{ role: 'user', content: prompt }])

    // Parse the AI response
    let lessonPlan
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        lessonPlan = JSON.parse(jsonMatch[0])
      } else {
        lessonPlan = JSON.parse(response)
      }

      // Ensure it has an ID
      if (!lessonPlan.id) {
        lessonPlan.id = Date.now().toString()
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', response)
      throw new Error('Failed to generate valid lesson plan')
    }

    return NextResponse.json({ lessonPlan })
  } catch (error) {
    console.error('Class planner error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
