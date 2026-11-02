// Nhân vật dung hợp của Trận Đồ: mang đủ 8 nghề và 7 hệ như Đinh Ngọc (docs/03-characters/dinh-ngoc.md), nên khớp mọi
// quân kề nhưng vẫn phải đặt sát một quân. Shan chốt 01/11/2026: chỉ giữ loại nhân vật này (không có quân 2 nghề +
// 2 hệ vì làm ván dễ đi), tối đa HAI nhân vật.
//
// Dự kiến (Shan, 01/11/2026): Đinh Ngọc và Trần Vũ Phong – Vân Du Tử (Vũ Phong còn DRAFT). Chỉ xuất hiện ở bậc Khó và Đại trận.
//
// Đã bật Đinh Ngọc và Vũ Phong ở Khó và Đại trận (Shan yêu cầu 02/11/2026); chân dung lấy từ `portrait-data.ts`. Hai nhân
// vật chưa vào roster nên chỉ là quân của Trận Đồ. Thêm một nhân vật là thêm một dòng (tối đa HAI), rồi chạy
// `pnpm exec tsx scripts/binh-phap-sim.ts` để đo ảnh hưởng tới độ khó và tăng `version` của các bậc liên quan.

import type { FusionCharacter } from "./types";

/** Số nhân vật dung hợp tối đa (Shan chốt). Test kiểm tra danh sách không vượt mức này. */
export const MAX_FUSION_CHARACTERS = 2;

/** Các bậc được phép có quân dung hợp (Shan chốt 01/11/2026). Test kiểm tra mọi mục trong danh sách nằm trong tập này. */
export const FUSION_ALLOWED_LEVELS: readonly string[] = ["kho", "dai-tran"];

export const FUSION_CHARACTERS: readonly FusionCharacter[] = [
  { characterId: "dinhNgoc", name: "Đinh Ngọc", levels: ["kho", "dai-tran"] },
  { characterId: "vuPhong", name: "Vũ Phong", levels: ["kho", "dai-tran"] },
];

export function fusionsForLevel(levelId: string, all: readonly FusionCharacter[] = FUSION_CHARACTERS): readonly FusionCharacter[] {
  return all.filter((f) => f.levels.includes(levelId));
}
