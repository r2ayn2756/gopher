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
      assignmentTitle,
      assignmentDescription,
      gradeLevel,
      subject,
      rubricType,
      numberOfLevels,
    } = body

    if (!assignmentTitle || !assignmentDescription) {
      return NextResponse.json(
        { error: 'Assignment title and description are required' },
        { status: 400 }
      )
    }

    // Generate rubric using AI
    const ai = new AIService()

    const levelLabels = numberOfLevels === 3
      ? ['Beginning', 'Proficient', 'Advanced']
      : numberOfLevels === 4
      ? ['Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Exemplary']
      : ['Needs Improvement', 'Developing', 'Proficient', 'Accomplished', 'Exemplary']

    const prompt = `You are an expert educator creating an assessment rubric.

Assignment Title: ${assignmentTitle}
Description: ${assignmentDescription}
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}
${subject ? `Subject: ${subject}` : ''}
Rubric Type: ${rubricType === 'analytic' ? 'Analytic (multiple criteria)' : 'Holistic (overall performance)'}
Performance Levels: ${levelLabels.join(', ')}

Create a comprehensive ${rubricType} rubric with the following requirements:

1. ${rubricType === 'analytic' ? 'Identify 4-6 key criteria that align with the assignment objectives' : 'Create a single overall performance criterion'}
2. For each criterion, provide specific, descriptive language for each performance level
3. Assign appropriate point values (use a scale that totals 100 points)
4. Ensure descriptions are:
   - Specific and measurable
   - Observable behaviors/qualities
   - Clear differences between levels
   - Free of subjective terms like "good" or "excellent"

Return ONLY a valid JSON object in this exact format:
{
  "title": "${assignmentTitle} Rubric",
  "totalPoints": 100,
  "criteria": [
    {
      "name": "Criterion Name",
      "levels": [
        { "label": "${levelLabels[0]}", "description": "Specific description", "points": X },
        { "label": "${levelLabels[1]}", "description": "Specific description", "points": Y },
        ...
      ]
    }
  ]
}`

    const response = await ai.sendMessage([{ role: 'user', content: prompt }])

    // Parse the AI response
    let rubric
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        rubric = JSON.parse(jsonMatch[0])
      } else {
        rubric = JSON.parse(response)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', response)
      throw new Error('Failed to generate valid rubric')
    }

    return NextResponse.json({ rubric })
  } catch (error) {
    console.error('Rubric builder error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
