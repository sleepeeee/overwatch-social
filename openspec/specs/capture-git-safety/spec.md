# capture-git-safety Specification

## Purpose
TBD - created by archiving change audit-developer-capture-injection. Update Purpose after archive.
## Requirements
### Requirement: git 子程序以 execFile + 參數陣列呼叫，不經 shell

developer-capture 子系統呼叫 `git` 統計提交時 SHALL 使用 `node:child_process` 的 `execFile`（或 `promisify(execFile)`）並以**參數陣列**傳遞所有 git 旗標與路徑；SHALL NOT 使用 `exec` / `execSync` / 帶 `shell: true` 的 `spawn` / 任何把使用者或環境衍生值拼接進單一指令字串的形式。`repositoryPath` SHALL 以 `-C <path>` 的獨立陣列元素傳入，使其被 git 當作單一字面路徑參數。

> **決策依據（ADR-26）**：`execFile` 不啟動 shell，參數陣列各元素不經 shell word-splitting / 變數展開 / 指令替換，因此即使路徑含 shell metacharacters（`;` `|` `$()` `` ` `` `&&`）也不會被解譯為指令。這是 OS command injection 的架構級防線，比「跳脫字元」更可靠。現行 `src/lib/developer-capture/git.ts:104` 與 `scripts/recalculate-capture-meter.js:148` 皆已符合；本需求以 regression 測試**固化**，防止未來重構退回字串拼接。

#### Scenario: git.ts 原始碼使用 execFile 而非 exec

- **WHEN** regression 測試讀取 `src/lib/developer-capture/git.ts` 原始碼
- **THEN** 原始碼 SHALL 從 `node:child_process` import `execFile`
- **AND** 原始碼 SHALL NOT 包含裸 `exec(` / `execSync` / `spawn(` 呼叫，亦 SHALL NOT 包含 `shell: true`

#### Scenario: 含 shell metacharacter 的路徑被當單一字面參數，注入不執行

- **WHEN** 以 `execFile("git", ["-C", "/nonexistent_$(touch <sentinel>); echo x", "log", ...])`（與 `git.ts` 逐字對齊的呼叫形式）執行
- **THEN** git SHALL 以非零退出碼失敗，stderr SHALL 包含該惡意路徑字串（前段即可，部分匹配以跨 git 版本穩定；證明被當單一目錄名）
- **AND** sentinel 檔 SHALL NOT 被建立（證明 shell 未執行被夾帶的 `touch` 指令）

### Requirement: repositoryPath 來自伺服器環境變數並驗證為絕對路徑

`repositoryPath` SHALL 衍生自伺服器端環境變數 `CAPTURE_REPO_PATH`（fallback `process.cwd()`），SHALL NOT 接受 HTTP 請求 / 表單欄位 / server action 參數作為來源。`getCaptureConfig()` 在組態組成後 SHALL 透過 `assertSafeConfig()` 驗證 `repositoryPath` 與 `statePath` 為**絕對路徑**，否則拋錯拒絕啟動，杜絕相對路徑造成的路徑遍歷或誤讀。

> **Threat model 邊界（Gemini §6.5 補充）**：本需求防護對象為 authenticated HTTP / server action 層——確保一般使用者（含 developer 角色）無法經應用層控制 git 目標路徑。`CAPTURE_REPO_PATH` 環境變數屬**伺服器端組態**，若被竄改即屬 infra-level compromise（伺服器已被控），超出本 change 防護範疇。另注意 `path.isAbsolute` 驗證的是路徑**格式**而非合法性（UNC `\\host\share` 與 `path.resolve` 消解後的遍歷路徑皆通過），於 Vercel 託管環境無實際攻擊面（詳見 ADR-26 footnote N1/N3）。

#### Scenario: 相對路徑的 repositoryPath 被拒

- **WHEN** `assertSafeConfig` 收到 `repositoryPath` 為相對路徑（如 `"../some/repo"`）的組態
- **THEN** SHALL 拋出錯誤（訊息指明必須為絕對路徑），不繼續執行 git

#### Scenario: server action 不接受 repositoryPath 作為輸入

- **WHEN** 檢視 `src/app/actions/developerCapture.ts` 的三個 server action 簽章
- **THEN** 其輸入 SHALL NOT 含 `repositoryPath` / 任何路徑欄位（僅 `leftLabel` / `rightLabel` / HUD 顯示設定），使外部呼叫端無法注入 git 目標路徑

### Requirement: 標籤類外部輸入不流入子程序

developer-capture server action 接受的外部字串輸入（`leftLabel`、`rightLabel`）SHALL 僅經正規化（trim）後寫入 settings 持久層，SHALL NOT 被傳入任何 `git` 呼叫的參數或指令字串。

#### Scenario: 顯示名稱只進 settings，不進 git 指令

- **WHEN** `saveCaptureDisplayNames` / `saveCaptureHudSettings` 處理 `leftLabel` / `rightLabel`
- **THEN** 該值 SHALL 僅經 `normalizeLabel`（trim）寫入 capture display settings
- **AND** SHALL NOT 出現在 `readTodayGitAuthorStats` 的 git 參數陣列中（git 參數僅含 `-C` / `log` / `--since` / `--pretty` / `--numstat`）

