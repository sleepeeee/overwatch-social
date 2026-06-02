"use client";

import { useEffect, useState } from "react";
import { saveCaptureDisplayNames } from "@/app/actions/developerCapture";
import type { CaptureState } from "@/lib/developer-capture/types";

// ── Constants ──────────────────────────────────────────────────────────────

// GIT_HOOK_SCRIPT: Bash 變數用 \${} 轉義，避免 TS template literal 誤解析
const GIT_HOOK_SCRIPT = `#!/bin/bash
# ----------------------------------------------------------------------
# 據點裁判 NPC 自動結算機關 - Git post-receive Hook
# ----------------------------------------------------------------------
RAW_LOGS=\$(git log --since="midnight" --numstat --pretty=format:"AUTHOR:%an")

python3 - <<EOF
import re
import json
from datetime import datetime

raw_data = """\${RAW_LOGS}"""
lines = raw_data.strip().split('\\n')

players = {
    "left":  {"side": "left",  "label": "你方", "commits": 0, "additions": 0, "deletions": 0},
    "right": {"side": "right", "label": "朋友", "commits": 0, "additions": 0, "deletions": 0}
}

# ⚠️ 請填入您和朋友的 Git 使用者名稱
left_authors  = ["YourGitName",   "你方帳號名"]
right_authors = ["FriendGitName", "朋友帳號名"]

current_author = None

for line in lines:
    if not line:
        continue
    if line.startswith("AUTHOR:"):
        author = line.replace("AUTHOR:", "").strip()
        if author in left_authors:
            current_author = "left"
        elif author in right_authors:
            current_author = "right"
        else:
            current_author = None
        if current_author:
            players[current_author]["commits"] += 1
    else:
        match = re.match(r'^(\\d+)\\s+(\\d+)\\s+.*', line)
        if match and current_author:
            players[current_author]["additions"] += int(match.group(1))
            players[current_author]["deletions"] += int(match.group(2))

for key in ["left", "right"]:
    p = players[key]
    score = (p["commits"] * 10) + (p["additions"] * 0.1) - (p["deletions"] * 0.05)
    p["score"] = max(0, round(score))

total = players["left"]["score"] + players["right"]["score"]
if total > 0:
    players["left"]["percent"]  = round((players["left"]["score"]  / total) * 100)
    players["right"]["percent"] = 100 - players["left"]["percent"]
else:
    players["left"]["percent"] = players["right"]["percent"] = 50

msg = ("你方戰線暫時壓制！" if players["left"]["percent"] > 50
       else "防線告急，敵方正重兵壓制！" if players["left"]["percent"] < 50
       else "據點爭奪異常激烈，戰線持平！")

report = {
    "date": datetime.now().strftime("%Y-%m-%d"),
    "timezone": "Asia/Taipei",
    "updatedAt": datetime.now().isoformat() + "+08:00",
    "status": "ready",
    "message": msg,
    "players": [players["left"], players["right"]]
}

output_path = "/var/www/html/data/outpost.json"
try:
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print("🏆 [據點裁判]：戰績結算完成！已輸出至 " + output_path)
except Exception as e:
    print("❌ [據點裁判]：寫入失敗：" + str(e))
EOF`;

const SVG_SOURCES = {
  radarKnob: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="14" cy="14" r="11" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="3 2" />
  <circle cx="14" cy="14" r="6" fill="#00f0ff" />
  <path d="M14 2V5" stroke="#00f0ff" stroke-width="1" />
  <path d="M14 23V26" stroke="#00f0ff" stroke-width="1" />
</svg>`,
  repoOwner: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  warningShield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  commitNode: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
  <line x1="1.05" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="2"/>
  <line x1="17" y1="12" x2="22.95" y2="12" stroke="currentColor" stroke-width="2"/>
</svg>`,
} as const;

type PresetKey = "live" | "winning" | "neutral" | "losing" | "noAuthor" | "error" | "custom";
type TabKey = "manual" | "exporter" | "spec" | "code";
type DisplayStatus = "ready" | "no_author" | "error";

interface PlayerData {
  side: "left" | "right";
  label: string;
  score: number;
  percent: number;
  commits: number;
  additions: number;
  deletions: number;
}

interface DisplayState {
  date: string;
  timezone: string;
  updatedAt: string;
  status: DisplayStatus;
  message: string;
  players: [PlayerData, PlayerData] | null;
}

// CaptureState.status → DisplayStatus 映射
function mapStatus(s: CaptureState["status"]): DisplayStatus {
  if (s === "missing-config") return "no_author";
  if (s === "git-error") return "error";
  return "ready"; // "ready" | "neutral" 均映射為 ready
}

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

const PRESETS: Record<Exclude<PresetKey, "live" | "custom">, DisplayState> = {
  winning: {
    date: today, timezone: "Asia/Taipei", updatedAt: now, status: "ready",
    message: "我方大獲優勢！成功突破敵方第二防線。",
    players: [
      { side: "left",  label: "你方", score: 82, percent: 68, commits: 14, additions: 620, deletions: 120 },
      { side: "right", label: "朋友", score: 39, percent: 32, commits: 5,  additions: 190, deletions: 45  },
    ],
  },
  neutral: {
    date: today, timezone: "Asia/Taipei", updatedAt: now, status: "ready",
    message: "勢均力敵！中立哨站無人突破。",
    players: [
      { side: "left",  label: "你方", score: 50, percent: 50, commits: 8, additions: 350, deletions: 80 },
      { side: "right", label: "朋友", score: 50, percent: 50, commits: 8, additions: 350, deletions: 80 },
    ],
  },
  losing: {
    date: today, timezone: "Asia/Taipei", updatedAt: now, status: "ready",
    message: "警報！敵方正在重裝火力壓制我方據點。",
    players: [
      { side: "left",  label: "你方", score: 25, percent: 22, commits: 2,  additions: 80,   deletions: 15  },
      { side: "right", label: "朋友", score: 92, percent: 78, commits: 19, additions: 1100, deletions: 320 },
    ],
  },
  noAuthor: {
    date: today, timezone: "Asia/Taipei", updatedAt: now, status: "no_author",
    message: "未設定 Git 識別作者，無法追蹤戰場足跡。",
    players: [
      { side: "left",  label: "你方", score: 0, percent: 50, commits: 0, additions: 0, deletions: 0 },
      { side: "right", label: "朋友", score: 0, percent: 50, commits: 0, additions: 0, deletions: 0 },
    ],
  },
  error: {
    date: today, timezone: "Asia/Taipei", updatedAt: now, status: "error",
    message: "連線異常：無法自內部 Git Daemon 讀取產能紀錄。",
    players: null,
  },
};

// ── Component ──────────────────────────────────────────────────────────────

interface Props { initialState: CaptureState; }

export default function CaptureHudAdjusterClient({ initialState }: Props) {
  // ── SSR 安全：所有 state 用 deterministic default，mount 後 useEffect 讀 localStorage ──
  const [preset, setPreset]         = useState<PresetKey>("winning");
  const [darkMode, setDarkMode]     = useState(true);
  const [leftPercent, setLeftPercent] = useState(68);
  const [leftName, setLeftName]     = useState("你方");
  const [rightName, setRightName]   = useState("朋友");
  const [repoOwner, setRepoOwner]   = useState<"left" | "right">("left");
  const [activeTab, setActiveTab]   = useState<TabKey>("manual");
  const [toast, setToast]           = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [displayState, setDisplayState] = useState<DisplayState | null>(null);

  // 讀 localStorage (client-only, mount 後)
  useEffect(() => {
    const ln = localStorage.getItem("outpost_leftName");
    const rn = localStorage.getItem("outpost_rightName");
    const ro = localStorage.getItem("outpost_repoOwner") as "left" | "right" | null;
    const pct = localStorage.getItem("outpost_percent");
    if (ln) setLeftName(ln);
    if (rn) setRightName(rn);
    if (ro) setRepoOwner(ro);
    if (pct !== null) setLeftPercent(parseInt(pct, 10));
    if (ln || pct) setPreset("custom");
  }, []);

  // dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) { root.classList.add("dark"); root.classList.remove("light"); }
    else          { root.classList.remove("dark"); root.classList.add("light"); }
  }, [darkMode]);

  // 計算 displayState
  useEffect(() => {
    if (preset === "live") {
      setDisplayState({
        date: initialState.date,
        timezone: initialState.timezone,
        updatedAt: initialState.updatedAt,
        status: mapStatus(initialState.status),
        message: initialState.message,
        players: [{ ...initialState.players[0] }, { ...initialState.players[1] }],
      });
      return;
    }
    if (preset === "custom") {
      const r = 100 - leftPercent;
      setDisplayState({
        date: today, timezone: "Asia/Taipei", updatedAt: new Date().toISOString(),
        status: "ready",
        message: leftPercent > 50 ? `${leftName} 取得前線主導權。` : leftPercent < 50 ? `防線失守，${rightName} 正在強力壓制！` : "戰線歸零，全面中立對峙。",
        players: [
          { side: "left",  label: leftName, score: Math.round(leftPercent * 1.2), percent: leftPercent, commits: Math.max(1, Math.round(leftPercent / 5)), additions: leftPercent * 5, deletions: leftPercent * 2 },
          { side: "right", label: rightName, score: Math.round(r * 1.2), percent: r, commits: Math.max(1, Math.round(r / 5)), additions: r * 5, deletions: r * 2 },
        ],
      });
      return;
    }
    const base = PRESETS[preset];
    if (base.players) {
      setDisplayState({
        ...base,
        players: [
          { ...base.players[0], label: leftName || base.players[0].label },
          { ...base.players[1], label: rightName || base.players[1].label },
        ],
      });
      setLeftPercent(base.players[0].percent);
    } else {
      setDisplayState(base);
    }
  }, [preset, leftPercent, leftName, rightName, initialState]);

  // ── Helpers ──
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("outpost_leftName",   leftName);
    localStorage.setItem("outpost_rightName",  rightName);
    localStorage.setItem("outpost_repoOwner",  repoOwner);
    localStorage.setItem("outpost_percent",    String(leftPercent));
    try {
      await saveCaptureDisplayNames({ leftLabel: leftName, rightLabel: rightName });
      showToast("💾 配置已成功儲存！");
    } catch {
      showToast("💾 本地配置已儲存（伺服器同步失敗）");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    ["outpost_leftName","outpost_rightName","outpost_repoOwner","outpost_percent"].forEach(k => localStorage.removeItem(k));
    setLeftName("你方"); setRightName("朋友"); setRepoOwner("left");
    setLeftPercent(68); setPreset("winning");
    showToast("🔄 配置已恢復預設值。");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => showToast("📋 已複製到剪貼簿！"))
      .catch(() => {
        const el = document.createElement("textarea");
        document.body.appendChild(el); el.value = text; el.select();
        document.execCommand("copy"); document.body.removeChild(el);
        showToast("📋 已複製到剪貼簿！");
      });
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast(`已成功打包下載: ${filename}`);
  };

  const downloadSVG = (key: keyof typeof SVG_SOURCES) =>
    downloadFile(`<?xml version="1.0" encoding="utf-8"?>\n${SVG_SOURCES[key]}`, `${key}.svg`, "image/svg+xml");

  const downloadProductionHTML = () => {
    const lp = displayState?.players?.[0]?.percent ?? leftPercent;
    const html = `<!DOCTYPE html>
<html lang="zh-TW" class="dark"><head>
  <meta charset="UTF-8"><title>Git Outpost HUD</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>.hud-scanlines{background:linear-gradient(rgba(18,24,38,0) 50%,rgba(0,0,0,0.25) 50%);background-size:100% 4px;}</style>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">
  <div class="relative w-full max-w-2xl overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-950 p-6 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
    <div class="absolute inset-0 hud-scanlines opacity-20 pointer-events-none"></div>
    <div class="flex justify-between mb-4 border-b pb-3 border-slate-800">
      <span class="text-[10px] font-mono tracking-widest text-slate-500">GIT OUTPOST TELEMETRY</span>
      <div class="text-[10px] px-2 py-0.5 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>${leftName} 正在壓制據點
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div><div class="text-[10px] text-slate-500">LEFT CAMP</div><div class="text-xl font-bold font-mono text-cyan-400">${leftName} <span class="text-xs font-normal text-slate-400">(${Math.round(lp * 1.2)} PTS)</span></div></div>
      <div class="text-right"><div class="text-[10px] text-slate-500">RIGHT CAMP</div><div class="text-xl font-bold font-mono text-orange-400">${rightName} <span class="text-xs font-normal text-slate-400">(${Math.round((100-lp)*1.2)} PTS)</span></div></div>
    </div>
    <div class="relative pt-6 pb-2">
      <div class="absolute top-0 inset-x-0 flex justify-between text-xs font-mono font-black">
        <span class="text-cyan-400">${lp}%</span><span class="text-orange-400">${100-lp}%</span>
      </div>
      <div class="h-2.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
        <div style="width:${lp}%" class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-l-full"></div>
        <div style="width:${100-lp}%" class="h-full bg-gradient-to-l from-rose-600 to-orange-400 rounded-r-full ml-auto"></div>
      </div>
    </div>
  </div>
</body></html>`;
    downloadFile(html, "outpost-hud-production.html", "text/html");
  };

  // ── Theme ──
  const data     = displayState;
  const leftP    = data?.players?.[0];
  const rightP   = data?.players?.[1];
  const status   = data?.status ?? "ready";

  const getTheme = () => {
    if (status !== "ready") return { statusText: "中立狀態", statusColor: "text-slate-400 border-slate-700/50 bg-slate-500/5", glow: "", msgColor: "text-slate-400" };
    if ((leftP?.percent ?? 50) > 50)  return { statusText: `${leftP?.label} 正在壓制據點`, statusColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",    glow: "shadow-[0_0_15px_rgba(0,240,255,0.15)] border-cyan-500/30",   msgColor: "text-cyan-400"   };
    if ((leftP?.percent ?? 50) < 50)  return { statusText: `${rightP?.label} 正在壓制據點`, statusColor: "text-orange-400 border-orange-500/30 bg-orange-500/10", glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)] border-orange-500/30", msgColor: "text-orange-400" };
    return { statusText: "據點爭奪中 (勢均力敵)", statusColor: "text-slate-300 border-slate-700 bg-slate-800/50", glow: "border-slate-800", msgColor: "text-slate-400" };
  };
  const theme = getTheme();

  const cornerColor = (side: "left" | "right") => {
    if (status === "error")     return "text-rose-500";
    if (status === "no_author") return "text-amber-500";
    const pct = side === "left" ? (leftP?.percent ?? 50) : (rightP?.percent ?? 50);
    if (side === "left")  return pct >= 50 ? "text-cyan-400"   : "text-orange-400";
    return                       pct >= 50 ? "text-orange-400" : "text-cyan-400";
  };

  // ── Stats mini-bar helper ──
  const statBar = (leftVal: number, rightVal: number) => {
    const total = Math.max(leftVal + rightVal, 1);
    return { lw: (leftVal / total) * 100, rw: (rightVal / total) * 100 };
  };

  // ── Render ──
  return (
    <div className={darkMode ? "dark" : "light"}>
      <div className="min-h-screen bg-slate-100 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-300 bg-tech-grid pb-20">

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white font-semibold text-xs px-4 py-3 rounded shadow-lg border border-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            {toast}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* ── Top Control Panel ── */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h1 className="text-xl font-bold tracking-wider uppercase text-slate-900 dark:text-white">Git Outpost Console</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">純本地靜態向量代碼渲染 · 一鍵自動打包與 SVG 素材匯出器</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="grid grid-cols-3 sm:flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-md w-full sm:w-auto">
                {([
                  { id: "live"     as PresetKey, label: "真實資料", ac: "bg-emerald-600" },
                  { id: "winning"  as PresetKey, label: "你方壓制", ac: "bg-blue-600"    },
                  { id: "neutral"  as PresetKey, label: "中立對峙", ac: "bg-slate-600"   },
                  { id: "losing"   as PresetKey, label: "敵方壓制", ac: "bg-orange-600"  },
                  { id: "noAuthor" as PresetKey, label: "未設作者", ac: "bg-amber-600"   },
                  { id: "error"    as PresetKey, label: "資料缺失", ac: "bg-red-600"     },
                ]).map(({ id, label, ac }) => (
                  <button key={id} onClick={() => setPreset(id)}
                    className={`px-3 py-1.5 text-xs rounded font-medium transition-all ${preset === id ? `${ac} text-white` : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                {darkMode
                  ? <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                  : <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
              </button>
            </div>
          </div>

          {/* ── Dynamic Slider ── */}
          {status !== "no_author" && status !== "error" && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 shrink-0">動態模擬佔領比率:</span>
              <input type="range" min="0" max="100" value={leftPercent}
                onChange={e => { setPreset("custom"); setLeftPercent(parseInt(e.target.value)); }}
                className="w-full sm:flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <div className="flex gap-2 text-xs font-mono shrink-0">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">{leftName}: {leftPercent}%</span>
                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded">{rightName}: {100 - leftPercent}%</span>
              </div>
              {preset === "custom" && <button onClick={() => setPreset("winning")} className="text-xs underline text-slate-400 hover:text-slate-200 shrink-0">重設預設</button>}
            </div>
          )}

          {/* ── Camp Config Panel ── */}
          <div className="mb-6 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-blue-500 inline-block rounded-sm" />
              陣營屬性與倉庫所有權 (Repo Owner) 配置
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 mb-1.5 uppercase">左方營地名稱</label>
                <input type="text" value={leftName} onChange={e => { setPreset("custom"); setLeftName(e.target.value); }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2.5 text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 mb-1.5 uppercase">右方營地名稱</label>
                <input type="text" value={rightName} onChange={e => { setPreset("custom"); setRightName(e.target.value); }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2.5 text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 mb-1.5 uppercase">指定「倉庫所有者」標章</label>
                <div className="flex gap-2">
                  {(["left", "right"] as const).map(side => (
                    <button key={side} onClick={() => { setPreset("custom"); setRepoOwner(side); }}
                      className={`flex-1 py-2 text-xs rounded border font-mono font-medium transition-all flex items-center justify-center gap-1.5 ${
                        repoOwner === side
                          ? side === "left" ? "bg-blue-600/15 text-cyan-400 border-cyan-500/40 font-bold" : "bg-orange-600/15 text-orange-400 border-orange-500/40 font-bold"
                          : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${repoOwner === side ? (side === "left" ? "bg-cyan-400 animate-pulse" : "bg-orange-400 animate-pulse") : "bg-slate-500"}`} />
                      {side === "left" ? "左方營地" : "右方營地"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">* 儲存後設定將持久化至瀏覽器快取及伺服器顯示名稱。</span>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="px-3.5 py-2 text-xs font-mono font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded bg-transparent hover:bg-slate-100 dark:hover:bg-slate-950 transition-all">重設預設</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 text-xs font-mono font-bold text-white rounded bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-400 shadow-lg active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-60">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  {saving ? "儲存中..." : "儲存配置 (SAVE)"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Main 12-col Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── HUD Card (col-span-7) ── */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center justify-between px-1">
                <span>[ HUD 戰場即時渲染 ]</span>
                <span>STATE: {status.toUpperCase()}</span>
              </div>

              <div className={`relative overflow-hidden rounded-lg border transition-all duration-500 ${darkMode ? "bg-[#111827] text-white" : "bg-white text-slate-800"} ${theme.glow}`}>
                {/* Scanlines */}
                <div className="absolute inset-0 hud-scanlines opacity-25 z-10" />
                {/* Corners */}
                <div className={`cyber-corner-tl ${cornerColor("left")}`}  />
                <div className={`cyber-corner-tr ${cornerColor("right")}`} />
                <div className={`cyber-corner-bl ${cornerColor("left")}`}  />
                <div className={`cyber-corner-br ${cornerColor("right")}`} />

                <div className="p-5 sm:p-6 relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-3 bg-blue-500" />
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 dark:text-slate-500">GIT OUTPOST CONSOLE v1.0</span>
                    </div>
                    <div className={`text-[10px] px-2.5 py-0.5 border font-semibold rounded-sm font-mono tracking-wide flex items-center gap-1.5 transition-all duration-300 ${theme.statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-hud-pulse" />
                      {status === "error" ? "異常警報" : status === "no_author" ? "配對中止" : theme.statusText}
                    </div>
                  </div>

                  {/* READY */}
                  {status === "ready" && leftP && rightP && (
                    <div className="space-y-6">
                      {/* Player names */}
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="text-left space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500">LEFT CAMP</span>
                            {repoOwner === "left" && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/15 text-cyan-400 border border-cyan-500/30 rounded-sm font-bold animate-hud-pulse flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                倉庫所有者
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white truncate max-w-[150px]">{leftP.label}</span>
                            <span className="text-xs font-mono font-bold text-cyan-500 whitespace-nowrap">{leftP.score} PTS</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex flex-wrap items-center justify-end gap-1.5 min-h-[22px]">
                            {repoOwner === "right" && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-sm font-bold animate-hud-pulse flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                倉庫所有者
                              </span>
                            )}
                            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500">RIGHT CAMP</span>
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                          </div>
                          <div className="flex items-baseline justify-end gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-orange-500 whitespace-nowrap">{rightP.score} PTS</span>
                            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white truncate max-w-[150px]">{rightP.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Occupation bar */}
                      <div className="relative pt-6 pb-2">
                        <div className="absolute top-0 inset-x-0 flex justify-between text-xs font-mono font-black">
                          <span className={`${leftP.percent >= 50 ? "text-cyan-400 text-sm scale-110" : "text-slate-400"} transition-all duration-300`}>{leftP.percent}%</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">SEC_01 // TRACKING</span>
                          <span className={`${rightP.percent >= 50 ? "text-orange-400 text-sm scale-110" : "text-slate-400"} transition-all duration-300`}>{rightP.percent}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full relative flex overflow-hidden">
                          <div style={{ width: `${leftP.percent}%` }} className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-l-full transition-all duration-500 ease-out" />
                          <div style={{ width: `${rightP.percent}%` }} className="h-full bg-gradient-to-l from-rose-600 to-orange-400 rounded-r-full transition-all duration-500 ease-out ml-auto" />
                        </div>
                        {/* Radar knob */}
                        <div style={{ left: `calc(${leftP.percent}% - 14px)` }} className="absolute top-[23px] w-7 h-7 flex items-center justify-center transition-all duration-500 ease-out z-20">
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="drop-shadow-md">
                            <circle cx="14" cy="14" r="11" stroke={leftP.percent > 50 ? "#00f0ff" : leftP.percent < 50 ? "#f97316" : "#94a3b8"} strokeWidth="1.5" strokeDasharray="3 2" className="animate-[spin_10s_linear_infinite]" />
                            <circle cx="14" cy="14" r="6" fill={leftP.percent > 50 ? "#00f0ff" : leftP.percent < 50 ? "#f97316" : "#94a3b8"} className="animate-hud-pulse" />
                            <path d="M14 2V5M14 23V26" stroke={leftP.percent > 50 ? "#00f0ff" : "#f97316"} strokeWidth="1" />
                          </svg>
                        </div>
                        <div className="absolute top-[31px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-300 dark:bg-slate-700 z-0">
                          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400 dark:text-slate-500">MID</span>
                        </div>
                      </div>

                      {/* Telemetry stats — dynamic bars */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/50">
                        {[
                          { title: "COMMITS",          lv: leftP.commits,   rv: rightP.commits,   fmt: (v: number) => String(v),   lc: "bg-blue-500",    rc: "bg-orange-500",             icon: "↔" },
                          { title: "ADDITIONS (新增)",  lv: leftP.additions, rv: rightP.additions, fmt: (v: number) => `+${v}`,     lc: "bg-emerald-500", rc: "bg-emerald-400 opacity-40", icon: "+" },
                          { title: "DELETIONS (刪除)",  lv: leftP.deletions, rv: rightP.deletions, fmt: (v: number) => `-${v}`,     lc: "bg-rose-500",    rc: "bg-rose-400 opacity-40",    icon: "-" },
                        ].map(({ title, lv, rv, fmt, lc, rc, icon }) => {
                          const { lw, rw } = statBar(lv, rv);
                          const tc = icon === "+" ? "text-emerald-500" : icon === "-" ? "text-rose-500" : "text-blue-500";
                          return (
                            <div key={title} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800/40">
                              <div className="text-[10px] font-mono text-slate-400 tracking-wider mb-2.5 uppercase flex items-center justify-between">
                                <span>{title}</span><span className={tc}>{icon}</span>
                              </div>
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                <div className="space-y-0.5 text-left min-w-0">
                                  <span className="text-[10px] text-slate-400 block truncate">{leftP.label}</span>
                                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white leading-none">{fmt(lv)}</p>
                                </div>
                                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded flex overflow-hidden p-0.5 self-center">
                                  <div style={{ width: `${lw}%` }} className={`h-full rounded-sm ${lc}`} />
                                  <div style={{ width: `${rw}%` }} className={`h-full rounded-sm ${rc} ml-auto`} />
                                </div>
                                <div className="space-y-0.5 text-right min-w-0">
                                  <span className="text-[10px] text-slate-400 block truncate">{rightP.label}</span>
                                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white leading-none">{fmt(rv)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* NO AUTHOR */}
                  {status === "no_author" && (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-amber-500 animate-hud-pulse">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h3 className="text-sm font-bold tracking-wider text-amber-500">WARN_NO_GIT_AUTHOR_DETECTED</h3>
                        <p className="text-xs text-slate-400">本地主機環境尚未偵測到與後端匹配的 Git config 使用者名稱。請在專案目錄下執行以下指令。</p>
                      </div>
                      <div className="w-full max-w-md bg-slate-900 text-slate-300 font-mono text-left p-3 rounded border border-slate-800 text-[11px] space-y-1 select-all cursor-pointer shadow-inner">
                        <div className="text-slate-500">// 全域使用者設定</div>
                        <div>git config --global user.name &quot;你的名字&quot;</div>
                        <div className="text-slate-500">// 或針對此專案設定</div>
                        <div>git config user.name &quot;你的名字&quot;</div>
                      </div>
                    </div>
                  )}

                  {/* ERROR */}
                  {status === "error" && (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded flex items-center justify-center text-rose-500 animate-[pulse_1s_infinite]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h3 className="text-sm font-bold tracking-wider text-rose-500 uppercase">SYS_DAEMON_READ_FAIL</h3>
                        <p className="text-xs text-slate-400">後端服務連線受阻，或數據緩存溢出。無法取得本周期的 Git 提交分析檔案。</p>
                      </div>
                      <button onClick={() => setPreset("winning")} className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs rounded border border-rose-500/30 transition-all font-mono">
                        FORCE_RETRY_STATION_SYNC
                      </button>
                    </div>
                  )}

                  {/* Footer */}
                  {data && (
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" /><span>TIMEZONE: {data.timezone}</span></div>
                      <span>UPDATED: {new Date(data.updatedAt).toLocaleTimeString("zh-TW", { hour12: false })}</span>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-emerald-500">BATTLEFEED_OK</span></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Console Info Bar */}
              {data && (
                <div className="p-3 bg-slate-200/50 dark:bg-slate-900/50 rounded border border-slate-300/60 dark:border-slate-800 text-xs font-mono flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-bold">STATUS FEED:</span>
                    <span className={theme.msgColor}>{data.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Panel 4 Tabs (col-span-5) ── */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
                {([
                  { id: "manual"   as TabKey, icon: "📖", label: "部署與使用手冊" },
                  { id: "exporter" as TabKey, icon: "📦", label: "資源下載" },
                  { id: "spec"     as TabKey, icon: "⚖",  label: "UX 狀態規格" },
                  { id: "code"     as TabKey, icon: "⚯",  label: "向量代碼" },
                ]).map(({ id, icon, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === id ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-6 overflow-y-auto max-h-[640px]">

                {/* MANUAL TAB */}
                {activeTab === "manual" && (
                  <div className="space-y-5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded border border-cyan-500/20 text-slate-800 dark:text-slate-300 space-y-2">
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /><h4 className="font-bold text-sm tracking-wider uppercase text-blue-600 dark:text-cyan-400">自建伺服器 Git Hook 自動結算方案</h4></div>
                      <p className="leading-relaxed text-[11px]">本插件採用 100% 隱私安全的<strong>本地 Git Hook 機制</strong>。不依賴 GitHub API 與 Token。只要您有自建的伺服器（VPS、獨立 Git 裸倉庫），即可實作「推送代碼，前台自動攻防佔領」的遊戲體驗。</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-800 dark:text-white border-l-2 border-blue-500 pl-2 uppercase font-mono">// 1. 遊戲化角色對照</h5>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded"><p className="font-bold text-cyan-400">⚔ Git Hook (post-receive)</p><p className="text-[10px] leading-relaxed mt-1 text-slate-500">推送完成時自動觸發的「陷阱機關」</p></div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded"><p className="font-bold text-emerald-400">📜 git log --numstat</p><p className="text-[10px] leading-relaxed mt-1 text-slate-500">記載每日代碼行數破壞與重建的「戰鬥紀錄書」</p></div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded col-span-2 space-y-2">
                          <p className="font-bold text-orange-400">🤖 後端 Parser / 據點裁判 NPC</p>
                          <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded font-mono text-[9px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border border-slate-200 dark:border-slate-800">
                            <span className="text-blue-500 font-bold">Commit +10</span><span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="text-emerald-500 font-bold">新增行 +0.1</span><span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="text-rose-500 font-bold">刪除行 -0.05</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 dark:text-white border-l-2 border-blue-500 pl-2 uppercase font-mono">// 2. 自動化運作流程</h5>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800/50 font-mono text-[10px] space-y-1.5">
                        {[
                          { n: "1", t: "開發者 Push 代碼到 VPS 自建 Git 倉庫", s: "➔ 觸發裸倉庫內 hooks/post-receive 鉤子" },
                          { n: "2", t: "裁判 NPC 讀取今日日誌，加總算分", s: "➔ 自動發佈最新 outpost.json 戰報" },
                          { n: "3", t: "前台 HUD 插件定時 GET 請求 json 實時更新", s: "➔ 玩家在網站上即可看到最新佔領比率" },
                        ].map(({ n, t, s }) => (
                          <div key={n}><div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[9px] font-bold">{n}</span><span>{t}</span></div><div className="pl-5 text-slate-500">{s}</div></div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-800 dark:text-white border-l-2 border-blue-500 pl-2 uppercase font-mono">// 3. 伺服器 Hook 部署步驟</h5>
                      <ol className="list-decimal list-inside space-y-2 text-[11px] pl-1">
                        <li>進入 Git 裸倉庫 hooks 目錄：<pre className="bg-slate-950 p-2 rounded mt-1 font-mono text-[10px] text-slate-300 select-all">cd /var/git/yourproject.git/hooks</pre></li>
                        <li>建立並編輯 <code className="text-blue-500 font-mono">post-receive</code>：<pre className="bg-slate-950 p-2 rounded mt-1 font-mono text-[10px] text-slate-300 select-all">touch post-receive && chmod +x post-receive</pre></li>
                        <li>將下方腳本複製並儲存到檔案中：</li>
                      </ol>
                      <div className="rounded border border-slate-200 dark:border-slate-800/80 overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">SHELL // post-receive hook</span>
                          <button onClick={() => copyToClipboard(GIT_HOOK_SCRIPT)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono text-[9px] rounded shadow transition-all flex items-center gap-1">
                            <span>📋</span> 複製代碼
                          </button>
                        </div>
                        <pre className="bg-slate-950 p-3 font-mono text-[9px] text-slate-300 overflow-x-auto max-h-[180px]">{GIT_HOOK_SCRIPT}</pre>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <h5 className="font-bold text-slate-800 dark:text-white border-l-2 border-blue-500 pl-2 uppercase font-mono">// 4. 常見問題與排除</h5>
                      <ul className="list-disc list-inside space-y-1.5 text-[11px] pl-1">
                        <li><strong className="text-slate-700 dark:text-slate-200">權限不足：</strong> 請確認伺服器對輸出 JSON 路徑有寫入權限，且 post-receive 具有可執行權限。</li>
                        <li><strong className="text-slate-700 dark:text-slate-200">作者無法對應：</strong> 請確認腳本內 <code className="text-orange-500">left_authors</code> 與您的 <code className="text-orange-500">git config user.name</code> 完全一致。</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* EXPORTER TAB */}
                {activeTab === "exporter" && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-blue-500/10 rounded border border-blue-500/30 text-blue-400 space-y-2">
                      <h4 className="font-bold">說明：</h4>
                      <p className="leading-relaxed text-[11px]">本插件沒有使用任何外部 PNG/JPG 靜態圖檔。所有視覺元素均使用<strong>純向量代碼</strong>實時渲染。下方提供獨立打包導出器，點擊即可一鍵下載。</p>
                    </div>
                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold font-mono text-slate-400 uppercase tracking-wider">// 一鍵打包方案</h4>
                      <button onClick={downloadProductionHTML} className="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition-all">
                        <div className="flex items-center gap-2 text-left"><span className="text-lg">📄</span><div><p className="text-xs">下載整合版單一 HTML 檔案</p><p className="text-[10px] font-normal text-blue-200">包含完整的 CSS、SVG、JavaScript 架構</p></div></div>
                        <span className="text-xs bg-blue-500/50 px-2 py-1 rounded">DOWNLOAD</span>
                      </button>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <h4 className="font-bold font-mono text-slate-400 uppercase tracking-wider">// 獨立 SVG 素材包下載</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: "radarKnob"     as const, name: "1. 控制雷達指針.svg",    icon: "●", color: "text-cyan-400"   },
                          { key: "repoOwner"     as const, name: "2. 倉庫所有權徽章.svg",  icon: "💾", color: "text-blue-500"  },
                          { key: "warningShield" as const, name: "3. 警告引導盾牌.svg",    icon: "⚠", color: "text-amber-500" },
                          { key: "commitNode"    as const, name: "4. Git提交節點.svg",     icon: "⚯", color: "text-indigo-500" },
                        ].map(({ key, name, icon, color }) => (
                          <div key={key} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2"><span className={color}>{icon}</span><span className="font-mono text-[10px]">{name}</span></div>
                            <button onClick={() => downloadSVG(key)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-[10px] rounded">下載</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPEC TAB */}
                {activeTab === "spec" && (
                  <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 text-blue-500">// 專利級防錯機制 (Repo Owner)</h4>
                      <p>在多人協作後台，常因不同協作者同名或分支混亂而看錯指標。本方案內置「倉庫所有者」判定，能夠：</p>
                      <ul className="list-disc list-inside mt-2 space-y-1"><li>精準定位本機 Git Remote 指向的源倉庫帳號。</li><li>於戰局頂端高亮渲染<strong>伺服器卡槽 SVG 標章</strong>，避免資訊張冠李戴。</li></ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 text-blue-500">// UX 狀態定義</h4>
                      <div className="space-y-2">
                        {[
                          { label: "ready（壓制/中立）", color: "text-cyan-400",   desc: "一方佔領比率 > 50% 或雙方 50/50，依比率顯示色調。" },
                          { label: "no_author",          color: "text-amber-400",  desc: "git config 未設定或作者映射失敗，顯示警告及 git config 指令。" },
                          { label: "error",              color: "text-rose-400",   desc: "後端連線失敗，顯示 FORCE_RETRY_STATION_SYNC 按鈕。" },
                        ].map(({ label, color, desc }) => (
                          <div key={label} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded">
                            <p className={`font-mono font-bold text-[11px] ${color}`}>{label}</p>
                            <p className="text-[10px] mt-0.5">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CODE TAB */}
                {activeTab === "code" && (
                  <div className="space-y-6">
                    {[
                      { title: "控制雷達 SVG 原始碼",     filename: "radar_knob.svg",      key: "radarKnob"     as const },
                      { title: "倉庫所有者徽章 SVG 原始碼", filename: "repo_owner_badge.svg", key: "repoOwner"     as const },
                      { title: "警告引導盾牌 SVG 原始碼",  filename: "warning_shield.svg",  key: "warningShield" as const },
                      { title: "Git 提交節點 SVG 原始碼",  filename: "commit_node.svg",     key: "commitNode"    as const },
                    ].map(({ title, filename, key }) => (
                      <div key={key} className="space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs text-blue-500">// {title}</h4>
                        <div className="rounded border border-slate-200 dark:border-slate-800/80 overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400">VECTOR // {filename}</span>
                            <button onClick={() => copyToClipboard(SVG_SOURCES[key])} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-mono font-bold rounded transition-all">複製</button>
                          </div>
                          <pre className="bg-slate-950 p-3 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-[120px]">{SVG_SOURCES[key]}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Palette ── */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-[#0b0f19] border border-slate-800 rounded-lg">
              <span className="text-xs font-mono font-bold text-slate-400">// 深色主控面板 01-CyberDark</span>
              <div className="h-6 bg-slate-950 border border-cyan-500/30 rounded mt-2" />
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-lg">
              <span className="text-xs font-mono font-bold text-slate-600">// 淺色主控面板 02-CrystalLight</span>
              <div className="h-6 bg-slate-100 border border-slate-200 rounded mt-2" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
