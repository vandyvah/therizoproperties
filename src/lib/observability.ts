/**
 * Lightweight global error observability.
 * Captures uncaught errors + unhandled promise rejections and emits
 * structured console entries that external log collectors can parse.
 *
 * No external SDK is loaded — keeps bundle size and privacy footprint minimal.
 */

let installed = false;

interface CapturedEvent {
  kind: "error" | "unhandledrejection";
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  url: string;
  ts: string;
}

const emit = (evt: CapturedEvent) => {
  // Grouped log so DevTools + log-scrapers can identify it.
  console.error("[observability]", evt);
  // Fire-and-forget report to analytics_events for staff visibility.
  // Import lazily to avoid a circular dep during module init.
  import("@/lib/analytics")
    .then(({ track }) =>
      track("client_error", {
        source: evt.kind,
        message: (evt.message || "").slice(0, 500),
        stack: (evt.stack || "").slice(0, 1500),
        file: evt.source ? `${evt.source}:${evt.lineno ?? "?"}:${evt.colno ?? "?"}` : null,
        url: evt.url.slice(0, 500),
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
      }),
    )
    .catch(() => undefined);
};

export const installObservability = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    // Ignore benign ResizeObserver noise from third-party widgets.
    if (event.message && event.message.includes("ResizeObserver loop")) return;
    emit({
      kind: "error",
      message: event.message || "Unknown error",
      stack: event.error?.stack,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
      ts: new Date().toISOString(),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: any = event.reason;
    emit({
      kind: "unhandledrejection",
      message:
        (reason && (reason.message || String(reason))) || "Unhandled promise rejection",
      stack: reason?.stack,
      url: window.location.href,
      ts: new Date().toISOString(),
    });
  });
};
