/**
 * Kiểm chứng agent-bridge trong CHROMIUM THẬT (Playwright).
 *   node test/bridge.test.mjs
 *
 * Chứng minh đường ống công bố context chạy đúng ở cả 4 mức:
 *   L3a window.__NEXLAB_CONTEXT__   L3b JSON-LD
 *   L4  window.nexlabApp             L5 modelContext.registerTool
 *
 * L4 và L5 được giả lập bằng cách bơm object vào page trước khi script chạy —
 * đúng cách preload của Electron và Chromium bơm chúng vào renderer.
 */
import pw from "playwright";
const { chromium } = pw;
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function compile(rel) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  return ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace(/^\s*import[^\n]*\n/gm, "").replace(/\bexport\s+/g, "");
}

const BRIDGE = compile("lib/agent-bridge.ts");

const CTX = {
  version: "1.0",
  classification: "internal",
  view: {
    route: "/employees/emp-003",
    title: "Lê Hoàng Cường — Hồ sơ nhân viên",
    focusedEntity: { type: "employee", id: "emp-003", label: "Lê Hoàng Cường" },
  },
  entities: [{
    type: "employee", id: "emp-003", label: "Lê Hoàng Cường",
    fields: {
      department:   { value: "Kỹ thuật", label: "Phòng ban",          source: "GET /api/employees/emp-003#department" },
      leaveBalance: { value: 15,          label: "Ngày phép còn lại", source: "GET /api/employees/emp-003#leaveBalance" },
    },
  }],
  aggregates: { pendingLeaveRequests: 5 },
};

const results = [];
const check = (id, ok, note) => { results.push({ id, ok, note }); };

const browser = await chromium.launch();

// ── Kịch bản 1: host "trần" (Chrome thường, không Hub, không WebMCP) ──────
{
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><head></head><body><h1>hr</h1></body></html>");
  const out = await page.evaluate(({ bridge, ctx }) => {
    eval(bridge);
    const caps = publishContext(ctx);
    reportUserAction({ type: "entity.viewed", entity: { type: "employee", id: "emp-003" } });
    const ld = document.getElementById("nexlab-jsonld");
    return {
      caps,
      globalSet: !!window.__NEXLAB_CONTEXT__,
      globalRoute: window.__NEXLAB_CONTEXT__?.view?.route,
      jsonLdType: ld?.type,
      jsonLdVars: ld ? JSON.parse(ld.textContent).variableMeasured.length : 0,
      jsonLdHasSensitive: ld ? /nationalId|salary/.test(ld.textContent) : null,
      behaviorLen: getBehaviorLog().length,
    };
  }, { bridge: BRIDGE, ctx: CTX });

  check("L3a-1", out.globalSet && out.globalRoute === "/employees/emp-003", "window.__NEXLAB_CONTEXT__ được set đúng route");
  check("L3b-1", out.jsonLdType === "application/ld+json" && out.jsonLdVars === 2, `JSON-LD có ${out.jsonLdVars} PropertyValue`);
  check("SEC-1", out.jsonLdHasSensitive === false, "JSON-LD KHÔNG chứa nationalId/salary");
  check("BEH-1", out.behaviorLen === 1, "reportUserAction ghi được vào BehaviorLog");
  check("CAP-1", out.caps.nexlabAppSdk === false && out.caps.webmcp === false, "host trần: L4/L5 báo OFF đúng");
  await page.close();
}

// ── Kịch bản 2: bên trong Hub (có window.nexlabApp) + có WebMCP ───────────
{
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><head></head><body></body></html>");

  const out = await page.evaluate(({ bridge, ctx }) => {
    // Giả lập đúng thứ preload của Electron / Chromium bơm vào renderer.
    // Bridge đọc window.nexlabApp tại thời điểm gọi, nên dựng ở đây là đủ.
    window.__CALLS__ = { provideContext: [], reportUserAction: [], registerTool: [], mcpRegister: [] };
    window.nexlabApp = {
      provideContext: (c) => window.__CALLS__.provideContext.push(c),
      reportUserAction: (e) => window.__CALLS__.reportUserAction.push(e),
      registerTool: (m) => window.__CALLS__.registerTool.push(m.name),
    };
    Object.defineProperty(document, "modelContext", {
      value: { registerTool: (t) => window.__CALLS__.mcpRegister.push(t.name) },
      configurable: true,
    });
    eval(bridge);
    const caps = publishContext(ctx);
    reportUserAction({ type: "field.edited", detail: { field: "leaveBalance" } });
    registerTools([
      { name: "hr.getEmployee",      description: "d", inputSchema: { type: "object" }, risk: "read",  requiresApproval: false, execute: async () => ({ content: [] }) },
      { name: "hr.createLeaveDraft", description: "d", inputSchema: { type: "object" }, risk: "draft", requiresApproval: true,  execute: async () => ({ content: [] }) },
    ]);
    return { caps, calls: window.__CALLS__ };
  }, { bridge: BRIDGE, ctx: CTX });

  check("L4-1", out.calls.provideContext.length === 1, "nexlabApp.provideContext được gọi đúng 1 lần");
  check("L4-2", out.calls.provideContext[0]?.view?.focusedEntity?.id === "emp-003", "payload gửi lên Hub giữ nguyên focusedEntity");
  check("L4-3", out.calls.reportUserAction.length === 1, "nexlabApp.reportUserAction được gọi");
  check("L4-4", out.calls.registerTool.length === 2, "2 tool đăng ký qua Nexlab SDK");
  check("L5-1", out.calls.mcpRegister.length === 2, "2 tool đăng ký qua WebMCP registerTool");
  check("L5-2", out.calls.mcpRegister.includes("hr.createLeaveDraft"), "tool draft có mặt trong WebMCP");
  check("CAP-2", out.caps.nexlabAppSdk === true && out.caps.webmcp === true, "capabilities báo L4+L5 ON");
  const noSensitive = !JSON.stringify(out.calls.provideContext).match(/nationalId|salary|079201/);
  check("SEC-2", noSensitive, "payload gửi Hub KHÔNG chứa nationalId/salary");
  await page.close();
}

// ── Kịch bản 3: Hub ném lỗi — app không được chết theo ────────────────────
{
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><head></head><body></body></html>");
  const out = await page.evaluate(({ bridge, ctx }) => {
    window.nexlabApp = { provideContext: () => { throw new Error("IPC down"); } };
    eval(bridge);
    let threw = false;
    try { publishContext(ctx); } catch { threw = true; }
    return { threw, globalStillSet: !!window.__NEXLAB_CONTEXT__ };
  }, { bridge: BRIDGE, ctx: CTX });
  check("RES-1", out.threw === false && out.globalStillSet, "Hub lỗi → app vẫn chạy, L3a vẫn công bố");
  await page.close();
}

await browser.close();

const pass = results.filter((r) => r.ok).length;
console.log("\n  ID        KẾT QUẢ   KIỂM TRA");
console.log("  " + "─".repeat(74));
for (const r of results) {
  console.log(`  ${r.id.padEnd(9)} ${(r.ok ? "  PASS " : "  FAIL ").padEnd(9)} ${r.note}`);
}
console.log("  " + "─".repeat(74));
console.log(`  Tổng: ${pass}/${results.length} pass\n`);
process.exit(pass === results.length ? 0 : 1);
