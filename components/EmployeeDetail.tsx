"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  Calendar,
  Building,
  Briefcase,
  Mail,
  UserCheck,
  Lock,
  Sparkles,
  Info,
} from "lucide-react";
import type { Employee, LeaveRequest } from "@/lib/seed";
import { DEPARTMENTS, getDepartmentLabel, type DepartmentKey } from "@/lib/seed";
import { useApp } from "./AppProvider";

interface EmployeeDetailProps {
  employee: Employee;
  leaveRequests: LeaveRequest[];
}

export default function EmployeeDetail({ employee, leaveRequests }: EmployeeDetailProps) {
  const router = useRouter();
  const { updateEmployee, deleteEmployee, track } = useApp();

  const [reveal, setReveal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    department: employee.department,
    position: employee.position,
    leaveBalance: employee.leaveBalance,
  });

  const handleFieldChange = (field: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    track({
      type: "field.edited",
      entity: { type: "employee", id: employee.id, label: employee.name },
      detail: { field },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEmployee(employee.id, {
        department: form.department as DepartmentKey,
        position: form.position,
        leaveBalance: Number(form.leaveBalance),
      });
      track({
        type: "form.submitted",
        entity: { type: "employee", id: employee.id, label: employee.name },
        detail: { form: "employee-update" },
      });
      alert("Đã lưu thông tin nhân viên thành công!");
    } catch (err: any) {
      alert("Lỗi lưu thông tin: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên ${employee.name} khỏi hệ thống?`)) {
      return;
    }
    try {
      await deleteEmployee(employee.id);
      track({
        type: "action.performed",
        entity: { type: "employee", id: employee.id, label: employee.name },
        detail: { action: "delete_employee", id: employee.id },
      });
      router.push("/");
    } catch (err: any) {
      alert("Lỗi xóa nhân viên: " + err.message);
    }
  };

  const deptLabel = getDepartmentLabel(employee.department);

  return (
    <div className="space-y-6">
      {/* Top navigation & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại danh sách nhân sự</span>
        </Link>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa nhân viên</span>
        </button>
      </div>

      {/* Employee Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-100 flex-shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{employee.name}</h1>
              <span className={`dept-badge ${employee.department}`}>{deptLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {employee.position}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Gia nhập: {employee.joinDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto bg-indigo-50/70 border border-indigo-100 px-4 py-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[10.5px] font-bold text-indigo-700 uppercase tracking-wider">Phép còn lại</div>
            <div className="text-xl font-extrabold text-indigo-900 font-mono mt-0.5">{employee.leaveBalance} ngày</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Chỉnh sửa thông tin */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Thông tin hồ sơ nghiệp vụ</h2>
                <p className="text-xs text-slate-500 mt-0.5">Dữ liệu này được công bố vào AI AppContext</p>
              </div>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-600" />
                <span>Agent Read Enabled</span>
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phòng ban
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => handleFieldChange("department", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => handleFieldChange("position", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số ngày phép còn lại
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={form.leaveBalance}
                    onChange={(e) => handleFieldChange("leaveBalance", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 font-mono focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email công việc
                  </label>
                  <input
                    type="text"
                    disabled
                    value={employee.email}
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200/80 rounded-xl text-sm text-slate-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all shadow-sm shadow-indigo-100 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Lịch sử nghỉ phép của nhân viên */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Đơn nghỉ phép của nhân viên ({leaveRequests.length})
              </h2>
              <span className="text-xs text-slate-400 font-medium">Hồ sơ cá nhân</span>
            </div>

            {leaveRequests.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">Chưa có đơn nghỉ phép nào được ghi nhận.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {leaveRequests.map((lr) => (
                  <div key={lr.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{lr.reason}</div>
                      <div className="text-slate-400 font-mono mt-0.5">
                        {lr.startDate} → {lr.endDate}
                      </div>
                    </div>
                    <span className={`st ${lr.status}`}>
                      {lr.status === "approved" ? "Đã duyệt" : lr.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Khối Thông tin Nhạy cảm (Bảo mật Vault) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-amber-50/80 to-amber-50/40 rounded-3xl border border-amber-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Privacy Vault</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                Strict Private
              </span>
            </div>

            <p className="text-xs text-amber-900/80 mb-5 leading-relaxed">
              Thông tin này <strong>hiển thị trên màn hình</strong> cho người dùng xem nhưng{" "}
              <strong>cố ý không khai báo vào Context</strong> của AI Agent. Khi hỏi số CMND hoặc lương, Agent sẽ từ chối.
            </p>

            <div className="space-y-4 bg-white/90 rounded-2xl p-4.5 border border-amber-200/60 shadow-2xs">
              <div>
                <span className="block text-[10.5px] font-bold uppercase text-slate-400 tracking-wider">
                  Số CMND / Căn cước
                </span>
                <div className="font-mono text-base font-bold text-slate-900 mt-1">
                  {reveal ? employee.nationalId : "•••• •••• ••••"}
                </div>
              </div>

              <div>
                <span className="block text-[10.5px] font-bold uppercase text-slate-400 tracking-wider">
                  Mức lương hàng tháng
                </span>
                <div className="font-mono text-base font-bold text-slate-900 mt-1">
                  {reveal ? employee.salary.toLocaleString("vi-VN") + " ₫" : "•••••••• ₫"}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setReveal(!reveal)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200/80 text-amber-900 transition-all border border-amber-300/80 cursor-pointer shadow-2xs active:scale-95"
                >
                  {reveal ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Ẩn thông tin bảo mật</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>👁 Hiện thông tin bảo mật</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
