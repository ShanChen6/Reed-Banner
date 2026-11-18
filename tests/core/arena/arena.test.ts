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
  ARENA_GEAR_CAP,
  ARENA_TIERS,
  arenaTierIndex,
  claimArenaTier,
  parseProfile,
  arenaTeam,
  autoProgress,
  defensePower,
  GEAR_SLOTS,
  profileTeam,
  teamPower,
  type ArenaDefense,
  type GearItem,
  type Profile,
} from "../../../src/core";
import { MemoryArenaStore, makeOffers } from "../../../src/server/arena";

/** Hồ sơ cấp `level`, mỗi người trong đội mặc đủ 9 món Thần phẩm cùng hệ. */
function geared(level: number): Profile {
  const p = newProfile();
  const base = { ...p, main: autoProgress(level, null), companions: Object.fromEntries(p.team.map((id) => [id, autoProgress(level, null)])) };
  const bag: GearItem[] = [];
  const loadouts: Record<string, unknown> = {};
  for (const f of profileTeam(base, base.team)) {
    const items = GEAR_SLOTS.map((slot): GearItem => ({ id: `${f.id}-${slot}`, slot, element: f.element, tier: 5, set: "dongCo", ...(slot === "vuKhi" ? { profession: f.profession } : {}) }));
    bag.push(...items);
    loadouts[f.id] = {
      weapons: { [f.profession]: `${f.id}-vuKhi` },
      slots: Object.fromEntries(items.filter((it) => it.slot !== "vuKhi").map((it) => [it.slot, it.id])),
    };
  }
  return { ...base, bag, loadouts } as Profile;
}

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

  it("trần trang bị: đồ cộng tối đa theo ARENA_GEAR_CAP của chỉ số gốc cùng cấp, không thấp hơn chỉ số gốc", () => {
    const p = geared(5);
    const full = profileTeam(p, p.team);
    const bare = profileTeam({ ...p, loadouts: {} }, p.team);
    const arena = arenaTeam(p, p.team);
    arena.forEach((f, i) => {
      assert.ok(full[i]!.atk > bare[i]!.atk * (1 + ARENA_GEAR_CAP.atk), "đồ Thần phẩm vượt trần");
      assert.equal(f.atk, Math.round(bare[i]!.atk * (1 + ARENA_GEAR_CAP.atk)));
      assert.equal(f.maxHp, Math.round(bare[i]!.maxHp * (1 + ARENA_GEAR_CAP.maxHp)));
      assert.ok(f.def >= bare[i]!.def);
    });
    // Đội cấp 5 đồ tối đa vẫn yếu hơn đội cấp 30 không đồ.
    const lv30 = arenaTeam({ ...newProfile(), main: autoProgress(30, null), companions: Object.fromEntries(p.team.map((id) => [id, autoProgress(30, null)])) }, p.team);
    assert.ok(lv30.every((f, i) => f.atk > arena[i]!.atk && f.maxHp > arena[i]!.maxHp));
  });

  it("bản chụp cũ chưa có trần cũng bị kẹp khi vào trận", () => {
    const p = geared(5);
    const old: ArenaDefense = { ...defenseOf(p), team: profileTeam(p, p.team) };
    const ghost = ghostTeam(old, "Cũ");
    const capped = arenaTeam(p, p.team);
    assert.deepEqual(ghost.map((f) => [f.maxHp, f.atk, f.def]), capped.map((f) => [f.maxHp, f.atk, f.def]));
    assert.ok(defensePower(old) < teamPower(old.team));
  });

  it("bày đối thủ ưu tiên lực chiến gần người đánh, không có ai gần thì thêm bóng ma cùng cấp", async () => {
    const store = new MemoryArenaStore();
    const weak = defenseOf(newProfile());
    const strongProfile = geared(30);
    const strong = defenseOf(strongProfile);
    for (const [id, d] of [["yeu1", weak], ["yeu2", weak], ["manh", strong]] as const) {
      await store.ensure(id, 0);
      await store.setDefense(id, d, 0);
    }
    const offers = await makeOffers(store, "toi", 1000, 30, 5, defensePower(strong));
    const real = offers.filter((o) => o.owner !== null).map((o) => o.owner);
    assert.deepEqual(real, ["manh"]);
    assert.equal(offers.filter((o) => o.owner === null).length, 2);
  });

  it("thưởng bậc hạng: đủ điểm mới nhận, mỗi bậc một lần, lưu qua đọc lại hồ sơ", () => {
    assert.equal(arenaTierIndex(1000), 0);
    assert.equal(arenaTierIndex(1050), 1);
    assert.equal(arenaTierIndex(5000), ARENA_TIERS.length - 1);
    const p = newProfile();
    assert.deepEqual(claimArenaTier(p, "bac", 1049), { ok: false, error: "notReached" });
    assert.deepEqual(claimArenaTier(p, "khong-co", 2000), { ok: false, error: "badTier" });
    const a = claimArenaTier(p, "bac", 1100);
    assert.ok(a.ok);
    assert.equal(a.profile.gold, p.gold + ARENA_TIERS[1]!.gold);
    assert.deepEqual(a.profile.arenaTiers, ["bac"]);
    assert.deepEqual(claimArenaTier(a.profile, "bac", 1100), { ok: false, error: "claimed" });
    // Bậc thấp hơn vẫn nhận được khi đã ở bậc cao.
    assert.ok(claimArenaTier(a.profile, "dong", 1100).ok);
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(a.profile))).arenaTiers, ["bac"]);
    assert.equal(parseProfile(JSON.parse(JSON.stringify(p))).arenaTiers, undefined);
  });
});
