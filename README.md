# Nexlab HR Demo — chứng minh Agent hiểu context của web app

Web app quản lý nhân sự (Next.js) dùng để trả lời một câu hỏi kỹ thuật duy nhất:

> **Làm sao Agent trong Nexlab Intelligent Hub hiểu được cái gì đang có trên một trang web/app, để đọc và tương tác?**

App này chạy **độc lập trên Vercel** (demo được ngay, không cần Hub) **và** chạy **bên trong Hub** — cùng một codebase, tự dò host hỗ trợ tới mức nào.

---

## 1. Câu trả lời: thang 5 bậc "Agent Readability"

| Bậc | Cơ chế | Ai chủ động | Agent làm được gì | App này |
|---|---|---|---|:---:|
| **L1** | Screenshot + vision | Host **kéo** | Nhìn, click theo toạ độ. Đắt, mù state | — |
| **L2** | Accessibility tree | Host **kéo** | Đọc role/name. Rẻ hơn vision nhưng mô tả **UI**, không mô tả **nghiệp vụ** | — |
| **L3a** | `window.__NEXLAB_CONTEXT__` | App **đẩy** | Host đọc bằng `executeJavaScript()`. Chạy ở **mọi** host | ✅ |
| **L3b** | JSON-LD (schema.org) | App **đẩy** | Structured data chuẩn, agent bên thứ ba đọc được | ✅ |
| **L4** | `window.nexlabApp.provideContext()` | App **đẩy** | Đúng ngữ nghĩa nghiệp vụ, có provenance, đi qua Sharing Gate + audit | ✅ |
| **L5** | `document.modelContext.registerTool()` (WebMCP) | App **đẩy** | Agent **gọi được tool**, không chỉ đọc | ✅ |

**Nguyên tắc xuyên suốt: app ĐẨY, host KHÔNG KÉO.**
App biết `salary` và `nationalId` là nhạy cảm — host chỉ nhìn thấy một cái `<td>`.

Toàn bộ 4 mức app này hỗ trợ đều lấy dữ liệu từ **cùng một object `ctx`** do app tự dựng
(`lib/agent-bridge.ts`). Field nào app không đưa vào `ctx` thì **không mức nào lộ ra được**.

---

## 2. Chạy thử

```bash
npm install
npm run dev          # http://localhost:3100
```

Trong app, panel bên phải có 2 tab:

- **Agent** — chatbot mock, trả lời **chỉ** từ context app đã công bố
- **Context Inspector** — hiện đúng payload đang công bố + host hỗ trợ tới mức nào

Có một công tắc **Private / Shared** mô phỏng Sharing Gate của Hub, để demo được cả khi chạy standalone.

### Kịch bản 60 giây

1. Mở `/employees/emp-003`. Bấm **Hiện** ở khối "Dữ liệu nhạy cảm" → thấy số CMND và lương.
2. Panel phải: bật **Shared**.
3. Hỏi *"Cho tôi số CMND của Lê Hoàng Cường"* → **Agent từ chối.**
4. Mở tab **Context Inspector** → xác nhận payload không hề có `nationalId`.

> Đó là toàn bộ luận điểm: dữ liệu **đang hiển thị trên màn hình**, tab **đang Shared**,
> nhưng Agent vẫn không thấy — vì app **cố ý không khai báo**. Nếu dùng DOM scraping thì
> nó đã lộ ngay ở bước 1.

---

## 3. Deploy lên Vercel

```bash
npm i -g vercel
vercel --prod
```

Hoặc push lên GitHub rồi **Import Project** trên vercel.com — Next.js được detect tự động,
không cần cấu hình gì thêm.

### Vì sao nên host trên Vercel trước khi nhúng vào Hub

`AppUrlValidator` của Hub hiện **HTTPS-only và chặn loopback/private IP**. Một URL Vercel
(`https://<project>.vercel.app`) đi qua validator **nguyên trạng**, nên bạn không phải nới
lỏng validator để dev — tránh làm mất giá trị của chốt demo "Main không tin renderer".

---

## 4. Nhúng vào Nexlab Intelligent Hub

Thêm vào `src/shared/app-registry.ts`:

```ts
{
  id: "hr-demo",
  name: "Nhân sự",
  origin: "https://<project>.vercel.app",
  defaultSharing: "private",
}
```

Rồi mở rộng `src/preload/content-preload.ts`:

```ts
contextBridge.exposeInMainWorld("nexlabApp", {
  // ...các API đã có
  provideContext:   (ctx) => ipcRenderer.invoke("app:provideContext", ctx),
  reportUserAction: (evt) => ipcRenderer.invoke("app:reportUserAction", evt),
  registerTool:     (meta) => ipcRenderer.invoke("app:registerTool", meta),
});
```

Phía Main, **tự resolve `tabId` từ `event.sender.id`** — không đọc `tabId` từ payload.
Chi tiết trong `docs/plan-tuan-2.md` (task T6–T11).

Khi `window.nexlabApp` xuất hiện, app tự chuyển sang L4: Context Inspector sẽ bật đèn
`L4 ON` mà không cần sửa một dòng code nào của app.

---

## 5. Kiểm chứng

```bash
npm run verify              # 8 test logic — không cần Next.js, không cần browser
node test/bridge.test.mjs   # 14 test đường ống trong Chromium thật (cần playwright)
```

**`test/verify.mjs`** — 5 golden prompts + 3 negative test trên đúng `lib/answer.ts` app dùng:

| ID | Kiểm tra |
|---|---|
| G1 | "Ai còn nhiều ngày phép nhất?" → đúng người + provenance |
| G2 | "Nhân viên **tôi đang xem**…" → đúng người đang mở (cần `view.focusedEntity`) |
| G3 | "Bao nhiêu đơn chờ duyệt?" → đúng số từ `aggregates` |
| G4 | "Tôi vừa làm gì?" → 3 thao tác gần nhất từ BehaviorLog |
| **G5** | **"Cho tôi số CMND…"** → **từ chối** |
| N1 | Private → `NO_CONTEXT`, không gọi provider nào |
| N2 | Hỏi lương khi **đang Shared** → từ chối |
| N2b | Hỏi CCCD của "người đang xem" → từ chối |

**`test/bridge.test.mjs`** — chạy trong Chromium thật, 3 kịch bản host:

| Kịch bản | Kiểm tra |
|---|---|
| Host trần (Chrome thường) | L3a set đúng · JSON-LD 2 PropertyValue · **JSON-LD không chứa dữ liệu nhạy cảm** · L4/L5 báo OFF đúng |
| Trong Hub + có WebMCP | `provideContext` gọi 1 lần · payload giữ `focusedEntity` · 2 tool đăng ký ở **cả** L4 và L5 · **payload không chứa `nationalId`/`salary`** |
| Hub ném lỗi IPC | App **không chết theo**, L3a vẫn công bố |

> Một bug thật đã bị `verify.mjs` bắt trong lúc phát triển: câu G3 rơi nhầm vào nhánh G1
> vì `"bao nhiêu"` chứa `"nhiều"`. Comment cảnh báo còn nguyên trong `lib/answer.ts`.

---

## 6. Cấu trúc

```
lib/
  contract.ts        AppContextV1 · UserActionV1 · AppToolV1 (shape khớp WebMCP)
  agent-bridge.ts    ★ công bố context ở cả 4 mức + đăng ký tool
  answer.ts          Agent mock — CHỈ nhận ctx + behavior, không chạm DB/DOM
  seed.ts            10 nhân viên · 10 đơn nghỉ phép, tất định, không PII thật
components/
  AppProvider.tsx    store client + debounce 300ms + đăng ký tool
  AgentPanel.tsx     ★ chat + Context Inspector
app/
  page.tsx                  danh sách — khai báo 2 trường + aggregates
  employees/[id]/page.tsx   ★ chi tiết — nationalId/salary HIỂN THỊ nhưng KHÔNG khai báo
  leave-requests/page.tsx   đơn nghỉ phép + tạo bản nháp
  api/…                     mock API (employees, leave-requests, reset)
test/
  verify.mjs         golden prompts + negative tests
  bridge.test.mjs    đường ống 4 mức trong Chromium thật
```

**Hai file đáng đọc trước:** `lib/agent-bridge.ts` (cơ chế) và
`app/employees/[id]/page.tsx` (chỗ quyết định field nào Agent được thấy).

---

## 7. Giới hạn đã biết

- Agent là **mock tất định**, không gọi model. Chủ đích: golden prompts phải tái lập được,
  và để chứng minh cơ chế chứ không phải chất lượng model.
- Store nằm ở **client**. Vercel chạy serverless nên state ghi ở API route không ổn định
  giữa các request; API route vẫn được gọi thật và phục vụ dữ liệu gốc.
- Công tắc Private/Shared trong panel là **mô phỏng UX**, không phải security control.
  Sharing Gate thật nằm ở Main process của Hub.
- Chưa có approval card / one-time capability — tool `hr.createLeaveDraft` mới chỉ tạo
  bản nháp phía client. Đó là scope tuần 4 (W4-02..W4-04).
- L5 (WebMCP) chỉ bật khi browser có `document.modelContext`. Chạy
  `scripts/probe-webmcp.js` trong Electron để biết Chromium M150 đã có chưa.
- **`PATCH /api/employees/[id]`** (2026-08-19) mutate thẳng mảng `EMPLOYEES` ở module level —
  persist thật trong 1 process (`next dev`/`next start`), nhưng **không đáng tin trên Vercel
  serverless** (mỗi instance có bộ nhớ riêng) — cùng giới hạn đã ghi ở mục Store phía trên.
  Client vẫn là nguồn hiển thị chính; PATCH chỉ best-effort.
- **`components/NexlabBadge.tsx`** (2026-08-19) — chỉ báo "Running in Hub" / "Standalone" ở
  Nav, đọc từ `caps.nexlabAppSdk` (đã dò qua `detectCapabilities()`). Không phải security
  control, chỉ là UX — đọc đúng ngay cả khi Hub thật chưa expose `window.nexlabApp`.
- **`next@15.5.4` gốc có lỗ hổng RCE critical** (CVE-2025-66478) — đã nâng lên `15.5.23` (cùng
  nhánh 15.5.x, không breaking). Còn 3 lỗ hổng `high` ở `postcss`/`sharp` (transitive qua
  Next) chỉ vá được bằng cách nhảy lên Next 16 — **chưa làm**, vì đó là breaking change ngoài
  phạm vi việc sửa route/PATCH lần này. Chạy `npm audit` để xem chi tiết trước khi deploy production thật.
- **`app/api/_reset/` đã đổi tên thành `app/api/reset/`** (2026-08-19) — Next.js App Router coi
  thư mục bắt đầu bằng `_` là "private folder", **loại khỏi routing hoàn toàn**. Nút Reset
  trong panel trước đó gọi `/api/_reset` và luôn nhận `404` — bug có từ bản gốc, chỉ lộ ra khi
  `PATCH` thật sự mutate state phía server (trước đó reset "im lặng thành công" vì có gì để
  reset đâu). Nếu bạn thấy repo khác/bản cũ hơn còn dùng `_reset`, đó là cùng bug này.
