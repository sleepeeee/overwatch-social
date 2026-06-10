## Why

`developer-capture` 子系統會以使用者（developer 後台）觸發的方式呼叫 `git` 子程序統計每日提交（據點佔領 HUD）。「以後端呼叫 git 並把路徑/參數傳進去」是 command injection 的典型高風險面，值得一次正式安全審計並**固化**結論，避免未來重構時無意把安全寫法改壞（例如把 `execFile` 換成 `exec` 字串拼接、或把 `repositoryPath` 改成接 HTTP 表單輸入）。

**why now**：C1（DB 安全邊界）/ C2（型別邊界）已收斂應用層後端安全面，capture 的 shell 執行面是同一波後端硬化中**尚未被測試覆蓋**的最後一塊。目前 `tests/unit/developer-capture-meter.test.mjs` 只測「解析 / 聚合 / 計分」純函式，**完全沒有覆蓋 git 子程序呼叫的安全屬性**——一旦未來有人把 `execFile` 改成 `exec`，現有測試全綠、漏洞無聲上線。

**審計結論（team lead 手審 + sub-agent 讀檔 + 經驗探針三重確認）：無漏洞要修。** 現行程式碼已是安全最佳實踐：

1. **`src/lib/developer-capture/git.ts:102-118`** 用 `execFile`（`promisify(execFile)`，**非** `exec`）+ **參數陣列**呼叫 git：`execFileAsync("git", ["-C", repositoryPath, "log", ...])`。`execFile` 不經 shell，參數陣列不被 shell 解析 → **架構上無 command injection**。CLI 版 `scripts/recalculate-capture-meter.js:147-161` 採完全相同寫法。
2. **`repositoryPath` 來源 `src/lib/developer-capture/config.ts:52`**：`path.resolve(process.env.CAPTURE_REPO_PATH || process.cwd())`，來自**伺服器環境變數**（非 HTTP/表單使用者輸入），且 `config.ts:30-38` `assertSafeConfig()` 驗證必須為絕對路徑 → **非使用者可控、無路徑遍歷面**。
3. **`src/app/actions/developerCapture.ts`** 三個 server action（`saveCaptureDisplayNames` / `saveCaptureHudSettings` / `getCaptureStateSnapshot`）**完全不碰 shell**，純 DB/settings 操作；唯一外部輸入 `leftLabel` / `rightLabel` 只經 `normalizeLabel`（trim）寫入 settings JSON，**不進任何指令**。

> **經驗證據**：sub-agent 跑 `execFile("git", ["-C", "/nonexistent; touch SENTINEL; echo $(whoami)", "log", ...])`，git 報 `fatal: cannot change to '/nonexistent; touch SENTINEL; echo $(whoami)': No such file or directory`——把整串當**單一目錄名**，SENTINEL 檔**未被建立** → 證明字串未被 shell 解析、注入指令未執行。詳見 design.md「經驗探針」。

## What Changes

C3 範圍是 **audit 文件化 + regression 測試固化**，**不改動現有安全邏輯**（karpathy 外科手術原則）：

1. **新增 regression 測試** `tests/unit/developer-capture-git-safety.test.mjs`（核心交付），循 repo 既有 `node:test` 原生風格，固化三個安全屬性：
   - **(A) 靜態原始碼斷言**：讀 `git.ts` 原始碼，斷言 import 自 `node:child_process` 的是 `execFile`、**不含** `exec(`（裸 exec）/ `execSync` / `spawn` / `shell: true`，鎖死「不得退回字串拼接執行」。
   - **(B) 注入行為斷言（端對端真跑 git）**：餵含 shell metacharacters 的 `repositoryPath`（`/nonexistent_repo_$(whoami); touch <sentinel>` 與 `` /tmp/x`id` ``）給與 `git.ts:104` **逐字對齊**的 `execFile("git", ["-C", path, "log", ...])` 呼叫，斷言：(i) git 以非零碼失敗且 stderr 含該完整字串（證明被當單一路徑參數），(ii) sentinel 檔**未被建立**（證明 shell 未執行注入）。
   - **(C) config 路徑來源斷言**：斷言 `assertSafeConfig` 對相對路徑 `repositoryPath` 拋錯（鎖死「外部路徑須絕對路徑驗證」不被移除）。
2. **新增 spec capability `capture-git-safety`**：把上述三點 audit 結論文件化為可驗證需求（spec/capture-git-safety/spec.md）。
3. **新增 ADR-26**（待 ARCHIVE 正式建）：「子程序呼叫一律 `execFile` + 參數陣列（禁 `exec` / shell 字串拼接）+ 外部路徑來自 env 並驗證絕對路徑」作為專案 shell 執行安全準則。
4. **新增 F-027**（待 ARCHIVE）：記錄「audit 確認安全 → 用 regression 測試固化（characterization test）」這個 pattern，與「無測試覆蓋的安全寫法等同未受保護」的根因教訓。

> **PROPOSE 邊界**：本 change 只產出測試草案 + spec + ADR/Finding 草稿 + 驗收標準。**不改 `git.ts` / `developerCapture.ts` / `config.ts` 的任何既有邏輯**。Stage 6 第二意見（Codex §6.5）prompt 備於 design.md，待 team lead 並行發起（sub-agent 無法 spawn Agent，F-039；今日 Codex 額度滿，降級 Gemini）。

## Capabilities

### New Capabilities
- `capture-git-safety`: developer-capture git 子系統的 shell 執行安全能力——子程序以 `execFile` + 參數陣列呼叫（不經 shell）、`repositoryPath` 來自伺服器 env 並驗證絕對路徑、惡意 metacharacter 路徑被當單一字面參數而非執行。由 regression 測試固化。

## Impact

- **測試**：新增 `tests/unit/developer-capture-git-safety.test.mjs`。`package.json` `test:unit` 目前只跑單一檔案，需擴充為跑整個 `tests/unit/` 目錄（`node --test tests/unit/`），讓新測試納入 CI/本地 gate。**這是唯一的 source 改動，且僅動 npm script，不動任何 lib 程式碼。**
- **應用層**：**零程式碼變更**。`git.ts` / `developerCapture.ts` / `config.ts` 維持原狀（已是安全最佳實踐）。
- **驗收**：`npm run test:unit` 全綠（含既有 meter 測試 + 新 git-safety 測試）；新測試在「把 `execFile` 改成 `exec` 字串拼接」的假想破壞下會 FAIL（具防迴歸效力）。
- **ADR / Finding（待 ARCHIVE 正式建）**：ADR-26（execFile + 參數陣列 + env 絕對路徑準則）、F-027（audit-confirms-safe → characterization test 固化 pattern）。

## Related

- [[REF-027]] Node.js child_process：execFile vs exec 的 shell 解析差異與 OS command injection（item A/B 依據）
- [[ADR-04]] hero_alignments DB read + static fallback（同屬 developer 後台子系統的後端安全 pattern）
- [[F-004]] Vercel serverless 唯讀 filesystem（capture 子系統 fs 行為脈絡）
- [[ADR-26]]（待建）子程序呼叫一律 execFile + 參數陣列 + env 絕對路徑準則
- [[F-027]]（待建）audit 確認安全 → regression 測試固化 pattern
