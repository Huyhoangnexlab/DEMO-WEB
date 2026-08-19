/**
 * Bridge kết nối giữa app và các tầng cung cấp context (L3a, L3b, L4, L5).
 */

import type {
  AppContextV1,
  AppToolV1,
  BridgeCapabilities,
  UserActionV1,
} from "./contract";

const JSONLD_ID = "nexlab-jsonld";
const MAX_BEHAVIOR = 50;

function getModelContext(): any {
  if (typeof document === "undefined") return null;
  return (
    (document as any).modelContext ??
    (typeof navigator !== "undefined" ? (navigator as any).modelContext : null) ??
    (window as any).agent ??
    null
  );
}

/** Dò xem host hiện tại hỗ trợ tới mức nào */
export function detectCapabilities(): BridgeCapabilities {
  if (typeof window === "undefined") {
    return { globalContext: false, jsonLd: false, nexlabAppSdk: false, webmcp: false, detail: {} };
  }
  const mc = getModelContext();
  const sdk = window.nexlabApp;
  return {
    globalContext: true,
    jsonLd: true,
    nexlabAppSdk: typeof sdk?.provideContext === "function",
    webmcp: typeof mc?.registerTool === "function",
    detail: {
      "window.nexlabApp": typeof window.nexlabApp,
      "nexlabApp.provideContext": typeof sdk?.provideContext,
      "nexlabApp.reportUserAction": typeof sdk?.reportUserAction,
      "document.modelContext": typeof (document as any).modelContext,
      "navigator.modelContext":
        typeof (typeof navigator !== "undefined" ? (navigator as any).modelContext : undefined),
      "modelContext.registerTool": typeof mc?.registerTool,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 90) : "",
    },
  };
}

/** Chuyển context sang JSON-LD schema.org — mức L3b */
function toJsonLd(ctx: AppContextV1) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: ctx.view.title,
    description: `Nexlab app context — ${ctx.view.route}`,
    creativeWorkStatus: ctx.classification,
    variableMeasured: ctx.entities.flatMap((e) =>
      Object.entries(e.fields).map(([key, f]) => ({
        "@type": "PropertyValue",
        propertyID: `${e.type}.${e.id}.${key}`,
        name: f.label,
        value: f.value,
        description: `nguồn: ${f.source}`,
      }))
    ),
  };
}

/**
 * Công bố context ở cả bốn mức.
 */
export function publishContext(ctx: AppContextV1): BridgeCapabilities {
  const caps = detectCapabilities();
  if (typeof window === "undefined") return caps;

  // L3a — global object
  window.__NEXLAB_CONTEXT__ = ctx;

  // L3b — JSON-LD
  try {
    let tag = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
    if (!tag) {
      tag = document.createElement("script");
      tag.id = JSONLD_ID;
      tag.type = "application/ld+json";
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(toJsonLd(ctx));
  } catch {
    /* ignore */
  }

  // L4 — Nexlab App SDK (Hub)
  try {
    window.nexlabApp?.provideContext?.(ctx);
  } catch {
    /* ignore */
  }

  // Event cho nội bộ
  try {
    window.dispatchEvent(new CustomEvent("nexlab:context", { detail: ctx }));
  } catch {
    /* ignore */
  }

  return caps;
}

/** Ghi nhận hành vi user */
export function reportUserAction(evt: Omit<UserActionV1, "at" | "version">): void {
  if (typeof window === "undefined") return;
  const full: UserActionV1 = { version: "1.0", at: new Date().toISOString(), ...evt };

  const log = (window.__NEXLAB_BEHAVIOR__ ??= []);
  log.push(full);
  if (log.length > MAX_BEHAVIOR) log.splice(0, log.length - MAX_BEHAVIOR);

  try {
    window.nexlabApp?.reportUserAction?.(full);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent("nexlab:action", { detail: full }));
  } catch {
    /* ignore */
  }
}

/**
 * Đăng ký tool ở mức L5 (WebMCP) và L4 (Nexlab SDK).
 */
export function registerTools(tools: AppToolV1[]): () => void {
  if (typeof window === "undefined") return () => {};

  const disposers: Array<() => void> = [];
  const mc = getModelContext();

  for (const tool of tools) {
    const { execute, ...meta } = tool;

    // L5 — WebMCP
    if (typeof mc?.registerTool === "function") {
      try {
        const controller = new AbortController();
        mc.registerTool(
          {
            name: meta.name,
            description: meta.description,
            inputSchema: meta.inputSchema,
            execute,
          },
          { signal: controller.signal }
        );
        disposers.push(() => controller.abort());
      } catch {
        /* ignore */
      }
    }

    // L4 — Nexlab App SDK
    try {
      window.nexlabApp?.registerTool?.(meta, execute);
    } catch {
      /* ignore */
    }
  }

  return () => disposers.forEach((d) => d());
}

/** Đọc lại timeline hành vi */
export function getBehaviorLog(): UserActionV1[] {
  if (typeof window === "undefined") return [];
  return window.__NEXLAB_BEHAVIOR__ ?? [];
}
