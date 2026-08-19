"use client";
import { useEffect, useRef, useCallback } from "react";
import type { AppContextV1, UserActionV1 } from "./types";

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Khai báo context cho Hub. Debounce 300ms + deep-compare để tránh IPC thừa.
 * Hỗ trợ fallback L3a (window.__NEXLAB_CONTEXT__) và dispatch custom event để UI / Inspector quan sát.
 */
export function useNexlabContext(context: AppContextV1 | null): void {
  const lastSent = useRef<AppContextV1 | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!context || typeof window === "undefined") return;
    if (deepEqual(context, lastSent.current)) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // 1. Fallback L3a
      window.__NEXLAB_CONTEXT__ = context;

      // 2. L4 SDK nếu đang chạy trong Hub
      try {
        window.nexlabApp?.provideContext(context);
      } catch {
        /* ignore */
      }

      // 3. Dispatch event cho Inspector/Agent Panel nội bộ
      try {
        window.dispatchEvent(new CustomEvent("nexlab:context", { detail: context }));
      } catch {
        /* ignore */
      }

      lastSent.current = context;
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [context]);
}

/**
 * Gửi tín hiệu hành vi người dùng về Hub và lưu vết vào timeline.
 */
export function useNexlabBehavior() {
  const report = useCallback((evt: UserActionV1) => {
    if (typeof window === "undefined") return;

    const fullEvt: UserActionV1 = {
      at: new Date().toISOString(),
      ...evt,
      version: "1.0",
    };

    // Lưu vết L3 timeline
    const log = (window.__NEXLAB_BEHAVIOR__ ??= []);
    log.push(fullEvt);
    if (log.length > 50) log.splice(0, log.length - 50);

    // L4 SDK Hub
    try {
      window.nexlabApp?.reportUserAction(fullEvt);
    } catch {
      /* ignore */
    }

    // Dispatch event cho panel
    try {
      window.dispatchEvent(new CustomEvent("nexlab:action", { detail: fullEvt }));
    } catch {
      /* ignore */
    }
  }, []);

  return report;
}
