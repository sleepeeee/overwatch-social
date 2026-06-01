# Proposal: developer-console-backend

## Why

### B2（主因，生產故障）：對準儀 saveHeroAlignments 在 Vercel 靜默失敗

`src/app/actions/saveAlignment.ts` 的 `saveHeroAlignments` 使用 `fs.writeFileSync` 直接寫入 `src/data/heroAlignments.ts` 原始碼檔案。此方法在：
- **本地開發**：有效，Next.js HMR 自動重載。
- **Vercel 生產環境**：**完全失敗**——Vercel 的 serverless runtime 是唯讀 filesystem，`writeFileSync` 會拋例外並被 Server Action 的 `try/catch` 靜默吃掉，回傳 `{ success: false }`。使用者調整對準儀並儲存，生產端沒有任何變化，但也沒有任何錯誤提示。

**why now**（誠實定性：內部排序 + 生產故障修復）：
- B2 是已確認的 production bug，不是技術債。每次對準儀儲存在 Vercel 都是靜默失敗。
- `auth-ux-login-gate` 剛完成，auth UX 閉環，後台可用性是合理的下一步。
- `hero_alignments` 的 Supabase 方案在現有架構（REF-004 RLS 模式、REF-002 Server Action 模式）下有完整先例，實作成本可控。

### B1（搭乘，後台可信度）：Overview Tab 硬編碼假資料

DeveloperConsoleClient.tsx 的 Overview tab 顯示「Supabase Database Connection: 正常連線中」——這是硬編碼字串，沒有任何實際 DB ping。若 DB 斷線或環境變數錯誤，這個 badge 仍永遠顯示 "Online"。同時，「已登入用戶數」和「名片數」等統計完全缺失。

B1 的緊迫度低於 B2（不是生產 bug），但搭乘在同一 change 合理，因為：
- 都需要 Server Action 層的 Supabase 查詢
- 共享 `ensureDeveloper()` 守門模式
- **B1 的 PR 不依賴 B2 的 migration**，可獨立推進

**方法比較（B2）：**

| 方案 | 描述 | 選擇 |
|---|---|---|
| 最小修補（只改 write） | `saveHeroAlignments` 改寫 DB，前端繼續讀靜態 .ts | ❌ 不選：write 到 DB 但 front 讀靜態 → 存的值不被使用，等同虛功 |
| **完整方案**（write + read） | 建 `hero_alignments` 表，write 用 upsert，前端從 DB 讀 | ✅ 選用：存的值真正反映到前端，OWCard 已有 `customAlignments` prop + fallback 邏輯 |
| ORM / Edge Function | 複雜度過高 | ❌ |

## What Changes

- **`supabase/migrations/003_hero_alignments.sql`**（新建）：建 `hero_alignments` 表，RLS：公開讀 + `app_metadata.role=developer` 寫
- **`src/app/actions/saveAlignment.ts`**：移除 `fs.writeFileSync`，改為 Supabase upsert
- **`src/app/actions/developer.ts`**：加入 `getSystemStats()`，回傳真實 profile 計數
- **`src/app/developer/page.tsx`**：呼叫 `getSystemStats()`，傳給 DeveloperConsoleClient
- **`src/app/developer/DeveloperConsoleClient.tsx`**：Overview tab 顯示真實 `profileCount`，移除假 badge
- **`src/app/actions/alignment.ts`**（新建 Server Action）：`getHeroAlignments()` — 從 DB 讀取所有 `hero_alignments`，fallback 到靜態 `HERO_ALIGNMENTS`
- **`src/app/browse/page.tsx`**：useEffect 裡呼叫 `getHeroAlignments()`，傳給 OWCard `customAlignments`
- **`src/app/profile/page.tsx`**：同上

## Non-Goals

- 不做 `hero_alignments` 的 realtime subscription（對準儀是開發者工具，不需即時廣播）
- 不做 `auth.users` 總數統計（需要 service_role key，本 change 用 profiles 表代替）
- 不重構 `heroAlignments.ts` 靜態資料（保留作 seed 參考 + 本地開發 fallback）
- 不修改對準儀的 UI 操作邏輯（只改 save 和 load 的後端層）
