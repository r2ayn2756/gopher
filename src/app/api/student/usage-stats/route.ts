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

    // Get time range from query params (default to last 7 days)
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

    // First get conversation IDs for current user
    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)

    if (!userConversations || userConversations.length === 0) {
      // Return empty data points for the full date range
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
          count: 0,
        })

        if (days === 1) {
          current.setHours(current.getHours() + 1)
        } else {
          current.setDate(current.getDate() + 1)
        }
      }

      return NextResponse.json({ data: dataPoints })
    }

    const conversationIds = userConversations.map((c: any) => c.id)

    // Query messages grouped by date - only from current user's conversations
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('role', 'user') // Only count student messages
      .in('conversation_id', conversationIds) // Only current user's conversations

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Group messages by date/hour
    const grouped = new Map<string, number>()

    if (messages && messages.length > 0) {
      messages.forEach((msg: any) => {
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
    }

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
    console.error('Student usage stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
