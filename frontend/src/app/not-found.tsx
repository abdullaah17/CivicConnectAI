'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-black/60 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="font-bold text-2xl" style={{ color: '#E1E0CC' }}>404</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-white drop-shadow mb-2">Page not found</h1>
        <p className="text-white/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-black text-[#E1E0CC] px-5 py-2.5 rounded font-medium hover:bg-black/80 transition-colors min-h-[44px]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-5 py-2.5 rounded font-medium hover:bg-white/10 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
