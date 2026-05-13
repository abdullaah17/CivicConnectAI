'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface DataPoint {
  date: string
  avg_hours: number
}

interface ResolutionTimeLineChartProps {
  data: DataPoint[]
  slaHours?: number
}

export const ResolutionTimeLineChart = ({ data, slaHours }: ResolutionTimeLineChartProps) => (
  <div className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
    <h3 className="font-display font-semibold text-gray-900 mb-4">Average Resolution Time (hours)</h3>
    {/* Accessible table */}
    <table className="sr-only">
      <caption>Average resolution time by date</caption>
      <thead><tr><th>Date</th><th>Avg Hours</th></tr></thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.date}><td>{d.date}</td><td>{d.avg_hours}</td></tr>
        ))}
      </tbody>
    </table>
    <ResponsiveContainer width="100%" height={240} aria-hidden="true">
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            try { return format(parseISO(v), 'MMM d') } catch { return v }
          }}
          tick={{ fontSize: 11, fill: '#6B7280' }}
        />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} unit="h" />
        <Tooltip
          formatter={(v: number) => [`${v}h`, 'Avg Resolution']}
          labelFormatter={(l) => {
            try { return format(parseISO(l), 'dd MMM yyyy') } catch { return l }
          }}
        />
        {slaHours && (
          <ReferenceLine y={slaHours} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'SLA', fill: '#F59E0B', fontSize: 11 }} />
        )}
        <Line
          type="monotone"
          dataKey="avg_hours"
          stroke="#1B3A6B"
          strokeWidth={2}
          dot={{ r: 3, fill: '#1B3A6B' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)
