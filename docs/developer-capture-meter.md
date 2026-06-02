# 開發者據點佔領插件

這個插件把兩位開發者當日 Git 產出轉成據點佔領率。後端只讀本機 Git repository，不呼叫 GitHub API，也不需要 GitHub token。

## 環境變數

```powershell
$env:CAPTURE_REPO_PATH="D:\AI\overwatch\overwatch-social"
$env:CAPTURE_STATE_PATH="D:\AI\overwatch\overwatch-social\data\developer-capture-state.json"
$env:CAPTURE_TARGET_REPOSITORY_URL="https://github.com/sleepeeee/overwatch-social"
$env:CAPTURE_TARGET_REPOSITORY_OWNER="right"
$env:CAPTURE_LEFT_NAME="Shadowmaster6g"
$env:CAPTURE_LEFT_GITHUB_URL="https://github.com/Shadowmaster6g"
$env:CAPTURE_LEFT_AUTHORS="Shadowmaster6g"
$env:CAPTURE_RIGHT_NAME="sleepeeee"
$env:CAPTURE_RIGHT_GITHUB_URL="https://github.com/sleepeeee"
$env:CAPTURE_RIGHT_AUTHORS="sleepeeee"
```

`CAPTURE_LEFT_AUTHORS` 與 `CAPTURE_RIGHT_AUTHORS` 可填 Git author name 或 email，多個值用逗號分隔。
`CAPTURE_TARGET_REPOSITORY_OWNER` 可填 `left` 或 `right`，目前主倉庫是 `sleepeeee/overwatch-social`，所以預設為 `right`。

## 手動重算

```powershell
npm run capture:recalculate
```

重算後會寫入 `data/developer-capture-state.json`，網頁插件讀取這份已結算狀態。

## Push 後自動重算

若伺服器使用 Git bare repository 接收推送，將 `scripts/post-receive-capture-meter.sample` 複製到該 bare repository 的 `hooks/post-receive`，更新路徑與 author 設定後給予執行權限。

若部署環境沒有 bare repository hook，可用伺服器排程執行 `npm run capture:recalculate` 作為備援。這仍然只讀本機 Git repository，不使用 GitHub API/token。
