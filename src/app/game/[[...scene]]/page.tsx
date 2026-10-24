// Màn chơi: một trang duy nhất cho mọi phân cảnh (/game, /game/campaign, /game/login, …). Server chỉ dựng lần
// đầu (đọc cookie, nhà cung cấp OAuth, lỗi form); sau đó GameShell đổi phân cảnh ngay trên trình duyệt.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mailEnabled } from "@/server/mail";
import { enabledProviders } from "@/server/oauth";
import { currentUser } from "@/server/session";
import { towerFeatureFlags } from "@/server/featureFlags";
import { AccountScene, ForgotPasswordScene, LoginScene, RegisterScene, ResetPasswordScene } from "../auth/AuthScenes";
import { readAuthParams, type AuthSearchParams } from "../auth/params";
import GameShell from "../GameShell";
import { sceneOfSlug, SCENE_TITLE } from "../scene";

export const dynamic = "force-dynamic";

type Params = Promise<{ scene?: string[] }>;

function sceneOf(parts: string[] | undefined) {
  return parts && parts.length > 1 ? null : sceneOfSlug(parts?.[0]);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const scene = sceneOf((await params).scene);
  return {
    title: !scene || scene === "MENU" ? "Cờ Lau" : `${SCENE_TITLE[scene]} · Cờ Lau`,
    description: "Cờ Lau: match-3 chiến đấu theo lượt thời Loạn 12 Sứ Quân.",
  };
}

export default async function GamePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<AuthSearchParams & { theme?: string }>;
}) {
  if (!sceneOf((await params).scene)) notFound();
  const q = await searchParams;
  const auth = readAuthParams(q);
  const { id, account } = await currentUser();
  const providers = enabledProviders();
  const mail = mailEnabled();
  const towerFeatures = towerFeatureFlags();
  // Quên/đặt lại mật khẩu mở được cả khi đang đăng nhập (đường dẫn trong thư có thể mở ở máy đang đăng nhập).
  const recovery = { FORGOT_PASSWORD: <ForgotPasswordScene q={auth} mail={mail} />, RESET_PASSWORD: <ResetPasswordScene q={auth} /> };

  return (
    <GameShell
      account={account && { name: account.name, avatarUrl: account.avatarUrl }}
      theme={q.theme === "light" ? "light" : "dark"}
      towerFeatures={towerFeatures}
      auth={
        account
          ? {
              ACCOUNT: <AccountScene q={auth} account={account} linkable={providers.filter((p) => !account.providers.includes(p))} mail={mail} />,
              ...recovery,
            }
          : {
              LOGIN: <LoginScene q={auth} providers={providers} guest={id !== null} mail={mail} />,
              REGISTER: <RegisterScene q={auth} providers={providers} mail={mail} />,
              ...recovery,
            }
      }
    />
  );
}
