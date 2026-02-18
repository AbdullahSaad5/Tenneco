// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://54269728b3a0ac4a45281d7c8deaed14@o4510909093576704.ingest.us.sentry.io/4510909095149568",

  environment: process.env.NODE_ENV,

  // Capture 100% of traces in development, 20% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // Profile 100% of sampled transactions for performance diagnostics
  profilesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII
  sendDefaultPii: true,

  // Attach stack traces to all messages
  attachStacktrace: true,

  // Max breadcrumbs for debugging context
  maxBreadcrumbs: 100,
});
