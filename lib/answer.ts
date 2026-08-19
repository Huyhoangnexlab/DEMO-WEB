/**
 * Mock Agent — TẤT ĐỊNH, không gọi model ngoài.
 *
 * Điểm quan trọng nhất: nó CHỈ nhận `ctx` và `behavior` làm input.
 * Không có quyền truy cập DOM hay database trực tiếp.
 * Chứng minh nguyên tắc: app chủ động khai báo gì thì Agent chỉ biết cái đó.
 */

import type { AppContextV1, UserActionV1 } from "./contract";

export interface AnswerResult {
  answer: string;
  sources: string[];
  refused: boolean;
  matched: string;
}

const SENSITIVE_HINTS = [
  "cmnd", "cccd", "căn cước", "can cuoc", "chứng minh", "chung minh",
  "national", "nationalid", "lương", "luong", "salary", "thu nhập", "thu nhap",
];

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function allFields(ctx: AppContextV1) {
  return ctx.entities.flatMap((e) =>
    Object.entries(e.fields).map(([key, f]) => ({ entity: e, key, field: f }))
  );
}

function findField(ctx: AppContextV1, needles: string[]) {
  const list = allFields(ctx);
  for (const n of needles) {
    const hit = list.find(
      (x) => norm(x.key).includes(norm(n)) || norm(x.field.label).includes(norm(n))
    );
    if (hit) return hit;
  }
  return null;
}

export function answer(
  question: string,
  ctx: AppContextV1 | null,
  behavior: UserActionV1[] = []
): AnswerResult {
  // 1. Không có context (chưa bật Share)
  if (!ctx) {
    return {
      answer:
        "NO_CONTEXT — tôi chưa được chia sẻ context nào từ app này. Hãy bật Share trên tab để tôi đọc được dữ liệu.",
      sources: [],
      refused: true,
      matched: "no-context",
    };
  }

  const q = norm(question);

  // 2. G5 & N2 & N2b: Hỏi thông tin nhạy cảm (CMND / Lương)
  if (SENSITIVE_HINTS.some((h) => q.includes(norm(h)))) {
    const present = findField(ctx, ["nationalId", "salary", "cmnd", "luong"]);
    if (!present) {
      return {
        answer:
          "Tôi không có dữ liệu này. App chỉ chia sẻ những trường nó chủ động khai báo, " +
          "và số CMND / lương không nằm trong đó — kể cả khi chúng đang hiển thị trên màn hình.",
        sources: [],
        refused: true,
        matched: "sensitive-not-declared",
      };
    }
  }

  // 3. Hỏi về số lượng nhân sự ("Công ty có bao nhiêu nhân sự/nhân viên?")
  if (
    (q.includes("bao nhieu") || q.includes("tong so")) &&
    (q.includes("nhan su") || q.includes("nhan vien") || q.includes("nguoi")) &&
    !q.includes("don") && !q.includes("phep")
  ) {
    const total = ctx.aggregates?.["totalEmployees"];
    if (total != null) {
      return {
        answer: `Hiện tại công ty có ${total} nhân sự.`,
        sources: ["aggregates.totalEmployees"],
        refused: false,
        matched: "total-employees",
      };
    }
  }

  // 4. Hỏi "Tôi vừa tìm kiếm ai?" / "Tôi vừa tìm gì?"
  if (q.includes("vua tim") || q.includes("tim kiem ai") || q.includes("tim ai") || q.includes("tim gi")) {
    const searchActs = behavior.filter((b) => b.type === "search.performed");
    if (searchActs.length > 0) {
      const lastSearch = searchActs[searchActs.length - 1];
      const query = lastSearch.detail?.query || lastSearch.detail?.department;
      return {
        answer: `Bạn vừa tìm kiếm từ khóa: "${query}".`,
        sources: ["BehaviorLog (search.performed)"],
        refused: false,
        matched: "search-history",
      };
    }
  }

  // 5. G4: "Tôi vừa làm gì trong app này?"
  if (
    (q.includes("vua lam") || q.includes("da lam") || q.includes("lam gi") ||
      q.includes("thao tac") || q.includes("lich su")) &&
    !q.includes("nhan vien nao")
  ) {
    if (!behavior.length) {
      return {
        answer: "Chưa ghi nhận hành vi nào trong phiên này.",
        sources: [],
        refused: false,
        matched: "behavior-empty",
      };
    }
    const last = behavior.slice(-3).reverse();
    const lines = last.map((b, i) => {
      const what =
        b.type === "entity.viewed"
          ? `xem ${b.entity?.label ?? b.entity?.id ?? "một bản ghi"}`
          : b.type === "field.edited"
          ? `sửa trường "${b.detail?.field ?? "?"}" của ${b.entity?.label ?? "một bản ghi"}`
          : b.type === "form.submitted"
          ? `gửi form ${b.detail?.form ?? ""}`
          : b.type === "entity.created"
          ? `tạo ${b.entity?.type === "employee" ? "nhân viên" : "đơn nghỉ phép"} ${b.entity?.label ?? b.entity?.id ?? ""}`
          : b.type === "action.performed"
          ? `thực hiện thao tác ${b.detail?.action ?? ""} ${b.detail?.employeeName ?? ""}`
          : b.type === "search.performed"
          ? `tìm kiếm "${b.detail?.query ?? b.detail?.department ?? ""}"`
          : `mở ${b.detail?.route ?? "một trang"}`;
      const timeStr = b.at ? new Date(b.at).toLocaleTimeString("vi-VN") : "vừa xong";
      return `${i + 1}. ${what} — ${timeStr}`;
    });
    return {
      answer: `Ba thao tác gần nhất của bạn:\n${lines.join("\n")}`,
      sources: ["BehaviorLog (app khai báo qua reportUserAction)"],
      refused: false,
      matched: "behavior",
    };
  }

  // 6. G2: "Người tôi đang xem..."
  const askingFocused =
    q.includes("dang xem") || q.includes("dang mo") || q.includes("nguoi nay") ||
    q.includes("nhan vien nay") || q.includes("ho ta") || q.includes("anh ta") || q.includes("co ay");

  if (askingFocused) {
    const focus = ctx.view.focusedEntity;
    if (!focus) {
      return {
        answer:
          "Hiện bạn không mở chi tiết bản ghi nào, nên tôi không biết \"đang xem\" là ai. " +
          "Hãy mở một nhân viên rồi hỏi lại.",
        sources: [`view.route = ${ctx.view.route}`],
        refused: false,
        matched: "focused-none",
      };
    }
    const ent = ctx.entities.find((e) => e.id === focus.id);
    const leave = ent?.fields["leaveBalance"];
    if (leave) {
      return {
        answer: `Bạn đang xem ${ent?.label ?? focus.label}. ${leave.label}: ${leave.value} ngày.`,
        sources: [leave.source, `view.focusedEntity = ${focus.type}:${focus.id}`],
        refused: false,
        matched: "focused-leave",
      };
    }
    const summary = ent
      ? Object.entries(ent.fields).map(([, f]) => `${f.label}: ${f.value}`).join(" · ")
      : focus.label ?? focus.id;
    return {
      answer: `Bạn đang xem ${focus.label ?? focus.id}. ${summary}`,
      sources: [`view.focusedEntity = ${focus.type}:${focus.id}`],
      refused: false,
      matched: "focused-summary",
    };
  }

  // 7. G3: "Có bao nhiêu đơn nghỉ phép đang chờ duyệt?"
  if (
    q.includes("cho duyet") || q.includes("pending") ||
    (q.includes("bao nhieu") && (q.includes("don") || q.includes("nghi phep")))
  ) {
    const agg = ctx.aggregates?.["pendingLeaveRequests"];
    if (agg != null) {
      return {
        answer: `Hiện có ${agg} đơn nghỉ phép đang chờ duyệt.`,
        sources: ["aggregates.pendingLeaveRequests"],
        refused: false,
        matched: "pending-agg",
      };
    }
    const n = ctx.entities.filter(
      (e) => e.type === "leaveRequest" && String(e.fields["status"]?.value) === "pending"
    ).length;
    return {
      answer: `Hiện có ${n} đơn nghỉ phép đang chờ duyệt.`,
      sources: ["entities[leaveRequest].status"],
      refused: false,
      matched: "pending-count",
    };
  }

  // 8. G1: "Ai còn nhiều ngày phép nhất?"
  if (
    (q.includes("nhieu nhat") || q.includes("cao nhat") || q.includes("max") ||
      q.includes("nhieu ngay phep nhat")) &&
    (q.includes("phep") || q.includes("nghi"))
  ) {
    const rows = ctx.entities
      .filter((e) => e.fields["leaveBalance"] != null)
      .map((e) => ({ e, v: Number(e.fields["leaveBalance"].value) }))
      .sort((a, b) => b.v - a.v);
    if (!rows.length) {
      return {
        answer: "Context hiện tại không có trường số ngày phép. Thử mở màn hình danh sách nhân viên.",
        sources: [],
        refused: false,
        matched: "leave-missing",
      };
    }
    const top = rows[0];
    return {
      answer: `${top.e.label} đang còn nhiều ngày phép nhất: ${top.v} ngày.`,
      sources: [top.e.fields["leaveBalance"].source],
      refused: false,
      matched: "leave-max",
    };
  }

  // 9. Tra cứu theo tên cụ thể
  const named = ctx.entities.find((e) => q.includes(norm(e.label)));
  if (named) {
    const parts = Object.entries(named.fields).map(([, f]) => `${f.label}: ${f.value}`);
    return {
      answer: `${named.label} — ${parts.join(" · ")}`,
      sources: Object.values(named.fields).map((f) => f.source),
      refused: false,
      matched: "entity-lookup",
    };
  }

  // 10. Fallback: hiển thị những gì đang biết trong context
  const fieldNames = [...new Set(allFields(ctx).map((f) => f.field.label))];
  return {
    answer:
      `Tôi chưa trả lời được câu này từ context hiện có. ` +
      `Context đang gồm ${ctx.entities.length} bản ghi trên trang "${ctx.view.title}", ` +
      `với các trường: ${fieldNames.join(", ") || "(trống)"}.`,
    sources: [`view.route = ${ctx.view.route}`],
    refused: false,
    matched: "fallback",
  };
}
