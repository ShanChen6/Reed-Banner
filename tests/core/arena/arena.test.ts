import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ARENA_K,
  arenaDelta,
  botDefense,
  botName,
  defenseOf,
  ghostTeam,
  newProfile,
} from "../../../src/core";

describe("đấu trường bóng ma", () => {
  it("đội phòng thủ chụp đội 3vs3 đang chọn ở hồ sơ, kèm cấp từng người", () => {
    const p = newProfile();
    const d = defenseOf(p);
    assert.equal(d.team.length, 3);
    assert.deepEqual(
      d.members.map((m) => m.id),
      d.team.map((f) => f.id),
    );
    assert.ok(d.members.every((m) => m.level === 1));
    assert.ok(d.power > 0);
  });

  it("bóng ma máy tạo: cùng seed cùng đội, cùng cấp người đánh", () => {
    const a = botDefense(77, 12);
    assert.deepEqual(a, botDefense(77, 12));
    assert.equal(a.team.length, 3);
    assert.ok(a.members.every((m) => m.level === 12));
    assert.match(botName(77), /^Bóng ma /);
  });

  it("đổi tên nhân vật chính của đội phòng thủ thành tên chủ đội", () => {
    const t = ghostTeam(botDefense(1, 5), "Shan");
    assert.equal(t[0]!.name, "Shan");
  });

  it("Elo: ngang điểm thì thắng +16, thua −16, người phòng thủ đổi một nửa và ngược dấu", () => {
    assert.deepEqual(arenaDelta(1000, 1000, true), {
      attacker: 16,
      defender: -8,
    });
    assert.deepEqual(arenaDelta(1000, 1000, false), {
      attacker: -16,
      defender: 8,
    });
    // Thắng người điểm cao hơn nhiều được gần trọn hệ số; thua người yếu hơn nhiều mất gần trọn.
    assert.ok(arenaDelta(1000, 1400, true).attacker > ARENA_K * 0.9);
    assert.ok(arenaDelta(1400, 1000, false).attacker < -ARENA_K * 0.9);
  });
});
