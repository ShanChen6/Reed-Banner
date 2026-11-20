// Tên và cách dùng 7 đạo cụ Do Thám, dùng chung cho màn chơi và thẻ Hướng dẫn (modeGuides.ts).

import type { Element } from "@/core";

export interface DtItemInfo {
  readonly name: string;
  readonly text: string;
}

export const DT_ITEM_INFO: Readonly<Record<Element, DtItemInfo>> = {
  kim: { name: "Dò chông", text: "Lộ một bẫy rồi cắm cờ lên đó." },
  moc: { name: "Mầm xanh", text: "Chọn một ô: an toàn thì mở, có bẫy thì tự cắm cờ mà không thua." },
  thuy: { name: "Soi nước", text: "Chọn một ô: biết trong vùng 3×3 quanh nó có bao nhiêu bẫy." },
  hoa: { name: "Đốt lau", text: "Chọn một ô: mở hết ô an toàn trong vùng 3×3 và cắm cờ lên các bẫy." },
  tho: { name: "Khiên đất", text: "Đỡ cho bạn một lần sa bẫy." },
  loi: { name: "Sấm báo", text: "Chọn hàng hoặc cột rồi chọn một ô: biết trên đó có bao nhiêu bẫy." },
  phong: { name: "Gió mách", text: "Chỉ ra một ô chắc chắn an toàn, hoặc chắc chắn có bẫy." },
};
