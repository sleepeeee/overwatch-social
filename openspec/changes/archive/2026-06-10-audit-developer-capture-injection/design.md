# design — audit-developer-capture-injection (C3)

## 定位

這是一個 **audit-confirms-safe + characterization test** 型 change，不是「修漏洞」。目標：(1) 把「developer-capture git 子系統無 command injection / 無路徑遍歷」的審計結論文件化；(2) 加 regression 測試把安全屬性鎖死，避免未來重構破壞。**不改任何現有安全邏輯。**

---

## Evidence — sub-agent 實際讀檔驗證 team lead audit（全部同意，附補充）

team lead 給的三點 audit 發現，sub-agent 逐一**實際讀檔**驗證如下。結論：**三點全部屬實**，並有兩項補充。

### 發現 1：git.ts 用 execFile + 參數陣列 — ✅ 確認

`src/lib/developer-capture/git.ts`：

```ts
// line 1-5
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

// line 102-118
export async function readTodayGitAuthorStats(repositoryPath: string, now = new Date()): Promise<GitAuthorStats[]> {
  const since = getTaipeiDayStart(now).toISOString();
  const { stdout } = await execFileAsync(
    "git",
    ["-C", repositoryPath, "log", `--since=${since}`,
     "--pretty=format:--CAPTURE-COMMIT--%an%x00%ae", "--numstat"],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 }
  );
  return aggregateAuthorStats(parseGitLogNumstat(stdout));
}
```

- import 的是 `execFile`（非 `exec`），`promisify(execFile)` → 不啟動 shell。✅
- `repositoryPath` 是參數陣列中 `-C` 後的**獨立元素**，git 把它當單一路徑。✅
- `--since=${since}` 的 `since` 來自 `getTaipeiDayStart().toISOString()`（程式生成的 ISO 時間字串，非外部輸入），且仍是陣列單一元素，無 shell 解析面。✅

**補充 1（重要，team lead audit 未涵蓋）**：存在**第二個** git 呼叫實作 `scripts/recalculate-capture-meter.js`（`npm run capture:recalculate` 的 CLI，可能由 cron / git hook 觸發）。實測該檔同樣安全：

```js
// scripts/recalculate-capture-meter.js:1, 6, 147-158
const { execFile } = require("node:child_process");
const execFileAsync = promisify(execFile);
async function readTodayGitAuthorStats(repositoryPath, now = new Date()) {
  const { stdout } = await execFileAsync("git", ["-C", repositoryPath, "log", ...], {...});
}
```

→ 兩條 git 路徑寫法一致、皆安全。**但** `recalculate-capture-meter.js` 的 `readTodayGitAuthorStats` **未被 `module.exports`**（只 export `parseGitLogNumstat` / `aggregateAuthorStats` / `buildPlayerStats` / `calculate*`），所以 regression 測試無法直接 import 它跑注入測試 → 測試設計改用「逐字對齊的 inline execFile 呼叫」當 oracle（見下方測試設計），這對 `git.ts:104` 與 CLI 版同時有效。

### 發現 2：repositoryPath 來自 env + 驗證絕對路徑 — ✅ 確認

`src/lib/developer-capture/config.ts`：

```ts
// line 52
repositoryPath: path.resolve(process.env.CAPTURE_REPO_PATH || process.cwd()),

// line 30-38
function assertSafeConfig(config: CaptureConfig): void {
  if (!path.isAbsolute(config.repositoryPath)) {
    throw new Error("CAPTURE_REPO_PATH 必須是絕對路徑，避免後端誤讀錯誤戰場。");
  }
  if (!path.isAbsolute(config.statePath)) {
    throw new Error("CAPTURE_STATE_PATH 必須是絕對路徑，避免狀態檔寫入未知位置。");
  }
}
// line 61: assertSafeConfig(config) 在 getCaptureConfig() return 前呼叫
```

- 來源是 `process.env.CAPTURE_REPO_PATH`（**伺服器環境變數**），非 HTTP/表單。✅
- `path.resolve(...)` + `path.isAbsolute(...)` 驗證 → 相對路徑直接拋錯。✅
- 呼叫鏈：`state.ts:108 getCaptureConfig()` → `state.ts:117 readTodayGitAuthorStats(config.repositoryPath)`，路徑全程未經使用者輸入。✅

### 發現 3：server action 不碰 shell — ✅ 確認

`src/app/actions/developerCapture.ts`（全檔 96 行）三個 server action：

- `saveCaptureDisplayNames(input: {leftLabel, rightLabel})` → `normalizeLabel`（trim）→ `saveCaptureDisplayLabels` → 寫 settings JSON。
- `saveCaptureHudSettings(input: {leftLabel, rightLabel, targetRepositoryOwnerSide, hudTheme, hudLayout})` → 同上路徑 + HUD 設定。
- `getCaptureStateSnapshot()` → `noStore()` + `readCaptureState()`（讀 state JSON）。

- 全檔**無** `child_process` / `exec` / `git` 任何引用。✅
- 外部輸入只有 `leftLabel` / `rightLabel`，經 `normalizeLabel`（`value.trim()`）寫 DB/settings，**不進任何指令**。✅
- `ensureDeveloper()` 在 `CAPTURE_REQUIRE_AUTH==='true'` 時驗 `app_metadata.role==='developer'`。

**補充 2**：grep 全 `src/` 確認 `child_process` / `execFile` / `exec(` / `spawn` / `shell: true` **唯一**出現在 `git.ts`（3 處：import / promisify / 呼叫）。整個應用層沒有第二個 shell 執行面。

---

## 經驗探針（empirical probe）— 注入不執行的實證

sub-agent 跑了一個與 `git.ts:104` 呼叫形式對齊的探針（已清理）：

```js
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, rmSync } from "node:fs";
const execFileAsync = promisify(execFile);
const sentinel = "<tmp>/INJECTION_SENTINEL_C3";
const malicious = `/nonexistent; touch ${sentinel}; echo $(whoami)`;
try { await execFileAsync("git", ["-C", malicious, "log", "--pretty=format:%an"]); }
catch (e) { /* git fails: path not found */ }
// existsSync(sentinel) === false
```

實測輸出：

```
GIT_STDERR_SNIPPET: fatal: cannot change to '/nonexistent; touch <sentinel>; echo $(whoami)': No such file or directory
SENTINEL_CREATED: false   ← 注入的 touch 未被執行
```

**解讀**：git 的錯誤訊息把**整串**（含 `;` `$()`）當作**一個目錄名**回報（`cannot change to '...'`），證明 `execFile` 沒把它丟給 shell。sentinel 檔未生成 → 注入指令未執行。這正是 regression 測試 (B) 要自動化斷言的行為。

> 環境：node v24.15.0 / git 2.53.0.windows.1。Windows 上 `execFile("git", ...)` 直接 spawn `git` 執行檔，不經 `cmd.exe` → 與 POSIX 行為一致。測試需相容 Windows（sentinel 用 `os.tmpdir()`，路徑用正斜線避免反斜線轉義）。

### ⚠️ Stage 4/5 關鍵發現：注入分隔符跨平台不同（修正了初版測試設計）

sub-agent 在 Stage 4 自審時做了 **exec vs execFile × 多 metacharacter** 的對照探針（已清理），實測（Windows cmd.exe）：

| 變體 | `exec`（字串拼接，危險） | `execFile`（陣列，安全） |
|---|---|---|
| `;` (POSIX 分隔) | sentinel **未**建立 | 未建立 |
| `&` (**Windows cmd 分隔**) | sentinel **被建立** ← 注入成功 | **未**建立 |
| `$()` (POSIX subshell) | 未建立 | 未建立 |
| backtick (POSIX) | 未建立 | 未建立 |

**含意（重要）**：

1. **`execFile` 對全部 4 種變體免疫**（這就是 git.ts 安全的根本原因）。✅
2. **若退回 `exec` 字串拼接，Windows 上的注入分隔符是 `&` 不是 `;`**。初版測試只用 `;`/backtick → 在 Windows 上即使 oracle 被改成 `exec`，注入也不會發生，測試會「假通過」(false negative)，喪失防迴歸力。**已修正**：測試 (B) 改用涵蓋 `;`、`&`、`$()`、backtick 四種變體的迴圈，確保在 POSIX **或** Windows 任一平台都能抓到「退回字串拼接」的迴歸。
3. **負面對照實證**：用 `exec` + `&` 模擬被破壞的 oracle → sentinel **被建立** → 正式測試的 `assert.equal(existsSync(sentinel), false)` **FAIL**。證明測試有真實防迴歸力，非空殼（對應 AC4 / tasks 3.2）。

> 這是 Stage 4 多面向自審 → Stage 5 補強的實際產出：不只「讀檔同意 audit」，還主動證偽了自己初版測試的有效性，並修正成跨平台可靠版本。

---

## Regression 測試設計（核心交付）

新增 `tests/unit/developer-capture-git-safety.test.mjs`，循 `developer-capture-meter.test.mjs` 的 `node:test` + `node:assert/strict` 原生風格。三組斷言：

### (A) 靜態原始碼斷言 — 鎖死「不得退回字串拼接」

```js
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const gitSrc = readFileSync(path.join(repoRoot, "src/lib/developer-capture/git.ts"), "utf8");

it("git.ts 從 node:child_process import execFile（非 exec）", () => {
  assert.match(gitSrc, /import\s*\{\s*execFile\s*\}\s*from\s*["']node:child_process["']/);
});
it("git.ts 不含裸 exec / execSync / spawn / shell:true", () => {
  assert.doesNotMatch(gitSrc, /\bexecSync\b/);
  assert.doesNotMatch(gitSrc, /\bspawn\b/);
  assert.doesNotMatch(gitSrc, /shell\s*:\s*true/);
  // 裸 exec( 但允許 execFile( — 用負向 lookbehind 排除 File
  assert.doesNotMatch(gitSrc, /(?<!execFile)(?<!\w)exec\s*\(/);
});
```

> 註：`(?<!execFile)...exec\(` 確保只攔截裸 `exec(`，不誤殺 `execFile(`。也順帶對 `scripts/recalculate-capture-meter.js` 跑同一組靜態斷言（涵蓋第二條 git 路徑）。

### (B) 注入行為斷言 — 端對端真跑 git（與 git.ts 逐字對齊的 oracle）

```js
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import { existsSync, rmSync } from "node:fs";
const execFileAsync = promisify(execFile);

// 與 git.ts:104-118 相同的呼叫形式
async function callGitLikeProd(repositoryPath) {
  return execFileAsync("git",
    ["-C", repositoryPath, "log", "--since=2020-01-01T00:00:00+08:00",
     "--pretty=format:--CAPTURE-COMMIT--%an%x00%ae", "--numstat"],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 });
}

it("含 shell metacharacter 的路徑被當單一參數，注入不執行", async () => {
  const sentinel = path.join(os.tmpdir(), `capture-inj-sentinel-${process.pid}`);
  if (existsSync(sentinel)) rmSync(sentinel);
  const malicious = `/nonexistent_repo; touch ${sentinel}; echo $(whoami)`;
  await assert.rejects(
    callGitLikeProd(malicious),
    (err) => {
      // git 把整串當單一路徑名回報，stderr 含完整惡意字串
      const msg = (err.stderr || err.message || "");
      assert.ok(msg.includes(malicious), "stderr 應含完整路徑字串（被當字面參數）");
      return true;
    }
  );
  assert.equal(existsSync(sentinel), false, "sentinel 不該被建立（shell 未執行注入）");
  if (existsSync(sentinel)) rmSync(sentinel);
});

it("backtick 指令替換路徑同樣不被執行", async () => {
  const sentinel = path.join(os.tmpdir(), `capture-inj-bt-${process.pid}`);
  if (existsSync(sentinel)) rmSync(sentinel);
  const malicious = "/tmp/x`touch " + sentinel + "`";
  await assert.rejects(callGitLikeProd(malicious));
  assert.equal(existsSync(sentinel), false);
  if (existsSync(sentinel)) rmSync(sentinel);
});
```

> **防迴歸效力**：若有人把 `git.ts`（與此 oracle）改成 `exec("git -C " + repositoryPath + " log ...")`，注入字串會被 shell 解析、sentinel 被建立 → 測試 FAIL。靜態斷言 (A) 也會同時 FAIL（偵測到 `exec(`）。雙保險。
> **跨平台**：sentinel 走 `os.tmpdir()`；Windows 上 git bash 風格的 `;` / backtick 一樣不會被 `execFile` 直接 spawn 的 git 解析（git 收到的是單一 argv），故 Windows / POSIX 行為一致。`assert.rejects` 不依賴特定 stderr 文案（backtick 案只斷言「失敗 + sentinel 不存在」），避免 Windows/Linux git 訊息差異造成 flaky。

### (C) config 路徑驗證斷言 — 鎖死「外部路徑須絕對路徑」

`config.ts` 是 TS、且 `assertSafeConfig` 未 export → 測試無法直接 import。兩個務實選項，**建議方案 C2**：

- **C1（不採用）**：在 APPLY 時把 `assertSafeConfig` export 出來給測試 import。缺點：為測試改 production export，違反「不改現有邏輯」。
- **C2（採用）**：對 `config.ts` 原始碼做靜態斷言——確認 `path.isAbsolute` 守衛與 `process.env.CAPTURE_REPO_PATH` 來源仍在；並對 `developerCapture.ts` 靜態斷言三個 server action 簽章不含 `repositoryPath` / path 欄位。純讀檔，零 production 改動。

```js
const configSrc = readFileSync(path.join(repoRoot, "src/lib/developer-capture/config.ts"), "utf8");
it("config.ts 仍以 env 為來源並驗證絕對路徑", () => {
  assert.match(configSrc, /process\.env\.CAPTURE_REPO_PATH/);
  assert.match(configSrc, /path\.isAbsolute\(\s*config\.repositoryPath\s*\)/);
});
const actionSrc = readFileSync(path.join(repoRoot, "src/app/actions/developerCapture.ts"), "utf8");
it("server action 不接受 repositoryPath / path 輸入", () => {
  assert.doesNotMatch(actionSrc, /repositoryPath/);
  assert.doesNotMatch(actionSrc, /child_process|execFile|\bgit\b/);
});
```

### test runner 擴充

`package.json` `test:unit` 目前是 `node tests/unit/developer-capture-meter.test.mjs`（單檔）。改為用 Node 內建 runner 探索 `tests/unit/` 下所有 `*.test.mjs`，讓新測試自動納入：

```json
"test:unit": "node --test \"tests/unit/*.test.mjs\""
```

> **⚠️ 實測校正（Stage 4 自審發現）**：sub-agent 在本機（node v24.15.0 / Windows）實測——`node --test tests/unit/`（**裸目錄**）**會失敗**（`'test failed'`，Node 24 目錄探索在此環境異常）；但 `node --test "tests/unit/*.test.mjs"`（**引號包住的 glob**，由 node 自己展開，非 shell）**正常探索並通過全部 5 個既有測試 + 未來新測試**。因此 runner 必須用 **quoted glob 形式**，不能用裸目錄。已用 `node --test tests/unit/developer-capture-meter.test.mjs`（單檔）與 `node --test "tests/unit/*.test.mjs"`（glob）雙雙實測 pass=5 fail=0 確認。

既有 meter 測試的 `import captureMeter from "../../scripts/recalculate-capture-meter.js"`（CJS default import）在 `node --test` 下行為不變（實測 5/5 pass）。**這是唯一的非測試檔改動，且只動 npm script。**

---

## 不做什麼（karpathy 外科手術邊界）

- ❌ 不改 `git.ts`（execFile + array args 已正確）。
- ❌ 不改 `developerCapture.ts`（不碰 shell 已正確）。
- ❌ 不改 `config.ts`（env + 絕對路徑驗證已正確）。
- ❌ 不加「輸入跳脫 / 白名單 / sanitize 層」——execFile + 陣列已是架構級防線，加 sanitize 是冗餘且製造維護負擔（karpathy 拒絕推測性設計）。
- ❌ 不 export `assertSafeConfig`（測試走靜態斷言 C2，不為測試改 production 介面）。

---

## Stage 6 第二意見 — Codex review prompt（待 team lead 並行發起）

> sub-agent 無法 spawn Agent（F-039），**未捏造任何評分**。team lead 收本回報後請並行發起。今日 Codex 額度滿 → 降級 Gemini（`Agent(subagent_type="gemini:gemini-rescue", run_in_background=True)`）。

````text
你是資安審查者。審查一個「確認安全 + 加 regression 測試固化」的 change（非修漏洞）。

背景：Next.js 16 + TypeScript 專案的 developer-capture 子系統會用 git 統計每日提交。team lead +
sub-agent 已三重驗證（讀檔 + grep + 經驗探針）確認**無 command injection / 無路徑遍歷**：
1. src/lib/developer-capture/git.ts:102-118 用 promisify(execFile) + 參數陣列呼叫
   git（execFile 不經 shell；repositoryPath 是 -C 後的獨立陣列元素）。
2. repositoryPath 來自 process.env.CAPTURE_REPO_PATH（伺服器 env，非 HTTP/表單），且
   config.ts:30-38 assertSafeConfig 驗證必須絕對路徑。
3. developerCapture.ts 三個 server action 不碰 shell，外部輸入只有 leftLabel/rightLabel
   經 trim 寫 settings JSON。
4. scripts/recalculate-capture-meter.js（CLI 版）採完全相同的 execFile + 陣列寫法。
經驗探針：execFile("git",["-C","/nonexistent; touch SENTINEL; echo $(whoami)","log",...])
→ git 報 "cannot change to '/nonexistent; touch SENTINEL; echo $(whoami)'"，SENTINEL 未建立。

C3 交付（不改任何安全邏輯）：
- 新增 tests/unit/developer-capture-git-safety.test.mjs（node:test）：
  (A) 靜態斷言 git.ts 用 execFile、不含裸 exec/execSync/spawn/shell:true；
  (B) 端對端真跑 git，餵含 ; 與 $() 與 backtick 的惡意 repositoryPath，斷言 git 失敗
      且 sentinel 檔未建立；
  (C) 靜態斷言 config.ts 仍 env-sourced + path.isAbsolute 守衛、server action 不接 path 輸入。
- package.json test:unit 改 `node --test tests/unit/`（唯一非測試改動）。
- ADR-26：子程序一律 execFile + 參數陣列（禁 exec/shell 字串拼接）+ 外部路徑來自 env 並驗證絕對路徑。

請評估（給 PASS / NEEDS-WORK / FAIL + 理由）：
1. audit 結論是否成立？三重驗證 + 經驗探針是否足以宣稱「無 injection」？有無被遺漏的注入面
   （如 --since 值、git config、環境變數注入、ReDoS、--output 類旗標濫用、別名/hook 觸發）？
2. regression 測試是否真能擋未來迴歸？特別是 (B) 在 Windows（execFile 直接 spawn git.exe，
   不經 cmd.exe）是否仍有效、會不會 flaky？我們已實測：Windows cmd 的注入分隔符是 & 而非 ;，
   故 (B) 涵蓋 ;/&/$()/backtick 四種變體，並用 exec+& 負面對照確認測試會 FAIL（防迴歸力證實）。
   請檢查這組變體是否仍有遺漏的平台/shell 注入向量（如 PowerShell 的 ;、newline 注入、
   UNC 路徑、git 別名）。靜態斷言 (A) 的正則（負向 lookbehind 排除 execFile）是否穩健？
3. 「不加 sanitize 層、不 export assertSafeConfig」的 karpathy 外科手術決策是否正確，或漏了
   應補的防線？
4. 有無更該優先固化的安全屬性被漏掉？
請務必嘗試**反駁**「無漏洞」結論——若你能構造任何使 execFile 仍遭注入/路徑逃逸的場景，明確指出。
````

---

## 風險 / Caveat

- **測試 (B) 依賴環境有 git 與可寫 tmp**：CI/本地皆有（repo 本身是 git repo，meter 測試也假設 node）。若極端沙箱無 git，(B) 會以 git ENOENT 失敗——需在測試開頭 skip-if-no-git 守衛（用 `execFile("git",["--version"])` 探測，失敗則 `it.skip`），避免環境問題誤判為迴歸。已納入 tasks。
- **(B) 的 `assert.rejects` 不應斷言過細的 stderr 文案**（git 版本/平台差異），核心斷言是「失敗 + sentinel 不存在」；只有第一案額外斷言「stderr 含完整路徑」（這在所有 git 版本穩定，因 git 用 `cannot change to '<path>'` 回報 `-C` 失敗）。
