## ADDED Requirements

### Requirement: Extensible CSS Theme Variables
系統必須定義動態 CSS 主題變數，支援透過在 `<html>` 載入特定風格 class 以無縫切換全站色彩與陰影。且主題架構必須保持高度可擴充性，支援未來直接透過 CSS 變數擴充新的風格主題。

#### Scenario: Apply Blueberry Yogurt Theme
- **WHEN** 系統在 `<html>` 標籤上載入 `theme-blueberry` class
- **THEN** 全站套用藍莓優格配色，主要背景轉為瓷盤白 `#F5F6F3`，字體轉為藍莓皮藍 `#2F3A55`，並載入柔和紙片投影。

#### Scenario: Apply Wild Herbs Theme
- **WHEN** 系統在 `<html>` 標籤上載入 `theme-botanics` class
- **THEN** 全站套用森系香草配色，主要背景轉為香草沙色 `#FAF6EF`，字體轉為橄欖深綠 `#4A5A3A`，並載入紙片浮雕陰影。

### Requirement: Interactive Theme Selection Panel
系統必須在 TopBar 原有月亮按鈕處，實作一個可展開的主題控制選單，提供多套明亮版風格主題與一鍵切換夜間版的選項。

#### Scenario: Toggle Theme Options
- **WHEN** 使用者點擊 TopBar 右上角的切換按鈕，並點選「森系香草」明亮主題
- **THEN** 系統立即切換為森系香草風格，更新 `<html>` 標籤的 class 為 `theme-botanics`。

### Requirement: Theme State Persistence and Hydration Protection
系統必須將使用者的風格與明暗選擇儲存至 `localStorage` 中，並提供客戶端 Hydration 防護機制，確保在 Next.js 下重新整理網頁時，介面不會產生 Hydration 報錯或嚴重的色彩跳閃。

#### Scenario: Recover Saved Theme on Reload
- **WHEN** 重新整理網頁且 `localStorage` 內記錄的主題為 `theme-blueberry`
- **THEN** 系統在客戶端掛載完成後自動在 `<html>` 套用 `theme-blueberry` class。
