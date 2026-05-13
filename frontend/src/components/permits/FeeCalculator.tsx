import { formatCurrency } from '@/utils/formatDate'
import type { FeeBreakdown } from '@/types/permit'

interface FeeCalculatorProps {
  breakdown: FeeBreakdown[]
  total: number
}

export const FeeCalculator = ({ breakdown, total }: FeeCalculatorProps) => (
  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-200">
      <h4 className="font-semibold text-gray-900 text-sm">Fee Breakdown</h4>
    </div>
    <div className="divide-y divide-gray-100">
      {breakdown.map((item, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-gray-600">{item.label}</span>
          <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-t border-primary-100">
      <span className="font-bold text-gray-900">Total</span>
      <span className="font-bold text-primary-700 text-lg">{formatCurrency(total)}</span>
    </div>
  </div>
)
