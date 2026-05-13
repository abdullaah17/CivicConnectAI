import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  trend?: number
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  suffix?: string
}

export const KPICard = ({ label, value, trend, icon, suffix }: KPICardProps) => {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <div
      className="rounded-lg p-5 shadow-card border border-white/20"
      style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'black', color: '#E1E0CC' }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-lg font-normal text-gray-500 ml-1">{suffix}</span>}
      </p>
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
          <span>{trend > 0 ? '+' : ''}{trend}% vs last period</span>
        </div>
      )}
    </div>
  )
}
