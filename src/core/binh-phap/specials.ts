// Nhân vật đặc biệt có từ hai nghề hoặc hai hệ trở lên (ví dụ Đinh Ngọc, docs/03-characters/dinh-ngoc.md).
//
// MẶC ĐỊNH RỖNG. Mỗi nhân vật chỉ được thêm vào đây sau khi Shan duyệt (thông số, hình, mở khóa), nên không ai thấy
// quân chưa duyệt. Thêm một nhân vật là thêm một dòng, ví dụ:
//   { characterId: "dinhNgoc", name: "Đinh Ngọc", professions: ALL_PROFESSIONS, elements: ELEMENTS, levels: ["dai-tran"] }
// rồi chạy `pnpm exec tsx scripts/binh-phap-sim.ts` để đo ảnh hưởng tới độ khó và tăng `version` của các bậc liên quan.
// Chỉ `characterId` (để vẽ chân dung), `professions` và `elements` (để khớp) có ý nghĩa trong luật.

import type { SpecialCharacter } from "./types";

export const SPECIAL_CHARACTERS: readonly SpecialCharacter[] = [];

export function specialsForLevel(levelId: string, all: readonly SpecialCharacter[] = SPECIAL_CHARACTERS): readonly SpecialCharacter[] {
  return all.filter((s) => s.levels.includes(levelId));
}
