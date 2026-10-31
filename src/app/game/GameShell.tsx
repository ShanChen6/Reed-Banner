"use client";

// Màn chơi: một giao diện duy nhất, `currentScene` quyết định phân cảnh nào hiện ra. Phân cảnh lấy từ đường
// dẫn (usePathname) nên thanh địa chỉ, nút Back và state luôn khớp nhau; đổi phân cảnh chỉ render lại phần
// giữa, thanh header chung (header/GameHeader.tsx) giữ nguyên. Các phân cảnh tài khoản dựng sẵn ở server (cần
// cookie, nhà cung cấp OAuth) rồi truyền vào qua `auth`.

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ArenaScreen from "./arena/ArenaScreen";
import DemoGame from "./battle/DemoGame";
import CampaignScreen from "./campaign/CampaignScreen";
import DailyScreen from "./daily/DailyScreen";
import LeaderboardScreen from "./leaderboard/LeaderboardScreen";
import MenuScene from "./MenuScene";
import ProfileScreen from "./profile/ProfileScreen";
import QuestsScreen from "./quests/QuestsScreen";
import ShopScreen from "./shop/ShopScreen";
import { resolveScene, sceneOfPath, scenePath, SCENE_TITLE, type AuthScene, type Scene } from "./scene";
import { isScenePath, pushScenePath, SceneContext, SceneLink, type SceneApi } from "./SceneContext";
import SurvivalScreen from "./survival/SurvivalScreen";
import TrialScreen from "./trial/TrialScreen";
import DestinyScreen from "./destiny/DestinyScreen";
import GameHeader from "./header/GameHeader";

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

  return (
    <SceneContext.Provider value={api}>
      <div className="flex min-h-dvh flex-col">
        <GameHeader scene={currentScene} account={account} />
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
      return towerFeatures.destiny ? <DestinyScreen /> : <DisabledTowerMode name="Tháp Thiên Mệnh" />;
    case "SURVIVAL":
      return <SurvivalScreen />;
    case "DAILY":
      return <DailyScreen />;
    case "ARENA":
      return <ArenaScreen />;
    case "QUESTS":
      return <QuestsScreen />;
    case "SHOP":
      return <ShopScreen />;
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
