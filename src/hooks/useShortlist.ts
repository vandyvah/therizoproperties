import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "therizo:shortlist:v1";
const TOKEN_KEY = "therizo:shortlist:sync-token";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("therizo:shortlist", { detail: ids }));
  } catch {
    /* quota / privacy mode — silent */
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function pushToCloud(ids: string[]) {
  const token = getToken();
  if (!token) return;
  try {
    await supabase.functions.invoke("shortlist-sync", {
      body: { action: "save", token, property_ids: ids },
    });
  } catch (e) {
    console.warn("[shortlist] cloud sync failed", e);
  }
}

/**
 * Phase 11 — buyer shortlist (retention).
 * Local-first, with optional cross-device cloud sync once the buyer has
 * completed a magic-link handshake (sync token stored in localStorage).
 */
export function useShortlist() {
  const [ids, setIds] = useState<string[]>(() => read());
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<string[]>).detail;
      if (Array.isArray(next)) setIds(next);
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === KEY) setIds(read());
    };
    window.addEventListener("therizo:shortlist", handler as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("therizo:shortlist", handler as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // Debounced cloud sync — only fires when a sync token is present.
  useEffect(() => {
    if (!getToken()) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => pushToCloud(ids), 800);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [ids]);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    write(next);
    setIds(next);
    return next.includes(id);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  const setAll = useCallback((next: string[]) => {
    const uniq = Array.from(new Set(next));
    write(uniq);
    setIds(uniq);
  }, []);

  return { ids, has, toggle, clear, setAll, count: ids.length };
}

export const shortlistSync = {
  getToken,
  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};
