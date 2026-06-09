## Why

目前系統中僅預置了與特定英雄角色相關的特色標籤（如：槍神、奈米刀源氏）及少數基礎標籤。為了讓不分英雄角色的所有玩家在社交卡片上，能更容易依據各自的「遊玩習慣、社交偏好、上線時間段與遊玩心態」尋找契合的隊友，我們需要擴充並新增 12 個通用的特色標籤。

## What Changes

- 在 `game_special_tags` 資料庫表中，新增 12 個通用的特色標籤（包含模式、社交、時間、心態等類別）並為其配置合適的莫蘭迪風格顏色（Sage, Rose, Blue, Clay）。
- 新增 SQL Migration 檔案以在資料庫部署時自動插入這批通用標籤。
- 確保前台 [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 的編輯卡片區能正常讀取、呈現並讓玩家選取這些新標籤。

## Capabilities

### New Capabilities

- `generic-tags-support`: 提供通用標籤的資料庫擴充與前台編輯支援，允許玩家在鬥陣特攻卡片中選擇習慣模式、時間段與社交偏好的標籤。

### Modified Capabilities

<!-- 無 -->

## Impact

- **Database**: 影響 `game_special_tags` 資料表，需透過 Migration 批次新增 12 筆標籤資料。
- **Frontend**: 影響玩家個人檔案頁面 `src/app/profile/page.tsx` 中 OW 卡片的標籤編輯選取區，以及展示玩家卡片的組件 `src/components/OWCard.tsx`。
