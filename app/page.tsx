"use client";

import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, Users, CalendarClock, Sparkles, Building } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import SearchBar from "@/components/SearchBar";
import DepartmentFilter from "@/components/DepartmentFilter";
import EmployeeTable from "@/components/EmployeeTable";
import CreateEmployeeModal from "@/components/CreateEmployeeModal";
import type { Employee } from "@/lib/seed";

export default function EmployeeListPage() {
  const { employees, leave, loading, setContext, track } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lọc danh sách nhân viên
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = deptFilter === "all" || emp.department === deptFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);
      return matchDept && matchQ;
    });
  }, [employees, deptFilter, searchQuery]);

  const pendingLeaveCount = useMemo(() => {
    return leave.filter((l) => l.status === "pending").length;
  }, [leave]);

  /**
   * CÔNG BỐ CONTEXT cho Hub Agent ở màn hình danh sách
   */
  useEffect(() => {
    if (loading) return;

    setContext({
      version: "1.0",
      classification: "internal",
      view: {
        route: "/",
        title: "Danh sách nhân sự",
      },
      entities: filteredEmployees.map((e) => ({
        type: "employee",
        id: e.id,
        label: e.name,
        fields: {
          department: {
            value: e.department,
            label: "Phòng ban",
            source: "GET /api/employees#department",
          },
          position: {
            value: e.position,
            label: "Chức vụ",
            source: "GET /api/employees#position",
          },
          leaveBalance: {
            value: e.leaveBalance,
            label: "Ngày phép còn lại",
            source: "GET /api/employees#leaveBalance",
          },
          email: {
            value: e.email,
            label: "Email",
            source: "GET /api/employees#email",
          },
        },
      })),
      aggregates: {
        totalEmployees: employees.length,
        filteredEmployeesCount: filteredEmployees.length,
        pendingLeaveRequests: pendingLeaveCount,
        departmentFilter: deptFilter,
      },
    });
  }, [filteredEmployees, employees.length, pendingLeaveCount, deptFilter, loading, setContext]);

  // Event view.opened khi vào trang
  useEffect(() => {
    track({ type: "view.opened", detail: { route: "/" } });
  }, [track]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    track({
      type: "search.performed",
      detail: { query: q || "(tất cả)", resultsCount: filteredEmployees.length },
    });
  };

  const handleDeptFilter = (dept: string) => {
    setDeptFilter(dept);
    track({
      type: "search.performed",
      detail: { department: dept },
    });
  };

  const handleSelectEmployee = (emp: Employee) => {
    track({
      type: "entity.viewed",
      entity: { type: "employee", id: emp.id, label: emp.name },
    });
  };

  if (loading) {
    return (
      <main className="main">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-slate-500 font-medium animate-pulse">Đang nạp dữ liệu nhân sự...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý nhân sự</h1>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Workspace Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Theo dõi hồ sơ, phân bổ phòng ban và số ngày phép khả dụng của nhân sự
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200/60 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Thêm nhân viên</span>
        </button>
      </div>

      {/* Metric Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng nhân sự</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{employees.length} <span className="text-sm font-sans font-medium text-slate-500">người</span></div>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Hoạt động
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đơn chờ duyệt</div>
              <div className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">{pendingLeaveCount} <span className="text-sm font-sans font-medium text-slate-500">yêu cầu</span></div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            Cần xử lý
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <SearchBar value={searchQuery} onChange={handleSearch} />
          <DepartmentFilter value={deptFilter} onChange={handleDeptFilter} />
        </div>
        <div className="text-xs text-slate-500 font-semibold pr-3">
          Hiển thị: <strong className="text-slate-800 font-mono">{filteredEmployees.length}</strong> / {employees.length} nhân viên
        </div>
      </div>

      {/* Employee List Table */}
      <EmployeeTable
        employees={filteredEmployees}
        onSelectEmployee={handleSelectEmployee}
      />

      {/* Modal Thêm Nhân viên */}
      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
