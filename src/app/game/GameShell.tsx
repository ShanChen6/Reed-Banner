"use client";

// Màn chơi: một giao diện duy nhất, `currentScene` quyết định phân cảnh nào hiện ra. Phân cảnh lấy từ đường
// dẫn (usePathname) nên thanh địa chỉ, nút Back và state luôn khớp nhau; đổi phân cảnh chỉ render lại phần
// giữa, thanh header chung (header/GameHeader.tsx) giữ nguyên. Các phân cảnh tài khoản dựng sẵn ở server (cần
// cookie, nhà cung cấp OAuth) rồi truyền vào qua `auth`.

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ArenaScreen from "./arena/ArenaScreen";
import AudioProvider from "./audio/AudioProvider";
import SceneAudio from "./audio/SceneAudio";
import DemoGame from "./battle/DemoGame";
import CampaignScreen from "./campaign/CampaignScreen";
import DailyScreen from "./daily/DailyScreen";
import FormationScreen from "./formation/FormationScreen";
import KhaiLoScreen from "./khai-lo/KhaiLoScreen";
import TamTuongKyScreen from "./tam-tuong-ky/TamTuongKyScreen";
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
import ExpeditionScreen from "./expedition/ExpeditionScreen";
import GameHeader from "./header/GameHeader";
import LoginGate from "./LoginGate";

export interface ShellAccount {
  readonly name: string;
  readonly avatarUrl: string | null;
}

/** Cờ tính năng server truyền xuống (tên giữ từ lúc chỉ có hai tháp). */
export interface TowerFeatures {
  readonly trial: boolean;
  readonly destiny: boolean;
  /** Tầm Tướng Ký, mặc định tắt (`TAM_TUONG_KY_ENABLED`). */
  readonly tamTuongKy?: boolean;
  /** Tầm Tướng Ký chế độ Hạng tuần (đi cùng `TAM_TUONG_KY_ENABLED`). */
  readonly tamTuongKyRanked?: boolean;
  /** Viễn Chinh, mặc định tắt (`EXPEDITION_ENABLED`). */
  readonly expedition?: boolean;
  /** Tầm Tướng Ký Gói 2 (đã duyệt, đi cùng cờ chế độ). */
  readonly tamTuongKyPack2?: boolean;
  /** Tầm Tướng Ký Gói 3 (khi đã duyệt, đi cùng cờ chế độ). */
  readonly tamTuongKyPack3?: boolean;
}

export default function GameShell({
  account,
  auth,
  towerFeatures,
}: {
  account: ShellAccount | null;
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
      <AudioProvider>
      <SceneAudio scene={currentScene} />
      <div className="flex min-h-dvh flex-col">
        <GameHeader scene={currentScene} account={account} />
        {arrived && api.params.get("login") === "error" && !(currentScene in auth) && (
          <p role="alert" className="bg-rose-900/60 px-4 py-2 text-center text-sm text-rose-100">
            Đăng nhập không thành công, thử lại nhé.
          </p>
        )}
        <div key={currentScene} className="scene-enter flex flex-1 flex-col">
          <SceneView scene={currentScene} account={account} auth={auth} resume={api.params.get("resume") === "1"} towerFeatures={towerFeatures} />
        </div>
      </div>
      </AudioProvider>
    </SceneContext.Provider>
  );
}

function SceneView({
  scene,
  account,
  auth,
  resume,
  towerFeatures,
}: {
  scene: Scene;
  account: ShellAccount | null;
  auth: Partial<Record<AuthScene, React.ReactNode>>;
  resume: boolean;
  towerFeatures: TowerFeatures;
}) {
  switch (scene) {
    case "MENU":
      return <MenuScene account={account} towerFeatures={towerFeatures} />;
    case "PLAYING":
      return <DemoGame online autoResume={resume} towerFeatures={towerFeatures} />;
    case "PRACTICE":
      return <DemoGame />;
    case "CAMPAIGN":
      return <CampaignScreen />;
    case "TRIAL":
      return towerFeatures.trial ? <TrialScreen /> : <DisabledTowerMode name="Tháp Thí Luyện" />;
    case "DESTINY":
      return !towerFeatures.destiny ? <DisabledTowerMode name="Tháp Thiên Mệnh" /> : account ? <DestinyScreen /> : <LoginGate scene="DESTINY" name={SCENE_TITLE.DESTINY} />;
    case "SURVIVAL":
      return account ? <SurvivalScreen /> : <LoginGate scene="SURVIVAL" name={SCENE_TITLE.SURVIVAL} />;
    case "DAILY":
      return account ? <DailyScreen /> : <LoginGate scene="DAILY" name={SCENE_TITLE.DAILY} />;
    case "ARENA":
      return account ? <ArenaScreen /> : <LoginGate scene="ARENA" name={SCENE_TITLE.ARENA} />;
    case "FORMATION":
      return <FormationScreen />;
    case "TAM_TUONG_KY":
      if (!towerFeatures.tamTuongKy) return <DisabledTowerMode name={SCENE_TITLE.TAM_TUONG_KY} />;
      return account ? <TamTuongKyScreen ranked={towerFeatures.tamTuongKyRanked === true} /> : <LoginGate scene="TAM_TUONG_KY" name={SCENE_TITLE.TAM_TUONG_KY} reason="Chế độ này cần tài khoản đã đăng nhập vì mỗi lượt chơi tốn một phiếu, và tiến trình Tướng Lục lưu theo tài khoản." />;
    case "EXPEDITION":
      return !towerFeatures.expedition ? <DisabledTowerMode name={SCENE_TITLE.EXPEDITION} /> : <ExpeditionScreen />;
    case "KHAI_LO":
      return <KhaiLoScreen />;
    case "QUESTS":
      return <QuestsScreen tamTuongKy={towerFeatures.tamTuongKy === true} tamTuongKyPack2={towerFeatures.tamTuongKyPack2 === true} tamTuongKyPack3={towerFeatures.tamTuongKyPack3 === true} />;
    case "SHOP":
      return <ShopScreen />;
    case "LEADERBOARD":
      return account ? <LeaderboardScreen destinyEnabled={towerFeatures.destiny} tamTuongKyRanked={towerFeatures.tamTuongKyRanked === true} /> : <LoginGate scene="LEADERBOARD" name={SCENE_TITLE.LEADERBOARD} />;
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
