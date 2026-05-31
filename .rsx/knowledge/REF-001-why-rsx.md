---
id: REF-001
type: docs
title: 為什麼引入 rsx
url: n/a
status: active
version: "0.10.0"
last_updated: 2026-05-31
official: true
references_to: []
referenced_by: []
---

## 摘要

本專案於 2026-05-31 經 `/rsx:init` 初始化 rsx v0.10.0 工作流程骨架。
rsx 提供 init → explore → propose → apply → archive 五階段結構化研發流程，
並透過 REF-NNN 多型別知識點（github / docs / blog / paper）累積技術選擇與決策的證據鏈。

## 對專案的啟示

- explore 階段：先掃 `.rsx/knowledge/`，避免重複建 REF
- propose 階段：每個技術選擇必有 prior work REF 支撐
- apply 階段：遇 test FAIL 時走 SOP §3.2 debug 順序，不直接調 hyperparam
- archive 階段：主動建 Finding / ADR + 雙向 crossref 回填

## 引用場景

本 REF 為 rsx 初始化的歷史錨點，所有後續 ADR / Finding / REF 的 `referenced_by` 鏈條始於此。
