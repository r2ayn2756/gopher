"use client"

import * as React from 'react'
import { Download, Loader2, Sparkles, Plus, Trash2, FileText } from 'lucide-react'

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

interface SavedRubric {
  id: string
  title: string
  subject: string
  gradeLevel: string
  rubricType: 'analytic' | 'holistic'
  numberOfLevels: number
  createdAt: string
  rubric: GeneratedRubric
}

export default function RubricBuilderPage() {
  const [assignmentTitle, setAssignmentTitle] = React.useState('')
  const [assignmentDescription, setAssignmentDescription] = React.useState('')
  const [gradeLevel, setGradeLevel] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [rubricType, setRubricType] = React.useState<'analytic' | 'holistic'>('analytic')
  const [numberOfLevels, setNumberOfLevels] = React.useState(4)

  const [generatedRubric, setGeneratedRubric] = React.useState<GeneratedRubric | null>(null)
  const [savedRubrics, setSavedRubrics] = React.useState<SavedRubric[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'create' | 'saved'>('create')

  // Load saved rubrics on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('gopher:rubrics')
    if (saved) {
      try {
        setSavedRubrics(JSON.parse(saved))
      } catch {}
    }
  }, [])

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

      if (!data || !data.rubric) {
        throw new Error('Invalid response format: missing rubric data')
      }

      setGeneratedRubric(data.rubric)
    } catch (e: any) {
      setError(e.message || 'Failed to generate rubric')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!generatedRubric) return

    const newRubric: SavedRubric = {
      id: Date.now().toString(),
      title: generatedRubric.title,
      subject,
      gradeLevel,
      rubricType,
      numberOfLevels,
      createdAt: new Date().toISOString(),
      rubric: generatedRubric,
    }

    const updated = [newRubric, ...savedRubrics]
    setSavedRubrics(updated)
    localStorage.setItem('gopher:rubrics', JSON.stringify(updated))
    setActiveTab('saved')
  }

  const handleDelete = (id: string) => {
    const updated = savedRubrics.filter(r => r.id !== id)
    setSavedRubrics(updated)
    localStorage.setItem('gopher:rubrics', JSON.stringify(updated))
  }

  const handleExport = (format: 'pdf' | 'csv' | 'json', rubric?: GeneratedRubric) => {
    const rubricToExport = rubric || generatedRubric
    if (!rubricToExport) return

    if (format === 'json') {
      const dataStr = JSON.stringify(rubricToExport, null, 2)
      downloadBlob(new Blob([dataStr], { type: 'application/json' }), `${rubricToExport.title.replace(/\s+/g, '_')}.json`)
    } else if (format === 'csv') {
      const csv = convertToCSV(rubricToExport)
      downloadBlob(new Blob([csv], { type: 'text/csv' }), `${rubricToExport.title.replace(/\s+/g, '_')}.csv`)
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(generatePrintableHTML(rubricToExport))
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
            Create New Rubric
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`border-b-2 px-4 py-2 font-medium transition ${
              activeTab === 'saved'
                ? 'border-[#32ff00] text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved Rubrics ({savedRubrics.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
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
                    onClick={handleSave}
                    className="flex items-center gap-1 rounded-md bg-[#32ff00] px-3 py-1.5 text-sm font-medium text-black hover:bg-[#2be600]"
                  >
                    <Plus size={14} />
                    Save
                  </button>
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
      ) : (
        // Saved Rubrics View
        <div className="space-y-4">
          {savedRubrics.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No saved rubrics yet</p>
              </div>
            </div>
          ) : (
            savedRubrics.map((savedRubric) => (
              <div key={savedRubric.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{savedRubric.title}</h3>
                    <p className="text-sm text-gray-600">
                      {savedRubric.subject} • {savedRubric.gradeLevel} • {savedRubric.rubricType} • {savedRubric.numberOfLevels} levels • {new Date(savedRubric.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport('pdf', savedRubric.rubric)}
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Download size={14} />
                      Export
                    </button>
                    <button
                      onClick={() => handleDelete(savedRubric.id)}
                      className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{savedRubric.rubric.title}</h4>
                    <p className="text-sm text-gray-600">Total Points: {savedRubric.rubric.totalPoints}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                            Criteria
                          </th>
                          {savedRubric.rubric.criteria[0]?.levels.map((level, i) => (
                            <th key={i} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-900">
                              {level.label}
                              <br />
                              <span className="text-xs font-normal text-gray-600">({level.points} pts)</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {savedRubric.rubric.criteria.map((criterion, i) => (
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
              </div>
            ))
          )}
        </div>
      )}
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
  if (!rubric || !rubric.criteria || rubric.criteria.length === 0) return ''

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
  if (!rubric || !rubric.criteria || rubric.criteria.length === 0) return ''

  const title = rubric.title || 'Rubric'
  const totalPoints = rubric.totalPoints || 0

  let html = '<!DOCTYPE html>\n<html>\n<head>\n'
  html += `<title>${title}</title>\n`
  html += '<style>\n'
  html += 'body { font-family: Arial, sans-serif; margin: 40px; }\n'
  html += 'h1 { color: #1f2937; margin-bottom: 8px; }\n'
  html += '.subtitle { color: #6b7280; margin-bottom: 24px; }\n'
  html += 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }\n'
  html += 'th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }\n'
  html += 'th { background-color: #f9fafb; font-weight: 600; }\n'
  html += '.criteria-cell { background-color: #f9fafb; font-weight: 500; }\n'
  html += '@media print { body { margin: 20px; } }\n'
  html += '</style>\n</head>\n<body>\n'
  html += `<h1>${title}</h1>\n`
  html += `<div class="subtitle">Total Points: ${totalPoints}</div>\n`
  html += '<table>\n<thead>\n<tr>\n<th>Criteria</th>\n'

  // Add level headers
  if (rubric.criteria[0]?.levels) {
    rubric.criteria[0].levels.forEach(level => {
      html += `<th>${level.label}<br/><small>(${level.points} pts)</small></th>\n`
    })
  }

  html += '</tr>\n</thead>\n<tbody>\n'

  // Add criteria rows
  if (rubric.criteria) {
    rubric.criteria.forEach(criterion => {
      html += '<tr>\n'
      html += `<td class="criteria-cell">${criterion.name}</td>\n`

      if (criterion.levels) {
        criterion.levels.forEach(level => {
          html += `<td>${level.description}</td>\n`
        })
      }

      html += '</tr>\n'
    })
  }

  html += '</tbody>\n</table>\n</body>\n</html>'

  return html
}
