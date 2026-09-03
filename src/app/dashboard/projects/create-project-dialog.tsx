'use client'

import { useState } from 'react'
import { createProject } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function CreateProjectDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      await createProject(formData)
      toast.success('Project connected successfully.')
      setOpen(false)
    } catch (error: any) {
      const msg = error?.message || 'Failed to create project'
      setErrorMessage(msg)
      toast.error(msg, {
        action: msg.includes('limit reached') || msg.includes('upgrade') ? {
          label: 'Upgrade Plan',
          onClick: () => router.push('/dashboard/billing'),
        } : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setErrorMessage(null); }}>
      {children ? (
        <DialogTrigger render={typeof children === 'string' ? <button>{children}</button> : (children as React.ReactElement)} />
      ) : (
        <DialogTrigger render={<button className="inline-flex h-9 px-4 py-2 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 cursor-pointer w-fit" />}>
          <PlusCircle className="h-4 w-4" /> Add Project
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Digital Property</DialogTitle>
          <DialogDescription>
            Add a new domain to monitor. We will immediately prepare it for continuous AI CRO audits.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
            <p className="font-semibold">{errorMessage}</p>
            {(errorMessage.includes('limit reached') || errorMessage.includes('upgrade')) && (
              <button
                type="button"
                onClick={() => { setOpen(false); router.push('/dashboard/billing'); }}
                className="mt-2 text-xs font-semibold underline text-[#cc785c] hover:text-[#a9583e] block"
              >
                View Plans &amp; Upgrade Workspace →
              </button>
            )}
          </div>
        )}

        <form action={onSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" name="name" placeholder="Acme Corp" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input id="websiteUrl" name="websiteUrl" placeholder="https://acme.com" required type="url" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" placeholder="e.g. SaaS, E-commerce, Healthcare" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" name="businessType" placeholder="e.g. B2B, B2C" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversionGoal">Primary Conversion Goal</Label>
            <Input id="conversionGoal" name="conversionGoal" placeholder="e.g. Lead Generation, Sales, Signups" />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#cc785c] hover:bg-[#a9583e] text-white">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
