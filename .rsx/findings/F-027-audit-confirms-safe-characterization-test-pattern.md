---
id: F-027
type: finding
title: "audit-confirms-safe → characterization test 固化 pattern：審計確認現碼安全時，正確產出是 regression 測試，不是改程式碼"
status: confirmed
confidence: high
change: audit-developer-capture-injection
date: 2026-06-11
references_to: [ADR-26, REF-027]
referenced_by: [ADR-26]
supporting_refs: [REF-027]
---

## 結論 / 數據

`audit-developer-capture-injection`（C3）執行後確認：

**核心發現：無漏洞要修。** developer-capture git 子系統（`src/lib/developer-capture/git.ts` + `scripts/recalculate-capture-meter.js`）的 command injection 防禦已正確實作（`execFile` + 參數陣列 + server-controlled env 路徑）。

然而，正確的程式碼若**缺乏 regression 測試**，其安全屬性等同「未受保護」——任何重構者在不知情的情況下都可能破壞該屬性，且不會收到任何警示。

**量化驗收（2026-06-11）**：
- `tests/unit/developer-capture-git-safety.test.mjs`：**12/12 pass**（7 git-safety + 5 meter）
- 防迴歸驗證：oracle 換成 `exec("git -C " + path + " ...")` 字串拼接 → 測試正確 FAIL（sentinel 被建立）
- `npm run build`：**Compiled successfully, 16/16 static pages**
- `git.ts` / `developerCapture.ts` / `config.ts` **零 diff**（安全邏輯未被動到）
- Gemini §6.5 對抗式審查 **PASS**（Codex 今日額度滿降級）：構造 argument injection / UNC / PowerShell / CVE-2024-27980 / null byte / 路徑遍歷等攻擊面，全部確認無漏洞

## 與既有 REF/Finding 一致或矛盾

**承接 [[ADR-26]]**（execFile + 參數陣列準則）：

本 Finding 是 ADR-26 的**觸發依據**——正因為審計確認現碼正確，我們才能以此作為「範本」提升為專案準則。ADR-26 描述「應該怎麼做」；本 Finding 描述「為什麼這樣做是正確的、以及如何確認它持續正確」。

**符合 karpathy 外科手術原則**：

沒有漏洞就不改程式碼。C3 的唯一產出是測試檔案與 npm script 調整，security-critical 檔案零 diff。這是 audit-confirms-safe 型 change 的標準形態。

## 對後續影響

### Pattern：audit-confirms-safe → characterization test

當安全審計結論為「現碼正確，無需修復」時，正確的後續步驟：

1. **不改安全邏輯**（karpathy 外科手術：不動沒壞的東西）
2. **建立 characterization/regression 測試**，把「當前正確行為」鎖死：
   - **(A) 靜態斷言**：確認「正確模式存在」且「危險模式不存在」（白名單 + 黑名單雙向）
   - **(B) 行為斷言（負面對照）**：用已知惡意輸入跑真實代碼路徑，驗證「惡意輸入確實被擋住」，而非只靠靜態分析
   - **(C) 邊界靜態斷言**：確認 attack surface 沒有被擴大（config 仍用 env、action 仍不碰 shell）
3. **文件化準則**（ADR）：把確認正確的做法提升為明文規範，防止未來開發者誤用

### 跨平台注入分隔符教訓

Gemini §6.5 審查期間發現的跨平台細節：

| 環境 | 命令分隔符 | 範例 |
|---|---|---|
| POSIX (Linux/macOS) | `;` | `path; rm -rf /` |
| Windows cmd | `&` 或 `&&` | `path & del /f *` |
| PowerShell | `;` | `path; Remove-Item` |

C3 測試 (B) 使用 `;`（POSIX）與 `$()`（command substitution）覆蓋主要攻擊向量。在 Windows cmd 環境下，`execFile` 同樣不啟動 shell，`&`/`&&` 無效——`execFile` 的保護在 Windows 和 POSIX 上是結構性的（kernel 層 argv 陣列傳遞），不依賴平台特定 escape 規則。

### 「無測試覆蓋的安全寫法等同未受保護」原則

安全屬性的保護需要**兩層**：

| 層次 | 說明 | 失效情境 |
|---|---|---|
| 實作正確 | 使用 execFile + 參數陣列 | 重構者改用 exec 字串拼接（不知道這是安全邊界） |
| 測試覆蓋 | regression 測試鎖死安全屬性 | 改動 → CI FAIL → 開發者意識到「這裡有安全邊界」 |

只有第一層保護時，安全性依賴「所有人都知道這個設計決定的理由」——這在中長期項目中是不現實的假設。

### Gemini §6.5 審查確認的安全邊界完整性

Gemini 嘗試的所有攻擊向量：

| 攻擊向量 | 結果 |
|---|---|
| Argument injection（`;`/`$()`/backtick） | 無效（execFile 不啟動 shell） |
| UNC 路徑（`\\host\share`）| 無實際攻擊面（Vercel 環境無 SMB 掛載；已標注 N1） |
| CVE-2024-27980（.cmd shim argument escaping）| 不適用（git 為 PE .exe；已標注 N2） |
| null byte 注入（`\0`）| execFile argv 不走 shell，null byte 直接傳入 git 進程，git 以非零 exit 拒絕 |
| 路徑遍歷（`../../etc/passwd`）| env var 來源不受使用者控制，遍歷無起點（已標注 N3） |
| PowerShell 特殊字元（`%SystemRoot%`）| execFile 不走 shell，PowerShell 環境變數展開不觸發 |

見 [[ADR-26]] N1/N2/N3 完整文件。
