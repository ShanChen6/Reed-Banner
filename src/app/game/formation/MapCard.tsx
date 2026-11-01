// Thẻ bản đồ: ảnh bản đồ được ô che đặc kín phủ từ trên xuống, phần đã khai thông lộ ra từ dưới lên theo tiến độ.
// `reveal` 0 là che kín (chưa chơi, ẩn cả tên địa danh), 1 là lộ hết (đã hoàn thành).

import type { FormationMap } from "./maps";

export default function MapCard({ map, reveal, hidden = false, caption }: { map: FormationMap; reveal: number; hidden?: boolean; caption?: string }) {
  const r = Math.max(0, Math.min(1, reveal));
  return (
    <div className="relative aspect-[16/8] overflow-hidden rounded-t-[0.65rem] bg-[#1a130e]">
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh bản đồ tĩnh theo khung thẻ */}
      <img src={map.src} alt="" className="absolute inset-0 size-full object-cover" />
      {r < 1 && (
        <div aria-hidden className="fm-fogfill absolute inset-x-0 top-0 border-b border-[#8F6A32]/60" style={{ height: `${(1 - r) * 100}%` }} />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1d140d]/90 via-transparent to-transparent" />
      <p className="absolute right-3 bottom-2 left-3 flex items-end justify-between gap-2 font-serif text-lg font-bold text-[var(--atlas-title)] [text-shadow:0_2px_4px_#000]">
        <span>{hidden ? "Bản đồ chưa lộ" : map.place}</span>
        {caption && <span className="text-xs font-semibold tracking-wide text-[var(--atlas-muted)]">{caption}</span>}
      </p>
    </div>
  );
}
