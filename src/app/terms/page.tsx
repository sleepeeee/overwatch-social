import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "使用條款",
  description: "AFTER MIDNIGHT 的平台規則、禁止行為、防詐騙與第三方連結責任、站外互動風險與管理權限。",
};

const sections = [
  {
    title: "服務定位",
    items: [
      "AFTER MIDNIGHT 是玩家名片展示與探索空間，讓玩家自願留下遊戲習慣、偏好與遊戲 ID。",
      "本平台不是配對服務、聊天室、交易平台、官方遊戲服務或糾紛仲裁服務。",
      "我們不保證玩家身分、遊戲表現、組隊結果、站外互動結果或任何交易安全。",
    ],
  },
  {
    title: "你的責任",
    items: [
      "你必須對自己填寫、上傳或公開在名片上的內容負責。",
      "請不要填寫他人的個人資料、聯絡方式、遊戲帳號或任何未經同意公開的資訊。",
      "是否加好友、聊天、組隊、交易或進行其他站外互動，由玩家自行判斷並自行承擔風險。",
    ],
  },
  {
    title: "禁止行為",
    items: [
      "騷擾、跟蹤、威脅、羞辱、仇恨、歧視、色情或任何讓其他玩家不安全的內容。",
      "詐騙、釣魚、惡意連結、假活動、假抽獎或誘導玩家提供帳號密碼。",
      "代打、帳號買賣、遊戲幣交易、陪玩交易、現金交易或其他不當交易導流。",
      "冒充其他玩家、官方人員、站方人員或合作對象。",
      "公開他人的個資、聊天紀錄、聯絡方式、照片或可識別身分的資訊。",
      "使用自動化工具大量爬取資料、干擾網站運作或規避平台限制。",
    ],
  },
  {
    title: "詐騙防範與第三方連結",
    items: [
      "我們不會跟你要遊戲帳號密碼、雙重驗證碼、簡訊驗證碼、信用卡或銀行帳號、超商代碼。",
      "我們也不會私下跟你要錢。Beta 期間平台完全免費；未來如果有付費或贊助功能，會在站內事先公告，並只在公開的付款入口進行。",
      "我們也不經手遊戲點數卡、代打定金、抽獎參加費、二手帳號保證金或虛寶交易費。任何人說「先付定金幫你上分」「轉點數卡換抽獎」，都是詐騙。",
      "看到有人自稱 AFTER MIDNIGHT 的人員、客服、開發者或合作對象跟你要這些，請馬上停止互動，那就是詐騙。",
      "名片上的 Discord、Twitter / X、Instagram 等連結是玩家自己填的，我們不會事先逐一審查、不背書，也不對連結後的內容、安全性或可用性負責。",
      "點開站外連結後的風險（釣魚網站、惡意程式、個資外洩等）由玩家自己承擔。但如果損害是站方故意或嚴重疏失造成，我們會負起責任。",
    ],
    cta: { label: "我要透過回報入口告訴你們", href: "/report" },
  },
  {
    title: "站方管理權",
    items: [
      "如果內容疑似違規、造成風險或收到合理回報，我們可以隱藏名片、移除內容或限制帳號。",
      "我們可以依照安全需要調整顯示規則、回報流程與 Beta 測試功能。",
      "我們不承諾即時處理所有回報，但會優先處理騷擾、詐騙、不當交易、個資外洩與安全事件。",
    ],
  },
  {
    title: "站外互動與交易",
    items: [
      "AFTER MIDNIGHT 不提供站內付款、交易擔保、代收代付、合約媒合或爭議仲裁。",
      "玩家透過名片看到遊戲 ID 後，是否加好友、聊天、組隊或進行其他互動，屬於站外行為，不代表平台推薦、保證或背書。",
      "如果有人利用名片進行騷擾、詐騙、不當交易或惡意導流，請透過回報入口通知我們。",
    ],
  },
  {
    title: "遊戲與商標",
    items: [
      "本站提到的遊戲名稱、角色、圖像、商標與相關素材，屬於原本擁有它們的遊戲公司或權利持有人。",
      "AFTER MIDNIGHT 是玩家社群作品，不是任何遊戲公司的官方服務，也不代表官方立場。",
    ],
  },
  {
    title: "條款更新",
    items: [
      "AFTER MIDNIGHT 目前仍在 Beta 測試階段，條款可能隨功能與安全需求調整。",
      "重大變更會盡量在站內公告。繼續使用平台，代表你願意遵守更新後的規則。",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-theme-text-strong">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(192,132,252,0.14),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(45,212,191,0.1),transparent_30%),linear-gradient(180deg,rgba(3,2,6,0.16),rgba(3,2,6,0.84))]" />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-theme-text-soft transition hover:border-auroraMint/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-auroraMint/50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回前廳
        </Link>

        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-auroraMint/20 bg-auroraMint/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-auroraMint">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            TERMS
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-white sm:text-4xl">使用條款</h1>
          <p className="text-sm leading-7 text-theme-text-soft">
            這裡是 AFTER MIDNIGHT 的平台規則：可以做什麼、不能做什麼，以及站外互動風險由誰承擔。
          </p>
          <p className="font-mono text-[11px] tracking-[0.12em] text-theme-text-faint">最後更新：2026-06-15</p>
        </section>

        <section className="rounded-2xl border border-auroraMint/20 bg-auroraMint/[0.07] p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">平台只是一座名片公告欄</h2>
          <p className="mt-3 text-sm leading-7 text-theme-text-body">
            我們提供展示與探索，不替玩家保證身分、互動、交易、組隊或站外行為。遇到騷擾、詐騙或不當交易，請回報，我們會依規則處理平台上的內容。
          </p>
        </section>

        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-theme-text-soft">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-auroraMint" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {"cta" in section && section.cta && (
              <div className="mt-5">
                <Link
                  href={section.cta.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-auroraMint/30 bg-auroraMint/10 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-auroraMint transition hover:border-auroraMint/60 hover:bg-auroraMint/20 focus:outline-none focus:ring-2 focus:ring-auroraMint/50"
                >
                  {section.cta.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>
        ))}

        <p className="text-xs leading-6 text-theme-text-faint">
          相關頁面：{" "}
          <Link href="/privacy" className="text-theme-text-soft underline-offset-4 hover:text-auroraMint hover:underline">
            隱私權政策
          </Link>
          {" "}·{" "}
          <Link href="/report" className="text-theme-text-soft underline-offset-4 hover:text-auroraMint hover:underline">
            回報問題
          </Link>
        </p>
      </main>
    </div>
  );
}
