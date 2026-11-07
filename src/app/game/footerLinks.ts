// Liên kết ở footer màn game và phần "Liên hệ" (quỹ đạo mạng xã hội) ở Chiến trường.
//
// - Liên kết nội bộ (Giới thiệu, Hỏi đáp) luôn có địa chỉ và chuyển trang bình thường.
// - Liên kết ngoài (Góp ý và báo lỗi, Cộng đồng, Điều khoản, Quyền riêng tư và mạng xã hội) **đang bị khóa** (Shan chốt 07/11/2026):
//   vẫn hiện và bấm được nhưng bấm không chuyển trang, không hiện thông báo. Mở khóa bằng cách đặt NEXT_PUBLIC_LINKS_UNLOCKED=true
//   lúc build (xem .env.example); khi đó mục nào có địa chỉ https thì thành liên kết thật mở ở thẻ mới.
// - Địa chỉ liên kết ngoài: bốn mục footer lấy từ NEXT_PUBLIC_*_URL; mạng xã hội có địa chỉ mặc định trong SOCIAL_DEFAULTS (công khai,
//   Shan cung cấp 07/11/2026), biến NEXT_PUBLIC_SOCIAL_<TÊN> ghi đè. Instagram, Discord, X chưa có địa chỉ nhưng vẫn hiện; YouTube
//   và Zalo chỉ hiện khi có địa chỉ.
// Biến NEXT_PUBLIC_* được nhúng vào bản build, nên chỉ đặt địa chỉ công khai.

export interface FooterLink {
  readonly label: string;
  /** Địa chỉ để chuyển trang; null nghĩa là đang khóa hoặc chưa có địa chỉ (bấm không làm gì). */
  readonly href: string | null;
  /** Mở trang ngoài ở thẻ mới. */
  readonly external?: boolean;
}

type Env = Readonly<Record<string, string | undefined>>;

const isUrl = (v: string | undefined): v is string => !!v && /^https?:\/\//.test(v.trim());
/** Liên kết ngoài chỉ chuyển trang khi đặt NEXT_PUBLIC_LINKS_UNLOCKED=true; mặc định khóa. */
const unlockedIn = (env: Env) => env.NEXT_PUBLIC_LINKS_UNLOCKED === "true";

const internal: readonly FooterLink[] = [
  { label: "Giới thiệu", href: "/" },
  { label: "Hỏi đáp", href: "/#faq" },
];

/** Danh sách liên kết hiển thị: nội bộ trước, rồi bốn mục liên kết ngoài (đang khóa thì `href` null). */
export function footerLinks(
  env: Env = {
    NEXT_PUBLIC_LINKS_UNLOCKED: process.env.NEXT_PUBLIC_LINKS_UNLOCKED,
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
    ...optional.map(([label, href]): FooterLink => (unlockedIn(env) && isUrl(href) ? { label, href: href.trim(), external: true } : { label, href: null })),
  ];
}

/** Nền tảng mạng xã hội hỗ trợ, theo thứ tự hiển thị. */
export const SOCIAL_PLATFORMS = ["Facebook", "TikTok", "LinkedIn", "GitHub", "Instagram", "Discord", "X", "YouTube", "Zalo"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Địa chỉ mặc định; `always` luôn hiện (chưa có địa chỉ thì là mục chờ), `withUrl` chỉ hiện khi có địa chỉ. */
const SOCIAL_DEFAULTS: Readonly<Record<SocialPlatform, { href: string | null; show: "always" | "withUrl" }>> = {
  Facebook: { href: "https://www.facebook.com/tran.tieuthien.73/", show: "always" },
  TikTok: { href: "https://www.tiktok.com/@chenhongshan611", show: "always" },
  LinkedIn: { href: "https://www.linkedin.com/in/shanchen8/", show: "always" },
  GitHub: { href: "https://github.com/ShanChen6", show: "always" },
  Instagram: { href: null, show: "always" },
  Discord: { href: null, show: "always" },
  X: { href: null, show: "always" },
  YouTube: { href: null, show: "withUrl" },
  Zalo: { href: null, show: "withUrl" },
};

/** Lời chú thích từng nền tảng trong thư cuộn, giọng cổ trang (Shan góp ý 07/11/2026). */
export const SOCIAL_BLURB: Readonly<Record<SocialPlatform, string>> = {
  Facebook: "Gửi thư tay tới tác giả",
  TikTok: "Thước phim của tác giả",
  LinkedIn: "Kết giao đồng đạo",
  GitHub: "Kho mã nguồn của tác giả",
  Instagram: "Họa ảnh, chuyện hậu trường",
  Discord: "Hội ngộ chốn quần hùng",
  X: "Tin ngắn theo ngựa trạm",
  YouTube: "Thước phim dài của tác giả",
  Zalo: "Thư tay gửi qua Zalo",
};

/** Chữ trong thư cuộn: tiêu đề, lời dẫn, và dòng ghi cho nền tảng chưa có địa chỉ. */
export const CONTACT_TITLE = "Thư tín bốn phương";
export const CONTACT_SUB = "Trạm dịch ngựa phi, thư gửi về doanh trại tác giả";
export const CONTACT_PENDING = "Trạm thư sắp mở";
/** Nhãn của dòng gộp các nền tảng chưa có địa chỉ ở cuối thư. */
export const CONTACT_PENDING_LABEL = "Trạm thư sắp mở:";

export interface SocialLink extends FooterLink {
  readonly label: SocialPlatform;
  /** Đã có địa chỉ (dù đang khóa); false là nền tảng chờ. Dùng để chọn chú thích, không liên quan việc khóa. */
  readonly configured: boolean;
}

/** Mạng xã hội hiển thị, theo thứ tự của SOCIAL_PLATFORMS; đang khóa hoặc chưa có địa chỉ thì `href` null. */
export function socialLinks(
  env: Env = {
    NEXT_PUBLIC_LINKS_UNLOCKED: process.env.NEXT_PUBLIC_LINKS_UNLOCKED,
    NEXT_PUBLIC_SOCIAL_FACEBOOK: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    NEXT_PUBLIC_SOCIAL_TIKTOK: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
    NEXT_PUBLIC_SOCIAL_LINKEDIN: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
    NEXT_PUBLIC_SOCIAL_GITHUB: process.env.NEXT_PUBLIC_SOCIAL_GITHUB,
    NEXT_PUBLIC_SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    NEXT_PUBLIC_SOCIAL_DISCORD: process.env.NEXT_PUBLIC_SOCIAL_DISCORD,
    NEXT_PUBLIC_SOCIAL_X: process.env.NEXT_PUBLIC_SOCIAL_X,
    NEXT_PUBLIC_SOCIAL_YOUTUBE: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
    NEXT_PUBLIC_SOCIAL_ZALO: process.env.NEXT_PUBLIC_SOCIAL_ZALO,
  },
): readonly SocialLink[] {
  return SOCIAL_PLATFORMS.flatMap((label): SocialLink[] => {
    const override = env[`NEXT_PUBLIC_SOCIAL_${label.toUpperCase()}`];
    const def = SOCIAL_DEFAULTS[label];
    const url = isUrl(override) ? override.trim() : def.href;
    if (!url && def.show !== "always") return [];
    const href = unlockedIn(env) ? url : null;
    return [{ label, href, external: !!href, configured: !!url }];
  });
}

/** Mã bản dựng ngắn (Vercel đặt khi bật "expose system environment variables"); không có thì không hiện. */
export function buildLabel(sha: string | undefined = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA): string | null {
  return sha ? sha.slice(0, 7) : null;
}
