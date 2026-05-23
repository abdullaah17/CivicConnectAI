'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle } from 'lucide-react'

export interface FunnelStage {
  stage: string
  count: number
  percentage?: number
}

interface PermitFunnelChartProps {
  data?: FunnelStage[]
  title?: string
}

// Demo data if no real data provided
const DEMO_DATA: FunnelStage[] = [
  { stage: 'Submitted', count: 45, percentage: 100 },
  { stage: 'Document Verification', count: 38, percentage: 84 },
  { stage: 'Inspection Scheduled', count: 32, percentage: 71 },
  { stage: 'Approved', count: 28, percentage: 62 },
  { stage: 'Rejected', count: 4, percentage: 9 },
]

const STAGE_COLORS: Record<string, string> = {
  'Submitted': '#3B82F6',
  'Document Verification': '#6366F1',
  'Inspection Scheduled': '#F59E0B',
  'Approved': '#16A34A',
  'Rejected': '#DC2626',
}

export const PermitFunnelChart = ({
  data = DEMO_DATA,
  title = 'Permit Application Pipeline',
}: PermitFunnelChartProps) => {
  const displayData = data.length > 0 ? data : DEMO_DATA
  const total = displayData[0]?.count ?? 0

  // Calculate percentages if not provided
  const dataWithPercentages = displayData.map((item) => ({
    ...item,
    percentage: item.percentage ?? (total > 0 ? Math.round((item.count / total) * 100) : 0),
  }))

  return (
    <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {data.length === 0 && (
          <span className="text-xs text-gray-400">Demo data</span>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataWithPercentages}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#6B7280" />
            <YAxis dataKey="stage" type="category" stroke="#6B7280" width={190} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'count') return [value, 'Applications']
                if (name === 'percentage') return [`${value}%`, 'Conversion']
                return value
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Applications" radius={[0, 8, 8, 0]}>
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stage] ?? '#3B82F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {dataWithPercentages.map((item) => (
            <div key={item.stage} className="text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: STAGE_COLORS[item.stage] ?? '#9CA3AF' }}
                aria-hidden="true"
              />
              <p className="font-medium text-gray-900">{item.count}</p>
              <p className="text-gray-500">{item.stage}</p>
              <p className="text-gray-400 mt-0.5">{item.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
        {dataWithPercentages.length > 0 && (
          <>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>{dataWithPercentages[0].count}</strong> applications submitted
              </span>
            </div>
            {dataWithPercentages.find((d) => d.stage === 'Approved') && (
              <div className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-success flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>
                    {dataWithPercentages.find((d) => d.stage === 'Approved')?.count ?? 0}
                  </strong>{' '}
                  approved ({dataWithPercentages.find((d) => d.stage === 'Approved')?.percentage ?? 0}% conversion)
                </span>
              </div>
            )}
            {dataWithPercentages.find((d) => d.stage === 'Rejected') && (
              <div className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>{dataWithPercentages.find((d) => d.stage === 'Rejected')?.count ?? 0}</strong> rejected
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
