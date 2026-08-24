import Link from 'next/link'
import { superadminLogin } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { SubmitButton } from '@/components/submit-button'

export default async function SuperadminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <Link href="/" className="mb-8 flex items-center space-x-2 text-white hover:opacity-80 transition-opacity">
        <ShieldAlert className="h-8 w-8 text-rose-500" />
        <span className="text-2xl font-bold tracking-tight">Plyxo Superadmin</span>
      </Link>
      
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-950 text-white shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Command Center</CardTitle>
          <CardDescription className="text-zinc-400">
            Authorized personnel only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={superadminLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Admin Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@plyxo.com"
                required
                className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-rose-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-black border-zinc-800 text-white focus-visible:ring-rose-500"
              />
            </div>
            {message && (
              <div className="p-3 rounded-md bg-rose-950/50 border border-rose-900/50 text-rose-400 text-sm font-medium">
                {message}
              </div>
            )}
            <SubmitButton className="w-full bg-rose-600 hover:bg-rose-700 text-white" loadingText="Authenticating...">
              Login to Command Center
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8 text-xs text-zinc-600 text-center max-w-sm">
        Warning: Unauthorized access to this system is strictly prohibited and logged.
      </div>
    </div>
  )
}
