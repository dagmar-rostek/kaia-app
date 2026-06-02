'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/context/AuthContext'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (state === 'unauthenticated') {
      router.replace('/login')
    }
  }, [state, router])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-muted-foreground animate-pulse">Laden…</span>
      </div>
    )
  }

  if (state === 'unauthenticated') return null

  return <>{children}</>
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  )
}
