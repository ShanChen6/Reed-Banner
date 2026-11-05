// Viễn Chinh: kịch bản cố định của sa bàn (bản đầu chỉ Cửa Biển). Sa bàn không có kịch bản chạy luật của GDD.
// Thiết kế và số liệu: docs/02-game-modes/expedition/03-cua-bien-thiet-ke.md.

import type { ExpeditionMapId } from "./maps";

export interface ExpeditionScenario {
  /** Các đường có thể bị phá; mỗi lượt chọn `brokenCount` đường theo seed. Vẽ như đường thường tới khi lộ. */
  readonly breakable: readonly (readonly [string, string])[];
  readonly brokenCount: number;
  /** Cửa nước: đường loại `tide` chỉ qua được vào các ngày này. Lịch ẩn tới khi chiếm `revealedBy` hoặc đưa dân về. */
  readonly tide: { readonly days: readonly number[]; readonly revealedBy: string };
  /** Rút dân: ghé `village` thì nhận đoàn dân, đưa tới `home` (hoặc Chợ đã giữ được) là xong. */
  readonly refugees: {
    readonly village: string;
    readonly home: string;
    /** Rời làng khi đồn này chưa chiếm (và ô tới không có trận) thì truy binh đuổi theo. */
    readonly chaseUnless: string;
    readonly chaseTurns: number;
    readonly chaseFoes: number;
    readonly chasePower: number;
  };
  /** Thuyền viện tới thành đích cuối các ngày này, mỗi lần địch ở thành mạnh thêm `power`; giữ được cầu thì cắt. */
  readonly reinforcements: { readonly days: readonly number[]; readonly power: number };
  /** Trận giữ cầu ở mọi ô loại `bridge`. */
  readonly bridge: { readonly turns: number; readonly power: number };
  /** Phản công kho lương: `afterDays` ngày sau khi chiếm. */
  readonly counter: {
    readonly node: string;
    readonly afterDays: number;
    readonly turns: number;
    readonly foes: number;
    readonly power: number;
    /** Không có đạo giữ (hoặc thua): địch chiếm lại với máu này. */
    readonly retakenHp: number;
    readonly food: number;
  };
  /** Phá cổng ở thành đích, trừ khi đánh vào từ `skipFrom` (cửa nước). */
  readonly gate: { readonly skipFrom: string; readonly hpScale: number; readonly defScale: number };
  /** Hệ số vàng thưởng kết thúc. */
  readonly endingGold: { readonly full: number; readonly taken: number; readonly refuge: number };
}

export const EXPEDITION_SCENARIOS: Readonly<Partial<Record<ExpeditionMapId, ExpeditionScenario>>> = {
  cuaBien: {
    breakable: [
      ["ben-coi", "cho-song"],
      ["bai-su", "doi-cat"],
      ["bai-su", "mui-cat"],
      ["mui-cat", "bai-can"],
    ],
    brokenCount: 2,
    tide: { days: [4, 7, 10], revealedBy: "dai-trieu" },
    refugees: {
      village: "lang-chai",
      home: "trai-ben",
      chaseUnless: "ben-coi",
      chaseTurns: 6,
      chaseFoes: 3,
      chasePower: 1.2,
    },
    reinforcements: { days: [5, 9], power: 0.15 },
    bridge: { turns: 8, power: 1.2 },
    counter: { node: "cho-song", afterDays: 2, turns: 6, foes: 3, power: 1.4, retakenHp: 0.6, food: 20 },
    gate: { skipFrom: "bai-can", hpScale: 1.2, defScale: 2 },
    endingGold: { full: 1.5, taken: 1, refuge: 0.6 },
  },
};

export const expeditionScenarioOf = (run: { readonly map: ExpeditionMapId }): ExpeditionScenario | undefined =>
  EXPEDITION_SCENARIOS[run.map];

/** Kết thúc của lượt có kịch bản: toàn thắng, chiếm trại, giữ dân (thắng phụ). */
export type ExpeditionEnding = "full" | "taken" | "refuge";

export const EXPEDITION_ENDING_NAME: Readonly<Record<ExpeditionEnding, string>> = {
  full: "Toàn thắng",
  taken: "Chiếm trại",
  refuge: "Giữ dân",
};
