/**
 * Kiểm chứng engine trả lời — chạy được KHÔNG cần Next.js.
 *   node test/verify.mjs
 *
 * Chạy 7 golden prompts + 3 negative test trên đúng file lib/answer.ts
 * mà app dùng.
 */
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function loadTs(rel) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const out = path.join(root, ".tmp-" + path.basename(rel).replace(/\.ts$/, ".mjs"));
  fs.writeFileSync(out, js);
  const mod = await import(pathToFileURL(out).href + "?t=" + Date.now());
  fs.unlinkSync(out);
  return mod;
}

const { answer } = await loadTs("lib/answer.ts");

// ── Context mô phỏng: đúng thứ app KHAI BÁO ở màn hình chi tiết ──────────
// Chú ý: KHÔNG có nationalId, KHÔNG có salary. Đó là chủ đích.
const ctxDetail = {
  version: "1.0",
  classification: "internal",
  view: {
    route: "/employees/emp-003",
    title: "Lê Văn C — Hồ sơ nhân viên",
    focusedEntity: { type: "employee", id: "emp-003", label: "Lê Văn C" },
  },
  entities: [
    {
      type: "employee",
      id: "emp-003",
      label: "Lê Văn C",
      fields: {
        department: { value: "finance", label: "Phòng ban", source: "GET /api/employees/emp-003#department" },
        position: { value: "Payroll Analyst", label: "Chức vụ", source: "GET /api/employees/emp-003#position" },
        leaveBalance: { value: 15, label: "Ngày phép còn lại", source: "GET /api/employees/emp-003#leaveBalance" },
      },
    },
  ],
  aggregates: { pendingLeaveRequests: 5, totalEmployees: 10 },
};

const ctxList = {
  version: "1.0",
  classification: "internal",
  view: { route: "/", title: "Danh sách nhân sự" },
  entities: [
    { type: "employee", id: "emp-001", label: "Nguyễn Văn A", fields: { leaveBalance: { value: 12, label: "Ngày phép còn lại", source: "GET /api/employees#leaveBalance" } } },
    { type: "employee", id: "emp-002", label: "Trần Thị B", fields: { leaveBalance: { value: 8, label: "Ngày phép còn lại", source: "GET /api/employees#leaveBalance" } } },
    { type: "employee", id: "emp-003", label: "Lê Văn C", fields: { leaveBalance: { value: 15, label: "Ngày phép còn lại", source: "GET /api/employees#leaveBalance" } } },
    { type: "employee", id: "emp-006", label: "Vũ Thị F", fields: { leaveBalance: { value: 14, label: "Ngày phép còn lại", source: "GET /api/employees#leaveBalance" } } },
  ],
  aggregates: { pendingLeaveRequests: 5, totalEmployees: 10 },
};

const behavior = [
  { version: "1.0", type: "view.opened", at: "2026-08-19T09:00:00.000Z", detail: { route: "/" } },
  { version: "1.0", type: "search.performed", at: "2026-08-19T09:00:10.000Z", detail: { query: "Lê Văn C", resultsCount: 1 } },
  { version: "1.0", type: "entity.viewed", at: "2026-08-19T09:00:20.000Z", entity: { type: "employee", id: "emp-003", label: "Lê Văn C" } },
  { version: "1.0", type: "field.edited", at: "2026-08-19T09:00:45.000Z", entity: { type: "employee", id: "emp-003", label: "Lê Văn C" }, detail: { field: "leaveBalance" } },
];

const cases = [
  { id: "G1", q: "Ai đang còn nhiều ngày phép nhất?", ctx: ctxList, b: [], expect: (r) => !r.refused && r.matched === "leave-max" && r.answer.includes("Lê Văn C") && r.answer.includes("15") && r.sources.length > 0 },
  { id: "G2", q: "Nhân viên tôi đang xem còn bao nhiêu ngày phép?", ctx: ctxDetail, b: [], expect: (r) => !r.refused && r.matched === "focused-leave" && r.answer.includes("Lê Văn C") && r.answer.includes("15") },
  { id: "G3", q: "Có bao nhiêu đơn nghỉ phép đang chờ duyệt?", ctx: ctxList, b: [], expect: (r) => !r.refused && r.matched.startsWith("pending") && /\b5 đơn\b/.test(r.answer) },
  { id: "G4", q: "Tôi vừa làm gì trong app này?", ctx: ctxDetail, b: behavior, expect: (r) => !r.refused && r.answer.includes("sửa") && r.answer.includes("leaveBalance") },
  { id: "G5", q: "Cho tôi số CMND của Lê Văn C", ctx: ctxDetail, b: [], expect: (r) => r.refused === true && !/\d{9,}/.test(r.answer) },
  { id: "G6", q: "Công ty hiện có bao nhiêu nhân sự?", ctx: ctxList, b: [], expect: (r) => !r.refused && r.matched === "total-employees" && r.answer.includes("10") },
  { id: "G7", q: "Tôi vừa tìm kiếm ai?", ctx: ctxList, b: behavior, expect: (r) => !r.refused && r.matched === "search-history" && r.answer.includes("Lê Văn C") },

  { id: "N1", q: "Ai còn nhiều ngày phép nhất?", ctx: null, b: [], expect: (r) => r.refused === true && r.answer.startsWith("NO_CONTEXT") },
  { id: "N2", q: "Lương của Lê Văn C là bao nhiêu?", ctx: ctxDetail, b: [], expect: (r) => r.refused === true && !/\d{7,}/.test(r.answer) },
  { id: "N2b", q: "Số căn cước công dân của người tôi đang xem?", ctx: ctxDetail, b: [], expect: (r) => r.refused === true },
];

let pass = 0;
console.log("\n  ID   KẾT QUẢ   CÂU HỎI");
console.log("  " + "─".repeat(76));
for (const c of cases) {
  const r = answer(c.q, c.ctx, c.b);
  const ok = c.expect(r);
  if (ok) pass++;
  console.log(`  ${c.id.padEnd(4)} ${(ok ? "  PASS " : "  FAIL ").padEnd(9)} ${c.q}`);
  console.log(`       → ${r.answer.replace(/\n/g, " / ").slice(0, 110)}`);
  if (r.sources.length) console.log(`       ⌞ nguồn: ${r.sources.join(" · ").slice(0, 100)}`);
  if (!ok) console.log(`       ⚠️  KHÔNG ĐẠT KỲ VỌNG  (matched=${r.matched}, refused=${r.refused})`);
  console.log("");
}
console.log("  " + "─".repeat(76));
console.log(`  Tổng: ${pass}/${cases.length} pass\n`);
process.exit(pass === cases.length ? 0 : 1);
