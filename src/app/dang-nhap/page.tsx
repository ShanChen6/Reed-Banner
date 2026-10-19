// Trang đăng nhập: chọn Google hoặc GitHub, hoặc chơi tiếp với tư cách khách. Đã đăng nhập thì hiện tài
// khoản, gắn thêm nhà cung cấp còn lại và đăng xuất. Dựng ở server từ cookie, không cần JavaScript.

import type { Metadata } from "next";
import Link from "next/link";
import { enabledProviders, safeReturnTo } from "@/server/oauth";
import { currentUser } from "@/server/session";
import { DongSonBand, LeaderFlag } from "../demo/art/icons";
import { PROVIDER_NAME, ProviderLogo } from "./ProviderLogo";

export const metadata: Metadata = {
  title: "Đăng nhập · Cờ Lau",
  description: "Đăng nhập Cờ Lau bằng Google hoặc GitHub để giữ tiến độ trên mọi thiết bị.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; dangNhap?: string }> }) {
  const { returnTo: rawReturn, dangNhap } = await searchParams;
  const returnTo = safeReturnTo(rawReturn);
  const providers = enabledProviders();
  const { id, account } = await currentUser();
  const loginHref = (p: string) => `/api/auth/${p}?returnTo=${encodeURIComponent(returnTo)}`;

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
          <h1 className="text-center font-serif text-2xl font-bold">{account ? "Tài khoản" : "Đăng nhập"}</h1>
          <DongSonBand className="mx-auto mt-3 w-32" />

          {dangNhap === "loi" && (
            <p role="alert" className="mt-4 rounded bg-rose-900/40 px-3 py-2 text-sm text-rose-200">
              Đăng nhập không thành công, bạn thử lại nhé.
            </p>
          )}

          {account ? (
            <div className="mt-6 flex flex-col items-center gap-4">
              {account.avatarUrl ? (
                // Ảnh đại diện từ Google/GitHub; nhỏ nên không cần tối ưu qua next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={account.avatarUrl} alt="" className="size-16 rounded-full border-2 border-[var(--gold)]" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-[var(--gold)] text-2xl font-bold">
                  {account.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-center">
                <p className="text-lg font-semibold">{account.name}</p>
                <p className="mt-1 flex items-center justify-center gap-2 text-sm text-stone-400">
                  Đã liên kết:
                  {account.providers.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1">
                      <ProviderLogo provider={p} className="size-4" /> {PROVIDER_NAME[p]}
                    </span>
                  ))}
                </p>
              </div>
              <Link
                href={returnTo}
                className="w-full rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-4 py-2.5 text-center font-bold uppercase tracking-wider text-amber-50"
              >
                Vào chơi
              </Link>
              {providers
                .filter((p) => !account.providers.includes(p))
                .map((p) => (
                  <a key={p} href={loginHref(p)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
                    <ProviderLogo provider={p} /> Liên kết thêm {PROVIDER_NAME[p]}
                  </a>
                ))}
              <form action={`/api/auth/logout?returnTo=${encodeURIComponent("/dang-nhap")}`} method="post" className="w-full">
                <button type="submit" className="w-full rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
                  Đăng xuất
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-center text-sm text-stone-300">Đăng nhập để giữ tiến độ và chơi tiếp trên mọi thiết bị.</p>
              {providers.length > 0 ? (
                providers.map((p) => (
                  <a
                    key={p}
                    href={loginHref(p)}
                    className={`flex items-center justify-center gap-3 rounded-lg px-4 py-2.5 font-semibold ${
                      p === "google" ? "bg-white text-stone-900 hover:bg-stone-100" : "bg-stone-950 text-white ring-1 ring-stone-600 hover:bg-black"
                    }`}
                  >
                    <ProviderLogo provider={p} /> Tiếp tục với {PROVIDER_NAME[p]}
                  </a>
                ))
              ) : (
                <p className="rounded bg-black/30 px-3 py-2 text-center text-sm text-stone-400">Chưa bật cách đăng nhập nào.</p>
              )}
              <div className="my-1 flex items-center gap-3 text-xs text-stone-500">
                <span className="h-px flex-1 bg-stone-700" /> hoặc <span className="h-px flex-1 bg-stone-700" />
              </div>
              <Link href={returnTo} className="rounded-lg bg-white/10 px-4 py-2.5 text-center hover:bg-white/15">
                {id ? "Chơi tiếp với tư cách khách" : "Chơi với tư cách khách"}
              </Link>
              <p className="text-center text-xs text-stone-500">
                Tài khoản khách gắn với trình duyệt này, xóa dữ liệu trình duyệt là mất. Đăng nhập sau vẫn giữ được trận và tiến độ của khách.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
