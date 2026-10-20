"use client";

// Màn chơi: một giao diện duy nhất, `currentScene` quyết định phân cảnh nào hiện ra. Phân cảnh lấy từ đường
// dẫn (usePathname) nên thanh địa chỉ, nút Back và state luôn khớp nhau; đổi phân cảnh chỉ render lại phần
// giữa, thanh trên (về màn chính, tài khoản) giữ nguyên. Ba phân cảnh tài khoản dựng sẵn ở server (cần
// cookie, nhà cung cấp OAuth) rồi truyền vào qua `auth`.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LeaderFlag } from "./art/icons";
import ArenaScreen from "./arena/ArenaScreen";
import DemoGame from "./battle/DemoGame";
import CampaignScreen from "./campaign/CampaignScreen";
import DailyScreen from "./daily/DailyScreen";
import LeaderboardScreen from "./leaderboard/LeaderboardScreen";
import MenuScene from "./MenuScene";
import ProfileScreen from "./profile/ProfileScreen";
import QuestsScreen from "./quests/QuestsScreen";
import { resolveScene, sceneOfPath, scenePath, SCENE_TITLE, type Scene } from "./scene";
import { isScenePath, pushScenePath, SceneContext, SceneLink, type SceneApi } from "./SceneContext";
import SurvivalScreen from "./survival/SurvivalScreen";
import TowerScreen from "./tower/TowerScreen";

export interface ShellAccount {
  readonly name: string;
  readonly avatarUrl: string | null;
}

export default function GameShell({
  account,
  theme,
  auth,
}: {
  account: ShellAccount | null;
  theme: "light" | "dark";
  auth: Partial<Record<"LOGIN" | "REGISTER" | "ACCOUNT", React.ReactNode>>;
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
            light ? "border-[#b8862f]/30 bg-[#f3ebdc]/90 text-stone-900" : "border-[#d4a24c]/25 bg-[#17110e]/90 text-stone-100"
          }`}
        >
          <nav className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 text-sm sm:px-4">
            {currentScene === "MENU" ? (
              <Link href="/" className="flex items-center gap-1.5 font-serif text-base font-bold">
                <LeaderFlag className="size-6" /> Cờ Lau
              </Link>
            ) : (
              <SceneLink scene="MENU" className="flex items-center gap-1.5 rounded px-2 py-1 font-semibold hover:bg-white/10">
                <span aria-hidden>←</span> Màn chính
              </SceneLink>
            )}
            <span className="truncate opacity-60">{currentScene === "MENU" ? "" : SCENE_TITLE[currentScene]}</span>
            <span className="ml-auto" />
            {account ? (
              <SceneLink scene="ACCOUNT" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10" title="Tài khoản">
                {account.avatarUrl && (
                  // Ảnh đại diện từ Google/GitHub, nhỏ nên không cần tối ưu qua next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.avatarUrl} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="max-w-32 truncate font-semibold">{account.name}</span>
              </SceneLink>
            ) : (
              currentScene !== "LOGIN" &&
              currentScene !== "REGISTER" && (
                <SceneLink
                  scene="LOGIN"
                  params={{ returnTo: currentScene === "MENU" ? undefined : scenePath(currentScene) }}
                  className="rounded bg-amber-500 px-2.5 py-1 font-semibold text-stone-950"
                >
                  Đăng nhập
                </SceneLink>
              )
            )}
          </nav>
        </header>
        {arrived && api.params.get("login") === "error" && !(currentScene in auth) && (
          <p role="alert" className="bg-rose-900/60 px-4 py-2 text-center text-sm text-rose-100">
            Đăng nhập không thành công, thử lại nhé.
          </p>
        )}
        <div key={currentScene} className="scene-enter flex flex-1 flex-col">
          <SceneView scene={currentScene} account={account} theme={theme} auth={auth} resume={api.params.get("resume") === "1"} />
        </div>
      </div>
    </SceneContext.Provider>
  );
}

function SceneView({
  scene,
  account,
  theme,
  auth,
  resume,
}: {
  scene: Scene;
  account: ShellAccount | null;
  theme: "light" | "dark";
  auth: Partial<Record<"LOGIN" | "REGISTER" | "ACCOUNT", React.ReactNode>>;
  resume: boolean;
}) {
  switch (scene) {
    case "MENU":
      return <MenuScene account={account} />;
    case "PLAYING":
      return <DemoGame theme={theme} online autoResume={resume} />;
    case "PRACTICE":
      return <DemoGame theme={theme} />;
    case "CAMPAIGN":
      return <CampaignScreen />;
    case "TOWER":
      return <TowerScreen />;
    case "SURVIVAL":
      return <SurvivalScreen />;
    case "DAILY":
      return <DailyScreen />;
    case "ARENA":
      return <ArenaScreen />;
    case "QUESTS":
      return <QuestsScreen />;
    case "LEADERBOARD":
      return <LeaderboardScreen />;
    case "PROFILE":
      return <ProfileScreen playerName={account?.name ?? null} />;
    case "LOGIN":
    case "REGISTER":
    case "ACCOUNT":
      return auth[scene] ?? null;
  }
}
