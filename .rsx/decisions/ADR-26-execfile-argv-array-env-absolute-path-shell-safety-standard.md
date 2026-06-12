---
id: ADR-26
title: "子程序呼叫一律 execFile + 參數陣列（禁 exec/shell 字串拼接）+ 外部路徑來自 env 並驗證絕對路徑——專案 shell 執行安全準則"
status: Accepted
change: audit-developer-capture-injection
date: 2026-06-11
references_to: [F-027, REF-027]
referenced_by: [F-027]
---

## 決策

本專案的所有 Node.js 子程序呼叫（現有及未來）遵守以下三條安全準則：

1. **呼叫方式**：一律使用 `execFile`（或 `execFileAsync = promisify(execFile)`），**禁止**使用 `exec`、`execSync`（shell 字串拼接形式）、`spawn({ shell: true })`。
2. **參數傳遞**：所有命令參數以**獨立陣列元素**傳入，不得拼接進命令字串。
   - 合格：`execFile("git", ["-C", repositoryPath, "log", "--since=...", ...])`
   - 違規：`exec("git -C " + repositoryPath + " log --since=...")`
3. **外部路徑來源**：所有傳入子程序的路徑必須**來自 server-controlled 環境變數**（如 `process.env.CAPTURE_REPO_PATH`），並以 `path.isAbsolute()` 驗證格式，禁止接收使用者可控的字串直接傳入。

## 背景

`audit-developer-capture-injection`（C3）審計確認 developer-capture git 子系統（`src/lib/developer-capture/git.ts` 與 `scripts/recalculate-capture-meter.js`）已正確實作上述三條準則，無 command injection / 路徑遍歷漏洞。審計結果為「無需修漏洞」，但揭示了缺乏書面準則與 regression 測試的隱患——安全寫法若無測試覆蓋，未來重構可能在不知情下破壞安全屬性。

本 ADR 將審計確認的安全模式提升為**專案級明文準則**，搭配 `tests/unit/developer-capture-git-safety.test.mjs` 的 regression 測試形成制度性保護。

## 現況（審計確認）

```ts
// src/lib/developer-capture/git.ts（合格範例）
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

await execFileAsync(
  "git",
  ["-C", repositoryPath, "log", `--since=${since}`, "--pretty=format:...", "--numstat"],
  { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 }
);
```

```ts
// src/lib/developer-capture/config.ts（合格範例）
repositoryPath: path.resolve(process.env.CAPTURE_REPO_PATH || process.cwd()),
// assertSafeConfig() 內：
if (!path.isAbsolute(config.repositoryPath)) {
  throw new Error(`CAPTURE_REPO_PATH must be absolute, got: ${config.repositoryPath}`);
}
```

## 技術原理

`execFile` 在 POSIX 系統走 `execve(2)` syscall，**不啟動 shell**，因此外部輸入中的 `;`、`&&`、`|`、`$(...)`、backtick 等 shell metacharacter 不會被解析——git 進程把整個路徑字串視為單一目錄名，找不到此路徑而回傳非零 exit code，不執行任何注入命令。

`exec` 則走 `/bin/sh -c "..."` 字串展開，shell metacharacter 在拼接後具有完整語意，是 command injection 的直接來源。

詳細機制見 [[REF-027]]。

## 考量選項

### 方案 A（採用）：execFile + 參數陣列 + env 路徑

- 不啟動 shell，argv 陣列逐字傳入 kernel，無拼接面
- server-controlled env var 是最強的 path source 控制邊界
- `path.isAbsolute` 驗證路徑格式，防止相對路徑遊走（`../../etc/passwd` 形式）

**採用。**

### 方案 B（否決）：exec 字串 + 手動 escape

- 依賴 shell escape 函式（如 `shellQuote`、`shlex.quote`），escape 函式實作錯誤或漏考慮平台差異會靜默失效
- Windows / PowerShell 的 escape 規則與 POSIX 不同，跨平台風險高
- 本專案有 Windows 開發環境（Windows 11），風險不可接受

**否決。**

## Footnotes（來自 Gemini §6.5 對抗式審查，C3 特有邊界說明）

**N1：UNC 路徑（`\\\\host\\share`）**
Windows UNC 路徑（`\\host\share`）通過 `path.isAbsolute()` 檢查（Node.js 在 Windows 視為絕對路徑），因此僅靠 `isAbsolute` 無法排除網路路徑。在 Vercel serverless 環境中 UNC 路徑無實際攻擊面（沒有 SMB 掛載），但若未來在 VM / bare metal 環境部署，應額外驗證路徑不以 `\\` 開頭，或改用白名單前綴檢查。

**N2：CVE-2024-27980（execFile Windows .cmd/.bat argument escaping）**
CVE-2024-27980 影響 `execFile` 在 Windows 上呼叫 `.cmd` 或 `.bat` shim 時的 argument escaping。本專案呼叫的是 `git`，在本機 Windows 環境中為 PE 可執行檔（`git.exe`），**不是 .cmd shim**，因此 CVE-2024-27980 **不適用**。若未來切換到 Windows 上以 `.cmd` 包裝的 git 發行版，需重新評估。

**N3：`path.isAbsolute` 驗證路徑格式，非路徑合法性**
`path.isAbsolute(p)` 只確認路徑字串的**格式**是絕對路徑（不是相對路徑），不驗證路徑是否存在、是否在允許範圍內、是否包含 `..` 遍歷。`path.resolve()` 同樣不防路徑遍歷（`path.resolve("/safe/base", "../../etc/passwd")` 回傳 `/etc/passwd`）。developer-capture 的安全邊界是**路徑來源**（server-controlled env var），而非路徑合法性驗證——env var 由部署者設定，使用者無法控制，因此路徑遍歷攻擊面不存在。若未來有任何使用者可控的路徑輸入，需加 `path.resolve` + 前綴白名單雙重驗證。

## Regression 測試保護

`tests/unit/developer-capture-git-safety.test.mjs`（12/12 pass，2026-06-11）：
- **(A) 靜態斷言**：`git.ts` 與 `recalculate-capture-meter.js` 均包含 `execFile` import、均不含 `execSync`/`spawn`/`shell:true`/裸 `exec(`
- **(B) 行為斷言**：餵含 `;`（POSIX 命令分隔）與 `$()`（command substitution）的惡意路徑 → `execFile` 正確 reject（git 找不到路徑），sentinel 檔案未被建立，證明無 shell 執行
- **(C) 靜態斷言**：`config.ts` 仍有 `CAPTURE_REPO_PATH` + `path.isAbsolute` 守衛；`developerCapture.ts` 不碰 `repositoryPath`/`child_process`/`git`

防迴歸驗證：將 oracle 暫換成 `exec("git -C " + path + " ...")` 字串拼接形式，測試 (A)(B) 正確 FAIL，sentinel 被建立——證明測試有實際防護力。

## 對後續開發的影響

- **新增子程序呼叫**：任何新增 `child_process` 使用，PR review 需確認：(1) 使用 `execFile`；(2) 參數為陣列；(3) 路徑來源可溯源至 server-controlled 環境。
- **靜態斷言更新**：若未來新增其他合法 `child_process` 使用點，需更新 `developer-capture-git-safety.test.mjs` 的 (A) 斷言邏輯，避免誤判。
- **Windows 部署注意**：見 N2（CVE-2024-27980 + .cmd shim 風險）。

## 相關 Finding / REF

- [[F-027]]：audit-confirms-safe → characterization test 固化 pattern（本 change 的核心 finding）
- [[REF-027]]：Node.js `child_process` execFile vs exec shell 解析機制（技術背景）
