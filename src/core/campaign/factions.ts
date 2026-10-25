// Thế cục 12 sứ quân trong Campaign V2 (FactionState): mỗi sứ quân được giải quyết bởi đúng một nhiệm vụ,
// kết cục theo warlord-matrix.md. Kết cục là lịch sử cố định của game: lựa chọn trình diễn không đổi được,
// và server chỉ ghi một lần khi nhiệm vụ đó hoàn thành (applyCampaignFirstClear).

import type { CampaignMissionId, RaidTargetId } from "./storyNodes";

export type CampaignFactionId = RaidTargetId;

/** Phân loại quan hệ/kết cục của history-sources.md mục 2 (taxonomy biên tập). */
export type CampaignFactionStatus =
  | "allied"
  | "submitted"
  | "dispersed"
  | "defeated";

/**
 * Cách kết cục được kể trong game:
 * - `alliance`: liên minh có sử chép (Trần Lãm).
 * - `recordedSubmission`: sử chép việc đem quân về hàng (Phạm Phòng Át, E09).
 * - `reconstructedAccord`: tổng thuật nói quy phục, cách thức là hội đàm do game tái dựng.
 * - `politicalAccord`: thỏa thuận chính trị/giảng hòa tái dựng; quan hệ về sau để ngỏ.
 * - `regionalAccession`: thế lực suy dần, các làng trong vùng lần lượt theo về; không có trận hay lễ hàng (Lữ Đường,
 *   theo hướng kể S07, độ tin cậy vừa–thấp).
 * - `dispersal` / `campaign`: tan rã hoặc đánh dẹp theo tổng thuật.
 */
export type CampaignFactionSettlement =
  | "alliance"
  | "recordedSubmission"
  | "reconstructedAccord"
  | "politicalAccord"
  | "regionalAccession"
  | "dispersal"
  | "campaign";

/**
 * Nhóm trong sổ thế cục 12 vùng (CAMP-06.04), theo ledger đã duyệt: 1 liên minh, 3 quy phục, 6 đánh dẹp và
 * 2 kết cục tan rã/còn tranh luận. Lữ Đường vẫn có trạng thái `submitted` theo W10 nhưng được xếp vào nhóm
 * chưa chắc vì chứng cứ kết cục yếu (S07, U06); không gộp chung với ba trường hợp quy phục chắc hơn.
 */
export type CampaignLedgerGroup =
  | "alliance"
  | "submission"
  | "military"
  | "uncertain";

export const CAMPAIGN_LEDGER_GROUPS: readonly CampaignLedgerGroup[] = [
  "alliance",
  "submission",
  "military",
  "uncertain",
];

/** Số sứ quân mỗi nhóm theo ledger; bảng lệch thì báo lỗi lúc tải. */
export const CAMPAIGN_LEDGER_EXPECTED: Readonly<
  Record<CampaignLedgerGroup, number>
> = { alliance: 1, submission: 3, military: 6, uncertain: 2 };

export interface CampaignFactionResolution {
  readonly faction: CampaignFactionId;
  readonly mission: CampaignMissionId;
  readonly status: CampaignFactionStatus;
  readonly settlement: CampaignFactionSettlement;
  /** Độ tin cậy của kết cục theo warlord-matrix (cột thứ hai). */
  readonly confidence: "high" | "medium" | "mediumLow";
  readonly group: CampaignLedgerGroup;
}

/** Giá trị ghi trong hồ sơ: chỉ trạng thái và nhiệm vụ đã ghi nó. */
export interface CampaignFactionRecord {
  readonly status: CampaignFactionStatus;
  readonly mission: CampaignMissionId;
}

export type CampaignFactionState = Readonly<
  Partial<Record<CampaignFactionId, CampaignFactionRecord>>
>;

const resolution = (
  faction: CampaignFactionId,
  mission: CampaignMissionId,
  status: CampaignFactionStatus,
  settlement: CampaignFactionSettlement,
  confidence: CampaignFactionResolution["confidence"],
): CampaignFactionResolution => ({
  faction,
  mission,
  status,
  settlement,
  confidence,
  group:
    settlement === "dispersal" || settlement === "regionalAccession"
      ? "uncertain"
      : status === "allied"
        ? "alliance"
        : status === "submitted"
          ? "submission"
          : "military",
});

/** Theo mission-matrix.md (cột "12 sứ quân") và warlord-matrix.md W01–W12. */
export const CAMPAIGN_FACTION_RESOLUTIONS: readonly CampaignFactionResolution[] =
  [
    resolution("tranLam", "M06", "allied", "alliance", "high"),
    resolution("phamBachHo", "M11", "submitted", "recordedSubmission", "high"),
    resolution(
      "ngoXuongXi",
      "M12",
      "submitted",
      "reconstructedAccord",
      "medium",
    ),
    resolution("ngoNhatKhanh", "M13", "submitted", "politicalAccord", "medium"),
    resolution("nguyenKhoan", "M14", "dispersed", "dispersal", "mediumLow"),
    resolution("kieuCongHan", "M15", "defeated", "campaign", "medium"),
    resolution("kieuThuan", "M16", "defeated", "campaign", "medium"),
    resolution("lyKhue", "M17", "defeated", "campaign", "medium"),
    resolution("nguyenThuTiep", "M18", "defeated", "campaign", "medium"),
    resolution("luDuong", "M19", "submitted", "regionalAccession", "mediumLow"),
    resolution("nguyenSieu", "M20", "defeated", "campaign", "medium"),
    resolution("doCanhThac", "M21", "defeated", "campaign", "medium"),
  ];

export const CAMPAIGN_FACTION_IDS: readonly CampaignFactionId[] =
  CAMPAIGN_FACTION_RESOLUTIONS.map((r) => r.faction);

export function factionResolutionOfMission(
  mission: string,
): CampaignFactionResolution | undefined {
  return CAMPAIGN_FACTION_RESOLUTIONS.find((r) => r.mission === mission);
}

export function factionResolutionOf(
  faction: string,
): CampaignFactionResolution | undefined {
  return CAMPAIGN_FACTION_RESOLUTIONS.find((r) => r.faction === faction);
}

export type CampaignFactionView =
  | { readonly faction: CampaignFactionId; readonly resolved: false }
  | {
      readonly faction: CampaignFactionId;
      readonly resolved: true;
      readonly status: CampaignFactionStatus;
      /** Cách kết cục được kể, theo phân loại ledger; suy từ bảng, không lưu riêng trong hồ sơ. */
      readonly resolutionMethod: CampaignFactionSettlement;
      readonly confidence: CampaignFactionResolution["confidence"];
      readonly mission: CampaignMissionId;
    };

/** Thế cục một sứ quân như hồ sơ server đang ghi. */
export function campaignFactionView(
  factions: CampaignFactionState,
  faction: CampaignFactionId,
): CampaignFactionView {
  const record = factions[faction];
  const r = factionResolutionOf(faction);
  if (!record || !r) return { faction, resolved: false };
  return {
    faction,
    resolved: true,
    status: record.status,
    resolutionMethod: r.settlement,
    confidence: r.confidence,
    mission: record.mission,
  };
}

/**
 * Ghi kết cục của nhiệm vụ vào thế cục nếu chưa có. Trả `recorded: false` khi nhiệm vụ không giải quyết
 * sứ quân nào hoặc sứ quân đã có kết cục (hoàn thành lại, gửi lại cùng event).
 */
export function recordFactionResolution(
  factions: CampaignFactionState,
  mission: CampaignMissionId,
): {
  readonly factions: CampaignFactionState;
  readonly resolution?: CampaignFactionResolution;
  readonly recorded: boolean;
} {
  const r = factionResolutionOfMission(mission);
  if (!r) return { factions, recorded: false };
  if (factions[r.faction]) return { factions, resolution: r, recorded: false };
  return {
    factions: {
      ...factions,
      [r.faction]: { status: r.status, mission: r.mission },
    },
    resolution: r,
    recorded: true,
  };
}

/**
 * Dựng lại thế cục từ danh sách nhiệm vụ đã hoàn thành. Parser dùng hàm này để hồ sơ luôn khớp bảng:
 * dữ liệu sửa tay hoặc hồ sơ dev hoàn thành M06 trước khi có thế cục đều được chuẩn hóa.
 */
export function factionStateFromCompleted(
  completed: readonly CampaignMissionId[],
): CampaignFactionState {
  let factions: CampaignFactionState = {};
  for (const mission of completed)
    factions = recordFactionResolution(factions, mission).factions;
  return factions;
}

export interface CampaignWorldLedgerRow {
  readonly resolution: CampaignFactionResolution;
  readonly view: CampaignFactionView;
}

export interface CampaignWorldLedger {
  readonly rows: readonly CampaignWorldLedgerRow[];
  /** Số sứ quân đã có kết cục trong mỗi nhóm. */
  readonly resolved: Readonly<Record<CampaignLedgerGroup, number>>;
  readonly resolvedCount: number;
  readonly allResolved: boolean;
  /** Nhiệm vụ còn phải xong để mọi sứ quân có kết cục. */
  readonly missingMissions: readonly CampaignMissionId[];
}

/**
 * Sổ thế cục 12 vùng, chỉ đọc thế cục hồ sơ server đang ghi. Đếm theo nhóm kết cục, không đếm "trận thắng":
 * liên minh, quy phục, đánh dẹp và tan rã/còn tranh luận được giữ riêng.
 */
export function campaignWorldLedger(
  factions: CampaignFactionState,
): CampaignWorldLedger {
  const resolved: Record<CampaignLedgerGroup, number> = {
    alliance: 0,
    submission: 0,
    military: 0,
    uncertain: 0,
  };
  const rows = CAMPAIGN_FACTION_RESOLUTIONS.map((resolution) => {
    const view = campaignFactionView(factions, resolution.faction);
    if (view.resolved) resolved[resolution.group] += 1;
    return { resolution, view };
  });
  const missingMissions = rows
    .filter((row) => !row.view.resolved)
    .map((row) => row.resolution.mission);
  return {
    rows,
    resolved,
    resolvedCount: rows.length - missingMissions.length,
    allResolved: missingMissions.length === 0,
    missingMissions,
  };
}

function tableErrors(): string[] {
  const errors: string[] = [];
  const factions = new Set<string>();
  const missions = new Set<string>();
  for (const r of CAMPAIGN_FACTION_RESOLUTIONS) {
    if (factions.has(r.faction)) errors.push(`${r.faction}: resolved twice`);
    if (missions.has(r.mission))
      errors.push(`${r.mission}: resolves two factions`);
    factions.add(r.faction);
    missions.add(r.mission);
  }
  if (factions.size !== 12) errors.push("expected 12 factions");
  for (const group of CAMPAIGN_LEDGER_GROUPS)
    if (
      CAMPAIGN_FACTION_RESOLUTIONS.filter((r) => r.group === group).length !==
      CAMPAIGN_LEDGER_EXPECTED[group]
    )
      errors.push(`${group}: ledger count differs`);
  return errors;
}

const FACTION_ERRORS = tableErrors();
if (FACTION_ERRORS.length > 0)
  throw new Error(
    `Invalid Campaign faction table: ${FACTION_ERRORS.join("; ")}`,
  );
