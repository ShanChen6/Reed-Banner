// Nhiệm vụ nên mở sau khi xong một nhiệm vụ (nút "Tiếp" cuối màn nhiệm vụ). Hàm thuần suy ra từ hồ sơ chiến dịch.

import {
  CAMPAIGN_CHAPTERS,
  campaignMusterReady,
  chapterContentOf,
  chapterStatus,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "@/core";

/**
 * Nhiệm vụ nên mở sau khi xong `nodeId` (nút "Tiếp" ở màn thưởng và cuối màn nhiệm vụ): nhiệm vụ mở hoặc đang dở đầu
 * tiên từ chương của `nodeId` trở đi. Khép Chương III thì trả null để người chơi xem Hội quân Hoa Lư trên bản đồ
 * trước khi chọn tuyến; xong cả chiến dịch cũng null.
 */
export function nextMissionAfter(
  campaign: CampaignProgressV2,
  nodeId: CampaignMissionId,
): CampaignMissionId | null {
  const chapter = chapterContentOf(nodeId);
  if (!chapter) return null;
  if (chapter.chapter === 3 && campaignMusterReady(campaign)) return null;
  const index = CAMPAIGN_CHAPTERS.indexOf(chapter);
  for (const c of CAMPAIGN_CHAPTERS.slice(index)) {
    const next = chapterStatus(campaign, c).find(
      (m) => m.status === "open" || m.status === "inProgress",
    );
    if (next) return next.id;
  }
  return null;
}
