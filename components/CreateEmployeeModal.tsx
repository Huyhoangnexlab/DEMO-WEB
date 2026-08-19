"use client";

import React, { useState } from "react";
import { X, UserPlus, Lock, Sparkles, Building2, Briefcase, Mail, User, ShieldCheck } from "lucide-react";
import { DEPARTMENTS, type DepartmentKey } from "@/lib/seed";
import { useApp } from "./AppProvider";

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEmployeeModal({ isOpen, onClose }: CreateEmployeeModalProps) {
  const { addEmployee } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "hr" as DepartmentKey,
    position: "",
    leaveBalance: 12,
    nationalId: "",
    salary: 18000000,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.position) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await addEmployee({
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department,
        position: formData.position.trim(),
        leaveBalance: Number(formData.leaveBalance) || 12,
        nationalId: formData.nationalId.trim() || "079201009999",
        salary: Number(formData.salary) || 15000000,
      });
      onClose();
      // Reset form
      setFormData({
        name: "",
        email: "",
        department: "hr",
        position: "",
        leaveBalance: 12,
        nationalId: "",
        salary: 18000000,
      });
    } catch (err: any) {
      alert("Lỗi tạo nhân viên: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Thêm nhân viên mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">Khởi tạo hồ sơ nhân sự vào hệ thống</p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Họ và tên</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn Nam"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email công việc</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="nam.nguyen@nexlab.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Phòng ban</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentKey })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-medium text-slate-900 cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Chức vụ</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Senior Developer"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số ngày phép ban đầu
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.leaveBalance}
                onChange={(e) => setFormData({ ...formData, leaveBalance: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all font-bold text-indigo-600 font-mono"
              />
            </div>
          </div>

          {/* Dữ liệu nhạy cảm (Private Vault) */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Dữ liệu nhạy cảm (Không đưa vào AI Context)</span>
              </div>
              <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                Private
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số CMND / CCCD
                </label>
                <input
                  type="text"
                  placeholder="079201009999"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mức lương (VNĐ)
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-mono text-slate-800 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
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
              <span>{loading ? "Đang xử lý..." : "Tạo nhân viên"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
