'use client'

import { Button } from '@/components/ui/button'
import { SplitSquareHorizontal, Activity, Terminal } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

export function ProjectHeaderActions({ projectId, hasMultipleScans }: { projectId: string, hasMultipleScans: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const isCompareMode = searchParams.get('compare') === 'true'
  const selectedScans = searchParams.getAll('scan')

  const handleCompare = () => {
    if (selectedScans.length === 2) {
      router.push(`/dashboard/projects/${projectId}/compare?scanA=${selectedScans[0]}&scanB=${selectedScans[1]}`)
    }
  }

  const getCompareLink = () => {
    if (isCompareMode) return pathname
    return `${pathname}?compare=true`
  }

  return (
    <div className="flex items-center gap-2">
      {hasMultipleScans && (
        <>
          {isCompareMode && (
            <Button 
              size="sm" 
              onClick={handleCompare} 
              disabled={selectedScans.length !== 2}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
            >
              Compare Selected ({selectedScans.length}/2)
            </Button>
          )}
          
          <Link href={getCompareLink()}>
            <Button 
              size="sm" 
              variant={isCompareMode ? "secondary" : "outline"}
              className="h-9"
            >
              <SplitSquareHorizontal className="h-4 w-4 mr-2" />
              {isCompareMode ? 'Cancel Compare' : 'Compare Scans'}
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}
