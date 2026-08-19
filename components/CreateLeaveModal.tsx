"use client";

import React, { useState } from "react";
import { X, CalendarPlus, Calendar, User, AlignLeft, Sparkles } from "lucide-react";
import type { Employee } from "@/lib/seed";
import { useApp } from "./AppProvider";

interface CreateLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

export default function CreateLeaveModal({ isOpen, onClose, employees }: CreateLeaveModalProps) {
  const { addLeaveRequest } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || "emp-001",
    startDate: "2026-08-25",
    endDate: "2026-08-26",
    reason: "Việc gia đình",
  });

  if (!isOpen) return null;

  const selectedEmp = employees.find((e) => e.id === formData.employeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      alert("Vui lòng điền đầy đủ các thông tin!");
      return;
    }

    setLoading(true);
    try {
      await addLeaveRequest({
        employeeId: formData.employeeId,
        employeeName: selectedEmp?.name || formData.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });
      onClose();
      setFormData({
        employeeId: employees[0]?.id || "emp-001",
        startDate: "2026-08-25",
        endDate: "2026-08-26",
        reason: "Việc gia đình",
      });
    } catch (err: any) {
      alert("Lỗi tạo đơn nghỉ phép: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <CalendarPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Tạo đơn nghỉ phép</h2>
              <p className="text-xs text-slate-500 mt-0.5">Gửi yêu cầu nghỉ phép mới vào hệ thống</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            type="button"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nhân viên xin nghỉ</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all cursor-pointer"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.position} — còn {e.leaveBalance} ngày phép)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Từ ngày</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Đến ngày</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Lý do nghỉ phép</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nghỉ phép năm, Việc gia đình, Khám sức khỏe..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Đang gửi..." : "Gửi đơn nghỉ phép"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
