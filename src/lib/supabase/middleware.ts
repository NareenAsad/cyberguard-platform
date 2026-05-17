import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback', '/auth/error']
  const isPublicRoute = pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))

  // If user is not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)

    const redirectResponse = NextResponse.redirect(url)

    // If the session was invalid (stale refresh token), clear all auth cookies
    // so the browser doesn't keep sending them and triggering the same error
    // on every subsequent request.
    if (authError && (authError as { code?: string }).code === 'refresh_token_not_found') {
      request.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) {
          redirectResponse.cookies.delete(name)
        }
      })
    }

    return redirectResponse
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // If logged-in user visits '/', send them straight to the dashboard
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }


  // ── Role-based route protection ─────────────────────────────────────────────
  const ROLE_ROUTES: Record<string, string[]> = {
    '/admin':   ['manager', 'admin'],
    '/reports': ['analyst', 'manager', 'admin'],
  }

  const matchedEntry = Object.entries(ROLE_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  )

  if (user && matchedEntry) {
    const [, allowedRoles] = matchedEntry
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !allowedRoles.includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
