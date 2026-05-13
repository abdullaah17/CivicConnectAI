'use client'

import { useUIStore } from '@/store/uiStore'

/**
 * VideoBackground
 *
 * Renders the cinematic video as a fixed, full-viewport layer behind all content.
 * In dark mode the overlay intensifies so the scene reads as "night".
 */
export const VideoBackground = () => {
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* The video itself */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        style={{ filter: isDark ? 'brightness(0.35) saturate(0.6)' : 'brightness(1) saturate(1)' }}
      />

      {/* Noise texture overlay */}
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

      {/* Gradient overlay — much heavier in dark mode */}
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-700"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.70) 50%, rgba(0,0,0,0.88) 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.50) 100%)',
        }}
      />

      {/* Extra deep-blue tint in dark mode for that "night city" feel */}
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(10, 15, 40, 0.45)', mixBlendMode: 'multiply' }}
        />
      )}
    </div>
  )
}
