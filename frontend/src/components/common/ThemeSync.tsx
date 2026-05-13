'use client'

/**
 * ThemeSync
 * Runs once on mount and applies the persisted theme from localStorage
 * to <html data-theme="..."> before the first paint.
 * Also subscribes to store changes so toggling updates the attribute live.
 */
import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export const ThemeSync = () => {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return null
}
