const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...init }),
}

export interface HealthResponse {
  status: string
  study_mode: string
  version: string
}

export const healthApi = {
  get: () => api.get<HealthResponse>("/v1/health"),
}

export interface BugReportRequest {
  vorname: string
  email: string
  beschreibung: string
}

export const bugReportApi = {
  submit: (data: BugReportRequest) => api.post<{ ok: boolean }>("/v1/bug-report", data),
}
