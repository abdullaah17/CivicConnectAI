'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster
      position="bottom-right"
      toastOptions={{
        success: { duration: 4000 },
        error:   { duration: Infinity },
        style: {
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        },
      }}
    />
    {process.env.NODE_ENV === 'development' && (
      <ReactQueryDevtools initialIsOpen={false} />
    )}
  </QueryClientProvider>
)
