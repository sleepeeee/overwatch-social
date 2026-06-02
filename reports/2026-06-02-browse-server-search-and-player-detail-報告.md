# 2026-06-02-browse-server-search-and-player-detail 歸檔報告

> 日期：2026-06-02
> Change：`browse-server-search-and-player-detail`
> Finding：F-005（status: confirmed）
> §6.7 審查：Gemini 兩輪（4/10 → 4/10 → Critical 全修 → PASS）
> 報告產生方式：/rsx:archive Step 6 自動生成

---

## Layer 1 — 30 秒速覽

**一句話結論**：廣場現在是一個真正的「交友」平台了——搜尋在資料庫層執行、點卡片有反應、可以看到玩家詳細資料。過程中修了一個設計缺陷：把聯絡方式放進公開 view 等於公告全世界你的 Discord，已修正為登入後才能看。

### 數字速查表

| 指標 | 數值 | 白話意義 |
|---|---|---|
| 新增路由 | 1 個（/player/[id]）| 點卡片終於有地方去了 |
| 搜尋從前端移到 DB | 100% | 玩家再多也不卡 |
| DB Migration | 2 個（007+008）| view 更新 + 隱私修正 |
| Gemini 審查輪數 | 2 輪 | 每輪都發現 Critical |
| 最終 Build 錯誤 | 0 個 | TypeScript 乾淨 |

### 決策速查

- ❌ 被關掉的路：social_channels 放進 public view → 任何機器人可爬取所有 Discord handle
- ✅ 被確認的路：authenticated user 直接查 profiles 表（新 RLS policy）
- ➡️ 下一步建議：e2e 測試覆蓋（Change C）

---

## Layer 2 — 完整報告

### A. 為什麼做這個

廣場是個「瀏覽型社群」而非「交友型社群」——可以看別人的卡片，但：
1. 搜尋是假搜尋（全部資料撈到瀏覽器再過濾）
2. 點卡片什麼都沒發生（沒有詳細頁）

這次實現了最基本的「交友」流程：找人 → 點開 → 看詳細資料 → 決定要不要聯絡。

### B. 最大的意外

**兩輪 Gemini 審查都給出 4/10**，都指向不同的 Critical 問題：

第一輪（Propose 階段）找到：social_channels 放入 public view，anon 可爬取。
→ 設計改為 authenticated 直接查 profiles 表，新增 RLS policy。

第二輪（Apply 後）同樣發現：migration 007 已把 social_channels 放入 view，view 是 anon 可讀的，所以還是有洩漏。
→ migration 008 DROP + 重建 view（移除 social_channels），RLS policy 允許 authenticated 讀 visible profiles。

這說明了一個重要教訓（F-005）：**Supabase view 對 anon 是透明的，放進 view = 公告全世界**。不要把私密欄位放入 anon 可讀的 view，即使有 UI 層的守門也沒用（UI 是假的，API 是真的）。

### C. 技術亮點

**搜尋 debounce + stale request**：
- 300ms debounce：用戶打字不會每個字都打 API
- 遞增計數器（requestCounterRef）：慢的請求回來時已被丟棄，不會覆蓋新結果

**Load More 分頁**：
- offset-based append，不需要 URL state
- `hasMore = newData.length === PAGE_SIZE`：簡單但偶爾會多顯示一次按鈕（可接受）

### D. 遺留的設計限制

役/server/mic 篩選在 client-side 執行（對已載入的 20 筆）。原因：英雄 role 需要 HEROES_CONFIG lookup，無法在 DB 層做。這意味著：如果同時開啟嚴格的篩選條件（例如只找「坦克 + Asia Server + 有開麥」），20 筆裡可能全被過濾掉，雖然 DB 有更多符合條件的玩家。

**解法**（未來）：把 server/mic 移至 DB 層（`.eq('server', ...)` + `.eq('mic_status', ...)`），英雄 role 過濾建一個 heroes_config DB table 或接受 client-side limitation。

### G. 技術索引

| 類型 | ID / 路徑 |
|---|---|
| Finding | F-005（Supabase view 隱私洩漏模式）|
| ADR | ADR-06（social_channels via authenticated direct query）|
| Migration | `007_public_profiles_social.sql`、`008_fix_social_channels_privacy.sql` |
| 新路由 | `src/app/player/[id]/page.tsx` |
| Commits | `0995fb3`（主實作）、`28ac7db`（Critical 修正）|
