import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN?.trim();
const configuredSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE);

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: Number.isFinite(configuredSampleRate)
    ? Math.min(Math.max(configuredSampleRate, 0), 1)
    : 0.1,
  sendDefaultPii: false,
});
