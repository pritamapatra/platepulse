"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

const POLL_MS = 30_000;
const MIN_GAP_MS = 5_000;

export function SellRefresher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pendingRef = useRef(pending);
  const lastRef = useRef(0);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    function refresh() {
      if (document.visibilityState !== "visible") return;
      if (pendingRef.current) return;
      const now = Date.now();
      if (now - lastRef.current < MIN_GAP_MS) return;
      lastRef.current = now;
      startTransition(() => router.refresh());
    }

    const timer = window.setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  return null;
}
