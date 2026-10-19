// Đội hình khởi đầu: nhân vật chính và 5 nhân vật kèm hư cấu.
// Chỉ số và nguyên tố của nhân vật kèm là điểm xuất phát, chờ mô phỏng cân bằng.

import { mainSkills, professionSkills } from "../battle/skills";
import type { Element } from "../battle/elements";
import type { Profession } from "../battle/rules";
import type { FighterConfig } from "../battle/state";

export interface BaseStats {
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
}

/** Chỉ số gốc theo nghề, cùng một cấp. Điểm xuất phát. */
export const BASE_STATS: Readonly<Record<Profession, BaseStats>> = {
  tuongSi: { maxHp: 500, atk: 55, def: 10 },
  phapSu: { maxHp: 450, atk: 55, def: 8 },
  binhLinh: { maxHp: 600, atk: 45, def: 15 },
  ySu: { maxHp: 475, atk: 45, def: 10 },
  muuSi: { maxHp: 475, atk: 50, def: 10 },
  quanSu: { maxHp: 475, atk: 50, def: 10 },
};

/** Nhân vật chính mặc định: Đinh Bộ Lĩnh, Tướng sĩ, bộ kỹ năng theo nguyên tố đã chọn. */
export function mainCharacter(element: Element = "moc", profession: Profession = "tuongSi"): FighterConfig {
  return {
    id: "dinhBoLinh",
    name: "Đinh Bộ Lĩnh",
    element,
    profession,
    ...BASE_STATS[profession],
    skills: mainSkills(element).map((s) => s.id),
  };
}

function companion(id: string, name: string, profession: Profession, element: Element): FighterConfig {
  return {
    id,
    name,
    element,
    profession,
    ...BASE_STATS[profession],
    // Giai đoạn 1 chỉ có chiêu nấc 1–2, chưa có tuyệt chiêu nấc 3.
    skills: professionSkills(profession).map((s) => s.id),
  };
}

/** 5 nhân vật kèm khởi đầu, mỗi người một nghề còn lại. Nguyên tố là điểm xuất phát. */
export const STARTER_COMPANIONS: readonly FighterConfig[] = [
  companion("haVan", "Hà Vân", "phapSu", "hoa"),
  companion("leThach", "Lê Thạch", "binhLinh", "tho"),
  companion("maiThanh", "Mai Thanh", "ySu", "thuy"),
  companion("toKim", "Tô Kim", "muuSi", "kim"),
  companion("phungPhong", "Phùng Phong", "quanSu", "phong"),
];
