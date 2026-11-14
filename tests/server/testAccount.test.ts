import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_LEVEL, PLAYABLE_COMPANIONS, isReleasedCompanion, newProfile, parseProfile } from "../../src/core";
import { TTK_MAX_TICKETS } from "../../src/core/tam-tuong-ky";
import { TEST_ACCOUNT_GOLD, grantFullTestProfile } from "../../src/server/testAccount";

describe("cấp đầy đủ cho tài khoản thử nghiệm", () => {
  it("đủ vàng, mọi tướng đã phát hành ở cấp tối đa, phiếu và lượt mở Tầm Tướng Ký; hồ sơ vẫn hợp lệ sau khi đọc lại", () => {
    const next = grantFullTestProfile(newProfile());
    assert.equal(next.gold, TEST_ACCOUNT_GOLD);
    for (const c of PLAYABLE_COMPANIONS.filter((x) => isReleasedCompanion(x.id))) assert.equal(next.companions[c.id]?.level, MAX_LEVEL, c.id);
    assert.equal(next.main.level, MAX_LEVEL);
    assert.equal(next.tamTuongKy?.tickets, TTK_MAX_TICKETS);
    const again = parseProfile(JSON.parse(JSON.stringify(next)));
    assert.equal(again.gold, TEST_ACCOUNT_GOLD);
    assert.equal(again.tamTuongKy?.tickets, TTK_MAX_TICKETS);
    assert.equal(Object.keys(again.companions).length, Object.keys(next.companions).length);
  });

  it("không lấy bớt vàng của tài khoản đã nhiều vàng hơn", () => {
    assert.equal(grantFullTestProfile({ ...newProfile(), gold: TEST_ACCOUNT_GOLD + 5 }).gold, TEST_ACCOUNT_GOLD + 5);
  });
});
