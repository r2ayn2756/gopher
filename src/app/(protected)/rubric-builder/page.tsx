"use client"

import * as React from 'react'
import { Download, Loader2, Sparkles } from 'lucide-react'

interface RubricCriteria {
  name: string
  levels: {
    label: string
    description: string
    points: number
  }[]
}

interface GeneratedRubric {
  title: string
  totalPoints: number
  criteria: RubricCriteria[]
}

export default function RubricBuilderPage() {
  const [assignmentTitle, setAssignmentTitle] = React.useState('')
  const [assignmentDescription, setAssignmentDescription] = React.useState('')
  const [gradeLevel, setGradeLevel] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [rubricType, setRubricType] = React.useState<'analytic' | 'holistic'>('analytic')
  const [numberOfLevels, setNumberOfLevels] = React.useState(4)

  const [generatedRubric, setGeneratedRubric] = React.useState<GeneratedRubric | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    if (!assignmentTitle.trim() || !assignmentDescription.trim()) {
      setError('Please provide assignment title and description')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/rubric-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentTitle,
          assignmentDescription,
          gradeLevel,
          subject,
          rubricType,
          numberOfLevels,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate rubric')
      }

      const data = await res.json()
      setGeneratedRubric(data.rubric)
    } catch (e: any) {
      setError(e.message || 'Failed to generate rubric')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    if (!generatedRubric) return

    if (format === 'json') {
      const dataStr = JSON.stringify(generatedRubric, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      downloadBlob(blob, `${generatedRubric.title.replace(/\s+/g, '_')}.json`)
    } else if (format === 'csv') {
      const csv = convertToCSV(generatedRubric)
      const blob = new Blob([csv], { type: 'text/csv' })
      downloadBlob(blob, `${generatedRubric.title.replace(/\s+/g, '_')}.csv`)
    } else if (format === 'pdf') {
      // For PDF, we'll create an HTML representation and use print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(generatePrintableHTML(generatedRubric))
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rubric Builder</h1>
        <p className="mt-2 text-gray-600">
          Generate custom assessment rubrics powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Assignment Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Assignment Title *
              </label>
              <input
                type="text"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="e.g., Persuasive Essay on Climate Change"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Assignment Description *
              </label>
              <textarea
                value={assignmentDescription}
                onChange={(e) => setAssignmentDescription(e.target.value)}
                placeholder="Describe the assignment requirements, learning objectives, and what students should demonstrate..."
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., English"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Rubric Type
              </label>
              <select
                value={rubricType}
                onChange={(e) => setRubricType(e.target.value as 'analytic' | 'holistic')}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
              >
                <option value="analytic">Analytic (Multiple Criteria)</option>
                <option value="holistic">Holistic (Overall Performance)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Number of Performance Levels
              </label>
              <select
                value={numberOfLevels}
                onChange={(e) => setNumberOfLevels(parseInt(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#32ff00]"
              >
                <option value="3">3 Levels (e.g., Beginning, Proficient, Advanced)</option>
                <option value="4">4 Levels (e.g., Below, Meets, Exceeds, Exemplary)</option>
                <option value="5">5 Levels (e.g., 1-5 scale)</option>
              </select>
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
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Rubric
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview/Output */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Generated Rubric</h2>
            {generatedRubric && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download size={14} />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download size={14} />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download size={14} />
                  JSON
                </button>
              </div>
            )}
          </div>

          {!generatedRubric ? (
            <div className="flex h-96 items-center justify-center text-gray-500">
              <div className="text-center">
                <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Fill in the assignment details and click Generate Rubric</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{generatedRubric.title}</h3>
                <p className="text-sm text-gray-600">Total Points: {generatedRubric.totalPoints}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                        Criteria
                      </th>
                      {generatedRubric.criteria[0]?.levels.map((level, i) => (
                        <th key={i} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-900">
                          {level.label}
                          <br />
                          <span className="text-xs font-normal text-gray-600">({level.points} pts)</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedRubric.criteria.map((criterion, i) => (
                      <tr key={i}>
                        <td className="border border-gray-200 bg-gray-50 px-3 py-2 font-medium text-gray-900">
                          {criterion.name}
                        </td>
                        {criterion.levels.map((level, j) => (
                          <td key={j} className="border border-gray-200 px-3 py-2 text-gray-700">
                            {level.description}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function convertToCSV(rubric: GeneratedRubric): string {
  if (!rubric.criteria || rubric.criteria.length === 0) return ''

  const headers = ['Criteria', ...(rubric.criteria[0]?.levels || []).map(l => `${l.label} (${l.points} pts)`)]
  const rows = rubric.criteria.map(c => [
    c.name,
    ...c.levels.map(l => l.description)
  ])

  const csvRows = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ]

  return csvRows.join('\n')
}

function generatePrintableHTML(rubric: GeneratedRubric): string {
  const firstCriteria = rubric.criteria[0]
  if (!firstCriteria) return ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${rubric.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #1f2937; margin-bottom: 8px; }
        .subtitle { color: #6b7280; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background-color: #f9fafb; font-weight: 600; }
        .criteria-cell { background-color: #f9fafb; font-weight: 500; }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>${rubric.title}</h1>
      <div class="subtitle">Total Points: ${rubric.totalPoints}</div>
      <table>
        <thead>
          <tr>
            <th>Criteria</th>
            ${firstCriteria.levels.map(l => `<th>${l.label}<br/><small>(${l.points} pts)</small></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rubric.criteria.map(c => `
            <tr>
              <td class="criteria-cell">${c.name}</td>
              ${c.levels.map(l => `<td>${l.description}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
}
