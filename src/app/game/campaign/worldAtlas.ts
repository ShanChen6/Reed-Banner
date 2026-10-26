// Bản đồ Sử ký toàn cảnh (Campaign V2 MAP-00): 13 điểm = Hoa Lư (đầu não của Đinh Bộ Lĩnh, không phải sứ quân)
// và 12 cứ điểm sứ quân. Khác 24 nhiệm vụ: một điểm gắn được nhiều nhiệm vụ, nhiệm vụ đọc từ STORY_NODES theo tên
// đất. Tọa độ là bố cục minh họa trên khung 3:2 (tâm thành trên tranh nền), giữ thứ tự vùng theo vị trí gần đúng
// ngày nay; không phải tọa độ lịch sử hay đường hành quân. Bình Kiều không có tọa độ vì sử ghi "nay không rõ chỗ nào". Hàm thuần, test được.

import {
  CAMPAIGN_FACTION_RESOLUTIONS,
  STORY_NODES,
  campaignFactionView,
  companionById,
  factionResolutionOf,
  storyNodeById,
  type CampaignChapter,
  type CampaignFactionState,
  type CampaignLedgerGroup,
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

/**
 * Kinh độ, vĩ độ gần đúng theo vùng đất ngày nay (như bản đồ 24 điểm cũ). Không vẽ trực tiếp: chỉ để test giữ
 * đúng thứ tự đông/tây/bắc/nam của bố cục minh họa bên dưới.
 */
export const PLACE_LON_LAT: Readonly<
  Record<string, readonly [number, number]>
> = {
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

/**
 * Tâm thành trên tranh nền của Shan (public/art/campaign/world-map.webp, 1536×1024). Tranh vẽ theo ảnh hướng dẫn
 * dãn từ PLACE_LON_LAT nên giữ thứ tự vùng; tọa độ đo lại trên tranh để cờ cắm đúng lên thành.
 */
const PLACE_AT: Readonly<Record<string, readonly [number, number]>> = {
  "Hoa Lư": [845, 825],
  "Bố Hải Khẩu": [1200, 718],
  "Đằng Châu": [942, 600],
  "Đường Lâm": [407, 358],
  "Tam Đái": [598, 170],
  "Phong Châu": [388, 215],
  "Hồi Hồ": [157, 162],
  "Siêu Loại": [1265, 315],
  "Tiên Du": [985, 235],
  "Tế Giang": [1012, 468],
  "Tây Phù Liệt": [760, 410],
  "Đỗ Động Giang": [528, 550],
};

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
  const at = PLACE_AT[place];
  return {
    id,
    place,
    faction,
    certainty: loc.certainty,
    ...(loc.modernRegion ? { modernRegion: loc.modernRegion } : {}),
    missions: missionsAt(place),
    at: at ?? null,
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

/** Người giữ đất: tên sứ quân, hoặc Đinh Bộ Lĩnh ở Hoa Lư. */
export function strongholdLeader(s: WorldStronghold): string {
  return s.faction
    ? (companionById(s.faction)?.name ?? s.faction)
    : "Đinh Bộ Lĩnh";
}

export function strongholdById(id: string): WorldStronghold | undefined {
  return WORLD_STRONGHOLDS.find((s) => s.id === id);
}

export function strongholdOfMission(
  id: CampaignMissionId,
): WorldStronghold | undefined {
  return WORLD_STRONGHOLDS.find((s) => s.missions.includes(id));
}

/**
 * Trạng thái cờ trên bản đồ: chỉ theo thế cục server đã ghi. Chưa ghi thì cờ trung tính, không lộ kết cục trước
 * khi người chơi đi qua nhiệm vụ.
 */
export type StrongholdState = "hq" | "unresolved" | CampaignLedgerGroup;

export function strongholdState(
  s: WorldStronghold,
  factions: CampaignFactionState,
): StrongholdState {
  if (!s.faction) return "hq";
  if (!campaignFactionView(factions, s.faction).resolved) return "unresolved";
  return factionResolutionOf(s.faction)!.group;
}

/**
 * Chỗ đặt tên đất so với cờ: mặc định bên phải; vài điểm đặt bên trái hoặc dưới thành vì bên phải đã có cờ hay
 * thành khác (test kiểm không đè nhau).
 */
const LABEL_SIDE: Readonly<Partial<Record<StrongholdId, "left" | "below">>> = {
  phamBachHo: "left",
  ngoNhatKhanh: "below",
  kieuThuan: "below",
  nguyenSieu: "left",
  doCanhThac: "below",
};

/** Cờ dời sang bên tâm thành ở nơi cờ sẽ đè lên thành hay tên đất phía trên. */
const FLAG_DX: Readonly<Partial<Record<StrongholdId, number>>> = {
  phamBachHo: -45,
  ngoNhatKhanh: 70,
  kieuCongHan: -70,
};

export type Box = readonly [x0: number, y0: number, x1: number, y1: number];

export interface StrongholdGlyph {
  /** Hệ số cỡ: Hoa Lư to hơn. */
  readonly scale: number;
  /** Chân cột cờ (cờ mọc từ tâm thành hoặc lệch sang bên). */
  readonly pole: readonly [number, number];
  readonly flag: Box;
  /** Khung thành trên tranh nền (thành tranh vẽ to hơn thành SVG dự phòng). */
  readonly city: Box;
  readonly label: Box;
  readonly labelX: number;
  readonly anchor: "start" | "middle" | "end";
}

export const PLACE_FONT = 28;
export const NAME_FONT = 20;
const LABEL_H = PLACE_FONT + NAME_FONT + 18;
/** Ước lượng bề ngang chữ có chân (em trung bình), chỉ để xếp nhãn không đè nhau. */
const EM = 0.56;
/** Tên sứ quân in nghiêng có nhiều dấu chồng nên rộng hơn tên đất. */
const EM_ITALIC = 0.62;

/** Khung của cờ, thành và tên đất quanh một điểm; dùng chung cho vẽ và cho test không đè nhau. */
export function strongholdGlyph(
  s: WorldStronghold,
  speaker: string,
): StrongholdGlyph {
  const [cx, cy] = s.at ?? [0, 0];
  const k = s.faction ? 1.15 : 1.45;
  const px = cx + (FLAG_DX[s.id] ?? 0);
  const flag: Box = [px - 20 * k, cy - 112 * k, px + 20 * k, cy - 48 * k];
  // Kinh đô Hoa Lư trên tranh vẽ to gấp đôi các thành khác.
  const c = s.faction ? k : k * 2.1;
  const city: Box = [cx - 50 * c, cy - 30 * c, cx + 50 * c, cy + 30 * c];
  const w =
    Math.max(
      s.place.length * PLACE_FONT * EM,
      speaker.length * NAME_FONT * EM_ITALIC,
    ) + 20;
  const side = LABEL_SIDE[s.id] ?? "right";
  if (side === "below") {
    const top = city[3] + 4;
    return {
      scale: k,
      pole: [px, cy],
      flag,
      city,
      label: [cx - w / 2, top, cx + w / 2, top + LABEL_H],
      labelX: cx,
      anchor: "middle",
    };
  }
  const left = side === "left";
  const x0 = left ? flag[0] - 10 - w : flag[2] + 10;
  const top = flag[1] + 8;
  return {
    scale: k,
    pole: [px, cy],
    flag,
    city,
    label: [x0, top, x0 + w, top + LABEL_H],
    labelX: left ? x0 + w - 8 : x0 + 8,
    anchor: left ? "end" : "start",
  };
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
