// Nhiệm vụ nên làm tiếp ở đầu tab Bản đồ (thanh Bắt đầu/Tiếp tục). Hàm thuần suy ra từ hồ sơ chiến dịch, có test.
//   - chưa làm gì: "start" nhiệm vụ mở đầu tiên;
//   - có nhiệm vụ đang dở: "resume" nhiệm vụ đó (ưu tiên cao nhất);
//   - còn nhiệm vụ mở: "next" nhiệm vụ mở đầu tiên theo thứ tự chương;
//   - không còn nhiệm vụ mở (đã xong hoặc chờ nội dung): null, thanh ẩn.

import {
  CAMPAIGN_CHAPTERS,
  chapterStatus,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "@/core";

export interface StartTarget {
  readonly id: CampaignMissionId;
  readonly kind: "start" | "resume" | "next";
  readonly title: string;
  readonly chapter: number;
  readonly chapterTitle: string;
  readonly place: string;
}

export function startTarget(campaign: CampaignProgressV2): StartTarget | null {
  type Pick = { id: CampaignMissionId; chapter: (typeof CAMPAIGN_CHAPTERS)[number] };
  let open: Pick | null = null;
  let resume: Pick | null = null;
  for (const chapter of CAMPAIGN_CHAPTERS) {
    for (const m of chapterStatus(campaign, chapter)) {
      if (m.status === "inProgress" && !resume) resume = { id: m.id, chapter };
      if (m.status === "open" && !open) open = { id: m.id, chapter };
    }
  }
  const pick = resume ?? open;
  if (!pick) return null;
  const node = storyNodeById(pick.id);
  if (!node) return null;
  const touched = campaign.completed.length > 0 || campaign.inProgress.length > 0;
  return {
    id: pick.id,
    kind: resume ? "resume" : touched ? "next" : "start",
    title: node.title,
    chapter: pick.chapter.chapter,
    chapterTitle: pick.chapter.title,
    place: node.location.name,
  };
}
