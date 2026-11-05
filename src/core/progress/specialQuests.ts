// Chuỗi nhiệm vụ phụ mở hai nhân vật đặc biệt Đinh Ngọc và Trần Vũ Phong (docs/03-characters/dinh-ngoc.md mục
// "Mở khóa và tích hợp dự kiến"; Shan chốt 03/11/2026, chọn làm chuỗi 3 bước 04/11/2026).
// Hiện sau khi qua hết một chương Chiến dịch; ba bước nối tiếp, server ghi tiến độ trong lần ghi hồ sơ cuối trận
// và cấp nhân vật đúng một lần ở cấp 1. Không bán bằng vàng, không quay ngẫu nhiên.

import type { Element, FighterConfig } from "../battle";
import type { CampaignChapter } from "../campaign/storyNodes";
import { companionById, specialById } from "../roster";
import { chapterCompleted } from "./campaignState";
import { NEW_PROGRESS } from "./progress";
import type { Profile } from "./profile";

export type SpecialCompanionId = "dinhNgoc" | "vuPhong";

export const SPECIAL_COMPANION_IDS: readonly SpecialCompanionId[] = ["dinhNgoc", "vuPhong"];

export function isSpecialCompanionId(x: unknown): x is SpecialCompanionId {
  return typeof x === "string" && (SPECIAL_COMPANION_IDS as readonly string[]).includes(x);
}

/** Bước 1: số trận thắng cần, mỗi trận đội có ít nhất bao nhiêu hệ khác nhau. */
export const SPECIAL_DIVERSE_WINS = 3;
export const SPECIAL_DIVERSE_ELEMENTS = 3;

/** Bước 0..2 đang làm; 3 là đã xong (nhân vật đã gia nhập). */
export type SpecialQuestStep = 0 | 1 | 2 | 3;

export interface SpecialQuestProgress {
  readonly step: SpecialQuestStep;
  /** Bước 1: số trận thắng hợp lệ đã có. */
  readonly wins: number;
}

export type SpecialQuestState = Readonly<Partial<Record<SpecialCompanionId, SpecialQuestProgress>>>;

export interface SpecialQuestDef {
  readonly id: SpecialCompanionId;
  readonly title: string;
  /** Qua hết chương này của Chiến dịch thì nhiệm vụ hiện. */
  readonly chapter: CampaignChapter;
  readonly intro: string;
  /** Lời ba bước, theo thứ tự. */
  readonly steps: readonly [string, string, string];
  /** Hai người đi cùng nhân vật ở trận cuối (nhân vật kèm khởi đầu). */
  readonly escorts: readonly [string, string];
  readonly lines: { readonly before: string; readonly win: string; readonly lose: string };
}

export const SPECIAL_QUESTS: readonly SpecialQuestDef[] = [
  {
    id: "dinhNgoc",
    title: "Giữ đường cứu trợ",
    chapter: 2,
    intro: "Một cô gái đeo mặt ngọc giọt nước dẫn dân qua vùng loạn, đi đâu cũng có người xin theo.",
    steps: [
      `Thắng ${SPECIAL_DIVERSE_WINS} trận, mỗi trận đội có ít nhất ${SPECIAL_DIVERSE_ELEMENTS} hệ khác nhau.`,
      "Thắng một tầng Tháp Thí Luyện có luật nghề hoặc hệ.",
      "Đấu với Đinh Ngọc để chứng tỏ đội đủ sức giữ đường.",
    ],
    escorts: ["maiThanh", "leThach"],
    lines: {
      before: "Đường này dân còn phải đi. Muốn giữ nó thì cho ta xem các người giữ nổi mình trước đã.",
      win: "Được. Từ giờ đoàn người có thêm một tay đỡ, ta đi cùng các người.",
      lose: "Chưa đủ vững. Nghỉ một chút rồi quay lại, ta vẫn đợi ở đầu đường.",
    },
  },
  {
    id: "vuPhong",
    title: "Tìm Vân Du Tử",
    chapter: 4,
    intro: "Người đi đường kể về một kẻ lang thang theo gió, hình xăm mây chạy dọc cánh tay, giúp ai rồi lại đi.",
    steps: [
      `Thắng ${SPECIAL_DIVERSE_WINS} trận, mỗi trận đội có ít nhất ${SPECIAL_DIVERSE_ELEMENTS} hệ khác nhau.`,
      "Thắng một tầng Tháp Thí Luyện có luật nghề hoặc hệ.",
      "Đấu với Trần Vũ Phong ở bến sông để mời anh ở lại.",
    ],
    escorts: ["haVan", "toKim"],
    lines: {
      before: "Mời ta ở lại thì phải giữ được ta. Gió không đứng yên cho ai đâu.",
      win: "Lâu rồi mới có đội giữ được nhịp gió. Thôi được, ta đi một đoạn với các người.",
      lose: "Gió đổi chiều rồi. Lần sau đuổi kịp thì nói tiếp.",
    },
  },
];

export function specialQuestById(id: string): SpecialQuestDef | undefined {
  return SPECIAL_QUESTS.find((q) => q.id === id);
}

/** Đã qua chương mở nhiệm vụ. */
export function specialQuestOpen(profile: Profile, id: SpecialCompanionId): boolean {
  const def = specialQuestById(id)!;
  return chapterCompleted(profile.campaign, def.chapter);
}

/** Tiến độ hiện tại; đã có nhân vật thì luôn là xong. */
export function specialQuestProgress(profile: Profile, id: SpecialCompanionId): SpecialQuestProgress {
  if (Object.hasOwn(profile.companions, id)) return { step: 3, wins: SPECIAL_DIVERSE_WINS };
  return profile.specialQuests?.[id] ?? { step: 0, wins: 0 };
}

function withQuest(profile: Profile, id: SpecialCompanionId, q: SpecialQuestProgress): Profile {
  return { ...profile, specialQuests: { ...profile.specialQuests, [id]: q } };
}

/** Những nhiệm vụ đang mở, chưa xong, đang ở bước `step`. */
function activeAt(profile: Profile, step: SpecialQuestStep): SpecialCompanionId[] {
  return SPECIAL_COMPANION_IDS.filter(
    (id) => specialQuestOpen(profile, id) && specialQuestProgress(profile, id).step === step,
  );
}

/**
 * Bước 1: cộng một trận thắng nếu đội người chơi có đủ số hệ khác nhau. Gọi cho mọi trận có thưởng tính cho
 * đội của người chơi (không gọi cho Nhật Lệnh, vì đội là đội của đề).
 */
export function recordSpecialMatch(
  profile: Profile,
  m: { readonly won: boolean; readonly elements: readonly Element[] },
): Profile {
  if (!m.won || new Set(m.elements).size < SPECIAL_DIVERSE_ELEMENTS) return profile;
  let next = profile;
  for (const id of activeAt(profile, 0)) {
    const wins = specialQuestProgress(next, id).wins + 1;
    next = withQuest(next, id, wins >= SPECIAL_DIVERSE_WINS ? { step: 1, wins } : { step: 0, wins });
  }
  return next;
}

/** Bước 2: thắng một tầng Tháp Thí Luyện có luật nghề/hệ (`hasRules`). */
export function recordSpecialTrialWin(profile: Profile, hasRules: boolean): Profile {
  if (!hasRules) return profile;
  let next = profile;
  for (const id of activeAt(profile, 1))
    next = withQuest(next, id, { step: 2, wins: specialQuestProgress(next, id).wins });
  return next;
}

/** Đang chờ trận cuối với chính nhân vật. */
export function specialFinalReady(profile: Profile, id: SpecialCompanionId): boolean {
  return specialQuestOpen(profile, id) && specialQuestProgress(profile, id).step === 2;
}

/** Độ khó trận cuối. */
export const SPECIAL_FINAL_DIFFICULTY = "hard" as const;

/**
 * Đối thủ trận cuối 3vs3: nhân vật đặc biệt và hai người đi cùng, cùng cấp với nhân vật chính của người chơi.
 * `leveled` dựng đối thủ AI ở một cấp (truyền leveledFoe vào để module này không phụ thuộc vòng vào profile.ts).
 */
export function specialFinalFoes(
  id: SpecialCompanionId,
  level: number,
  leveled: (base: FighterConfig, level: number) => FighterConfig,
): FighterConfig[] {
  const def = specialQuestById(id)!;
  const bases = [specialById(id)!, ...def.escorts.map((e) => companionById(e)!)];
  return bases.map((b) => leveled(b, level));
}

/** Thắng trận cuối: nhân vật gia nhập ở cấp 1. Gọi lại lần nữa không đổi gì. */
export function joinSpecialCompanion(profile: Profile, id: SpecialCompanionId): { profile: Profile; joined: boolean } {
  if (Object.hasOwn(profile.companions, id) || !specialFinalReady(profile, id)) return { profile, joined: false };
  const next = withQuest(
    { ...profile, companions: { ...profile.companions, [id]: NEW_PROGRESS } },
    id,
    { step: 3, wins: SPECIAL_DIVERSE_WINS },
  );
  return { profile: next, joined: true };
}

export function parseSpecialQuests(raw: unknown): SpecialQuestState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Partial<Record<SpecialCompanionId, SpecialQuestProgress>> = {};
  for (const id of SPECIAL_COMPANION_IDS) {
    const q = (raw as Record<string, unknown>)[id] as Partial<SpecialQuestProgress> | undefined;
    if (!q || typeof q !== "object") continue;
    const step = q.step;
    const wins = Number.isInteger(q.wins) && q.wins! >= 0 ? Math.min(q.wins!, SPECIAL_DIVERSE_WINS) : 0;
    if (step === 0 || step === 1 || step === 2 || step === 3) out[id] = { step, wins };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
