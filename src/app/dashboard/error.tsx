'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="p-8 text-red-500 bg-red-50 dark:bg-red-950/20 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <pre className="whitespace-pre-wrap">{error.message || String(error)}</pre>
      {error.stack && (
        <pre className="whitespace-pre-wrap text-sm mt-4 text-red-400">{error.stack}</pre>
      )}
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
