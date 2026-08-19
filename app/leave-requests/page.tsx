"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock, CheckCircle2, XCircle, ListFilter, CalendarCheck } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import LeaveRequestTable from "@/components/LeaveRequestTable";
import CreateLeaveModal from "@/components/CreateLeaveModal";

export default function LeaveRequestsPage() {
  const { leave, employees, loading, setContext, track } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLeaves = useMemo(() => {
    if (statusFilter === "all") return leave;
    return leave.filter((l) => l.status === statusFilter);
  }, [leave, statusFilter]);

  const pendingCount = useMemo(() => leave.filter((l) => l.status === "pending").length, [leave]);
  const approvedCount = useMemo(() => leave.filter((l) => l.status === "approved").length, [leave]);
  const rejectedCount = useMemo(() => leave.filter((l) => l.status === "rejected").length, [leave]);

  /**
   * CÔNG BỐ CONTEXT cho Hub Agent ở màn hình Đơn nghỉ phép
   */
  useEffect(() => {
    if (loading) return;

    setContext({
      version: "1.0",
      classification: "internal",
      view: {
        route: "/leave-requests",
        title: "Quản lý đơn nghỉ phép",
      },
      entities: filteredLeaves.map((l) => ({
        type: "leaveRequest",
        id: l.id,
        label: `${l.employeeName} (${l.startDate} → ${l.endDate})`,
        fields: {
          employeeName: {
            value: l.employeeName,
            label: "Tên nhân viên",
            source: `GET /api/leave-requests/${l.id}#employeeName`,
          },
          status: {
            value: l.status,
            label: "Trạng thái",
            source: `GET /api/leave-requests/${l.id}#status`,
          },
          startDate: {
            value: l.startDate,
            label: "Ngày bắt đầu",
            source: `GET /api/leave-requests/${l.id}#startDate`,
          },
          endDate: {
            value: l.endDate,
            label: "Ngày kết thúc",
            source: `GET /api/leave-requests/${l.id}#endDate`,
          },
          reason: {
            value: l.reason,
            label: "Lý do",
            source: `GET /api/leave-requests/${l.id}#reason`,
          },
        },
      })),
      aggregates: {
        pendingLeaveRequests: pendingCount,
        approvedLeaveRequests: approvedCount,
        rejectedLeaveRequests: rejectedCount,
        totalLeaveRequests: leave.length,
        currentStatusFilter: statusFilter,
      },
    });
  }, [filteredLeaves, leave.length, pendingCount, approvedCount, rejectedCount, statusFilter, loading, setContext]);

  useEffect(() => {
    track({ type: "view.opened", detail: { route: "/leave-requests" } });
  }, [track]);

  if (loading) {
    return (
      <main className="main">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-slate-500 font-medium animate-pulse">Đang tải danh sách đơn nghỉ phép...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý đơn nghỉ phép</h1>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              Leave Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Theo dõi, phê duyệt đơn xin nghỉ và đồng bộ lịch nghỉ phép của toàn công ty
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200/60 cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>+ Tạo đơn nghỉ phép</span>
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Tất cả ({leave.length})</span>
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ duyệt ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã duyệt ({approvedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === "rejected"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/60"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Từ chối ({rejectedCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-semibold px-3">
          Hiển thị: <strong className="text-slate-800 font-mono">{filteredLeaves.length}</strong> đơn
        </div>
      </div>

      {/* Leave Requests Table */}
      <LeaveRequestTable leaveRequests={filteredLeaves} />

      {/* Modal Tạo đơn nghỉ phép */}
      <CreateLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={employees}
      />
    </main>
  );
}
