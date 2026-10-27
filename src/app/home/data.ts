// Nội dung chữ của trang giới thiệu, rút từ docs/ (01-gameplay, 03-characters). Số liệu trận lấy thẳng từ src/core để không lệch.

import type { Element, Profession, TileKind } from "@/core";

/** Tính cách và hiệu ứng hay dùng theo docs/01-gameplay/nguyen-to.md mục 2. */
export const ELEMENT_TRAIT: Record<Element, { readonly role: string; readonly tags: readonly string[] }> = {
  kim: { role: "Đánh chắc, xuyên giáp", tags: ["Thủ−", "Bỏ qua DEF", "Xuyên Khiên"] },
  moc: { role: "Đánh dai, hồi máu", tags: ["Hồi phục", "Hồi máu", "Phá ô"] },
  thuy: { role: "Khống chế", tags: ["Đóng băng", "Tẩy hiệu ứng"] },
  hoa: { role: "Sát thương lớn, thủ yếu", tags: ["Thiêu đốt", "Công+"] },
  tho: { role: "Trụ lâu, chịu đòn", tags: ["Khiên", "Phản đòn", "Thủ+"] },
  loi: { role: "Đánh nhanh, phá nhịp", tags: ["Trừ năng lượng", "Câm lặng"] },
  phong: { role: "Linh hoạt, điều khiển bàn cờ", tags: ["Lốc xoáy", "Xua tan", "Công−"] },
};

/** Ô ghép được cho gì, theo docs/01-gameplay/tai-nguyen-cong-thuc.md. */
export const TILE_GIVES: Record<TileKind, string> = {
  kiem: "Sát thương lên đối thủ",
  amDuong: "Năng lượng để tung kỹ năng",
  banhChung: "Lương thực, giữ sĩ khí cả đội",
  tim: "Hồi máu",
  vang: "Vàng cuối trận",
  sach: "Kinh nghiệm",
  trong: "Nộ của thủ lĩnh",
};

/** Nội tại nghề, docs/03-characters/ky-nang/mo-hinh-nhan-vat.md mục 4.1. */
export const PROFESSION_PERK: Record<Profession, string> = {
  tuongSi: "Ghép từ 4 kiếm: +30% sát thương",
  phapSu: "Năng lượng từ âm dương ×1.5",
  binhLinh: "Lương tụt chậm, sĩ khí cao thì thêm DEF",
  ySu: "Hồi máu ×1.5, hồi tràn thành Khiên",
  muuSi: "Ghép vàng rút năng lượng đối thủ",
  quanSu: "Ghép sách giảm ATK đối thủ",
};

export const FAQ: readonly { readonly q: string; readonly a: string }[] = [
  {
    q: "Cờ Lau chơi trên thiết bị nào?",
    a: "Ngay trên trình duyệt, không cần cài đặt. Máy tính dùng chuột hoặc bàn phím; điện thoại xoay ngang và vuốt để đổi ô.",
  },
  {
    q: "Có mất tiền không?",
    a: "Không. Cờ Lau miễn phí. Bạn chơi ngay bằng tài khoản khách, tiến trình gắn với trình duyệt; đăng nhập hoặc tạo tài khoản để giữ tiến trình trên mọi máy.",
  },
  {
    q: "Đánh sai nước có bị phạt không?",
    a: "Không. Nước đổi không tạo bộ ghép chỉ bị trả lại. Trong trận chính thức mỗi lượt có 30 giây, hết giờ thì mất lượt.",
  },
  {
    q: "Đối thủ là ai?",
    a: "Tianwu, AI của Cờ Lau, điều khiển phe đối thủ. Tianwu chỉ biết đúng những gì người chơi thấy trên bàn và chịu cùng một luật.",
  },
  {
    q: "Nhân vật trong game có thật không?",
    a: "Bối cảnh Loạn 12 Sứ Quân và tên các nhân vật lịch sử là lịch sử chung. Tính cách, kỹ năng và lời thoại gán cho họ là hư cấu; các đồng đội đi cùng Đinh Bộ Lĩnh là nhân vật hư cấu.",
  },
  {
    q: "Có những chế độ nào?",
    a: "Thao Luyện offline, Giao Tranh online, Bình Loạn dẹp 12 sứ quân kèm Tái đấu sứ quân, Tháp Thí Luyện, Tháp Thiên Mệnh, Trấn Ải, Nhật Lệnh và Quần Hùng. Thêm nhiệm vụ, điểm danh và bảng xếp hạng.",
  },
];
