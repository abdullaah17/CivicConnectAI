'use client'

/**
 * VideoBackground
 *
 * Renders the Prisma video as a fixed, full-viewport layer behind all app content.
 * Pointer-events are disabled so it never intercepts any clicks.
 * z-index is -10 so every UI element sits on top naturally.
 */
export const VideoBackground = () => (
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
    />

    {/* Noise texture overlay — same as Prisma hero */}
    <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

    {/* Dark gradient so UI text stays readable */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
  </div>
)
