# Proposal: browse-quality-fixes

## Why

批評信（REF-007）指出名片廣場有 4 個品質問題，直接影響使用者信任感：

1. **VAL/LoL 假卡片**：點進去看到完整的假玩家卡片（名字、訊息、MBTI 都寫好），用戶不知道這是假資料，誤以為找到了真實的 Valorant / LoL 玩家
2. **Dead Code 博物館**：Navbar.tsx 和 AppSidebar.tsx 有完整的登入/登出邏輯，但從來沒有被掛上去，只是靜靜躺在資料夾裡
3. **Mock 資料靜悄悄頂替真實資料**：Supabase 失敗或空資料時，廣場默默換成假玩家，使用者完全不知道自己在看假人
4. **useDevMode 重複 auth 訂閱**：AuthContext 已有全域 onAuthStateChange，useDevMode 另外開了一個，消耗資源且不一致

**Why Now**：測試名片（星辰指引者#8847）已成功插入，廣場有了第一筆真實資料。現在是修正假卡片問題的最佳時機——真假並排更清晰地說明問題的嚴重性。

## What Changes

1. **刪除 Navbar.tsx + AppSidebar.tsx**：確認無任何 import 後直接刪除
2. **OverwatchSquare.tsx**：加入 `isShowingMockData` state，連線失敗或空資料時顯示提示條
3. **useDevMode.ts**：移除獨立 onAuthStateChange 訂閱，改用 `useAuth()` 讀取 user

> **注意**：VAL/LoL 假卡片暫時保留（當前作為測試用途），不在本 change 範疇。

## Capabilities After Change

- Dead code 清除，維護負擔降低
- 廣場在示範模式時有明確告知，真實資料出現後自動消失
- auth 訂閱從 3 個減少到 2 個（AuthContext + TopBar 的 Google login 動作）

## Impact

- **破壞性**：零
- **刪除文件**：2 個（Navbar.tsx、AppSidebar.tsx）
- **修改文件**：2 個（OverwatchSquare.tsx、useDevMode.ts）

## Related REFs

- REF-007: 7 大品質問題完整審計
- REF-001: auth pattern（useAuth 基準）
