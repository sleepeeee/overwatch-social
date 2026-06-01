# Design: auth-fix-and-developer-role

## Context

平台已有正確的 OAuth 基礎建設（REF-002 client 分層、REF-003 PKCE flow、`auth/callback/route.ts`）。本 change 是**一致性修復 + 角色層疊加**，不引入新後端架構。所有設計決策以既有 REF 為依據。

## Goals / Non-Goals

**Goals**：首頁與側邊欄登入/登出真正可用；以不可偽造的方式區分一般使用者與開發者；開發者模式 UI 容器就緒。

**Non-Goals**：見 proposal.md（不做 Auth Hook、不做 env 白名單、不動 Navbar、不實作具體 dev 工具內容）。

## Decisions

### D1 — `page.tsx` 登入按鈕改用 `signInWithOAuth`

**決策**：`handleGoogleLogin` 改為 async，呼叫 `createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: \`${window.location.origin}/auth/callback?next=/profile\` } })`。

**依據**：REF-003。直接複用 `Navbar.tsx:36-44` 的可運作實作（同一專案內的 in-tree 落地證據，強度高於文件）。

**Rationale 表**：

| 技術選擇 | Prior work | 理由 |
|---|---|---|
| `signInWithOAuth` + PKCE callback | REF-003 | Server-Side Auth 必須 PKCE + callback route，否則 server 拿不到 session |
| `redirectTo` 指向自家 `/auth/callback` | REF-003 風險段 | 與 Google Console 指向 Supabase `/auth/v1/callback` 是不同層，混淆會 OAuth 失敗 |
| browser client (`@/lib/supabase/client`) | REF-002 | 登入按鈕在 Client Component，用 browser client 觸發 |

### D2 — `AppSidebar.tsx` 登出改用 `auth.signOut`

**決策**：`handleLogout` 改為 async，呼叫 `createClient().auth.signOut()` 後 `router.refresh()`（需 `useRouter`，`AppSidebar` 目前無）。

**依據**：REF-002（client 分層）+ `Navbar.tsx:46-50` in-tree 落地。`router.refresh()` 確保 Server Component 重新讀取已清除的 session。

### D3 — 角色機制選 `app_metadata`（方案 A）

**決策**：開發者身分以 `auth.users.raw_app_meta_data` 的 `{"role":"developer"}` 標記，前端讀 `user.app_metadata.role`。

**依據**：REF-005。

**[Stage 4 method_completeness 修正]** 原比較表只列三方案，Codex 方法完整性審查指出 reviewer 會期待覆蓋更多常見替代路徑，且 app_metadata 的「client 暴露」表述錯誤。修正後的完整比較表（六方案）：

| 方案 | 不可偽造 | 增減開發者成本 | DB 變動 | client 可見 | 採用 |
|---|---|---|---|---|---|
| A: `app_metadata` | ✅（JWT 內建，一般 user 無法改） | SQL 一行，免重部署 | 無建表 | ⚠️ **登入者可讀** `user.app_metadata.role`，但不可偽造 | **✅ 選用** |
| B: Auth Hook（custom_access_token_hook） | ✅ | 中（改 PG function） | 需 function | 不直接暴露 | ❌ 小群組維護 PG function 過度複雜（P2 排除） |
| C: env email 白名單（`NEXT_PUBLIC_`） | ⚠️ 前端可見但本場景非敏感 | 需重部署 | 無 | email 進 bundle | ❌ 重部署摩擦 + email 暴露（最簡單但有摩擦） |
| D: Postgres `profiles.role` 欄位 + RLS | ✅ | SQL 一行 | 需改表 + policy | 不直接暴露 | ❌ 本 change 不保護資料列、無 dev-only DB 資源，建表+policy 是過度工程（P1 排除） |
| E: 外部 IdP group mapping（Google Workspace groups） | ✅ | 改 IdP 設定 | 無 | 不暴露 | ❌ 適合企業 SSO，不符朋友小群組 + Google OAuth MVP（P3 排除） |
| ✗ `user_metadata` | ❌ 可被 client `updateUser` 改寫 | — | — | 暴露且可改 | ❌ **不可作授權/可信角色來源**（明確排除） |

> **M5 措辭修正**：方案 A 的 `app_metadata.role` 對**已登入者本人**透過 JWT/`getUser()` 是**可讀的**（並非「不暴露」），其安全性來自「不可偽造」而非「不可見」。本 change dev 標記非敏感資料，可見可接受。
>
> **選 A 而非 C（最簡單）的理由**：C 雖最簡，但 email 進 client bundle + 增減開發者需重部署；A 同樣一行 SQL、不可偽造、未來可無縫銜接 RLS（方案 D 的能力），對「固定小群組」不構成嚴重過度工程。Codex 方法審查獨立判斷亦接受 A 為較穩健選擇（8/10）。

### D4 — `useDevMode()` hook 放 `src/hooks/useDevMode.ts`

**決策**：建 client hook，內部 `createClient().auth.getUser()` + `onAuthStateChange` 訂閱，回傳 `{ isDeveloper: boolean, loading: boolean }`。

**依據**：REF-005「實作路徑」步驟 2 + `Navbar.tsx:21-34` 的 `getUser`/`onAuthStateChange` 既有模式（直接複用，避免重造）。

**回傳形狀 `{ isDeveloper, loading }` 是必要設計（REF-006 hydration 安全）**：`useDevMode` 內部非同步 `getUser()`，屬「只有 client 才知道」的資料。依 REF-006，依賴此類資料的 UI 在解析完成前必須 render 穩定值（`null`），否則 SSR 首 render 與 client hydration 首 render 不一致 → hydration mismatch。`loading` 旗標讓 `DevModeBanner` 在解析前 render `null`（兩端一致），解析後才切換。故 `loading` 非裝飾，是避免 mismatch + banner 閃爍的必要欄位。

> **注意（安全邊界）**：前端 `app_metadata` 讀取僅供 **UI 條件渲染**（顯示/隱藏 banner），非安全邊界。若未來有開發者專屬資料，須在 RLS policy 層用 `auth.jwt() -> 'app_metadata'`（REF-005 policy 範本 + REF-004 RLS）強制，前端旗標不可作為授權依據（REF-002 安全規則延伸）。本 change Phase B 只建 banner 容器、不接敏感資料，故前端 gating 足夠；此邊界於 Non-Goals 與後續 dev tools change 重申。

### D5 — `DevModeBanner` 接入 `layout.tsx`

**決策**：建 `src/components/DevModeBanner.tsx`（Client Component，內部用 `useDevMode`），放在 `layout.tsx` 全域位置（`FloatingDock` 旁；建議 body 頂部或 fixed bottom，具體位置 apply 時依視覺確認）。`loading || !isDeveloper` 時 render `null`（REF-006 hydration 安全：loading 在前，先排除未解析狀態）。

**依據**：REF-005「在 Layout 條件渲染開發者功能區塊」+ REF-006（hydration-safe 條件渲染）。`layout.tsx` 是已驗證的有效掛載點（`FloatingDock` 已在此正常運作），故 DevModeBanner 接入此處無 mount-context 風險（與 D2 的 AppSidebar 不同，見風險表）。

## Risks / Trade-offs

| 風險 | 影響 | 緩解 |
|---|---|---|
| **[M3 Critical 已接地]** `AppSidebar` 與 `Navbar` 皆未掛載於任何 page/layout（grep 全 src 確認）；唯一 live 登入入口是 `page.tsx` 的 mock 按鈕 | Task 2 修 `AppSidebar` 無 live 觸發路徑；spec Scenario 2 無法在現狀機械驗收（false-green 風險） | Task 2 標為 **latent 修復**；驗收前明確定義通過條件 = 「該元件被掛載且在 router context」。若 apply 時決定不掛載 AppSidebar，Scenario 2 標為「latent，待掛載後驗」並記入跳過項目表，不假裝勾選 |
| **[M3 衍生]** `AppSidebar` 加 `useRouter` 需在 router context 內 | runtime 失敗 | 因 AppSidebar 目前未掛載，此風險僅在掛載時觸發；Task 2.3 定義具體檢查（mount file + render path）；`Navbar` 既用 `useRouter`，App Router 全域可用 |
| **[M1 Critical 已接地]** Task 5 `raw_app_meta_data \|\| ...` 合併假設既有值非 null、型別正確、不破壞其他 metadata；無 rollback/驗證步驟 | 角色未進 JWT 或破壞既有 metadata，但 task 被勾選（false-green） | Task 5 補：設定前後 SELECT 查詢、rollback SQL、JWT/app_metadata 驗證步驟、記錄位置與「不提交真實 email」格式（見 tasks.md Task 5 改版） |
| `app_metadata` 變更後現有 JWT 到期（~1hr）前不更新 | 設成開發者後 banner 不立即出現 | 文件化「設定後須重新登入」；Task 5 step 註明（REF-005 caveat） |
| 前端旗標被誤當授權邊界 | 安全誤判 | D4 註明僅供 UI；本 change dev 功能不涉敏感資料（REF-005 評估可接受） |
| `getUser()` vs `getClaims()` 演進 | API 漂移 | apply 第一步版本校準（鎖 `@supabase/ssr` 版本，REF-002 caveat）；hook 沿用 `Navbar` 既有 `getUser` 模式保持一致 |
| DevModeBanner 依非同步 `getUser()` 首屏 | hydration mismatch / banner 閃爍 | `useDevMode` 回 `loading`；banner `loading` 時 render null（REF-006） |

## Open Questions

- DevModeBanner 視覺位置（top bar vs fixed bottom）→ apply 時依實際 UI 決定，不阻塞設計。
- 是否需要 `access_type: offline`（Google refresh token）→ 本 change MVP 不需要，沿用 Navbar 現狀（REF-003 caveat）。
