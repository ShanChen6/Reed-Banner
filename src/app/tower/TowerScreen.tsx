"use client";

// Leo tháp: kỷ lục, lượt leo đang dở (máu, lương, phúc của đội), xem trước tầng kế tiếp, chọn phần thưởng giữa
// các tầng. Bấm Lên tầng thì server tạo trận rồi chuyển sang /play để đánh. Mọi luật ở @/core, server kiểm tra lại.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BOON_BONUS,
  companionById,
  MAIN_ID,
  newTowerRun,
  TOWER_BOSS_EVERY,
  TOWER_FOOD,
  TOWER_FOOD_MAX,
  TOWER_HEAL,
  TOWER_REVIVE,
  towerFloor,
  towerTeam,
  type FighterConfig,
  type Profile,
  type ProfileAction,
  type TowerBoon,
  type TowerReward,
  type TowerRun,
} from "@/core";
import { ElementIcon } from "../demo/art/icons";
import { Portrait } from "../demo/art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../demo/labels";
import {
  createOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  sendProfileAction,
} from "../demo/online";
import { PROFILE_ERROR } from "../demo/ProgressPanel";

const BOON_TEXT: Record<TowerBoon, string> = {
  atk: `Hùng khí: +${BOON_BONUS.atk * 100}% công cả đội`,
  def: `Thiết giáp: +${BOON_BONUS.def * 100}% thủ cả đội`,
  hp: `Bền chí: +${BOON_BONUS.hp * 100}% máu tối đa cả đội`,
};

function rewardText(r: TowerReward): { title: string; body: string } {
  switch (r.kind) {
    case "heal":
      return {
        title: "Hồi máu",
        body: `Người còn đứng hồi ${TOWER_HEAL * 100}% máu; người đã ngã đứng dậy với ${TOWER_REVIVE * 100}% máu.`,
      };
    case "food":
      return {
        title: "Thêm lương",
        body: `+${TOWER_FOOD} lương mang vào tầng sau (tối đa ${TOWER_FOOD_MAX}).`,
      };
    case "boon":
      return {
        title: "Phúc",
        body: `${BOON_TEXT[r.boon]}, tới hết lượt leo.`,
      };
  }
}

const nameOf = (id: string) =>
  id === MAIN_ID ? "Đinh Bộ Lĩnh" : (companionById(id)?.name ?? id);

function FighterCard({ f, hp }: { f: FighterConfig; hp?: number }) {
  return (
    <li className="flex items-center gap-2 rounded-lg bg-black/30 p-2">
      <Portrait
        id={f.id}
        element={f.element}
        profession={f.profession}
        className={`size-11 shrink-0 ${hp === 0 ? "opacity-40 grayscale" : ""}`}
      />
      <div className="min-w-0 flex-1 text-xs">
        <p className="truncate text-sm font-semibold">{nameOf(f.id)}</p>
        <p className="flex items-center gap-1 text-stone-300">
          <ElementIcon element={f.element} className="size-3.5" />
          {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]}
        </p>
        {hp !== undefined && (
          <div
            className="relative mt-1 h-3 overflow-hidden rounded-full bg-black/50"
            role="meter"
            aria-label={`Máu ${nameOf(f.id)}`}
            aria-valuenow={Math.round(hp * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-b from-rose-400 to-rose-700"
              style={{ width: `${hp * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold [text-shadow:0_1px_1px_#000]">
              {hp === 0 ? "Đã ngã" : `${Math.round(hp * 100)}%`}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

function FloorPreview({ run }: { run: TowerRun }) {
  const floor = towerFloor(run, run.floor);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-stone-300">
        Tầng {floor.floor} · đối thủ cấp {floor.level} ·{" "}
        {DIFFICULTY_NAME[floor.difficulty]}
        {floor.boss && (
          <span className="font-semibold text-rose-300">
            {" "}
            · Tầng trùm: sứ quân máu ×1,5 trên sân nhà
          </span>
        )}
      </p>
      <ul className="grid gap-2 sm:grid-cols-3">
        {floor.foes.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-2 rounded-lg bg-black/30 p-2"
          >
            <Portrait
              id={f.id}
              element={f.element}
              profession={f.profession}
              className="size-10 shrink-0"
            />
            <div className="min-w-0 text-xs">
              <p className="truncate text-sm font-semibold">{f.name}</p>
              <p className="flex items-center gap-1 text-stone-300">
                <ElementIcon element={f.element} className="size-3.5" />
                {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TowerScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);

  useEffect(() => {
    void fetchProfile().then((r) => {
      if (r.profile) setProfile(r.profile);
      else setLoadError(true);
    });
  }, []);

  if (!profile) {
    return (
      <Shell>
        <p className="py-24 text-center text-stone-300">
          {loadError
            ? "Không tải được hồ sơ, thử tải lại trang."
            : "Đang tải tháp…"}
        </p>
      </Shell>
    );
  }

  const run = profile.tower.run;
  // Chưa có lượt leo: xem trước đội và tầng 1 với seed tạm (seed thật do server bốc khi vào tầng).
  const shown = run ?? newTowerRun(profile, 0);
  const team = towerTeam(profile, shown);

  const act = async (a: ProfileAction) => {
    setBusy(true);
    const r = await sendProfileAction(a);
    setBusy(false);
    if (r.profile) setProfile(r.profile);
    setMessage(
      r.error
        ? (PROFILE_ERROR[r.error as keyof typeof PROFILE_ERROR] ?? r.error)
        : null,
    );
  };

  const climb = async () => {
    if (run?.active) {
      router.push("/play?resume=1");
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: "3v3",
      element: profile.element,
      profession: profile.profession,
      companions: profile.team,
      difficulty: "normal",
      tower: true,
    });
    if (!res.id) {
      setBusy(false);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì /play không tự tiếp tục; người chơi vẫn bấm Tiếp tục ở đó được.
    }
    router.push("/play?resume=1");
  };

  const boons = Object.entries(shown.boons) as [TowerBoon, number][];

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">
            Vô hạn
          </p>
          <h1 className="text-2xl font-black text-amber-100">Leo tháp</h1>
          <p className="text-sm text-stone-400">
            Kỷ lục: tầng {profile.tower.best} · Đinh Bộ Lĩnh cấp{" "}
            {profile.main.level} · {profile.gold} vàng
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/profile"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Hồ sơ
          </Link>
          <Link
            href="/campaign"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Chiến dịch
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4">
          <h2 className="font-bold text-amber-200">
            {run ? `Đội đang leo · tầng ${run.floor}` : "Đội ra trận"}
          </h2>
          <ul className="flex flex-col gap-2">
            {team.map((f, i) => (
              <FighterCard key={f.id} f={f} hp={shown.hp[i]} />
            ))}
          </ul>
          <div className="flex items-center gap-2 text-sm">
            <span aria-hidden>🍙</span>
            <div
              className="relative h-4 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/40"
              role="meter"
              aria-label="Lương mang vào tầng sau"
              aria-valuenow={shown.food}
              aria-valuemin={0}
              aria-valuemax={TOWER_FOOD_MAX}
            >
              <div
                className="h-full bg-gradient-to-b from-lime-300 to-lime-700"
                style={{ width: `${shown.food}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold [text-shadow:0_1px_1px_#000]">
                {shown.food}/{TOWER_FOOD_MAX} lương
              </span>
            </div>
          </div>
          {boons.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 text-xs">
              {boons.map(([b, n]) => (
                <li
                  key={b}
                  className="rounded-full border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-amber-100"
                >
                  {BOON_TEXT[b]} ×{n}
                </li>
              ))}
            </ul>
          )}
          {!run && (
            <p className="text-xs text-stone-400">
              Đội lấy theo đội 3vs3 đã chọn ở trang Hồ sơ và giữ nguyên cả lượt
              leo.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4">
          {run?.offer ? (
            <div className="rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4">
              <h2 className="mb-1 text-lg font-bold text-amber-100">
                Qua tầng {run.floor - 1}! Chọn một phần thưởng
              </h2>
              <p className="mb-3 text-sm text-stone-400">
                Máu và lương không tự hồi giữa các tầng.
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {run.offer.map((r, i) => {
                  const t = rewardText(r);
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void act({ type: "towerPick", index: i })
                        }
                        className="flex h-full w-full flex-col gap-1 rounded-lg border border-amber-400/40 bg-black/30 p-3 text-left hover:bg-amber-500/15 disabled:opacity-50"
                      >
                        <span className="font-bold text-amber-200">
                          {t.title}
                        </span>
                        <span className="text-xs text-stone-300">{t.body}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4 shadow-[inset_0_0_24px_#0009]">
              <h2 className="text-lg font-bold text-amber-100">
                {run ? `Tầng ${run.floor}` : "Lượt leo mới"}
              </h2>
              {!run && (
                <ul className="list-disc pl-5 text-sm text-stone-300">
                  <li>
                    Mỗi tầng một trận 3vs3, đối thủ mạnh dần; cứ{" "}
                    {TOWER_BOSS_EVERY} tầng có một sứ quân làm trùm.
                  </li>
                  <li>
                    Máu và lương mang sang tầng sau, không tự hồi. Thắng tầng
                    thì chọn 1 trong 3: hồi máu, thêm lương, hoặc một phúc.
                  </li>
                  <li>
                    Thua là hết lượt leo, leo lại từ tầng 1. Kỷ lục là tầng cao
                    nhất đã qua.
                  </li>
                </ul>
              )}
              {run ? (
                <FloorPreview run={run} />
              ) : (
                <p className="text-sm text-stone-300">
                  Tầng 1: đối thủ cấp {shown.baseLevel},{" "}
                  {DIFFICULTY_NAME[towerFloor(shown, 1).difficulty]}. Đối thủ
                  mỗi lượt leo một khác.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void climb()}
                  className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:opacity-50"
                >
                  {busy
                    ? "Đang lên tầng…"
                    : run?.active
                      ? "Tiếp tục trận"
                      : run
                        ? `Lên tầng ${run.floor}`
                        : "Vào tầng 1"}
                </button>
                {message && (
                  <span className="text-sm text-rose-400">{message}</span>
                )}
              </div>
            </div>
          )}
          {run && !run.active && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  confirmQuit
                    ? void act({ type: "towerQuit" }).then(() =>
                        setConfirmQuit(false),
                      )
                    : setConfirmQuit(true)
                }
                className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15 disabled:opacity-50"
              >
                {confirmQuit ? "Bấm lần nữa để bỏ lượt leo" : "Bỏ lượt leo"}
              </button>
              {confirmQuit && (
                <button
                  type="button"
                  onClick={() => setConfirmQuit(false)}
                  className="text-stone-400 underline"
                >
                  Thôi
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2b2440_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
