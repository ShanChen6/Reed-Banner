"use client";

import { ModeBanner, ModeScreen, ModeSkeleton, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, buttonVariants } from "@/components/ui";

// Thử thách hằng ngày: đề chung hôm nay (đội cho sẵn, đối thủ, sân nhà), lượt của mình, bảng xếp hạng, điểm danh và nhiệm vụ ngày.
// Mỗi người một lượt mỗi ngày; server giữ chỗ lượt trước khi tạo trận.

import { useEffect, useState } from "react";
import {
  DAILY_GOLD,
  DAILY_LEVEL,
  warlordEncounter,
  type DailyScore,
  type FighterConfig,
} from "@/core";
import { CounterStar, type CounterFoe } from "../art/CounterStar";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  createOnline,
  fetchDaily,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  type DailyResponse,
} from "../battle/online";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { SceneLink, useScene } from "../SceneContext";
import { ModeGuideTabs } from "../ModeGuide";
import CheckInPanel from "../quests/CheckInPanel";
import DailyQuestsPanel from "../quests/DailyQuestsPanel";
import { RankBoard } from "../leaderboard/RankBoard";
import ModeTierPanel from "../leaderboard/ModeTierPanel";
import { useProfile } from "../profile/useProfile";
import { ColumnFill } from "../ColumnFill";

function scoreText(s: DailyScore): string {
  return s.won
    ? `Thắng, ${s.turns} lượt, còn ${Math.round(s.permille / 10)}% máu`
    : `Thua, gây ${Math.round(s.permille / 10)}% sát thương`;
}

function Fighters({ list, foes = [] }: { list: readonly FighterConfig[]; foes?: readonly CounterFoe[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {list.map((f) => (
        <li
          key={f.id}
          className="ui-frame-inset flex items-center gap-2 p-2"
        >
          <Portrait
            id={f.id}
            element={f.element}
            profession={f.profession}
            className="size-10 shrink-0"
          />
          <div className="min-w-0 text-caption">
            <p className="flex min-w-0 items-center gap-1 text-sm font-semibold text-on-wood">
              <span className="truncate">{f.name}</span>
              <CounterStar element={f.element} foes={foes} />
            </p>
            <p className="flex items-center gap-1 text-on-wood-soft">
              <ElementIcon element={f.element} className="size-3.5" />
              {ELEMENT_NAME[f.element]}, {PROFESSION_NAME[f.profession]},{" "}
              {f.maxHp} máu
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DailyScreen() {
  const { go } = useScene();
  const [data, setData] = useState<DailyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Hồ sơ cho điểm danh và nhiệm vụ ngày; nhận thưởng cập nhật cả hai khung.
  const quests = useProfile();
  const [now] = useState(() => Date.now());

  useEffect(() => {
    void fetchDaily().then(setData);
  }, []);

  if (!data?.setup) {
    return (
      <ModeScreen card label="Nhật Lệnh">
        {data ? (
          <p role="alert" className="py-24 text-center text-on-wood-soft">Chưa nhận được Nhật Lệnh hôm nay. Xin tải lại trang.</p>
        ) : (
          <ModeSkeleton label="Đang tải Nhật Lệnh…" />
        )}
      </ModeScreen>
    );
  }

  const { setup, mine, top = [] } = data;
  const warlord = warlordEncounter(setup.warlord);

  const play = async () => {
    if (mine && !mine.result) {
      try {
        window.localStorage.setItem(ONLINE_BATTLE_KEY, mine.matchId);
      } catch {
        // Bỏ qua: phân cảnh trận vẫn có nút Tiếp tục.
      }
      go("PLAYING", { resume: "1" });
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: "3v3",
      element: "moc",
      profession: "tuongSi",
      companions: [],
      difficulty: "hard",
      daily: true,
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
      // Không lưu được thì phân cảnh trận không tự tiếp tục.
    }
    go("PLAYING", { resume: "1" });
  };

  const day = data.day?.split("-").reverse().join("/");

  return (
    <ModeScreen card label="Nhật Lệnh">
      <ModeBanner
        title="Nhật Lệnh"
        kicker={day ? `Ngày ${day}` : "Mỗi ngày"}
        art="/art/home/daily.webp"
        description="Một đề chung cho mọi người, mỗi người đánh một lần. Đề mới lúc 0 giờ."
        stats={[
          { label: "Thắng", value: `${DAILY_GOLD.win} vàng` },
          { label: "Thua", value: `${DAILY_GOLD.loss} vàng` },
        ]}
      />
      <ModeGuideTabs
        scene="DAILY"
        extraTabs={[
          {
            value: "board",
            label: "Công trạng",
            content: (
              <>
                <ModeTierPanel mode="daily" />
                <RankRewardsPanel mode="daily" />
                <OrnateFrame className="flex min-w-0 flex-col gap-2">
                  <SectionTitle>Bảng hôm nay</SectionTitle>
                  {top.length === 0 ? (
                    <p className="text-sm text-on-wood-soft">Hôm nay chưa ai đánh xong. Chúa công hãy là người đầu tiên lưu tên.</p>
                  ) : (
                    <RankBoard
                      entries={top.map((r) => ({
                        rank: r.rank,
                        name: r.name,
                        mine: r.mine,
                        score: r.score.won ? `Thắng, ${r.score.turns} lượt` : "Thua",
                        detail: r.score.won ? `còn ${Math.round(r.score.permille / 10)}% máu` : `gây ${Math.round(r.score.permille / 10)}% sát thương`,
                      }))}
                      mine={mine?.result ? { rank: mine.rank ?? null, score: scoreText(mine.result) } : { rank: null, score: null }}
                    />
                  )}
                </OrnateFrame>
              </>
            ),
          },
        ]}
      >


      {quests.message && <Alert className="p-3 text-sm">{quests.message}</Alert>}
      {quests.profile && <CheckInPanel profile={quests.profile} now={now} busy={quests.busy} act={quests.act} />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <OrnateFrame className="flex min-w-0 flex-col gap-3">
          <SectionTitle>Đề hôm nay</SectionTitle>
          <p className="text-sm text-on-wood">
            Đội cho sẵn, cấp {DAILY_LEVEL}, không trang bị. Đối thủ đánh ở mức{" "}
            {DIFFICULTY_NAME[setup.difficulty]}
            {warlord
              ? `, trên sân nhà ${warlord.place} của ${warlord.foes[0]!.name}`
              : ""}
            . Bạn đi trước. Ai đi
            cùng nước sẽ gặp cùng ô rơi.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-frame-gold">
                Đội của bạn
              </h3>
              <Fighters list={setup.team} foes={setup.foes} />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-frame-gold">
                Đối thủ
              </h3>
              <Fighters list={setup.foes} />
            </div>
          </div>
          <p className="text-caption text-on-wood-soft">
            Xếp hạng: thắng đứng trên thua; cùng thắng thì ít lượt hơn đứng
            trên, rồi còn nhiều máu hơn. Thưởng {DAILY_GOLD.win} vàng khi thắng,{" "}
            {DAILY_GOLD.loss} vàng khi thua.
          </p>
          {message && (
            <Alert tone="error" className="p-3 text-sm">
              {message}
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {mine?.result ? (
              <Alert tone="success" className="p-3 text-sm font-semibold">
                Chúa công đã đánh hôm nay: {scoreText(mine.result)}
                {mine.rank !== null && `, hạng ${mine.rank}`}
              </Alert>
            ) : (
              <Button
                size="lg"
                type="button"
                disabled={busy}
                onClick={() => void play()}
                className="min-h-11"
              >
                {busy
                  ? "Đang vào trận…"
                  : mine
                    ? "Tiếp tục trận"
                    : "Đánh (1 lần)"}
              </Button>
            )}
            <SceneLink scene="SURVIVAL" className={buttonVariants({ variant: "secondary", className: "min-h-11" })}>
              Sang Trấn Ải
            </SceneLink>
          </div>
        </OrnateFrame>

        <div className="flex min-w-0 flex-col gap-4">
          {quests.profile && <DailyQuestsPanel profile={quests.profile} now={now} busy={quests.busy} act={quests.act} />}
          <ColumnFill mode="daily" />
        </div>
      </div>
      </ModeGuideTabs>
    </ModeScreen>
  );
}
