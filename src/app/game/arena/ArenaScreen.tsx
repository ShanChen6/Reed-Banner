"use client";

import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, ChoiceChip, buttonVariants } from "@/components/ui";

// Quần Hùng: điểm và thành tích, đội phòng thủ (bản chụp đội 3vs3 đang chọn), 3 đối thủ đang bày.
// Đánh dùng đội 3vs3 đang chọn ở hồ sơ; đối thủ do AI điều khiển.

import { useEffect, useMemo, useState } from "react";
import { ARENA_DIFFICULTY, ARENA_TIERS as CORE_ARENA_TIERS, ARENA_WIN_GOLD, MAIN_ID, arenaTeam, companionById, ownsCompanion, progressOf, teamPower, type ArenaMember } from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  createOnline,
  fetchArena,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  type ArenaResponse,
} from "../battle/online";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { SeasonBoardPanel } from "../leaderboard/boards";
import { SceneLink, useScene } from "../SceneContext";
import { ModeGuideTabs } from "../ModeGuide";
import PvpPanel, { probePvp } from "./PvpPanel";
import HeroGrid from "./HeroGrid";
import { TierBadge, TierLadder, tierIndex, type Tier } from "../leaderboard/RankBoard";
import { useProfile } from "../profile/useProfile";

const ATTACK_KEY = "coLau.arena.attack";

/** Màu khiên từng bậc hạng Quần Hùng; mốc và vàng thưởng ở `ARENA_TIERS` (@/core). */
const TIER_COLOR: Record<string, string> = {
  dong: "#b87333",
  bac: "#c0c7d0",
  vang: "#e0b84a",
  bachKim: "#6fd0c8",
  kimCuong: "#6fa8ff",
  huyenThoai: "#c070ff",
};
const TIERS: readonly Tier[] = CORE_ARENA_TIERS.map((t) => ({ name: t.name, min: t.min, color: TIER_COLOR[t.id] ?? "#b87333" }));

function Members({ list }: { list: readonly ArenaMember[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {list.map((m, i) => (
        <li
          key={`${m.id}-${i}`}
          className="ui-frame-inset flex items-center gap-2 p-1.5"
        >
          <Portrait
            id={m.id}
            element={m.element}
            profession={m.profession}
            className="size-9 shrink-0"
          />
          <div className="min-w-0 text-caption">
            <p className="truncate text-sm font-semibold text-on-wood">{m.name}</p>
            <p className="flex items-center gap-1 text-on-wood-soft">
              <ElementIcon element={m.element} className="size-3.5" />
              {ELEMENT_NAME[m.element]} · {PROFESSION_NAME[m.profession]} · cấp{" "}
              {m.level}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ArenaScreen() {
  const { go } = useScene();
  const [data, setData] = useState<ArenaResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tierNote, setTierNote] = useState<string | null>(null);

  /** Đấu người (PvP) chỉ hiện khi máy chủ bật cờ; đang có trận dở hoặc đang chờ ghép thì mở sẵn. */
  const [pvpOpen, setPvpOpen] = useState(false);
  const [mode, setMode] = useState<"ghost" | "pvp">("ghost");
  const [pvpBusy, setPvpBusy] = useState(false);
  /** Hai tướng đi cùng Đinh Bộ Lĩnh khi đánh bóng ma; null là chưa chọn, lấy theo đội 3vs3 ở Doanh Trại. */
  const [picks, setPicks] = useState<readonly string[] | null>(null);
  const { profile } = useProfile();
  const owned = useMemo(
    () => (profile ? Object.keys(profile.companions).filter((id) => ownsCompanion(profile, id) && companionById(id)) : []),
    [profile],
  );
  const savedPicks = useMemo(() => {
    try {
      const raw = JSON.parse(window.localStorage.getItem(ATTACK_KEY) ?? "null") as unknown;
      return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string" && owned.includes(id)).slice(0, 2) : null;
    } catch {
      return null;
    }
  }, [owned]);
  const lineup = picks ?? (savedPicks && savedPicks.length === 2 ? savedPicks : profile ? profile.team.filter((id) => owned.includes(id)).slice(0, 2) : []);
  const choosePicks = (next: readonly string[]) => {
    setPicks(next);
    try {
      window.localStorage.setItem(ATTACK_KEY, JSON.stringify(next));
    } catch {
      // Không nhớ được thì lần sau lấy theo Doanh Trại.
    }
  };
  const attackPower = profile && lineup.length === 2 ? teamPower(arenaTeam(profile, lineup)) : 0;
  const heroes = useMemo(
    () =>
      profile
        ? owned
            .map((id) => {
              const c = companionById(id)!;
              return { id, name: c.name, element: c.element, profession: c.profession, level: progressOf(profile, id).level };
            })
            .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name, "vi"))
        : [],
    [owned, profile],
  );

  useEffect(() => {
    void fetchArena().then(setData);
    void probePvp().then((p) => {
      setPvpOpen(p.available);
      if (p.available && p.busy) setMode("pvp");
    });
  }, []);

  if (data?.rating === undefined) {
    return (
      <ModeScreen card label="Quần Hùng">
        <p className="py-24 text-center text-on-wood-soft">
          {data ? "Chưa mở được Quần Hùng. Xin tải lại trang." : "Đang tải…"}
        </p>
      </ModeScreen>
    );
  }

  const left = data.attacksLeft ?? 0;
  // Lực chiến đội ra trận (đã kẹp trang bị) để so với đối thủ; chưa tải hồ sơ thì tạm lấy đội phòng thủ.
  const myPower = attackPower || (data.defense?.power ?? 0);
  const offers = data.offers ?? [];

  const claimTier = async (tier: string) => {
    setBusy(`tier-${tier}`);
    setTierNote(null);
    const next = await fetchArena("claimTier", tier);
    setBusy(null);
    if (next.rating === undefined) return setMessage(ONLINE_ERROR_TEXT[next.error ?? "network"] ?? "Có trục trặc chưa rõ. Xin thử lại.");
    setData(next);
    if (next.claimed) {
      setTierNote(`Đã nhận ${next.claimed.gold} vàng thưởng bậc ${CORE_ARENA_TIERS.find((t) => t.id === next.claimed!.tier)?.name ?? ""}.`);
      void fetchProfile();
    } else setTierNote(next.claimError === "claimed" ? "Bậc này đã nhận thưởng." : "Chưa đủ điểm hạng để nhận bậc này.");
  };

  const command = async (action: "defend" | "refresh") => {
    setBusy(action);
    setMessage(null);
    setNotice(null);
    const next = await fetchArena(action);
    setBusy(null);
    if (next.rating === undefined)
      return setMessage(ONLINE_ERROR_TEXT[next.error ?? "network"] ?? "Có trục trặc chưa rõ. Xin thử lại.");
    setData(next);
    if (action === "defend") setNotice("Đã cập nhật đội phòng thủ.");
  };

  const attack = async (index: number) => {
    setBusy(`attack${index}`);
    setMessage(null);
    setNotice(null);
    const res = await createOnline({
      mode: "3v3",
      element: "moc",
      profession: "tuongSi",
      companions: lineup,
      difficulty: "hard",
      arena: index,
    });
    if (!res.id) {
      setBusy(null);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Chưa bày được trận. Xin thử lại.",
      );
      if (res.error === "arenaGone") void fetchArena().then(setData);
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì phân cảnh trận không tự tiếp tục.
    }
    go("PLAYING", { resume: "1" });
  };

  return (
    <ModeScreen card label="Quần Hùng">
      <ModeBanner
        title="Quần Hùng"
        kicker="Đấu người"
        art="/art/home/arena.webp"
        description={`Đánh với đội phòng thủ của người chơi khác, do máy điều khiển ở mức ${DIFFICULTY_NAME[ARENA_DIFFICULTY]}. Thắng cộng điểm, thua trừ điểm.`}
        stats={[
          { label: "Điểm", value: data.rating },
          { label: "Hạng", value: data.rank != null ? `#${data.rank}` : "–" },
          { label: "Bậc", value: TIERS[tierIndex(TIERS, data.rating)]!.name },
          { label: "Lượt hôm nay", value: `${left}/${data.attacksPerDay ?? 0}` },
        ]}
      />
      <ModeGuideTabs
        scene="ARENA"
        extraTabs={[
          {
            value: "board",
            label: "Bảng xếp hạng",
            content: (
              <>
                <section aria-labelledby="arena-board-ghost" className="flex flex-col gap-4">
                  <h2 id="arena-board-ghost" className="ui-title-on-wood text-title">Đấu bóng ma</h2>
                  <OrnateFrame>
                    <TierLadder
                      tiers={TIERS}
                      score={data.rating}
                      label="Bậc hạng Quần Hùng"
                      rewards={CORE_ARENA_TIERS.map((t) => ({ gold: t.gold, claimed: (data.tierClaims ?? []).includes(t.id) }))}
                      onClaim={(i) => void claimTier(CORE_ARENA_TIERS[i]!.id)}
                      busy={busy !== null}
                    />
                    {tierNote && <p role="status" className="mt-2 text-sm text-jade">{tierNote}</p>}
                    <p className="mt-2 text-caption text-on-wood-soft">Lần đầu đạt mỗi bậc nhận vàng một lần; tụt bậc không mất thưởng đã nhận.</p>
                  </OrnateFrame>
                  <RankRewardsPanel mode="arena" />
                  <SeasonBoardPanel
                    board="arena"
                    myExtra={<TierBadge tier={TIERS[tierIndex(TIERS, data.rating)]!} index={tierIndex(TIERS, data.rating)} size="sm" />}
                  />
                </section>
                {pvpOpen && (
                  <section aria-labelledby="arena-board-pvp" className="flex flex-col gap-4">
                    <h2 id="arena-board-pvp" className="ui-title-on-wood text-title">Đấu người</h2>
                    <RankRewardsPanel mode="pvp" />
                    <SeasonBoardPanel board="pvp" />
                  </section>
                )}
              </>
            ),
          },
        ]}
      >
        {pvpOpen && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Cách đấu">
            <ChoiceChip selected={mode === "ghost"} size="md" disabled={pvpBusy} onClick={() => setMode("ghost")}>
              Đấu bóng ma
            </ChoiceChip>
            <ChoiceChip selected={mode === "pvp"} size="md" onClick={() => setMode("pvp")}>
              Đấu người
            </ChoiceChip>
          </div>
        )}
        {pvpOpen && mode === "pvp" ? <PvpPanel onBusyChange={setPvpBusy} /> : (
          <>

      {profile && (
        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle
            description="Đinh Bộ Lĩnh và hai tướng bạn chọn ra trận đánh bóng ma. Đội phòng thủ là bản chụp riêng, đổi ở khung Đội phòng thủ."
            action={<span className="text-sm text-on-wood-soft">Lực chiến <strong className="text-title-on-wood">{attackPower || "–"}</strong></span>}
          >
            Đội ra trận
          </SectionTitle>
          <ul className="grid gap-2 sm:grid-cols-3">
            {[MAIN_ID, lineup[0], lineup[1]].map((id, slot) => {
              const c = id && id !== MAIN_ID ? companionById(id) : null;
              return (
                <li key={slot} className="ui-frame-inset flex min-w-0 items-center gap-2 p-2">
                  {id ? (
                    <>
                      <Portrait
                        id={id}
                        element={c?.element ?? profile.element}
                        profession={c?.profession ?? profile.profession}
                        className="size-10 shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-caption">
                        <p className="truncate text-sm font-semibold text-on-wood">{c?.name ?? "Đinh Bộ Lĩnh"}</p>
                        <p className="text-on-wood-soft">
                          {slot === 0 ? "Thủ lĩnh · " : ""}
                          {ELEMENT_NAME[c?.element ?? profile.element]} · {PROFESSION_NAME[c?.profession ?? profile.profession]} · cấp {progressOf(profile, id).level}
                        </p>
                      </div>
                      {slot > 0 && (
                        <button
                          type="button"
                          aria-label={`Bỏ ${c?.name ?? id} khỏi đội ra trận`}
                          onClick={() => choosePicks(lineup.filter((x) => x !== id))}
                          className="grid size-8 shrink-0 place-items-center rounded text-on-wood-soft hover:bg-black/30 hover:text-on-wood pointer-coarse:size-11"
                        >
                          ×
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="flex h-10 items-center text-caption text-on-wood-soft">Ô trống · chọn tướng bên dưới</p>
                  )}
                </li>
              );
            })}
          </ul>
          <details className="group" open={lineup.length < 2 || undefined}>
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-frame-gold">
              <span aria-hidden className="transition group-open:rotate-90">›</span>
              Đổi tướng ra trận ({owned.length} tướng)
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => choosePicks(profile.team.filter((id) => owned.includes(id)).slice(0, 2))}>
                  Lấy theo Doanh Trại
                </Button>
                <Button variant="secondary" size="sm" disabled={heroes.length < 2} onClick={() => choosePicks(heroes.slice(0, 2).map((h) => h.id))}>
                  Hai tướng cấp cao nhất
                </Button>
              </div>
              <HeroGrid
                label="Tướng ra trận"
                items={heroes.map((h) => ({ ...h, blocked: lineup.length >= 2 && !lineup.includes(h.id) ? "Bỏ bớt một tướng để đổi" : null }))}
                selected={null}
                isSelected={(id) => lineup.includes(id)}
                onSelect={(id) => choosePicks(lineup.includes(id) ? lineup.filter((x) => x !== id) : [...lineup, id].slice(0, 2))}
              />
            </div>
          </details>
        </OrnateFrame>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1">
          <OrnateFrame className="grid grid-cols-3 gap-2 text-center">
            <Stat
              label="Đánh"
              value={`${data.wins ?? 0} thắng · ${data.losses ?? 0} thua`}
            />
            <Stat
              label="Bị đánh"
              value={`${data.defenseWins ?? 0} giữ · ${data.defenseLosses ?? 0} mất`}
            />
            <Stat label="Thưởng thắng" value={`+${ARENA_WIN_GOLD} vàng`} />
          </OrnateFrame>

          <OrnateFrame className="flex flex-col gap-2">
            <SectionTitle
              description="Người khác đánh với bản chụp đội này. Nâng cấp hay đổi đội ở Doanh Trại xong thì bấm cập nhật."
              action={
                data.defense ? (
                  <span className="text-caption text-on-wood-soft">Lực chiến {data.defense.power}</span>
                ) : undefined
              }
            >
              Đội phòng thủ
            </SectionTitle>
            {data.defense && <Members list={data.defense.members} />}
            {notice && (
              <Alert tone="success" className="p-3 text-sm">
                {notice}
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                type="button"
                disabled={busy !== null}
                onClick={() => void command("defend")}
                className="min-h-11"
              >
                {busy === "defend" ? "Đang lưu…" : "Cập nhật theo đội hiện tại"}
              </Button>
              <SceneLink scene="PROFILE" className={buttonVariants({ variant: "secondary", className: "min-h-11" })}>
                Doanh Trại
              </SceneLink>
            </div>
          </OrnateFrame>
        </div>

        <OrnateFrame level="raised" className="order-1 flex min-w-0 flex-col gap-3 self-start lg:order-2">
          <SectionTitle
            description="Bạn ra trận với Đội ra trận ở trên. Đối thủ được bày theo điểm và lực chiến gần đội 3vs3 ở Doanh Trại; nhãn mạnh yếu so với đội ra trận. Điểm càng cao, thắng càng được nhiều điểm. Trang bị cộng tối đa 30% công và máu gốc theo cấp."
            action={
              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={busy !== null}
                onClick={() => void command("refresh")}
              >
                {busy === "refresh" ? "Đang tìm…" : "Đổi đối thủ"}
              </Button>
            }
          >
            Chọn đối thủ
          </SectionTitle>
          {message && (
            <Alert tone="error" className="p-3 text-sm">
              {message}
            </Alert>
          )}
          {left <= 0 && (
            <Alert tone="warning" className="p-3 text-sm">
              Hôm nay đã hết lượt. Lượt mới lúc 0 giờ.
            </Alert>
          )}
          <div className="grid gap-3 md:grid-cols-3">
            {offers.map((o, i) => (
              <div
                key={`${o.name}-${i}`}
                className="ui-frame-inset flex min-w-0 flex-col gap-2 p-3"
              >
                <div>
                  <p className="truncate text-base font-bold text-on-wood" title={o.name}>{o.name}</p>
                  <p className="text-caption text-on-wood-soft">
                    {o.rating} điểm · lực chiến {o.power}
                    {o.bot && " · bóng ma luyện tập"}
                  </p>
                  {myPower > 0 && <PowerTag mine={myPower} theirs={o.power} />}
                </div>
                <Members list={o.members} />
                <Button
                  type="button"
                  disabled={busy !== null || left <= 0 || lineup.length < 2}
                  onClick={() => void attack(i)}
                  className="mt-auto min-h-11"
                >
                  {busy === `attack${i}` ? "Đang vào trận…" : "Đánh"}
                </Button>
              </div>
            ))}
          </div>
        </OrnateFrame>
      </div>
          </>
        )}
      </ModeGuideTabs>
    </ModeScreen>
  );
}

/** So lực chiến đối thủ với đội mình: chênh dưới 10% là ngang sức. */
function PowerTag({ mine, theirs }: { mine: number; theirs: number }) {
  const ratio = theirs / mine;
  const [text, tone] =
    ratio > 1.25 ? ["Mạnh hơn nhiều", "bg-danger/25 text-danger"]
    : ratio > 1.1 ? ["Mạnh hơn", "bg-danger/15 text-danger"]
    : ratio < 0.8 ? ["Yếu hơn nhiều", "bg-jade/25 text-jade"]
    : ratio < 0.9 ? ["Yếu hơn", "bg-jade/15 text-jade"]
    : ["Ngang sức", "bg-frame-gold/20 text-frame-gold"];
  return <span className={`self-start rounded px-2 py-0.5 text-caption font-bold ${tone}`}>{text}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-frame-inset p-2">
      <p className="text-caption tracking-wide text-on-wood-soft uppercase">{label}</p>
      <p className="text-caption font-bold text-on-wood tabular-nums">{value}</p>
    </div>
  );
}
