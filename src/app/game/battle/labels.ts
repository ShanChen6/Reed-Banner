// Nhãn tiếng Việt cho màn chơi. Hình vẽ nằm trong ./art.

import {
  getGearSet,
  TIER_INFO,
  SKILL_SLOT_UNLOCK,
  skillSource,
  skillComboPartners,
  scaleSkill,
  SKILL_MAX_LEVEL,
  PASSIVE,
  PASSIVE_TURNS,
  RAGE_MAX,
  RAGE_PER_DRUM,
  RAGE_PER_HP_RATIO,
  TRONG_DA_RAGE,
  TRONG_DONG_RAGE,
  CHASE_LIMITS,
  type ChasePassiveDef,
  type ComboPassiveDef,
  type ComboSignalKind,
  type SkillDef,
  type BattleError,
  type Difficulty,
  type EffectKind,
  type Element,
  type GearItem,
  type GearSlot,
  type Profession,
  type SpecialGrade,
  type Tier,
  type TileKind,
} from "@/core";

export const TILE_NAME: Record<TileKind, string> = {
  kiem: "Kiếm",
  amDuong: "Âm dương",
  banhChung: "Bánh chưng",
  tim: "Tim",
  vang: "Vàng",
  sach: "Sách",
  trong: "Trống trận",
};

/** Tên ô đặc biệt theo docs/design/01-ban-co.md mục 3. */
export const SPECIAL_NAME: Record<SpecialGrade, Record<TileKind, string>> = {
  strong: {
    kiem: "Kiếm lửa",
    amDuong: "Âm dương thái cực",
    banhChung: "Mâm cỗ",
    tim: "Tim vàng",
    vang: "Rương vàng",
    sach: "Binh thư",
    trong: "Trống đồng",
  },
  weak: {
    kiem: "Kiếm đồng",
    amDuong: "Bùa âm dương",
    banhChung: "Giỏ bánh",
    tim: "Tim bạc",
    vang: "Túi vàng",
    sach: "Thẻ tre",
    trong: "Trống da",
  },
};

export const PROFESSION_NAME: Record<Profession, string> = {
  tuongSi: "Tướng sĩ",
  phapSu: "Pháp sư",
  binhLinh: "Binh lính",
  ySu: "Y sư",
  muuSi: "Mưu sĩ",
  quanSu: "Quân sư",
};

export const ELEMENT_NAME: Record<Element, string> = {
  kim: "Kim",
  moc: "Mộc",
  thuy: "Thủy",
  hoa: "Hỏa",
  tho: "Thổ",
  loi: "Lôi",
  phong: "Phong",
};

export const EFFECT_NAME: Record<EffectKind, string> = {
  shield: "Khiên",
  freeze: "Đóng băng",
  freezeImmune: "Miễn băng",
  burn: "Thiêu đốt",
  atkUp: "Công+",
  atkDown: "Công−",
  defUp: "Thủ+",
  defDown: "Thủ−",
  regen: "Hồi phục",
  taunt: "Khiêu khích",
  reflect: "Phản đòn",
  silence: "Câm lặng",
};

export const GOOD_EFFECTS: readonly EffectKind[] = ["shield", "atkUp", "defUp", "regen", "reflect", "taunt", "freezeImmune"];

export const DIFFICULTY_NAME: Record<Difficulty, string> = {
  easy: "Dễ",
  normal: "Thường",
  hard: "Khó",
  boss: "Trùm",
  nightmare: "Ác mộng",
};

export const ERROR_TEXT: Record<BattleError, string> = {
  battleOver: "Trận đã kết thúc",
  invalidActor: "Không chọn được người này",
  invalidMove: "Nước đi không tạo bộ ghép",
  invalidSkill: "Không dùng được kỹ năng này",
  invalidTarget: "Mục tiêu không hợp lệ",
  skillUsed: "Đã dùng kỹ năng trong lần ra tay này",
  silenced: "Đang bị Câm lặng",
  notEnoughEnergy: "Không đủ năng lượng",
  tooLate: "Đã hết giờ",
  tooEarly: "Chưa hết giờ",
  noTimer: "Không có đồng hồ",
  noFreeWhirl: "Không còn lượt xoay miễn phí",
};

export const SLOT_NAME: Record<GearSlot, string> = {
  vuKhi: "Vũ khí",
  dinhMao: "Đính mão",
  yPhuc: "Y phục",
  hoThu: "Hộ thủ",
  baoNgoa: "Bảo ngoa",
  gioiChi: "Giới chỉ",
  hangLien: "Hạng liên",
  hoPhu: "Hộ phù",
  ngocBoi: "Ngọc bội",
};

/** Tên phẩm ngắn theo màu, dùng cho nút chọn. */
export const TIER_COLOR_NAME: Record<Tier, string> = { 1: "Trắng", 2: "Lục", 3: "Lam", 4: "Tím", 5: "Cam" };

export const TIER_CLASS: Record<Tier, string> = {
  1: "text-stone-100",
  2: "text-green-400",
  3: "text-sky-400",
  4: "text-purple-400",
  5: "text-orange-400",
};

/** Mô tả một món: "Vũ khí (Pháp sư) Lam hệ Kim, bộ Cờ Lau". */
export function gearText(item: GearItem): string {
  const set = getGearSet(item.set)?.name ?? item.set;
  const prof = item.profession ? ` (${PROFESSION_NAME[item.profession]})` : "";
  return `${SLOT_NAME[item.slot]}${prof} ${TIER_INFO[item.tier].name} hệ ${ELEMENT_NAME[item.element]}, bộ ${set}`;
}

/** Mô tả lấy từ các bước thực thi, dùng chung ở trước trận, quản lý và trong trận. */
const pct = (n: number) => `${Math.round(n * 100)}%`;

export const SKILL_TARGET_NAME: Record<SkillDef["target"], string> = { enemy: "địch đơn", ally: "đồng minh đơn", self: "bản thân", team: "cả đội", allEnemies: "mọi địch" };

/** Nguồn kỹ năng: nghề, hệ hay tuyệt chiêu/chiêu riêng của nhân vật. */
export function skillSourceName(def: SkillDef): string {
  if (skillSource(def) === "character") return def.characterKind === "signature" ? "Chiêu riêng" : "Tuyệt chiêu nhân vật";
  return def.profession ? `Nghề ${PROFESSION_NAME[def.profession]}` : def.element ? `Hệ ${ELEMENT_NAME[def.element]}` : "Kỹ năng";
}

/** Từng bước tác dụng của kỹ năng, theo đúng thứ tự core chạy. */
export function skillStepTexts(def: SkillDef): string[] {
  const to = { targets: "mục tiêu", self: "bản thân", team: "cả đội", enemies: "mọi địch" };
  return def.steps.map(s => {
    switch (s.type) {
      case "damage": return `${pct(s.atk)} Công${s.pierce ? `, bỏ ${pct(s.pierce)} DEF` : ""}${s.pierceShield ? ", xuyên Khiên" : ""}${s.lifesteal ? `, hút máu ${pct(s.lifesteal)}` : ""}${s.execute ? `, ×${s.execute.multiplier} khi địch ≤${pct(s.execute.threshold)} máu` : ""}`;
      case "heal": return `Hồi ${pct(s.ratio)} máu ${to[s.to]}`;
      case "cleanse": return `Thanh tẩy ${to[s.to]}`;
      case "dispel": return "Xua tan hiệu ứng có lợi mục tiêu";
      case "energy": return `${s.amount >= 0 ? "+" : ""}${s.amount} năng lượng ${to[s.to]}`;
      case "enemyFood": return `${s.amount} lương địch`;
      case "mark": return `Dấu ấn nguyên tố${s.enhanced ? " cường hóa" : ""}${s.guaranteed ? " chắc chắn" : ""}`;
      case "effect": return `${EFFECT_NAME[s.effect]} ${s.value ? pct(s.value) : ""}${s.ofMaxHp ? " máu tối đa" : s.ofAtk ? " Công" : ""} ${to[s.to]}${s.turns === null ? " đến khi hết" : ` ${s.turns} lượt`}${s.chance === undefined ? "" : `, xác suất ${pct(s.chance)}`}`;
      case "transform": return `Biến ${s.count} ô thường ngẫu nhiên thành ${TILE_NAME[s.kind]}`;
      case "destroy": return `Phá ${"random" in s.area ? `${s.area.random} ô ngẫu nhiên` : "square" in s.area ? `vùng ${s.area.square}×${s.area.square}` : "columns" in s.area ? `${s.area.columns} cột` : JSON.stringify(s.area)}`;
      case "whirl": return `${s.auto ? "Tự xoay" : "Chọn tâm xoay"} lốc xoáy ±1${s.turns > 1 ? `..${s.turns}` : ""} nấc`;
    }
  });
}

export function skillText(def: SkillDef): string {
  const partners=skillComboPartners(def);
  return `${def.name} · ${skillSourceName(def)} · ô ${def.slot ?? "—"} · mở cấp ${SKILL_SLOT_UNLOCK[def.slot ?? 0] ?? 1} · ${def.cost} NL · ${SKILL_TARGET_NAME[def.target]}: ${skillStepTexts(def).join("; ")}${partners.length ? `. Có thể mở: ${partners.join(", ")} (cần tác dụng thực)` : ""}`;
}

/**
 * Bảng số liệu theo cấp kỹ năng 1..SKILL_MAX_LEVEL, dựng bằng scaleSkill để khớp đúng core:
 * hàng năng lượng và mỗi hệ số tăng theo cấp (sát thương, hồi máu, hệ số hiệu ứng).
 */
export function skillLevelTable(def: SkillDef): { readonly label: string; readonly values: readonly string[] }[] {
  const levels = Array.from({ length: SKILL_MAX_LEVEL }, (_, i) => scaleSkill(def, i + 1));
  const rows = [{ label: "Năng lượng", values: levels.map(d => String(d.cost)) }];
  def.steps.forEach((step, i) => {
    const at = (d: SkillDef) => d.steps[i]!;
    if (step.type === "damage") rows.push({ label: "Sát thương (% Công)", values: levels.map(d => pct((at(d) as typeof step).atk)) });
    else if (step.type === "heal") rows.push({ label: `Hồi máu (% máu tối đa)`, values: levels.map(d => pct((at(d) as typeof step).ratio)) });
    else if (step.type === "effect" && step.value && levels.at(-1)!.steps[i] !== step)
      rows.push({ label: `${EFFECT_NAME[step.effect]}${step.ofMaxHp ? " (% máu tối đa)" : step.ofAtk ? " (% Công)" : ""}`, values: levels.map(d => pct((at(d) as typeof step).value)) });
  });
  return rows;
}

/** Tác dụng bị động của thủ lĩnh khi đầy Nộ, đọc số từ PASSIVE trong core. */
export function passiveText(element: Element): string {
  const P = PASSIVE;
  const effect: Record<Element, string> = {
    moc: `Cả đội Hồi phục ${pct(P.mocTeamRegen)} máu tối đa mỗi lượt.`,
    kim: `Đánh thường và kỹ năng của thủ lĩnh bỏ qua ${pct(P.kimPierce)} DEF; kỹ năng xuyên Khiên.`,
    thuy: `Đóng băng ngay 1 đối thủ; kỹ năng sát thương của thủ lĩnh có ${pct(P.thuyFreezeChance)} cơ hội Đóng băng thêm.`,
    hoa: `Mọi sát thương của thủ lĩnh +${pct(P.hoaDamage)}, đổi lại DEF bản thân −${pct(P.hoaDefDown)}.`,
    tho: `Thủ lĩnh nhận Khiên ${pct(P.thoShield)} máu tối đa và Phản đòn ${pct(P.thoReflect)}.`,
    loi: `Trừ ${P.loiDrain} năng lượng mọi đối thủ; mỗi ô âm dương ghép được thêm ${P.loiEnergyPerTile} năng lượng.`,
    phong: `Được xoay lốc xoáy miễn phí ${P.phongFreeWhirlTurns} nấc trước kỹ năng và đổi ô, ${P.phongFreeWhirls} lần mỗi lần kích hoạt.`,
  };
  return `${effect[element]} Tự kích hoạt khi Nộ đạt ${RAGE_MAX}, hiệu lực ${PASSIVE_TURNS} lượt của phe.`;
}

/** Cách tích Nộ và luật kích hoạt bị động thủ lĩnh, theo addRage trong battle.ts. */
export function rageTriggerText(): string[] {
  return [
    `Chỉ thủ lĩnh còn sống mới tích Nộ: mỗi ô trống trận ghép +${RAGE_PER_DRUM}, Trống da +${TRONG_DA_RAGE}, Trống đồng +${TRONG_DONG_RAGE}; thủ lĩnh mất ${Math.round(100 / RAGE_PER_HP_RATIO)}% máu tối đa +1.`,
    `Nộ đạt ${RAGE_MAX} thì tự kích hoạt ngay, Nộ về 0. Trong ${PASSIVE_TURNS} lượt hiệu lực không tích thêm Nộ.`,
    "Tác dụng của bị động này không mở cơ hội phối hợp hay truy kích.",
  ];
}

/** Tín hiệu phối hợp: chỉ kỹ năng (kể cả truy kích) tạo ra, đọc theo battle.ts và combo-engine.ts. */
export const COMBO_SIGNAL_TEXT: Record<ComboSignalKind, string> = {
  armorBroken: "kỹ năng áp Thủ− lên mục tiêu (mới, mạnh hơn hoặc lâu hơn)",
  controlled: "kỹ năng áp Đóng băng hoặc Câm lặng lên mục tiêu",
  dispelled: "kỹ năng xua tan hiệu ứng có lợi của mục tiêu",
  skillDamage: "kỹ năng làm mục tiêu mất HP thực (phần Khiên đỡ không tính)",
  healed: "kỹ năng hồi HP thực (phần hồi tràn không tính)",
  shieldAbsorbed: "kỹ năng cấp Khiên cho đồng đội và Khiên đó thực sự đỡ đòn kiếm/kỹ năng của địch",
};

const signals = (kinds: readonly ComboSignalKind[]) => kinds.map((k) => COMBO_SIGNAL_TEXT[k]).join(" hoặc ");

/** Điều kiện mở và dùng cơ hội của bị động nghề 1 (COMBO_PASSIVES). */
export function comboTriggerText(p: ComboPassiveDef): string[] {
  return [
    p.receiverOnly
      ? "Mở khi Khiên do một đồng đội khác chủ động cấp cho chính mình đỡ đòn kiếm/kỹ năng của địch."
      : `Mở khi một đồng đội khác dùng ${signals(p.triggers)}${p.triggers.some((k) => k !== "healed" && k !== "shieldAbsorbed") ? " (tín hiệu phải nhắm vào địch)" : ""}.`,
    `Không mở khi bản thân đã gục, đang bị Câm lặng/Đóng băng hoặc đang giữ một cơ hội; mỗi lượt của phe mở tối đa 1 lần.`,
    `Cơ hội không tự tung chiêu: ${p.targeted ? "chỉ dùng được lên đúng mục tiêu vừa nhận tín hiệu, " : ""}hết hạn sau hai lượt thường kế tiếp; bị xua tan${p.targeted ? " hoặc mục tiêu gục" : ""} thì mất.`,
  ];
}

/** Điều kiện phản ứng của bị động truy kích (CHASE_PASSIVES), theo combo-engine.ts flush. */
export function chaseTriggerText(p: ChasePassiveDef): string[] {
  const skipped: Record<ChasePassiveDef["effect"], string> = {
    damage: "không còn địch sống",
    heal: "cả đội đầy máu",
    shield: "người nhận đã có Khiên lớn hơn",
    armor: "mục tiêu đã có Thủ− bằng hoặc mạnh hơn",
    drain: "mục tiêu hết năng lượng",
    energy: "người nhận đầy năng lượng",
  };
  return [
    `Tự phản ứng ngay khi ${p.alliesOnly ? "một đồng đội khác" : "bất kỳ ai trong phe, kể cả bản thân,"} dùng ${signals(p.triggers)}; không tốn lượt hay năng lượng.`,
    `Không phản ứng khi bản thân bị Câm lặng/Đóng băng hoặc ${skipped[p.effect]}. Mỗi bị động một lần mỗi chuỗi; cả chuỗi tối đa ${CHASE_LIMITS.maxReactions} phản ứng, sâu ${CHASE_LIMITS.maxDepth}.`,
  ];
}
