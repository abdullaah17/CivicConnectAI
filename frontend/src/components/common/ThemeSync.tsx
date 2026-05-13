'use client'

/**
 * ThemeSync — the ONLY place that touches document.documentElement.
 * Runs inside useEffect so it never fires during SSR or hydration.
 */
import { useEffect } from 'react'
import { useUIStore, applyThemeToDom } from '@/store/uiStore'

export const ThemeSync = () => {
  const theme = useUIStore((s) => s.theme)

  // Apply on mount (picks up persisted value) and on every change
  useEffect(() => {
    applyThemeToDom(theme)
  }, [theme])

  return null
}
