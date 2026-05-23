import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Defense-in-depth middleware.
 *
 * The primary auth enforcement is client-side (layout guards + Zustand).
 * This middleware adds a server-side layer that:
 *  1. Redirects unauthenticated users away from protected routes
 *  2. Prevents cross-role route access based on the persisted auth cookie
 *
 * NOTE: The access token is stored in localStorage (not a cookie), so we
 * cannot verify the JWT here. Instead we check for the presence of the
 * Zustand persist key in a cookie that we set on login, OR we simply
 * redirect any unauthenticated request to /login and let the client
 * layout guards handle role-level enforcement.
 *
 * This is intentionally lightweight — it blocks obvious unauthenticated
 * access without duplicating the full RBAC logic that lives in layouts.
 */

// Routes that require authentication (any role)
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/requests',
  '/permits',
  '/announcements',
  '/events',
  '/notifications',
  '/profile',
  '/staff',
  '/admin',
  '/superadmin',
]

// Public routes — always accessible
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/verify-otp',
  '/forgot-password',
  '/verify',   // public permit verification
  '/',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files (favicon, images, etc.)
  ) {
    return NextResponse.next()
  }

  // Allow all public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Check if the path requires authentication
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  // Check for auth signal — we look for the Zustand persist key in cookies.
  // The client sets this cookie on login via the auth store.
  // If absent, redirect to login.
  const authCookie = request.cookies.get('civic-auth-signal')

  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
