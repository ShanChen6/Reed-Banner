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
  /** Bốn kết thúc riêng (cần cả rút dân và viện binh): hệ số vàng thưởng. Không có thì dùng luật sao chung. */
  readonly endingGold?: { readonly full: number; readonly taken: number; readonly refuge: number };
}

const HOLD = { turns: 8, power: 1.2 };
const GATE = { hpScale: 1.2, defScale: 2 };
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
  },
  /** Hai thung lũng: giặc kéo viện binh xuống thành ngày 8 và 13; giữ được Đèo Ngang (lối hội quân) thì chặn. */
  thuongDu: {
    reinforcements: { days: [8, 13], power: 0.15, label: "viện binh" },
    // Đèo là lũy 3 địch trên đường dài nhất trong sáu sa bàn: giữ ngắn hơn, địch không mạnh thêm.
    hold: { nodes: ["deo-ngang"], turns: 6, power: 1 },
  },
  /** Ngã ba sông: chiếm Kho Thóc Bãi Giữa thì hai ngày sau giặc lội sông phản công. */
  chauTho: {
    counter: { node: "kho-thoc", ...COUNTER },
  },
  /** Kinh thành: viện binh vào thành ngày 4 và 7; giữ được Lũy Cầu Tây thì chặn đường viện. */
  kinhThanh: {
    reinforcements: { days: [4, 7], power: 0.15, label: "viện binh" },
    hold: { nodes: ["cau-tay"], ...HOLD },
  },
  /** Thành đảo: cổng thành phải phá, trừ khi đổ bộ từ Làng Đảo Rùa vào bến sau. */
  quanDao: {
    gate: { skipFrom: "dao-rua", ...GATE },
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
      chaseTurns: 6,
      chaseFoes: 3,
      chasePower: 1.2,
    },
    reinforcements: { days: [5, 9], power: 0.15, label: "thuyền viện" },
    hold: { nodes: ["doi-cat"], ...HOLD },
    counter: { node: "cho-song", ...COUNTER },
    gate: { skipFrom: "bai-can", ...GATE },
    endingGold: { full: 1.5, taken: 1, refuge: 0.6 },
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
