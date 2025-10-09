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

    // Get student's conversations and messages count
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, status')
      .eq('user_id', user.id)

    if (convError) {
      console.error('Error fetching conversations:', convError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const totalConversations = conversations?.length || 0
    const activeConversations = conversations?.filter((c: any) => c.status === 'active').length || 0

    // Get total messages count for this user
    // First get conversation IDs for this user
    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)

    if (!userConversations || userConversations.length === 0) {
      return NextResponse.json({
        totalConversations: 0,
        activeConversations: 0,
        totalMessages: 0
      })
    }

    const conversationIds = userConversations.map((c: any) => c.id)

    // Then get messages for those conversations
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
      .in('conversation_id', conversationIds)

    if (msgError) {
      console.error('Error fetching messages count:', msgError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const totalMessages = messages || 0

    return NextResponse.json({
      totalConversations,
      activeConversations,
      totalMessages
    })
  } catch (error) {
    console.error('Student stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
