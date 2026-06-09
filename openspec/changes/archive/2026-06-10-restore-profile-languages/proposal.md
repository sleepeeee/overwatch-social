## Why

使用者在設定名片的頁面（`profile/page.tsx`）中發現「常用語言」設定區塊不見了，導致無法調整個人名片的語言屬性。此變更旨在該頁面補回語言設定 UI 與控制邏輯，讓玩家能正常設定並發布自己的溝通語言，以便在交友廣場上更精準地與志同道合的特工組隊。

## What Changes

- **名片編輯頁面補回語言設定**：在 [src/app/profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 重新導入 `LANGUAGE_OPTIONS`，並在「玩家基礎設定」區塊中加上溝通語言的複選按鈕（與 MBTI 人格特質並排展示為雙欄）。
- **實裝語言選擇限制**：新增 `handleToggleLanguage` 狀態變更函式，確保使用者選擇的溝通語言最多不超過 3 個，並提供剩餘個數計數器，維持卡片底部排版視覺美感。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `profiles`: 規範特工個人名片的資料欄位，補齊名片編輯頁面對於 `languages` 欄位的複選修改能力與 3 個上限的檢驗。

## Impact

- **受影響頁面**：特工個人名片編輯頁面 `src/app/profile/page.tsx`。
- **後端與 API**：不影響。名片儲存 Action `saveProfile` 已有處理並限制語言最多 3 個。
