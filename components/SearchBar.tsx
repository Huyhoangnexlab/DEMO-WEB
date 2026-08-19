"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm theo tên nhân viên, chức vụ, email...",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex-1 min-w-[260px] max-w-md group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        <Search className="w-4 h-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-14 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all shadow-xs"
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
        {value ? (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all"
            type="button"
            title="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
