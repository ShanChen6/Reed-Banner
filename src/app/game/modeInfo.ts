// Thông tin hiển thị của từng chế độ, dùng cho banner đầu màn và màn cần đăng nhập; thẻ ở Chiến trường sẽ chuyển sang dùng chung ở bước sau
// (đồng bộ UI 05/11/2026). Tên chế độ lấy từ SCENE_TITLE trong scene.ts. Tranh nằm trong public/art/home/.

import { ARENA_ATTACKS_PER_DAY, ARENA_WIN_GOLD } from "@/core/arena/arena";
import { DAILY_GOLD } from "@/core/daily/daily";
import type { Scene } from "./scene";

export interface ModeInfo {
  /** Một câu mô tả ngắn (thẻ và banner). */
  readonly text: string;
  /** Tên tranh trong public/art/home/ (không đuôi). */
  readonly art?: string;
  readonly kicker?: string;
  /** Vài dòng luật/phần thưởng chính, hiện cho khách trước khi đăng nhập. */
  readonly perks?: readonly string[];
}

export const MODE_INFO: Partial<Record<Scene, ModeInfo>> = {
  TRIAL: {
    text: "Mỗi tầng một luật chọn đội riêng, vượt lần đầu nhận Đá Cường Hóa.", art: "trial", kicker: "Song Tháp",
    perks: ["Luật cấm, bắt buộc hoặc giới hạn đội theo tầng", "Đá Cường Hóa cho lần vượt đầu tiên", "Quét tháp mỗi ngày khi đã qua tầng 1"],
  },
  DESTINY: {
    text: "Khóa đội theo chu kỳ, giữ máu và lương xuyên tầng.", art: "destiny", kicker: "Song Tháp",
    perks: ["Đội chốt một lần cho cả chu kỳ", "Máu và lương mang sang tầng sau", "Bảng xếp hạng riêng cho từng chu kỳ"],
  },
  SURVIVAL: {
    text: "Đối thủ kéo đến theo đợt trên cùng một bàn cờ.", art: "survival", kicker: "Giữ ải",
    perks: ["Đợt sau đông và mạnh hơn, trùm mỗi 5 đợt", "Giữa các đợt được đổi người và tăng sức", "Xếp hạng theo số đợt giữ được"],
  },
  DAILY: {
    text: "Một đề chung cho mọi người, mỗi ngày một lần.", art: "daily", kicker: "Mỗi ngày",
    perks: ["Đội cho sẵn, ai cũng đánh cùng một đề", `Thắng ${DAILY_GOLD.win} vàng, thua vẫn được ${DAILY_GOLD.loss} vàng`, "Bảng xếp hạng làm mới mỗi ngày"],
  },
  ARENA: {
    text: "Đánh đội phòng thủ người chơi khác để lại.", art: "arena", kicker: "Đấu đội",
    perks: [`${ARENA_ATTACKS_PER_DAY} lượt đánh mỗi ngày`, `Mỗi trận thắng +${ARENA_WIN_GOLD} vàng`, "Điểm hạng tăng giảm theo sức đối thủ"],
  },
  TAM_TUONG_KY: {
    text: "Ghép yếu tố từ bảy hệ để tìm lại chân dung danh tướng.", art: "tam-tuong-ky", kicker: "Ghép yếu tố",
    perks: ["Mỗi lượt chơi tốn một phiếu", "Tướng tìm được ghi vào Tướng Lục theo tài khoản"],
  },
  LEADERBOARD: {
    text: "Thứ hạng của bạn ở mọi chế độ có xếp hạng.", kicker: "Bảng vàng",
    perks: ["Trấn Ải, Quần Hùng, Tháp Thiên Mệnh và Tầm Tướng Ký", "Điểm ghi sau khi trận được cộng thưởng"],
  },
};
