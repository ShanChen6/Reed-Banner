// Nhãn hiển thị cho nhân vật đặc biệt dung hợp (Đinh Ngọc, Vũ Phong) và danh sách nội tại trong trận.
// Hàm thuần để giao diện và test dùng chung; luật nằm ở src/core (xem docs/03-characters/dinh-ngoc.md, vu-phong.md).
import { CHASE_PASSIVES, COMBO_PASSIVES, chasePassives, type Element, type FighterConfig } from "@/core";
import { ELEMENT_NAME } from "./labels";

type KindSource = Pick<FighterConfig, "special" | "element">;

/** Nhân vật dung hợp thì dùng biểu tượng nghề tổng hợp; còn lại giữ nghề của mình. */
export function isFusion(f: Pick<FighterConfig, "special">): boolean {
  return f.special === true;
}

export const FUSION_PROFESSION_TITLE = "Nghề tổng hợp: có nền tảng cả tám nghề, không nhận nội tại nghề mặc định";

/** Chú thích hệ: nhân vật dung hợp chịu khắc theo hệ phòng thủ nhưng đánh bằng nhiều hệ theo từng chiêu. */
export function elementTitle(f: KindSource): string {
  return isFusion(f)
    ? `Hệ phòng thủ ${ELEMENT_NAME[f.element]} (chịu khắc theo hệ này); dung hợp bảy hệ qua từng chiêu`
    : ELEMENT_NAME[f.element];
}

export interface PassiveLine {
  readonly label: string;
  readonly name: string;
  readonly description: string;
}

/**
 * Bốn nội tại cố định của nhân vật dung hợp theo thứ tự thiết kế (P1–P4): ba hoặc bốn truy kích, rồi bị động phối hợp nếu có.
 * Nhân vật thường trả mảng rỗng (giao diện cũ vẫn dùng nhãn Nghề/Hệ).
 */
export function fusionPassiveLines(f: Pick<FighterConfig, "special" | "profession" | "element" | "chasePassives" | "comboPassive">): PassiveLine[] {
  if (!isFusion(f)) return [];
  const lines: PassiveLine[] = chasePassives(f).map((id) => ({ label: "", name: CHASE_PASSIVES[id].name, description: CHASE_PASSIVES[id].description }));
  if (f.comboPassive) lines.push({ label: "", name: COMBO_PASSIVES[f.comboPassive].name, description: COMBO_PASSIVES[f.comboPassive].description });
  return lines.map((l, i) => ({ ...l, label: `Nội tại ${i + 1}` }));
}

/** Dòng tóm tắt nhân vật dung hợp trong tooltip thẻ nhân vật. */
export function fusionSummary(f: Pick<FighterConfig, "special" | "element">): string | null {
  return isFusion(f) ? `Nhân vật đặc biệt: dung hợp tám nghề và bảy hệ · hệ phòng thủ ${ELEMENT_NAME[f.element as Element]}` : null;
}
