'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { authFetch } from '@/lib/auth'

// Pages where the journey-state check should not trigger a redirect
const JOURNEY_BYPASS = ['/onboarding', '/survey']

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const checkedRef = useRef(false)

  useEffect(() => {
    if (state === 'unauthenticated') {
      router.replace('/login')
      return
    }
    if (state !== 'authenticated') return
    if (checkedRef.current) return
    if (JOURNEY_BYPASS.some(p => pathname.startsWith(p))) return

    checkedRef.current = true
    const check = async () => {
      try {
        const res = await authFetch('/api/v1/users/me')
        if (!res.ok) return
        const user = await res.json() as { learning_topic?: string | null }
        if (!user.learning_topic) {
          router.replace('/onboarding')
        }
      } catch { /* silent — chat page handles further auth errors */ }
    }
    void check()
  }, [state, pathname, router])

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
