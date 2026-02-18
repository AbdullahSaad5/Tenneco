// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://54269728b3a0ac4a45281d7c8deaed14@o4510909093576704.ingest.us.sentry.io/4510909095149568",

  environment: process.env.NODE_ENV,

  integrations: [
    // Session Replay - captures DOM snapshots for error debugging
    Sentry.replayIntegration({
      // Capture network request/response bodies for debugging API issues
      networkDetailAllowUrls: [
        window.location.origin,
        /api/,
      ],
      networkCaptureBodies: true,
      networkRequestHeaders: ["Content-Type", "Authorization"],
      networkResponseHeaders: ["Content-Type"],
    }),

    // Browser tracing - automatic pageload/navigation spans + web vitals
    Sentry.browserTracingIntegration(),

    // User feedback widget - lets users report bugs with screenshots
    Sentry.feedbackIntegration({
      colorScheme: "system",
      autoInject: true,
      showBranding: false,
      triggerLabel: "Report a Bug",
      formTitle: "Report a Bug",
      submitButtonLabel: "Send Report",
      messagePlaceholder: "Describe what happened...",
      successMessageText: "Thank you for your report!",
    }),

    // Capture console.error calls as breadcrumbs
    Sentry.captureConsoleIntegration({ levels: ["error", "warn"] }),

    // HTTP client errors (4xx, 5xx) as Sentry events
    Sentry.httpClientIntegration(),

    // Browser profiling for performance diagnostics
    Sentry.browserProfilingIntegration(),
  ],

  // Capture 100% of traces in development, 20% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // Profile 100% of sampled transactions
  profilesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Replay: 10% of sessions normally, 100% when an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Capture HTTP client errors (4xx/5xx responses)
  sendDefaultPii: true,

  // Attach stack traces to all messages (not just errors)
  attachStacktrace: true,

  // Max breadcrumbs for debugging context
  maxBreadcrumbs: 100,

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Browser extensions and third-party scripts
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.epicplay.com",
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    "http://loading.retry.widdit.com/",
    "atomicFindClose",
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Common browser quirks
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
    // Network errors that are usually transient
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    "AbortError",
  ],

  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
    // Safari extensions
    /^safari-extension:\/\//i,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
