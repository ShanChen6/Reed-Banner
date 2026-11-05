// Viễn Chinh: kịch bản cố định của từng sa bàn, ghép từ các khối luật (đường bị phá, con nước, rút dân, viện binh,
// trận giữ, phản công kho lương, phá cổng). Thiết kế: docs/02-game-modes/expedition/03-cua-bien-thiet-ke.md (Cửa Biển)
// và docs/02-game-modes/expedition/01-vien-chinh-gdd.md mục 4 (năm sa bàn kia).

import type { ExpeditionMapId } from "./maps";

/**
 * Kịch bản của một sa bàn: ghép từ các khối luật, khối nào bỏ trống là sa bàn đó không có. Cửa Biển dùng đủ các khối
 * và có bốn kết thúc riêng; năm sa bàn kia mỗi nơi một hai khối nhẹ và giữ luật sao chung.
 */
export interface ExpeditionScenario {
  /** Đường bị phá: mỗi lượt chọn `count` đường trong `edges` theo seed. Vẽ như đường thường tới khi lộ. */
  readonly broken?: { readonly edges: readonly (readonly [string, string])[]; readonly count: number };
  /** Cửa nước: đường loại `tide` chỉ qua được vào các ngày này. Lịch ẩn tới khi chiếm `revealedBy` hoặc đưa dân về. */
  readonly tide?: { readonly days: readonly number[]; readonly revealedBy: string };
  /** Rút dân: ghé `village` thì nhận đoàn dân, đưa tới `home` (hoặc kho lương đã giữ được) là xong. */
  readonly refugees?: {
    readonly village: string;
    readonly home: string;
    /** Rời làng khi đồn này chưa chiếm (và ô tới không có trận) thì truy binh đuổi theo. */
    readonly chaseUnless: string;
    readonly chaseTurns: number;
    readonly chaseFoes: number;
    readonly chasePower: number;
    /** Tên việc trên bảng nhiệm vụ (mặc định "Rút dân") và người được đưa về (mặc định "đoàn dân"). */
    readonly title?: string;
    readonly noun?: string;
  };
  /**
   * Viện binh tới thành đích cuối các ngày này, mỗi lần địch ở thành mạnh thêm `power`; thắng trận giữ ở một ô `hold`
   * thì cắt. `label` là tên hiển thị (thuyền viện, viện binh).
   */
  readonly reinforcements?: { readonly days: readonly number[]; readonly power: number; readonly label: string };
  /** Trận giữ ở các ô này: cầm cự đủ lượt là thắng (cầu phao, đèo, lũy cầu). */
  readonly hold?: { readonly nodes: readonly string[]; readonly turns: number; readonly power: number };
  /** Phản công kho lương: `afterDays` ngày sau khi chiếm. */
  readonly counter?: {
    readonly node: string;
    readonly afterDays: number;
    readonly turns: number;
    readonly foes: number;
    readonly power: number;
    /** Không có đạo giữ (hoặc thua): địch chiếm lại với máu này. */
    readonly retakenHp: number;
    readonly food: number;
  };
  /** Phá cổng ở thành đích, trừ khi đánh vào từ `skipFrom` (cửa sau). */
  readonly gate?: { readonly skipFrom?: string; readonly hpScale: number; readonly defScale: number };
  /**
   * Hệ số sức mạnh của mọi địch trên sa bàn (bỏ trống là 1), một số cho mọi bậc hoặc ba số cho Bậc I / II / III: sa bàn
   * nhiều việc phụ thì địch nhẹ hơn để còn ngày.
   */
  readonly foePower?: number | readonly [number, number, number];
  /**
   * Sa bàn không có bốn kết thúc riêng: thắng mà đã làm xong mọi nhiệm vụ (đưa người về, chặn viện binh) thì vàng
   * thưởng nhân hệ số này. Không chặn qua bậc, không đổi sao.
   */
  readonly missionGold?: number;
  /** Bốn kết thúc riêng (cần cả rút dân và viện binh): hệ số vàng thưởng. Không có thì dùng luật sao chung. */
  readonly endingGold?: { readonly full: number; readonly taken: number; readonly refuge: number };
}

const HOLD = { turns: 8, power: 1.2 };
const GATE = { hpScale: 1.2, defScale: 2 };
const MISSION_GOLD = 1.3;
const CHASE = { chaseTurns: 6, chaseFoes: 3, chasePower: 1.2 };
/** Truy binh ở năm sa bàn thường (nhiệm vụ không bắt buộc): nhẹ hơn Cửa Biển. */
const LIGHT_CHASE = { chaseTurns: 5, chaseFoes: 2, chasePower: 1 };
const COUNTER = { afterDays: 2, turns: 6, foes: 3, power: 1.4, retakenHp: 0.6, food: 20 };

export const EXPEDITION_SCENARIOS: Readonly<Partial<Record<ExpeditionMapId, ExpeditionScenario>>> = {
  /** Đèo đá biên ải: giặc lấp hai trong bốn lối đèo; thành đích có cổng đá phải phá. */
  aiBac: {
    broken: {
      edges: [
        ["khe-da", "deo-may"],
        ["deo-may", "gac-bac"],
        ["suoi-lanh", "bai-lau"],
        ["bai-lau", "gac-nam"],
      ],
      count: 2,
    },
    gate: GATE,
    // Tù binh bị giam ở Kho Ngựa Thồ: chiếm kho, đưa về Bản Na; Lũy Đèo Mây chưa chiếm thì truy binh đuổi theo.
    refugees: { village: "kho-ngua", home: "ban-na", chaseUnless: "deo-may", ...LIGHT_CHASE, title: "Giải cứu tù binh", noun: "tù binh" },
    // Bậc III làm nhiệm vụ còn dưới 30% thắng (Shan muốn mọi bậc từ 30%): chỉ hạ bậc III.
    foePower: [1, 1, 0.97],
    missionGold: MISSION_GOLD,
  },
  /** Hai thung lũng: giặc kéo viện binh xuống thành ngày 8 và 13; giữ được Đèo Ngang (lối hội quân) thì chặn. */
  thuongDu: {
    reinforcements: { days: [8, 13], power: 0.15, label: "viện binh" },
    // Đèo là lũy 3 địch trên đường dài nhất trong sáu sa bàn: giữ ngắn hơn, địch không mạnh thêm.
    hold: { nodes: ["deo-ngang"], turns: 6, power: 1 },
    // Dân thung lũng đông lánh lên Đèo Ngang (lũy của ta khi đã giữ): giữ đèo trước thì đi yên.
    refugees: { village: "ruong-bac", home: "deo-ngang", chaseUnless: "deo-ngang", ...LIGHT_CHASE, title: "Đưa dân lên đèo" },
    foePower: [1, 1, 0.9],
    missionGold: MISSION_GOLD,
  },
  /** Ngã ba sông: chiếm Kho Thóc Bãi Giữa thì hai ngày sau giặc lội sông phản công. */
  chauTho: {
    counter: { node: "kho-thoc", ...COUNTER },
    // Dân bờ tây sang Trại Bờ Đông, hoặc vào Kho Thóc nếu đã giữ kho qua đợt phản công.
    refugees: { village: "lang-ruong", home: "trai-dong", chaseUnless: "ben-lau", ...LIGHT_CHASE },
    foePower: [1, 1, 0.95],
    missionGold: MISSION_GOLD,
  },
  /** Kinh thành: viện binh vào thành ngày 4 và 7; giữ được Lũy Cầu Tây thì chặn đường viện. */
  kinhThanh: {
    reinforcements: { days: [4, 7], power: 0.15, label: "viện binh" },
    hold: { nodes: ["cau-tay"], ...HOLD },
    missionGold: MISSION_GOLD,
  },
  /** Thành đảo: cổng thành phải phá, trừ khi đổ bộ từ Làng Đảo Rùa vào bến sau. */
  quanDao: {
    gate: { skipFrom: "dao-rua", ...GATE },
    // Thuyền viện vào thành ngày 4 và 7; giữ Lũy Cầu Dài thì chặn. Đi vòng Đảo Rùa thì tránh cổng mà không chặn được.
    reinforcements: { days: [4, 7], power: 0.15, label: "thuyền viện" },
    hold: { nodes: ["cau-dai"], ...HOLD },
    missionGold: MISSION_GOLD,
  },
  cuaBien: {
    broken: {
      edges: [
        ["ben-coi", "cho-song"],
        ["bai-su", "doi-cat"],
        ["bai-su", "mui-cat"],
        ["mui-cat", "bai-can"],
      ],
      count: 2,
    },
    tide: { days: [4, 7, 10], revealedBy: "dai-trieu" },
    refugees: {
      village: "lang-chai",
      home: "trai-ben",
      chaseUnless: "ben-coi",
      ...CHASE,
    },
    reinforcements: { days: [5, 9], power: 0.15, label: "thuyền viện" },
    hold: { nodes: ["doi-cat"], ...HOLD },
    counter: { node: "cho-song", ...COUNTER },
    gate: { skipFrom: "bai-can", ...GATE },
    endingGold: { full: 1.5, taken: 1, refuge: 0.6 },
    foePower: 0.87,
  },
};

export const expeditionScenarioOf = (run: { readonly map: ExpeditionMapId }): ExpeditionScenario | undefined =>
  EXPEDITION_SCENARIOS[run.map];

/** Kết thúc của sa bàn có bốn kết thúc riêng (Cửa Biển): toàn thắng, chiếm trại, giữ dân (thắng phụ). */
export type ExpeditionEnding = "full" | "taken" | "refuge";

export const EXPEDITION_ENDING_NAME: Readonly<Record<ExpeditionEnding, string>> = {
  full: "Toàn thắng",
  taken: "Chiếm trại",
  refuge: "Giữ dân",
};
