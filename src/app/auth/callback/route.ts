import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      let finalNext = next;
      
      // Determine if they are superadmin to override redirect
      if (data?.user) {
        const { db } = await import('@/db');
        const { users } = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, data.user.id)
        });
        if (dbUser?.role === 'superadmin') {
          finalNext = '/superadmin';
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${finalNext}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${finalNext}`)
      } else {
        return NextResponse.redirect(`${origin}${finalNext}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=Could not login with provider`)
}
