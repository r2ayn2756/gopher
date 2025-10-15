"use client"

import * as React from 'react'
import { Calendar, MessageCircle, Users, TrendingUp, BookOpen, AlertCircle, Lightbulb, Target } from 'lucide-react'

interface DailyInsight {
  date: string
  totalQuestions: number
  uniqueStudents: number
  sampleQuestions: string[]
  summary?: string
  strugglingTopics?: string[]
  teachingRecommendations?: string[]
  commonMisconceptions?: string[]
  topTopics: { topic: string; count: number }[]
  engagement: 'low' | 'medium' | 'high'
}

interface StudentInsightsProps {
  insights: DailyInsight[]
  loading?: boolean
  onRefresh?: () => void
}

export function StudentInsights({ insights, loading, onRefresh }: StudentInsightsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'bg-green-100 text-green-800 ring-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 ring-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 ring-gray-200'
      default: return 'bg-gray-100 text-gray-800 ring-gray-200'
    }
  }

  const getEngagementIcon = (engagement: string) => {
    switch (engagement) {
      case 'high': return <TrendingUp size={16} />
      case 'medium': return <MessageCircle size={16} />
      case 'low': return <BookOpen size={16} />
      default: return <BookOpen size={16} />
    }
  }

  if (loading) {
    return (
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Student Insights</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Loading...
          </span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading student insights...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Student Insights</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <Calendar size={12} />
            Last 7 days
          </span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No student activity yet</p>
              <p className="text-sm">Student questions and insights will appear here once students start using the platform.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Student Insights</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <Calendar size={12} />
            Last 7 days
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.date} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{formatDate(insight.date)}</h3>
                  <p className="text-sm text-gray-600">
                    {insight.totalQuestions} questions from {insight.uniqueStudents} students
                  </p>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getEngagementColor(insight.engagement)}`}>
                {getEngagementIcon(insight.engagement)}
                {insight.engagement.charAt(0).toUpperCase() + insight.engagement.slice(1)} Engagement
              </div>
            </div>

            {/* AI-Generated Summary */}
            {insight.summary && (
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start gap-2">
                  <MessageCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">AI Summary</h4>
                    <p className="text-sm text-blue-800">{insight.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Teaching Recommendations */}
            {insight.teachingRecommendations && insight.teachingRecommendations.length > 0 && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">Teaching Recommendations</h4>
                    <ul className="space-y-1.5">
                      {insight.teachingRecommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Struggling Topics */}
            {insight.strugglingTopics && insight.strugglingTopics.length > 0 && (
              <div className="mb-4 rounded-lg bg-orange-50 border border-orange-200 p-4">
                <div className="flex items-start gap-2">
                  <Target size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-orange-900 mb-2">Areas Needing Attention</h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.strugglingTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 ring-1 ring-inset ring-orange-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Common Misconceptions */}
            {insight.commonMisconceptions && insight.commonMisconceptions.length > 0 && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Common Misconceptions</h4>
                    <ul className="space-y-1.5">
                      {insight.commonMisconceptions.map((misconception, idx) => (
                        <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>{misconception}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Questions - Collapsed by default */}
            {insight.sampleQuestions.length > 0 && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                  View Sample Questions ({insight.sampleQuestions.length})
                </summary>
                <div className="space-y-2 mt-2">
                  {insight.sampleQuestions.map((question, idx) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                      "{question}"
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}




