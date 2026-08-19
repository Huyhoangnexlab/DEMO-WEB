"use client";

import React from "react";
import { Filter } from "lucide-react";
import { DEPARTMENTS } from "@/lib/seed";

interface DepartmentFilterProps {
  value: string;
  onChange: (dept: string) => void;
}

export default function DepartmentFilter({ value, onChange }: DepartmentFilterProps) {
  return (
    <div className="relative inline-flex items-center">
      <div className="absolute left-3 pointer-events-none text-slate-400">
        <Filter className="w-3.5 h-3.5" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Lọc theo phòng ban"
        className="pl-8.5 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-xs"
      >
        <option value="all">Tất cả phòng ban</option>
        {DEPARTMENTS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none text-slate-400 text-[10px]">
        ▼
      </div>
    </div>
  );
}
