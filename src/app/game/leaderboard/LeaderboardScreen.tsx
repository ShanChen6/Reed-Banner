"use client";

import { Pagination } from "@/components/ui/Pagination";

import { Button, ChoiceChip, Input, Tabs } from "@/components/ui";
import { ModeScreen, OrnateFrame } from "@/components/game-ui";
import type { ReactNode } from "react";

// Bảng xếp hạng: Trấn Ải (số đợt), Quần Hùng (điểm đấu trường), Thiên Mệnh (tầng, theo chu kỳ) và Tầm Tướng Ký Hạng
// tuần (điểm tướng đề cử, khi cờ Hạng bật). Bình Loạn là chế độ
// offline nên không có bảng.
// Điểm do server ghi sau mỗi lần cộng thưởng.

import { useEffect, useState } from "react";
import {
  describeScore,
  type BoardId,
} from "@/core";
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
  id: "survival" | "arena" | "destiny" | "tamTuongKy";
  label: string;
}[] = [
  { id: "survival", label: "Trấn Ải" },
  { id: "arena", label: "Quần Hùng" },
  { id: "destiny", label: "Thiên Mệnh" },
  { id: "tamTuongKy", label: "Tầm Tướng Ký" },
];

interface TtkBoardResponse {
  readonly week?: string;
  readonly top?: readonly { readonly rank: number; readonly name: string; readonly mine: boolean; readonly points: number; readonly unitsSpent: number }[];
  readonly mine?: { readonly rank: number; readonly points: number; readonly unitsSpent: number } | null;
  readonly error?: string;
}

const NOTE: Record<(typeof TABS)[number]["id"], string> = {
  survival: "Số đợt nhiều nhất đã vượt qua.",
  arena:
    "Điểm đấu trường bóng ma: thắng cộng, thua trừ, nhiều hơn khi gặp đối thủ mạnh hơn.",
  destiny: "Tầng clear cao hơn; hòa thì tổng lượt ít hơn, sau đó người hoàn thành sớm hơn.",
  tamTuongKy: "Tuần đổi vào thứ Hai 0 giờ: điểm tướng đề cử ghép ra trong tuần (lịch sử 300, đặc biệt 200); bằng điểm thì ai tiêu ít nguyên tố hơn đứng trên, rồi ai đạt trước. Hạng cuối tuần nhận vàng và bó nguyên tố.",
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

export default function LeaderboardScreen({ destinyEnabled = true, tamTuongKyRanked = false }: { destinyEnabled?: boolean; tamTuongKyRanked?: boolean }) {
  const { params } = useScene();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(() =>
    params.get("board") === "destiny" && destinyEnabled ? "destiny" : params.get("board") === "tamTuongKy" && tamTuongKyRanked ? "tamTuongKy" : "survival",
  );
  const [ttk, setTtk] = useState<TtkBoardResponse | null>(null);
  const [data, setData] = useState<BoardResponse | null>(null);
  const [destiny, setDestiny] = useState<DestinyBoardResponse | null>(null);
  // Mặc định xem bảng mùa tuần này; "Mọi thời đại" là bảng cộng dồn cũ.
  const [scope, setScope] = useState<"season" | "all">("season");
  const [cycle, setCycle] = useState("");
  const [cursor, setCursor] = useState("0");
  // Bình Loạn là chế độ offline theo tuyến lịch sử, không có bảng xếp hạng (Shan, 01/11/2026).
  const board: BoardId = tab === "destiny" || tab === "tamTuongKy" ? "survival" : tab;

  useEffect(() => {
    if (tab === "tamTuongKy") {
      let live = true;
      void fetch("/api/tam-tuong-ky/board?week=current", { cache: "no-store" })
        .then((r) => r.json() as Promise<TtkBoardResponse>)
        .catch((): TtkBoardResponse => ({ error: "network" }))
        .then((value) => live && setTtk(value));
      return () => { live = false; };
    }
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

  const tabs = TABS.filter((t) => (t.id !== "destiny" || destinyEnabled) && (t.id !== "tamTuongKy" || tamTuongKyRanked));

  return (
    <ModeScreen label="Bảng xếp hạng">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Tabs label="Chế độ" items={tabs.map((t) => ({ value: t.id, label: t.label }))} value={tab} onChange={setTab} fullWidth />

        {tab === "tamTuongKy" ? (
          <TtkBoard data={ttk} />
        ) : tab === "destiny" ? (
          <OrnateFrame className="flex flex-col gap-3">
            <label className="flex flex-wrap items-center gap-2 text-sm">Chu kỳ đã qua
              <Input type="date" className="w-auto" value={cycle || destiny?.cycle?.cycleId || ""} onChange={(event) => { setCycle(event.target.value); setCursor("0"); }} />
              {cycle && <Button variant="secondary" size="sm" onClick={() => { setCycle(""); setCursor("0"); }}>Chu kỳ hiện tại</Button>}
            </label>
            <BoardNote>{NOTE.destiny}</BoardNote>
            {!destiny?.entries ? (
              <BoardEmpty>{destiny?.error ? "Chu kỳ hoặc truy vấn không hợp lệ." : "Đang tải…"}</BoardEmpty>
            ) : destiny.entries.length === 0 ? (
              <BoardEmpty>Chưa có thành tích trong chu kỳ này.</BoardEmpty>
            ) : (
              <RankList>
                {destiny.entries.map((entry) => (
                  <RankRow key={entry.rank} rank={entry.rank} name={entry.name} mine={entry.mine}
                    score={`Tầng ${entry.clearedFloor} · ${entry.totalTurns} lượt`} />
                ))}
              </RankList>
            )}
            {destiny?.mine && !destiny.entries?.some((entry) => entry.mine) && (
              <MyRank>Hạng của bạn: {destiny.mine.rank} · tầng {destiny.mine.clearedFloor} · {destiny.mine.totalTurns} lượt</MyRank>
            )}
            <div className="flex justify-end border-t border-frame-line-soft pt-3">
              <Pagination
                hasPrevious={cursor !== "0"}
                hasNext={Boolean(destiny?.nextCursor)}
                onPrevious={() => setCursor(String(Math.max(0, Number(cursor) - 20)))}
                onNext={() => destiny?.nextCursor && setCursor(destiny.nextCursor)}
              />
            </div>
          </OrnateFrame>
        ) : (
          <OrnateFrame className="flex flex-col gap-3">
            <div role="group" aria-label="Phạm vi bảng" className="flex flex-wrap gap-2">
              {(["season", "all"] as const).map((s) => (
                <ChoiceChip key={s} selected={scope === s} onClick={() => setScope(s)}>
                  {s === "season" ? "Mùa tuần này" : "Mọi thời đại"}
                </ChoiceChip>
              ))}
            </div>
            <BoardNote>{season ? `${SEASON_NOTE[tab as "survival" | "arena"]}${shown?.season ? ` (mùa bắt đầu ${shown.season})` : ""}` : NOTE[tab]}</BoardNote>
            {!shown ? (
              <BoardEmpty>{data?.error ? "Không tải được bảng xếp hạng." : "Đang tải…"}</BoardEmpty>
            ) : shown.top!.length === 0 ? (
              <BoardEmpty>Chưa có ai trên bảng này.</BoardEmpty>
            ) : (
              <RankList>
                {shown.top!.map((r) => (
                  <RankRow key={r.rank} rank={r.rank} name={r.name} mine={r.mine} score={scoreText(board, r.score, season)} />
                ))}
              </RankList>
            )}
            {shown?.mine && !shown.top!.some((r) => r.mine) && (
              <MyRank>Hạng của bạn: {shown.mine.rank} · {scoreText(board, shown.mine.score, season)}</MyRank>
            )}
          </OrnateFrame>
        )}
      </div>
    </ModeScreen>
  );
}

function BoardNote({ children }: { children: ReactNode }) {
  return <p className="text-caption text-on-wood-soft">{children}</p>;
}
function BoardEmpty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-on-wood-soft">{children}</p>;
}
function RankList({ children }: { children: ReactNode }) {
  return <ol className="flex flex-col gap-1 text-sm">{children}</ol>;
}
function MyRank({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-title-on-wood">{children}</p>;
}

/** Một dòng bảng: hạng 1–3 vàng đậm, dòng của mình nền giấy dó. */
function RankRow({ rank, name, mine, score }: { rank: number; name: string; mine?: boolean; score: ReactNode }) {
  return (
    <li className={`flex items-center gap-2 rounded-control border px-2.5 py-2 ${mine ? "ui-choice is-selected font-semibold" : "border-frame-line-soft bg-wood-inset"}`}>
      <span className={`w-7 text-right tabular-nums ${rank <= 3 ? "font-black" : ""} ${mine ? "" : rank <= 3 ? "text-frame-gold" : "text-on-wood-soft"}`}>{rank}</span>
      <span className="min-w-0 flex-1 truncate">
        {name}
        {mine && " (bạn)"}
      </span>
      <span className={`text-caption tabular-nums ${mine ? "" : "text-on-wood-soft"}`}>{score}</span>
    </li>
  );
}

/** Bảng tuần Tầm Tướng Ký: chỉ có bảng tuần này (không có “mọi thời đại”). */
export function TtkBoard({ data }: { data: TtkBoardResponse | null }) {
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <BoardNote>{NOTE.tamTuongKy}{data?.week ? ` (tuần bắt đầu ${data.week})` : ""}</BoardNote>
      {!data?.top ? (
        <BoardEmpty>{data?.error ? "Không tải được bảng xếp hạng." : "Đang tải…"}</BoardEmpty>
      ) : data.top.length === 0 ? (
        <BoardEmpty>Tuần này chưa có ai ghép ra tướng đề cử.</BoardEmpty>
      ) : (
        <RankList>
          {data.top.map((r) => (
            <RankRow key={r.rank} rank={r.rank} name={r.name} mine={r.mine} score={`${r.points} điểm · tiêu ${r.unitsSpent}`} />
          ))}
        </RankList>
      )}
      {data?.mine && !data.top?.some((r) => r.mine) && (
        <MyRank>
          Hạng của bạn: {data.mine.rank} · {data.mine.points} điểm · tiêu {data.mine.unitsSpent}
        </MyRank>
      )}
    </OrnateFrame>
  );
}
