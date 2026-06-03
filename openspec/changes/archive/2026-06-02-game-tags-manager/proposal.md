# Proposal：特色標籤管理系統

## 問題
玩家名片的特色標籤（如「#認真組排」、「#歡迎新手」）原本 hardcode 在 `mockPlayers.ts`，
無法透過後台管理，新增或移除標籤需要改程式碼並重新部署。

## 解法
建立 `game_special_tags` DB 表，由開發者後台管理，玩家在編輯名片時從 DB 動態讀取標籤列表。

## 範疇
- DB migration（game_special_tags 表 + RLS）
- Server Actions（CRUD）
- 開發者後台 `/developer/tags-manager` UI
- Profile 頁整合（從 DB 讀取標籤選項）

## 狀態：已完成實作並歸檔（2026-06-03）
