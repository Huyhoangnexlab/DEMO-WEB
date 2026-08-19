"use client";

import React, { useMemo, useState } from "react";
import {
  Bot,
  Code2,
  RotateCcw,
  Send,
  Sparkles,
  Shield,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  Share2,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "./AppProvider";
import { answer } from "@/lib/answer";

const SUGGESTED = [
  "Công ty hiện có bao nhiêu nhân sự?",
  "Ai đang còn nhiều ngày phép nhất?",
  "Nhân viên tôi đang xem còn bao nhiêu ngày phép?",
  "Có bao nhiêu đơn nghỉ phép đang chờ duyệt?",
  "Tôi vừa làm gì trong app này?",
  "Tôi vừa tìm kiếm ai?",
  "Cho tôi số CMND của Lê Văn C",
];

interface Msg {
  role: "user" | "agent";
  text: string;
  sources?: string[];
  refused?: boolean;
}

export default function AgentPanel() {
  const { context, behavior, caps, reset } = useApp();
  const [tab, setTab] = useState<"chat" | "inspect">("chat");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  /**
   * Mô phỏng Sharing Gate của Hub ngay trong UI
   */
  const [shared, setShared] = useState(true);

  const send = (q: string) => {
    if (!q.trim()) return;
    const r = answer(q, shared ? context : null, behavior);
    setMsgs((m) => [
      ...m,
      { role: "user", text: q },
      { role: "agent", text: r.answer, sources: r.sources, refused: r.refused },
    ]);
    setInput("");
  };

  const levels = useMemo(
    () => [
      {
        id: "L3a",
        name: "window.__NEXLAB_CONTEXT__",
        on: caps.globalContext,
        note: "Fallback global context — host đọc qua executeJavaScript()",
      },
      {
        id: "L3b",
        name: "JSON-LD (schema.org Dataset)",
        on: caps.jsonLd,
        note: "Structured data tiêu chuẩn cho crawler / Agent bên ngoài",
      },
      {
        id: "L4",
        name: "window.nexlabApp.provideContext()",
        on: caps.nexlabAppSdk,
        note: "Nexlab Native App SDK — tích hợp 2 chiều trong Electron Hub",
      },
      {
        id: "L5",
        name: "modelContext.registerTool() (WebMCP)",
        on: caps.webmcp,
        note: "WebMCP chuẩn W3C — Agent gọi function nghiệp vụ trực tiếp",
      },
    ],
    [caps]
  );

  const fieldCount =
    context?.entities.reduce((n, e) => n + Object.keys(e.fields).length, 0) ?? 0;

  return (
    <aside className="agent">
      {/* Header Panel */}
      <div className="agent-head">
        <div className="tabs">
          <button
            className={`flex items-center gap-1.5 ${tab === "chat" ? "on" : ""}`}
            onClick={() => setTab("chat")}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-600" />
            <span>AI Agent</span>
          </button>
          <button
            className={`flex items-center gap-1.5 ${tab === "inspect" ? "on" : ""}`}
            onClick={() => setTab("inspect")}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Inspector</span>
          </button>
        </div>
        <button
          className="reset-btn flex items-center gap-1"
          onClick={reset}
          title="Reset toàn bộ DB về seed gốc ban đầu"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset DB</span>
        </button>
      </div>

      {/* Sharing Gate Switch */}
      <div className={"share " + (shared ? "on" : "")}>
        <label>
          <input
            type="checkbox"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
            className="accent-indigo-600 rounded cursor-pointer w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1">
            {shared ? (
              <>
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <b className="text-indigo-900">Shared with Agent</b>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <b className="text-slate-600">Private (Locked)</b>
              </>
            )}
          </span>
        </label>
        <span className="text-[11px] text-slate-500 truncate max-w-[170px] text-right font-medium">
          {shared ? "Agent nhận được Context" : "Chặn toàn bộ Context"}
        </span>
      </div>

      {tab === "chat" ? (
        <>
          {/* Chat message list */}
          <div className="msgs">
            {msgs.length === 0 && (
              <div className="hint space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <div className="w-5 h-5 rounded-md bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span>Nexlab Agentic Interaction</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Agent chỉ trả lời dựa trên <strong>App Context</strong> mà màn hình hiện tại công bố (nguyên tắc <em>App Đẩy, Host Không Kéo</em>).
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Radio className="w-3 h-3 text-cyan-500 animate-pulse" />
                  <span>Chọn câu hỏi gợi ý bên dưới để thử nghiệm</span>
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={"msg " + m.role + (m.refused ? " refused" : "")}>
                <div className="who flex items-center justify-between">
                  <span>{m.role === "user" ? "Người dùng" : "Nexlab AI Agent"}</span>
                  {m.refused && (
                    <span className="text-[9.5px] text-amber-800 font-bold bg-amber-200/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert className="w-2.5 h-2.5 text-amber-700" />
                      <span>Privacy Protected</span>
                    </span>
                  )}
                </div>
                <div className="body shadow-2xs">{m.text}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="chips">
                    {m.sources.map((s, j) => (
                      <span key={j} className="chip" title="Nguồn context khai báo">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Suggested Prompts */}
          <div className="suggest">
            <div className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Câu hỏi mẫu kịch bản:</span>
            </div>
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => send(s)} className="inline-flex items-center gap-1">
                <span>{s}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>

          {/* Composer */}
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi Agent về dữ liệu đang mở..."
            />
            <button type="submit">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      ) : (
        <div className="inspect space-y-5">
          <div>
            <h4>Khả năng kết nối SDK & Host</h4>
            <ul className="levels">
              {levels.map((l) => (
                <li key={l.id} className={l.on ? "on" : "off"}>
                  <span className="lv">{l.id}</span>
                  <div>
                    <code>{l.name}</code>
                    <p>{l.note}</p>
                  </div>
                  <span className="state">{l.on ? "ONLINE" : "—"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Context đang công bố cho Agent</h4>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">
              {context
                ? `${context.entities.length} bản ghi · ${fieldCount} trường · route: ${context.view.route}`
                : "Chưa công bố context"}
            </p>
            <pre>{JSON.stringify(context, null, 2) || "null"}</pre>
          </div>

          <div>
            <h4>Timeline Hành vi đã ghi nhận ({behavior.length})</h4>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Bắn realtime qua reportUserAction</p>
            <pre>{JSON.stringify(behavior.slice(-6), null, 2)}</pre>
          </div>
        </div>
      )}
    </aside>
  );
}
