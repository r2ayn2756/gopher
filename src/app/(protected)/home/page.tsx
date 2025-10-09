"use client"

import * as React from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { UsageChart } from '@/components/admin/usage-chart'
import { MessageSquare, BookOpen, FileCheck, BarChart3, Layers, Calendar } from 'lucide-react'

type TimeRange = '1' | '7' | '30'

interface FeatureCard {
  title: string
  description: string
  href: string
  icon: 'chat' | 'notes' | 'proofer' | 'analytics' | 'rubric' | 'planner'
  adminOnly?: boolean
}

const FEATURES: FeatureCard[] = [
  {
    title: 'AI Chat',
    description: 'Get help with homework through Socratic questioning',
    href: '/chat',
    icon: 'chat',
  },
  {
    title: 'Admin Dashboard',
    description: 'Monitor student activity and conversations',
    href: '/admin',
    icon: 'analytics',
    adminOnly: true,
  },
  {
    title: 'Rubric Builder',
    description: 'Create custom AI-powered grading rubrics',
    href: '/rubric-builder',
    icon: 'rubric',
    adminOnly: true,
  },
  {
    title: 'Class Planner',
    description: 'Plan and organize lessons with AI assistance',
    href: '/class-planner',
    icon: 'planner',
    adminOnly: true,
  },
]

export default function HomePage() {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState(true)
  const [userName, setUserName] = React.useState<string>('Student')
  const [usageData, setUsageData] = React.useState<Array<{ date: string; count: number }>>([])
  const [timeRange, setTimeRange] = React.useState<TimeRange>('7')
  const [usageLoading, setUsageLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalMessages: 0,
    activeConversations: 0,
    totalConversations: 0
  })

  React.useEffect(() => {
    let mounted = true
    const supabase = createSupabaseBrowser()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, username')
          .eq('id', user.id)
          .single()

        if (!mounted) return

        const admin = (profile as any)?.role === 'admin'
        setIsAdmin(admin)
        setUserName((profile as any)?.full_name || (profile as any)?.username || 'Student')
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      setUsageLoading(true)
      try {
        // Use the correct API endpoint based on user role
        const endpoint = isAdmin
          ? `/api/admin/usage-stats?days=${timeRange}`
          : `/api/student/usage-stats?days=${timeRange}`

        const res = await fetch(endpoint, { credentials: 'include' })
        if (!res.ok) {
          console.error('Failed to fetch usage data:', res.status, res.statusText)
          throw new Error(`Failed to fetch usage data: ${res.status}`)
        }
        const json = await res.json()
        if (!mounted) return
        setUsageData(json.data || [])

        // Calculate total messages from usage data for display purposes
        const totalMessages = (json.data || []).reduce((sum: number, point: { count: number }) => sum + point.count, 0)
        setStats(prev => ({ ...prev, totalMessages }))
      } catch (error) {
        console.error('Failed to load usage stats:', error)
        // Set empty data if API fails
        if (!mounted) return
        setUsageData([])
      } finally {
        if (mounted) setUsageLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [timeRange, isAdmin])
  
  // Fetch stats for all users
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        if (isAdmin) {
          // For admins, get class-wide stats
          const { data: profile } = await supabase
            .from('profiles')
            .select('class_code')
            .eq('id', user.id)
            .single()

          const classCode = (profile as any)?.class_code
          if (!classCode || !mounted) return

          // Get students in the class
          const { data: students } = await supabase
            .from('profiles')
            .select('id')
            .eq('class_code', classCode)
            .eq('role', 'student')

          const studentIds = (students || []).map((s: any) => s.id)

          // Get active conversations
          const { data: conversations } = await supabase
            .from('conversations')
            .select('id, status')
            .in('user_id', studentIds)

          const activeCount = (conversations || []).filter((c: any) => c.status === 'active').length

          if (!mounted) return

          setStats(prev => ({
            ...prev,
            totalStudents: studentIds.length,
            activeConversations: activeCount
          }))
        } else {
          // For students, get their own stats
          try {
            const res = await fetch('/api/student/stats', { credentials: 'include' })
            if (!res.ok) {
              console.error('Failed to fetch student stats:', res.status, res.statusText)
              throw new Error(`Failed to fetch student stats: ${res.status}`)
            }
            const json = await res.json()

            if (!mounted) return

            setStats(prev => ({
              ...prev,
              totalMessages: json.totalMessages || 0,
              activeConversations: json.activeConversations || 0,
              totalConversations: json.totalConversations || 0
            }))
          } catch (error) {
            console.error('Error fetching student stats:', error)
            // Set default values if API fails
            if (!mounted) return
            setStats(prev => ({
              ...prev,
              totalMessages: 0,
              activeConversations: 0,
              totalConversations: 0
            }))
          }
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    })()
    return () => { mounted = false }
  }, [isAdmin])

  const visibleFeatures = FEATURES.filter(f => !f.adminOnly || isAdmin)

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userName}
        </h1>
        <p className="mt-2 text-gray-600">
          {isAdmin ? 'Manage your classes and monitor student progress' : 'Continue your learning journey'}
        </p>
      </div>

      {/* Dashboard Section */}
      <div className="mb-8 space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isAdmin && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Last {timeRange === '1' ? '24 hours' : `${timeRange} days`}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeConversations}</p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div>
            <UsageChart
              data={usageData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              loading={usageLoading}
            />
            {!usageLoading && usageData.every(d => d.count === 0) && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900">No activity yet</h3>
                    <p className="mt-1 text-sm text-blue-800">
                      {isAdmin
                        ? "Once students in your class start using the AI chat, their activity will appear here. Make sure students register using your class code to track their usage."
                        : "Start chatting with the AI to see your activity here! Your messages will be tracked and displayed over time."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Features Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {isAdmin ? 'Tools & Features' : 'Your Tools'}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleFeatures.map((feature) => (
            <FeatureCardComponent key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureCardComponent({ feature }: { feature: FeatureCard }) {
  const Icon = getIcon(feature.icon)
  const isComingSoon = feature.href === '#'

  return (
    <a
      href={isComingSoon ? undefined : feature.href}
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition ${
        isComingSoon
          ? 'cursor-not-allowed opacity-60'
          : 'hover:-translate-y-1 hover:shadow-md hover:border-[#32ff00]/50'
      }`}
      onClick={(e) => {
        if (isComingSoon) e.preventDefault()
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition ${
          isComingSoon
            ? 'bg-gray-100 text-gray-400'
            : 'bg-[#32ff00]/10 text-[#32ff00] group-hover:bg-[#32ff00] group-hover:text-black'
        }`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{feature.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
        </div>
      </div>
      {!isComingSoon && (
        <div className="mt-4 text-sm font-medium text-[#32ff00] group-hover:underline">
          Open →
        </div>
      )}
    </a>
  )
}

function getIcon(icon: FeatureCard['icon']) {
  switch (icon) {
    case 'chat':
      return MessageSquare
    case 'notes':
      return BookOpen
    case 'proofer':
      return FileCheck
    case 'analytics':
      return BarChart3
    case 'rubric':
      return Layers
    case 'planner':
      return Calendar
    default:
      return MessageSquare
  }
}
