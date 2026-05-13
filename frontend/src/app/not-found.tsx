import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="font-display font-bold text-2xl">404</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-700 text-white px-5 py-2.5 rounded font-medium hover:bg-primary-900 transition-colors min-h-[44px]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
