import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "After Midnight 收集什麼資料、怎麼使用、誰看得到，以及你如何刪除自己的資料。",
};

const sections = [
  {
    title: "我們收集什麼",
    items: [
      "Google 登入資料：你的 Email、頭像與帳號名稱（用於建立與識別你的帳號）。",
      "你填寫的名片內容：BattleTag、常用英雄、標籤、留言、語言、MBTI、社群帳號等。",
      "基本技術紀錄：由網站託管（Vercel）與資料庫（Supabase）自動產生的伺服器日誌。",
    ],
  },
  {
    title: "我們怎麼使用",
    items: [
      "顯示你的玩家名片，讓其他玩家在廣場瀏覽與認識你。",
      "在你送出回報或聯絡我們時，用你留下的聯絡方式回覆你。",
      "除此之外不做其他用途。我們不會出售或交換你的個資給任何第三方。",
    ],
  },
  {
    title: "誰看得到你的資料",
    items: [
      "名片內容對所有訪客公開（包含未登入的人）。",
      "BattleTag 可在工作室設定隱藏，隱藏後對外顯示為「隱藏#xxxx」。",
      "社群帳號：未登入的訪客只看得到「你有哪些平台」，實際帳號內容需要登入才能看到。",
      "你的 Email 不會公開在網站任何地方。",
      "開發團隊成員為了維運可以存取完整資料，不會對外揭露。",
    ],
  },
  {
    title: "資料存放在哪裡",
    items: [
      "帳號與名片資料儲存於 Supabase（資料庫服務），網站由 Vercel 託管。",
      "我們不自行儲存你的 Google 密碼，登入完全透過 Google 帳號進行。",
    ],
  },
  {
    title: "如何刪除你的資料",
    items: [
      "到「個人工作室」頁面點選「刪除帳號」，會永久刪除你的所有名片、暱稱與 Google 帳號連結，無法復原。",
      "也可以透過回報終端機送出資料刪除請求，我們會手動為你處理。",
    ],
  },
  {
    title: "Beta 測試聲明",
    items: [
      "本站目前為 Beta 測試階段，功能與本政策可能隨開發進度調整。",
      "重大變更會在首頁公告。對本政策有任何疑問，歡迎透過回報終端機聯絡我們。",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(192,132,252,0.14),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(99,102,241,0.12),transparent_32%),linear-gradient(180deg,rgba(3,2,6,0.2),rgba(3,2,6,0.82))]" />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-zinc-300 transition hover:border-auroraMint/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-auroraMint/50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回前廳
        </Link>

        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-auroraMint/20 bg-auroraMint/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-auroraMint">
            PRIVACY POLICY
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-white sm:text-4xl">隱私權政策</h1>
          <p className="text-sm leading-7 text-zinc-300">
            這一頁用白話告訴你：我們收集什麼資料、怎麼使用、誰看得到，以及你隨時可以怎麼刪掉它們。
            最後更新：2026-06-11。
          </p>
        </section>

        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6"
          >
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-auroraMint shadow-[0_0_12px_rgba(192,132,252,0.65)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-xs leading-6 text-zinc-500">
          相關頁面：<Link href="/terms" className="text-zinc-300 underline-offset-4 hover:text-auroraMint hover:underline">使用條款</Link>
          {" "}·{" "}
          <Link href="/report" className="text-zinc-300 underline-offset-4 hover:text-auroraMint hover:underline">回報終端機</Link>
        </p>
      </main>
    </div>
  );
}
