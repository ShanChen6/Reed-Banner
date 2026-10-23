"use client";

// Sinh tồn: chọn đội phòng thủ và doanh trại trước khi bắt đầu lượt chơi mới.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MAIN_ID,
  newSurvivalRun,
  ownsCompanion,
  profileTeam,
  progressOf,
  SURVIVAL_BOSS_EVERY,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_RESERVE_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  SURVIVAL_REVIVE_WAVES,
  SURVIVAL_WAVE_GOLD,
  survivalWave,
  type FighterConfig,
  type Profile,
} from "@/core";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  createOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
} from "../battle/online";
import { SceneLink, useScene } from "../SceneContext";
import {
  survivalRosterPayload,
  validateSurvivalRosterSelection,
} from "./roster-selection";

const pct = (x: number) => `${Math.round(x * 100)}%`;

const SELECTION_ERROR: Record<
  NonNullable<ReturnType<typeof validateSurvivalRosterSelection>>,
  string
> = {
  activeCount: "Hãy chọn đủ hai đồng đội cho đội phòng thủ.",
  duplicateFighter: "Mỗi tướng chỉ được chọn vào một vị trí.",
  unownedFighter: "Có tướng không thuộc quyền sở hữu của bạn.",
  tooManyReserves: "Doanh trại chỉ nhận tối đa hai tướng dự bị.",
};

export default function SurvivalScreen() {
  const { go } = useScene();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [reserveIds, setReserveIds] = useState<string[]>(["", ""]);

  const loadProfile = useCallback(async () => {
    const result = await fetchProfile();
    if (!result.profile) {
      setLoadError(true);
      return;
    }
    setProfile(result.profile);
    setActiveIds(result.profile.team.slice(0, 2));
    setReserveIds(["", ""]);
  }, []);

  useEffect(() => {
    let mounted = true;
    void fetchProfile().then((result) => {
      if (!mounted) return;
      if (!result.profile) {
        setLoadError(true);
        return;
      }
      setProfile(result.profile);
      setActiveIds(result.profile.team.slice(0, 2));
      setReserveIds(["", ""]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const ownedIds = useMemo(
    () =>
      profile
        ? Object.keys(profile.companions).filter((id) =>
            ownsCompanion(profile, id),
          )
        : [],
    [profile],
  );
  const ownedFighters = useMemo(() => {
    if (!profile) return [];
    const configs = profileTeam(profile, ownedIds);
    return configs.slice(1).map((fighter) => ({
      fighter,
      level: progressOf(profile, fighter.id).level,
    }));
  }, [ownedIds, profile]);
  const fighterById = useMemo(
    () => new Map(ownedFighters.map(({ fighter, level }) => [fighter.id, { fighter, level }])),
    [ownedFighters],
  );
  const leader = profile ? profileTeam(profile, [])[0]! : null;
  const selectionError = profile
    ? validateSurvivalRosterSelection(ownedIds, activeIds, reserveIds)
    : "activeCount";

  if (!profile) {
    return (
      <Shell>
        <div className="py-24 text-center text-stone-300">
          {loadError ? (
            <>
              <p>Không tải được hồ sơ. Hãy kiểm tra kết nối rồi thử lại.</p>
              <button
                type="button"
                onClick={() => {
                  setLoadError(false);
                  void loadProfile();
                }}
                className="mt-4 rounded-lg bg-white/10 px-4 py-2 font-semibold hover:bg-white/15"
              >
                Tải lại hồ sơ
              </button>
            </>
          ) : (
            <p role="status">Đang tải hồ sơ…</p>
          )}
        </div>
      </Shell>
    );
  }

  // Xem trước đợt 1 với seed tạm; đối thủ thật do server bốc theo seed riêng của lượt chơi.
  const first = survivalWave(newSurvivalRun(profile, 0), 1);

  const updateSelection = (
    kind: "active" | "reserve",
    slot: number,
    id: string,
  ) => {
    setMessage(null);
    if (kind === "active") {
      setActiveIds((current) =>
        current.map((value, index) => (index === slot ? id : value)),
      );
    } else {
      setReserveIds((current) =>
        current.map((value, index) => (index === slot ? id : value)),
      );
    }
  };

  const start = async () => {
    const invalid = validateSurvivalRosterSelection(
      ownedIds,
      activeIds,
      reserveIds,
    );
    if (invalid) {
      setMessage(SELECTION_ERROR[invalid]);
      return;
    }

    setBusy(true);
    setMessage(null);
    const chosen = survivalRosterPayload(activeIds, reserveIds);
    const res = await createOnline({
      mode: "3v3",
      element: profile.element,
      profession: profile.profession,
      companions: chosen.companions,
      reserveCompanions: chosen.reserveCompanions,
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

  const slotPicker = (
    kind: "active" | "reserve",
    slot: number,
    value: string,
  ) => {
    const otherIds = [
      ...activeIds.filter((_, index) => kind !== "active" || index !== slot),
      ...reserveIds
        .filter(Boolean)
        .filter((_, index) => kind !== "reserve" || index !== slot),
    ];
    const label =
      kind === "active"
        ? `Đồng đội ${slot + 1}`
        : `Tướng dự bị ${slot + 1}`;
    const entry = fighterById.get(value);
    return (
      <div className="min-w-0 rounded-lg border border-white/10 bg-black/25 p-2">
        <label
          htmlFor={`${kind}-${slot}`}
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-300"
        >
          {label}
        </label>
        {entry ? (
          <FighterSummary fighter={entry.fighter} level={entry.level} />
        ) : (
          <div className="mb-2 flex h-12 items-center gap-2 text-xs text-stone-500">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-white/20">
              —
            </span>
            {kind === "reserve" ? "Không chọn dự bị" : "Chưa chọn"}
          </div>
        )}
        <select
          id={`${kind}-${slot}`}
          value={value}
          onChange={(event) =>
            updateSelection(kind, slot, event.currentTarget.value)
          }
          disabled={busy}
          className="min-h-11 w-full rounded-md border border-white/15 bg-[#211914] px-2 text-sm text-stone-100 focus:border-amber-400 focus:outline-none disabled:opacity-60"
        >
          {kind === "active" && (
            <option value="" disabled>
              Chọn đồng đội
            </option>
          )}
          {kind === "reserve" && <option value="">Không chọn</option>}
          {ownedFighters.map(({ fighter, level }) =>
            !otherIds.includes(fighter.id) ? (
              <option key={fighter.id} value={fighter.id}>
                {fighter.name} · cấp {level}
              </option>
            ) : null,
          )}
        </select>
      </div>
    );
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
        <section className="flex flex-col gap-4 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-3 sm:p-4">
          <div>
            <h2 className="font-bold text-amber-200">Đội phòng thủ</h2>
            <p className="text-xs text-stone-400">
              Ba tướng này trực tiếp chiến đấu. Đinh Bộ Lĩnh luôn giữ vị trí thủ lĩnh.
            </p>
          </div>
          {leader && (
            <div className="rounded-lg border border-amber-400/40 bg-amber-950/25 p-2">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                Thủ lĩnh · cố định
              </div>
              <FighterSummary fighter={leader} level={profile.main.level} />
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {slotPicker("active", 0, activeIds[0] ?? "")}
            {slotPicker("active", 1, activeIds[1] ?? "")}
          </div>
          <div className="border-t border-white/10 pt-3">
            <h3 className="font-bold text-emerald-200">Doanh trại · Dự bị</h3>
            <p className="mb-2 text-xs text-stone-400">
              Dự bị không tham chiến trong round. Có thể mang tối đa hai tướng; không bắt buộc đủ.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {slotPicker("reserve", 0, reserveIds[0] ?? "")}
              {slotPicker("reserve", 1, reserveIds[1] ?? "")}
            </div>
          </div>
          <p className="text-xs text-stone-400">
            Danh sách chỉ gồm nhân vật đã sở hữu. Cấp, nghề, hệ và chỉ số được chụp vào lượt chơi khi bắt đầu.
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
              Hạ hết một đợt thì được nghỉ: active còn sống hồi{" "}
              {pct(SURVIVAL_HEAL)}, dự bị còn sống hồi{" "}
              {pct(SURVIVAL_RESERVE_HEAL)} máu tối đa; cả đội thêm{" "}
              {SURVIVAL_FOOD} lương. Fighter gục không hồi máu, năng lượng giữ
              nguyên.
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
          {selectionError && (
            <p role="alert" className="rounded-md bg-rose-950/50 px-3 py-2 text-sm text-rose-200">
              {SELECTION_ERROR[selectionError]}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || selectionError !== null}
              onClick={() => void start()}
              className="min-h-11 rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Đang vào trận…" : "Bắt đầu Sinh tồn"}
            </button>
            {message && (
              <span role="alert" className="text-sm text-rose-300">
                {message}
              </span>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function FighterSummary({
  fighter,
  level,
}: {
  fighter: FighterConfig;
  level: number;
}) {
  return (
    <div className="mb-2 flex min-w-0 items-center gap-2">
      <Portrait
        id={fighter.id}
        element={fighter.element}
        profession={fighter.profession}
        className="size-11 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-100">
          {fighter.id === MAIN_ID ? "Đinh Bộ Lĩnh" : fighter.name}
          <span className="ml-1 text-xs font-normal text-stone-400">
            cấp {level}
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-x-1 text-xs text-stone-300">
          <ElementIcon element={fighter.element} className="size-3.5" />
          {ELEMENT_NAME[fighter.element]}
          <span aria-hidden>·</span>
          <ProfessionIcon profession={fighter.profession} className="size-3.5" />
          {PROFESSION_NAME[fighter.profession]}
        </p>
        <p className="text-[11px] text-stone-400">
          {fighter.maxHp} máu · {fighter.atk} công · {fighter.def} thủ
        </p>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#2b2440_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
