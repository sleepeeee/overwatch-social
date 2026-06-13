# Design — fix-oauth-redirect-preserve-origin

## Context

EXPLORE 階段已定位：callback 端 `safeRedirectPath(next, origin)` 設計時預留了 `?next=` 通道並有完整安全防護（同源驗證、protocol-relative 阻擋、parse 失敗 fallback），但 4 個 `signInWithOAuth` 呼叫端沒有人寫入 `next`，使這條通道從未被啟用。

修法本身只有 5 行核心邏輯（讀當前 pathname → 過濾 unsafe prefix → URL-encode → 串到 redirectTo），但 4 個入口各自 inline 寫會立刻 diverge（未來加 PostHog event、改 `prompt=select_account`、多 provider 都要改 4 處）。所以要點不是「修正」本身，而是**抽 helper 把這個 invariant 集中**。

## Goals

- 4 個登入入口呼叫同一 helper，登入完成後保留來源頁面
- helper 單一真相源：未來加 OAuth 參數、加 telemetry、改 provider 只改一處
- 與既有 callback 端安全防護（`safeRedirectPath`）形成深度防禦

## Non-Goals

- 不改 callback 端邏輯（已正確）
- 不引入路由狀態管理（過於重武器，pathname 直接從 `window.location` 取即可）
- 不處理「登入完成後執行某 action」這類更複雜的 returnTo 需求（YAGNI）

## Decisions

### D1：helper 簽名與預設行為

```ts
// src/lib/auth/googleLogin.ts
"use client";
import { createClient } from "@/lib/supabase/client";

const UNSAFE_NEXT_PREFIXES = ["/auth/", "/developer/"];

export function buildNext(currentPath: string): string {
  if (UNSAFE_NEXT_PREFIXES.some(p => currentPath.startsWith(p))) return "/profile";
  return currentPath;
}

export async function signInWithGoogle(opts?: { nextPath?: string }) {
  const supabase = createClient();
  const pathname =
    opts?.nextPath ??
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/profile");
  const next = encodeURIComponent(buildNext(pathname));
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
  });
}
```

**為什麼預設讀 `window.location`**：4 個入口都是 Client Component 內事件 handler，呼叫時 `window` 必然存在；提供 `nextPath` override 是給未來「想送使用者去特定頁」的場景（目前無需求，但保留口子）。

**為什麼 SSR fallback 用 `/profile`**：與 callback 端 `safeRedirectPath(null)` 一致，行為對齊。

### D2：Supabase OAuth 白名單兼容性

Supabase Dashboard 的 Redirect URL 白名單對 `redirectTo` 用 **prefix match**（[Supabase Auth docs](https://supabase.com/docs/guides/auth/redirect-urls)）。既有白名單條目 `https://aftermidnight-gg.vercel.app/auth/callback`（及 localhost dev 條目）會自動接受 `/auth/callback?next=...` 形式，**無需動 Supabase Dashboard 設定**。

驗證手段：apply 階段 task 5 將實機跑一次 staging 確認。

### D3：unsafe prefix 過濾的選擇

過濾 `/auth/*` 與 `/developer/*`：

- `/auth/*`：避免 `next=/auth/callback` 造成 callback 內遞迴跳轉，或 `next=/auth/error` 把使用者導去錯誤頁。
- `/developer/*`：守門路由（Server Component 內 redirect("/")），非 developer 用 next 帶入只會立即被踢走，沒意義。

**未過濾的路徑當作合法**（如 `/share/[id]`、`/player/[id]`）：callback 端 `safeRedirectPath` 已驗證同源 + 非 protocol-relative + URL parse 成功，足以擋掉惡意輸入。

**為什麼不過濾 `/`**：首頁是合法的「來源頁面」，從 `/` 點 starmap 登入應該回到 `/`，這正是修法目的。

### D4：dead code 一併改

`AuthShelvedButtons.tsx` 從 git 紀錄看是備份元件，當前未掛載任何頁面（CLAUDE.md 已標 dead code）。一併改的理由：

- 改動成本 = 改 5 行
- 不改的成本 = 未來某天有人 uncomment 或復用，再次踩同一坑（已發生 1 次的問題容易再發生）
- 此 helper 抽出本身就是「集中 invariant」的設計，dead code 跳過反而破壞一致性

### D5：spec delta 的 MODIFIED 範圍

既有 `auth-ux/spec.md` 第 47 行：
```
- **THEN** 系統 SHALL 呼叫 `signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`
```

要改為「包含 `?next=<encoded current path>`」版本。spec delta 採 MODIFIED Scenario 形式（既有 Scenario 內容更新），而非整段 Requirement 重寫。

新增 Requirement「OAuth 登入完成後保留來源頁面」涵蓋四個 Scenario：
1. /browse 點卡片登入回 /browse
2. / 點 starmap 登入回 /
3. /profile 點守門面板登入回 /profile
4. 從 /auth/* 路徑下不應用 next（unsafe prefix 過濾）

## Risks / Trade-offs

| 風險 | 評估 | 緩解 |
|---|---|---|
| Supabase 白名單因加 query 不接受 | 低（prefix match 已查證）| task 5 staging 實測 |
| 使用者從惡意連結被導入帶 `next=evil.com` | 已被 callback `safeRedirectPath` 同源驗證擋下 | 既有防護不動，深度防禦 |
| URL 過長（next 含 query string） | 極低（browser URL 限制 ≥ 2000 字元，typical pathname < 100） | 不處理 |
| 過濾 unsafe prefix 名單未涵蓋未來新增的守門路由 | 中（之後加新守門路由要記得更新） | helper export `UNSAFE_NEXT_PREFIXES` 常數，新增路由時可同步擴充；未過濾的最差結果只是「登入後被守門頁踢走」，非安全問題 |

## 詮釋框架（預先定義）

- **成功**：apply 後實機驗證從 `/browse` 觸發 LoginModal → Google → 回到 `/browse`（不再是 `/profile`）
- **部分成功**：3/4 入口正確，1 個入口因特殊狀態（如已有 query string）出問題 → 修 helper 邏輯
- **失敗**：Supabase 因白名單拒絕 redirect → 退回為「動 Supabase Dashboard 把白名單改成 `/auth/callback*` 通配」+ 補 spec note
