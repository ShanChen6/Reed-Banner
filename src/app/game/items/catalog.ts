// Danh mục vật phẩm dùng chung cho Cửa Hàng (quầy Vật phẩm) và Kho đồ (kệ Vật phẩm), Shan 19/11/2026. Số liệu đọc từ
// @/core (giá, mức chứa, kinh nghiệm mỗi cuốn); ở đây chỉ gom tên, mô tả và cách mua để hai màn hiện giống nhau.

import {
  CAMPAIGN_FOOD_MAX,
  ENHANCE_BONUS,
  ENHANCE_MAX,
  FOOD_PRICE,
  ITEM_STACK_MAX,
  SHOP_ITEM_PRICE,
  XP_BOOK_XP,
  type Profile,
  type ProfileAction,
} from "@/core";
import type { ItemArtId } from "../art/items";

export interface ItemDef {
  readonly id: ItemArtId;
  readonly name: string;
  /** Đơn vị đếm: phần, viên, cuốn. */
  readonly unit: string;
  readonly text: string;
  /** Nơi dùng, hiện ở Kho đồ. */
  readonly use: string;
  readonly price: number;
  readonly have: (p: Profile) => number;
  readonly max: number;
  readonly buy: (amount: number) => ProfileAction;
}

export const ITEMS: readonly ItemDef[] = [
  {
    id: "food",
    name: "Lương thực",
    unit: "phần",
    text: "Mang vào trận Bình Loạn kế tiếp. Từ 70 trở lên quân Hăng hái, dưới 30 là Đói, hết lương sát thương giảm mạnh.",
    use: "Tự dùng ở trận Bình Loạn kế tiếp.",
    price: FOOD_PRICE,
    have: (p) => p.campaign.supply,
    max: CAMPAIGN_FOOD_MAX,
    buy: (amount) => ({ type: "buyFood", amount }),
  },
  {
    id: "stone",
    name: "Đá Cường Hóa",
    unit: "viên",
    text: `Cường hóa trang bị: mỗi cấp +${Math.round(ENHANCE_BONUS * 100)}% chỉ số của món, tối đa +${ENHANCE_MAX}. Cũng nhận khi leo Tháp Thí Luyện, Tháp Thiên Mệnh.`,
    use: "Chọn một món trong Kho đồ, khung Cường hóa.",
    price: SHOP_ITEM_PRICE.stone,
    have: (p) => p.stones,
    max: ITEM_STACK_MAX,
    buy: (amount) => ({ type: "buyItem", item: "stone", amount }),
  },
  {
    id: "xpBook",
    name: "Sách kinh nghiệm",
    unit: "cuốn",
    text: `Mỗi cuốn +${XP_BOOK_XP} kinh nghiệm cho một tướng quân; lên cấp vẫn nhận điểm kỹ năng như thường.`,
    use: "Thẻ Tổng quan của tướng ở Doanh Trại.",
    price: SHOP_ITEM_PRICE.xpBook,
    have: (p) => p.xpBooks ?? 0,
    max: ITEM_STACK_MAX,
    buy: (amount) => ({ type: "buyItem", item: "xpBook", amount }),
  },
];
