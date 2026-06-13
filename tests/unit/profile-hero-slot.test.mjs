import assert from "node:assert/strict";
import { describe, it } from "node:test";

// NOTE: 本檔 inline 複製 src/app/profile/ProfileClient.tsx 內「已選 X/3」hero slot 橫條的純邏輯
// （count + avatar URL 組裝）。SSOT 在 ProfileClient.tsx；改 view 邏輯時必須同步本檔。
// 理由：專案測試走 node --test + .mjs，UI 元件含 React + Next.js client 模組，無法直接被 node:test 載入。

function countFilledHeroSlots(selectedHeroes) {
  return selectedHeroes.filter(Boolean).length;
}

function heroAvatarSrc(editingGame, heroId) {
  return editingGame === "ow"
    ? `/images/heroes/avatars/${heroId}.png`
    : `/images/heroes/avatars/${editingGame}_${heroId}.png`;
}

describe("profile hero slot 已選橫條", () => {
  it("countFilledHeroSlots 計算非空 slot 數（filter(Boolean) 邏輯）", () => {
    assert.equal(countFilledHeroSlots([]), 0);
    assert.equal(countFilledHeroSlots([null, null, null]), 0);
    assert.equal(countFilledHeroSlots(["ana", null, null]), 1);
    assert.equal(countFilledHeroSlots(["ana", "genji", null]), 2);
    assert.equal(countFilledHeroSlots(["ana", "genji", "tracer"]), 3);
    assert.equal(countFilledHeroSlots(["", "genji", null]), 1, "空字串視為未填");
    assert.equal(countFilledHeroSlots([undefined, "genji", "tracer"]), 2);
  });

  it("heroAvatarSrc 對 ow 直接用 id，其他遊戲加前綴", () => {
    assert.equal(heroAvatarSrc("ow", "ana"), "/images/heroes/avatars/ana.png");
    assert.equal(heroAvatarSrc("ow", "genji"), "/images/heroes/avatars/genji.png");
    assert.equal(heroAvatarSrc("lol", "ahri"), "/images/heroes/avatars/lol_ahri.png");
    assert.equal(heroAvatarSrc("val", "jett"), "/images/heroes/avatars/val_jett.png");
  });
});
