// Khung đồng cổ dùng chung cho các khối của Sử ký (Polish V2 P01): lớp `.atlas-frame` vẽ viền mảnh và vạch trong,
// <AtlasCorners /> đặt bốn góc hoa văn vẽ bằng SVG. Góc chỉ là trang trí: không nhận chuột, ẩn với trình đọc màn hình.

/** Một góc (trên trái): hai vạch góc bo, móc mây cuộn và hai hạt thoi ở đầu vạch. Xoay để dùng cho góc khác. */
export function AtlasCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d="M1.5 21 V6 A4.5 4.5 0 0 1 6 1.5 H21" strokeWidth={1.4} />
      <path d="M5 13 V8.5 A3.5 3.5 0 0 1 8.5 5 H13" strokeWidth={0.9} />
      <path d="M8.2 11 A2.6 2.6 0 1 1 11 8.2" strokeWidth={1.1} />
      <circle cx={8.6} cy={8.6} r={1.1} fill="currentColor" stroke="none" />
      {[
        [21, 1.5],
        [1.5, 21],
      ].map(([x, y]) => (
        <rect
          key={x}
          x={x! - 1.4}
          y={y! - 1.4}
          width={2.8}
          height={2.8}
          transform={`rotate(45 ${x} ${y})`}
          fill="currentColor"
          stroke="none"
        />
      ))}
    </svg>
  );
}

const CORNER_POS = [
  "left-1 top-1",
  "right-1 top-1 rotate-90",
  "right-1 bottom-1 rotate-180",
  "left-1 bottom-1 -rotate-90",
] as const;

/** Bốn góc cho một khối `.atlas-frame` (khối đó phải `relative`). `size` là lớp Tailwind kích thước góc. */
export function AtlasCorners({ size = "size-6" }: { size?: string }) {
  return (
    <>
      {CORNER_POS.map((pos) => (
        <AtlasCorner
          key={pos}
          className={`atlas-corner pointer-events-none absolute z-[1] ${pos} ${size}`}
        />
      ))}
    </>
  );
}
