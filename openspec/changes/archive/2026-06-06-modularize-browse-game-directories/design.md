## Context

玩家展示館應該像世界地圖，只負責讓玩家選擇進入哪個遊戲專區。每個遊戲專區才是副本本體，擁有自己的搜尋、伺服器、定位、語音與卡片列表。

## Target Shape

```text
/browse
  Browse page shell
    - 標題
    - 管理我的特工帳戶
    - 星系 / 遊戲選擇

src/components/browse/overwatch/
  OverwatchDirectory
    - OW 搜尋
    - OW 伺服器
    - OW 常用定位
    - OW 語音溝通習慣
    - OW 名片列表
```

## Decisions

### 1. 外層只選遊戲

外層不再提供搜尋與伺服器選項，避免與各遊戲內層專區重疊。

### 2. OW 專區隔離

OW 專區使用獨立資料夾與獨立 config。未來 Valorant / League 可以建立各自專區，不需要改 OW 檔案。

### 3. 視覺主題

OW 專區篩選必須使用新版曜石暗夜星河主題：

- 背景：`bg-black/40` 或深色玻璃
- 邊框：`border-white/[0.08]`
- 文字：`text-zinc-200`
- 選中：`auroraMint` 紫光
- 高度：搜尋、select、button 統一固定高度

### 4. 背景與 Logo

`after_midnight (5).html` 是 Logo / 背景動態來源。只替換背景與 Logo 部分，不重寫其他功能。

### 5. 工作室守門

本機開發不應強制自動登入，否則使用者無法檢查未登入守門畫面。Dev mock login 必須改為環境變數開關。
