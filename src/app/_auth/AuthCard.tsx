// Khung chung của các trang /login, /register, /account: thanh trên có logo về trang chủ, một thẻ ở giữa.

import Link from "next/link";
import { DongSonBand, LeaderFlag } from "../demo/art/icons";

export function AuthCard({ title, oauthError, children }: { title: string; oauthError?: boolean; children: React.ReactNode }) {
  return (
    <div className="demo-bg flex min-h-dvh flex-col bg-[var(--bg)] text-stone-100 [--bg:#17110e] [--gold:#d4a24c] [--panel:#271d18]">
      <header className="border-b border-[var(--gold)]/25">
        <nav className="mx-auto flex max-w-6xl items-center px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold">
            <LeaderFlag className="size-7" /> Cờ Lau
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <section className="w-full max-w-sm rounded-xl border border-[var(--gold)]/40 bg-[var(--panel)]/95 p-6 shadow-[0_0_40px_-12px_#c0392b]">
          <h1 className="text-center font-serif text-2xl font-bold">{title}</h1>
          <DongSonBand className="mx-auto mt-3 w-32" />
          {oauthError && (
            <p role="alert" className="mt-4 rounded bg-rose-900/40 px-3 py-2 text-sm text-rose-200">
              Đăng nhập không thành công, bạn thử lại nhé.
            </p>
          )}
          {children}
        </section>
      </main>
    </div>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-1 flex items-center gap-3 text-xs text-stone-500">
      <span className="h-px flex-1 bg-stone-700" /> {children} <span className="h-px flex-1 bg-stone-700" />
    </div>
  );
}

/** Đường dẫn kèm `returnTo` (bỏ qua khi là mặc định /play cho gọn). */
export function withReturnTo(path: string, returnTo: string): string {
  return returnTo === "/play" ? path : `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}
