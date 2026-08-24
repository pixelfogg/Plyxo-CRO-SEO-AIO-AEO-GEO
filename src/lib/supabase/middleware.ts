import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/superadmin', '/admin']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Community edition is a single-user local install with a mocked auth user.
  // No landing page, no login/signup walls — route straight to /dashboard.
  if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'true') {
    const path = request.nextUrl.pathname;
    if (
      path === '/' ||
      path === '/login' ||
      path === '/signup' ||
      path === '/reset-password' ||
      path === '/onboarding' ||
      path.startsWith('/auth/')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() refreshes the session AND is the auth check. Do not
  // remove it — the previous version skipped it and left every route open.
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(url)
  }

  if (user && isProtected && path !== '/auth/mfa') {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    
    if (!error && data?.nextLevel === 'aal2' && data?.nextLevel !== data?.currentLevel) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/mfa'
      url.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
