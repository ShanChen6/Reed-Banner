// Biểu tượng riêng cho từng chế độ chơi: ảnh vẽ tấm bảng ngọc viền vàng ở public/art/modes/<slug>.webp (256 px),
// prompt ở docs/06-art/prompts/icon-che-do.md.

/** Trùng slug đường dẫn của chế độ (`SCENE_SLUG`), để trang chủ dựng link thẳng từ đây. */
export type ModeIconKind =
  | "practice" | "play" | "campaign" | "trial" | "destiny" | "survival" | "daily" | "arena"
  | "formation" | "clear-path" | "scout" | "maze" | "tam-tuong-ky" | "expedition" | "three-armies" | "go" | "trade";

/** Chế độ chưa có ảnh biểu tượng: ModeIcon không vẽ gì (TODO tranh: public/art/modes/<slug>.webp). */
const NO_ICON: ReadonlySet<ModeIconKind> = new Set<ModeIconKind>(["three-armies", "go"]);

/** Biểu tượng chế độ (ảnh vẽ, tách nền sẵn). */
export function ModeIcon({ kind, className }: { kind: ModeIconKind; className?: string }) {
  if (NO_ICON.has(kind)) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/modes/${kind}.webp`} alt="" aria-hidden className={className} loading="lazy" decoding="async" />;
}
