// Khung chung của trang giới thiệu (/) và Cẩm nang (/cam-nang): thanh trên cùng luôn có nút Chơi ngay, nút nổi ở đáy
// màn điện thoại, chân trang có thư cuộn liên hệ, tiêu đề mục và nút chơi. Thiết kế lại 19/11/2026 (Shan duyệt đề xuất).

import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { LogoMark } from "../game/art/logo";
import ContactBlock from "../game/ContactBlock";
import { socialLinks } from "../game/footerLinks";
import { OrnateDivider } from "./Ornaments";

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

/** Điều hướng trên cùng và chân trang. Link bắt đầu bằng "#" chỉ có nghĩa trên trang chủ nên trỏ về "/#…". */
export const SITE_NAV: readonly NavLink[] = [
  { href: "/#modes", label: "Chế độ" },
  { href: "/#world", label: "Thế giới" },
  { href: "/cam-nang", label: "Cẩm nang" },
  { href: "/#faq", label: "Hỏi đáp" },
];

/** Khổ nội dung: rộng thêm ở màn từ 1536 px. */
export const SITE_WIDTH = "max-w-6xl 2xl:max-w-[96rem]";

export function PlayButton({ className = "", children = "Chơi ngay" }: { className?: string; children?: React.ReactNode }) {
  return (
    <Link href="/game" className={buttonVariants({ variant: "ornate", className: `fx-btn uppercase tracking-wider ${className}` })}>
      {children}
    </Link>
  );
}

export function SectionTitle({ kicker, title, sub, id }: { kicker: string; title: string; sub?: string; id?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-kicker text-frame-gold">{kicker}</p>
      <h2 id={id} className="fx-gilt-text mt-2 text-heading">{title}</h2>
      <OrnateDivider className="mx-auto mt-4 w-56" />
      {sub && <p className="mt-4 text-on-wood-soft">{sub}</p>}
    </div>
  );
}

export function SiteHeader() {
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-wood-lo focus:p-2">
        Bỏ qua tới nội dung
      </a>
      <header className="sticky top-0 z-40 border-b border-frame-gold/40 bg-wood-lo/90 shadow-[0_8px_24px_-12px_var(--black)] backdrop-blur">
        <nav aria-label="Điều hướng chính" className={`mx-auto flex items-center gap-4 px-4 py-2.5 ${SITE_WIDTH}`}>
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-black">
            <LogoMark className="size-8" /> <span className="fx-gilt-text">Cờ Lau</span>
          </Link>
          <ul className="ml-auto hidden items-center gap-5 text-sm text-on-wood-soft md:flex">
            {SITE_NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-[var(--primary)]">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/game/login" className="ml-auto text-sm text-on-wood-soft hover:text-[var(--primary)] md:ml-2">
            Trình danh
          </Link>
          <PlayButton className="hidden px-3 py-1.5 text-sm sm:inline-flex" />
        </nav>
      </header>
    </>
  );
}

/** Nút Chơi ngay nổi ở đáy màn điện thoại (dưới 768 px), luôn trong tầm ngón cái. */
export function MobilePlayBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-frame-gold/40 bg-wood-lo/95 px-4 py-2.5 backdrop-blur md:hidden">
      <PlayButton className="w-full justify-center text-base">Chơi ngay · không cần tài khoản</PlayButton>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-frame-gold/25 px-4 pt-8 pb-24 text-sm text-on-wood-soft/90 md:pb-8">
      {/* Hai cột: trái là nhận diện, điều hướng và lưu ý; phải là thư cuộn liên hệ, trên điện thoại thư cuộn lên trước. */}
      <div className={`mx-auto grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-start lg:gap-12 ${SITE_WIDTH}`}>
        <div className="order-2 flex flex-col gap-4 lg:order-1 lg:pt-6">
          <div className="flex items-center gap-4">
            <LogoMark className="size-14" />
            <div>
              <p className="font-serif text-2xl font-bold text-on-wood">Cờ Lau</p>
              <p className="mt-0.5 text-base">Trò chơi nhỏ thuộc ShanVerse</p>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 border-y border-frame-gold/20 py-3 text-base sm:grid-cols-3">
            {[
              ...SITE_NAV,
              { href: "/game", label: "Vào game" },
              { href: "/game/practice", label: "Thao Luyện" },
              { href: "/game/login", label: "Trình danh" },
              { href: "/game/register", label: "Ghi danh" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-[var(--primary)]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="max-w-md leading-relaxed">
            Bối cảnh và tên nhân vật lịch sử là lịch sử chung; tính cách, kỹ năng và lời thoại trong game là hư cấu.
          </p>
        </div>
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <ContactBlock links={socialLinks()} />
        </div>
      </div>
    </footer>
  );
}
