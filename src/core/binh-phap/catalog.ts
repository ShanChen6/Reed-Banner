// Danh mục chân dung cho quân thường: mọi nhân vật kèm đã phát hành (6 nghề × 7 hệ đều có ít nhất một người).
// Khóa là `characterId` ổn định, không phải tên hiển thị hay đường dẫn ảnh.

import type { Element, Profession } from "../battle";
import { ALL_COMPANIONS } from "../roster/roster";

export interface CatalogEntry {
  readonly characterId: string;
  readonly profession: Profession;
  readonly element: Element;
}

export const CATALOG: readonly CatalogEntry[] = ALL_COMPANIONS.map((c) => ({
  characterId: c.id,
  profession: c.profession,
  element: c.element,
}));

/** Người đại diện cho một cặp nghề–hệ, theo thứ tự danh mục để sinh quân xác định. */
export function charactersFor(profession: Profession, element: Element): readonly CatalogEntry[] {
  return CATALOG.filter((e) => e.profession === profession && e.element === element);
}
