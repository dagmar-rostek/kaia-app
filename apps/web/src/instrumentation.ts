export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs')
    init({
      dsn: process.env.SENTRY_KAIA_WEB,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: 0.1,
    })
  }
}

export async function onRequestError(
  err: { digest: string } & Error,
  request: { path: string; method: string; headers: Record<string, string | string[]> },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(err, request, context)
}
