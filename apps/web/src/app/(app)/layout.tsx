'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { authFetch } from '@/lib/auth'

// Pages inside (app) that must not trigger a redirect loop
const JOURNEY_BYPASS = ['/onboarding', '/survey']

interface UserMe {
  ki_disclosure_seen_at: string | null
  onboarding_complete: boolean
}

interface JourneyState {
  state: 'pre_pending' | 'active' | 'post_pending' | 'completed'
}

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
        const user = await res.json() as UserMe

        // Step 1: KI-Disclosure muss vor allem anderen bestätigt worden sein
        if (!user.ki_disclosure_seen_at) {
          router.replace('/ki-disclosure')
          return
        }

        // Step 2: Lernthema muss gesetzt sein
        if (!user.onboarding_complete) {
          router.replace('/onboarding')
          return
        }

        // Step 3: Eingangsbefragung muss abgeschlossen sein
        const journeyRes = await authFetch('/api/v1/survey/journey')
        if (!journeyRes.ok) return
        const journey = await journeyRes.json() as JourneyState

        if (journey.state === 'pre_pending') {
          router.replace('/survey/pre')
        }
      } catch { /* silent — page handles further auth errors */ }
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
