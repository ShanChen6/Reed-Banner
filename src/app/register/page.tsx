// Trang đăng ký: tạo tài khoản bằng tên đăng nhập + mật khẩu, hoặc dùng luôn Google/GitHub. Tài khoản mới
// giữ trận và tiến độ của khách đang chơi trên trình duyệt này. Đã đăng nhập thì chuyển sang /account.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { enabledProviders } from "@/server/oauth";
import { currentUser } from "@/server/session";
import { AuthCard, Divider, withReturnTo } from "../_auth/AuthCard";
import { readAuthParams, type AuthSearchParams } from "../_auth/params";
import { RegisterForm } from "../_auth/PasswordForms";
import { ProviderButtons } from "../_auth/ProviderButtons";

export const metadata: Metadata = {
  title: "Đăng ký · Cờ Lau",
  description: "Tạo tài khoản Cờ Lau để giữ tiến độ trên mọi thiết bị.",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<AuthSearchParams> }) {
  const { returnTo, oauthError, error, username } = readAuthParams(await searchParams);
  const { account } = await currentUser();
  if (account) redirect(withReturnTo("/account", returnTo));
  const providers = enabledProviders();

  return (
    <AuthCard title="Đăng ký" oauthError={oauthError}>
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-center text-sm text-stone-300">Tạo tài khoản để giữ tiến độ. Trận và tiến độ đang chơi được giữ nguyên.</p>
        <ProviderButtons providers={providers} returnTo={returnTo} />
        <Divider>{providers.length > 0 ? "hoặc tạo tên đăng nhập" : "Tạo tên đăng nhập"}</Divider>
        <RegisterForm returnTo={returnTo} username={username} error={error} />
        <p className="text-center text-sm text-stone-400">
          Đã có tài khoản?{" "}
          <Link href={withReturnTo("/login", returnTo)} className="font-semibold text-[var(--gold)] hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
