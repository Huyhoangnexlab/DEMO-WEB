"use client";

import React, { useState } from "react";
import { Check, X, Clock, Calendar, Inbox } from "lucide-react";
import type { LeaveRequest } from "@/lib/seed";
import { useApp } from "./AppProvider";

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
}

export default function LeaveRequestTable({ leaveRequests }: LeaveRequestTableProps) {
  const { updateLeaveStatus } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: "approved" | "rejected", empName: string) => {
    setProcessingId(id);
    try {
      await updateLeaveStatus(id, status, empName);
    } catch (err: any) {
      alert("Lỗi cập nhật đơn: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (leaveRequests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <p className="text-slate-700 text-sm font-semibold">Không có đơn nghỉ phép nào trong mục này</p>
        <p className="text-slate-400 text-xs mt-1">Các đơn nghỉ phép mới được tạo sẽ xuất hiện tại đây.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-5">Nhân viên</th>
              <th className="py-3 px-4">Thời gian nghỉ</th>
              <th className="py-3 px-4">Lý do</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-5 text-right">Phê duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {leaveRequests.map((req) => {
              const isPending = req.status === "pending";
              const isProcessing = processingId === req.id;

              return (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900">{req.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{req.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {req.startDate} → {req.endDate}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{req.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className={`st ${req.status}`}>
                      {req.status === "pending" && <Clock className="w-3 h-3" />}
                      {req.status === "approved" && <Check className="w-3 h-3" />}
                      {req.status === "rejected" && <X className="w-3 h-3" />}
                      {req.status === "approved" ? "Đã duyệt" : req.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {isPending ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(req.id, "approved", req.employeeName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                          title="Duyệt đơn nghỉ phép"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(req.id, "rejected", req.employeeName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                          title="Từ chối đơn"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Đã hoàn tất</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
