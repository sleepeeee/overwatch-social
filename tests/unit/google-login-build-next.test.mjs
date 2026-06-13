import assert from "node:assert/strict";
import { describe, it } from "node:test";

// NOTE: 本檔 inline 複製 src/lib/auth/googleLogin.ts 的純函數邏輯（buildNext + UNSAFE_NEXT_PREFIXES）
// 理由：專案測試走 node --test + .mjs，不引 ts loader；helper 為 Next.js Client Component 模組（"use client"），
//      無法直接被 node:test 載入。任何改動 SSOT（src/lib/auth/googleLogin.ts）必須同步本檔。
const UNSAFE_NEXT_PREFIXES = ["/auth/", "/developer/"];

function buildNext(currentPath) {
  if (UNSAFE_NEXT_PREFIXES.some((p) => currentPath.startsWith(p))) {
    return "/profile";
  }
  return currentPath;
}

describe("googleLogin.buildNext", () => {
  it("一般路徑直接回傳", () => {
    assert.equal(buildNext("/browse"), "/browse");
    assert.equal(buildNext("/browse?query=foo"), "/browse?query=foo");
    assert.equal(buildNext("/"), "/");
    assert.equal(buildNext("/player/abc123"), "/player/abc123");
    assert.equal(buildNext("/share/xyz"), "/share/xyz");
  });

  it("/auth/* 前綴 fallback 為 /profile（避免 callback 迴圈）", () => {
    assert.equal(buildNext("/auth/callback"), "/profile");
    assert.equal(buildNext("/auth/error?reason=xxx"), "/profile");
    assert.equal(buildNext("/auth/"), "/profile");
  });

  it("/developer/* 前綴 fallback 為 /profile（守門路由）", () => {
    assert.equal(buildNext("/developer"), "/developer"); // 嚴格 prefix /developer/ 才命中
    assert.equal(buildNext("/developer/"), "/profile");
    assert.equal(buildNext("/developer/tags-manager"), "/profile");
    assert.equal(buildNext("/developer/capture-hud"), "/profile");
  });

  it("/profile 本身為合法 next", () => {
    assert.equal(buildNext("/profile"), "/profile");
  });
});
