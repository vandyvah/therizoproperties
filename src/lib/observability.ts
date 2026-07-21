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
