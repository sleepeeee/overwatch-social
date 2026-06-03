"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Loader2 } from "lucide-react";
import { getCaptureStateSnapshot } from "@/app/actions/developerCapture";
import type { CaptureHudLayout, CaptureState } from "@/lib/developer-capture/types";

function statBar(lv: number, rv: number) {
  const total = Math.max(lv + rv, 1);
  return { lw: (lv / total) * 100, rw: (rv / total) * 100 };
}

export default function HomeCaptureHud({ applyLayout = true }: { applyLayout?: boolean }) {
  return <HomeCaptureHudContent applyLayout={applyLayout} />;
}

function HomeCaptureHudContent({ applyLayout }: { applyLayout: boolean }) {
  const [captureState, setCaptureState] = useState<CaptureState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewHudLayout, setPreviewHudLayout] = useState<CaptureHudLayout | null>(null);

  useEffect(() => {
    let active = true;

    const syncCaptureState = async () => {
      try {
        const snapshot = await getCaptureStateSnapshot();
        if (active) setCaptureState(snapshot);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void syncCaptureState();

    const refreshOnFocus = () => { void syncCaptureState(); };
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") void syncCaptureState();
    };

    const stateTimer = window.setInterval(() => { void syncCaptureState(); }, 30_000);

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("capture-hud-sync");
      channel.onmessage = event => {
        const message = event.data as
          | { type?: string; layout?: CaptureHudLayout }
          | null
          | undefined;
        if (message?.type === "capture-hud-preview" && message.layout) {
          setPreviewHudLayout(message.layout);
          return;
        }
        if (message?.type === "capture-hud-updated") {
          setPreviewHudLayout(null);
          void syncCaptureState();
        }
      };
    }

    return () => {
      active = false;
      window.clearInterval(stateTimer);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
      channel?.close();
    };
  }, []);

  const effectiveHudLayout = previewHudLayout ?? captureState?.hudLayout;
  const hudLayoutStyle = effectiveHudLayout
    ? ({
        "--hud-home-x": `${effectiveHudLayout.offsetX}px`,
        "--hud-home-y": `${effectiveHudLayout.offsetY}px`,
        "--hud-home-scale": String(effectiveHudLayout.scale),
      } as CSSProperties)
    : undefined;

  const layoutClass = applyLayout ? "home-hud-layout" : "";

  if (isLoading) {
    return (
      <section
        aria-label="首頁戰報 HUD"
        className={`relative overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 ${layoutClass}`}
        style={applyLayout ? hudLayoutStyle : undefined}
      >
        <div className="absolute inset-0 hud-scanlines opacity-25 z-10 pointer-events-none" />
        <div className="relative z-10 p-5 sm:p-6 min-h-[200px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.18em] text-slate-400">
            <Loader2 size={14} className="animate-spin text-cyan-400" />
            SYNCING BATTLE_FEED...
          </div>
        </div>
      </section>
    );
  }

  if (!captureState) {
    return (
      <section
        aria-label="首頁戰報 HUD"
        className={`relative overflow-hidden rounded-lg border border-rose-500/30 bg-white text-slate-800 ${layoutClass}`}
        style={applyLayout ? hudLayoutStyle : undefined}
      >
        <div className="absolute inset-0 hud-scanlines opacity-25 z-10 pointer-events-none" />
        <div className="cyber-corner-tl text-rose-500" />
        <div className="cyber-corner-tr text-rose-500" />
        <div className="cyber-corner-bl text-rose-500" />
        <div className="cyber-corner-br text-rose-500" />
        <div className="relative z-10 p-5 sm:p-6">
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded flex items-center justify-center text-rose-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold tracking-wider text-rose-500 font-mono uppercase">SYS_DAEMON_READ_FAIL</h3>
            <p className="text-[11px] text-slate-400 font-mono">後端連線受阻，HUD 無法同步。</p>
          </div>
        </div>
      </section>
    );
  }

  const [left, right] = captureState.players;
  const ownerSide = captureState.targetRepositoryOwnerSide;

  const getTheme = () => {
    if (captureState.status === "missing-config")
      return { statusText: "配對中止", statusColor: "text-amber-400 border-amber-500/30 bg-amber-500/10", glow: "" };
    if (captureState.status === "git-error")
      return { statusText: "異常警報", statusColor: "text-rose-400 border-rose-500/30 bg-rose-500/10", glow: "" };
    if (left.percent > 50)
      return { statusText: `${left.label} 正在壓制據點`, statusColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", glow: "shadow-[0_0_15px_rgba(0,240,255,0.15)] border-cyan-500/30" };
    if (right.percent > 50)
      return { statusText: `${right.label} 正在壓制據點`, statusColor: "text-orange-400 border-orange-500/30 bg-orange-500/10", glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)] border-orange-500/30" };
    return { statusText: "據點爭奪中", statusColor: "text-slate-300 border-slate-700 bg-slate-800/50", glow: "border-slate-300" };
  };

  const cornerColor = (side: "left" | "right") => {
    if (captureState.status === "git-error") return "text-rose-500";
    if (captureState.status === "missing-config") return "text-amber-500";
    const pct = side === "left" ? left.percent : right.percent;
    if (side === "left") return pct >= 50 ? "text-cyan-400" : "text-orange-400";
    return pct > 50 ? "text-orange-400" : "text-cyan-400";
  };

  const theme = getTheme();

  return (
    <section
      aria-label="首頁戰報 HUD"
      className={`relative overflow-hidden rounded-lg border transition-all duration-500 bg-white text-slate-800 ${theme.glow} ${layoutClass}`}
      style={applyLayout ? hudLayoutStyle : undefined}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 hud-scanlines opacity-25 z-10 pointer-events-none" />
      {/* Cyber Corners */}
      <div className={`cyber-corner-tl ${cornerColor("left")}`} />
      <div className={`cyber-corner-tr ${cornerColor("right")}`} />
      <div className={`cyber-corner-bl ${cornerColor("left")}`} />
      <div className={`cyber-corner-br ${cornerColor("right")}`} />

      <div className="relative z-10 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-3 bg-blue-500" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400">GIT OUTPOST CONSOLE V1.0</span>
          </div>
          <div className={`text-[10px] px-2.5 py-0.5 border font-semibold rounded-sm font-mono tracking-wide flex items-center gap-1.5 transition-all duration-300 ${theme.statusColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-hud-pulse" />
            {theme.statusText}
          </div>
        </div>

        {/* READY */}
        {(captureState.status === "ready" || captureState.status === "neutral") && (
          <div className="space-y-6">
            {/* Player Names */}
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* LEFT CAMP */}
              <div className="text-left space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: captureState.hudTheme.leftAccent }} />
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400">LEFT CAMP</span>
                  {ownerSide === "left" && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold animate-hud-pulse flex items-center gap-1"
                      style={{ color: captureState.hudTheme.leftAccent, borderColor: `${captureState.hudTheme.leftAccent}50`, backgroundColor: `${captureState.hudTheme.leftAccent}15`, border: "1px solid" }}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      倉庫所有者
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 truncate max-w-[150px]">{left.label}</span>
                  <span className="text-xs font-mono font-bold whitespace-nowrap" style={{ color: captureState.hudTheme.leftAccent }}>{left.score} PTS</span>
                </div>
                {left.githubUrl && (
                  <a
                    href={left.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono truncate block hover:underline transition-colors"
                    style={{ color: `${captureState.hudTheme.leftAccent}99` }}
                  >
                    {left.githubUrl.replace("https://github.com/", "@")}
                  </a>
                )}
              </div>

              {/* RIGHT CAMP */}
              <div className="text-right space-y-1">
                <div className="flex flex-wrap items-center justify-end gap-1.5 min-h-[22px]">
                  {ownerSide === "right" && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold animate-hud-pulse flex items-center gap-1"
                      style={{ color: captureState.hudTheme.rightAccent, borderColor: `${captureState.hudTheme.rightAccent}50`, backgroundColor: `${captureState.hudTheme.rightAccent}15`, border: "1px solid" }}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      倉庫所有者
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400">RIGHT CAMP</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: captureState.hudTheme.rightAccent }} />
                </div>
                <div className="flex items-baseline justify-end gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold whitespace-nowrap" style={{ color: captureState.hudTheme.rightAccent }}>{right.score} PTS</span>
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 truncate max-w-[150px]">{right.label}</span>
                </div>
                {right.githubUrl && (
                  <a
                    href={right.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono truncate block hover:underline transition-colors text-right"
                    style={{ color: `${captureState.hudTheme.rightAccent}99` }}
                  >
                    {right.githubUrl.replace("https://github.com/", "@")}
                  </a>
                )}
              </div>
            </div>

            {/* Occupation Bar */}
            <div className="relative pt-6 pb-2">
              <div className="absolute top-0 inset-x-0 flex justify-between text-xs font-mono font-black">
                <span
                  className={`${left.percent >= 50 ? "text-sm scale-110" : "text-slate-400"} transition-all duration-300`}
                  style={left.percent >= 50 ? { color: captureState.hudTheme.leftAccent } : {}}
                >
                  {left.percent}%
                </span>
                <span className="text-[10px] text-slate-400 font-normal">SEC_01 // TRACKING</span>
                <span
                  className={`${right.percent >= 50 ? "text-sm scale-110" : "text-slate-400"} transition-all duration-300`}
                  style={right.percent >= 50 ? { color: captureState.hudTheme.rightAccent } : {}}
                >
                  {right.percent}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full relative flex overflow-hidden">
                <div
                  style={{ width: `${left.percent}%`, backgroundColor: captureState.hudTheme.leftAccent }}
                  className="h-full rounded-l-full transition-all duration-500 ease-out"
                />
                <div
                  style={{ width: `${right.percent}%`, backgroundColor: captureState.hudTheme.rightAccent }}
                  className="h-full rounded-r-full transition-all duration-500 ease-out ml-auto"
                />
              </div>
              {/* Radar Knob */}
              <div
                style={{ left: `calc(${left.percent}% - 14px)` }}
                className="absolute top-[23px] w-7 h-7 flex items-center justify-center transition-all duration-500 ease-out z-20"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="drop-shadow-md">
                  <circle
                    cx="14" cy="14" r="11"
                    stroke={left.percent > 50 ? captureState.hudTheme.leftAccent : left.percent < 50 ? captureState.hudTheme.rightAccent : "#94a3b8"}
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    className="animate-[spin_10s_linear_infinite]"
                  />
                  <circle
                    cx="14" cy="14" r="6"
                    fill={left.percent > 50 ? captureState.hudTheme.leftAccent : left.percent < 50 ? captureState.hudTheme.rightAccent : "#94a3b8"}
                    className="animate-hud-pulse"
                  />
                  <path
                    d="M14 2V5M14 23V26"
                    stroke={left.percent > 50 ? captureState.hudTheme.leftAccent : captureState.hudTheme.rightAccent}
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div className="absolute top-[31px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-300 z-0">
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400">MID</span>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 mt-4 border-t border-slate-100">
              {(
                [
                  { title: "COMMITS",         lv: left.commits,   rv: right.commits,   fmt: (v: number) => String(v),  lc: "bg-blue-500",    rc: "bg-orange-500",             icon: "↔" },
                  { title: "ADDITIONS (新增)", lv: left.additions, rv: right.additions, fmt: (v: number) => `+${v}`,    lc: "bg-emerald-500", rc: "bg-emerald-400 opacity-40", icon: "+" },
                  { title: "DELETIONS (刪除)", lv: left.deletions, rv: right.deletions, fmt: (v: number) => `-${v}`,    lc: "bg-rose-500",    rc: "bg-rose-400 opacity-40",    icon: "-" },
                ] as const
              ).map(({ title, lv, rv, fmt, lc, rc, icon }) => {
                const { lw, rw } = statBar(lv, rv);
                const tc = icon === "+" ? "text-emerald-500" : icon === "-" ? "text-rose-500" : "text-blue-500";
                return (
                  <div key={title} className="p-3 bg-slate-50 rounded border border-slate-100">
                    <div className="text-[10px] font-mono text-slate-400 tracking-wider mb-2.5 uppercase flex items-center justify-between">
                      <span>{title}</span>
                      <span className={tc}>{icon}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div className="space-y-0.5 text-left min-w-0">
                        <span className="text-[10px] text-slate-400 block truncate">{left.label}</span>
                        <p className="text-lg font-black font-mono text-slate-900 leading-none">{fmt(lv)}</p>
                      </div>
                      <div className="h-6 w-12 bg-slate-200 rounded flex overflow-hidden p-0.5 self-center">
                        <div style={{ width: `${lw}%` }} className={`h-full rounded-sm ${lc}`} />
                        <div style={{ width: `${rw}%` }} className={`h-full rounded-sm ${rc} ml-auto`} />
                      </div>
                      <div className="space-y-0.5 text-right min-w-0">
                        <span className="text-[10px] text-slate-400 block truncate">{right.label}</span>
                        <p className="text-lg font-black font-mono text-slate-900 leading-none">{fmt(rv)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MISSING CONFIG */}
        {captureState.status === "missing-config" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-amber-500 animate-hud-pulse">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-sm font-bold tracking-wider text-amber-500 font-mono">WARN_NO_GIT_AUTHOR_DETECTED</h3>
              <p className="text-xs text-slate-400 font-mono">尚未設定 Git 作者，HUD 無法識別陣營歸屬。</p>
            </div>
          </div>
        )}

        {/* GIT ERROR */}
        {captureState.status === "git-error" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded flex items-center justify-center text-rose-500 animate-[pulse_1s_infinite]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-sm font-bold tracking-wider text-rose-500 uppercase font-mono">SYS_DAEMON_READ_FAIL</h3>
              <p className="text-xs text-slate-400 font-mono">後端服務連線受阻，或數據緩存溢出。無法取得本周期的 Git 提交分析檔案。</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span>TIMEZONE: {captureState.timezone}</span>
          </div>
          <span>UPDATED: {new Date(captureState.updatedAt).toLocaleTimeString("zh-TW", { hour12: false })}</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-500">BATTLEFEED_OK</span>
          </div>
        </div>
      </div>
    </section>
  );
}
