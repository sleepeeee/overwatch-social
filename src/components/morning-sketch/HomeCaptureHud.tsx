"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Activity, Crosshair, Crown, GitCommitHorizontal, Loader2, RadioTower } from "lucide-react";
import { getCaptureStateSnapshot } from "@/app/actions/developerCapture";
import type { CaptureState } from "@/lib/developer-capture/types";

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

function getStatusLabel(state: CaptureState): string {
  const [left, right] = state.players;

  if (state.status === "missing-config") {
    return "WAITING_SETUP";
  }

  if (state.status === "git-error") {
    return "SYNC_ERROR";
  }

  if (left.percent > right.percent) {
    return "LEFT_ADVANTAGE";
  }

  if (right.percent > left.percent) {
    return "RIGHT_ADVANTAGE";
  }

  return "CONTESTED";
}

function getStatusTitle(state: CaptureState): string {
  const [left, right] = state.players;

  if (state.status === "missing-config") {
    return "尚未設定 Git 作者";
  }

  if (state.status === "git-error") {
    return "Git 戰報讀取異常";
  }

  if (left.percent > right.percent) {
    return `${left.label} 領先`;
  }

  if (right.percent > left.percent) {
    return `${right.label} 領先`;
  }

  return "據點爭奪中";
}

function getStatusAccent(state: CaptureState): string {
  const [left, right] = state.players;

  if (state.status === "missing-config") {
    return "#f59e0b";
  }

  if (state.status === "git-error") {
    return "#f43f5e";
  }

  if (left.percent > right.percent) {
    return state.hudTheme.leftAccent;
  }

  if (right.percent > left.percent) {
    return state.hudTheme.rightAccent;
  }

  return "#94a3b8";
}

function StatChip({
  title,
  leftValue,
  rightValue,
  leftColor,
  rightColor,
}: {
  title: string;
  leftValue: string;
  rightValue: string;
  leftColor: string;
  rightColor: string;
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/45 px-3 py-2 shadow-[0_6px_18px_rgba(140,124,108,0.04)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#8c7c6c]/75">{title}</p>
        <GitCommitHorizontal size={10} className="text-[#8c7c6c]/35" />
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs font-black tabular-nums">
        <span className="truncate" style={{ color: leftColor }}>{leftValue}</span>
        <span className="truncate text-right" style={{ color: rightColor }}>{rightValue}</span>
      </div>
    </div>
  );
}

export default function HomeCaptureHud() {
  const [captureState, setCaptureState] = useState<CaptureState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveNow, setLiveNow] = useState(() => new Date());

  useEffect(() => {
    let active = true;

    const syncCaptureState = async () => {
      try {
        const snapshot = await getCaptureStateSnapshot();
        if (active) {
          setCaptureState(snapshot);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    syncCaptureState();

    const refreshOnFocus = () => {
      void syncCaptureState();
    };

    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        void syncCaptureState();
      }
    };

    const stateTimer = window.setInterval(() => {
      void syncCaptureState();
    }, 30_000);
    const clockTimer = window.setInterval(() => setLiveNow(new Date()), 1000);

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      active = false;
      window.clearInterval(stateTimer);
      window.clearInterval(clockTimer);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, []);

  if (isLoading) {
    return (
      <section className="glass-panel relative min-h-[250px] w-full overflow-hidden border border-white/60 bg-white/50 p-4 shadow-[0_10px_40px_rgba(140,124,108,0.08)] backdrop-blur-xl">
        <div className="flex h-full items-center justify-center gap-2 text-xs font-black tracking-[0.18em] text-[#8c7c6c]/70">
          <Loader2 size={14} className="animate-spin text-[#82b7cc]" />
          HUD 載入中
        </div>
      </section>
    );
  }

  if (!captureState) {
    return (
      <section className="glass-panel relative min-h-[250px] w-full overflow-hidden border border-white/60 bg-white/50 p-4 shadow-[0_10px_40px_rgba(140,124,108,0.08)] backdrop-blur-xl">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs font-black tracking-[0.18em] text-[#3e2723]">HUD 暫時無法同步</p>
          <p className="max-w-[220px] text-[10px] leading-relaxed text-[#8c7c6c]">後端資料讀取失敗，首頁先顯示靜態占位卡。</p>
        </div>
      </section>
    );
  }

  const [left, right] = captureState.players;
  const statusLabel = getStatusLabel(captureState);
  const statusTitle = getStatusTitle(captureState);
  const accent = getStatusAccent(captureState);
  const ownerSide = captureState.targetRepositoryOwnerSide;
  const isLeftOwner = ownerSide === "left";
  const isRightOwner = ownerSide === "right";
  const hudStyle = {
    "--hud-mini-bg": captureState.hudTheme.lightBackground,
    "--hud-mini-card": captureState.hudTheme.lightCard,
  } as CSSProperties;

  return (
    <section
      aria-label="首頁戰報 HUD"
      className="glass-panel relative w-full overflow-hidden border border-white/60 bg-[var(--hud-mini-bg)] p-4 text-[#3e2723] shadow-[0_14px_40px_rgba(140,124,108,0.08)] backdrop-blur-xl"
      style={hudStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(255,255,255,0.08)_58%,transparent_76%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(140,124,108,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,124,108,0.08)_1px,transparent_1px)] [background-size:20px_20px]"
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#82b7cc]">
              <span className="h-3 w-1.5 bg-[#82b7cc]" />
              GIT OUTPOST LIVE HUD
            </p>
            <h3 className="mt-1 flex items-center gap-2 text-[15px] font-black tracking-tight text-[#3e2723]">
              <Crosshair size={16} style={{ color: accent }} />
              {statusTitle}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-[10px] font-black tracking-wider text-[#8c7c6c] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {statusLabel}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)_minmax(0,1.35fr)] items-end gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#82b7cc]">左側</p>
            <p className="truncate text-[11px] font-black text-[#3e2723] sm:text-[13px]">{left.label}</p>
            <p className="text-base font-black tabular-nums sm:text-lg" style={{ color: captureState.hudTheme.leftAccent }}>
              {left.percent}%
            </p>
            {isLeftOwner && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black text-amber-600">
                <Crown size={10} />
                倉庫所有者
              </span>
            )}
          </div>

          <div className="relative h-10">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/70 shadow-inner">
              <div className="h-full rounded-l-full transition-[width] duration-500" style={{ width: `${left.percent}%`, backgroundColor: captureState.hudTheme.leftAccent }} />
              <div className="ml-auto h-full rounded-r-full transition-[width] duration-500" style={{ width: `${right.percent}%`, backgroundColor: captureState.hudTheme.rightAccent }} />
            </div>
            <div
              className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/75 bg-white/85 text-[10px] font-black shadow-[0_8px_18px_rgba(130,183,204,0.18)]"
              style={{ color: accent }}
            >
              <RadioTower size={11} />
            </div>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f97316]">右側</p>
            <p className="truncate text-[11px] font-black text-[#3e2723] sm:text-[13px]">{right.label}</p>
            <p className="text-base font-black tabular-nums sm:text-lg" style={{ color: captureState.hudTheme.rightAccent }}>
              {right.percent}%
            </p>
            {isRightOwner && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black text-amber-600">
                <Crown size={10} />
                倉庫所有者
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatChip
            title="COMMITS"
            leftValue={`${left.commits}`}
            rightValue={`${right.commits}`}
            leftColor={captureState.hudTheme.leftAccent}
            rightColor={captureState.hudTheme.rightAccent}
          />
          <StatChip
            title="ADDITIONS"
            leftValue={`+${left.additions}`}
            rightValue={`+${right.additions}`}
            leftColor={captureState.hudTheme.leftAccent}
            rightColor={captureState.hudTheme.rightAccent}
          />
          <StatChip
            title="DELETIONS"
            leftValue={`-${left.deletions}`}
            rightValue={`-${right.deletions}`}
            leftColor={captureState.hudTheme.leftAccent}
            rightColor={captureState.hudTheme.rightAccent}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/50 pt-2 font-mono text-[10px] font-bold text-[#8c7c6c]/75">
          <span>TIMEZONE: {captureState.timezone}</span>
          <span className="flex items-center gap-1.5">
            <Activity size={11} />
            UPDATED: {formatDateTime(liveNow)}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            BATTLEFEED_OK
          </span>
        </div>
      </div>
    </section>
  );
}
