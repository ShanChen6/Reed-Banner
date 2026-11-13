"use client";

import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, Select, buttonVariants } from "@/components/ui";

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
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { SeasonBoardPanel } from "../leaderboard/boards";
import { SceneLink, useScene } from "../SceneContext";
import {
  survivalRosterPayload,
  validateSurvivalRosterSelection,
} from "./roster-selection";
import { ModeGuideTabs } from "../ModeGuide";

const pct = (x: number) => `${Math.round(x * 100)}%`;

const SELECTION_ERROR: Record<
  NonNullable<ReturnType<typeof validateSurvivalRosterSelection>>,
  string
> = {
  activeCount: "Xin chọn đủ hai phó tướng cho đội phòng thủ.",
  duplicateFighter: "Mỗi tướng chỉ được chọn vào một vị trí.",
  unownedFighter: "Có tướng chưa chiêu mộ.",
  tooManyReserves: "Doanh Trại chỉ nhận tối đa hai tướng dự bị.",
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
      <ModeScreen label="Trấn Ải">
        <div className="py-24 text-center text-on-wood-soft">
          {loadError ? (
            <>
              <p>Chưa mở được hồ sơ. Xin kiểm tra mạng rồi thử lại.</p>
              <Button variant="secondary"
                type="button"
                onClick={() => {
                  setLoadError(false);
                  void loadProfile();
                }}
                className="mt-4"
              >
                Tải lại hồ sơ
              </Button>
            </>
          ) : (
            <p role="status">Đang tải hồ sơ…</p>
          )}
        </div>
      </ModeScreen>
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
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Chưa bày được trận. Xin thử lại.",
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
        ? `Phó tướng ${slot + 1}`
        : `Tướng dự bị ${slot + 1}`;
    const entry = fighterById.get(value);
    return (
      <div className="ui-frame-inset min-w-0 p-2">
        <label
          htmlFor={`${kind}-${slot}`}
          className="mb-2 block text-kicker text-frame-gold"
        >
          {label}
        </label>
        {entry ? (
          <FighterSummary fighter={entry.fighter} level={entry.level} />
        ) : (
          <div className="mb-2 flex h-12 items-center gap-2 text-caption text-on-wood-soft">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-frame-gold/40">
              —
            </span>
            {kind === "reserve" ? "Không chọn dự bị" : "Chưa chọn"}
          </div>
        )}
        <Select
          id={`${kind}-${slot}`}
          value={value}
          onChange={(event) =>
            updateSelection(kind, slot, event.currentTarget.value)
          }
          disabled={busy}
          className="min-h-11 w-full text-sm disabled:opacity-60"
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
        </Select>
      </div>
    );
  };

  return (
    <ModeScreen wide label="Trấn Ải">
      <ModeBanner
        title="Trấn Ải"
        kicker="Giữ ải · vô hạn"
        art="/art/home/survival.webp"
        description="Đối thủ kéo đến theo đợt trên cùng một bàn cờ, mạnh dần qua từng đợt."
        stats={[
          { label: "Kỷ lục", value: `${profile.survival.best} đợt` },
          { label: "Đinh Bộ Lĩnh", value: `Cấp ${profile.main.level}` },
        ]}
        actions={
          <>
            <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary", className: "min-h-11" })}>
              Doanh Trại
            </SceneLink>
          </>
        }
      />
      <ModeGuideTabs scene="SURVIVAL">

      <RankRewardsPanel mode="survival" />
      <SeasonBoardPanel board="survival" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <OrnateFrame className="flex min-w-0 flex-col gap-4">
          <SectionTitle description="Ba tướng này trực tiếp chiến đấu. Đinh Bộ Lĩnh luôn giữ vị trí thủ lĩnh.">
            Đội phòng thủ
          </SectionTitle>
          {leader && (
            <div className="ui-frame-inset p-2">
              <div className="mb-2 text-kicker text-frame-gold">
                Thủ lĩnh · cố định
              </div>
              <FighterSummary fighter={leader} level={profile.main.level} />
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {slotPicker("active", 0, activeIds[0] ?? "")}
            {slotPicker("active", 1, activeIds[1] ?? "")}
          </div>
          <div className="border-t border-frame-gold/25 pt-3">
            <h3 className="font-bold text-title">Doanh Trại · Dự bị</h3>
            <p className="mb-2 text-caption text-on-wood-soft">
              Dự bị không tham chiến trong đợt. Có thể mang tối đa hai tướng; không bắt buộc đủ.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {slotPicker("reserve", 0, reserveIds[0] ?? "")}
              {slotPicker("reserve", 1, reserveIds[1] ?? "")}
            </div>
          </div>
          <p className="text-caption text-on-wood-soft">
            Danh sách chỉ gồm tướng quân đã có. Cấp, nghề, hệ và chỉ số được chụp vào lượt chơi khi bắt đầu.
          </p>
        </OrnateFrame>

        <OrnateFrame level="raised" className="flex min-w-0 flex-col gap-3 self-start">
          <SectionTitle>Lượt chơi mới</SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-on-wood">
            <li>
              Một trận không dừng trên cùng bàn cờ. Đối thủ kéo đến theo đợt,
              mạnh dần; cứ {SURVIVAL_BOSS_EVERY} đợt có một sứ quân dẫn quân.
              Bạn luôn được biết trước đợt kế tiếp.
            </li>
            <li>
              Hạ hết một đợt thì được nghỉ: tướng ra trận còn sống hồi{" "}
              {pct(SURVIVAL_HEAL)}, dự bị còn sống hồi{" "}
              {pct(SURVIVAL_RESERVE_HEAL)} máu tối đa; cả đội thêm{" "}
              {SURVIVAL_FOOD} lương. Tướng gục không hồi máu, năng lượng giữ
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
          <p className="text-sm text-on-wood-soft">
            Đợt 1: {first.foes.length} đối thủ cấp {first.level},{" "}
            {DIFFICULTY_NAME[first.difficulty]}. Đối thủ mỗi lượt chơi một khác.
          </p>
          {selectionError && (
            <Alert tone="warning" className="p-3 text-sm">
              {SELECTION_ERROR[selectionError]}
            </Alert>
          )}
          {message && (
            <Alert tone="error" className="p-3 text-sm">
              {message}
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              type="button"
              disabled={busy || selectionError !== null}
              onClick={() => void start()}
              className="min-h-11"
            >
              {busy ? "Đang vào trận…" : "Bắt đầu Trấn Ải"}
            </Button>
          </div>
        </OrnateFrame>
      </div>
      </ModeGuideTabs>
    </ModeScreen>
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
        <p className="truncate text-sm font-semibold text-on-wood">
          {fighter.id === MAIN_ID ? "Đinh Bộ Lĩnh" : fighter.name}
          <span className="ml-1 text-caption font-normal text-on-wood-soft">
            cấp {level}
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-x-1 text-caption text-on-wood-soft">
          <ElementIcon element={fighter.element} className="size-3.5" />
          {ELEMENT_NAME[fighter.element]}
          <span aria-hidden>·</span>
          <ProfessionIcon profession={fighter.profession} className="size-3.5" />
          {PROFESSION_NAME[fighter.profession]}
        </p>
        <p className="text-caption text-on-wood-soft">
          {fighter.maxHp} máu · {fighter.atk} công · {fighter.def} thủ
        </p>
      </div>
    </div>
  );
}
