## Context

- **TopBar 冗餘入口與快捷性**：目前首頁右上角 TopBar 的「我的名片」功能（連結至 `/profile`）與底部 `FloatingDock` 重複，介面需要瘦身。同時，`/developer` 的入口未顯著曝露給具備開發者權限的帳戶。
- **名片大廳 (Browse) 視覺重構**：首頁的 Hero 區塊需要引入更具 Morning Sketch 藝術手稿感的排版。為了讓使用者能直觀比較「方案 A（雙欄雜誌）」與「方案 B（置中紙感卡片）」，需在代碼中同時實作這兩套 UI，並在前端提供一個方便的臨時 A/B 切換按鈕。

## Goals / Non-Goals

**Goals:**
- 在 `TopBar.tsx` 中刪除「我的名片」連結。
- 在 `TopBar.tsx` 整合 `useDevMode` 讀取 `isDeveloper`，若為 `true` 則在登入後顯示「開發者後台」按鈕，否則不顯示。
- 在 `src/app/browse/page.tsx` 中實作 A/B 兩套 Hero 佈局。
- 實作一個臨時的浮動切換按鈕，允許使用者在 Layout A 與 Layout B 間點擊切換。
- 使用 `localStorage` 儲存使用者的 Layout 偏好，確保頁面重整後仍維持選定狀態。

**Non-Goals:**
- 本次變更不涉及任何資料庫 Schema 或後端 API 異動。
- 不調整 `/developer` 開發者後台內部的實作細節。
- 非登入狀態下，不需進行 `isDeveloper` 的判定（維持原狀）。

## Decisions

### D1 — 臨時 A/B 切換狀態管理
- **決策**：在 `src/app/browse/page.tsx` 內部使用單一 `useState<"A" | "B">` 結合 `useEffect` 從 `localStorage` 初始化與同步狀態。
- **理由**：
  - 不需要將 A/B 切換狀態提升至全域 context，因為它僅作用於 `/browse` 頁面。
  - `localStorage` 可以簡單、低成本地跨頁面刷新保留使用者選擇，便於測試。

### D2 — Layout A/B 的佈局實作
- **決策**：在 `page.tsx` 中直接抽離 `renderHeroA()` 與 `renderHeroB()` 函數，並依據狀態進行條件渲染。
- **理由**：
  - 程式碼高度集中，非常適合在使用者確認最終方案後，以最小摩擦力「直接刪除」其中一個函數與狀態切換器，降低後續清理的成本。
- **佈局實作規劃**：
  - **Layout A (雙欄雜誌)**：
    - 使用 CSS Grid 或 flex-col md:flex-row 實現雙欄。
    - 左側放置 LOBBY DIRECTORY 標籤、多遊戲玩家招募大廳標題與溫潤引言。
    - 右側放置搜尋太空艙與遊戲分區切換 Tab 軌道。
  - **Layout B (置中紙感卡片)**：
    - 將上述所有元素收納在一個帶有柔和水彩與磨砂玻璃質感的卡片（使用 `bg-white/40 border border-[#8c7c6c]/20 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(140,124,108,0.05)]`）中。
    - 內部元素全部居中排版。

### D3 — 開發者按鈕安全度
- **決策**：直接從 `useDevMode()` Hook 獲取 `isDeveloper`，用來做前端 UI 按鈕的條件渲染。
- **理由**：
  - `useDevMode` 讀取 JWT 內的 `app_metadata.role`，這是由後端 Supabase 簽名且無法被前端偽造的。
  - 這雖然是前端 UI 顯示邏輯，但後端路由 `/developer` 亦具備獨立的 Server 端角色校驗（若非 `developer` 會跳轉或阻擋），符合「多層防禦」安全原則。

## Risks / Trade-offs

- **[Risk] Layout B 在行動端上可能顯得擁擠。**
  - *Mitigation*：Layout B 的卡片 padding 在小螢幕時設為 `p-4`，且當螢幕寬度小於 `sm` 時，卡片邊框可設定為無，使其在小螢幕時平滑退化為類似 Layout A 的無卡片結構。
- **[Risk] A/B 臨時按鈕阻擋下方 UI。**
  - *Mitigation*：將 A/B 切換按鈕做成固定定位（`fixed bottom-20 right-4`），並採用非常小且精緻的圓鈕設計，避免遮擋底部的 Floating Dock 或核心功能。
