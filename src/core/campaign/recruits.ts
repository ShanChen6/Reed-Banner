// Mốc mở khóa sáu tướng lịch sử và mười hai sứ quân trong Campaign V2 (design-freeze mục 4.2 và 5).
// Mở khóa là phần thưởng gameplay, không phải mốc lịch sử về việc ai gia nhập lúc nào: mỗi tướng ghi rõ
// vai trò có nguồn, độ tin cậy và điều không được khẳng định (history-sources.md, narrative-bible.md).
// Cấp phát thật nằm ở applyCampaignFirstClear (rewards.ts), chạy trong một lần ghi CAS phía server.

import { HERO_COMPANIONS, WARLORD_COMPANIONS } from "../roster";
import {
  HISTORICAL_REFERENCE_IDS,
  STORY_NODES,
  type CampaignChapter,
  type CampaignCompanionId,
  type CampaignMissionId,
  type HistoricalBasis,
  type HistoricalReferenceId,
} from "./storyNodes";

/** Độ tin cậy theo claim, như ledger mục 2: không dùng phần trăm giả chính xác. */
export type HistoricalConfidence = "high" | "medium" | "low";

export interface CampaignRecruit {
  readonly id: CampaignCompanionId;
  readonly name: string;
  /** Nhiệm vụ chốt chương phát mở khóa (phải khớp unlockedContent của node). */
  readonly milestone: CampaignMissionId;
  readonly chapter: CampaignChapter;
  /** Vai trò lịch sử tóm tắt, chỉ trong giới hạn nguồn đã đọc. */
  readonly historicalRole: string;
  /** Vai trò trong game (nghề, nguyên tố, việc làm trong lời kể): luôn là lớp game. */
  readonly gameRole: string;
  readonly basis: readonly HistoricalBasis[];
  readonly historicalConfidence: HistoricalConfidence;
  readonly sourceRefs: readonly HistoricalReferenceId[];
  /** Điều UI và lời kể không được khẳng định. */
  readonly doNotClaim: string;
}

export const CAMPAIGN_RECRUITS: readonly CampaignRecruit[] = [
  {
    id: "dinhLien",
    name: "Đinh Liễn",
    milestone: "M04",
    chapter: 1,
    historicalRole:
      "Con trưởng của Đinh Bộ Lĩnh. Sử chép bị giữ làm con tin trong cuộc tiến quân năm 951, cùng cha sang nương tựa Trần Minh Công, và về Hoa Lư sau biến cố năm 965.",
    gameRole: "Pháp sư hệ Thủy.",
    basis: ["recorded"],
    historicalConfidence: "medium",
    sourceRefs: ["E04a", "S02", "E08", "S01", "E06"],
    doNotClaim:
      "Không nói Đinh Liễn gia nhập ở Phong Châu hay sau khi hạ một sứ quân, không gọi là bại tướng mới, không định tuổi chính xác.",
  },
  {
    id: "nguyenBac",
    name: "Nguyễn Bặc",
    milestone: "M08",
    chapter: 2,
    historicalRole:
      "Người cùng quê Hoa Lư trong truyện cờ lau thuở nhỏ của Đinh Bộ Lĩnh.",
    gameRole: "Tướng sĩ hệ Hỏa; tiếng nói trực diện về bảo vệ cộng đồng.",
    basis: ["legend"],
    historicalConfidence: "low",
    sourceRefs: ["E12", "S07"],
    doNotClaim:
      "Không nói ông được tuyển sau trận cờ lau (màn cũ) hay ở Bố Hải; mốc M08 chỉ là mốc mở khóa của game.",
  },
  {
    id: "dinhDien",
    name: "Đinh Điền",
    milestone: "M12",
    chapter: 3,
    historicalRole: "Thuộc nhóm bạn thuở nhỏ ở Hoa Lư trong truyện cờ lau.",
    gameRole: "Binh lính hệ Thổ; tổ chức đội ngũ và thao luyện trong lời kể.",
    basis: ["legend", "fictional"],
    historicalConfidence: "low",
    sourceRefs: ["E12", "S07"],
    doNotClaim:
      "Không gán nhiệm vụ quân sự cụ thể nào là có sử chép; không nói ông mang quân theo về Bố Hải như màn cũ.",
  },
  {
    id: "luuCo",
    name: "Lưu Cơ",
    milestone: "M16",
    chapter: 4,
    historicalRole:
      "Có liên hệ sớm với Đinh Bộ Lĩnh theo lớp truyền thuyết Hoa Lư.",
    gameRole: "Mưu sĩ hệ Kim; đọc bản đồ, nhắc giới hạn thông tin.",
    basis: ["legend", "fictional"],
    historicalConfidence: "low",
    sourceRefs: ["E12", "S07"],
    doNotClaim:
      "Vai trò quân sư là của game; không nói ông gia nhập sau Đằng Châu như màn cũ, không gán việc hạ Lý Khuê hay sứ quân nào.",
  },
  {
    id: "trinhTu",
    name: "Trịnh Tú",
    milestone: "M20",
    chapter: 5,
    historicalRole:
      "Có liên hệ sớm với Đinh Bộ Lĩnh theo lớp truyền thuyết Hoa Lư.",
    gameRole: "Y sư hệ Mộc; liên lạc, hậu cần và bảo toàn dân thường.",
    basis: ["legend", "fictional"],
    historicalConfidence: "low",
    sourceRefs: ["E12", "S07"],
    doNotClaim:
      "Vai trò y tế và hậu cần là của game; không nói ông gia nhập sau Bình Kiều như màn cũ.",
  },
  {
    id: "leHoan",
    name: "Lê Hoàn",
    milestone: "M24",
    chapter: 6,
    historicalRole:
      "Sử tổng hợp ghi ông giữ chức vụ quân sự dưới triều Đinh sau năm 968; nguồn không cho biết ông theo Đinh Bộ Lĩnh từ lúc nào.",
    gameRole: "Quân sư hệ Lôi; chỉ huy trẻ xuất hiện muộn trong lời kể.",
    basis: ["recorded", "reconstructed"],
    historicalConfidence: "medium",
    sourceRefs: ["S04", "E10"],
    doNotClaim:
      "Không nói ông gia nhập ở Tam Đái hay ở bất kỳ nhiệm vụ nào trước 968; các cảnh trước 968 là game tái dựng.",
  },
];

export function campaignRecruit(id: string): CampaignRecruit | undefined {
  return CAMPAIGN_RECRUITS.find((r) => r.id === id);
}

/** Nhiệm vụ chốt mở khóa tướng lịch sử `id` (theo unlockedContent của node). */
export function recruitMilestone(id: string): CampaignMissionId | undefined {
  return STORY_NODES.find((node) =>
    node.unlockedContent.some((u) => u.kind === "companion" && u.id === id),
  )?.id;
}

/**
 * Nhiệm vụ mở bán sứ quân `id` ở cửa hàng: mốc gặp sứ quân trong freeze mục 5 (M08–M21; với 6 sứ quân bị đánh dẹp
 * cũng là mốc mở Đánh trùm), không còn theo màn 13 màn cũ. Undefined với nhân vật không phải sứ quân.
 */
export function warlordUnlockMission(
  id: string,
): CampaignMissionId | undefined {
  return STORY_NODES.find((node) =>
    node.unlockedContent.some((u) => u.kind === "raid" && u.target === id),
  )?.id;
}

const REFS = new Set<string>(HISTORICAL_REFERENCE_IDS);

/** Lỗi bảng tuyển: lệch mốc so với node, thiếu tướng, nguồn ngoài allowlist, nhãn sử chép thiếu nguồn. */
export function recruitTableErrors(): string[] {
  const errors: string[] = [];
  const heroIds = HERO_COMPANIONS.map((c) => c.id).sort();
  const listed = CAMPAIGN_RECRUITS.map((r) => r.id as string).sort();
  if (heroIds.join() !== listed.join())
    errors.push("recruit table does not cover HERO_COMPANIONS");
  for (const r of CAMPAIGN_RECRUITS) {
    const hero = HERO_COMPANIONS.find((c) => c.id === r.id);
    if (hero && hero.name !== r.name) errors.push(`${r.id}: name mismatch`);
    const node = STORY_NODES.find((n) => n.id === r.milestone);
    if (recruitMilestone(r.id) !== r.milestone)
      errors.push(`${r.id}: milestone differs from story nodes`);
    if (node && node.chapter !== r.chapter)
      errors.push(`${r.id}: chapter differs from milestone`);
    if (r.sourceRefs.length === 0) errors.push(`${r.id}: no source refs`);
    for (const ref of r.sourceRefs)
      if (!REFS.has(ref)) errors.push(`${r.id}: unknown reference ${ref}`);
    if (r.historicalConfidence === "high" && !r.basis.includes("recorded"))
      errors.push(`${r.id}: high confidence without recorded basis`);
  }
  for (const w of WARLORD_COMPANIONS)
    if (!warlordUnlockMission(w.fighter.id))
      errors.push(`${w.fighter.id}: warlord has no story unlock`);
  return errors;
}

const RECRUIT_ERRORS = recruitTableErrors();
if (RECRUIT_ERRORS.length > 0)
  throw new Error(`Invalid Campaign recruits: ${RECRUIT_ERRORS.join("; ")}`);
