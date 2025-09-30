import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20', 10), 50)
  const status = url.searchParams.get('status') || undefined
  const since = url.searchParams.get('since') || undefined
  const filterUserId = url.searchParams.get('userId') || undefined

  // Determine if current user is an admin
  const { data: prof } = await supabase
    .from('profiles')
    .select('role, class_code')
    .eq('id', user.id as any)
    .single()
  const isAdmin = (prof as any)?.role === 'admin'
  const adminClassCode = isAdmin ? (prof as any)?.class_code ?? null : null

  // Build base select; include user_id always, and profile fields for admins
  const baseSelect = isAdmin
    ? 'id, user_id, title, status, started_at, ended_at, profiles:profiles!inner(username, full_name, class_code)'
    : 'id, user_id, title, status, started_at, ended_at'

  let query = supabase
    .from('conversations')
    .select(baseSelect as any, { count: 'estimated' }) // Use estimated for faster queries
    .neq('status', 'deleted' as any)
    .order('started_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('user_id', user.id as any)
  } else {
    // Admins can only see conversations for students in their class_code
    if (adminClassCode) {
      // Filter via the joined profile's class_code
      query = query.eq('profiles.class_code' as any, adminClassCode as any)
    } else {
      // No class code on admin profile -> return empty
      return NextResponse.json({ items: [], page, pageSize, total: 0 })
    }
    if (filterUserId) {
      query = query.eq('user_id', filterUserId as any)
    }
  }

  if (status) query = query.eq('status', status as any)
  if (since) query = query.gte('started_at', since)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, count, error } = await query.range(from, to)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data, page, pageSize, total: count ?? 0 })
}


