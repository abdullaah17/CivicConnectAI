import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  trend?: number        // percentage vs previous period
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  suffix?: string
}

const colorMap = {
  blue:   'bg-primary-50 text-primary-700',
  green:  'bg-success-bg text-success',
  amber:  'bg-amber-100 text-amber-700',
  red:    'bg-danger-bg text-danger',
  purple: 'bg-purple-50 text-purple-700',
}

export const KPICard = ({ label, value, trend, icon, color = 'blue', suffix }: KPICardProps) => {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <div className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-display">{label}</p>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', colorMap[color])}>
            <span aria-hidden="true">{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold font-display text-gray-900">
          {value}
          {suffix && <span className="text-lg font-normal text-gray-500 ml-1">{suffix}</span>}
        </p>
      </div>
      {trend !== undefined && (
        <div className={clsx(
          'flex items-center gap-1 mt-2 text-xs font-medium',
          trendPositive ? 'text-success' : trendNegative ? 'text-danger' : 'text-gray-400'
        )}>
          {trendPositive ? (
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : trendNegative ? (
            <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>
            {trend > 0 ? '+' : ''}{trend}% vs last period
          </span>
        </div>
      )}
    </div>
  )
}
