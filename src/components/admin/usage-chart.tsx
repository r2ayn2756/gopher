"use client"

import * as React from 'react'

type TimeRange = '1' | '7' | '30'

interface DataPoint {
  date: string
  count: number
}

interface UsageChartProps {
  data: DataPoint[]
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  loading?: boolean
}

export function UsageChart({ data, timeRange, onTimeRangeChange, loading }: UsageChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const chartHeight = 300

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Student Activity</h3>
          <p className="text-sm text-gray-600">Messages sent per day</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
          {(['1', '7', '30'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '1' ? '24h' : `${range}d`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: chartHeight }}>
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: chartHeight }}>
          <div className="text-gray-500">No data available</div>
        </div>
      ) : (
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-gray-500">
            <span>{maxCount}</span>
            <span>{Math.floor(maxCount / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#32ff00" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#32ff00" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={`${(i / 4) * 100}%`}
                  x2="100%"
                  y2={`${(i / 4) * 100}%`}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Bars */}
              {data.map((point, i) => {
                const barWidth = Math.max(100 / data.length - 2, 4)
                const x = (i / data.length) * 100 + (100 / data.length - barWidth) / 2
                const height = (point.count / maxCount) * 100
                const y = 100 - height

                return (
                  <g key={i}>
                    <rect
                      x={`${x}%`}
                      y={`${y}%`}
                      width={`${barWidth}%`}
                      height={`${height}%`}
                      fill="url(#barGradient)"
                      rx="4"
                      className="transition-all duration-200 hover:opacity-80"
                    >
                      <title>{`${formatDate(point.date, timeRange)}: ${point.count} messages`}</title>
                    </rect>
                    {point.count > 0 && (
                      <text
                        x={`${x + barWidth / 2}%`}
                        y={`${y - 2}%`}
                        textAnchor="middle"
                        className="fill-gray-700 text-xs font-medium"
                        style={{ fontSize: '11px' }}
                      >
                        {point.count}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* X-axis labels */}
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              {data.map((point, i) => {
                if (data.length > 10 && i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) {
                  return <span key={i} />
                }
                return (
                  <span key={i} className="text-center">
                    {formatDate(point.date, timeRange)}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function generateLinePath(data: DataPoint[], maxCount: number): string {
  if (data.length === 0) return ''

  const points = data.map((point, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (point.count / maxCount) * 100
    return `${x},${y}`
  })

  return `M ${points.join(' L ')}`
}

function generateAreaPath(data: DataPoint[], maxCount: number, height: number): string {
  if (data.length === 0) return ''

  const points = data.map((point, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (point.count / maxCount) * 100
    return [x, y]
  })

  const pathStart = `M 0,100`
  const pathPoints = points.map(([x, y]) => `L ${x},${y}`).join(' ')
  const pathEnd = `L 100,100 Z`

  return `${pathStart} ${pathPoints} ${pathEnd}`
}

function formatDate(dateStr: string, timeRange: TimeRange): string {
  const date = new Date(dateStr)

  if (timeRange === '1') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  }

  if (timeRange === '7') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
