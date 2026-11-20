// Tên và cách dùng 7 đạo cụ Khai Lộ (Shan duyệt 20/11/2026), dùng chung cho màn chơi và thẻ Hướng dẫn (modeGuides.ts).

import type { KlTool } from "@/core/khai-lo/engine";

export const KL_TOOL_NAME: Readonly<Record<KlTool, string>> = {
  kim: "Kim Đao",
  moc: "Mộc Linh",
  thuy: "Thủy Triều",
  hoa: "Hỏa Cầu",
  tho: "Địa Chấn",
  loi: "Lôi Phạt",
  phong: "Lốc Phong",
};

export const KL_TOOL_HINT: Readonly<Record<KlTool, string>> = {
  kim: "Chọn ô: chém sạch cả hàng ngang.",
  moc: "Chọn quân: đổi sang hệ của khối lớn nhất kề nó.",
  thuy: "Chọn ô: cuốn sạch cả cột dọc.",
  hoa: "Chọn ô: nổ vùng 3×3 quanh ô đó.",
  tho: "Chọn ô bất kỳ: phá hàng dưới cùng, cả bàn sụt xuống.",
  loi: "Chọn quân: xóa mọi quân cùng hệ trên bàn.",
  phong: "Chọn tâm: 8 ô quanh xoay theo chiều kim đồng hồ.",
};
