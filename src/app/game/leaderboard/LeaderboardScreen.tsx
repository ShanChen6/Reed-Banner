"use client";

import { Pagination } from "@/components/ui/Pagination";

import { Card, CardBody, CardFooter, Input, Button } from "@/components/ui";

// Bảng xếp hạng: Trấn Ải (số đợt), Quần Hùng (điểm đấu trường) và Thiên Mệnh (tầng, theo chu kỳ). Bình Loạn là chế độ
// offline nên không có bảng.
// Điểm do server ghi sau mỗi lần cộng thưởng.

import { useEffect, useState } from "react";
import {
  describeScore,
  type BoardId,
} from "@/core";
import { SceneLink } from "../SceneContext";
import { useScene } from "../SceneContext";

interface BoardResponse {
  readonly board?: BoardId;
  /** Có khi là bảng mùa theo tuần (khóa thứ Hai đầu tuần). */
  readonly season?: string;
  readonly top?: readonly {
    readonly rank: number;
    readonly name: string;
    readonly mine: boolean;
    readonly score: number;
  }[];
  readonly mine?: { readonly rank: number; readonly score: number } | null;
  readonly error?: string;
}

interface DestinyBoardResponse {
  readonly cycle?: { readonly cycleId: string; readonly startAt: number; readonly endAt: number };
  readonly entries?: readonly {
    readonly rank: number;
    readonly name: string;
    readonly mine: boolean;
    readonly clearedFloor: number;
    readonly totalTurns: number;
    readonly completedAt: number;
  }[];
  readonly mine?: { readonly rank: number; readonly clearedFloor: number; readonly totalTurns: number } | null;
  readonly nextCursor?: string | null;
  readonly error?: string;
}


const TABS: readonly {
  id: "survival" | "arena" | "destiny";
  label: string;
}[] = [
  { id: "survival", label: "Trấn Ải" },
  { id: "arena", label: "Quần Hùng" },
  { id: "destiny", label: "Thiên Mệnh" },
];

const NOTE: Record<(typeof TABS)[number]["id"], string> = {
  survival: "Số đợt nhiều nhất đã vượt qua.",
  arena:
    "Điểm đấu trường bóng ma: thắng cộng, thua trừ, nhiều hơn khi gặp đối thủ mạnh hơn.",
  destiny: "Tầng clear cao hơn; hòa thì tổng lượt ít hơn, sau đó người hoàn thành sớm hơn.",
};

/** Ghi chú riêng của bảng mùa theo tuần (đổi vào thứ Hai 0 giờ, điểm mùa bắt đầu lại từ 0). */
const SEASON_NOTE: Record<"survival" | "arena", string> = {
  survival: "Mùa theo tuần, đổi vào thứ Hai 0 giờ: số đợt cao nhất đã vượt trong một lượt chơi của tuần. Hạng cuối mùa nhận vàng.",
  arena:
    "Mùa theo tuần, đổi vào thứ Hai 0 giờ: tổng điểm đấu trường nhận được từ các trận bạn đi đánh trong tuần (chỉ người có tổng dương mới có tên). Điểm gốc không bị reset. Hạng cuối mùa nhận vàng.",
};

function scoreText(board: BoardId, score: number, season: boolean): string {
  if (season) return board === "arena" ? `+${score} điểm` : `${score} đợt`;
  const d = describeScore(board, score);
  if (board === "arena") return `${d.main} điểm`;
  return `${d.main} đợt`;
}

export default function LeaderboardScreen({ destinyEnabled = true }: { destinyEnabled?: boolean }) {
  const { params } = useScene();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(() => params.get("board") === "destiny" && destinyEnabled ? "destiny" : "survival");
  const [data, setData] = useState<BoardResponse | null>(null);
  const [destiny, setDestiny] = useState<DestinyBoardResponse | null>(null);
  // Mặc định xem bảng mùa tuần này; "Mọi thời đại" là bảng cộng dồn cũ.
  const [scope, setScope] = useState<"season" | "all">("season");
  const [cycle, setCycle] = useState("");
  const [cursor, setCursor] = useState("0");
  // Bình Loạn là chế độ offline theo tuyến lịch sử, không có bảng xếp hạng (Shan, 01/11/2026).
  const board: BoardId = tab === "destiny" ? "survival" : tab;

  useEffect(() => {
    if (tab === "destiny") {
      let live = true;
      const query = new URLSearchParams({ cursor, limit: "20" });
      if (cycle) query.set("cycle", cycle);
      void fetch(`/api/destiny/leaderboard?${query}`, { cache: "no-store" })
        .then((r) => r.json() as Promise<DestinyBoardResponse>)
        .catch((): DestinyBoardResponse => ({ error: "network" }))
        .then((value) => live && setDestiny(value));
      return () => { live = false; };
    }
    let live = true;
    void fetch(`/api/leaderboard?board=${encodeURIComponent(board)}${scope === "season" ? "&season=current" : ""}`, {
      cache: "no-store",
    })
      .then((r) => r.json() as Promise<BoardResponse>)
      .catch((): BoardResponse => ({ error: "network" }))
      .then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, [board, tab, cycle, cursor, scope]);

  const shown = data?.board === board && Boolean(data.season) === (scope === "season") ? data : null;
  const season = scope === "season";

  return (
    <main className="ui-screen ui-screen--cool">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-black text-amber-100">Bảng xếp hạng</h1>
          <div className="flex gap-2 text-sm">
            <SceneLink
              scene="PLAYING"
              className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
            >
              Chơi
            </SceneLink>
            <SceneLink
              scene="DAILY"
              className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
            >
              Nhật Lệnh
            </SceneLink>
          </div>
        </div>

        <div role="tablist" className="mb-3 flex flex-wrap gap-1.5">
          {TABS.filter((t) => t.id !== "destiny" || destinyEnabled).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${tab === t.id ? "bg-amber-500 text-stone-950" : "bg-white/10 hover:bg-white/15"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "destiny" ? (
          <Card padding="none">
            <CardBody className="flex flex-col gap-3">
            <label className="flex flex-wrap items-center gap-2 text-sm">Cycle lịch sử
              <Input type="date" value={cycle || destiny?.cycle?.cycleId || ""} onChange={(event) => { setCycle(event.target.value); setCursor("0"); }}  />
              {cycle && <Button variant="secondary" type="button" onClick={() => { setCycle(""); setCursor("0"); }} >Cycle hiện tại</Button>}
            </label>
            <p className="text-xs text-muted">{NOTE.destiny}</p>
            {!destiny?.entries ? <p className="py-6 text-center text-sm text-muted">{destiny?.error ? "Cycle hoặc truy vấn không hợp lệ." : "Đang tải…"}</p> : destiny.entries.length === 0 ? <p className="py-6 text-center text-sm text-muted">Chưa có thành tích trong cycle này.</p> : <ol className="flex flex-col gap-1 text-sm">{destiny.entries.map((entry) => <li key={entry.rank} className={`flex items-center gap-2 rounded px-2 py-1.5 ${entry.mine ? "bg-amber-500/20 font-semibold" : "bg-black/20"}`}><span className="w-7 text-right tabular-nums text-amber-300">{entry.rank}</span><span className="min-w-0 flex-1 truncate">{entry.name}{entry.mine && " (bạn)"}</span><span className="text-xs tabular-nums text-foreground-secondary">Tầng {entry.clearedFloor} · {entry.totalTurns} lượt</span></li>)}</ol>}
            {destiny?.mine && !destiny.entries?.some((entry) => entry.mine) && <p className="text-sm text-amber-200">Hạng của bạn: {destiny.mine.rank} · tầng {destiny.mine.clearedFloor} · {destiny.mine.totalTurns} lượt</p>}
            </CardBody>
            <CardFooter className="justify-end">
            <Pagination
              hasPrevious={cursor !== "0"}
              hasNext={Boolean(destiny?.nextCursor)}
              onPrevious={() => setCursor(String(Math.max(0, Number(cursor) - 20)))}
              onNext={() => destiny?.nextCursor && setCursor(destiny.nextCursor)}
            />
            </CardFooter>
          </Card>
        ) : <Card className="flex flex-col gap-2">
          <div role="group" aria-label="Phạm vi bảng" className="flex gap-1.5 text-sm">
            {(["season", "all"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={scope === s}
                onClick={() => setScope(s)}
                className={`rounded-full px-3 py-1 font-semibold ${scope === s ? "bg-amber-500 text-stone-950" : "bg-white/10 hover:bg-white/15"}`}
              >
                {s === "season" ? "Mùa tuần này" : "Mọi thời đại"}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">{season ? `${SEASON_NOTE[tab as "survival" | "arena"]}${shown?.season ? ` (mùa bắt đầu ${shown.season})` : ""}` : NOTE[tab]}</p>
          {!shown ? (
            <p className="py-6 text-center text-sm text-muted">
              {data?.error ? "Không tải được bảng xếp hạng." : "Đang tải…"}
            </p>
          ) : shown.top!.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Chưa có ai trên bảng này.
            </p>
          ) : (
            <ol className="flex flex-col gap-1 text-sm">
              {shown.top!.map((r) => (
                <li
                  key={r.rank}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 ${r.mine ? "bg-amber-500/20 font-semibold" : "bg-black/20"}`}
                >
                  <span
                    className={`w-7 text-right tabular-nums ${r.rank <= 3 ? "font-black text-amber-300" : "text-muted"}`}
                  >
                    {r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.name}
                    {r.mine && " (bạn)"}
                  </span>
                  <span className="text-xs text-foreground-secondary tabular-nums">
                    {scoreText(board, r.score, season)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {shown?.mine && !shown.top!.some((r) => r.mine) && (
            <p className="text-sm text-amber-200">
              Hạng của bạn: {shown.mine.rank} ·{" "}
              {scoreText(board, shown.mine.score, season)}
            </p>
          )}
        </Card>}
      </div>
    </main>
  );
}
