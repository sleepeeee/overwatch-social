---
id: F-011
type: finding
title: 移除 getUser() 雙軌、只用 onAuthStateChange INITIAL_SESSION，消除 race condition；全事件不過濾為 Supabase v2 推薦做法
status: confirmed
confidence: high
references_to: [REF-004, ADR-11]
referenced_by: [ADR-11]
supporting_refs: [REF-004]
---

## 結論 / 數據

`auth-context-refactor` change 的實作驗證了兩個架構決策：

### 決策一：移除 getUser() 雙軌，只依賴 onAuthStateChange

原 REF-004 提案的 `AuthProvider` 包含 `getUser()` + `onAuthStateChange` 雙軌（REF-004 第 58-74 行）。實際實作選擇移除 `getUser()` 呼叫，改為只依賴 `onAuthStateChange` 的 `INITIAL_SESSION` 事件。

理由與影響：
- `getUser()` 與 `INITIAL_SESSION` 會在 mount 後幾乎同時 resolve，若 `getUser()` 先回來更新 state，隨後 `INITIAL_SESSION` 再次更新，產生兩次 setState → 閃爍 + race condition 風險
- Supabase v2 的 `onAuthStateChange` 保證在 `INITIAL_SESSION` 送出後才 resolve，因此移除 `getUser()` 不會遺漏初始 auth 狀態
- 實測（commit f662270）：TopBar、profile、browse 三個消費端均在首次 render 後正確取得 user state，無閃爍

### 決策二：全事件類型均更新 user state（不過濾 TOKEN_REFRESHED / USER_UPDATED）

原 REF-004 提案的事件過濾（只處理 SIGNED_IN / SIGNED_OUT / INITIAL_SESSION）在 §6.7 Gemini 審查中被標為 Major 問題（7.5/10 基準中的一個 Major）。

最終實作移除 `if (!["SIGNED_IN", "SIGNED_OUT", "INITIAL_SESSION"].includes(event)) return;` 過濾，全事件均執行 `setUser(session?.user ?? null)`。

影響：
- `TOKEN_REFRESHED`：每次 token 靜默刷新時同步更新 user reference，避免消費端持有 stale user object
- `USER_UPDATED`：用戶資料更新（email change 等）後 UI 即時反映
- `PASSWORD_RECOVERY` / 其他事件：安全面無負面影響，user 仍為有效 session user

Supabase v2 官方建議：不過濾 auth event，讓所有 session 狀態變化均同步至 Context。

## 與既有 REF 一致或矛盾

**REF-004 部分矛盾**（spec/impl 漂移，impl 比 spec 更健壯）：
- REF-004 第 58-75 行的 `getUser()` 雙軌實作未在本 change 採用
- REF-004 第 65-68 行的事件過濾邏輯未在本 change 採用
- REF-004 記錄的模式為「探索階段的候選方案」，本 Finding 記錄「通過 Gemini §6.7 審查後的最終採用方案」

建議後續可更新 REF-004 的範例代碼，或保留作對比（原始 vs 最終）。

## 對後續影響

1. **AuthContext 實作基準**：後續若有第二個 Provider（如 ThemeContext）需要 Supabase auth，應同樣採用單軌 onAuthStateChange + 不過濾事件的模式
2. **REF-004 更新建議**：REF-004 的代碼範例應更新為移除 getUser() 與事件過濾的版本，以免誤導後續實作
3. **測試基準**：已知 onAuthStateChange INITIAL_SESSION 在 SSR + Client hydration 場景中可正常觸發，無需 getUser() 兜底
