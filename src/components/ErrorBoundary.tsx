import { Component, ErrorInfo, ReactNode } from "react";

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
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Structured console capture — picked up by observability tooling.
    console.error("[ErrorBoundary]", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
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
