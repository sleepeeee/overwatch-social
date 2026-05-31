# Change: google-oauth-supabase-auth

> rsx PROPOSE draft（Stage 0-7）。本檔由 rsx-orchestrator 草擬於 `_drafts/`，待主代理 `/opsx:propose` 後移入正式位置。

## Why（含 why now — Stage 0）

OW Social 前端三大頁面（首頁、名片廣場 `/browse`、名片編輯器 `/profile`）已完成，但資料層停在 `localStorage('ow_social_user_card')` + `src/data/mockPlayers.ts` 靜態假資料：

- 名片只存在單一瀏覽器，換裝置 / 清快取即遺失，**廣場上其他玩家看到的永遠是 mock 假資料**，產品核心價值（玩家互相發現）無法成立。
- 沒有身分概念，任何人都能改任何名片（目前靠前端 `isLoggedIn` 旗標，無後端強制）。

**Why now（為什麼是現在，不是更早 / 更晚）：**
- **不更早**：前端名片型別 `OWPlayerCard` 與編輯器 UX 在這次之前仍在迭代；若更早串後端，schema 會跟著 UI 反覆改而白做 migration。現在 `OWPlayerCard` 已穩定，是定 schema 的正確時機。
- **不更晚**：再加更多功能（玩家詳細頁、搜尋篩選）都依賴「真實、可跨裝置、有擁有者的名片資料」。後端與身分是這些功能的共同前置；越晚做，越多功能要從假資料返工。
- **工具成熟（非競爭窗口）**：`@supabase/ssr` 已是 Next.js App Router 官方推薦的成熟 server-side auth 方案（REF-002），Google OAuth + RLS 是文件化的標準路徑，現在落地的工程風險低。
  - **誠實定位（Codex §6.1 建議）**：本 change 的 why-now 主要是**內部產品排序 + 工具成熟**，**不主張競爭窗口**（無證據顯示有對手正逼近同一結果，也無平台政策壓力）。
- **OWPlayerCard 穩定依據（Codex §6.1 建議）**：`src/types/card.ts` 的 `OWPlayerCard` 自前端三頁完成後未再變更，且 `/profile` 編輯器、`/browse` 卡片、`OWCard` 元件三處皆已消費同一型別 —— 三個消費點一致是 schema 已穩定的具體依據，非僅口頭判斷。apply Task 1.2 仍會做版本校準作為最終 freeze 確認。

## What Changes

1. 引入 Supabase 作為 BaaS（Auth + Postgres），新增 `@supabase/supabase-js` + `@supabase/ssr`。
2. 實作 Google OAuth 登入（PKCE flow + `/auth/callback` route）。
3. 建 `profiles` 資料表，逐欄對應 `OWPlayerCard`，啟用 RLS（廣場公開 SELECT、僅本人可寫）。
4. `/profile` 的儲存/讀取由 localStorage 改為 Supabase API；登入後才能編輯儲存。
5. `/browse` 廣場資料來源由 `mockPlayers.ts` 改為查 `profiles` 表（MVP 可保留 mock 作為 fallback / seed）。

## 詮釋框架（Stage 2 — 什麼結果 → 什麼結論）

| smoke 量測結果 | 結論與行動 |
|---|---|
| Google OAuth 能登入、callback 換到 session、middleware 刷新 token 成功 | auth 基礎成立，續推 profiles 讀寫 |
| 登入成功但 server 端 `getClaims()` 拿不到身分 | client 分層 / middleware cookie 寫回有誤，回 design 修（非範圍問題） |
| RLS 啟用後本人也無法寫入 | policy 的 `auth.uid() = user_id` 對應錯誤或漏建 INSERT policy，修 migration |
| 未登入也能寫 profiles | RLS 未生效（忘了 enable 或 policy 過寬）— **安全 negative result，必須阻擋發布** |

> Negative result 價值：「未登入能寫入」這類結果比「能跑」更有診斷價值，是安全 gate 的硬性失敗條件。

## Impact

- **新增 specs**：`auth`（登入 / session / OAuth callback）、`profiles`（名片資料模型 + 授權）。
- **影響程式**：`src/app/profile/page.tsx`（改資料層）、`src/app/browse/page.tsx`（改資料源）、新增 `src/lib/supabase/{client,server}.ts`、`src/middleware.ts`、`src/app/auth/callback/route.ts`、登入入口（Navbar）。
- **新增基礎設施**：Supabase 專案、`profiles` migration、Google OAuth Client、環境變數（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`）。
- **不破壞**：未登入仍可瀏覽廣場（公開 SELECT）；型別 `OWPlayerCard` 不變（DB schema 對齊它，不反向改 UI）。

## 替代方案考量（Stage 0 — 待 Codex §6.1 評估）

| 方案 | 取捨 | 暫定判斷 |
|---|---|---|
| 續用 localStorage | 零後端成本，但無法跨裝置 / 無真實廣場 | 不可行，違背產品核心 |
| 匿名 Supabase 寫入（不做 auth） | 較快，但無擁有者 → 無法「僅本人可改」 | 不採；身分是 RLS 前置 |
| NextAuth 取代 Supabase Auth | 多一層整合，且 Supabase Auth 與 RLS `auth.uid()` 原生整合 | 不採；Supabase Auth 與 DB 同源最省整合成本 |

## 開放問題（待 Stage 4-6 收斂）

- `social_channels` 用 jsonb 還是拆欄？（design rationale，REF-004 caveat）
- MVP 是否需要 Google refresh token（`access_type=offline`）？暫定否。
- `/browse` 是否同時保留 mock 作為冷啟動 seed？暫定保留為 fallback。
