"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Copy, Download, Moon, Package, Save, Sun } from "lucide-react";
import { saveCaptureHudSettings } from "@/app/actions/developerCapture";
import HomeCaptureHud from "@/components/morning-sketch/HomeCaptureHud";
import type { CaptureHudLayout, CaptureHudTheme, CapturePlayerStats, CaptureSide, CaptureState } from "@/lib/developer-capture/types";

type PresetId = "live" | "winning" | "neutral" | "losing" | "missing" | "error" | "custom";
type TabId = "exporter" | "spec" | "code";

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
  { id: "exporter", label: "資源打包下載" },
  { id: "spec", label: "UX 狀態規格" },
  { id: "code", label: "向量代碼明細" },
];

const svgSources = {
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

const svgAssetList: Array<{ key: keyof typeof svgSources; name: string; tone: string }> = [
  { key: "radarKnob", name: "1. 控制雷達指針.svg", tone: "text-cyan-400" },
  { key: "repoOwner", name: "2. 倉庫所有權徽章.svg", tone: "text-blue-500" },
  { key: "warningShield", name: "3. 警告引導盾牌.svg", tone: "text-amber-500" },
  { key: "commitNode", name: "4. Git提交節點.svg", tone: "text-indigo-500" },
];

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
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

function ColorSwatch({
  label,
  value,
  onChange,
  dark = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dark?: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
      <label className="block">
        <input
          type="color"
          value={value}
          onChange={event => onChange(event.target.value)}
          className="h-8 w-full cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={`${label} 色彩`}
        />
      </label>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        className={`mt-3 w-full rounded border px-2 py-1 text-center font-mono text-[11px] font-bold outline-none ${
          dark ? "border-slate-700 bg-slate-950 text-cyan-100" : "border-slate-200 bg-white text-slate-700"
        }`}
      />
      <p className={`text-center text-[10px] font-black ${dark ? "text-slate-400" : "text-slate-500"}`}>({label})</p>
    </div>
  );
}

function RepoOwnerIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function RadarKnobSvg({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="drop-shadow-[0_0_12px_rgba(0,240,255,0.35)]" aria-hidden="true">
      <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" className="origin-center animate-[spin_10s_linear_infinite]" />
      <circle cx="14" cy="14" r="6" fill={color} className="animate-pulse" />
      <path d="M14 2V5" stroke={color} strokeWidth="1" />
      <path d="M14 23V26" stroke={color} strokeWidth="1" />
    </svg>
  );
}

function SvgPreviewIcon({ assetKey, tone }: { assetKey: keyof typeof svgSources; tone: string }) {
  if (assetKey === "radarKnob") {
    return <RadarKnobSvg color="#00f0ff" />;
  }

  if (assetKey === "repoOwner") {
    return <RepoOwnerIcon className={`h-7 w-7 ${tone}`} />;
  }

  if (assetKey === "warningShield") {
    return <AlertTriangle className={tone} size={28} />;
  }

  return (
    <svg className={`h-7 w-7 ${tone}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="1.05" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="22.95" y2="12" />
    </svg>
  );
}

function buildProductionHtmlSnippet(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Git Outpost HUD Component</title>
  <style>
    body { margin: 0; background: #0b0f19; color: white; font-family: monospace; }
    .hud { padding: 24px; border: 1px solid #00f0ff; background: #111827; border-radius: 8px; }
  </style>
</head>
<body>
  <section class="hud">
    <strong>GIT OUTPOST CONSOLE</strong>
    <p>SVG 資源已內建，可移植至正式插件。</p>
  </section>
</body>
</html>`;
}

export default function CaptureHudAdjusterClient({ initialState }: CaptureHudAdjusterClientProps) {
  const [preset, setPreset] = useState<PresetId>("live");
  const [isDarkPreview, setIsDarkPreview] = useState(true);
  const [leftPercent, setLeftPercent] = useState(initialState.players[0].percent || 68);
  const [leftName, setLeftName] = useState(initialState.players[0].label);
  const [rightName, setRightName] = useState(initialState.players[1].label);
  const [ownerSide, setOwnerSide] = useState<CaptureSide>(initialState.targetRepositoryOwnerSide);
  const [hudTheme, setHudTheme] = useState<CaptureHudTheme>(initialState.hudTheme);
  const [hudLayout, setHudLayout] = useState<CaptureHudLayout>(initialState.hudLayout);
  const [activeTab, setActiveTab] = useState<TabId>("exporter");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("調整會即時顯示在首頁，按下保存才會永久保留。");
  const [assetMessage, setAssetMessage] = useState("SVG 素材只在本機下載或複製，不會寫入後端。");

  const displayState = useMemo(
    () => buildDisplayState(initialState, preset, leftPercent, leftName, rightName, ownerSide),
    [initialState, leftName, leftPercent, ownerSide, preset, rightName],
  );

  const [left, right] = displayState.players;
  const markerLeft = clampPercent(left.percent);
  const isWarning = displayState.status === "missing-config" || displayState.status === "git-error";
  const previewBackground = isDarkPreview ? hudTheme.darkBackground : hudTheme.lightBackground;
  const previewCard = isDarkPreview ? hudTheme.darkCard : hudTheme.lightCard;
  const updateHudTheme = (key: keyof CaptureHudTheme, value: string) => {
    setHudTheme(current => ({ ...current, [key]: value }));
  };
  const updateHudLayout = (key: keyof CaptureHudLayout, value: number) => {
    setHudLayout(current => ({ ...current, [key]: value }));
  };

  const broadcastHudSync = useCallback(() => {
    if (typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel("capture-hud-sync");
    channel.postMessage({ type: "capture-hud-updated" });
    channel.close();
  }, []);

  const broadcastHudPreview = useCallback((layout: CaptureHudLayout) => {
    if (typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel("capture-hud-sync");
    channel.postMessage({ type: "capture-hud-preview", layout });
    channel.close();
  }, []);

  const persistHudSettings = useCallback(async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("儲存中...");

    try {
      const result = await saveCaptureHudSettings({
        leftLabel: leftName,
        rightLabel: rightName,
        targetRepositoryOwnerSide: ownerSide,
        hudTheme,
        hudLayout,
      });
      setSaveMessage(result.success ? "已儲存 HUD 顯示設定，重新整理後仍會保留。" : result.error || "儲存失敗");
      if (result.success) {
        broadcastHudSync();
      }
    } catch {
      setSaveMessage("Server Action 發生未知錯誤。");
    } finally {
      setIsSaving(false);
    }
  }, [broadcastHudSync, hudLayout, hudTheme, isSaving, leftName, ownerSide, rightName]);

  const handleSave = async () => {
    await persistHudSettings();
  };

  useEffect(() => {
    broadcastHudPreview(hudLayout);
  }, [broadcastHudPreview, hudLayout]);

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setAssetMessage(`已打包下載：${filename}`);
  };

  const downloadSvgAsset = (assetKey: keyof typeof svgSources) => {
    downloadFile(`<?xml version="1.0" encoding="utf-8"?>\n${svgSources[assetKey]}`, `${assetKey}.svg`, "image/svg+xml");
  };

  const copySvgAsset = async (assetKey: keyof typeof svgSources) => {
    try {
      await navigator.clipboard.writeText(svgSources[assetKey]);
      setAssetMessage(`已複製 SVG 原始碼：${assetKey}`);
    } catch {
      setAssetMessage("複製失敗，請直接選取下方原始碼。");
    }
  };

  return (
    <div className={`min-h-screen text-slate-800 transition-colors duration-300 dark:text-slate-100 ${isDarkPreview ? "dark" : ""}`} style={{ backgroundColor: previewBackground }}>
      <div className="min-h-screen bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:28px_28px] pb-10 dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]">
        <header className="border-b border-slate-200 bg-white/85 px-5 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-[#111827]/85">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
                GIT OUTPOST CONSOLE
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                GIT OUTPOST LIVE HUD 視覺設計系統，後台工具箱專用調整頁。
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
              <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-black dark:bg-blue-500/10" style={{ color: hudTheme.leftAccent }}>{left.label}：{left.percent}%</span>
              <span className="rounded-md bg-orange-50 px-3 py-1 text-xs font-black dark:bg-orange-500/10" style={{ color: hudTheme.rightAccent }}>{right.label}：{right.percent}%</span>
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

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#0f172a]">
            <div className="mb-4 flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-300">
              <span className="h-3 w-1.5 rounded-sm bg-indigo-500" />
              主控台設定：變更名稱
            </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.15fr]">
              <label className="space-y-2">
                <span className="text-[11px] font-black text-slate-400">左方營地名稱（只同步本頁預覽）</span>
                <input
                  value={leftName}
                  onChange={event => setLeftName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-black text-slate-400">右方營地名稱（只同步本頁預覽）</span>
                <input
                  value={rightName}
                  onChange={event => setRightName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-orange-400 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
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

            <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <div className="mb-3 flex items-center justify-between gap-2 text-xs font-black text-slate-500 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-1.5 rounded-sm bg-violet-500" />
                  HUD 位置與縮放
                </div>
                <button
                  type="button"
                  onClick={() => setHudLayout(current => ({ ...current, offsetX: 0, offsetY: 0 }))}
                  className="rounded-md border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-[10px] font-black text-violet-600 transition hover:bg-violet-400/15 dark:text-violet-300"
                >
                  返回預設位置
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
                    <span>X 軸位移</span>
                    <span className="font-mono text-slate-500">{hudLayout.offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-160"
                    max="160"
                    step="1"
                    value={hudLayout.offsetX}
                    onChange={event => updateHudLayout("offsetX", Number(event.target.value))}
                    className="h-2 w-full cursor-pointer accent-violet-500"
                  />
                </label>
                <label className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
                    <span>Y 軸位移</span>
                    <span className="font-mono text-slate-500">{hudLayout.offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-120"
                    max="120"
                    step="1"
                    value={hudLayout.offsetY}
                    onChange={event => updateHudLayout("offsetY", Number(event.target.value))}
                    className="h-2 w-full cursor-pointer accent-violet-500"
                  />
                </label>
                <label className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
                    <span>縮放度</span>
                    <span className="font-mono text-slate-500">{Math.round(hudLayout.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.1"
                    step="0.01"
                    value={hudLayout.scale}
                    onChange={event => updateHudLayout("scale", Number(event.target.value))}
                    className="h-2 w-full cursor-pointer accent-violet-500"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <div>
              <div className="mb-3 flex items-center justify-between font-mono text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                <span>[ HUD 戰場即時渲染 ]</span>
                <span>STATE: {isWarning ? "ALERT" : "READY"}</span>
              </div>
              <div className="rounded-lg border p-6 shadow-[0_0_0_1px_rgba(0,240,255,0.08)] dark:border-slate-700" style={{ backgroundColor: previewCard, borderColor: isDarkPreview ? "#334155" : "#bae6fd" }}>
                <HomeCaptureHud applyLayout={false} />
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
              <div className="max-h-[560px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
                {activeTab === "exporter" && (
                  <div className="space-y-5 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-4 text-blue-500 dark:text-cyan-300">
                      <h2 className="text-sm font-black">資源打包器</h2>
                      <p className="mt-2 text-xs leading-relaxed">
                        本插件視覺素材採用純 SVG 向量渲染，不使用外部 PNG/JPG。下載與複製都只在瀏覽器本機執行。
                      </p>
                      <p className="mt-2 text-[11px] font-black text-slate-400">{assetMessage}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-mono text-xs font-black uppercase tracking-wider text-slate-400">{"// 一鍵打包方案"}</h3>
                      <button
                        type="button"
                        onClick={() => downloadFile(buildProductionHtmlSnippet(), "git-outpost-hud-component.html", "text/html")}
                        className="flex w-full items-center justify-between gap-3 rounded-md bg-blue-600 p-3 text-left text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <span className="flex items-center gap-3">
                          <Package size={20} />
                          <span>
                            <span className="block text-xs font-black">下載整合版單一 HTML 檔案</span>
                            <span className="block text-[10px] font-semibold text-blue-100">包含 CSS、SVG 與插件外殼範本</span>
                          </span>
                        </span>
                        <Download size={16} />
                      </button>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                      <h3 className="font-mono text-xs font-black uppercase tracking-wider text-slate-400">{"// 獨立 SVG 素材包下載"}</h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {svgAssetList.map(asset => (
                          <div key={asset.key} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex min-w-0 items-center gap-2">
                              <SvgPreviewIcon assetKey={asset.key} tone={asset.tone} />
                              <span className="truncate font-mono text-[10px] font-bold">{asset.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => downloadSvgAsset(asset.key)}
                              className="rounded bg-slate-200 px-2 py-1 text-[10px] font-black text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
                            >
                              下載
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "spec" && (
                  <div className="space-y-4 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">{"// 專利級防錯機制 (Repo Owner)"}</h2>
                    <p>多人協作後台常會因為分支、作者或倉庫來源混亂而看錯指標。倉庫所有者徽章像戰場上的旗標，用來告訴你目前主要目標倉庫屬於哪一方。</p>
                    <ul className="space-y-2 text-xs">
                      <li>● 真實資料：讀後端 Git 戰報產生目前據點狀態。</li>
                      <li>● 模擬狀態：只影響後台預覽，不保存戰報數值。</li>
                      <li>● 儲存顯示名稱：保存後，前台 HUD 才會更新插件顯示名。</li>
                      <li>● 倉庫所有者標章：目前為後台預覽用途，不會改 GitHub 遠端設定。</li>
                    </ul>
                  </div>
                )}
                {activeTab === "code" && (
                  <div className="space-y-4">
                    {svgAssetList.map(asset => (
                      <div key={asset.key} className="text-xs">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h2 className="font-black text-blue-600 dark:text-cyan-300">{`// ${asset.name.replace(/^\d+\.\s*/, "")} 原始碼`}</h2>
                          <button
                            type="button"
                            onClick={() => copySvgAsset(asset.key)}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <Copy size={11} />
                            複製
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-slate-300">{svgSources[asset.key]}</pre>
                      </div>
                    ))}
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
                <ColorSwatch label="背景" value={hudTheme.darkBackground} onChange={value => updateHudTheme("darkBackground", value)} dark />
                <ColorSwatch label="卡片" value={hudTheme.darkCard} onChange={value => updateHudTheme("darkCard", value)} dark />
                <ColorSwatch label="藍營" value={hudTheme.leftAccent} onChange={value => updateHudTheme("leftAccent", value)} dark />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between font-mono text-sm font-black text-slate-700">
                <span>{"// 淺色模式色相 (Light Mode)"}</span>
                <span className="rounded bg-slate-100 px-3 py-1 text-[10px] text-blue-700">COMPATIBLE</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ColorSwatch label="背景" value={hudTheme.lightBackground} onChange={value => updateHudTheme("lightBackground", value)} />
                <ColorSwatch label="卡片" value={hudTheme.lightCard} onChange={value => updateHudTheme("lightCard", value)} />
                <ColorSwatch label="橙營" value={hudTheme.rightAccent} onChange={value => updateHudTheme("rightAccent", value)} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
