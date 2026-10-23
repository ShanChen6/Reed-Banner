"use client";

// Phân cảnh MENU của màn chơi: vào trận, tiếp tục trận dở, các chế độ, hồ sơ và tài khoản. Bấm vào đâu cũng
// chỉ đổi phân cảnh, không tải lại trang.

import { useSyncExternalStore } from "react";
import { DongSonBand, ShieldIcon } from "./art/icons";
import { Logo } from "./art/logo";
import { ONLINE_BATTLE_KEY } from "./battle/online";
import type { ShellAccount } from "./GameShell";
import type { Scene } from "./scene";
import { SceneLink } from "./SceneContext";

const MODES: readonly { scene: Scene; title: string; text: string }[] = [
  { scene: "CAMPAIGN", title: "Chiến dịch", text: "Bản đồ 12 sứ quân, đánh từng màn, đánh trùm." },
  { scene: "TOWER", title: "Leo tháp", text: "Chuỗi trận mạnh dần, máu và lương mang sang." },
  { scene: "TRIAL", title: "Tháp Thí Luyện", text: "20 tầng cố định, tự chọn đội và luật riêng từng tầng." },
  { scene: "DESTINY", title: "Tháp Vận Mệnh", text: "Khóa roster theo chu kỳ, giữ máu và lương xuyên tầng." },
  { scene: "SURVIVAL", title: "Sinh tồn", text: "Đối thủ kéo đến theo đợt trên cùng bàn cờ." },
  { scene: "DAILY", title: "Thử thách ngày", text: "Một đề chung cho mọi người, mỗi ngày một lần." },
  { scene: "ARENA", title: "Đấu trường", text: "Đánh đội phòng thủ của người chơi khác." },
];

const MORE: readonly { scene: Scene; title: string }[] = [
  { scene: "PROFILE", title: "Hồ sơ & trang bị" },
  { scene: "QUESTS", title: "Nhiệm vụ" },
  { scene: "LEADERBOARD", title: "Xếp hạng" },
  { scene: "PRACTICE", title: "Chơi thử offline" },
];

function hasSavedBattle(): boolean {
  try {
    return window.localStorage.getItem(ONLINE_BATTLE_KEY) !== null;
  } catch {
    return false;
  }
}

export default function MenuScene({ account }: { account: ShellAccount | null }) {
  const saved = useSyncExternalStore(
    () => () => {},
    hasSavedBattle,
    () => false,
  );

  return (
    <main className="demo-bg flex flex-1 flex-col items-center bg-[#17110e] px-4 py-8 text-stone-100 [--gold:#d4a24c] [--panel:#271d18]">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="mx-auto w-72 max-w-full">
            <Logo priority className="h-auto w-full" />
          </h1>
          <DongSonBand className="mx-auto mt-3 w-40" />
          <p className="mt-3 text-sm text-stone-400">
            {account ? `Chào ${account.name}.` : "Đang chơi với tư cách khách, tiến độ gắn với trình duyệt này."}
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-2">
          <SceneLink
            scene="PLAYING"
            className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-5 py-3 text-center font-bold uppercase tracking-wider text-amber-50 shadow-[0_0_24px_-6px_#c0392b] hover:brightness-110"
          >
            Vào trận
          </SceneLink>
          {saved && (
            <SceneLink
              scene="PLAYING"
              params={{ resume: "1" }}
              className="rounded-lg bg-white/10 px-5 py-2.5 text-center font-semibold hover:bg-white/15"
            >
              Tiếp tục trận dở
            </SceneLink>
          )}
        </div>

        <ul className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => (
            <li key={m.scene}>
              <SceneLink
                scene={m.scene}
                className="flex h-full flex-col gap-1 rounded-xl border border-[var(--gold)]/30 bg-[var(--panel)]/90 p-4 transition hover:border-[var(--gold)] hover:bg-[var(--panel)]"
              >
                <span className="flex items-center gap-2 font-serif text-lg font-bold text-amber-100">
                  <ShieldIcon className="size-4 text-[var(--gold)]" /> {m.title}
                </span>
                <span className="text-sm text-stone-400">{m.text}</span>
              </SceneLink>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap justify-center gap-2 text-sm">
          {MORE.map((m) => (
            <li key={m.scene}>
              <SceneLink scene={m.scene} className="flex items-center gap-1.5 rounded-full border border-stone-700 px-3 py-1.5 hover:border-[var(--gold)] hover:text-[var(--gold)]">
                {m.title}
              </SceneLink>
            </li>
          ))}
          <li>
            <SceneLink
              scene={account ? "ACCOUNT" : "LOGIN"}
              className="rounded-full border border-stone-700 px-3 py-1.5 hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              {account ? "Tài khoản" : "Đăng nhập / Đăng ký"}
            </SceneLink>
          </li>
        </ul>
      </div>
    </main>
  );
}
