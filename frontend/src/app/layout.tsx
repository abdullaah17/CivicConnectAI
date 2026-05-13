import type { Metadata } from 'next'
import { Providers } from './providers'
import { VideoBackground } from '@/components/common/VideoBackground'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CivicConnect',
    template: '%s | CivicConnect',
  },
  description: 'City civic services platform — report issues, apply for permits, stay informed.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="font-body text-gray-900 antialiased"
        style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'transparent' }}
      >
        {/* Fixed video layer — sits behind everything, z-index -10 */}
        <VideoBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
