'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import './globals.css'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="de">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Etwas ist schiefgelaufen</h1>
          <p className="text-muted-foreground text-sm">{error.digest ? `Fehler-ID: ${error.digest}` : 'Ein unerwarteter Fehler ist aufgetreten.'}</p>
          <button
            onClick={() => unstable_retry()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  )
}
