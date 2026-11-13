"use client";

import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, ChoiceChip, buttonVariants } from "@/components/ui";

// Quần Hùng: điểm và thành tích, đội phòng thủ (bản chụp đội 3vs3 đang chọn), 3 đối thủ đang bày.
// Đánh dùng đội 3vs3 đang chọn ở hồ sơ; đối thủ do AI điều khiển.

import { useEffect, useState } from "react";
import { ARENA_DIFFICULTY, ARENA_WIN_GOLD, type ArenaMember } from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  createOnline,
  fetchArena,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  type ArenaResponse,
} from "../battle/online";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { SeasonBoardPanel } from "../leaderboard/boards";
import { SceneLink, useScene } from "../SceneContext";
import { ModeGuideTabs } from "../ModeGuide";
import PvpPanel, { probePvp } from "./PvpPanel";

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

  /** Đấu người (PvP) chỉ hiện khi máy chủ bật cờ; đang có trận dở hoặc đang chờ ghép thì mở sẵn. */
  const [pvpOpen, setPvpOpen] = useState(false);
  const [mode, setMode] = useState<"ghost" | "pvp">("ghost");
  const [pvpBusy, setPvpBusy] = useState(false);

  useEffect(() => {
    void fetchArena().then(setData);
    void probePvp().then((p) => {
      setPvpOpen(p.available);
      if (p.available && p.busy) setMode("pvp");
    });
  }, []);

  if (data?.rating === undefined) {
    return (
      <ModeScreen label="Quần Hùng">
        <p className="py-24 text-center text-on-wood-soft">
          {data ? "Chưa mở được Quần Hùng. Xin tải lại trang." : "Đang tải…"}
        </p>
      </ModeScreen>
    );
  }

  const left = data.attacksLeft ?? 0;
  const offers = data.offers ?? [];

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
      companions: [],
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
    <ModeScreen wide label="Quần Hùng">
      <ModeBanner
        title="Quần Hùng"
        kicker="Đấu người"
        art="/art/home/arena.webp"
        description={`Đánh với đội phòng thủ của người chơi khác, do máy điều khiển ở mức ${DIFFICULTY_NAME[ARENA_DIFFICULTY]}. Thắng cộng điểm, thua trừ điểm.`}
        stats={[
          { label: "Điểm", value: data.rating },
          { label: "Hạng", value: data.rank != null ? `#${data.rank}` : "–" },
          { label: "Lượt hôm nay", value: `${left}/${data.attacksPerDay ?? 0}` },
        ]}
      />
      <ModeGuideTabs scene="ARENA">
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

      <RankRewardsPanel mode="arena" />
      <SeasonBoardPanel board="arena" />

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
            description="Bạn ra trận với đội 3vs3 đang chọn ở Doanh Trại. Đối thủ có điểm càng cao, thắng càng được nhiều điểm."
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
                </div>
                <Members list={o.members} />
                <Button
                  type="button"
                  disabled={busy !== null || left <= 0}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-frame-inset p-2">
      <p className="text-caption tracking-wide text-on-wood-soft uppercase">{label}</p>
      <p className="text-caption font-bold text-on-wood tabular-nums">{value}</p>
    </div>
  );
}
