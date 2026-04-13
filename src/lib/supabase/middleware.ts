import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define role-based route permissions
const routePermissions: Record<string, string[]> = {
  '/': ['admin', 'analyst', 'manager'],
  '/threats': ['admin', 'analyst', 'manager'],
  '/incident-response': ['admin', 'analyst', 'manager'],
  '/risk-analysis': ['admin', 'analyst', 'manager'],
  '/reports': ['admin', 'analyst', 'manager'],
  '/playbooks': ['admin', 'analyst', 'manager'],
  '/settings': ['admin', 'manager'],
  '/users': ['admin'],
}

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/sign-up', '/auth/callback', '/auth/error', '/auth/sign-up-success', '/unauthorized']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If user is logged in and tries to access login page, redirect to dashboard
    if (user && pathname === '/auth/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // If no user and trying to access protected route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Get user's role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'analyst'

  // Check route permissions
  const matchingRoute = Object.keys(routePermissions).find(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })

  if (matchingRoute) {
    const allowedRoles = routePermissions[matchingRoute]
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have permission, redirect to dashboard with error
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
