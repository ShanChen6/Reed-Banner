import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import type { SurvivalView } from "../../src/core";
import SurvivalBreakScreen from "../../src/app/game/survival/SurvivalBreakScreen";

const view = (overrides: Partial<SurvivalView["break"]> = {}): SurvivalView => ({
  wave: 4,
  cleared: 4,
  downed: [null, null, 2],
  downedFighters: [
    {
      id: "leThach",
      name: "Lê Thạch",
      downedAtWave: 2,
      location: "reserve",
    },
  ],
  autoReviveId: null,
  done: false,
  current: {
    wave: 4,
    level: 5,
    boss: false,
    foes: [],
  },
  next: {
    wave: 5,
    level: 5,
    boss: true,
    foes: [
      {
        id: "boss",
        name: "Sứ quân",
        element: "hoa",
        profession: "tuongSi",
      },
    ],
  },
  break: {
  activeIds: ["dinhBoLinh", "haVan", "maiThanh"],
  reserveIds: ["leThach"],
  leaderBuildBasis: {
    profession: "tuongSi",
    element: "moc",
    hp: 400,
    maxHp: 500,
    hpRatio: 0.8,
    progress: {
      xp: 0,
      level: 10,
      skillPoints: 0,
      skillLevels: {},
      branches: [],
    },
    equipment: [],
  },
  foodCurrent: 35,
    foodAfterSupply: 60,
    reviveCost: 40,
    foodAfterPaidRevive: 20,
    canPayRevive: true,
    autoReviveId: null,
    fighters: [
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
        energy: 28,
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
        hpBeforeRecovery: 350,
        hp: 450,
        hpAfterRecovery: 450,
        maxHp: 600,
        energy: 10,
        downedAtWave: null,
        revivedAtWave: null,
        roundsUntilAutoRevive: null,
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
        hpBeforeRecovery: 0,
        hp: 0,
        hpAfterRecovery: 0,
        maxHp: 600,
        energy: 0,
        downedAtWave: 2,
        revivedAtWave: null,
        roundsUntilAutoRevive: 0,
        autoRevive: false,
      },
    ],
    ...overrides,
  },
});

function render(
  survival: SurvivalView,
  pending = false,
  error?: string,
): string {
  return renderToStaticMarkup(
    createElement(SurvivalBreakScreen, {
      survival,
      pending,
      error,
      onRefresh: () => {},
      onNext: () => {},
      onEnd: () => {},
    }),
  );
}

describe("màn nghỉ Sinh tồn", () => {
  it("hiển thị round thắng, cảnh báo boss, lực lượng, hồi HP, energy và lương server", () => {
    const html = render(view());
    assert.match(html, /Đã thắng đợt 4/);
    assert.match(html, /CẢNH BÁO TRÙM/);
    assert.match(html, /300 → 400\/500/);
    assert.match(html, /Năng lượng: 28/);
    assert.match(html, /Lương hiện tại: <strong>35/);
    assert.match(html, /Sau tiếp tế: <strong class="text-emerald-200">60/);
    assert.match(html, /Sau hồi sinh: <strong>20/);
    assert.match(html, /Dự bị/);
    assert.match(html, /Đủ điều kiện · chờ lượt hồi sinh/);
    assert.match(html, /Hồi sinh Lê Thạch · 40 lương · dự bị/);
    assert.match(html, /Chọn đồng đội vị trí 1/);
    assert.match(html, /Nghề Đinh Bộ Lĩnh/);
    assert.match(html, /Nguyên tố Đinh Bộ Lĩnh/);
    assert.match(html, /HP 400\/500 →/);
    assert.match(html, /Kỹ năng dự kiến/);
    assert.match(html, /Xác nhận và vào đợt 5/);
    assert.match(html, /sm:inset-4/);
    assert.match(html, /max-h-\[92dvh\]/);
  });

  it("hiển thị thiếu lương, trạng thái hồi sinh tự động và chờ server", () => {
    const base = view().break!;
    const insufficient = {
      ...view(),
      break: {
        ...base,
        foodAfterSupply: 20,
        foodAfterPaidRevive: null,
        canPayRevive: false,
        autoReviveId: null,
        fighters: base.fighters.map((fighter) =>
          fighter.id === "leThach"
            ? { ...fighter, roundsUntilAutoRevive: 1 }
            : fighter,
        ),
      },
    };
    const html = render(insufficient, true, "Lỗi máy chủ");
    assert.match(html, /Không đủ lương sau tiếp tế/);
    assert.match(html, /Chờ hồi sinh · còn 1 đợt/);
    assert.match(html, /disabled=""[^>]*>Hồi sinh Lê Thạch/);
    assert.match(html, /Đang chờ máy chủ xác nhận/);
    assert.match(html, /Máy chủ báo lỗi: Lỗi máy chủ/);

    const automatic = {
      ...view(),
      break: {
        ...base,
        autoReviveId: "leThach",
        fighters: base.fighters.map((fighter) =>
          fighter.id === "leThach"
            ? { ...fighter, autoRevive: true }
            : fighter,
        ),
      },
    };
    assert.match(render(automatic), /Lê Thạch sẽ tự hồi sinh/);
  });

  it("phân biệt đã hồi sinh với trạng thái không có ai cần hồi sinh", () => {
    const base = view().break!;
    const alive = {
      ...base.fighters[0]!,
      revivedAtWave: 3,
    };
    const noReviveNeeded: SurvivalView = {
      ...view(),
      downedFighters: [],
      autoReviveId: null,
      break: {
        ...base,
        canPayRevive: false,
        foodAfterPaidRevive: null,
        autoReviveId: null,
        fighters: [alive],
      },
    };
    const html = render(noReviveNeeded);
    assert.match(html, /Đã hồi sinh ở đợt 3/);
    assert.match(html, /Không có tướng gục; hiện không cần hồi sinh/);
  });

  it("không bắt đầu tự động; thiếu preview thì hiển thị lỗi và yêu cầu xác nhận", () => {
    const noPreview = { ...view(), break: undefined };
    const html = render(noPreview);
    assert.match(html, /Không tải được dữ liệu nghỉ/);
    assert.match(html, /Không thể tự tính thay hoặc tự bắt đầu đợt kế/);
    assert.match(html, /Tải lại dữ liệu nghỉ/);
  });
});
