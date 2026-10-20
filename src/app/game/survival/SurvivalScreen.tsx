"use client";

// Sinh tồn: kỷ lục, đội ra trận, luật nghỉ giữa đợt và hồi sinh, xem trước đợt 1. Bấm Bắt đầu thì server tạo
// trận rồi chuyển sang phân cảnh trận; cả lượt chơi là một trận, nghỉ giữa đợt làm ngay trong trận.

import { useEffect, useState } from "react";
import {
  newSurvivalRun,
  profileTeam,
  SURVIVAL_BOSS_EVERY,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  SURVIVAL_REVIVE_WAVES,
  SURVIVAL_WAVE_GOLD,
  survivalWave,
  type Profile,
} from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  createOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
} from "../battle/online";
import { SceneLink, useScene } from "../SceneContext";

const pct = (x: number) => `${Math.round(x * 100)}%`;

export default function SurvivalScreen() {
  const { go } = useScene();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
          {loadError ? "Không tải được hồ sơ, thử tải lại trang." : "Đang tải…"}
        </p>
      </Shell>
    );
  }

  const team = profileTeam(profile, profile.team);
  // Xem trước đợt 1 với seed tạm; đối thủ thật do server bốc theo seed riêng của lượt chơi.
  const first = survivalWave(newSurvivalRun(profile, 0), 1);

  const start = async () => {
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: "3v3",
      element: profile.element,
      profession: profile.profession,
      companions: profile.team,
      difficulty: "easy",
      survival: true,
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
      // Không lưu được thì phân cảnh trận không tự tiếp tục; người chơi vẫn bấm Tiếp tục ở đó được.
    }
    go("PLAYING", { resume: "1" });
  };

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">
            Vô hạn
          </p>
          <h1 className="text-2xl font-black text-amber-100">Sinh tồn</h1>
          <p className="text-sm text-stone-400">
            Kỷ lục: {profile.survival.best} đợt · Đinh Bộ Lĩnh cấp{" "}
            {profile.main.level} · {profile.gold} vàng
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <SceneLink
            scene="PROFILE"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Hồ sơ
          </SceneLink>
          <SceneLink
            scene="TOWER"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Leo tháp
          </SceneLink>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4">
          <h2 className="font-bold text-amber-200">Đội ra trận</h2>
          <ul className="flex flex-col gap-2">
            {team.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-lg bg-black/30 p-2"
              >
                <Portrait
                  id={f.id}
                  element={f.element}
                  profession={f.profession}
                  className="size-11 shrink-0"
                />
                <div className="min-w-0 text-xs">
                  <p className="truncate text-sm font-semibold">{f.name}</p>
                  <p className="flex items-center gap-1 text-stone-300">
                    <ElementIcon element={f.element} className="size-3.5" />
                    {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]}{" "}
                    · {f.maxHp} máu
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-stone-400">
            Đội lấy theo đội 3vs3 đã chọn ở trang Hồ sơ.
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4 shadow-[inset_0_0_24px_#0009]">
          <h2 className="text-lg font-bold text-amber-100">Lượt chơi mới</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-300">
            <li>
              Một trận không dừng trên cùng bàn cờ. Đối thủ kéo đến theo đợt,
              mạnh dần; cứ {SURVIVAL_BOSS_EVERY} đợt có một sứ quân dẫn quân.
              Bạn luôn được biết trước đợt kế tiếp.
            </li>
            <li>
              Hạ hết một đợt thì được nghỉ: người còn đứng hồi{" "}
              {pct(SURVIVAL_HEAL)} máu, cả đội thêm {SURVIVAL_FOOD} lương, năng
              lượng giữ nguyên.
            </li>
            <li>
              Người gục tự đứng dậy sau {SURVIVAL_REVIVE_WAVES} đợt (tính cả đợt
              bị gục), hoặc trả {SURVIVAL_REVIVE_FOOD} lương lúc nghỉ để đứng
              dậy ngay, với {pct(SURVIVAL_REVIVE_HP)} máu. Mỗi lần nghỉ chỉ một
              người đứng dậy.
            </li>
            <li>
              Cả đội gục là hết lượt. Lúc nghỉ có thể dừng để ghi điểm; bỏ dở
              quá 24 giờ cũng chỉ dừng lại, không xử thua.
            </li>
            <li>
              Điểm là số đợt vượt qua, mỗi đợt thưởng {SURVIVAL_WAVE_GOLD} vàng,
              cộng vàng và sách nhặt trên bàn cờ.
            </li>
          </ul>
          <p className="text-sm text-stone-300">
            Đợt 1: {first.foes.length} đối thủ cấp {first.level},{" "}
            {DIFFICULTY_NAME[first.difficulty]}. Đối thủ mỗi lượt chơi một khác.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void start()}
              className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:opacity-50"
            >
              {busy ? "Đang vào trận…" : "Bắt đầu"}
            </button>
            {message && (
              <span className="text-sm text-rose-400">{message}</span>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#2b2440_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
