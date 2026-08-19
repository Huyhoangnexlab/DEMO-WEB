"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Mail, UserX } from "lucide-react";
import type { Employee } from "@/lib/seed";
import { getDepartmentLabel } from "@/lib/seed";

interface EmployeeTableProps {
  employees: Employee[];
  onSelectEmployee?: (emp: Employee) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarStyle(dept: string): { bg: string; text: string; border: string } {
  switch (dept) {
    case "hr":
      return { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" };
    case "engineering":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "finance":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
  }
}

export default function EmployeeTable({ employees, onSelectEmployee }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <p className="text-slate-700 text-sm font-semibold">Không tìm thấy nhân viên nào phù hợp</p>
        <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
          Hãy thử đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc phòng ban để xem kết quả khác.
        </p>
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
              <th className="py-3 px-4">Phòng ban</th>
              <th className="py-3 px-4">Chức vụ</th>
              <th className="py-3 px-4 text-center">Ngày phép</th>
              <th className="py-3 px-5 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {employees.map((emp) => {
              const initials = getInitials(emp.name);
              const avatar = getAvatarStyle(emp.department);
              const deptLabel = getDepartmentLabel(emp.department);

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee?.(emp)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center font-bold text-xs border ${avatar.bg} ${avatar.text} ${avatar.border} flex-shrink-0 shadow-2xs`}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {emp.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-300" />
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`dept-badge ${emp.department}`}>{deptLabel}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{emp.position}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs font-mono">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {emp.leaveBalance} ngày
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-600 group-hover:border-indigo-200 transition-all border border-slate-200/70"
                    >
                      <span>Hồ sơ</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
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
