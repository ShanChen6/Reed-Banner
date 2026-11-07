// Liên kết ở footer màn game. Liên kết nội bộ luôn hiện; liên kết ngoài (góp ý, cộng đồng, điều khoản, quyền riêng tư) chỉ hiện
// khi đặt biến môi trường tương ứng lúc build (xem .env.example), để không có liên kết chết. Biến NEXT_PUBLIC_* được nhúng vào
// bản build, nên chỉ đặt địa chỉ công khai.

export interface FooterLink {
  readonly label: string;
  readonly href: string;
  /** Mở trang ngoài ở thẻ mới. */
  readonly external?: boolean;
}

const internal: readonly FooterLink[] = [
  { label: "Giới thiệu", href: "/" },
  { label: "Hỏi đáp", href: "/#faq" },
];

/** Danh sách liên kết hiển thị: nội bộ trước, rồi các liên kết ngoài đã được đặt địa chỉ. */
export function footerLinks(env: Readonly<Record<string, string | undefined>> = {
  NEXT_PUBLIC_FEEDBACK_URL: process.env.NEXT_PUBLIC_FEEDBACK_URL,
  NEXT_PUBLIC_COMMUNITY_URL: process.env.NEXT_PUBLIC_COMMUNITY_URL,
  NEXT_PUBLIC_TERMS_URL: process.env.NEXT_PUBLIC_TERMS_URL,
  NEXT_PUBLIC_PRIVACY_URL: process.env.NEXT_PUBLIC_PRIVACY_URL,
}): readonly FooterLink[] {
  const external: [string, string | undefined][] = [
    ["Góp ý và báo lỗi", env.NEXT_PUBLIC_FEEDBACK_URL],
    ["Cộng đồng", env.NEXT_PUBLIC_COMMUNITY_URL],
    ["Điều khoản", env.NEXT_PUBLIC_TERMS_URL],
    ["Quyền riêng tư", env.NEXT_PUBLIC_PRIVACY_URL],
  ];
  return [
    ...internal,
    ...external.flatMap(([label, href]) => (href && /^https?:\/\//.test(href) ? [{ label, href, external: true }] : [])),
  ];
}

/** Mã bản dựng ngắn (Vercel đặt khi bật "expose system environment variables"); không có thì không hiện. */
export function buildLabel(sha: string | undefined = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA): string | null {
  return sha ? sha.slice(0, 7) : null;
}
