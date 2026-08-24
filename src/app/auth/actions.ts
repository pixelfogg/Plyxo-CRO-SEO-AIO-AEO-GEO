'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
    redirect('/dashboard')
  }
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  // Fetch the role to redirect correctly
  const { db } = await import('@/db');
  const { users } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');
  
  let redirectUrl = '/dashboard';
  
  if (authData?.user) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authData.user.id)
    });
    
    if (dbUser?.role === 'superadmin') {
      redirectUrl = '/superadmin';
    }
  }

  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

export async function signup(formData: FormData) {
  if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
    redirect('/dashboard')
  }
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
    redirect('/dashboard')
  }
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

import { Provider } from '@supabase/supabase-js'

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function superadminLogin(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    redirect('/superadmin/login?message=Could not authenticate user');
  }
  revalidatePath('/', 'layout');
  redirect('/superadmin');
}
