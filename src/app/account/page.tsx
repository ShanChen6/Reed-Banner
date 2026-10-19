// Trang tài khoản: tên, ảnh, nhà cung cấp đã liên kết, liên kết thêm, đặt hoặc đổi mật khẩu, đăng xuất.
// Chưa đăng nhập thì chuyển sang /login.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { enabledProviders } from "@/server/oauth";
import { currentUser } from "@/server/session";
import { AuthCard, withReturnTo } from "../_auth/AuthCard";
import { readAuthParams, type AuthSearchParams } from "../_auth/params";
import { ChangePasswordForm, RegisterForm } from "../_auth/PasswordForms";
import { PROVIDER_NAME, ProviderLogo } from "../_auth/ProviderLogo";

export const metadata: Metadata = { title: "Tài khoản · Cờ Lau" };

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<AuthSearchParams & { passwordChanged?: string }> }) {
  const q = await searchParams;
  const { returnTo, oauthError, error, username } = readAuthParams(q);
  const { account } = await currentUser();
  if (!account) redirect(withReturnTo("/login", returnTo));
  const linkable = enabledProviders().filter((p) => !account.providers.includes(p));

  return (
    <AuthCard title="Tài khoản" oauthError={oauthError}>
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
          {account.providers.length > 0 && (
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-stone-400">
              Đã liên kết:
              {account.providers.map((p) => (
                <span key={p} className="inline-flex items-center gap-1">
                  <ProviderLogo provider={p} className="size-4" /> {PROVIDER_NAME[p]}
                </span>
              ))}
            </p>
          )}
        </div>
        <Link
          href={returnTo}
          className="w-full rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-4 py-2.5 text-center font-bold uppercase tracking-wider text-amber-50"
        >
          Vào chơi
        </Link>
        {linkable.map((p) => (
          <a
            key={p}
            href={`/api/auth/${p}?returnTo=/account`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            <ProviderLogo provider={p} /> Liên kết thêm {PROVIDER_NAME[p]}
          </a>
        ))}
        <div className="w-full rounded-lg bg-black/20 p-3 text-sm">
          {account.username ? (
            <>
              <p>
                Tên đăng nhập: <span className="font-semibold">{account.username}</span>
              </p>
              {q.passwordChanged === "1" && <p className="mt-2 text-emerald-400">Đã đổi mật khẩu.</p>}
              <details open={error !== null} className="mt-2">
                <summary className="cursor-pointer text-stone-300">Đổi mật khẩu</summary>
                <div className="mt-3">
                  <ChangePasswordForm error={error} />
                </div>
              </details>
            </>
          ) : (
            <details open={error !== null}>
              <summary className="cursor-pointer text-stone-300">Thêm tên đăng nhập và mật khẩu</summary>
              <div className="mt-3">
                <RegisterForm returnTo="/account" username={username} error={error} label="Lưu tên đăng nhập" />
              </div>
            </details>
          )}
        </div>
        <form action="/api/auth/logout?returnTo=/login" method="post" className="w-full">
          <button type="submit" className="w-full rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
            Đăng xuất
          </button>
        </form>
      </div>
    </AuthCard>
  );
}
