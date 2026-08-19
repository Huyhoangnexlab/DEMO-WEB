"use client";

import React, { useEffect, use } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import EmployeeDetail from "@/components/EmployeeDetail";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { employees, leave, loading, setContext, track } = useApp();

  const emp = employees.find((e) => e.id === id);
  const employeeLeaves = leave.filter((l) => l.employeeId === id);

  /**
   * CÔNG BỐ CONTEXT cho Hub Agent ở màn hình chi tiết nhân sự.
   *
   * ⚠️ BẢO MẬT: `nationalId` và `salary` KHÔNG ĐƯỢC PHÉP có mặt trong `fields`.
   * Đây là chốt quan trọng nhất để Agent từ chối câu hỏi G5 & N2 dù dữ liệu
   * đang hiện trên giao diện.
   */
  useEffect(() => {
    if (loading || !emp) return;

    setContext({
      version: "1.0",
      classification: "internal",
      view: {
        route: `/employees/${emp.id}`,
        title: `${emp.name} — Hồ sơ nhân viên`,
        focusedEntity: { type: "employee", id: emp.id, label: emp.name },
      },
      entities: [
        {
          type: "employee",
          id: emp.id,
          label: emp.name,
          fields: {
            department: {
              value: emp.department,
              label: "Phòng ban",
              source: `GET /api/employees/${emp.id}#department`,
            },
            position: {
              value: emp.position,
              label: "Chức vụ",
              source: `GET /api/employees/${emp.id}#position`,
            },
            leaveBalance: {
              value: emp.leaveBalance,
              label: "Ngày phép còn lại",
              source: `GET /api/employees/${emp.id}#leaveBalance`,
            },
            email: {
              value: emp.email,
              label: "Email",
              source: `GET /api/employees/${emp.id}#email`,
            },
            joinDate: {
              value: emp.joinDate,
              label: "Ngày vào làm",
              source: `GET /api/employees/${emp.id}#joinDate`,
            },
            // nationalId: KHÔNG KHAI BÁO (BẢO MẬT)
            // salary: KHÔNG KHAI BÁO (BẢO MẬT)
          },
        },
        ...employeeLeaves.map((l) => ({
          type: "leaveRequest",
          id: l.id,
          label: `${l.startDate} → ${l.endDate}`,
          fields: {
            status: {
              value: l.status,
              label: "Trạng thái",
              source: `GET /api/leave-requests/${l.id}#status`,
            },
            reason: {
              value: l.reason,
              label: "Lý do",
              source: `GET /api/leave-requests/${l.id}#reason`,
            },
          },
        })),
      ],
      aggregates: {
        pendingLeaveRequests: leave.filter((l) => l.status === "pending").length,
        totalEmployees: employees.length,
      },
    });
  }, [emp, employeeLeaves, leave, employees.length, loading, setContext]);

  useEffect(() => {
    if (emp) {
      track({
        type: "entity.viewed",
        entity: { type: "employee", id: emp.id, label: emp.name },
      });
    }
  }, [emp?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <main className="main">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-slate-500 font-medium animate-pulse">Đang nạp hồ sơ nhân viên...</p>
        </div>
      </main>
    );
  }

  if (!emp) {
    return (
      <main className="main">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Không tìm thấy nhân viên</h2>
          <p className="text-sm text-slate-500 mb-6">Mã nhân viên `{id}` không tồn tại trong hệ thống.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all"
          >
            Quay lại danh sách
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <EmployeeDetail employee={emp} leaveRequests={employeeLeaves} />
    </main>
  );
}
