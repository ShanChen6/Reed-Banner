// Thẻ bậc Trận Đồ: ảnh thumbnail cố định của bậc (bản Xếp hạng thêm hậu tố `-ranked`), tên bậc đè lên một phần ba dưới.
// Tiến độ và địa danh của ván xem trong ván và ở Bộ sưu tập, không lộ trên thẻ (V2-02).

export default function LevelCard({ level, ranked = false, name, caption }: { level: string; ranked?: boolean; name?: string; caption?: string }) {
  return (
    <div className="relative aspect-[2/1] overflow-hidden rounded-t-[0.65rem] bg-wood-lo">
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh theo khung thẻ */}
      <img src={`/art/formation/levels/${level}${ranked ? "-ranked" : ""}.webp`} alt="" className="absolute inset-0 size-full object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-wood-lo/90 via-transparent to-transparent" />
      <p className="absolute right-3 bottom-2 left-3 flex items-end justify-between gap-2 font-serif text-lg font-bold text-title-on-wood [text-shadow:0_2px_4px_var(--black)]">
        <span>{name}</span>
        {caption && <span className="text-caption font-semibold tracking-wide text-on-wood-soft">{caption}</span>}
      </p>
    </div>
  );
}
