## Context

在先前的多遊戲名片架構（鬥陣特攻、特戰英豪、英雄聯盟）視覺重設計中，名片編輯頁面 [src/app/profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 移除了舊有的單一遊戲編輯表單，卻在建構新 HUD 版面時，遺漏了「溝通語言 (languages)」的狀態編輯邏輯與 UI，導致玩家無法透過界面修改名片上的溝通語言。

## Goals / Non-Goals

**Goals:**
- 在 [src/app/profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 中補回「溝通語言」的複選編輯功能。
- 實裝最多選擇 3 個溝通語言的商業邏輯，並串聯 `setErrorMsg` 顯示提示。
- 整合語言按鈕組 UI 至玩家基礎設定區塊，維持 HUD 星空粒子主題的排版美學。

**Non-Goals:**
- 不修改後端 Supabase 結構，沿用現有 `profiles.languages` 欄位（`text[]`）。
- 不修改 Server Action 中對於 `languages` 的保存與讀取機制。

## Decisions

### 1. 使用 `@/data/mockPlayers` 的 `LANGUAGE_OPTIONS`
- **方案 A**：直接在 `profile/page.tsx` 中宣告語言選項。
- **方案 B（採用）**：導入 [src/data/mockPlayers.ts](file:///D:/AI/overwatch/overwatch-social/src/data/mockPlayers.ts) 內定義的 `LANGUAGE_OPTIONS`。
  - **原因**：避免重寫相同的靜態常數，保持資料來源單一且容易維護。

### 2. 透過多遊戲共用的 `setCard` 更新狀態
- **方案 A**：直接對 `setCardData` 做操作。
- **方案 B（採用）**：呼叫 `setCard` 狀態變更函式。
  - **原因**：當前編輯頁面會透過 `editingGame` 切換編輯狀態。使用 `setCard`（定義為 `editingGame === "ow" ? setCardData : ...`）可以自動相容未來可能擴展的多遊戲名片語言設定。

### 3. UI 整合至玩家基礎設定底部（與 MBTI 並排）
- **方案 A**：獨立一個 SECTION 放語言設定。
- **方案 B（採用）**：在玩家基礎設定內，將 MBTI 特質區塊改為雙欄 Grid，右側用來擺放溝通語言的膠囊按鈕組。
  - **原因**：MBTI 人格特質為單一下拉選單，在寬螢幕下右側留有空白。與語言選項並排可以充分利用空間，使排版更緊湊且平衡。

## Risks / Trade-offs

- **[Risk]** 行動版裝置（窄螢幕）下，語言膠囊按鈕可能會因為折行而撐開區塊高度。
  - **[Mitigation]** 採用 `flex-wrap`，並使用緊湊的 `gap-1.5`、`px-2.5 py-1.5` 與 `text-[10px]` 的小按鈕樣式，確保在各類螢幕下皆能美觀呈現。
