// Khung đồng cổ dùng chung cho các khối của Sử ký (Polish V2 P01): lớp `.atlas-frame` vẽ viền mảnh và vạch trong,
// <AtlasCorners /> đặt bốn góc hoa văn. Hình góc nay nằm ở src/components/game-ui/FrameCorners.tsx (dùng chung toàn game).

import { FrameCorners } from "@/components/game-ui/FrameCorners";

/** Bốn góc cho một khối `.atlas-frame` (khối đó phải `relative`). `size` là lớp Tailwind kích thước góc. */
export function AtlasCorners({ size = "size-6" }: { size?: string }) {
  return <FrameCorners size={size} cornerClass="atlas-corner" />;
}
