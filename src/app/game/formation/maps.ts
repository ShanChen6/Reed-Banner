// Kho ảnh nền của sa bàn Trận Đồ (tranh vẽ tay 2D điện ảnh như nền Bình Loạn): địa danh thật thời Loạn 12 sứ quân và giai đoạn Ngô – Đinh, cộng cảnh quan chung
// (Shan chốt 02/11/2026, **không giới hạn số ảnh**). Ô chưa khai thông được ô che (ảnh đặc kín) che đi; đặt quân thì ô lộ
// mảnh bản đồ bên dưới; hoàn thành thì hiện cả bản đồ. Bản đồ đổi theo kỳ: chọn theo `theme` của ván (suy từ seed/muối,
// như nhau với mọi người trong kỳ).
//
// Thêm bản đồ mới: thả `public/art/formation/maps/<id>.webp`, thêm một dòng vào MAP_POOL, và thêm prompt vào
// docs/06-art/prompts/tran-do-hinh-anh.md mục 1.3 (test kiểm đủ). Bản đồ chưa có ảnh thật dùng tranh nền chiến dịch làm
// ảnh giữ chỗ (8 ảnh lặp); ảnh thật thêm id vào REAL_MAPS.

import { WARLORD_ENCOUNTERS } from "@/core";

export interface FormationMap {
  /** Id ổn định (id sứ quân hoặc id tự đặt), dùng đặt tên file ảnh và khóa prompt trong docs. */
  readonly id: string;
  /** Địa danh hoặc tên cảnh quan hiển thị khi hoàn thành bản đồ. */
  readonly place: string;
  readonly src: string;
  /** Một dòng giới thiệu hiện khi hoàn thành bản đồ. */
  readonly blurb: string;
  /** `lich-su`: địa danh thật; `canh-quan`: cảnh quan chung minh họa, không phải địa danh cụ thể. */
  readonly kind: "lich-su" | "canh-quan";
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

/** Bản đồ đã có ảnh thật (`public/art/formation/maps/<id>.webp`); thêm id vào đây khi thả ảnh mới. */
const REAL_MAPS: ReadonlySet<string> = new Set(["hoaLu", "tranLam", "phamBachHo", "ngoXuongXi", "ngoNhatKhanh"]);

const srcFor = (id: string, n: number) => (REAL_MAPS.has(id) ? `/art/formation/maps/${id}.webp` : PLACEHOLDERS[n % PLACEHOLDERS.length]!);

/** Địa danh thật có thêm ngoài 12 sứ quân. */
const HISTORIC: readonly Omit<FormationMap, "src" | "kind">[] = [
  { id: "coLoa", place: "Cổ Loa", blurb: "Cổ Loa (nay thuộc Đông Anh, Hà Nội): thành đất nhiều vòng có hào nước, gắn với Ngô Quyền xưng vương năm 939." },
  { id: "bachDang", place: "Bạch Đằng", blurb: "Bạch Đằng (nay thuộc Quảng Ninh – Hải Phòng): cửa sông nhiều bãi nước triều, nơi Ngô Quyền đánh bại quân Nam Hán năm 938." },
  { id: "daiLa", place: "Đại La", blurb: "Đại La (nay là Hà Nội): thành lớn bên sông Hồng, trung tâm của vùng Giao Châu từ thời Đường, nơi về sau là Thăng Long." },
  { id: "luyLau", place: "Luy Lâu", blurb: "Luy Lâu (nay thuộc Thuận Thành, Bắc Ninh): trị sở cổ của vùng Giao Châu, nơi giao nhau của nhiều dòng sông và đường buôn bán." },
  { id: "aiChau", place: "Ái Châu", blurb: "Ái Châu (nay thuộc Thanh Hóa): vùng đất phía nam đồng bằng sông Hồng, quê hương Dương Đình Nghệ, nơi khởi nghiệp của nhiều thủ lĩnh cuối thời Bắc thuộc." },
  { id: "hoanChau", place: "Hoan Châu", blurb: "Hoan Châu (nay thuộc Nghệ An – Hà Tĩnh): vùng biên viễn phía nam của nước Việt thế kỷ X, nhiều núi sát biển." },
  { id: "tanVien", place: "Núi Tản Viên", blurb: "Núi Tản Viên (nay thuộc Ba Vì, Hà Nội): ngọn núi thiêng gắn với truyền thuyết Sơn Tinh, nhìn xuống đồng bằng sông Hồng (truyền thuyết, không phải sử kiện)." },
];

/** Cảnh quan chung (minh họa, không phải địa danh cụ thể). */
const LANDSCAPES: readonly Omit<FormationMap, "src" | "kind">[] = [
  { id: "dongLua", place: "Đồng lúa đồng bằng", blurb: "Cánh đồng lúa của đồng bằng sông Hồng với bờ ruộng, mương nước và xóm làng (cảnh quan minh họa, không phải địa danh cụ thể)." },
  { id: "damSen", place: "Đầm sen", blurb: "Đầm sen rộng với những lối đi hẹp và chòi canh (cảnh quan minh họa)." },
  { id: "langVenSong", place: "Làng ven sông", blurb: "Làng ven sông với lũy tre, cổng làng và bến nước (cảnh quan minh họa)." },
  { id: "benThuyen", place: "Bến thuyền sông", blurb: "Bến thuyền ở ngã ba sông, nơi buôn bán và trú quân (cảnh quan minh họa)." },
  { id: "trungDu", place: "Vùng trung du", blurb: "Gò đồi trung du với ruộng bậc thang và rừng nhỏ (cảnh quan minh họa)." },
  { id: "cuaBien", place: "Cửa biển", blurb: "Cửa biển với bãi cát, ruộng muối và thuyền đánh cá (cảnh quan minh họa)." },
  { id: "chuaCoTrenDoi", place: "Chùa cổ trên đồi", blurb: "Ngôi chùa cổ trên đồi thông giữa đồng bằng (cảnh quan minh họa)." },
  { id: "thanhDatCoHao", place: "Thành đất có hào nước", blurb: "Thành đất cổ có hào nước bao quanh (cảnh quan minh họa)." },
  { id: "rungGia", place: "Rừng già", blurb: "Rừng già với lối mòn và thác nhỏ (cảnh quan minh họa)." },
  { id: "nuiDaVoi", place: "Núi đá vôi", blurb: "Dãy núi đá vôi dựng đứng bên thung lũng sông (cảnh quan minh họa)." },
];

/** Hoa Lư, 12 địa danh của 12 sứ quân (theo `WARLORD_ENCOUNTERS`), địa danh thật bổ sung rồi cảnh quan chung. */
export const MAP_POOL: readonly FormationMap[] = [
  {
    id: "hoaLu",
    place: "Hoa Lư",
    src: srcFor("hoaLu", 0),
    blurb: "Hoa Lư, Ninh Bình: vùng núi đá vôi nơi Đinh Bộ Lĩnh dựng căn cứ, sau này là kinh đô Đại Cồ Việt.",
    kind: "lich-su",
  },
  ...WARLORD_ENCOUNTERS.map((w, i): FormationMap => ({
    id: w.id,
    place: w.place,
    src: srcFor(w.id, i + 1),
    blurb: `${w.place} (nay thuộc ${w.modernRegion}): vùng của ${w.foes[0]?.name ?? "một sứ quân"} thời Loạn 12 sứ quân.`,
    kind: "lich-su",
  })),
  ...HISTORIC.map((m, i): FormationMap => ({ ...m, src: srcFor(m.id, i + 13), kind: "lich-su" })),
  ...LANDSCAPES.map((m, i): FormationMap => ({ ...m, src: srcFor(m.id, i + 20), kind: "canh-quan" })),
];

/** Mỗi bậc lệch một khoảng khác nhau để trong cùng một kỳ các bậc không trùng bản đồ. */
const LEVEL_OFFSET: Readonly<Record<string, number>> = { "huong-dan": 0, thuong: 1, kho: 2, "dai-tran": 3, "tuy-chinh": 4 };

/** Bản đồ của một ván: xoay trong kho theo `theme` (đổi theo kỳ vì seed đổi theo kỳ). */
export function mapFor(levelId: string, theme: number): FormationMap {
  return MAP_POOL[(Math.abs(Math.trunc(theme)) + (LEVEL_OFFSET[levelId] ?? 0)) % MAP_POOL.length]!;
}
