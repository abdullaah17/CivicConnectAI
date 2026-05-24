'use client'

import { useEffect } from 'react'

const PING_URL = 'https://civicconnectai-ze4s.onrender.com/health'
const INTERVAL_MS = 14 * 60 * 1000 // 14 minutes — Render spins down after 15

/**
 * Keeps the Render backend warm by pinging /health every 14 minutes.
 * Render free tier spins down after 15 minutes of inactivity; this prevents
 * the cold-start delay during demos.
 *
 * Renders nothing — purely a side-effect component.
 */
export function KeepAlive() {
  useEffect(() => {
    // Ping immediately on mount so the backend is warm right away
    fetch(PING_URL).catch(() => {})

    const id = setInterval(() => {
      fetch(PING_URL).catch(() => {})
    }, INTERVAL_MS)

    return () => clearInterval(id)
  }, [])

  return null
}
