import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bug, ExternalLink, Flag, Lightbulb, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "回報終端機",
  description: "After Midnight Beta 測試期間的錯誤回報、不當名片回報、資料刪除請求與建議入口。",
};

const reportFormUrl =
  process.env.NEXT_PUBLIC_REPORT_FORM_URL ??
  "https://docs.google.com/forms/d/e/1FAIpQLSc6M3udnINVt5H2NpZbzFteZHC0Pb94DLmptplxDcSAmKMBSw/viewform";
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "aftermidnight.halo@gmail.com";

const reportTypes = [
  {
    icon: Bug,
    label: "錯誤回報",
    description: "畫面破版、登入異常、名片無法儲存、手機版操作卡住。",
  },
  {
    icon: Flag,
    label: "不當名片",
    description: "冒充他人、騷擾、仇恨內容、惡意連結或公開他人個資。",
  },
  {
    icon: ShieldAlert,
    label: "資料刪除請求",
    description: "希望移除自己提交過的名片、聯絡方式或其他公開資料。",
  },
  {
    icon: Lightbulb,
    label: "提供建議 & 聯絡我們",
    description: "想補充體驗心得、提出功能想法，或有其他需要站方回覆的事情。",
  },
];

const requiredItems = [
  "你的聯絡方式，Email 或 Discord 皆可。",
  "發生問題的頁面，例如首頁、展示館、工作室或玩家名片。",
  "你看到的狀況，盡量描述按了什麼、畫面發生什麼事。",
  "如果方便，附上截圖或影片連結，能更快定位問題。",
];

export default function ReportPage() {
  const mailHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent("After Midnight Beta 回報")}`
    : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden text-theme-text-strong">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(192,132,252,0.14),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(99,102,241,0.12),transparent_32%),linear-gradient(180deg,rgba(3,2,6,0.2),rgba(3,2,6,0.82))]" />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-theme-text-soft transition hover:border-auroraMint/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-auroraMint/50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回前廳
        </Link>

        <section className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-auroraMint/20 bg-auroraMint/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-auroraMint">
            BETA REPORT NODE
          </div>
          <div className="space-y-4">
            <h1 className="font-playfair text-3xl font-semibold tracking-normal text-white sm:text-5xl">
              After Midnight 回報終端機
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-theme-text-soft sm:text-base">
              Beta 測試期間，這裡用來接收錯誤、不當名片、資料刪除請求，也可以提供建議與聯絡我們。
              請不要送出你不想讓站方看到的私人資訊。
            </p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {reportTypes.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-auroraMint/20 bg-auroraMint/10 text-auroraMint">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="text-base font-semibold text-white">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-theme-text-muted">{item.description}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/[0.07] bg-[#050409]/85 p-5 backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-text-faint">Before sending</p>
            <h2 className="mt-3 text-xl font-semibold text-white">回報前請準備這些資料</h2>
            <ul className="mt-5 space-y-3">
              {requiredItems.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-theme-text-soft">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-auroraMint shadow-[0_0_12px_rgba(192,132,252,0.65)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-auroraMint/20 bg-auroraMint/[0.06] p-5 backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-auroraMint">Response path</p>
            <h2 className="mt-3 text-xl font-semibold text-white">我們會怎麼回覆</h2>
            <p className="mt-3 text-sm leading-6 text-theme-text-soft">
              如果你留下可聯絡方式，站方會透過品牌信箱回覆。Beta 期間不保證即時客服，但會優先處理登入、資料與不當內容問題。
            </p>
            <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/20 p-4 text-xs leading-6 text-theme-text-muted">
              這一頁目前尚未放入網站導覽。正式入口位置會等 Beta 測試流程確認後再加入。
            </div>
          </aside>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {reportFormUrl ? (
            <a
              href={reportFormUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-auroraMint/30 bg-auroraMint/15 px-5 text-sm font-semibold text-white transition hover:border-auroraMint/60 hover:bg-auroraMint/20 focus:outline-none focus:ring-2 focus:ring-auroraMint/50"
            >
              前往回報表單
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <div className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 text-sm font-semibold text-theme-text-faint">
              回報表單設定中
            </div>
          )}

          {mailHref ? (
            <a
              href={mailHref}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 text-sm font-semibold text-theme-text-body transition hover:border-white/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-auroraMint/50"
            >
              用品牌信箱聯絡
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <div className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 text-sm font-semibold text-theme-text-faint">
              品牌信箱設定中
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
