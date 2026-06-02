"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Crosshair, ExternalLink, Moon, Save, Sun } from "lucide-react";
import { saveCaptureDisplayNames } from "@/app/actions/developerCapture";
import type { CapturePlayerStats, CaptureSide, CaptureState } from "@/lib/developer-capture/types";

type PresetId = "live" | "winning" | "neutral" | "losing" | "missing" | "error" | "custom";
type TabId = "spec" | "structure" | "svg";

interface CaptureHudAdjusterClientProps {
  initialState: CaptureState;
}

const presetButtons: Array<{ id: PresetId; label: string }> = [
  { id: "live", label: "真實資料" },
  { id: "winning", label: "你方壓制" },
  { id: "neutral", label: "中立對峙" },
  { id: "losing", label: "敵方壓制" },
  { id: "missing", label: "未設作者" },
  { id: "error", label: "資料缺失" },
];

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "spec", label: "UX 狀態 & 規格" },
  { id: "structure", label: "HTML/CSS 結構" },
  { id: "svg", label: "SVG 核心元件" },
];

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getRepositoryLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/|\.git$/g, "") || url;
  } catch {
    return url;
  }
}

function formatUpdatedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(value));
  } catch {
    return "尚未同步";
  }
}

function buildPlayer(base: CapturePlayerStats, percent: number, label: string): CapturePlayerStats {
  const safePercent = clampPercent(percent);

  return {
    ...base,
    label,
    percent: safePercent,
    score: Math.max(0, Math.round(safePercent * 1.22)),
    commits: Math.max(0, Math.round(safePercent / 9)),
    additions: Math.max(0, safePercent * 5),
    deletions: Math.max(0, safePercent * 2),
  };
}

function buildDisplayState(base: CaptureState, preset: PresetId, leftPercent: number, leftName: string, rightName: string, ownerSide: CaptureSide): CaptureState {
  const leftBase = base.players[0];
  const rightBase = base.players[1];
  const liveLeft = { ...leftBase, label: leftName || leftBase.label };
  const liveRight = { ...rightBase, label: rightName || rightBase.label };

  if (preset === "live") {
    return {
      ...base,
      targetRepositoryOwnerSide: ownerSide,
      players: [liveLeft, liveRight],
    };
  }

  if (preset === "missing") {
    return {
      ...base,
      status: "missing-config",
      message: "未設定 Git 識別作者，無法追蹤戰場足跡。",
      targetRepositoryOwnerSide: ownerSide,
      players: [buildPlayer(leftBase, 50, leftName), buildPlayer(rightBase, 50, rightName)],
    };
  }

  if (preset === "error") {
    return {
      ...base,
      status: "git-error",
      message: "連線異常：後端伺服器無法讀取本地 Git 產能紀錄。",
      targetRepositoryOwnerSide: ownerSide,
      players: [buildPlayer(leftBase, 50, leftName), buildPlayer(rightBase, 50, rightName)],
    };
  }

  const presetPercent = preset === "winning" ? 68 : preset === "losing" ? 22 : preset === "neutral" ? 50 : leftPercent;
  const safeLeft = clampPercent(preset === "neutral" ? 50 : presetPercent);
  const safeRight = 100 - safeLeft;

  return {
    ...base,
    status: safeLeft === safeRight ? "neutral" : "ready",
    message: safeLeft > safeRight
      ? "你方正在壓制據點，產能火力已突破中線。"
      : safeLeft < safeRight
        ? "朋友正在壓制據點，請加快推送節奏。"
        : "勢均力敵，中立哨站還沒被任何一方拿下。",
    targetRepositoryOwnerSide: ownerSide,
    players: [buildPlayer(leftBase, safeLeft, leftName), buildPlayer(rightBase, safeRight, rightName)],
  };
}

function statusText(state: CaptureState): string {
  if (state.status === "missing-config") {
    return "AUTHOR_LINK_REQUIRED";
  }

  if (state.status === "git-error") {
    return "DAEMON_READ_FAIL";
  }

  const [left, right] = state.players;
  if (left.percent > right.percent) {
    return "LEFT_ADVANTAGE";
  }

  if (right.percent > left.percent) {
    return "RIGHT_ADVANTAGE";
  }

  return "CONTESTED";
}

function StatCard({ title, leftValue, rightValue, mode }: { title: string; leftValue: string; rightValue: string; mode: "commits" | "additions" | "deletions" }) {
  const tone = mode === "additions" ? "text-emerald-500" : mode === "deletions" ? "text-rose-500" : "text-blue-500";

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
      <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <span>{title}</span>
        <span className={tone}>{mode === "commits" ? "↔" : mode === "additions" ? "+" : "-"}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="min-w-0 text-left">
          <p className="truncate text-[10px] font-bold text-slate-400">你方</p>
          <p className={`text-sm font-black tabular-nums ${tone}`}>{leftValue}</p>
        </div>
        <div className="h-5 w-14 overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-800">
          <div className="h-full w-1/2 bg-blue-500" />
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate text-[10px] font-bold text-slate-400">朋友</p>
          <p className={`text-sm font-black tabular-nums ${tone}`}>{rightValue}</p>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ label, value, color, dark = false }: { label: string; value: string; color: string; dark?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
      <div className="h-4 rounded" style={{ backgroundColor: color }} />
      <p className={`mt-3 text-center font-mono text-[11px] font-bold ${dark ? "text-cyan-100" : "text-slate-600"}`}>{value}</p>
      <p className={`text-center text-[10px] font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>({label})</p>
    </div>
  );
}

export default function CaptureHudAdjusterClient({ initialState }: CaptureHudAdjusterClientProps) {
  const [preset, setPreset] = useState<PresetId>("live");
  const [isDarkPreview, setIsDarkPreview] = useState(true);
  const [leftPercent, setLeftPercent] = useState(initialState.players[0].percent || 68);
  const [leftName, setLeftName] = useState(initialState.players[0].label);
  const [rightName, setRightName] = useState(initialState.players[1].label);
  const [ownerSide, setOwnerSide] = useState<CaptureSide>(initialState.targetRepositoryOwnerSide);
  const [activeTab, setActiveTab] = useState<TabId>("spec");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("本頁先預覽，按下保存後前台 HUD 才會更新。");

  const displayState = useMemo(
    () => buildDisplayState(initialState, preset, leftPercent, leftName, rightName, ownerSide),
    [initialState, leftName, leftPercent, ownerSide, preset, rightName],
  );

  const [left, right] = displayState.players;
  const repositoryLabel = getRepositoryLabel(displayState.targetRepositoryUrl);
  const markerLeft = clampPercent(left.percent);
  const isWarning = displayState.status === "missing-config" || displayState.status === "git-error";

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("儲存中...");

    try {
      const result = await saveCaptureDisplayNames({ leftLabel: leftName, rightLabel: rightName });
      setSaveMessage(result.success ? "已儲存插件顯示名稱，重新整理後仍會保留。" : result.error || "儲存失敗");
    } catch {
      setSaveMessage("Server Action 發生未知錯誤。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-800 transition-colors duration-300 dark:bg-[#0b0f19] dark:text-slate-100 ${isDarkPreview ? "dark" : ""}`}>
      <div className="min-h-screen bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:22px_22px] pb-10 dark:bg-[linear-gradient(to_right,rgba(31,41,55,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,41,55,0.45)_1px,transparent_1px)]">
        <header className="border-b border-slate-200 bg-white/85 px-5 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-[#111827]/85">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
                GIT OUTPOST CONSOLE
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                開發者據點佔領動態 HUD 視覺設計系統，後台工具箱專用調整頁。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/developer"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <ArrowLeft size={14} />
                返回控制台
              </Link>
              <span className="text-xs font-black text-slate-400">切換 UX 狀態：</span>
              <div className="flex flex-wrap rounded-md bg-slate-100 p-1 dark:bg-slate-950">
                {presetButtons.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreset(item.id)}
                    className={`rounded px-3 py-1.5 text-xs font-black transition ${
                      preset === item.id ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-cyan-300" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsDarkPreview(value => !value)}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-slate-100 text-blue-600 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-300"
                aria-label="切換深淺色"
              >
                {isDarkPreview ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-5 px-5 py-5">
          <section className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/35">
            <div className="grid gap-4 lg:grid-cols-[140px_1fr_auto_auto_auto] lg:items-center">
              <label htmlFor="capture-simulator" className="text-xs font-black text-slate-600 dark:text-slate-300">
                動態模擬佔領比率：
              </label>
              <input
                id="capture-simulator"
                type="range"
                min="0"
                max="100"
                value={markerLeft}
                onChange={event => {
                  setPreset("custom");
                  setLeftPercent(Number(event.target.value));
                }}
                className="h-2 w-full cursor-pointer accent-blue-500"
              />
              <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-black text-blue-600 dark:bg-blue-500/10 dark:text-cyan-300">你方：{left.percent}%</span>
              <span className="rounded-md bg-orange-50 px-3 py-1 text-xs font-black text-orange-500 dark:bg-orange-500/10">朋友：{right.percent}%</span>
              <button
                type="button"
                onClick={() => {
                  setPreset("winning");
                  setLeftPercent(68);
                }}
                className="text-xs font-black text-slate-400 underline-offset-4 hover:text-slate-700 hover:underline dark:hover:text-slate-200"
              >
                重設為預設
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="mb-4 flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-300">
              <span className="h-3 w-1.5 rounded-sm bg-indigo-500" />
              主控台設定：變更名稱與標示「倉庫所有者」
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.15fr]">
              <label className="space-y-2">
                <span className="text-[11px] font-black text-slate-400">左方營地名稱（只同步本頁預覽）</span>
                <input
                  value={leftName}
                  onChange={event => setLeftName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-black text-slate-400">右方營地名稱（只同步本頁預覽）</span>
                <input
                  value={rightName}
                  onChange={event => setRightName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-400">指定「倉庫所有者」標章歸屬</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["left", "right"] as const).map(side => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setOwnerSide(side)}
                      className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                        ownerSide === side
                          ? "border-cyan-400 bg-cyan-400/20 text-cyan-500"
                          : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:hover:text-white"
                      }`}
                    >
                      {side === "left" ? `● ${left.label}` : `● ${right.label}`}
                    </button>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-600 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-300"
                  >
                    <Save size={14} />
                    {isSaving ? "儲存中..." : "儲存顯示名稱"}
                  </button>
                  <p className="text-[11px] font-semibold leading-relaxed text-slate-400">{saveMessage}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <div>
              <div className="mb-3 flex items-center justify-between font-mono text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                <span>[ HUD 戰場即時渲染 ]</span>
                <span>STATE: {isWarning ? "ALERT" : "READY"}</span>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-cyan-300 bg-white p-6 shadow-[0_0_0_1px_rgba(0,240,255,0.12)] dark:border-cyan-400 dark:bg-[#111827]">
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.18)_50%)] [background-size:100%_4px]" />
                <div className="relative z-10">
                  <div className="mb-8 flex items-center justify-between">
                    <p className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span className="h-4 w-1.5 bg-blue-500" />
                      Git Outpost Console v1.0
                    </p>
                    <div className="rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-black text-cyan-500">
                      ● {statusText(displayState)}
                    </div>
                  </div>

                  <div className="grid grid-cols-[minmax(90px,1fr)_minmax(160px,2fr)_minmax(90px,1fr)] items-end gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-black uppercase text-slate-400">● LEFT CAMP</p>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <h2 className="truncate text-2xl font-black text-slate-950 dark:text-white">{left.label}</h2>
                        <span className="font-mono text-xs font-black text-blue-600">{left.score} PTS</span>
                      </div>
                    </div>
                    <div className="text-center font-mono text-[10px] font-black uppercase tracking-widest text-slate-400">
                      SEC_01 // TRACKING
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="font-mono text-xs font-black uppercase text-slate-400">RIGHT CAMP ●</p>
                      <div className="mt-1 flex flex-wrap items-baseline justify-end gap-2">
                        <span className="font-mono text-xs font-black text-orange-500">{right.score} PTS</span>
                        <h2 className="truncate text-2xl font-black text-slate-950 dark:text-white">{right.label}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between font-mono text-sm font-black">
                      <span className="text-cyan-500">{left.percent}%</span>
                      <span className="text-slate-400">{right.percent}%</span>
                    </div>
                    <div className="relative h-8">
                      <div className="absolute inset-x-0 top-1/2 flex h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-950">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-300 transition-[width] duration-500" style={{ width: `${left.percent}%` }} />
                        <div className="h-full bg-gradient-to-l from-rose-600 to-orange-400 transition-[width] duration-500" style={{ width: `${right.percent}%` }} />
                      </div>
                      <div
                        className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-cyan-300 bg-cyan-400 shadow-[0_0_22px_rgba(0,240,255,0.45)] transition-[left] duration-500"
                        style={{ left: `${Math.min(98, Math.max(2, markerLeft))}%` }}
                      />
                    </div>
                  </div>

                  {isWarning ? (
                    <div className="mt-7 rounded-md border border-amber-400/40 bg-amber-400/10 p-4 text-center">
                      <AlertTriangle className="mx-auto text-amber-500" size={28} />
                      <p className="mt-2 text-sm font-black text-amber-500">{displayState.message}</p>
                    </div>
                  ) : (
                    <div className="mt-7 grid gap-3 md:grid-cols-3">
                      <StatCard title="Commits" mode="commits" leftValue={String(left.commits)} rightValue={String(right.commits)} />
                      <StatCard title="Additions（新增行數）" mode="additions" leftValue={`+${left.additions}`} rightValue={`+${right.additions}`} />
                      <StatCard title="Deletions（刪除行數）" mode="deletions" leftValue={`-${left.deletions}`} rightValue={`-${right.deletions}`} />
                    </div>
                  )}

                  <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-3 font-mono text-[10px] font-black text-slate-400 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <span>TIMEZONE: {displayState.timezone}</span>
                    <span>UPDATED: {formatUpdatedAt(displayState.updatedAt)}</span>
                    <a href={displayState.targetRepositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-500 hover:underline">
                      <ExternalLink size={11} />
                      {repositoryLabel}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <aside className="min-w-0">
              <div className="mb-3 grid grid-cols-3 border-b border-slate-200 dark:border-slate-800">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 px-2 pb-2 text-xs font-black transition ${
                      activeTab === tab.id ? "border-blue-500 text-blue-600 dark:text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
                {activeTab === "spec" && (
                  <div className="space-y-4 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">{"// 狀態規格"}</h2>
                    <p>這一頁是後台工具箱的 HUD 調整器。上方按鈕像遊戲測試房，可以切換不同戰況來檢查畫面。</p>
                    <ul className="space-y-2 text-xs">
                      <li>● 真實資料：讀後端 Git 戰報產生的目前據點狀態。</li>
                      <li>● 模擬狀態：只影響前端預覽，不會保存戰報數值。</li>
                      <li>● 儲存顯示名稱：只保存插件名稱，不改 GitHub 連結、作者或倉庫。</li>
                    </ul>
                  </div>
                )}
                {activeTab === "structure" && (
                  <div className="space-y-4 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">{"// HTML/CSS 結構"}</h2>
                    <p>頁面分成控制列、模擬滑軌、名稱設定、HUD 即時渲染、說明分頁、色相設定六個區塊。</p>
                    <div className="rounded-md bg-slate-950 p-3 font-mono text-[11px] text-cyan-100">
                      <p>&lt;controller /&gt;</p>
                      <p>&lt;simulator-range /&gt;</p>
                      <p>&lt;hud-preview /&gt;</p>
                      <p>&lt;color-palette /&gt;</p>
                    </div>
                  </div>
                )}
                {activeTab === "svg" && (
                  <div className="space-y-4 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">{"// 核心控制點 SVG 設計詳解"}</h2>
                    <div className="grid place-items-center rounded-md bg-slate-950 py-6">
                      <Crosshair className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,240,255,0.55)]" size={44} />
                    </div>
                    <ul className="space-y-2 text-xs">
                      <li>● 外層圓點代表據點核心。</li>
                      <li>● 青藍色代表你方壓制，橙紅色代表朋友壓制。</li>
                      <li>● 滑軌位置會依照百分比向左或向右偏移。</li>
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 text-white shadow-sm">
              <div className="mb-4 flex items-center justify-between font-mono text-sm font-black text-cyan-100">
                <span>{"// 深色模式色相 (Dark Mode)"}</span>
                <span className="rounded bg-slate-800 px-3 py-1 text-[10px]">DEFAULT</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ColorSwatch label="背景" value="#0b0f19" color="#0b0f19" dark />
                <ColorSwatch label="卡片" value="#111827" color="#111827" dark />
                <ColorSwatch label="藍營" value="#00f0ff" color="#00f0ff" dark />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between font-mono text-sm font-black text-slate-700">
                <span>{"// 淺色模式色相 (Light Mode)"}</span>
                <span className="rounded bg-slate-100 px-3 py-1 text-[10px] text-blue-700">COMPATIBLE</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ColorSwatch label="背景" value="#f8fafc" color="#f8fafc" />
                <ColorSwatch label="卡片" value="#ffffff" color="#ffffff" />
                <ColorSwatch label="橙營" value="#f97316" color="#f97316" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
