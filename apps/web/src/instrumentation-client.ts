import { init } from '@sentry/nextjs'

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_KAIA_WEB,
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: 0.1,
})
