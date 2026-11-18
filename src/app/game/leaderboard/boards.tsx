"use client";

// Bảng xếp hạng mùa hiện tại dùng ngay trong màn từng chế độ (V2-06): Trấn Ải, Quần Hùng (mùa tuần), Tháp Thiên Mệnh
// (chu kỳ hiện tại). Không dẫn sang trang Công Trạng. Bảng Trận Đồ và Tầm Tướng Ký nằm trong màn của chúng.

import { OrnateFrame, SectionTitle } from "@/components/game-ui";
import { buttonVariants } from "@/components/ui";
import { Children, useEffect, useState, type ReactNode } from "react";
import { RankBoard } from "./RankBoard";

export interface SeasonBoardResponse {
  readonly board?: string;
  readonly season?: string;
  readonly top?: readonly { readonly rank: number; readonly name: string; readonly mine: boolean; readonly score: number }[];
  readonly mine?: { readonly rank: number; readonly score: number } | null;
  readonly error?: string;
}

export interface DestinyBoardResponse {
  readonly cycle?: { readonly cycleId: string; readonly startAt: number; readonly endAt: number };
  readonly entries?: readonly {
    readonly rank: number;
    readonly name: string;
    readonly mine: boolean;
    readonly clearedFloor: number;
    readonly totalTurns: number;
  }[];
  readonly mine?: { readonly rank: number; readonly clearedFloor: number; readonly totalTurns: number } | null;
  readonly error?: string;
}

export interface TtkBoardResponse {
  readonly week?: string;
  readonly top?: readonly { readonly rank: number; readonly name: string; readonly mine: boolean; readonly points: number; readonly unitsSpent: number }[];
  readonly mine?: { readonly rank: number; readonly points: number; readonly unitsSpent: number } | null;
  readonly error?: string;
}

const TTK_NOTE =
  "Tuần đổi vào thứ Hai 0 giờ: điểm tướng đề cử ghép ra trong tuần (lịch sử 300, đặc biệt 200); bằng điểm thì ai tiêu ít nguyên tố hơn đứng trên, rồi ai đạt trước. Hạng cuối tuần nhận vàng và bó nguyên tố.";

const SEASON_NOTE = {
  survival: "Mùa theo tuần, đổi vào thứ Hai 0 giờ: số đợt cao nhất đã vượt trong một lượt chơi của tuần. Hạng cuối mùa nhận vàng.",
  pvp: "Mùa theo tuần, đổi vào thứ Hai 0 giờ: tổng điểm hạng Đấu người bạn nhận được từ các trận được tính trong tuần (chỉ người có tổng dương mới có tên). Hạng cuối mùa nhận vàng.",
  arena:
    "Mùa theo tuần, đổi vào thứ Hai 0 giờ: tổng điểm Quần Hùng nhận được từ các trận bạn đi đánh trong tuần (chỉ người có tổng dương mới có tên). Hạng cuối mùa nhận vàng.",
} as const;

export function BoardNote({ children }: { children: ReactNode }) {
  return <p className="text-caption text-on-wood-soft">{children}</p>;
}
export function BoardEmpty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-on-wood-soft">{children}</p>;
}
/** Bảng xếp hạng: hiện `initial` dòng đầu, còn lại mở bằng nút (bảng mùa có tới 50 dòng, dài trên điện thoại). */
export function RankList({ children, initial = 10 }: { children: ReactNode; initial?: number }) {
  const items = Children.toArray(children);
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, initial);
  return (
    <>
      <ol className="flex flex-col gap-1 text-sm">{shown}</ol>
      {items.length > initial && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll((v) => !v)}
          className={buttonVariants({ variant: "secondary", className: "mt-2 w-full sm:w-auto" })}
        >
          {all ? "Thu gọn" : `Xem thêm ${items.length - initial} dòng`}
        </button>
      )}
    </>
  );
}
/** Tải JSON một lần cho `url`; `url` null thì không tải (kết quả luôn null). */
function useJson<T extends { error?: string }>(url: string | null): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    if (url === null) return;
    let live = true;
    void fetch(url, { cache: "no-store" })
      .then((r) => r.json() as Promise<T>)
      .catch((): T => ({ error: "network" }) as T)
      .then((v) => live && setData(v));
    return () => {
      live = false;
    };
  }, [url]);
  return data;
}

const seasonScore = (board: "survival" | "arena" | "pvp", score: number) => (board === "survival" ? `${score} đợt` : `+${score} điểm`);

/** Bảng mùa tuần hiện tại của Trấn Ải hoặc Quần Hùng; `myExtra` gắn vào thanh hạng của mình (ví dụ bậc hạng). */
export function SeasonBoardPanel({ board, myExtra }: { board: "survival" | "arena" | "pvp"; myExtra?: ReactNode }) {
  const data = useJson<SeasonBoardResponse>(board === "pvp" ? "/api/pvp/board" : `/api/leaderboard?board=${board}&season=current`);
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description={`${SEASON_NOTE[board]}${data?.season ? ` (mùa bắt đầu ${data.season})` : ""}`}>Công trạng mùa này</SectionTitle>
      {!data?.top ? (
        <BoardEmpty>{data?.error ? "Chưa mở được bảng công trạng. Xin tải lại trang." : "Đang tải…"}</BoardEmpty>
      ) : data.top.length === 0 ? (
        <BoardEmpty>Chưa có ai trên bảng mùa này.</BoardEmpty>
      ) : (
        <RankBoard
          entries={data.top.slice(0, 20).map((r) => ({ rank: r.rank, name: r.name, mine: r.mine, score: seasonScore(board, r.score) }))}
          mine={data.mine ? { rank: data.mine.rank, score: seasonScore(board, data.mine.score) } : { rank: null, score: null }}
          myExtra={myExtra}
        />
      )}
    </OrnateFrame>
  );
}

/** Bảng chu kỳ hiện tại của Tháp Thiên Mệnh. */
export function DestinyBoardPanel() {
  const data = useJson<DestinyBoardResponse>("/api/destiny/leaderboard?cursor=0&limit=20");
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description="Xếp theo tầng cao nhất đã vượt. Bằng tầng thì ai dùng ít lượt đánh hơn đứng trên, rồi tới ai xong sớm hơn.">Công trạng chu kỳ này</SectionTitle>
      {!data?.entries ? (
        <BoardEmpty>{data?.error ? "Chưa mở được bảng công trạng. Xin tải lại trang." : "Đang tải…"}</BoardEmpty>
      ) : data.entries.length === 0 ? (
        <BoardEmpty>Chưa có thành tích trong chu kỳ này.</BoardEmpty>
      ) : (
        <RankBoard
          entries={data.entries.map((e) => ({ rank: e.rank, name: e.name, mine: e.mine, score: `Tầng ${e.clearedFloor}`, detail: `${e.totalTurns} lượt đánh` }))}
          mine={data.mine ? { rank: data.mine.rank, score: `Tầng ${data.mine.clearedFloor}` } : { rank: null, score: null }}
        />
      )}
    </OrnateFrame>
  );
}

/** Bảng tuần Tầm Tướng Ký: chỉ có bảng tuần này. */
export function TtkBoard({ data }: { data: TtkBoardResponse | null }) {
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <BoardNote>{TTK_NOTE}{data?.week ? ` (tuần bắt đầu ${data.week})` : ""}</BoardNote>
      {!data?.top ? (
        <BoardEmpty>{data?.error ? "Chưa mở được bảng công trạng. Xin tải lại trang." : "Đang tải…"}</BoardEmpty>
      ) : data.top.length === 0 ? (
        <BoardEmpty>Tuần này chưa có ai ghép ra tướng đề cử.</BoardEmpty>
      ) : (
        <RankBoard
          entries={data.top.map((r) => ({ rank: r.rank, name: r.name, mine: r.mine, score: `${r.points} điểm`, detail: `tiêu ${r.unitsSpent} nguyên tố` }))}
          mine={data.mine ? { rank: data.mine.rank, score: `${data.mine.points} điểm` } : { rank: null, score: null }}
        />
      )}
    </OrnateFrame>
  );
}

export { useJson };
