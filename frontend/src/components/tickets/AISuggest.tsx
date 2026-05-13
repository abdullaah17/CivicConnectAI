'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, X } from 'lucide-react'
import { clsx } from 'clsx'
import api from '@/lib/api'

interface AISuggestion {
  department_id: string
  department_name: string
  category: string
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface AISuggestProps {
  description: string
  onAccept: (departmentId: string, category: string) => void
  className?: string
}

const confidenceColors = {
  high:   'text-success bg-success/10 border-success/30',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low:    'text-gray-500 bg-gray-50 border-gray-200',
}

const confidenceLabels = {
  high:   'High confidence',
  medium: 'Medium confidence',
  low:    'Low confidence',
}

export const AISuggest = ({ description, onAccept, className }: AISuggestProps) => {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState(false)

  const getSuggestion = async () => {
    if (!description || description.length < 20 || loading) return
    setLoading(true)
    setError(false)
    setDismissed(false)
    setSuggestion(null)
    try {
      const { data } = await api.post('/ai/categorize', { description })
      setSuggestion(data.data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = () => {
    if (!suggestion) return
    onAccept(suggestion.department_id, suggestion.category)
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Trigger button */}
      {!suggestion && !loading && (
        <button
          type="button"
          onClick={getSuggestion}
          disabled={description.length < 20}
          className={clsx(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all',
            'border border-dashed',
            description.length >= 20
              ? 'border-primary-500 text-primary-700 hover:bg-primary-50 cursor-pointer'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          )}
          aria-label="Get AI category suggestion"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          AI Suggest Category
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-primary-700 animate-pulse">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Analysing your description…
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <p className="text-sm text-danger flex items-center gap-1">
          AI suggestion unavailable. Please select manually.
        </p>
      )}

      {/* Suggestion card */}
      {suggestion && !loading && (
        <div
          className={clsx(
            'rounded-lg border p-4 space-y-3',
            'bg-white shadow-sm'
          )}
          role="region"
          aria-label="AI category suggestion"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-700 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-900">AI Suggestion</span>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss AI suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Department</p>
              <p className="font-medium text-gray-900">{suggestion.department_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Category</p>
              <p className="font-medium text-gray-900">{suggestion.category}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 italic leading-relaxed">
            &ldquo;{suggestion.reasoning}&rdquo;
          </p>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full border',
                confidenceColors[suggestion.confidence]
              )}
            >
              {confidenceLabels[suggestion.confidence]}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1"
              >
                Ignore
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-900 px-3 py-1.5 rounded transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                Apply Suggestion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
