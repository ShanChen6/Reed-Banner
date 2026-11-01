"use client";

import { Card, Button } from "@/components/ui";

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
            <p className="flex items-center gap-1 text-foreground-secondary">
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
      <Shell>
        <p className="py-24 text-center text-foreground-secondary">
          {data
            ? "Không tải được thử thách hôm nay, thử tải lại trang."
            : "Đang tải…"}
        </p>
      </Shell>
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

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">
            Ngày {data.day?.split("-").reverse().join("/")}
          </p>
          <h1 className="text-2xl font-black text-amber-100">Nhật Lệnh</h1>
          <p className="text-sm text-muted">
            Một đề chung cho mọi người, mỗi người đánh một lần. Đề mới lúc 0
            giờ.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <SceneLink
            scene="PLAYING"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Chơi
          </SceneLink>
          <SceneLink
            scene="SURVIVAL"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Trấn Ải
          </SceneLink>
        </div>
      </div>

      <div className="mb-4">
        <RankRewardsPanel mode="daily" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="flex flex-col gap-3 shadow-card-inset">
          <h2 className="text-lg font-bold text-amber-100">Đề hôm nay</h2>
          <p className="text-sm text-foreground-secondary">
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
              <h3 className="mb-1 text-sm font-semibold text-amber-200">
                Đội của bạn
              </h3>
              <Fighters list={setup.team} />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-rose-300">
                Đối thủ
              </h3>
              <Fighters list={setup.foes} />
            </div>
          </div>
          <p className="text-xs text-muted">
            Xếp hạng: thắng đứng trên thua; cùng thắng thì ít lượt hơn đứng
            trên, rồi còn nhiều máu hơn. Thưởng {DAILY_GOLD.win} vàng khi thắng,{" "}
            {DAILY_GOLD.loss} vàng khi thua.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {mine?.result ? (
              <p className="font-semibold text-amber-200">
                Bạn đã đánh hôm nay: {scoreText(mine.result)}
                {mine.rank !== null && ` · hạng ${mine.rank}`}
              </p>
            ) : (
              <Button variant="ornate"
                type="button"
                disabled={busy}
                onClick={() => void play()}
                className="tracking-wider uppercase"
              >
                {busy
                  ? "Đang vào trận…"
                  : mine
                    ? "Tiếp tục trận"
                    : "Đánh (1 lần)"}
              </Button>
            )}
            {message && (
              <span className="text-sm text-rose-400">{message}</span>
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="font-bold text-amber-200">Bảng xếp hạng</h2>
          {top.length === 0 ? (
            <p className="text-sm text-muted">Chưa ai đánh xong hôm nay.</p>
          ) : (
            <ol className="flex flex-col gap-1 text-sm">
              {top.map((r) => (
                <li
                  key={r.rank}
                  className={`flex items-center gap-2 rounded px-2 py-1 ${r.mine ? "bg-amber-500/20 font-semibold" : "bg-black/20"}`}
                >
                  <span className="w-6 text-right tabular-nums text-amber-300">
                    {r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.name}
                    {r.mine && " (bạn)"}
                  </span>
                  <span className="text-xs text-foreground-secondary">
                    {scoreText(r.score)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {mine?.rank != null && !top.some((r) => r.mine) && (
            <p className="text-sm text-amber-200">Hạng của bạn: {mine.rank}</p>
          )}
        </Card>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="ui-screen ui-screen--cool">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
