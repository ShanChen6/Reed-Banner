"use client";

// Màn chơi: một giao diện duy nhất, `currentScene` quyết định phân cảnh nào hiện ra. Phân cảnh lấy từ đường
// dẫn (usePathname) nên thanh địa chỉ, nút Back và state luôn khớp nhau; đổi phân cảnh chỉ render lại phần
// giữa, thanh trên (về màn chính, tài khoản) giữ nguyên. Các phân cảnh tài khoản dựng sẵn ở server (cần
// cookie, nhà cung cấp OAuth) rồi truyền vào qua `auth`.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LogoMark } from "./art/logo";
import ArenaScreen from "./arena/ArenaScreen";
import DemoGame from "./battle/DemoGame";
import CampaignScreen from "./campaign/CampaignScreen";
import DailyScreen from "./daily/DailyScreen";
import LeaderboardScreen from "./leaderboard/LeaderboardScreen";
import MenuScene from "./MenuScene";
import ProfileScreen from "./profile/ProfileScreen";
import QuestsScreen from "./quests/QuestsScreen";
import { resolveScene, sceneOfPath, scenePath, SCENE_TITLE, type AuthScene, type Scene } from "./scene";
import { isScenePath, pushScenePath, SceneContext, SceneLink, type SceneApi } from "./SceneContext";
import SurvivalScreen from "./survival/SurvivalScreen";
import TrialScreen from "./trial/TrialScreen";
import DestinyScreen from "./destiny/DestinyScreen";

export interface ShellAccount {
  readonly name: string;
  readonly avatarUrl: string | null;
}

export interface TowerFeatures {
  readonly trial: boolean;
  readonly destiny: boolean;
}

export default function GameShell({
  account,
  theme,
  auth,
  towerFeatures,
}: {
  account: ShellAccount | null;
  theme: "light" | "dark";
  auth: Partial<Record<AuthScene, React.ReactNode>>;
  towerFeatures: TowerFeatures;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentScene: Scene = resolveScene(sceneOfPath(pathname) ?? "MENU", account !== null);
  const [startUrl] = useState(() => `${pathname}?${searchParams.toString()}`);
  const arrived = `${pathname}?${searchParams.toString()}` === startUrl;

  const goHref = useCallback((href: string) => {
    if (isScenePath(href)) pushScenePath(href);
    else window.location.assign(href);
  }, []);

  const api = useMemo<SceneApi>(
    () => ({
      currentScene,
      params: new URLSearchParams(searchParams.toString()),
      go: (scene, params) => goHref(scenePath(scene, params)),
      goHref,
      arrived,
    }),
    [currentScene, searchParams, goHref, arrived],
  );

  useEffect(() => {
    document.title = currentScene === "MENU" ? "Cờ Lau" : `${SCENE_TITLE[currentScene]} · Cờ Lau`;
  }, [currentScene]);

  const light = theme === "light" && (currentScene === "PLAYING" || currentScene === "PRACTICE");

  return (
    <SceneContext.Provider value={api}>
      <div className="flex min-h-dvh flex-col">
        <header
          className={`sticky top-0 z-40 border-b backdrop-blur ${
            light ? "border-[#b8862f]/30 bg-[#f3ebdc]/90 text-stone-900" : "border-[#d4a24c]/25 bg-[#17110e]/90 text-foreground"
          }`}
        >
          <nav className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-1 text-sm sm:px-4">
            {currentScene === "MENU" ? (
              <Link href="/" className="flex items-center gap-1.5 font-serif text-base font-bold">
                <LogoMark className="size-7" /> Cờ Lau
              </Link>
            ) : (
              <SceneLink scene="MENU" className="flex min-h-11 items-center gap-1.5 rounded px-2 py-1 font-semibold whitespace-nowrap hover:bg-white/10">
                <span aria-hidden>←</span> Màn chính
              </SceneLink>
            )}
            <span className="truncate opacity-60">{currentScene === "MENU" ? "" : SCENE_TITLE[currentScene]}</span>
            <span className="ml-auto" />
            {/* Màn Sử ký: lối tắt Hồ sơ và Trận thường nằm trên thanh chung, không thành một hàng nút riêng. */}
            {currentScene === "CAMPAIGN" && (
              <>
                <SceneLink scene="PROFILE" className="hidden min-h-11 items-center rounded px-2 py-1 hover:bg-white/10 sm:flex">
                  Hồ sơ
                </SceneLink>
                <SceneLink scene="PLAYING" className="hidden min-h-11 items-center rounded px-2 py-1 hover:bg-white/10 sm:flex">
                  Trận thường
                </SceneLink>
              </>
            )}
            {account ? (
              <SceneLink scene="ACCOUNT" className="flex min-h-11 items-center gap-2 rounded px-2 py-1 hover:bg-white/10" title="Tài khoản">
                <AccountAvatar account={account} />
                <span className="max-w-32 truncate font-semibold">{account.name}</span>
              </SceneLink>
            ) : (
              <>
                {/* Khách vẫn chơi được, tiến độ lưu theo cookie khách; nút Đăng nhập để giữ tiến độ trên tài khoản. */}
                <span className="hidden items-center gap-1.5 opacity-80 sm:flex">
                  <span aria-hidden className="grid size-6 place-items-center rounded-full border border-current/40 text-xs">
                    ?
                  </span>
                  Khách
                </span>
                {!(currentScene in auth) && (
                  <SceneLink
                    scene="LOGIN"
                    params={{ returnTo: currentScene === "MENU" ? undefined : scenePath(currentScene) }}
                    className="relative rounded bg-amber-500 px-2.5 py-1 font-semibold whitespace-nowrap text-stone-950 before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']"
                  >
                    Đăng nhập
                  </SceneLink>
                )}
              </>
            )}
          </nav>
        </header>
        {arrived && api.params.get("login") === "error" && !(currentScene in auth) && (
          <p role="alert" className="bg-rose-900/60 px-4 py-2 text-center text-sm text-rose-100">
            Đăng nhập không thành công, thử lại nhé.
          </p>
        )}
        <div key={currentScene} className="scene-enter flex flex-1 flex-col">
          <SceneView scene={currentScene} account={account} theme={theme} auth={auth} resume={api.params.get("resume") === "1"} towerFeatures={towerFeatures} />
        </div>
      </div>
    </SceneContext.Provider>
  );
}

/** Ảnh đại diện Google/GitHub; tài khoản mật khẩu không có ảnh thì hiện chữ cái đầu của tên. */
function AccountAvatar({ account }: { account: ShellAccount }) {
  if (account.avatarUrl)
    return (
      // Ảnh đại diện từ Google/GitHub, nhỏ nên không cần tối ưu qua next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={account.avatarUrl} alt="" className="size-7 rounded-full border border-[#d4a24c]/60" referrerPolicy="no-referrer" />
    );
  const initial = [...account.name.trim()][0]?.toUpperCase() ?? "?";
  return (
    <span aria-hidden className="grid size-7 place-items-center rounded-full border border-[#d4a24c]/60 bg-[#6b2a1a] text-xs font-bold text-amber-100">
      {initial}
    </span>
  );
}

function SceneView({
  scene,
  account,
  theme,
  auth,
  resume,
  towerFeatures,
}: {
  scene: Scene;
  account: ShellAccount | null;
  theme: "light" | "dark";
  auth: Partial<Record<AuthScene, React.ReactNode>>;
  resume: boolean;
  towerFeatures: TowerFeatures;
}) {
  switch (scene) {
    case "MENU":
      return <MenuScene account={account} towerFeatures={towerFeatures} />;
    case "PLAYING":
      return <DemoGame theme={theme} online autoResume={resume} towerFeatures={towerFeatures} />;
    case "PRACTICE":
      return <DemoGame theme={theme} />;
    case "CAMPAIGN":
      return <CampaignScreen />;
    case "TRIAL":
      return towerFeatures.trial ? <TrialScreen /> : <DisabledTowerMode name="Tháp Thí Luyện" />;
    case "DESTINY":
      return towerFeatures.destiny ? <DestinyScreen /> : <DisabledTowerMode name="Tháp Vận Mệnh" />;
    case "SURVIVAL":
      return <SurvivalScreen />;
    case "DAILY":
      return <DailyScreen />;
    case "ARENA":
      return <ArenaScreen />;
    case "QUESTS":
      return <QuestsScreen />;
    case "LEADERBOARD":
      return <LeaderboardScreen destinyEnabled={towerFeatures.destiny} />;
    case "PROFILE":
      return <ProfileScreen playerName={account?.name ?? null} />;
    case "LOGIN":
    case "REGISTER":
    case "ACCOUNT":
    case "FORGOT_PASSWORD":
    case "RESET_PASSWORD":
      return auth[scene] ?? null;
  }
}

function DisabledTowerMode({ name }: { name: string }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#17110e] px-4 text-foreground">
      <section role="status" className="max-w-md rounded-xl border border-amber-600/40 bg-[#271d18] p-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-amber-100">{name}</h1>
        <p className="mt-2 text-foreground-secondary">Chế độ này chưa mở. Tiến trình và trận đang dở được giữ nguyên cho đến khi mở lại.</p>
        <SceneLink scene="MENU" className="mt-4 inline-block rounded bg-amber-500 px-4 py-2 font-semibold text-stone-950">Về màn chính</SceneLink>
      </section>
    </main>
  );
}
