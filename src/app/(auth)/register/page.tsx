"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowser } from "@/lib/supabase/client"

export const dynamic = 'force-dynamic'

const schema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character"),
    confirm: z.string(),
    username: z.string().regex(/^[A-Za-z0-9_]+$/).min(3).max(24),
    full_name: z.string().max(120).optional().or(z.literal("")),
    school_id: z.string().max(64).optional().or(z.literal("")),
    class_code: z.string().max(64).optional().or(z.literal("")),
    grade_level: z.string().max(32).optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] })

type FormValues = z.infer<typeof schema>

function RegisterContent() {
  const router = useRouter()
  const params = useSearchParams()
  const adminFlag = params.get('admin') === 'true'
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setError(null)
    try {
      // Role-based client validation to give fast feedback before API
      const trimmedSchoolId = (values.school_id || '').trim()
      const trimmedClassCode = (values.class_code || '').trim()
      if (adminFlag) {
        if (!trimmedSchoolId) throw new Error('School ID is required for admins')
        if (trimmedSchoolId !== '001') throw new Error("Invalid School ID. Allowed: '001' for now")
      } else {
        if (!trimmedSchoolId) throw new Error('School ID is required for students')
        if (trimmedSchoolId !== '001') throw new Error("Invalid School ID. Allowed: '001' for now")
        if (!trimmedClassCode) throw new Error('Class Code is required for students')
      }
      const supabase = createSupabaseBrowser()
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      })
      if (signUpErr) throw signUpErr
      const user = data.user
      if (!user) throw new Error('Signup succeeded but no user returned')

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: values.email,
          username: values.username,
          full_name: values.full_name || null,
          school_id: values.school_id || null,
          class_code: values.class_code || null,
          grade_level: values.grade_level || null,
          admin: adminFlag,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Failed to create profile')
      }
      const j = await res.json().catch(() => null)
      const classCode = j?.class_code as string | undefined
      router.replace(adminFlag ? (classCode ? `/admin?class=${encodeURIComponent(classCode)}` : '/admin') : '/chat')
    } catch (e: any) {
      setError(e?.message ?? 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-gray-50 text-black">
      <section className="border-b border-green-200 bg-gradient-to-r from-green-50 via-green-100 to-green-50">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4">
          <a href="/" className="justify-self-start">
            <span className="inline-flex items-center gap-2">
              <img src="/gopher-logo.png" alt="Gopher" className="h-10 w-auto md:h-14 lg:h-16" />
              <span className="sr-only">Gopher</span>
            </span>
          </a>
          <nav className="justify-self-center">
            <ul className="flex items-center justify-center gap-10 text-base font-medium text-green-800">
              <li><a href="/#features" className="hover:text-green-900">Features</a></li>
              <li><a href="/#schools" className="hover:text-green-900">FERPA & COPPA Compliance</a></li>
              <li><a href="https://calendly.com/cc283-rice/30min" target="_blank" rel="noopener noreferrer" className="rounded-md bg-white/60 px-3 py-1.5 text-green-900 shadow-sm ring-1 ring-white/40 backdrop-blur hover:bg-white">Book Demo</a></li>
              <li><a href="/#contact" className="hover:text-green-900">Contact</a></li>
            </ul>
          </nav>
          <div />
        </div>
      </section>
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm px-4 mt-12">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-sm font-semibold text-white">G</span>
          <span className="text-lg font-semibold text-gray-900">Gopher</span>
        </div>
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">Create your account</h1>
          {adminFlag ? (
            <p className="mt-1 text-sm text-[var(--color-muted)]">Admin registration mode</p>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-muted)]">Join Gopher to learn smarter</p>
          )}
        </header>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
            <input id="email" type="email" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" {...register('email')} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
              <input id="password" type="password" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" {...register('password')} />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-900">Confirm password</label>
              <input id="confirm" type="password" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" {...register('confirm')} />
              {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900">Username</label>
              <input id="username" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" {...register('username')} />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-900">Full name (optional)</label>
              <input id="full_name" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" {...register('full_name')} />
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="school_id" className="block text-sm font-medium text-gray-900">School ID (required)</label>
              <input id="school_id" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" placeholder="001" {...register('school_id')} />
              {errors.school_id && <p className="mt-1 text-sm text-red-600">{errors.school_id.message}</p>}
            </div>
            <div>
              {adminFlag ? (
                <>
                  <label htmlFor="grade_level" className="block text-sm font-medium text-gray-900">Grade level (optional)</label>
                  <input id="grade_level" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" {...register('grade_level')} />
                  {errors.grade_level && <p className="mt-1 text-sm text-red-600">{errors.grade_level.message}</p>}
                </>
              ) : (
                <>
                  <label htmlFor="class_code" className="block text-sm font-medium text-gray-900">Class Code (required)</label>
                  <input id="class_code" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-green-600" placeholder="Enter your teacher's class code" {...register('class_code')} />
                  {errors.class_code && <p className="mt-1 text-sm text-red-600">{errors.class_code.message}</p>}
                </>
              )}
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a href="/login" className="text-green-700 hover:underline">Back to sign in</a>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={null}>
      <RegisterContent />
    </React.Suspense>
  )
}


