import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "therizo_cookie_consent_v1";

type Choice = "accepted" | "essential";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // ignore storage errors (private mode)
    }
  }, []);

  const persist = (choice: Choice) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, ts: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use essential cookies to run this site and optional analytics to
            improve it. Read our{" "}
            <Link to="/privacy" className="underline underline-offset-2 font-medium text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => persist("essential")}
              aria-label="Accept only essential cookies"
            >
              Essential only
            </Button>
            <Button
              size="sm"
              onClick={() => persist("accepted")}
              aria-label="Accept all cookies"
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getCookieConsent = (): Choice | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw).choice ?? null;
  } catch {
    return null;
  }
};
