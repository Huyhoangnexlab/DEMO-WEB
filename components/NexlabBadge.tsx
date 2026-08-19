"use client";

import React from "react";
import { useApp } from "./AppProvider";
import { ShieldCheck, Globe } from "lucide-react";

export default function NexlabBadge() {
  const { caps } = useApp();
  const inHub = caps.nexlabAppSdk;

  return (
    <div
      className={"badge-hub " + (inHub ? "on" : "off")}
      title={
        inHub
          ? "window.nexlabApp có mặt — app đang chạy nhúng trong Electron native shell (Nexlab Hub)"
          : "window.nexlabApp không có — app đang chạy Standalone trên trình duyệt"
      }
    >
      {inHub ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-800">In Hub (SDK Active)</span>
        </>
      ) : (
        <>
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Standalone Web</span>
        </>
      )}
    </div>
  );
}
