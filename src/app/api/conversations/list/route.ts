import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createSupabaseServer()
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

  if (!isAdmin) {
    // Regular users only see their own conversations
    let query = supabase
      .from('conversations')
      .select(baseSelect as any, { count: 'estimated' })
      .neq('status', 'deleted' as any)
      .eq('user_id', user.id as any)
      .order('started_at', { ascending: false })

    if (status) query = query.eq('status', status as any)
    if (since) query = query.gte('started_at', since)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, count, error } = await query.range(from, to)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data, page, pageSize, total: count ?? 0 })
  }

  // ADMIN LOGIC: Filter by class_code at the profile level first
  if (!adminClassCode) {
    // No class code on admin profile -> return empty
    return NextResponse.json({ items: [], page, pageSize, total: 0 })
  }

  // First, get all student user IDs in this admin's class
  const { data: studentsInClass, error: studentsError } = await supabase
    .from('profiles')
    .select('id')
    .eq('class_code', adminClassCode)
    .eq('role', 'student')

  if (studentsError) {
    return NextResponse.json({ error: studentsError.message }, { status: 500 })
  }

  const studentUserIds = (studentsInClass || []).map((s: any) => s.id)

  // If no students in class, return empty
  if (studentUserIds.length === 0) {
    return NextResponse.json({ items: [], page, pageSize, total: 0 })
  }

  // Now query conversations only for these specific student user IDs
  let query = supabase
    .from('conversations')
    .select(baseSelect as any, { count: 'estimated' })
    .neq('status', 'deleted' as any)
    .in('user_id', studentUserIds as any)
    .order('started_at', { ascending: false })

  if (filterUserId) {
    // Verify the filtered user is actually in this admin's class
    if (studentUserIds.includes(filterUserId)) {
      query = query.eq('user_id', filterUserId as any)
    } else {
      // Requested user is not in this admin's class
      return NextResponse.json({ items: [], page, pageSize, total: 0 })
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


