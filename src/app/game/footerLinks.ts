// Liên kết ở footer màn game.
//
// - Liên kết nội bộ (Giới thiệu, Hỏi đáp) luôn có địa chỉ.
// - Bốn mục Góp ý và báo lỗi, Cộng đồng, Điều khoản, Quyền riêng tư luôn hiện. Có biến môi trường NEXT_PUBLIC_*_URL (địa chỉ
//   https) thì là liên kết thật mở ở thẻ mới; chưa có thì `href` là null và footer hiện thông báo "đang chuẩn bị" khi bấm,
//   không chuyển trang (Shan chốt 07/11/2026: vẫn hiển thị khi chưa có địa chỉ).
// - Mạng xã hội liên hệ chỉ hiện nền tảng nào đã có địa chỉ (NEXT_PUBLIC_SOCIAL_*), vì hiện một nền tảng không có thật sẽ
//   gây hiểu lầm.
// Biến NEXT_PUBLIC_* được nhúng vào bản build, nên chỉ đặt địa chỉ công khai (xem .env.example).

export interface FooterLink {
  readonly label: string;
  /** Địa chỉ; null nghĩa là chưa có (bấm chỉ hiện thông báo). */
  readonly href: string | null;
  /** Mở trang ngoài ở thẻ mới. */
  readonly external?: boolean;
}

type Env = Readonly<Record<string, string | undefined>>;

const isUrl = (v: string | undefined): v is string => !!v && /^https?:\/\//.test(v.trim());

const internal: readonly FooterLink[] = [
  { label: "Giới thiệu", href: "/" },
  { label: "Hỏi đáp", href: "/#faq" },
];

/** Danh sách liên kết hiển thị: nội bộ trước, rồi bốn mục có thể chưa có địa chỉ. */
export function footerLinks(
  env: Env = {
    NEXT_PUBLIC_FEEDBACK_URL: process.env.NEXT_PUBLIC_FEEDBACK_URL,
    NEXT_PUBLIC_COMMUNITY_URL: process.env.NEXT_PUBLIC_COMMUNITY_URL,
    NEXT_PUBLIC_TERMS_URL: process.env.NEXT_PUBLIC_TERMS_URL,
    NEXT_PUBLIC_PRIVACY_URL: process.env.NEXT_PUBLIC_PRIVACY_URL,
  },
): readonly FooterLink[] {
  const optional: [string, string | undefined][] = [
    ["Góp ý và báo lỗi", env.NEXT_PUBLIC_FEEDBACK_URL],
    ["Cộng đồng", env.NEXT_PUBLIC_COMMUNITY_URL],
    ["Điều khoản", env.NEXT_PUBLIC_TERMS_URL],
    ["Quyền riêng tư", env.NEXT_PUBLIC_PRIVACY_URL],
  ];
  return [
    ...internal,
    ...optional.map(([label, href]): FooterLink => (isUrl(href) ? { label, href: href.trim(), external: true } : { label, href: null })),
  ];
}

/** Nền tảng mạng xã hội hỗ trợ, theo thứ tự hiển thị. */
export const SOCIAL_PLATFORMS = ["Facebook", "YouTube", "TikTok", "Zalo", "Discord", "Instagram", "X", "GitHub"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Mạng xã hội đã có địa chỉ (NEXT_PUBLIC_SOCIAL_<TÊN IN HOA>), theo thứ tự của SOCIAL_PLATFORMS. */
export function socialLinks(
  env: Env = {
    NEXT_PUBLIC_SOCIAL_FACEBOOK: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    NEXT_PUBLIC_SOCIAL_YOUTUBE: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
    NEXT_PUBLIC_SOCIAL_TIKTOK: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
    NEXT_PUBLIC_SOCIAL_ZALO: process.env.NEXT_PUBLIC_SOCIAL_ZALO,
    NEXT_PUBLIC_SOCIAL_DISCORD: process.env.NEXT_PUBLIC_SOCIAL_DISCORD,
    NEXT_PUBLIC_SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    NEXT_PUBLIC_SOCIAL_X: process.env.NEXT_PUBLIC_SOCIAL_X,
    NEXT_PUBLIC_SOCIAL_GITHUB: process.env.NEXT_PUBLIC_SOCIAL_GITHUB,
  },
): readonly (FooterLink & { readonly href: string })[] {
  return SOCIAL_PLATFORMS.flatMap((label) => {
    const href = env[`NEXT_PUBLIC_SOCIAL_${label.toUpperCase()}`];
    return isUrl(href) ? [{ label, href: href.trim(), external: true }] : [];
  });
}

/** Thông báo khi bấm một mục chưa có địa chỉ. */
export const pendingNotice = (label: string) => `Mục "${label}" đang được chuẩn bị, sẽ sớm ra mắt.`;

/** Mã bản dựng ngắn (Vercel đặt khi bật "expose system environment variables"); không có thì không hiện. */
export function buildLabel(sha: string | undefined = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA): string | null {
  return sha ? sha.slice(0, 7) : null;
}
