// Ảnh bản đồ nền của sa bàn Trận Đồ. Ô chưa khai thông bị sương che; đặt quân vào thì ô sáng lên và hiện đúng mảnh
// bản đồ ở dưới. Khai thông hết là cả bản đồ hiện ra.
//
// TẠM THỜI: dùng tranh nền chiến dịch có sẵn làm bản đồ giữ chỗ. Khi có ảnh bản đồ thật (Shan sẽ cho thiết kế), chỉ cần
// thả file vào `public/art/formation/` và đổi `src` ở đây. Yêu cầu ảnh: docs/05-ui-ux/screens/tran-do.md mục 3.

export interface FormationMap {
  readonly src: string;
  /** Tên địa danh hiển thị khi hoàn thành bản đồ. */
  readonly place: string;
}

export const FORMATION_MAPS: Readonly<Record<string, FormationMap>> = {
  "huong-dan": { src: "/art/campaign/bg/atlas.webp", place: "Giấy dó" },
  thuong: { src: "/art/campaign/bg/bohaikhau.webp", place: "Bố Hải Khẩu" },
  kho: { src: "/art/campaign/bg/damnuoc.webp", place: "Đầm nước" },
  "dai-tran": { src: "/art/campaign/bg/hoalu.webp", place: "Hoa Lư" },
};

export const FALLBACK_MAP: FormationMap = { src: "/art/campaign/bg/atlas.webp", place: "Bản đồ" };

export const mapOf = (levelId: string): FormationMap => FORMATION_MAPS[levelId] ?? FALLBACK_MAP;
