import { useEffect, useState, useCallback } from "react";

const KEY = "therizo:shortlist:v1";

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

/**
 * Phase 11 — buyer shortlist (retention).
 * Client-side shortlist keyed on property id, persisted in localStorage
 * and synchronised across tabs / components via a custom event.
 * When buyer auth ships, wrap this hook with a Supabase sync layer.
 */
export function useShortlist() {
  const [ids, setIds] = useState<string[]>(() => read());

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

  return { ids, has, toggle, clear, count: ids.length };
}
