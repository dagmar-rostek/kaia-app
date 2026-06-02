'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiRefresh, apiLogout } from '@/lib/auth'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  state: AuthState
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    apiRefresh()
      .then(() => setState('authenticated'))
      .catch(() => setState('unauthenticated'))
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    window.location.replace('/login')
  }, [])

  return (
    <AuthContext.Provider value={{ state, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  return ctx
}
