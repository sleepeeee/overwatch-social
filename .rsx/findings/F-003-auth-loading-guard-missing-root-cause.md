---
id: F-003
title: "authLoading guard 缺失是 auth UX 斷裂的根因：isLoggedIn 初始為 false 造成 LoginModal 閃現"
status: confirmed
change: auth-ux-login-gate
date: 2026-06-01
references_to: [REF-002, REF-006, ADR-03]
referenced_by: [ADR-03]
supporting_refs: [REF-002, REF-006]
---

## 結論 / 數據

- **根因**：`browse/page.tsx`（及同類頁面）未設 `authLoading` guard，導致 Supabase `onAuthStateChange` 尚未回傳前，`user` 為 `null`、`isLoggedIn` 初始為 `false`。在這段 async gap（通常 100-500 ms）內，已登入使用者會看到 LoginModal 或「未登入」狀態的 UI flash。
- **驗證方式**：Gemini §6.7 CONDITIONAL 審查（7.5/10）指出 `browse/page.tsx` 缺少 `authLoading` guard（M1 條目）；修補後 COUNCIL PROCEED。
- **修補路徑**：新增 `authLoading` boolean（`useAuth()` hook 回傳），在 `authLoading === true` 時對 LoginModal / gate-dependent UI 做 null guard，完全消除 flash。
- **比較前次 change**：`auth-fix-and-developer-role` 的 F-002 發現 dead component（Navbar/AppSidebar 未掛載）是結構性缺漏；本 F-003 揭示即使掛載正確，auth state race condition 也是獨立的斷裂點——兩者為正交問題。

## 與既有 REF 一致或矛盾

- **一致 REF-002**：REF-002 說明 `onAuthStateChange` 為 async，client component 初始 render 時 session 尚未確認。本 Finding 的 authLoading race condition 正是此機制的直接表現；修補方式（`authLoading` guard）符合 REF-002 建議的「先等 session 確認再 render 依賴 auth 的 UI」。
- **一致 REF-006**：REF-006 強調 `isMounted` guard 避免 hydration mismatch；`authLoading` guard 是同概念的延伸（非同步狀態確認前不 render 依賴狀態的 UI），兩者搭配才能同時防 hydration flash 與 auth flash。

## 對後續影響

1. **跨頁面規則**：任何新頁面若有依賴 auth 狀態的條件 UI（LoginModal、跳轉 guard、個人化內容），必須同時設 `isMounted` guard（REF-006）與 `authLoading` guard（REF-002），不可只設其一。
2. **hook 標準化**：`useAuth()` 應統一回傳 `{ user, authLoading }` 而非只回傳 `user`，讓 authLoading guard 成為 pattern 而非一次性修補。
3. **ADR-03 關聯**：LoginModal 共用元件的 `show` prop 設計中，`show={isMounted && !authLoading && !user}` 正是本 Finding 的落地方案（見 ADR-03）。
