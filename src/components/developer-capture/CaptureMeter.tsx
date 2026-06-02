"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Activity, AlertTriangle, Crown, Crosshair, GitBranch, GitCommitHorizontal, RadioTower } from "lucide-react";
import { saveCaptureDisplayNames } from "@/app/actions/developerCapture";
import type { CapturePlayerStats, CaptureState } from "@/lib/developer-capture/types";

interface CaptureMeterProps {
  state: CaptureState;
  showEditor?: boolean;
  showLinks?: boolean;
}

function formatDateTime(value: string | Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(value instanceof Date ? value : new Date(value));

    const month = parts.find(part => part.type === "month")?.value ?? "--";
    const day = parts.find(part => part.type === "day")?.value ?? "--";
    const hour = parts.find(part => part.type === "hour")?.value ?? "--";
    const minute = parts.find(part => part.type === "minute")?.value ?? "--";
    return `${month}/${day} ${hour}:${minute}`;
  } catch {
    return "尚未同步";
  }
}

function getStatusMeta(state: CaptureState) {
  const [left, right] = state.players;

  if (state.status === "missing-config") {
    return {
      label: "AUTHOR_LINK_REQUIRED",
      title: "尚未設定 Git 作者",
      message: state.message,
      statusClass: "border-amber-400/35 bg-amber-500/10 text-amber-500",
      accentClass: "text-amber-500",
      glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.12)] border-amber-400/25",
      leader: "等待作者配對",
    };
  }

  if (state.status === "git-error") {
    return {
      label: "SYS_DAEMON_READ_FAIL",
      title: "Git 戰報讀取異常",
      message: state.message,
      statusClass: "border-rose-400/35 bg-rose-500/10 text-rose-500",
      accentClass: "text-rose-500",
      glowClass: "shadow-[0_0_20px_rgba(244,63,94,0.12)] border-rose-400/25",
      leader: "後端結算中斷",
    };
  }

  if (left.percent > right.percent) {
    return {
      label: "LEFT_ADVANTAGE",
      title: `${left.label} 正在壓制據點`,
      message: state.message,
      statusClass: "border-cyan-400/35 bg-cyan-400/10 text-cyan-400",
      accentClass: "text-cyan-400",
      glowClass: "shadow-[0_0_22px_rgba(34,211,238,0.14)] border-cyan-400/25",
      leader: `${left.label} 正在壓制據點`,
    };
  }

  if (right.percent > left.percent) {
    return {
      label: "RIGHT_ADVANTAGE",
      title: `${right.label} 正在壓制據點`,
      message: state.message,
      statusClass: "border-orange-400/35 bg-orange-400/10 text-orange-400",
      accentClass: "text-orange-400",
      glowClass: "shadow-[0_0_22px_rgba(249,115,22,0.14)] border-orange-400/25",
      leader: `${right.label} 正在壓制據點`,
    };
  }

  return {
    label: "CONTESTED",
    title: "據點爭奪中",
    message: state.message,
    statusClass: "border-slate-300/70 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300",
    accentClass: "text-slate-400",
    glowClass: "border-slate-200 dark:border-slate-800",
    leader: "據點爭奪中",
  };
}

function HudCorner({ position, className }: { position: "tl" | "tr" | "bl" | "br"; className: string }) {
  const positionClass = {
    tl: "left-[-1px] top-[-1px] border-l-2 border-t-2",
    tr: "right-[-1px] top-[-1px] border-r-2 border-t-2",
    bl: "bottom-[-1px] left-[-1px] border-b-2 border-l-2",
    br: "bottom-[-1px] right-[-1px] border-b-2 border-r-2",
  }[position];

  return <span aria-hidden="true" className={`absolute h-3 w-3 ${positionClass} ${className}`} />;
}

function CaptureMarker({ percent, colorClass, color }: { percent: number; colorClass?: string; color?: string }) {
  const markerPosition = Math.min(96, Math.max(4, percent));

  return (
    <div
      className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500"
      style={{ left: `${markerPosition}%` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 28 28" className={`h-8 w-8 drop-shadow-[0_0_14px_rgba(34,211,238,0.3)] ${colorClass ?? ""}`} style={{ color }}>
        <circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          className="origin-center animate-[spin_7s_linear_infinite]"
        />
        <circle cx="14" cy="14" r="6" fill="currentColor" className="animate-pulse opacity-90" />
        <path d="M14 2V5M14 23V26M2 14H5M23 14H26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StatPanel({
  player,
  tone,
  isOwner,
  showLinks = true,
}: {
  player: CapturePlayerStats;
  tone: "left" | "right";
  isOwner: boolean;
  showLinks?: boolean;
}) {
  const toneClass = tone === "left" ? "text-cyan-500 dark:text-cyan-300" : "text-orange-500 dark:text-orange-300";
  const nameNode = showLinks ? (
    <a
      href={player.githubUrl}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex max-w-full items-center gap-1 truncate text-xs font-black hover:underline ${toneClass}`}
      title={player.githubUrl}
    >
      <GitBranch size={11} className="shrink-0" />
      <span className="truncate">{player.label}</span>
    </a>
  ) : (
    <span className={`inline-flex max-w-full items-center gap-1 truncate text-xs font-black ${toneClass}`}>
      <GitBranch size={11} className="shrink-0" />
      <span className="truncate">{player.label}</span>
    </span>
  );

  return (
    <div className="min-w-0 rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800/70 dark:bg-slate-950/35">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {nameNode}
          {isOwner && (
            <span className="mt-1 inline-flex items-center gap-1 rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-black text-amber-500">
              <Crown size={10} />
              OWNER
            </span>
          )}
          <p className="mt-1 text-2xl font-black tabular-nums text-slate-900 dark:text-white">{player.score}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-black tabular-nums text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {player.percent}%
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <span className="truncate">
          <GitCommitHorizontal size={11} className="mr-1 inline" />
          {player.commits}
        </span>
        <span className="truncate text-emerald-500">+{player.additions}</span>
        <span className="truncate text-rose-500">-{player.deletions}</span>
      </div>
    </div>
  );
}

export default function CaptureMeter({ state, showEditor = false, showLinks = true }: CaptureMeterProps) {
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [leftName, setLeftName] = useState(state.players[0].label);
  const [rightName, setRightName] = useState(state.players[1].label);
  const [ownerSide, setOwnerSide] = useState<"left" | "right">(state.targetRepositoryOwnerSide);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const left = { ...state.players[0], label: leftName || state.players[0].label };
  const right = { ...state.players[1], label: rightName || state.players[1].label };
  const displayState: CaptureState = { ...state, targetRepositoryOwnerSide: ownerSide, players: [left, right] };
  const meta = getStatusMeta(displayState);
  const markerColor = left.percent > right.percent
    ? ""
    : right.percent > left.percent
      ? ""
      : "text-slate-400";
  const markerColorValue = left.percent > right.percent
    ? state.hudTheme.leftAccent
    : right.percent > left.percent
      ? state.hudTheme.rightAccent
      : "#94a3b8";
  const hudStyle = {
    "--hud-light-card": state.hudTheme.lightCard,
    "--hud-dark-card": state.hudTheme.darkCard,
  } as CSSProperties;

  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSaveDisplayNames = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const result = await saveCaptureDisplayNames({
        leftLabel: leftName,
        rightLabel: rightName,
      });

      if (!result.success) {
        setSaveError(result.error || "儲存失敗");
        return;
      }

      setSaveMessage("已儲存插件顯示名稱，重新整理後仍會保留。");
    } catch {
      setSaveError("執行 Server Action 發生未知錯誤");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      aria-label="GIT OUTPOST LIVE HUD"
      className={`relative overflow-hidden rounded-lg border bg-[var(--hud-light-card)] text-slate-900 transition-all duration-500 dark:bg-[var(--hud-dark-card)] dark:text-slate-100 ${meta.glowClass}`}
      style={hudStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0)_50%,rgba(148,163,184,0.025)_50%)] [background-size:100%_5px] dark:opacity-[0.12] dark:[background-image:linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.18)_50%),linear-gradient(90deg,rgba(34,211,238,0.06),rgba(16,185,129,0.02),rgba(249,115,22,0.06))] dark:[background-size:100%_5px,8px_100%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-20 dark:[background-image:linear-gradient(to_right,rgba(51,65,85,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.3)_1px,transparent_1px)]"
      />

      <HudCorner position="tl" className={meta.accentClass} />
      <HudCorner position="tr" className={right.percent > left.percent ? "text-orange-400" : meta.accentClass} />
      <HudCorner position="bl" className={meta.accentClass} />
      <HudCorner position="br" className={right.percent > left.percent ? "text-orange-400" : meta.accentClass} />

      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="h-3 w-1.5 bg-cyan-400" />
              <span>GIT OUTPOST LIVE HUD v1.0</span>
            </div>
            <h3 className="mt-1 flex items-center gap-2 text-base font-black tracking-tight text-slate-900 dark:text-white">
              <Crosshair size={16} className={meta.accentClass} />
              GIT OUTPOST LIVE HUD
            </h3>
          </div>

          <div className={`flex w-fit items-center gap-2 rounded-sm border px-2.5 py-1 text-[10px] font-black tracking-wider ${meta.statusClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            <span>{meta.label}</span>
          </div>
        </div>

        {showEditor && (
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/30">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="h-3 w-1.5 rounded-sm bg-indigo-500" />
              <span>Outpost Name Link</span>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <label className="min-w-0 space-y-1.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">左方營地名稱</span>
                <input
                  suppressHydrationWarning
                  value={leftName}
                  onChange={event => setLeftName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <label className="min-w-0 space-y-1.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">右方營地名稱</span>
                <input
                  suppressHydrationWarning
                  value={rightName}
                  onChange={event => setRightName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <div className="min-w-0 space-y-1.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">倉庫所有者</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOwnerSide("left")}
                    className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                      ownerSide === "left"
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-500"
                        : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                    }`}
                  >
                    {left.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerSide("right")}
                    className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                      ownerSide === "right"
                        ? "border-orange-400/50 bg-orange-400/10 text-orange-500"
                        : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                    }`}
                  >
                    {right.label}
                  </button>
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveDisplayNames}
                    disabled={isSaving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-500 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-300"
                  >
                    {isSaving ? "儲存中..." : "儲存顯示名稱"}
                  </button>
                  <p className="min-h-4 text-[10px] font-semibold leading-relaxed text-slate-400">
                    {saveError || saveMessage || "這只會保存插件畫面名稱，不會改 GitHub 帳號。"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.status === "missing-config" || state.status === "git-error" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-7 text-center">
            <div className="grid w-full max-w-md grid-cols-[minmax(58px,86px)_1fr_minmax(58px,86px)] items-center gap-3">
              <div className="min-w-0 text-left">
                {showLinks ? (
                  <a
                    href={left.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1 truncate text-xs font-black text-cyan-500 hover:underline dark:text-cyan-300"
                    title={left.githubUrl}
                  >
                    <GitBranch size={11} className="shrink-0" />
                    <span className="truncate">{left.label}</span>
                  </a>
                ) : (
                  <span className="inline-flex max-w-full items-center gap-1 truncate text-xs font-black text-cyan-500 dark:text-cyan-300">
                    <GitBranch size={11} className="shrink-0" />
                    <span className="truncate">{left.label}</span>
                  </span>
                )}
                <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{left.percent}%</p>
              </div>
              <div className="relative h-8">
                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900">
                  <div className="h-full rounded-l-full" style={{ width: `${left.percent}%`, backgroundColor: state.hudTheme.leftAccent }} />
                  <div className="ml-auto h-full rounded-r-full" style={{ width: `${right.percent}%`, backgroundColor: state.hudTheme.rightAccent }} />
                </div>
                <CaptureMarker percent={left.percent} colorClass={markerColor} color={markerColorValue} />
              </div>
              <div className="min-w-0 text-right">
                {showLinks ? (
                  <a
                    href={right.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex max-w-full items-center gap-1 truncate text-xs font-black text-orange-500 hover:underline dark:text-orange-300"
                    title={right.githubUrl}
                  >
                    <GitBranch size={11} className="shrink-0" />
                    <span className="truncate">{right.label}</span>
                  </a>
                ) : (
                  <span className="ml-auto inline-flex max-w-full items-center gap-1 truncate text-xs font-black text-orange-500 dark:text-orange-300">
                    <GitBranch size={11} className="shrink-0" />
                    <span className="truncate">{right.label}</span>
                  </span>
                )}
                <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{right.percent}%</p>
              </div>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-lg border ${meta.statusClass}`}>
              <AlertTriangle size={28} />
            </div>
            <div className="max-w-md space-y-2">
              <p className={`text-sm font-black tracking-wider ${meta.accentClass}`}>{meta.title}</p>
              <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{meta.message}</p>
            </div>
            {state.status === "missing-config" && (
              <div className="w-full max-w-md rounded-md border border-slate-800 bg-slate-950 p-3 text-left font-mono text-[11px] text-slate-300">
                <p className="text-slate-500"># 設定兩方 Git 作者後重算</p>
                <p>$env:CAPTURE_LEFT_AUTHORS=&quot;你的Git名稱,你的email&quot;</p>
                <p>$env:CAPTURE_RIGHT_AUTHORS=&quot;朋友Git名稱,朋友email&quot;</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="py-5">
              <div className="mb-2 grid grid-cols-[minmax(58px,92px)_1fr_minmax(58px,92px)] items-end gap-3">
                <div className="min-w-0 text-left">
                  <a
                    href={left.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1 truncate text-xs font-black text-cyan-500 hover:underline dark:text-cyan-300"
                    title={left.githubUrl}
                  >
                    <GitBranch size={11} className="shrink-0" />
                    <span className="truncate">{left.label}</span>
                  </a>
                  <p className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{left.percent}%</p>
                </div>
                <div className="text-center text-[10px] font-black tracking-widest text-slate-400">
                  <RadioTower size={15} className={`mx-auto mb-1 ${markerColor}`} />
                  OUTPOST
                </div>
                <div className="min-w-0 text-right">
                  <a
                    href={right.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex max-w-full items-center gap-1 truncate text-xs font-black text-orange-500 hover:underline dark:text-orange-300"
                    title={right.githubUrl}
                  >
                    <GitBranch size={11} className="shrink-0" />
                    <span className="truncate">{right.label}</span>
                  </a>
                  <p className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{right.percent}%</p>
                </div>
              </div>

              <div className="relative h-12">
                <div className="absolute left-0 right-0 top-1/2 flex h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900">
                  <div className="h-full rounded-l-full transition-[width] duration-500" style={{ width: `${left.percent}%`, backgroundColor: state.hudTheme.leftAccent }} />
                  <div className="ml-auto h-full rounded-r-full transition-[width] duration-500" style={{ width: `${right.percent}%`, backgroundColor: state.hudTheme.rightAccent }} />
                </div>
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-dashed border-white/70 dark:border-slate-600/70" />
                <CaptureMarker percent={left.percent} colorClass={markerColor} color={markerColorValue} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <StatPanel player={left} tone="left" isOwner={ownerSide === "left"} showLinks={showLinks} />
              <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800/70 dark:bg-slate-950/35">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">據點狀態</p>
                <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{meta.leader}</p>
                <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                  {meta.message}
                </p>
              </div>
              <StatPanel player={right} tone="right" isOwner={ownerSide === "right"} showLinks={showLinks} />
            </div>
          </>
        )}

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/80 pt-3 font-mono text-[10px] font-bold text-slate-400 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
          <span>TIMEZONE: {state.timezone}</span>
          <span className="flex items-center gap-1.5">
            <Activity size={11} />
            UPDATED: {formatDateTime(liveNow)}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            BATTLEFEED_OK
          </span>
        </div>
      </div>
    </section>
  );
}
