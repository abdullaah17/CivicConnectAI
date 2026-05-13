'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, ChevronRight, Save } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/common/Button'
import type { PermitType } from '@/types/permit'

export interface WizardStep {
  id: number
  label: string
  component: React.ReactNode
  isValid: boolean
}

interface PermitWizardProps {
  permitType: PermitType
  steps: WizardStep[]
  onSubmit: () => Promise<void>
  onSaveDraft?: () => Promise<void>
  isSubmitting?: boolean
  isSaving?: boolean
}

export const PermitWizard = ({
  permitType,
  steps,
  onSubmit,
  onSaveDraft,
  isSubmitting,
  isSaving,
}: PermitWizardProps) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)

  const isLast = currentStep === steps.length - 1
  const canNext = steps[currentStep]?.isValid

  // Auto-save draft every 30s
  const autoSave = useCallback(async () => {
    if (!onSaveDraft) return
    try {
      await onSaveDraft()
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 3000)
    } catch {
      // silent
    }
  }, [onSaveDraft])

  useEffect(() => {
    const interval = setInterval(autoSave, 30_000)
    return () => clearInterval(interval)
  }, [autoSave])

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
    else router.push('/permits')
  }

  const handleNext = () => {
    if (canNext && !isLast) setCurrentStep((s) => s + 1)
  }

  return (
    <div className="max-w-2xl">
      {/* Step indicator */}
      <nav aria-label="Permit application steps" className="mb-8">
        <ol className="flex items-center" role="list">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep
            const isActive = i === currentStep
            return (
              <li key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                      isCompleted && 'bg-success text-white',
                      isActive && 'bg-primary-700 text-white',
                      !isCompleted && !isActive && 'bg-gray-200 text-gray-500'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className={clsx(
                    'text-xs mt-1 text-center hidden sm:block',
                    isActive ? 'text-primary-700 font-semibold' : 'text-gray-400'
                  )}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={clsx(
                    'flex-1 h-0.5 mx-2 mb-4',
                    isCompleted ? 'bg-success' : 'bg-gray-200'
                  )} aria-hidden="true" />
                )}
              </li>
            )
          })}
        </ol>

        {/* Draft saved indicator */}
        {draftSaved && (
          <p className="text-xs text-success flex items-center gap-1 mt-2" aria-live="polite">
            <Save className="w-3 h-3" aria-hidden="true" />
            Draft saved
          </p>
        )}
      </nav>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 text-lg mb-5">
          Step {currentStep + 1}: {steps[currentStep]?.label}
        </h2>
        {steps[currentStep]?.component}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="md" onClick={handleBack}>
          {currentStep === 0 ? 'Cancel' : '← Back'}
        </Button>

        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button
              variant="ghost"
              size="md"
              onClick={autoSave}
              loading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
          )}
          {isLast ? (
            <Button
              size="md"
              onClick={onSubmit}
              loading={isSubmitting}
              disabled={!canNext}
            >
              Submit Application
            </Button>
          ) : (
            <Button
              size="md"
              onClick={handleNext}
              disabled={!canNext}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
