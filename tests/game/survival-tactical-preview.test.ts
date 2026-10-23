import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SurvivalBreakView } from "../../src/core";
import {
  buildSurvivalNextWaveAction,
  previewLeaderBuild,
  validTacticalLineup,
} from "../../src/app/game/survival/tactical-preview";

const fighters: SurvivalBreakView["fighters"] = [
  {
    id: "dinhBoLinh",
    name: "Đinh Bộ Lĩnh",
    element: "moc",
    profession: "tuongSi",
    location: "active",
    hpBeforeRecovery: 300,
    hp: 400,
    hpAfterRecovery: 400,
    maxHp: 500,
    energy: 20,
    downedAtWave: null,
    revivedAtWave: null,
    roundsUntilAutoRevive: null,
    autoRevive: false,
  },
  {
    id: "haVan",
    name: "Hà Vân",
    element: "kim",
    profession: "phapSu",
    location: "active",
    hpBeforeRecovery: 0,
    hp: 0,
    hpAfterRecovery: 0,
    maxHp: 600,
    energy: 0,
    downedAtWave: 3,
    revivedAtWave: null,
    roundsUntilAutoRevive: 0,
    autoRevive: false,
  },
  {
    id: "maiThanh",
    name: "Mai Thanh",
    element: "hoa",
    profession: "ySu",
    location: "active",
    hpBeforeRecovery: 400,
    hp: 500,
    hpAfterRecovery: 500,
    maxHp: 700,
    energy: 12,
    downedAtWave: null,
    revivedAtWave: null,
    roundsUntilAutoRevive: null,
    autoRevive: false,
  },
  {
    id: "leThach",
    name: "Lê Thạch",
    element: "tho",
    profession: "binhLinh",
    location: "reserve",
    hpBeforeRecovery: 500,
    hp: 560,
    hpAfterRecovery: 560,
    maxHp: 700,
    energy: 8,
    downedAtWave: null,
    revivedAtWave: null,
    roundsUntilAutoRevive: null,
    autoRevive: false,
  },
  {
    id: "toKim",
    name: "Tô Kìm",
    element: "thuy",
    profession: "muuSi",
    location: "reserve",
    hpBeforeRecovery: 0,
    hp: 0,
    hpAfterRecovery: 0,
    maxHp: 650,
    energy: 0,
    downedAtWave: 2,
    revivedAtWave: null,
    roundsUntilAutoRevive: 0,
    autoRevive: false,
  },
];

const activeIds = ["dinhBoLinh", "haVan", "maiThanh"] as const;

describe("bản nháp chiến thuật Sinh tồn", () => {
  it("cho phép thay một hoặc hai vị trí bằng dự bị sống, nhưng không đưa tướng gục vào active", () => {
    assert.equal(
      validTacticalLineup(
        ["dinhBoLinh", "leThach", "maiThanh"],
        activeIds,
        fighters,
      ),
      true,
    );
    const twoLivingReserves = fighters.map((fighter) =>
      fighter.id === "toKim"
        ? { ...fighter, hpAfterRecovery: 200 }
        : fighter,
    );
    assert.equal(
      validTacticalLineup(
        ["dinhBoLinh", "leThach", "toKim"],
        activeIds,
        twoLivingReserves,
      ),
      true,
    );
    assert.equal(
      validTacticalLineup(
        ["dinhBoLinh", "leThach", "haVan"],
        activeIds,
        fighters,
      ),
      false,
    );
    assert.equal(
      validTacticalLineup(
        ["dinhBoLinh", "leThach", "dinhBoLinh"],
        activeIds,
        fighters,
      ),
      false,
    );
  });

  it("giữ lựa chọn build, đội hình và hồi sinh trong một action xác nhận duy nhất", () => {
    assert.deepEqual(
      buildSurvivalNextWaveAction(
        {
          activeIds: ["dinhBoLinh", "leThach", "maiThanh"],
          profession: "phapSu",
          element: "hoa",
          reviveId: "haVan",
        },
        activeIds,
        "tuongSi",
        "moc",
      ),
      {
        type: "nextWave",
        activeIds: ["dinhBoLinh", "leThach", "maiThanh"],
        leaderBuild: { profession: "phapSu", element: "hoa" },
        revive: "haVan",
      },
    );
    assert.deepEqual(
      buildSurvivalNextWaveAction(
        {
          activeIds,
          profession: "tuongSi",
          element: "moc",
        },
        activeIds,
        "tuongSi",
        "moc",
      ),
      { type: "nextWave" },
    );
  });

  it("xem trước nghề/hệ theo snapshot và giữ tỷ lệ HP mà không sửa dữ liệu đầu vào", () => {
    const basis: NonNullable<SurvivalBreakView["leaderBuildBasis"]> = {
      profession: "tuongSi",
      element: "moc",
      hp: 400,
      maxHp: 500,
      hpRatio: 0.8,
      progress: {
        xp: 0,
        level: 10,
        skillPoints: 0,
        skillLevels: { o1: 3 },
        branches: [],
      },
      equipment: [],
    };
    const original = structuredClone(basis);
    const preview = previewLeaderBuild(basis, "phapSu", "hoa");
    assert.ok(preview);
    assert.equal(preview.hp, Math.round(preview.config.maxHp * 0.8));
    assert.equal(preview.config.profession, "phapSu");
    assert.equal(preview.config.element, "hoa");
    assert.deepEqual(basis, original);
  });
});
