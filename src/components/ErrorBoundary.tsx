import { Component, ErrorInfo, ReactNode } from "react";
import { track } from "@/lib/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Route-level error boundary.
 * Catches render errors so a single broken route can't blank the whole app.
 * Reports runtime crashes to analytics_events for staff visibility.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
    try {
      track("client_error", {
        source: "react_error_boundary",
        message: (error.message || "").slice(0, 500),
        stack: (error.stack || "").slice(0, 1500),
        component_stack: (info.componentStack || "").slice(0, 1500),
        url: typeof window !== "undefined" ? window.location.href.slice(0, 500) : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
      });
    } catch {
      /* never let reporting throw */
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        style={{
          minHeight: "60dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          textAlign: "center",
          color: "#081A2F",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Something went wrong
        </h1>
        <p style={{ maxWidth: 480, marginBottom: "1.5rem", color: "#374151" }}>
          We hit an unexpected error loading this page. Our team has been notified.
          Please refresh, or return to the homepage.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={this.handleReset}
            style={{
              background: "#081A2F",
              color: "#fff",
              padding: "0.65rem 1.25rem",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Refresh page
          </button>
          <a
            href="/"
            style={{
              background: "transparent",
              color: "#081A2F",
              padding: "0.65rem 1.25rem",
              borderRadius: 6,
              border: "1px solid #081A2F",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
