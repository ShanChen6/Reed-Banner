// Bản đồ Sử ký toàn cảnh (Campaign V2 MAP-00): 13 điểm = Hoa Lư (đầu não của Đinh Bộ Lĩnh, không phải sứ quân)
// và 12 cứ điểm sứ quân. Khác 24 nhiệm vụ: một điểm gắn được nhiều nhiệm vụ, nhiệm vụ đọc từ STORY_NODES theo tên
// đất. Tọa độ là bố cục minh họa trên khung 3:2, dãn từ vị trí gần đúng ngày nay; không phải tọa độ lịch sử hay
// đường hành quân. Bình Kiều không có tọa độ vì sử ghi "nay không rõ chỗ nào". Hàm thuần, test được.

import {
  CAMPAIGN_FACTION_RESOLUTIONS,
  STORY_NODES,
  storyNodeById,
  type CampaignChapter,
  type CampaignFactionId,
  type CampaignMissionId,
  type StoryLocation,
} from "@/core";
import type { DialogueBackdrop } from "./dialogue";

/** Khung tọa độ chung của bản đồ và tranh nền (tranh 1536×1024 vẽ đúng khung này). */
export const WORLD_W = 1536;
export const WORLD_H = 1024;

export type StrongholdId = "hoaLu" | CampaignFactionId;

export interface WorldStronghold {
  readonly id: StrongholdId;
  /** Tên đất như nhiệm vụ ghi. */
  readonly place: string;
  /** Sứ quân giữ đất; Hoa Lư là đầu não nên không có. */
  readonly faction: CampaignFactionId | null;
  readonly certainty: StoryLocation["certainty"];
  readonly modernRegion?: string;
  /** Mọi nhiệm vụ đặt ở đất này, theo thứ tự STORY_NODES. */
  readonly missions: readonly CampaignMissionId[];
  /** Điểm trên khung WORLD_W × WORLD_H; null = chưa định vị được, hiện trong danh sách riêng. */
  readonly at: readonly [number, number] | null;
}

/** Các tên gọi khác nhau của cùng một đất trong nhiệm vụ. */
const PLACE_ALIAS: Readonly<Record<string, string>> = {
  "Vùng Bố Hải": "Bố Hải Khẩu",
};

const placeOf = (name: string) => PLACE_ALIAS[name] ?? name;

/** Kinh độ, vĩ độ gần đúng (giống bản đồ cũ mapLayout.ts), chỉ để định hướng. */
const PLACE_LON_LAT: Readonly<Record<string, readonly [number, number]>> = {
  "Hoa Lư": [105.88, 20.25],
  "Bố Hải Khẩu": [106.35, 20.4],
  "Đằng Châu": [106.08, 20.62],
  "Đường Lâm": [105.38, 21.12],
  "Tam Đái": [105.6, 21.38],
  "Phong Châu": [105.36, 21.36],
  "Hồi Hồ": [105.12, 21.45],
  "Siêu Loại": [106.25, 21.12],
  "Tiên Du": [106.05, 21.3],
  "Tế Giang": [105.98, 20.86],
  "Tây Phù Liệt": [105.84, 21.02],
  "Đỗ Động Giang": [105.62, 20.86],
};

/** Dãn vùng các cứ điểm ra khung 3:2, chừa lề cho tên đất và cờ. */
export function worldAt(lon: number, lat: number): [number, number] {
  const x = 0.12 + ((lon - 105.12) / 1.23) * 0.76;
  const y = 0.18 + ((21.45 - lat) / 1.2) * 0.68;
  return [Math.round(x * WORLD_W), Math.round(y * WORLD_H)];
}

function missionsAt(place: string): CampaignMissionId[] {
  return STORY_NODES.filter((n) => placeOf(n.location.name) === place).map(
    (n) => n.id,
  );
}

function stronghold(
  id: StrongholdId,
  faction: CampaignFactionId | null,
  mission: CampaignMissionId,
): WorldStronghold {
  const loc = storyNodeById(mission)!.location;
  const place = placeOf(loc.name);
  const ll = PLACE_LON_LAT[place];
  return {
    id,
    place,
    faction,
    certainty: loc.certainty,
    ...(loc.modernRegion ? { modernRegion: loc.modernRegion } : {}),
    missions: missionsAt(place),
    at: ll ? worldAt(ll[0], ll[1]) : null,
  };
}

/** Hoa Lư trước, rồi 12 sứ quân theo thứ tự kết cục trong sổ thế cục. */
export const WORLD_STRONGHOLDS: readonly WorldStronghold[] = [
  stronghold("hoaLu", null, "M01"),
  ...CAMPAIGN_FACTION_RESOLUTIONS.map((r) =>
    stronghold(r.faction, r.faction, r.mission),
  ),
];

export const PLACED_STRONGHOLDS = WORLD_STRONGHOLDS.filter((s) => s.at);
export const UNPLACED_STRONGHOLDS = WORLD_STRONGHOLDS.filter((s) => !s.at);

export function strongholdById(id: string): WorldStronghold | undefined {
  return WORLD_STRONGHOLDS.find((s) => s.id === id);
}

export function strongholdOfMission(
  id: CampaignMissionId,
): WorldStronghold | undefined {
  return WORLD_STRONGHOLDS.find((s) => s.missions.includes(id));
}

/** Nhiệm vụ không thuộc đất nào (M22 tổng kết các vùng): chỉ hiện trong danh sách của chương. */
export const UNANCHORED_MISSIONS: readonly CampaignMissionId[] =
  STORY_NODES.filter((n) => !strongholdOfMission(n.id)).map((n) => n.id);

/** Các điểm có nhiệm vụ trong chương: làm nổi khi chọn chương, điểm khác giảm sáng. */
export function chapterStrongholds(
  missions: readonly CampaignMissionId[],
): readonly StrongholdId[] {
  return WORLD_STRONGHOLDS.filter((s) =>
    s.missions.some((m) => missions.includes(m)),
  ).map((s) => s.id);
}

/** Hình nhỏ của từng chương ở cột Sử ký, cắt từ ảnh nền thoại (public/art/campaign/thumb/). */
export const CHAPTER_THUMB: Readonly<
  Record<CampaignChapter, DialogueBackdrop>
> = {
  1: "hoalu",
  2: "bohaikhau",
  3: "quannghi",
  4: "thanhluy",
  5: "damnuoc",
  6: "dangquang",
};

export const chapterThumbUrl = (c: CampaignChapter) =>
  `/art/campaign/thumb/${CHAPTER_THUMB[c]}.webp`;
