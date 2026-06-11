import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "使用條款",
  description: "After Midnight 的伺服器規則：可以做什麼、不能做什麼、違規會怎樣，以及 Beta 測試期間的注意事項。",
};

const sections = [
  {
    title: "服務性質",
    items: [
      "After Midnight 是玩家名片交友平台，目前為 Beta 測試階段。",
      "測試期間服務可能中斷、改版；重大改版時資料有遺失的風險，我們會盡力避免並提前公告。",
    ],
  },
  {
    title: "你的帳號",
    items: [
      "使用 Google 帳號登入，一個 Google 帳號對應一個平台帳號。",
      "你對自己名片上填寫的內容負責。",
    ],
  },
  {
    title: "可以做什麼",
    items: [
      "建立、編輯自己的玩家名片。",
      "瀏覽廣場上其他玩家的名片、複製公開的聯絡資訊。",
      "把自己的名片連結分享到任何地方。",
    ],
  },
  {
    title: "不能做什麼",
    items: [
      "冒充其他玩家或站方人員。",
      "張貼騷擾、仇恨、歧視或色情內容。",
      "張貼惡意連結、詐騙資訊或廣告。",
      "未經同意公開他人的個人資料。",
      "嘗試攻擊、爬取或以其他方式濫用本站系統。",
    ],
  },
  {
    title: "違規會怎樣",
    items: [
      "站方可以不經通知移除違規內容或名片。",
      "情節重大者將停用帳號。",
      "看到違規內容，請透過回報終端機檢舉，我們會優先處理。",
    ],
  },
  {
    title: "智慧財產與免責",
    items: [
      "Overwatch（鬥陣特攻）及相關名稱、圖像屬於 Blizzard Entertainment。本站為玩家社群作品，與 Blizzard 無任何關聯，亦未獲其贊助或背書。",
      "本服務按「現狀」提供，Beta 期間不保證可用性與資料完整性。",
    ],
  },
  {
    title: "條款更新",
    items: [
      "條款可能隨開發進度調整，重大變更會在首頁公告。",
      "繼續使用本站即代表你同意更新後的條款。",
    ],
  },
];

export default function TermsPage() {
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
            TERMS OF SERVICE
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-white sm:text-4xl">使用條款</h1>
          <p className="text-sm leading-7 text-zinc-300">
            伺服器規則：可以做什麼、不能做什麼、違規會怎樣。最後更新：2026-06-11。
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
          相關頁面：<Link href="/privacy" className="text-zinc-300 underline-offset-4 hover:text-auroraMint hover:underline">隱私權政策</Link>
          {" "}·{" "}
          <Link href="/report" className="text-zinc-300 underline-offset-4 hover:text-auroraMint hover:underline">回報終端機</Link>
        </p>
      </main>
    </div>
  );
}
