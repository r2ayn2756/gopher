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

    // Validate request body
    if (!req.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
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

    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

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

CRITICAL: You must respond with ONLY a valid JSON object. No explanations, no markdown, no code blocks, no additional text.

The JSON response must be in this exact format (copy this structure exactly):
{
  "title": "${assignmentTitle} Rubric",
  "totalPoints": 100,
  "criteria": [
    {
      "name": "Criterion Name",
      "levels": [
        {
          "label": "${levelLabels[0]}",
          "description": "Specific, measurable description of what constitutes this performance level",
          "points": X
        },
        {
          "label": "${levelLabels[1]}",
          "description": "Specific, measurable description of what constitutes this performance level",
          "points": Y
        },
        ...
      ]
    }
  ]
}

Ensure that:
- Each criterion has exactly ${numberOfLevels} levels
- Point values are numeric and add up appropriately
- Descriptions are specific and measurable, not subjective
- The rubric aligns with the assignment requirements`

    // Try up to 3 times to generate a valid rubric
    let response: any = null
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      try {
        const responseText = await ai.sendMessage([
          {
            role: 'user',
            content: prompt
          }
        ])

        if (!responseText || typeof responseText !== 'string') {
          throw new Error('AI service returned invalid response')
        }

        response = { text: responseText }
        break // Success, exit the loop
      } catch (error) {
        console.warn(`Rubric generation attempt ${attempts} failed:`, error)
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate rubric after ${maxAttempts} attempts`)
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    if (!response) {
      throw new Error('Failed to generate rubric - no response received')
    }

    // Ensure response has the expected structure
    if (typeof response !== 'object' || !response.text) {
      console.error('Invalid response structure:', response)
      throw new Error('Invalid response structure from AI service')
    }

    // Parse the AI response
    let rubric
    try {
      const responseText = response.text.trim()

      // Try to extract JSON from the response
      let jsonText = responseText

      // If the response doesn't start with {, try to find JSON within it
      if (!responseText.startsWith('{')) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonText = jsonMatch[0]
        }
      }

      // Clean up the JSON text (remove markdown code blocks if present)
      jsonText = jsonText.replace(/```json\s*|\s*```/g, '')

      rubric = JSON.parse(jsonText)

      // Validate the rubric structure
      if (!rubric || typeof rubric !== 'object') {
        throw new Error('Invalid rubric structure: not an object')
      }

      if (!rubric.title || !rubric.totalPoints || !Array.isArray(rubric.criteria)) {
        throw new Error('Invalid rubric structure: missing required fields')
      }

      if (rubric.criteria.length === 0) {
        throw new Error('Invalid rubric structure: no criteria provided')
      }

      // Validate each criterion
      for (const criterion of rubric.criteria) {
        if (!criterion.name || !Array.isArray(criterion.levels)) {
          throw new Error('Invalid criterion structure: missing name or levels')
        }

        if (criterion.levels.length !== numberOfLevels) {
          throw new Error(`Invalid criterion structure: expected ${numberOfLevels} levels, got ${criterion.levels.length}`)
        }

        for (const level of criterion.levels) {
          if (!level.label || !level.description || typeof level.points !== 'number') {
            throw new Error('Invalid level structure: missing label, description, or points')
          }
        }
      }

    } catch (parseError) {
      console.error('=== AI RESPONSE DEBUG INFO ===')

      // Check if response exists and has text property
      if (!response) {
        console.error('Response is undefined')
        throw new Error('No response received from AI service')
      }

      if (!response.text) {
        console.error('Response text is undefined')
        console.error('Response object keys:', Object.keys(response))
        throw new Error('AI response missing text content')
      }

      console.error('Full response text:', response.text)
      console.error('Response length:', response.text.length)
      console.error('Starts with {:', response.text.trim().startsWith('{'))
      console.error('Contains JSON pattern:', /\{[\s\S]*\}/.test(response.text))
      console.error('Parse error:', parseError)
      console.error('=============================')

      // Try to provide more specific error information
      const responseText = response.text.trim()
      if (!responseText) {
        throw new Error('AI returned empty response')
      }
      if (!responseText.includes('{')) {
        throw new Error('AI response does not contain JSON object - check if the prompt is working correctly')
      }
      if (responseText.length < 50) {
        throw new Error('AI response too short - may be an error message instead of JSON')
      }

      // Try one more time to extract JSON from the response
      try {
        // Look for JSON-like content in the response
        const jsonPatterns = [
          /\{[\s\S]*\}/,  // Standard JSON object
          /```json\s*(\{[\s\S]*?\})\s*```/,  // Markdown code block with json
          /```\s*(\{[\s\S]*?\})\s*```/,      // Markdown code block without json label
        ]

        for (const pattern of jsonPatterns) {
          const match = responseText.match(pattern)
          if (match) {
            const extractedJson = match[1] || match[0]
            const cleanedJson = extractedJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
            rubric = JSON.parse(cleanedJson)
            console.log('Successfully extracted JSON using fallback pattern')

            // Validate the structure again
            if (rubric && typeof rubric === 'object' && rubric.title && rubric.criteria) {
              break
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback JSON extraction also failed:', fallbackError)
      }

      if (!rubric || typeof rubric !== 'object') {
        throw new Error(`AI response format error. Response preview: ${responseText.substring(0, 200)}...`)
      }

      throw new Error('Failed to generate valid rubric - AI response was not in expected format')
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
