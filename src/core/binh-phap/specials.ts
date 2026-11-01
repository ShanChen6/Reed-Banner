// Nhân vật dung hợp của Trận Đồ: mang đủ 8 nghề và 7 hệ như Đinh Ngọc (docs/03-characters/dinh-ngoc.md), nên khớp mọi
// quân kề nhưng vẫn phải đặt sát một quân. Shan chốt 01/11/2026: chỉ giữ loại nhân vật này (không có quân 2 nghề +
// 2 hệ vì làm ván dễ đi), tối đa HAI nhân vật.
//
// MẶC ĐỊNH RỖNG. Mỗi nhân vật chỉ được thêm vào đây sau khi Shan duyệt (thông số, hình, mở khóa), nên không ai thấy
// quân chưa duyệt. Thêm một nhân vật là thêm một dòng, ví dụ:
//   { characterId: "dinhNgoc", name: "Đinh Ngọc", levels: ["dai-tran"] }
// rồi chạy `pnpm exec tsx scripts/binh-phap-sim.ts` để đo ảnh hưởng tới độ khó và tăng `version` của các bậc liên quan.

import type { FusionCharacter } from "./types";

/** Số nhân vật dung hợp tối đa (Shan chốt). Test kiểm tra danh sách không vượt mức này. */
export const MAX_FUSION_CHARACTERS = 2;

export const FUSION_CHARACTERS: readonly FusionCharacter[] = [];

export function fusionsForLevel(levelId: string, all: readonly FusionCharacter[] = FUSION_CHARACTERS): readonly FusionCharacter[] {
  return all.filter((f) => f.levels.includes(levelId));
}
