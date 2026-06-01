# 變更提案：開發者控制台與 UI 精緻化微調 (Developer Console & UI Refinements)

本提案旨在優化《Overwatch Social》網站的 UI 小細節，並建立高安全性的開發者後台，收納高階控制工具（對準儀）。

---

## 1. 動機與背景 (Motivation)

隨著專案核心功能（如名片、廣場、Supabase 整合）漸趨成熟，網站目前面臨以下兩個方向的優化需求：
1.  **使用者體驗與視覺微調 (UI Refinements)**:
    *   名片左下角的「語音狀態圖示 (Mic)」與「語言列表」在同一個行內容器中，當語言設定較多時，會產生擠壓甚至圖示覆蓋文字的尷尬情形。
    *   底部導覽列上的「LOTUS」浮水文字已完成其階段性任務，且現存的 4 顆按鈕（包含開放給一般使用者的對準儀）顯得有些擁擠。需精簡為 3 顆核心按鈕（首頁、名片廣場、個人檔案），提供清爽的手機與網頁版面。
2.  **開發者專用後台與高安全權限控制 (Developer Console & Whitelist Auth)**:
    *   目前用於微調英雄立繪縮放與位移的「對準儀 (Adjuster)」是一個十分強大的後台製程控制工具，不應直接暴露給一般訪客。
    *   我們需要建立一個專屬的「開發者控制台 (Developer Console)」，將對準儀等開發測試工具、系統管理與資料維護工具安全地收納其中。
    *   該後台需要具備嚴格的權限控管：採用 Google Login 登入，並搭配「資料庫 email 白名單」與 Postgres Trigger 機制，從根本上杜絕未授權存取。

---

## 2. 變更範疇 (Scope)

本變更依優先級分為三個階段 (P1, P2, P3)：

### 🟥 P1：核心 UI 精緻化 (優先處理)
*   **名片語音圖示位置調整**:
    *   將語音狀態從語言列表容器中分離。
    *   於名片右下角（MBTI 左側）設計一個精美的「語音狀態膠囊 (Mic Status Pill)」，提供 `可開麥`、`僅聽麥`、`不用麥` 的高辨識度膠囊標籤。
    *   擴大語言列表的顯示寬度，徹底消除文字與圖示重疊的 Bug。
*   **底部導覽列精簡**:
    *   完全移除導覽列上方的「LOTUS」浮水印字樣。
    *   將導覽列按鈕數由 4 顆縮減至 3 顆，僅保留：`首頁` (`/`)、`名片廣場` (`/browse`)、`個人檔案` (`/profile`)。
    *   微調導覽列的 Flex 布局與間距，確保在行動端與桌面端皆有完美的握持視覺感。

### 🟨 P2：開發者白名單與安全驗證
*   **建立白名單資料表**:
    *   在 Supabase 中建立 `developer_whitelist` 表，用於儲存開發者的 email。
*   **自動化 Role 指派機制 (Postgres Trigger)**:
    *   撰寫資料庫 Trigger。當使用者透過 Google OAuth 註冊或登入時，自動檢查其 email 是否存在於白名單表中。
    *   若相符，則直接更新其 `auth.users` 的 `raw_app_meta_data -> role` 為 `'developer'`。
    *   這能與前端現有的 `useDevMode` 完美接軌，同時保障後端 RLS 安全。

### 🟩 P3：開發者控制台與功能移轉
*   **開發者入口與路徑阻斷**:
    *   於「個人檔案`(/profile)`」頁面中，僅在 `isDeveloper` 為 true時展示「進入開發者後台」按鈕。
    *   建立 `/developer` 獨立控制台路由。在 Server Side 嚴格檢查使用者身份，非開發者直接觸發 Redirect 重新導向至首頁。
*   **對準儀功能移轉**:
    *   將現有的 `/adjuster` 頁面完全移轉至 `/developer/adjuster`。
    *   在對準儀的寫入 Action 中增加開發者角色校驗，防止偽造 API 請求。
    *   後台 Dashboard 提供系統開關、白名單成員維護等基礎管理 UI。

---

## 3. 開發優先級建議

*   **P1**: 語音圖示調整、移除 LOTUS 標籤、導覽列改為三按鈕。
*   **P2**: 建立 `developer_whitelist` 資料表、建立 Google Login 與 Postgres 自動白名單 Trigger 機制。
*   **P3**: 建立 `/developer` Dashboard、對準儀移轉至開發者後台、加入 Server-side 安全重導向。
