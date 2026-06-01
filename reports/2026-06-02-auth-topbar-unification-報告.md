# 2026-06-02-auth-topbar-unification 歸檔報告

> 日期：2026-06-02
> Change：`auth-topbar-unification`
> Finding：F-001（status: confirmed）
> §6.7 審查：Gemini 5/10 → Critical 全修，PASS-WITH-WARNINGS
> 報告產生方式：/rsx:archive Step 6 自動生成

---

## Layer 1 — 30 秒速覽

**一句話結論**：我們發現三個頁面的登入狀態是各自為政的，最嚴重的問題是「個人名片頁假裝用戶永遠已登入」，修復後用戶現在必須真的登入才能建立角色卡，資料才能真正存進資料庫。

### 數字速查表

| 指標 | 數值 | 白話意義 |
|---|---|---|
| 修改頁面數 | 3 個 | 首頁、名片廣場、個人名片三頁同步 |
| 新增元件 | 1 個（TopBar.tsx）| 登入/登出按鈕從此集中管理 |
| 移除 mock user 處 | 3 處 | 三個假冒用戶殘留全數清除 |
| §6.7 Critical 問題 | 2 個 → 0 個 | 審查發現 2 個嚴重 bug，全部修完才推送 |
| 構建錯誤 | 0 個 | 兩次 build 都乾淨通過 |

### 決策速查

- ❌ 被關掉的路：不能繼續用 mock user 讓「任何人不登入也能進名片頁」
- ❌ 被關掉的路：browse 頁的「登入狀態模擬開關」（開發測試的殘留，已刪除）
- ✅ 被打開/確認的路：TopBar 統一設計確認可行；LoginModal 守門在修復後正確運作
- ➡️ 下一步建議：開一個新的 `auth-context-refactor` change，把分散在三個頁面的 auth 訂閱統一搬到 layout 層

---

## Layer 2 — 完整報告

### A. 為什麼做這個

**前因**：用戶反映三個分頁的右上角登入 UI 完全不一樣——首頁有 Google 登入按鈕，名片廣場有奇怪的「登入狀態模擬」開關，個人名片頁根本沒有登入按鈕而且標著「極致多合一入口網已啟用」這個神秘文字。

**這次要回答的問題**：如何讓三個頁面的登入 UI 一致，以及個人名片頁為什麼「不登入也能進去用」？

**為什麼重要**：平台已部署到 Vercel（https://overwatch-social.vercel.app），真實用戶開始使用。一個「登入守門失效」的頁面等於讓所有人都能點「儲存名片」，但資料庫拒絕存入（server 端有檢查），用戶會看到靜默失敗，不知道為什麼角色卡存不了。

### B. 白話版方法

這個問題就像「大門口的保全根本沒在工作」：

- **保全**（LoginModal）站在門口，條件是「這個人沒有登入的話擋下來」
- **問題**：有人事先在登記本上寫了一個假名字（mock user），讓保全以為每個人都已登入了
- **解法**：把假名字從登記本上擦掉，讓保全真的去驗證來訪者身份

技術上的三個步驟：
1. 把 `user` 的初始值從「假用戶物件」改成 `null`（沒有人）
2. 把 `authLoading` 初始值從 `false` 改成 `true`（先等確認，別急著開門）
3. 把三處「如果 Supabase 沒回傳用戶就用假用戶」的 fallback 全部移除

### C. 結果翻譯

**預期**：修復後，直接開 `/profile` 頁面（未登入）應該看到「請登入」彈窗。

**實際**：符合預期，LoginModal 正確顯示，且按 Google 登入後可正常填寫並儲存名片。

**§6.7 審查意外發現**（Gemini 5/10）：除了 mock user 問題，審查還找到了兩個「更深層」的 bug：

1. **登出時序問題**：原本程式碼是「先告訴瀏覽器跳頁，再執行真正的登出」，就像還沒確認客人走出去就關了門——如果登出失敗（網路問題），客人名義上已登出但 server 上 session 還在。修復：先等登出完成，再跳頁。

2. **競態條件**（race condition）：有個罕見情況：Supabase 正在查詢「我現在是否登入」的過程中，如果 session 恰好到期，會發生「已登出的訊號先到，但查詢結果比較慢才到、帶著舊資料」的衝突。修復：加入「元件已卸載就不更新狀態」的防護。

這兩個問題在日常使用中觸發機率不高，但影響嚴重，因此審查後立即修復再推送。

### D. 決策地圖

面臨的選擇：TopBar 放哪裡？

```
三種方案：

方案 A（選擇）：TopBar.tsx 獨立元件，各頁面 import
  優：實作快，範圍小，只改壞掉的地方
  缺：三個頁面各有一份 auth 訂閱（架構不理想）

方案 B：放進 layout.tsx（所有頁面的共同容器）
  優：一份訂閱，最乾淨
  缺：layout.tsx 是 Server Component，auth 訂閱需要 Client 才能跑
      需要額外的 wrapper 元件，改動範圍更大

方案 C：AuthContext（React Context API）
  優：完美解法，auth state 集中管理
  缺：需要同時改所有頁面的 state 管理，改動最大

決策：選方案 A，因為這個 change 定義為「修 bug」不是「重構架構」
架構 debt 記錄在 ADR-02，由後續 auth-context-refactor change 處理
```

### E. 產品影響

本 change 直接影響用戶的核心流程：

**修復前**（有問題）：
```
用戶打開 /profile → 頁面直接顯示（不問登入）
用戶填資料 → 按「儲存」→ server 拒絕（靜默失敗）
用戶不知道為什麼資料沒存到
```

**修復後**（正確）：
```
用戶打開 /profile（未登入）→ LoginModal 彈出 → 用戶 Google 登入
用戶登入後 → 填資料 → 按「儲存」→ 資料存入 Supabase → 成功
```

這是角色卡功能可以真正上線的前提。

### F. 流程復盤

**耗時估算**：
- Explore：15 分鐘（codebase 掃描）
- Propose：30 分鐘（4 artifacts + 3 REFs）
- Apply：40 分鐘（實作 + Critical 修復）
- Archive：20 分鐘（F-001 + ADR-02 + report）
- **合計**：約 1.5 小時

**遇到的問題**：

1. **Codex §6.7 審查未回傳有效結果**：Codex rescue agent 執行但只輸出「仍在執行中」，依 §6.8 軟降級改以 Gemini 為主審。Gemini 回傳了詳細 5/10 的分析。

2. **sed 命令修改 tasks.md 後 Edit 工具無法匹配原始字串**：用 Bash sed 直接改，繞過 Edit 工具。

3. **`openspec archive` 非阻塞 Warning**：proposal.md 的 section header 用「## Why（動機）」而非純「## Why」，openspec 驗證時給出 warning（非 blocking），archive 仍成功。後續寫 proposal 時注意 header 格式用純英文。

**工作流改善建議**：
- proposal.md 的 `## Why` 和 `## What Changes` header 不要加中文括號，避免 openspec 驗證 warning
- `authLoading` 初始值 `true` 應該作為專案 coding guideline 記錄（mock scaffold 清除前必確認）

### G. 技術索引

| 類型 | ID / 路徑 |
|---|---|
| Finding | F-001（`.rsx/findings/F-001-auth-guard-mock-user-failure.md`）|
| ADR | ADR-02（`.rsx/decisions/ADR-02-topbar-as-shared-client-component.md`）|
| REF | REF-001, REF-002, REF-003（`.rsx/knowledge/`）|
| OpenSpec change | `openspec/changes/archive/2026-06-01-auth-topbar-unification/` |
| Commits | `e211813`（主實作）、`0a1a8c1`（Critical 修復）|
| 新增元件 | `src/components/TopBar.tsx` |
| 修改頁面 | `src/app/page.tsx`、`src/app/browse/page.tsx`、`src/app/profile/page.tsx` |
| 後續建議 | `auth-context-refactor`（AuthContext 重構）|
