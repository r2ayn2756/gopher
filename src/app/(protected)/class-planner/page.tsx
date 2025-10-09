"use client"

import * as React from 'react'
import { Calendar, Download, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react'

interface LessonPlan {
  id: string
  title: string
  duration: string
  objectives: string[]
  materials: string[]
  activities: {
    phase: string
    duration: string
    description: string
  }[]
  assessment: string
  differentiation: string[]
  homework?: string
}

interface SavedPlan {
  id: string
  title: string
  subject: string
  gradeLevel: string
  createdAt: string
  lessonPlan: LessonPlan
}

export default function ClassPlannerPage() {
  const [subject, setSubject] = React.useState('')
  const [gradeLevel, setGradeLevel] = React.useState('')
  const [topic, setTopic] = React.useState('')
  const [duration, setDuration] = React.useState('45')
  const [learningObjectives, setLearningObjectives] = React.useState('')
  const [studentNeeds, setStudentNeeds] = React.useState('')

  const [generatedPlan, setGeneratedPlan] = React.useState<LessonPlan | null>(null)
  const [savedPlans, setSavedPlans] = React.useState<SavedPlan[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'create' | 'saved'>('create')

  // Load saved plans on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('gopher:class-plans')
    if (saved) {
      try {
        setSavedPlans(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const handleGenerate = async () => {
    if (!subject.trim() || !topic.trim()) {
      setError('Please provide subject and topic')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/class-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          gradeLevel,
          topic,
          duration: parseInt(duration),
          learningObjectives,
          studentNeeds,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate lesson plan')
      }

      const data = await res.json()
      setGeneratedPlan(data.lessonPlan)
    } catch (e: any) {
      setError(e.message || 'Failed to generate lesson plan')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!generatedPlan) return

    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      title: generatedPlan.title,
      subject,
      gradeLevel,
      createdAt: new Date().toISOString(),
      lessonPlan: generatedPlan,
    }

    const updated = [newPlan, ...savedPlans]
    setSavedPlans(updated)
    localStorage.setItem('gopher:class-plans', JSON.stringify(updated))
    setActiveTab('saved')
  }

  const handleDelete = (id: string) => {
    const updated = savedPlans.filter(p => p.id !== id)
    setSavedPlans(updated)
    localStorage.setItem('gopher:class-plans', JSON.stringify(updated))
  }

  const handleExport = (plan: LessonPlan) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(generatePrintableHTML(plan, subject, gradeLevel))
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Planner</h1>
        <p className="mt-2 text-gray-600">
          Create effective lesson plans with AI-powered suggestions
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('create')}
            className={`border-b-2 px-4 py-2 font-medium transition ${
              activeTab === 'create'
                ? 'border-[#32ff00] text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Create New Plan
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`border-b-2 px-4 py-2 font-medium transition ${
              activeTab === 'saved'
                ? 'border-[#32ff00] text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved Plans ({savedPlans.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Lesson Details</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Math, English"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g., 9th Grade"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Topic/Unit *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quadratic Equations, Persuasive Writing"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Lesson Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Learning Objectives (Optional)
                </label>
                <textarea
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  placeholder="What should students learn or be able to do by the end of this lesson?"
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Student Needs & Differentiation (Optional)
                </label>
                <textarea
                  value={studentNeeds}
                  onChange={(e) => setStudentNeeds(e.target.value)}
                  placeholder="Describe any specific student needs, learning differences, or accommodations to consider..."
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#32ff00] px-4 py-2.5 font-medium text-black shadow-sm transition hover:bg-[#2be600] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Lesson Plan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview/Output */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generated Plan</h2>
              {generatedPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 rounded-md bg-[#32ff00] px-3 py-1.5 text-sm font-medium text-black hover:bg-[#2be600]"
                  >
                    <Plus size={14} />
                    Save
                  </button>
                  <button
                    onClick={() => handleExport(generatedPlan)}
                    className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download size={14} />
                    Export
                  </button>
                </div>
              )}
            </div>

            {!generatedPlan ? (
              <div className="flex h-96 items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Fill in the lesson details and click Generate</p>
                </div>
              </div>
            ) : (
              <LessonPlanView plan={generatedPlan} />
            )}
          </div>
        </div>
      ) : (
        // Saved Plans View
        <div className="space-y-4">
          {savedPlans.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
              <div className="text-center">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No saved lesson plans yet</p>
              </div>
            </div>
          ) : (
            savedPlans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600">
                      {plan.subject} • {plan.gradeLevel} • {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport(plan.lessonPlan)}
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Download size={14} />
                      Export
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
                <LessonPlanView plan={plan.lessonPlan} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function LessonPlanView({ plan }: { plan: LessonPlan }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-semibold text-gray-900">Duration</h4>
        <p className="text-gray-700">{plan.duration}</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Learning Objectives</h4>
        <ul className="ml-4 list-disc space-y-1 text-gray-700">
          {plan.objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Materials Needed</h4>
        <ul className="ml-4 list-disc space-y-1 text-gray-700">
          {plan.materials.map((mat, i) => (
            <li key={i}>{mat}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Lesson Activities</h4>
        <div className="mt-2 space-y-3">
          {plan.activities.map((activity, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{activity.phase}</span>
                <span className="text-xs text-gray-600">{activity.duration}</span>
              </div>
              <p className="mt-1 text-gray-700">{activity.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Assessment</h4>
        <p className="text-gray-700">{plan.assessment}</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Differentiation Strategies</h4>
        <ul className="ml-4 list-disc space-y-1 text-gray-700">
          {plan.differentiation.map((diff, i) => (
            <li key={i}>{diff}</li>
          ))}
        </ul>
      </div>

      {plan.homework && (
        <div>
          <h4 className="font-semibold text-gray-900">Homework/Extension</h4>
          <p className="text-gray-700">{plan.homework}</p>
        </div>
      )}
    </div>
  )
}

function generatePrintableHTML(plan: LessonPlan, subject: string, gradeLevel: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${plan.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #1f2937; margin-bottom: 8px; }
        .subtitle { color: #6b7280; margin-bottom: 24px; }
        h2 { color: #374151; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #32ff00; padding-bottom: 4px; }
        ul { margin-left: 24px; }
        .activity { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; margin: 8px 0; border-radius: 6px; }
        .activity-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px; }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>${plan.title}</h1>
      <div class="subtitle">${subject} | ${gradeLevel} | ${plan.duration}</div>

      <h2>Learning Objectives</h2>
      <ul>
        ${plan.objectives.map(obj => `<li>${obj}</li>`).join('')}
      </ul>

      <h2>Materials Needed</h2>
      <ul>
        ${plan.materials.map(mat => `<li>${mat}</li>`).join('')}
      </ul>

      <h2>Lesson Activities</h2>
      ${plan.activities.map(activity => `
        <div class="activity">
          <div class="activity-header">
            <span>${activity.phase}</span>
            <span>${activity.duration}</span>
          </div>
          <div>${activity.description}</div>
        </div>
      `).join('')}

      <h2>Assessment</h2>
      <p>${plan.assessment}</p>

      <h2>Differentiation Strategies</h2>
      <ul>
        ${plan.differentiation.map(diff => `<li>${diff}</li>`).join('')}
      </ul>

      ${plan.homework ? `
        <h2>Homework/Extension</h2>
        <p>${plan.homework}</p>
      ` : ''}
    </body>
    </html>
  `
}
