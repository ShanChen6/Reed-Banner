// Đấu trường bóng ma (lộ trình 5.5): PvP không đồng bộ. Mỗi người chơi để lại một đội phòng thủ (bản chụp
// đội 3vs3 lúc đặt); người khác đánh với đội đó do AI điều khiển. Điểm đấu trường tính kiểu Elo.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/02-game-modes/README.md mục 5.3.

import type { Difficulty } from "../ai";
import {
  withComboPassive,
  ELEMENTS,
  PROFESSIONS,
  type Element,
  type FighterConfig,
  type Profession,
} from "../battle";
import { WARLORD_ENCOUNTERS } from "../campaign";
import {
  autoProgress,
  leveledFoe,
  MAIN_ID,
  newProfile,
  profileTeam,
  progressOf,
  type Profile,
} from "../progress";
import { companionById } from "../roster/roster";
import { createRng, type Rng } from "../rng";
import { vnDay } from "../vnTime";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";

/** Điểm khởi đầu, cũng là điểm của bóng ma do máy tạo. */
export const ARENA_START = 1000;
/** Hệ số Elo của người đánh; người phòng thủ đổi một nửa. */
export const ARENA_K = 32;
export const ARENA_DEFENDER_K = 16;
/** Số trận được đánh mỗi ngày (đổi lúc 0 giờ giờ Việt Nam). */
export const ARENA_ATTACKS_PER_DAY = 10;
/** Số đối thủ bày ra để chọn. */
export const ARENA_OFFERS = 3;
/** AI điều khiển đội phòng thủ đánh ở mức này. */
export const ARENA_DIFFICULTY: Difficulty = "hard";
/** Vàng thưởng thêm khi thắng, ngoài thưởng trận thường. */
export const ARENA_WIN_GOLD = 50;

export const arenaDay = vnDay;

/**
 * Trần phần trang bị cộng thêm trong Quần Hùng, tính theo chỉ số gốc của cấp (Shan 18/11/2026). Không có trần thì
 * đội cấp 5 mặc đủ đồ Thần phẩm thắng đội cấp 30 không đồ khoảng 90% (mô phỏng 60 trận); trần 30% công và máu đưa
 * về khoảng 13%, còn cùng cấp thì đồ tốt vẫn hơn rõ. Thủ gốc nhỏ nên cho cộng gấp đôi.
 */
export const ARENA_GEAR_CAP = { atk: 0.3, maxHp: 0.3, def: 1 } as const;

/** Chỉ số trong Quần Hùng: không thấp hơn chỉ số gốc của cấp, phần cộng từ trang bị không quá trần. */
export function capArenaGear(config: FighterConfig, base: FighterConfig): FighterConfig {
  const clamp = (stat: keyof typeof ARENA_GEAR_CAP) =>
    Math.max(base[stat], Math.min(config[stat], Math.round(base[stat] * (1 + ARENA_GEAR_CAP[stat]))));
  return { ...config, maxHp: clamp("maxHp"), atk: clamp("atk"), def: clamp("def") };
}

/** Đội ra trận Quần Hùng của một hồ sơ: như đội thường, trang bị theo trần ARENA_GEAR_CAP. */
export function arenaTeam(profile: Profile, companionIds: readonly string[]): FighterConfig[] {
  const geared = profileTeam(profile, companionIds);
  const bare = profileTeam({ ...profile, loadouts: {} }, companionIds);
  return geared.map((f, i) => capArenaGear(f, bare[i] ?? f));
}

/** Chỉ số gốc (không trang bị) của một người trong đội phòng thủ, dựng lại theo công thức hiện hành. */
function memberBase(m: ArenaMember): FighterConfig | null {
  if (m.id === MAIN_ID)
    return profileTeam({ ...newProfile(), element: m.element, profession: m.profession, main: autoProgress(m.level, null) })[0] ?? null;
  const companion = companionById(m.id);
  return companion ? leveledFoe(companion, m.level) : null;
}

/** Một người trong đội phòng thủ, đủ để hiện cho người đánh xem trước. */
export interface ArenaMember {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
}

/** Đội phòng thủ: bản chụp chỉ số lúc đặt, nâng cấp sau đó không tự cập nhật. */
export interface ArenaDefense {
  readonly team: readonly FighterConfig[];
  readonly members: readonly ArenaMember[];
  /** Lực chiến: tổng chỉ số, chỉ để hiện. */
  readonly power: number;
}

export function teamPower(team: readonly FighterConfig[]): number {
  return team.reduce((a, f) => a + Math.round(f.maxHp / 10 + f.atk + f.def), 0);
}

function defenseFrom(
  team: readonly FighterConfig[],
  levels: readonly number[],
): ArenaDefense {
  return {
    team,
    members: team.map((f, i) => ({
      id: f.id,
      name: f.name,
      element: f.element,
      profession: f.profession,
      level: levels[i] ?? 1,
    })),
    power: teamPower(team),
  };
}

/** Chụp đội 3vs3 đang chọn ở hồ sơ làm đội phòng thủ. */
export function defenseOf(profile: Profile): ArenaDefense {
  const team = arenaTeam(profile, profile.team);
  return defenseFrom(
    team,
    team.map((f) => progressOf(profile, f.id).level),
  );
}

const POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
];

function pickDistinct<T>(rng: Rng, items: readonly T[], n: number): T[] {
  const pool = [...items];
  return Array.from(
    { length: n },
    () => pool.splice(rng.int(0, pool.length - 1), 1)[0]!,
  );
}

/** Tên bóng ma do máy tạo: theo vùng đất của các sứ quân. */
export function botName(seed: number): string {
  const rng = createRng(seed >>> 0);
  return `Bóng ma ${WARLORD_ENCOUNTERS[rng.int(0, WARLORD_ENCOUNTERS.length - 1)]!.modernRegion.split(",")[0]}`;
}

/**
 * Đội bóng ma do máy tạo khi chưa đủ người chơi thật: Đinh Bộ Lĩnh nguyên tố, nghề ngẫu nhiên và 2 nhân vật
 * kèm, cùng cấp với người đánh, không trang bị.
 */
export function botDefense(seed: number, level: number): ArenaDefense {
  const rng = createRng((seed ^ 0x9e3779b9) >>> 0);
  const element = ELEMENTS[rng.int(0, ELEMENTS.length - 1)]!;
  const profession = PROFESSIONS[rng.int(0, PROFESSIONS.length - 1)]!;
  const [main] = profileTeam({
    ...newProfile(),
    element,
    profession,
    main: autoProgress(level, null),
  });
  const team = [
    main!,
    ...pickDistinct(rng, POOL, 2).map((f) => leveledFoe(f, level)),
  ];
  return defenseFrom(
    team,
    team.map(() => level),
  );
}

/**
 * Đội phòng thủ đưa vào trận: bản chụp giữ kỹ năng người chơi đã chọn, chỉ số kẹp lại theo cấp đã chụp (bản chụp cũ
 * đặt trước khi có trần trang bị cũng bị kẹp). Đổi tên nhân vật chính thành tên người chơi, để hai Đinh Bộ Lĩnh
 * không trùng tên.
 */
export function ghostTeam(
  defense: ArenaDefense,
  name: string,
): FighterConfig[] {
  return defense.team.map((f, i) => {
    const member = defense.members[i];
    const base = member ? memberBase(member) : null;
    const capped = base ? capArenaGear(f, base) : f;
    return withComboPassive(i === 0 ? { ...capped, name } : capped);
  });
}

/** Lực chiến của đội phòng thủ như khi vào trận (đã kẹp trang bị). */
export const defensePower = (defense: ArenaDefense): number => teamPower(ghostTeam(defense, ""));

/** Điểm thay đổi sau một trận: người đánh theo ARENA_K, người phòng thủ ngược dấu theo ARENA_DEFENDER_K. */
export function arenaDelta(
  attacker: number,
  defender: number,
  won: boolean,
): { attacker: number; defender: number } {
  const expected = 1 / (1 + 10 ** ((defender - attacker) / 400));
  const s = (won ? 1 : 0) - expected;
  return {
    attacker: Math.round(ARENA_K * s),
    defender: -Math.round(ARENA_DEFENDER_K * s),
  };
}
