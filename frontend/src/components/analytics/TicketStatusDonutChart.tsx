'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StatusData {
  status: string
  count: number
}

interface TicketStatusDonutChartProps {
  data: StatusData[]
  onSegmentClick?: (status: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  'Submitted':    '#3B82F6',
  'Under Review': '#6366F1',
  'Assigned':     '#8B5CF6',
  'In Progress':  '#F59E0B',
  'Resolved':     '#16A34A',
  'Closed':       '#6B7280',
}

export const TicketStatusDonutChart = ({ data, onSegmentClick }: TicketStatusDonutChartProps) => {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
      <h3 className="font-display font-semibold text-gray-900 mb-4">Tickets by Status</h3>
      {/* Accessible data table (visually hidden) */}
      <table className="sr-only">
        <caption>Ticket counts by status</caption>
        <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.status}>
              <td>{d.status}</td>
              <td>{d.count}</td>
              <td>{total > 0 ? Math.round((d.count / total) * 100) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveContainer width="100%" height={240} aria-hidden="true">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            onClick={(entry) => onSegmentClick?.(entry.status)}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] || '#9CA3AF'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
              name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
