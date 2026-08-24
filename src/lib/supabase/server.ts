import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'true') {
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'community@local',
      role: 'authenticated',
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: { name: 'Community User' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // @ts-ignore
    client.auth.getUser = async () => ({
      data: { user: mockUser },
      error: null
    });
    
    // @ts-ignore
    client.auth.getSession = async () => ({
      data: { session: { user: mockUser, access_token: 'mock', refresh_token: 'mock', expires_in: 3600, token_type: 'bearer' } },
      error: null
    });
  }

  return client;
}
