import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "AFTER MIDNIGHT 如何處理玩家名片資料、遊戲 ID 與資料刪除請求。",
};

const sections = [
  {
    title: "我們收集哪些資料",
    items: [
      "你登入時提供的基本帳號資料，例如顯示名稱、頭像與用來識別帳號的資訊。",
      "你主動填寫在名片上的內容，例如暱稱、遊戲 ID、常玩遊戲、角色偏好、語言、語音偏好、標籤與留言。",
      "你透過回報入口提供的內容，例如問題描述、違規名片連結、資料刪除請求與可用來回覆你的聯絡方式。",
      "網站運作需要的基本技術紀錄，例如錯誤紀錄與安全紀錄，用來維護服務穩定與處理濫用行為。",
    ],
  },
  {
    title: "我們怎麼使用資料",
    items: [
      "建立與顯示你的玩家名片，讓其他玩家能瀏覽你願意公開的資訊。",
      "讓你登入後管理自己的名片、修改內容或刪除帳號。",
      "處理問題回報、不當內容、資料刪除請求與平台安全事件。",
      "改善 Beta 測試期間的功能穩定度、閱讀體驗與安全防護。",
      "我們不會出售你的個人資料，也不會把資料拿去做與本平台無關的廣告交易。",
    ],
  },
  {
    title: "誰看得到你的資料",
    items: [
      "你放在名片上的內容，可能會被其他玩家或訪客看到。",
      "展示館主要讓其他玩家看到你的遊戲 ID、遊戲偏好與名片內容，方便他們判斷是否要在遊戲內加好友。",
      "留言欄不是私人聯絡方式欄位。請不要在留言中填寫電話、住址、私人社群帳號，或其他你不想公開的資訊。",
      "如果你不想讓玩家透過展示館看到你的遊戲 ID，建議不要公開展示名片。",
      "站方在維護服務、處理回報或安全事件時，可能需要查看必要資料。",
    ],
  },
  {
    title: "Google 登入與外部服務",
    items: [
      "目前 AFTER MIDNIGHT 只提供 Google 登入。Google 會依照它自己的政策處理登入資料。",
      "網站會使用必要的託管、資料儲存與安全服務讓平台正常運作。",
      "我們不會要求你提供遊戲帳號密碼，也不會替你登入任何遊戲官方帳號。",
    ],
  },
  {
    title: "你可以怎麼控制資料",
    items: [
      "你可以回到個人工作室修改名片內容。",
      "你可以移除不想公開的欄位，或只留下你願意讓其他玩家看到的資訊。",
      "你可以刪除帳號；刪除後名片與帳號連結會被移除，且無法復原。",
      "如果無法自行處理，也可以透過回報入口提出資料刪除或修正請求。",
    ],
  },
  {
    title: "Beta 測試提醒",
    items: [
      "AFTER MIDNIGHT 目前仍在 Beta 測試階段，功能、顯示方式與本政策可能隨開發調整。",
      "如果政策有重大變更，我們會盡量在站內公告。",
      "你對資料處理或安全風險有疑問，可以透過回報入口聯絡我們。",
    ],
  },
];

export default function PrivacyPage() {
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
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            PRIVACY
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-white sm:text-4xl">隱私權政策</h1>
          <p className="text-sm leading-7 text-theme-text-soft">
            這裡說明 AFTER MIDNIGHT 會處理哪些玩家名片資料、誰可能看得到，以及你可以怎麼修改或刪除。
          </p>
          <p className="font-mono text-[11px] tracking-[0.12em] text-theme-text-faint">最後更新：2026-06-12</p>
        </section>

        <section className="rounded-2xl border border-auroraMint/20 bg-auroraMint/[0.07] p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">先記住這條安全規則</h2>
          <p className="mt-3 text-sm leading-7 text-theme-text-body">
            名片是你主動掛出的玩家公告。請只填寫你願意讓其他玩家看見的遊戲資訊，不要把私人聯絡方式放進留言。
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
          </section>
        ))}

        <p className="text-xs leading-6 text-theme-text-faint">
          相關頁面：{" "}
          <Link href="/terms" className="text-theme-text-soft underline-offset-4 hover:text-auroraMint hover:underline">
            使用條款
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
