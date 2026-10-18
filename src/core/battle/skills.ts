// Chiêu nghề nấc 1–2 của nhân vật kèm, xem docs/design/06-nhan-vat-ky-nang.md mục 4.
// Kỹ năng là dữ liệu; battle.ts thực thi các bước theo thứ tự.

import type { TileKind } from "../board";
import type { EffectKind } from "./effects";
import type { Element } from "./elements";
import type { Profession } from "./rules";

/** Ai nhận tác dụng của kỹ năng. enemy/ally: một người do người chơi chọn. */
export type SkillTarget = "enemy" | "ally" | "self" | "allEnemies" | "team";

/** to: "targets" là các mục tiêu của kỹ năng, "self" là người tung chiêu. */
export type SkillStep =
  | {
      readonly type: "damage";
      readonly atk: number;
      /** Hồi cho người tung chiêu theo tỉ lệ sát thương gây ra. */
      readonly lifesteal?: number;
    }
  | {
      readonly type: "effect";
      readonly to: "targets" | "self";
      readonly effect: EffectKind;
      readonly value: number;
      readonly turns: number | null;
      /** value là tỉ lệ máu tối đa của người nhận (Khiên). */
      readonly ofMaxHp?: boolean;
    }
  | { readonly type: "heal"; readonly to: "targets" | "self"; readonly ratio: number }
  | { readonly type: "cleanse"; readonly to: "targets" | "self" }
  | { readonly type: "dispel"; readonly to: "targets" }
  | { readonly type: "energy"; readonly to: "targets"; readonly amount: number }
  | { readonly type: "enemyFood"; readonly amount: number }
  | { readonly type: "mark"; readonly enhanced: boolean; readonly guaranteed?: boolean }
  /** Phá ô: ngẫu nhiên, hoặc vùng vuông quanh ô người chơi chạm. */
  | { readonly type: "destroy"; readonly area: { readonly random: number } | { readonly square: number } }
  | { readonly type: "transform"; readonly kind: TileKind; readonly count: number };

export interface SkillDef {
  readonly id: string;
  readonly name: string;
  /** Chiêu nghề của nhân vật kèm. */
  readonly profession?: Profession;
  readonly tier?: 1 | 2;
  /** Kỹ năng nhân vật chính theo nguyên tố, ô 1–6. */
  readonly element?: Element;
  readonly slot?: number;
  readonly cost: number;
  readonly target: SkillTarget;
  readonly steps: readonly SkillStep[];
}

const mark: SkillStep = { type: "mark", enhanced: false };

const DEFS: readonly SkillDef[] = [
  // Tướng sĩ
  { id: "tramKich", name: "Trảm kích", profession: "tuongSi", tier: 1, cost: 30, target: "enemy", steps: [{ type: "damage", atk: 1.5 }, mark] },
  {
    id: "hieuLenh", name: "Hiệu lệnh", profession: "tuongSi", tier: 2, cost: 60, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "atkUp", value: 0.25, turns: 2 }, mark],
  },
  {
    id: "phaTran", name: "Phá trận", profession: "tuongSi", tier: 2, cost: 60, target: "enemy",
    steps: [{ type: "damage", atk: 2.2 }, { type: "effect", to: "targets", effect: "defDown", value: 0.3, turns: 2 }, mark],
  },
  // Binh lính
  {
    id: "thuThanh", name: "Thủ thành", profession: "binhLinh", tier: 1, cost: 30, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "self", effect: "shield", value: 0.2, turns: null, ofMaxHp: true },
      mark,
    ],
  },
  {
    id: "phanKich", name: "Phản kích", profession: "binhLinh", tier: 2, cost: 60, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "reflect", value: 0.4, turns: 2 },
      { type: "effect", to: "self", effect: "defUp", value: 0.3, turns: 2 },
      mark,
    ],
  },
  {
    id: "tuongKhien", name: "Tường khiên", profession: "binhLinh", tier: 2, cost: 60, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "shield", value: 0.15, turns: null, ofMaxHp: true }, mark],
  },
  // Pháp sư
  { id: "phepCong", name: "Phép công", profession: "phapSu", tier: 1, cost: 30, target: "enemy", steps: [{ type: "damage", atk: 1.3 }, mark] },
  {
    id: "nguHanhAn", name: "Ngũ hành ấn", profession: "phapSu", tier: 2, cost: 60, target: "enemy",
    steps: [{ type: "damage", atk: 1 }, { type: "mark", enhanced: true, guaranteed: true }],
  },
  { id: "phepLan", name: "Phép lan", profession: "phapSu", tier: 2, cost: 60, target: "allEnemies", steps: [{ type: "damage", atk: 0.7 }, mark] },
  // Y sư
  {
    id: "linhDuoc", name: "Linh dược", profession: "ySu", tier: 1, cost: 30, target: "ally",
    steps: [{ type: "heal", to: "targets", ratio: 0.2 }, { type: "cleanse", to: "targets" }, mark],
  },
  {
    id: "duongSinh", name: "Dưỡng sinh", profession: "ySu", tier: 2, cost: 60, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "regen", value: 0.08, turns: 3, ofMaxHp: true }, mark],
  },
  {
    id: "teDo", name: "Tế độ", profession: "ySu", tier: 2, cost: 60, target: "team",
    steps: [{ type: "heal", to: "targets", ratio: 0.15 }, { type: "cleanse", to: "targets" }, mark],
  },
  // Mưu sĩ
  { id: "muaChuoc", name: "Mua chuộc", profession: "muuSi", tier: 1, cost: 30, target: "enemy", steps: [{ type: "energy", to: "targets", amount: -30 }, mark] },
  {
    id: "lyGian", name: "Ly gián", profession: "muuSi", tier: 2, cost: 60, target: "enemy",
    steps: [{ type: "effect", to: "targets", effect: "silence", value: 0, turns: 2 }, mark],
  },
  {
    id: "catQuanLuong", name: "Cắt quân lương", profession: "muuSi", tier: 2, cost: 60, target: "allEnemies",
    steps: [{ type: "enemyFood", amount: -15 }, { type: "energy", to: "targets", amount: -10 }, mark],
  },
  // Quân sư
  {
    id: "nghiBinh", name: "Nghi binh", profession: "quanSu", tier: 1, cost: 30, target: "enemy",
    steps: [{ type: "effect", to: "targets", effect: "atkDown", value: 0.25, turns: 2 }, mark],
  },
  { id: "phaKe", name: "Phá kế", profession: "quanSu", tier: 2, cost: 60, target: "allEnemies", steps: [{ type: "dispel", to: "targets" }, mark] },
  {
    id: "bayTran", name: "Bày trận", profession: "quanSu", tier: 2, cost: 60, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "defUp", value: 0.25, turns: 2 }, mark],
  },
];

// Bộ kỹ năng nhân vật chính hệ Mộc, docs/design/12-ky-nang-nhan-vat-chinh.md mục 2.
const MAIN: readonly SkillDef[] = [
  {
    id: "lucDiepPhong", name: "Lục Diệp Phong", element: "moc", slot: 1, cost: 20, target: "self",
    steps: [{ type: "destroy", area: { random: 8 } }],
  },
  {
    id: "linhMocHoiSinh", name: "Linh Mộc Hồi Sinh", element: "moc", slot: 2, cost: 30, target: "self",
    steps: [{ type: "heal", to: "self", ratio: 0.15 }, { type: "transform", kind: "tim", count: 3 }],
  },
  {
    id: "thanhMocHoPhap", name: "Thanh Mộc Hộ Pháp", element: "moc", slot: 3, cost: 40, target: "enemy",
    steps: [{ type: "damage", atk: 1.7, lifesteal: 0.3 }, { type: "destroy", area: { square: 2 } }],
  },
  {
    id: "cuongVuThienDiep", name: "Cuồng Vũ Thiên Diệp", element: "moc", slot: 4, cost: 60, target: "allEnemies",
    steps: [{ type: "damage", atk: 0.85 }, { type: "destroy", area: { square: 3 } }],
  },
  {
    id: "coThuTranThien", name: "Cổ Thụ Trấn Thiên", element: "moc", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 3 },
      { type: "effect", to: "self", effect: "regen", value: 0.06, turns: 2, ofMaxHp: true },
      { type: "destroy", area: { square: 4 } },
    ],
  },
  {
    id: "thanhTrucBaoPhu", name: "Thanh Trúc Bảo Phù", element: "moc", slot: 6, cost: 50, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "regen", value: 0.08, turns: 3, ofMaxHp: true },
      { type: "cleanse", to: "self" },
      { type: "effect", to: "self", effect: "defUp", value: 0.15, turns: 2 },
    ],
  },
];

export const SKILLS: Readonly<Record<string, SkillDef>> = Object.fromEntries([...DEFS, ...MAIN].map((d) => [d.id, d]));

export function getSkill(id: string): SkillDef | undefined {
  return SKILLS[id];
}

export function professionSkills(profession: Profession): SkillDef[] {
  return DEFS.filter((d) => d.profession === profession);
}

/** 6 kỹ năng chủ động của nhân vật chính theo nguyên tố (hiện có hệ Mộc). */
export function mainSkills(element: Element): SkillDef[] {
  return MAIN.filter((d) => d.element === element).sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
}

/** Kỹ năng cần người chơi chạm một ô làm tâm hoặc góc vùng. */
export function needsCell(def: SkillDef): boolean {
  return def.steps.some((s) => s.type === "destroy" && "square" in s.area);
}

/**
 * Kỹ năng bị động của thủ lĩnh theo nguyên tố, tự kích hoạt khi đầy Nộ.
 * Hiện có hệ Mộc: Sinh Sôi Bất Tận, Hồi phục 8% máu tối đa mỗi lượt cho cả đội, 3 lượt.
 */
export const PASSIVES: Partial<Record<Element, { readonly name: string; readonly teamRegen: number }>> = {
  moc: { name: "Sinh Sôi Bất Tận", teamRegen: 0.08 },
};

/**
 * Dấu ấn nguyên tố trên chiêu nghề, xem docs/design/05-nguyen-to.md mục 5.
 * Giá trị N chưa có trong docs là mặc định tạm, chờ mô phỏng.
 */
export const MARK = {
  burnAtk: 0.3,
  burnTurns: 1,
  burnTurnsEnhanced: 3,
  freezeChance: 0.2,
  regenMaxHp: 0.05,
  regenTurnsEnhanced: 2,
  defDown: 0.15,
  defDownEnhanced: 0.3,
  defDownTurnsEnhanced: 2,
  shieldMaxHp: 0.1,
  energyDrain: 10,
  atkDown: 0.1,
} as const;

export type MarkAudience = "enemies" | "self" | "team";

/** Dấu ấn nhắm vào đâu: kẻ địch trúng chiêu, bản thân hay cả đội. */
export function markAudience(element: Element, enhanced: boolean): MarkAudience {
  if (element === "moc" || element === "tho") return enhanced ? "team" : "self";
  return "enemies";
}
