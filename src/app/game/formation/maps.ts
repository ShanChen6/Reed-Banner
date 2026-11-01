// Kho bản đồ nền của sa bàn Trận Đồ: địa danh thật của thời Loạn 12 sứ quân (Shan chốt 02/11/2026). Ô chưa khai thông
// được ô che (ảnh đặc kín) che đi; đặt quân thì ô lộ mảnh bản đồ bên dưới; hoàn thành thì hiện cả bản đồ.
// Bản đồ đổi theo kỳ: chọn theo `theme` của ván (suy từ seed/muối, như nhau với mọi người trong kỳ).
//
// TẠM THỜI: mỗi địa danh dùng một tranh nền chiến dịch có sẵn làm ảnh giữ chỗ (8 ảnh cho 13 địa danh nên có lặp). Khi có
// ảnh bản đồ thật (Shan sẽ cho thiết kế): thả file `public/art/formation/maps/<id>.webp` và đổi `src`. Yêu cầu ảnh và
// prompt: docs/05-ui-ux/screens/tran-do.md mục 3.

import { WARLORD_ENCOUNTERS } from "@/core";

export interface FormationMap {
  /** Id ổn định (id sứ quân, hoặc `hoaLu`), dùng đặt tên file ảnh. */
  readonly id: string;
  /** Địa danh theo sổ nguồn sử Campaign V2. */
  readonly place: string;
  readonly src: string;
  /** Một dòng giới thiệu hiện khi hoàn thành bản đồ. */
  readonly blurb: string;
}

const PLACEHOLDERS = [
  "/art/campaign/bg/hoalu.webp",
  "/art/campaign/bg/bohaikhau.webp",
  "/art/campaign/bg/damnuoc.webp",
  "/art/campaign/bg/chung.webp",
  "/art/campaign/bg/dangquang.webp",
  "/art/campaign/bg/quannghi.webp",
  "/art/campaign/bg/thanhluy.webp",
  "/art/campaign/bg/atlas.webp",
] as const;

/** Hoa Lư (căn cứ của Đinh Bộ Lĩnh) cộng 12 địa danh của 12 sứ quân theo danh mục `WARLORD_ENCOUNTERS`. */
export const MAP_POOL: readonly FormationMap[] = [
  {
    id: "hoaLu",
    place: "Hoa Lư",
    src: PLACEHOLDERS[0],
    blurb: "Hoa Lư, Ninh Bình: vùng núi đá vôi nơi Đinh Bộ Lĩnh dựng căn cứ, sau này là kinh đô Đại Cồ Việt.",
  },
  ...WARLORD_ENCOUNTERS.map((w, i): FormationMap => ({
    id: w.id,
    place: w.place,
    src: PLACEHOLDERS[(i + 1) % PLACEHOLDERS.length]!,
    blurb: `${w.place} (nay thuộc ${w.modernRegion}): vùng của ${w.foes[0]?.name ?? "một sứ quân"} thời Loạn 12 sứ quân.`,
  })),
];

/** Mỗi bậc lệch một khoảng khác nhau để trong cùng một kỳ các bậc không trùng bản đồ. */
const LEVEL_OFFSET: Readonly<Record<string, number>> = { "huong-dan": 0, thuong: 1, kho: 2, "dai-tran": 3, "tuy-chinh": 4 };

/** Bản đồ của một ván: xoay trong kho theo `theme` (đổi theo kỳ vì seed đổi theo kỳ). */
export function mapFor(levelId: string, theme: number): FormationMap {
  return MAP_POOL[(Math.abs(Math.trunc(theme)) + (LEVEL_OFFSET[levelId] ?? 0)) % MAP_POOL.length]!;
}
