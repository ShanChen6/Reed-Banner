"use client";

import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, buttonVariants } from "@/components/ui";

// Thử thách hằng ngày: đề chung hôm nay (đội cho sẵn, đối thủ, sân nhà), lượt của mình và bảng xếp hạng.
// Mỗi người một lượt mỗi ngày; server giữ chỗ lượt trước khi tạo trận.

import { useEffect, useState } from "react";
import {
  DAILY_GOLD,
  DAILY_LEVEL,
  warlordEncounter,
  type DailyScore,
  type FighterConfig,
} from "@/core";
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

function scoreText(s: DailyScore): string {
  return s.won
    ? `Thắng · ${s.turns} lượt · còn ${Math.round(s.permille / 10)}% máu`
    : `Thua · gây ${Math.round(s.permille / 10)}% sát thương`;
}

function Fighters({ list }: { list: readonly FighterConfig[] }) {
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
            <p className="truncate text-sm font-semibold text-on-wood">{f.name}</p>
            <p className="flex items-center gap-1 text-on-wood-soft">
              <ElementIcon element={f.element} className="size-3.5" />
              {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]} ·{" "}
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

  useEffect(() => {
    void fetchDaily().then(setData);
  }, []);

  if (!data?.setup) {
    return (
      <ModeScreen label="Nhật Lệnh">
        <p className="py-24 text-center text-on-wood-soft">
          {data
            ? "Không tải được thử thách hôm nay, thử tải lại trang."
            : "Đang tải…"}
        </p>
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
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
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
    <ModeScreen wide label="Nhật Lệnh">
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

      <RankRewardsPanel mode="daily" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <OrnateFrame level="raised" className="flex min-w-0 flex-col gap-3">
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
              <Fighters list={setup.team} />
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
                Bạn đã đánh hôm nay: {scoreText(mine.result)}
                {mine.rank !== null && ` · hạng ${mine.rank}`}
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

        <OrnateFrame className="flex min-w-0 flex-col gap-2 self-start">
          <SectionTitle>Bảng hôm nay</SectionTitle>
          {top.length === 0 ? (
            <p className="text-sm text-on-wood-soft">Chưa ai đánh xong hôm nay.</p>
          ) : (
            <ol className="flex flex-col gap-1.5 text-sm">
              {top.map((r) => (
                <li
                  key={r.rank}
                  className={`flex items-center gap-2 rounded-control border px-2.5 py-2 ${r.mine ? "ui-choice is-selected font-semibold" : "border-frame-line-soft bg-wood-inset text-on-wood"}`}
                >
                  <span className={`w-6 text-right tabular-nums ${r.rank <= 3 ? "font-black" : ""} ${r.mine ? "" : r.rank <= 3 ? "text-frame-gold" : "text-on-wood-soft"}`}>
                    {r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.name}
                    {r.mine && " (bạn)"}
                  </span>
                  <span className={`text-caption ${r.mine ? "" : "text-on-wood-soft"}`}>
                    {scoreText(r.score)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {mine?.rank != null && !top.some((r) => r.mine) && (
            <p className="text-sm text-frame-gold">Hạng của bạn: {mine.rank}</p>
          )}
        </OrnateFrame>
      </div>
    </ModeScreen>
  );
}
