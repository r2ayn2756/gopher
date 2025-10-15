import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

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
      return NextResponse.json({ data: [] })
    }

    console.log('Admin class code:', adminClassCode)
    console.log('Admin role:', (profile as any)?.role)

    // Get time range from query params
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    if (days === 1) {
      // Last 24 hours by hour
      startDate.setHours(startDate.getHours() - 24)
    } else {
      startDate.setDate(startDate.getDate() - days)
    }

    // First, get student user IDs in the admin's class
    let studentUserIds: string[] = []

    console.log('Looking for students in class:', adminClassCode)
    const { data: studentsInClass, error: studentsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('class_code', adminClassCode)
      .eq('role', 'student')

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    studentUserIds = (studentsInClass || []).map((s: any) => s.id)
    console.log('Found students:', studentUserIds.length)

    if (studentUserIds.length === 0) {
      console.log('No students found in class')
      // No students in class, but still return the data structure with zeros
      // This allows the chart to render properly
    }

    // Query messages grouped by date - only from students in the admin's class
    console.log('Looking for conversations for students:', studentUserIds)
    const { data: conversationIds, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .in('user_id', studentUserIds)

    if (convError) {
      console.error('Error fetching conversations:', convError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    console.log('Found conversations:', conversationIds?.length || 0)

    let messages: any[] = []

    if (conversationIds && conversationIds.length > 0) {
      const conversationIdsList = conversationIds.map((c: any) => c.id)
      console.log('Looking for messages in conversations:', conversationIdsList)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('role', 'user') // Only count student messages
        .in('conversation_id', conversationIdsList)

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
      }

      messages = messagesData || []
      console.log('Found messages:', messages.length)
    } else {
      console.log('No conversations found for students')
      messages = []
      // Continue to generate the data structure with zeros
    }

    // Group messages by date/hour
    const grouped = new Map<string, number>()

    messages?.forEach((msg: any) => {
      const date = new Date(msg.created_at)
      let key: string

      if (days === 1) {
        // Group by hour
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString()
      } else {
        // Group by day
        key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
      }

      grouped.set(key, (grouped.get(key) || 0) + 1)
    })

    // Generate complete date range with zeros for missing data
    const dataPoints: Array<{ date: string; count: number }> = []
    const current = new Date(startDate)

    while (current <= endDate) {
      // Normalize the date key to match the grouping logic
      let key: string
      if (days === 1) {
        // Group by hour
        key = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours()).toISOString()
      } else {
        // Group by day
        key = new Date(current.getFullYear(), current.getMonth(), current.getDate()).toISOString()
      }

      dataPoints.push({
        date: key,
        count: grouped.get(key) || 0,
      })

      if (days === 1) {
        current.setHours(current.getHours() + 1)
      } else {
        current.setDate(current.getDate() + 1)
      }
    }

    return NextResponse.json({ data: dataPoints })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
