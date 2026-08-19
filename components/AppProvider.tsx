"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Employee, LeaveRequest } from "@/lib/seed";
import type { AppContextV1, BridgeCapabilities, UserActionV1 } from "@/lib/contract";
import {
  detectCapabilities,
  getBehaviorLog,
  publishContext,
  registerTools,
  reportUserAction,
} from "@/lib/agent-bridge";

interface Store {
  employees: Employee[];
  leave: LeaveRequest[];
  loading: boolean;
  caps: BridgeCapabilities;
  context: AppContextV1 | null;
  behavior: UserActionV1[];
  addEmployee: (data: Omit<Employee, "id" | "joinDate">) => Promise<Employee>;
  updateEmployee: (id: string, patch: Partial<Employee>) => Promise<Employee | null>;
  deleteEmployee: (id: string) => Promise<boolean>;
  addLeaveRequest: (data: Omit<LeaveRequest, "id" | "createdAt" | "status">) => Promise<LeaveRequest>;
  updateLeaveStatus: (id: string, status: "approved" | "rejected", employeeName: string) => Promise<void>;
  reset: () => Promise<void>;
  setContext: (ctx: AppContextV1) => void;
  track: (evt: Omit<UserActionV1, "at" | "version">) => void;
  refreshData: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp phải dùng bên trong <AppProvider>");
  return v;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [caps, setCaps] = useState<BridgeCapabilities>({
    globalContext: false,
    jsonLd: false,
    nexlabAppSdk: false,
    webmcp: false,
    detail: {},
  });
  const [context, setCtxState] = useState<AppContextV1 | null>(null);
  const [behavior, setBehavior] = useState<UserActionV1[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, lRes] = await Promise.all([
        fetch("/api/employees").then((r) => r.json()),
        fetch("/api/leave-requests").then((r) => r.json()),
      ]);
      setEmployees(eRes.data || []);
      setLeave(lRes.data || []);
    } catch (err) {
      console.error("Lỗi nạp dữ liệu HR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    setCaps(detectCapabilities());

    const onAct = () => setBehavior([...getBehaviorLog()]);
    window.addEventListener("nexlab:action", onAct);
    return () => window.removeEventListener("nexlab:action", onAct);
  }, [load]);

  /** Đăng ký Tool ở mức L4/L5 cho WebMCP / Hub */
  useEffect(() => {
    const dispose = registerTools([
      {
        name: "hr.getEmployee",
        description:
          "Lấy thông tin nhân viên theo ID. Không bao gồm số CMND hoặc mức lương riêng tư.",
        inputSchema: {
          type: "object",
          properties: { id: { type: "string", description: "Mã nhân viên (VD: emp-001)" } },
          required: ["id"],
        },
        risk: "read",
        requiresApproval: false,
        async execute(args) {
          const emp = employees.find((x) => x.id === args.id);
          const text = emp
            ? `${emp.name} · ${emp.department} · ${emp.position} · còn ${emp.leaveBalance} ngày phép`
            : `Không tìm thấy nhân viên ${String(args.id)}`;
          return { content: [{ type: "text", text }] };
        },
      },
    ]);
    return dispose;
  }, [employees]);

  /** Công bố context cho Hub / L3a (Debounce 300ms) */
  const setContext = useCallback((ctx: AppContextV1) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const c = publishContext(ctx);
      setCaps(c);
      setCtxState(ctx);
    }, 300);
  }, []);

  /** Ghi nhận hành vi user realtime */
  const track = useCallback((evt: Omit<UserActionV1, "at" | "version">) => {
    reportUserAction(evt);
    setBehavior([...getBehaviorLog()]);
  }, []);

  /** Thêm nhân viên */
  const addEmployee = useCallback(
    async (data: Omit<Employee, "id" | "joinDate">): Promise<Employee> => {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể tạo nhân viên");

      const created: Employee = json.data;
      setEmployees((prev) => [created, ...prev]);

      track({
        type: "entity.created",
        entity: { type: "employee", id: created.id, label: created.name },
        detail: { action: "create_employee", id: created.id },
      });

      return created;
    },
    [track]
  );

  /** Cập nhật nhân viên */
  const updateEmployee = useCallback(
    async (id: string, patch: Partial<Employee>): Promise<Employee | null> => {
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      return json.data || null;
    },
    []
  );

  /** Xóa nhân viên */
  const deleteEmployee = useCallback(
    async (id: string): Promise<boolean> => {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      return res.ok;
    },
    []
  );

  /** Thêm đơn nghỉ phép */
  const addLeaveRequest = useCallback(
    async (data: Omit<LeaveRequest, "id" | "createdAt" | "status">): Promise<LeaveRequest> => {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không thể tạo đơn nghỉ phép");

      const created: LeaveRequest = json.data;
      setLeave((prev) => [created, ...prev]);

      track({
        type: "entity.created",
        entity: { type: "leaveRequest", id: created.id, label: `${created.employeeName} (${created.startDate})` },
        detail: { action: "create_leave", id: created.id },
      });

      return created;
    },
    [track]
  );

  /** Duyệt hoặc từ chối đơn */
  const updateLeaveStatus = useCallback(
    async (id: string, status: "approved" | "rejected", employeeName: string): Promise<void> => {
      setLeave((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Không thể cập nhật trạng thái đơn");
      }

      track({
        type: "action.performed",
        entity: { type: "leaveRequest", id },
        detail: { action: status, employeeName },
      });
    },
    [track]
  );

  /** Reset dữ liệu về seed khởi tạo */
  const reset = useCallback(async () => {
    await fetch("/api/reset", { method: "POST" });
    if (typeof window !== "undefined") window.__NEXLAB_BEHAVIOR__ = [];
    setBehavior([]);
    await load();
  }, [load]);

  const value = useMemo<Store>(
    () => ({
      employees,
      leave,
      loading,
      caps,
      context,
      behavior,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLeaveRequest,
      updateLeaveStatus,
      reset,
      setContext,
      track,
      refreshData: load,
    }),
    [
      employees,
      leave,
      loading,
      caps,
      context,
      behavior,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLeaveRequest,
      updateLeaveStatus,
      reset,
      setContext,
      track,
      load,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
