interface IssueRow {
  rank: number
  category: string
  department: string
  count: number
  percentage: number
}

interface TopIssuesTableProps {
  data: IssueRow[]
}

export const TopIssuesTable = ({ data }: TopIssuesTableProps) => (
  <div className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
    <h3 className="font-display font-semibold text-gray-900 mb-4">Top Issues (Last 30 Days)</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Count</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">% of Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => (
            <tr key={row.rank} className="hover:bg-gray-50 transition-colors">
              <td className="py-2.5 px-3 text-gray-400 font-mono-civic text-xs">{row.rank}</td>
              <td className="py-2.5 px-3 font-medium text-gray-900">{row.category}</td>
              <td className="py-2.5 px-3 text-gray-600">{row.department}</td>
              <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{row.count}</td>
              <td className="py-2.5 px-3 text-right text-gray-500">{row.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
