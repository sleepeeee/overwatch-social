# Proposal: auth-topbar-unification

## Why（動機）

三個分頁（首頁 `/`、名片廣場 `/browse`、個人名片 `/profile`）的登入 UI 完全不同步：

1. **首頁**：有正確的右上角 TopBar（Google 登入 + 登入後「我的名片」/「登出」）
2. **名片廣場**：無 TopBar，有「登入狀態模擬」開關（測試殘留，讓任何人都能繞過 isLoggedIn 限制）
3. **個人名片**：無 TopBar，有「極致多合一入口網已啟用」badge（廢棄 UI），且存在嚴重的 mock user bug，導致 LoginModal 守門永遠不觸發

**Why Now**：平台即將上線（已部署 Vercel），真實用戶將開始登入使用。mock user bug 若不修復，所有用戶都能不登入就進入 /profile，但資料無法存入 DB。這是 P0 級別的功能性 bug，而非視覺問題。

## What Changes

1. **新建 `TopBar.tsx` 共用元件**：從 page.tsx 抽取登入/登出邏輯，三頁統一複用
2. **首頁**：改用 `<TopBar />`（邏輯不變，只重構）
3. **名片廣場**：加入 `<TopBar />`，移除登入狀態模擬開關
4. **個人名片**：加入 `<TopBar />`，移除「極致多合一」badge，移除三處 mock user

## Capabilities After Change

- 三個分頁右上角視覺和功能完全一致
- 未登入用戶進入 /profile → LoginModal 正確顯示（不可關閉）
- 已登入用戶可正常建立/儲存角色卡到 Supabase
- 名片廣場的 isLoggedIn 狀態完全由 Supabase auth 決定，不可手動覆寫

## Impact

- **影響範圍**：3 個頁面（page.tsx, browse/page.tsx, profile/page.tsx）+ 新增 1 個元件
- **資料庫**：無 schema 變更
- **安全性**：修復 auth 守門漏洞（profile mock user）
- **UI 破壞性**：零（TopBar 設計與現有首頁完全一致）

## Related REFs

- REF-001: page.tsx TopBar 基準實作
- REF-002: profile/page.tsx mock user bug 分析
- REF-003: browse/page.tsx 登入模擬開關問題
