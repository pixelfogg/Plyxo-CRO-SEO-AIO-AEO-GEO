import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScanSearch } from 'lucide-react'
import { PlyxoLogo } from '@/components/ui/logo'
import { SubmitButton } from '@/components/submit-button'
import { OAuthButtons } from '@/components/oauth-buttons'

import { redirect } from 'next/navigation'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
    redirect('/dashboard');
  }

  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Link href="/" className="mb-8 flex items-center space-x-2 text-zinc-900 dark:text-white hover:opacity-80 transition-opacity">
        <PlyxoLogo className="h-8" />
      </Link>
      
      <Card className="w-full max-w-sm border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OAuthButtons />
          <form className="space-y-4" action={signup}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
            {message && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                {message}
              </div>
            )}
            <SubmitButton className="w-full" loadingText="Creating account...">
              Sign Up
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
