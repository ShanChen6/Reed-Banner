// Nút chính ở hero Chiến trường đổi theo ngữ cảnh người chơi (Shan yêu cầu 07/11/2026). Hàm thuần suy ra từ hồ sơ và việc có trận
// Giao Tranh đang dở, để test được. Thứ tự ưu tiên:
//   1. Có trận Giao Tranh online đang dở (đồng hồ lượt chạy theo giờ máy chủ) → "Tiếp tục trận dở".
//   2. Chưa chơi chiến dịch → "Bắt đầu Bình Loạn" (cốt truyện chính là lối vào tốt nhất cho người mới).
//   3. Chiến dịch đang dở → "Tiếp tục Bình Loạn" kèm chương và số nhiệm vụ đã xong.
//   4. Chiến dịch đã xong hết nhiệm vụ → "Vào trận" (Giao Tranh).
//   5. Chưa tải được hồ sơ → "Vào trận" như trước (không đoán sai ngữ cảnh).

import { campaignFocusChapter, campaignMissionsRemaining, chapterStatus, type Profile } from "@/core";
import type { Scene } from "./scene";

export interface HeroAction {
  readonly scene: Scene;
  readonly label: string;
  readonly params?: Readonly<Record<string, string>>;
}

export interface HeroPlan {
  readonly primary: HeroAction;
  readonly secondary?: HeroAction;
  /** Một dòng ngắn dưới nút: đang ở đâu, việc tiếp theo. */
  readonly hint?: string;
}

const RESUME: HeroAction = { scene: "PLAYING", label: "Tiếp tục trận dở", params: { resume: "1" } };
const PLAY: HeroAction = { scene: "PLAYING", label: "Vào trận" };

/**
 * `profile`: hồ sơ đã tải; `null` nghĩa là không tải được. Chưa tải xong thì gọi hàm này sau (xem MenuScene, hiện khung chờ).
 */
export function heroPlan(profile: Profile | null, savedBattle: boolean): HeroPlan {
  const campaign = profile?.campaign;
  const started = !!campaign && (campaign.completed.length > 0 || campaign.inProgress.length > 0);
  const finished = !!campaign && campaignMissionsRemaining(campaign).length === 0;

  const campaignAction: HeroAction | null = !campaign
    ? null
    : finished
      ? null
      : { scene: "CAMPAIGN", label: started ? "Tiếp tục Bình Loạn" : "Bắt đầu Bình Loạn" };

  if (savedBattle)
    return {
      primary: RESUME,
      secondary: campaignAction ?? { ...PLAY, label: "Vào trận mới" },
      hint: "Một trận Giao Tranh đang chờ bạn trở lại.",
    };

  if (!campaign) return { primary: PLAY };

  if (!started)
    return {
      primary: campaignAction!,
      secondary: { scene: "PRACTICE", label: "Thao Luyện" },
      hint: "Bình Loạn, chương I: Hoa Lư dựng cờ. Chưa cần tài khoản.",
    };

  if (finished)
    return {
      primary: PLAY,
      secondary: { scene: "ARENA", label: "Quần Hùng" },
      hint: "Bình Loạn đã khép lại. Ra Giao Tranh thử sức cùng đối thủ.",
    };

  const chapter = campaignFocusChapter(campaign);
  const list = chapterStatus(campaign, chapter);
  const done = list.filter((m) => m.status === "completed").length;
  return {
    primary: campaignAction!,
    secondary: PLAY,
    hint: `Chương ${chapter.chapter}: ${chapter.title} · ${done}/${list.length} nhiệm vụ`,
  };
}
