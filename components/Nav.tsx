"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CalendarDays, Cpu, RotateCcw } from "lucide-react";
import NexlabBadge from "./NexlabBadge";
import { useApp } from "./AppProvider";

const LINKS = [
  { href: "/", label: "Hồ sơ nhân sự", icon: Users },
  { href: "/leave-requests", label: "Đơn nghỉ phép", icon: CalendarDays },
];

export default function Nav() {
  const path = usePathname();
  const { reset } = useApp();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await reset();
    } finally {
      setResetting(false);
    }
  };

  return (
    <nav className="nav">
      {/* Brand logo & title */}
      <Link href="/" className="nav-brand group">
        <div className="brand-logo transition-transform group-hover:scale-105">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="leading-none text-slate-900 font-bold">Nexlab HR</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-normal mt-0.5">
            Intelligent Workbench
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        {LINKS.map((l) => {
          const Icon = l.icon;
          const isActive = path === l.href || (l.href !== "/" && path.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={isActive ? "active" : ""}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Action controls & Hub connection state badges */}
      <div className="flex items-center gap-2.5 ml-auto">
        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-all border border-slate-200/80 cursor-pointer disabled:opacity-50"
          title="Reset toàn bộ DB về seed gốc ban đầu"
        >
          <RotateCcw className={`w-3 h-3 ${resetting ? "animate-spin text-indigo-600" : ""}`} />
          <span className="hidden sm:inline">{resetting ? "Resetting..." : "Reset Data"}</span>
        </button>
        <NexlabBadge />
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
          v2.0
        </span>
      </div>
    </nav>
  );
}
