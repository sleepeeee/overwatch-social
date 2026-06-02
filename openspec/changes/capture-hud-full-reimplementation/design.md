---
id: capture-hud-full-reimplementation
type: design
---

# Design: capture-hud-full-reimplementation

## Context

`developer_outpost_hud_plugin (4).html` 是 React（Babel standalone）實現的單頁設計稿，包含完整的 Git 佔領 HUD 系統。朋友的 Gemini 移植版（已回滾）遺漏約 30-40% 功能。本 change 以 HTML 原稿為規格，在現有 Next.js 架構上完整重建。

既有基礎設施（保留不動）：
- `lib/developer-capture/types.ts`：CaptureState / CapturePlayerStats 型別
- `lib/developer-capture/state.ts`：readCaptureState() 函式（Server Action 用）
- `app/actions/developerCapture.ts`：saveCaptureDisplayNames() Server Action

## Goals

- G1：4 個 Tab 完整實作（manual/exporter/spec/code），不可遺漏手冊 tab
- G2：StatCard 動態比例條（依真實 commits/additions/deletions 比率計算）
- G3：No Author 狀態含 git config 指令說明（可全選複製）
- G4：Error 狀態含 FORCE_RETRY_STATION_SYNC 按鈕
- G5：「真實資料」preset 使用 `initialState: CaptureState`（從 server 傳入）

## Non-Goals

- NG1：不修改 lib/developer-capture/（後端基礎設施）
- NG2：不加 Supabase 持久化（localStorage + Server Action saveCaptureDisplayNames 已足夠）
- NG3：不實作 git hook 的實際執行（只顯示腳本與說明）

## 架構決策

### D1：Component 結構

```
page.tsx (Server Component, 已還原至 6b0677e 版)
  └── CaptureHudAdjusterClient.tsx (Client Component, 本 change 新建)
```

page.tsx 在 server side 呼叫 `readCaptureState()` 取得真實資料，作為 `initialState` prop 傳給 Client Component。Client Component 管理所有 UI 狀態（preset, darkMode, leftPercent, names, repoOwner, activeTab）。

### D2：State 與 Preset 映射

6 個 preset：
| Preset | 資料來源 | display status |
|---|---|---|
| "live" | `initialState`（server 傳入）| 依 initialState.status 映射（見下方）|
| "winning" | PRESETS["winning"]（hardcoded）| "ready" |
| "neutral" | PRESETS["neutral"] | "ready" |
| "losing" | PRESETS["losing"] | "ready" |
| "noAuthor" | PRESETS["noAuthor"] | "no_author" |
| "error" | PRESETS["error"] | "error" |
| "custom" | 由 slider/name 計算 | "ready" |

**CaptureState.status → DisplayStatus 映射**（lib 型別 → UI 型別）：
```typescript
type DisplayStatus = "ready" | "no_author" | "error";
function mapStatus(s: CaptureState["status"]): DisplayStatus {
  if (s === "missing-config") return "no_author";
  if (s === "git-error") return "error";
  return "ready";  // "ready" | "neutral" 均映射為 ready
}
```
特別注意：lib 的 `"neutral"` 也映射為 `"ready"`（HUD 用 percent 決定視覺，不需獨立 neutral display state）。

### D3：StatCard 動態比例條

```typescript
// 依真實數值計算比例（非 50/50 hardcode）
const leftW = (leftVal / Math.max(leftVal + rightVal, 1)) * 100;
const rightW = (rightVal / Math.max(leftVal + rightVal, 1)) * 100;
```

### D4：localStorage 儲存策略（含 SSR 守衛）

**SSR 安全模式（Codex §6.5 C1 修正）**：Next.js SSR 階段 `window` 為 undefined，`useState` lazy initializer 讀 localStorage 會 `ReferenceError` 並造成 hydration mismatch。

正確模式：使用 **deterministic default（無 localStorage）+ useEffect 延遲讀取**：

```typescript
// ✅ 正確：SSR 安全
const [leftName, setLeftName] = useState<string>("你方");  // deterministic default

useEffect(() => {
  // 只在 client side 執行
  setLeftName(localStorage.getItem("outpost_leftName") || "你方");
  setRightName(localStorage.getItem("outpost_rightName") || "朋友");
  setRepoOwner((localStorage.getItem("outpost_repoOwner") as "left" | "right") || "left");
  const saved = localStorage.getItem("outpost_percent");
  if (saved !== null) setLeftPercent(parseInt(saved, 10));
  if (localStorage.getItem("outpost_leftName") || localStorage.getItem("outpost_percent")) {
    setPreset("custom");
  }
}, []);  // 只執行一次，hydration 後

// ❌ 錯誤：SSR 不安全（會 ReferenceError）
// const [leftName] = useState(() => localStorage.getItem(...));
```

- 讀取：組件 mount 後（useEffect）從 localStorage 讀取
- 寫入：handleSave() → localStorage.setItem + saveCaptureDisplayNames()
- **Server Action 範疇**：`saveCaptureDisplayNames({ leftLabel, rightLabel })` 只接受兩個參數（顯示名稱），這是該 Server Action 的簽章設計。repoOwner 和 percent 只存 localStorage（不傳 Server）
- **spec 同步說明**：spec「saveCaptureDisplayNames() 被呼叫」指的是「以 leftName/rightName 呼叫此 action」，Server Action 本身不儲存 repoOwner/percent，這不矛盾——spec 描述的是呼叫行為，不是 Server Action 的完整參數集

### D4a：Toast 通知設計

```typescript
const [toast, setToast] = useState<string | null>(null);

const showToast = (msg: string) => {
  setToast(msg);
  setTimeout(() => setToast(null), 3000);
};
```

Toast 渲染位置：`fixed bottom-5 right-5 z-50`，綠色背景，3 秒後自動消失。
觸發時機：copyToClipboard / downloadFile / handleSave / handleReset 呼叫後。

### D5：GIT_HOOK_SCRIPT 腳本 + 逸出規則

完整 bash+python 腳本，作為字串常數存在 Client Component 頂層。

**Critical 逸出規則（Gemini §6.5 C2）**：TypeScript template literal 內的 Bash 變數 `$VAR` 或 `${VAR}` 必須轉義為 `\${VAR}`，否則 TypeScript 編譯器視為 JS 插值並崩潰。範例：
```typescript
const GIT_HOOK_SCRIPT = `#!/bin/bash
RAW_LOGS=\$(git log --since="midnight" ...)   # 用 \$() 轉義
...
python3 - <<EOF
raw_data = """\${RAW_LOGS}"""               # 用 \${} 轉義
EOF`;
```

copyToClipboard() 使用 navigator.clipboard.writeText（fallback 到 execCommand）。

### D6：資源下載功能

- `downloadFile(content, filename, type)`：Blob + URL.createObjectURL + a.click()
- `downloadSVG(key)`：下載對應 SVG 字串
- `downloadProductionHTML()`：生成含當前 leftPercent/leftName/rightName 的獨立 HTML

## Risks / Trade-offs

| 風險 | 嚴重度 | 緩解 |
|---|---|---|
| initialState.status 映射（lib 用 "missing-config"/"git-error"，HTML 用 "no_author"/"error"）| Low | 明確映射：missing-config → "no_author"，git-error → "error" |
| navigator.clipboard 在非 HTTPS 環境不可用 | Low | fallback 到 document.execCommand("copy") |
| GIT_HOOK_SCRIPT 字串內含 ${} 模板字面量 | Low | 用 backtick 字串，模板內容用 \\$ 轉義或全程字串串接 |

## Rationale 表

| 選擇 | 依據 |
|---|---|
| 以 HTML 原稿為完整規格 | REF-015（HTML 設計稿分析）|
| 保留 lib/developer-capture 不動 | ADR-05（DB 端聚合架構決策，不影響 HUD UI） |
| 6 preset 含 "live"（真實資料） | 現有 readCaptureState() 提供此能力，HTML 無此 preset 但後端有 |
| StatCard 動態比例條 | REF-015（HTML 原稿行為規格）|
