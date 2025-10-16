"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowser } from "@/lib/supabase/client"
import { LandingNav } from "@/components/site/landing-nav"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(128, "Too long"),
  remember: z.boolean().optional().default(true),
})

type FormValues = z.infer<typeof schema>

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const redirectTo = params.get("redirectTo") || "/home"

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { remember: true } })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowser()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (signInError) throw signInError

      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      let destination = redirectTo
      if (user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (prof && (prof as any).role === 'admin') destination = '/admin'
      }

      router.replace(destination)
    } catch (e: any) {
      setError(e?.message ?? 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white text-black">
      <LandingNav />
      <div className="mx-auto mt-12 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm px-4">

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" aria-describedby={error ? "form-error" : undefined}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="remember" className="inline-flex items-center gap-2 text-sm">
              <input id="remember" type="checkbox" className="h-4 w-4" {...register("remember")}/>
              <span className="text-gray-700">Remember me</span>
            </label>
            <a href="#" className="text-sm text-gray-700 hover:text-black hover:underline">Forgot password?</a>
          </div>

          {error && (
            <div id="form-error" role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-[#32ff00] px-4 py-2 font-medium text-black transition hover:bg-[#2be600] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <a href="/register" className="text-gray-700 hover:text-black hover:underline">Create one</a>
        </div>

        <div className="mt-6 rounded-md bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">Admins</p>
          <p className="text-gray-700">Admins use the same sign-in. After login, admins are redirected to the dashboard automatically.</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginContent />
    </React.Suspense>
  )
}


