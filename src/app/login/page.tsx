// Trang đăng nhập: Google, GitHub, tên đăng nhập + mật khẩu, hoặc chơi tiếp với tư cách khách. Đã đăng nhập
// thì chuyển sang /account. Dựng ở server từ cookie, không cần JavaScript.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { enabledProviders } from "@/server/oauth";
import { currentUser } from "@/server/session";
import { AuthCard, Divider, withReturnTo } from "../_auth/AuthCard";
import { readAuthParams, type AuthSearchParams } from "../_auth/params";
import { LoginForm } from "../_auth/PasswordForms";
import { ProviderButtons } from "../_auth/ProviderButtons";

export const metadata: Metadata = {
  title: "Đăng nhập · Cờ Lau",
  description: "Đăng nhập Cờ Lau bằng Google, GitHub hoặc tên đăng nhập để giữ tiến độ trên mọi thiết bị.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<AuthSearchParams> }) {
  const { returnTo, oauthError, error, username } = readAuthParams(await searchParams);
  const { id, account } = await currentUser();
  if (account) redirect(withReturnTo("/account", returnTo));
  const providers = enabledProviders();

  return (
    <AuthCard title="Đăng nhập" oauthError={oauthError}>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-center text-sm text-stone-300">Đăng nhập để giữ tiến độ và chơi tiếp trên mọi thiết bị.</p>
        <ProviderButtons providers={providers} returnTo={returnTo} />
        <Divider>{providers.length > 0 ? "hoặc dùng tên đăng nhập" : "Dùng tên đăng nhập"}</Divider>
        <LoginForm returnTo={returnTo} username={username} error={error} />
        <p className="text-center text-sm text-stone-400">
          Chưa có tài khoản?{" "}
          <Link href={withReturnTo("/register", returnTo)} className="font-semibold text-[var(--gold)] hover:underline">
            Đăng ký
          </Link>
        </p>
        <Divider>hoặc</Divider>
        <Link href={returnTo} className="rounded-lg bg-white/10 px-4 py-2.5 text-center hover:bg-white/15">
          {id ? "Chơi tiếp với tư cách khách" : "Chơi với tư cách khách"}
        </Link>
        <p className="text-center text-xs text-stone-500">
          Tài khoản khách gắn với trình duyệt này, xóa dữ liệu trình duyệt là mất. Đăng nhập sau vẫn giữ được trận và tiến độ của khách.
        </p>
      </div>
    </AuthCard>
  );
}
