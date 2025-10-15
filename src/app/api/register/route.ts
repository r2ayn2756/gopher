import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseService } from '@/lib/supabase/service'

const BodySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().regex(/^[A-Za-z0-9_]+$/).min(3).max(24),
  full_name: z.string().max(120).optional().nullable(),
  school_id: z.string().max(64).optional().nullable(),
  grade_level: z.string().max(32).optional().nullable(),
  class_code: z.string().max(64).optional().nullable(),
  admin: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  const isAdmin = !!data.admin
  const schoolId = (data.school_id ?? '').trim()
  const classCode = (data.class_code ?? '').trim()

  if (isAdmin) {
    // Admins must provide a School ID. We'll constrain to '001' initially.
    if (!schoolId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['school_id'], message: 'School ID is required for admins' })
    }
    if (schoolId && schoolId !== '001') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['school_id'], message: "Invalid School ID. Allowed: '001' for now" })
    }
  } else {
    // Students must provide both School ID and Class Code.
    if (!schoolId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['school_id'], message: 'School ID is required for students' })
    }
    if (!classCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['class_code'], message: 'Class Code is required for students' })
    }
    if (schoolId && schoolId !== '001') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['school_id'], message: "Invalid School ID. Allowed: '001' for now" })
    }
  }
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues }, { status: 400 })
    }
    const { id, username, full_name, school_id, grade_level, class_code, admin } = parsed.data

    const supabase = createSupabaseService()
    // If admin, generate a unique class code for this admin (if not provided)
    const generatedClassCode = admin
      ? `CLS-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-2)}`
      : null

    const baseInsert: any = {
      id,
      username,
      full_name: full_name ?? null,
      school_id: school_id ?? null,
      grade_level: grade_level ?? null,
      role: (admin ? 'admin' : 'student') as any,
    }

    const insertWithClassCode: any = {
      ...baseInsert,
      class_code: (admin ? generatedClassCode : (class_code ?? null)) as any,
    }

    let { error } = await supabase.from('profiles').insert(insertWithClassCode)
    if (error && error.code === '42703') {
      // undefined_column: class_code not present yet. Retry without it so registration can proceed.
      const retry = await supabase.from('profiles').insert(baseInsert)
      error = retry.error ?? null

      // If retry succeeded and this was an admin with a generated class code, try to update it
      if (!error && admin && generatedClassCode) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ class_code: generatedClassCode })
          .eq('id', id)

        if (updateError) {
          console.warn('Failed to update admin class_code after registration:', updateError)
          // Don't fail registration, but log the issue
        }
      }
    }
    if (error) {
      const status = error.code === '23505' ? 409 : 500
      return NextResponse.json({ error: error.message }, { status })
    }
    return NextResponse.json({ ok: true, class_code: generatedClassCode })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}


