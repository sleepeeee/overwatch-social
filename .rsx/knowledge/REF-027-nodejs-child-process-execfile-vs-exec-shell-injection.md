---
id: REF-027
type: docs
title: "Node.js child_process：execFile vs exec 的 shell 解析差異與 command injection 防禦機制"
url: https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback
status: active
references_to: []
referenced_by: [ADR-26, F-027]
version: "24.x"
official: true
---

> DERIV 性質（衍生自 Node.js 官方文件 + C3 audit 實測驗證）。URL 指向官方 child_process API 文件。

## 摘要

Node.js `child_process` 模組提供多種子程序呼叫方式，其中 `exec` 與 `execFile` 的核心差異在於**是否啟動 shell**：

### exec — 啟動 shell（危險）

```js
// exec(command[, options][, callback])
exec("git -C " + repositoryPath + " log --since=" + since, callback);
```

- `exec` 實際執行：`/bin/sh -c "git -C <repositoryPath> log --since=<since>"`
- shell（`/bin/sh`）解析整個命令字串，所有 metacharacter 有語意：
  - `;`：命令分隔（POSIX）
  - `&&`、`||`：條件執行
  - `|`：管道
  - `$(...)` 或 backtick：command substitution（子程序替換）
  - `>`、`>>`：輸出重定向
- **結論**：若 `repositoryPath` 或 `since` 含惡意字元，shell 會解析並執行

### execFile — 不啟動 shell（安全）

```js
// execFile(file[, args][, options][, callback])
execFile("git", ["-C", repositoryPath, "log", `--since=${since}`, ...], options, callback);
```

- `execFile` 直接走 `execve(2)` syscall（POSIX）或等效的 `CreateProcess`（Windows）
- 命令名稱與每個參數作為**獨立的 argv 陣列元素**傳入 kernel，無 shell 介入
- shell metacharacter（`;`、`$()`、backtick 等）在 argv 元素內視為**字面字元**，不被解析
- git 進程接收到的是完整的、未修改的原始字串（如 `/valid/path; malicious`），把整串當成目錄名，找不到後回傳非零 exit code
- **結論**：外部輸入中的惡意字元無效，不會觸發 shell 命令執行

### 關鍵比較表

| 屬性 | `exec` | `execFile` |
|---|---|---|
| Shell 介入 | ✅ `/bin/sh -c "..."` | ❌ 直接 execve |
| Metacharacter 解析 | ✅ 有（`;`/`$()`/backtick/`|`）| ❌ 字面字元 |
| Command injection 風險 | 高（外部輸入拼接即漏洞）| 無（argv 陣列無 shell 解析）|
| 跨平台（Windows）| `cmd.exe /c "..."` | 直接 `CreateProcess` |
| 適用場景 | shell 管道 / globbing 必要時 | 一般子程序呼叫（**首選**）|

## 對專案的啟示

本專案的 developer-capture git 子系統（`src/lib/developer-capture/git.ts`）正確使用 `execFile` + `promisify`，C3 audit 透過靜態分析與行為測試確認無 command injection 漏洞。

**正確實作範本**（`git.ts` 現況）：

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

// 正確：execFile + 參數陣列
await execFileAsync(
  "git",
  ["-C", repositoryPath, "log", `--since=${since}`, "--pretty=format:...", "--numstat"],
  { encoding: "utf8" }
);
```

**違規範本**（禁止使用）：

```ts
import { exec } from "node:child_process";

// 違規：exec + 字串拼接 — shell metacharacter 會被解析
exec(`git -C ${repositoryPath} log --since=${since} --pretty=format:...`);
```

## 引用場景

- **[[ADR-26]]**：以本 REF 的機制差異為基礎，建立專案級 execFile + 參數陣列準則
- **[[F-027]]**：以本 REF 說明「為什麼 execFile 在 C3 測試中正確阻擋惡意路徑」

## 風險 / Caveat

**CVE-2024-27980（Windows .cmd/.bat shim）**：
Node.js 在 Windows 上以 `execFile` 呼叫 `.cmd` 或 `.bat` 副檔名的 shim 時，存在 argument escaping 漏洞（CVE-2024-27980，已在 Node.js v21.7.2 / v20.12.1 / v18.20.2 修補）。
本專案呼叫的是 `git`（PE .exe），**不是 .cmd shim**，此 CVE 不適用。
若未來使用 `.cmd` 包裝的工具（如某些 npm 全域工具在 Windows 以 `.cmd` 安裝），需確認 Node.js 版本已包含修補（v24.x 已含）。

**`path.isAbsolute` 只驗格式**：
`path.isAbsolute()` 確認字串是否為絕對路徑格式，但不驗路徑是否在允許範圍內，也不防 `path.resolve` 的遍歷（`path.resolve("/safe/base", "../../etc/passwd")` 回傳 `/etc/passwd`）。developer-capture 的安全邊界是「路徑來源為 server-controlled env var」（使用者無法控制），不依賴路徑合法性驗證。詳見 [[ADR-26]] N3。

## 延伸閱讀

- Node.js 官方文件：`child_process.execFile` https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback
- Node.js 官方文件：`child_process.exec` https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback
- CVE-2024-27980 advisory：https://nodejs.org/en/blog/vulnerability/april-2024-security-releases （Windows .cmd shim escaping）
