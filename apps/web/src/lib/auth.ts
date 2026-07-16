const API = process.env.NEXT_PUBLIC_API_URL ?? '/api'

// Access token lebt nur im Speicher — überlebt keinen Page-Reload (gewollt).
// Beim nächsten Load stellt /auth/refresh die Session wieder her (httpOnly-Cookie).
let _accessToken: string | null = null

export const tokenStore = {
  get: () => _accessToken,
  set: (t: string) => { _accessToken = t },
  clear: () => { _accessToken = null },
}

export async function apiRefresh(): Promise<string> {
  const res = await fetch(`${API}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Nicht angemeldet')
  const data = await res.json() as { access_token: string }
  tokenStore.set(data.access_token)
  return data.access_token
}

export async function apiLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? 'Anmeldung fehlgeschlagen')
  }
  const data = await res.json() as { access_token: string }
  tokenStore.set(data.access_token)
}

export async function apiForgotPassword(email: string): Promise<void> {
  await fetch(`${API}/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  // Always resolves — 204 regardless of whether email exists (no enumeration)
}

export async function apiResetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${API}/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? 'Passwort zurücksetzen fehlgeschlagen.')
  }
}

export async function apiLogout(): Promise<void> {
  const token = tokenStore.get()
  await fetch(`${API}/v1/auth/logout`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  }).catch(() => null)
  tokenStore.clear()
}

function redirectToLogin(): never {
  window.location.replace('/login')
  throw new Error('Sitzung abgelaufen')
}

// Authenticated fetch — refresht automatisch bei 401
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  let token = tokenStore.get()
  if (!token) {
    try {
      token = await apiRefresh()
    } catch {
      redirectToLogin()
    }
  }

  const doFetch = (t: string) =>
    fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${t}` },
      credentials: 'include',
    })

  const res = await doFetch(token)
  if (res.status !== 401) return res

  try {
    const newToken = await apiRefresh()
    return doFetch(newToken)
  } catch {
    redirectToLogin()
  }
}
