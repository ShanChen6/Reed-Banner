// Thông tin hiển thị của từng chế độ, dùng cho banner đầu màn và màn cần đăng nhập; câu mô tả (MODE_TEXT) dùng chung với thẻ ở Chiến trường
// (đồng bộ UI 05/11/2026). Tên chế độ lấy từ SCENE_TITLE trong scene.ts. Tranh nằm trong public/art/home/.

import { ARENA_ATTACKS_PER_DAY, ARENA_WIN_GOLD } from "@/core/arena/arena";
import { DAILY_GOLD } from "@/core/daily/daily";
import type { Scene } from "./scene";

/**
 * Câu mô tả mười chế độ, một nguồn cho thẻ ở Chiến trường và banner/màn khóa của từng chế độ. Giọng hào sảng, nhịp hai vế như
 * dòng hero "Dẹp loạn mười hai sứ quân, dựng lại giang sơn Đại Việt"; mở đầu bằng động từ, số viết bằng chữ, không thuật ngữ kỹ thuật.
 */
export const MODE_TEXT = {
  CAMPAIGN: "Qua sáu chương chinh chiến, thu phục sứ quân, quy giang sơn về một mối.",
  TRIAL: "Vượt hai mươi tầng tháp, mỗi tầng một thế trận, thử sức anh hùng.",
  DESTINY: "Một đội một mệnh, một mạch xông tháp, giữ binh lực qua từng tầng.",
  SURVIVAL: "Giữ vững cửa ải, chặn từng đợt giặc, xem ai trụ được đến cùng.",
  DAILY: "Một lệnh truyền khắp thiên hạ, mỗi ngày một trận, so tài cùng quần hùng.",
  ARENA: "Gặp gỡ quần hùng, đối đầu đội ngũ các nơi, tranh ngôi đầu bảng.",
  FORMATION: "Bày binh bố trận, xếp quân theo nghề, theo hệ, từng bước mở lộ bản đồ.",
  KHAI_LO: "Phá từng khối quân cùng hệ, khai mở đường tiến qua trận cờ.",
  TAM_TUONG_KY: "Hội tụ bảy hệ, tìm lại chân dung những bậc danh tướng.",
  EXPEDITION: "Chia quân hai đạo, thần tốc hành quân, giáp công phá thành địch.",
} as const;

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
    text: MODE_TEXT.TRIAL, art: "trial", kicker: "Leo tháp",
    perks: ["Luật cấm, bắt buộc hoặc giới hạn đội theo tầng", "Đá Cường Hóa cho lần vượt đầu tiên", "Quét tháp mỗi ngày khi đã qua tầng 1"],
  },
  DESTINY: {
    text: MODE_TEXT.DESTINY, art: "destiny", kicker: "Leo tháp",
    perks: ["Đội hình khóa cho cả lượt leo", "Máu, năng lượng và lương mang sang tầng sau", "Thắng mỗi tầng chọn Phúc hoặc hồi phục", "Bảng xếp hạng riêng cho từng chu kỳ tuần"],
  },
  SURVIVAL: {
    text: MODE_TEXT.SURVIVAL, art: "survival", kicker: "Giữ ải",
    perks: ["Đợt sau đông và mạnh hơn, trùm mỗi 5 đợt", "Giữa các đợt được đổi người và tăng sức", "Xếp hạng theo số đợt giữ được"],
  },
  DAILY: {
    text: MODE_TEXT.DAILY, art: "daily", kicker: "Mỗi ngày",
    perks: ["Đội cho sẵn, ai cũng đánh cùng một đề", `Thắng ${DAILY_GOLD.win} vàng, thua vẫn được ${DAILY_GOLD.loss} vàng`, "Bảng xếp hạng làm mới mỗi ngày"],
  },
  ARENA: {
    text: MODE_TEXT.ARENA, art: "arena", kicker: "Đấu đội",
    perks: [`${ARENA_ATTACKS_PER_DAY} lượt đánh mỗi ngày`, `Mỗi trận thắng +${ARENA_WIN_GOLD} vàng`, "Điểm hạng tăng giảm theo sức đối thủ"],
  },
  TAM_TUONG_KY: {
    text: MODE_TEXT.TAM_TUONG_KY, art: "tam-tuong-ky", kicker: "Ghép yếu tố",
    perks: ["Mỗi lượt chơi tốn một phiếu", "Tướng tìm được ghi vào Tướng Lục theo tài khoản"],
  },
  LEADERBOARD: {
    text: "Thành tích theo mùa của bạn ở mọi chế độ có xếp hạng.", kicker: "Công Trạng",
    perks: ["Hạng hiện tại ở từng chế độ", "Các mùa trước: hạng và thưởng đã nhận"],
  },
};
