"use client";

// Công Trạng (V2-06): thành tích theo mùa của người chơi, gom mọi chế độ có xếp hạng. Phần "Mùa này" cho biết hạng hiện
// tại của mình; phần "Các mùa trước" liệt kê các kỳ đã nhận thưởng (hạng, vàng). Bảng xếp hạng đầy đủ của mùa hiện tại
// nằm trong màn từng chế độ và không dẫn sang trang này.

import { ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { useEffect, useState } from "react";
import { fetchOverview, type Overview } from "../formation/rankedClient";
import { BoardEmpty, useJson, type DestinyBoardResponse, type SeasonBoardResponse, type TtkBoardResponse } from "./boards";
import type { HonorItem } from "@/server/honors";

interface Standing {
  readonly title: string;
  /** undefined: đang tải; null: chưa có tên trên bảng. */
  readonly text: string | null | undefined;
}

const rankText = (rank: number, detail: string) => `Hạng ${rank} · ${detail}`;

function useStandings(destinyEnabled: boolean, tamTuongKyRanked: boolean): Standing[] {
  const survival = useJson<SeasonBoardResponse>("/api/leaderboard?board=survival&season=current");
  const arena = useJson<SeasonBoardResponse>("/api/leaderboard?board=arena&season=current");
  const destiny = useJson<DestinyBoardResponse>(destinyEnabled ? "/api/destiny/leaderboard?cursor=0&limit=1" : null);
  const ttk = useJson<TtkBoardResponse>(tamTuongKyRanked ? "/api/tam-tuong-ky/board?week=current" : null);
  const [formation, setFormation] = useState<Overview | null>(null);
  useEffect(() => {
    void fetchOverview().then(setFormation);
  }, []);

  const out: Standing[] = [
    { title: "Trấn Ải · mùa tuần", text: survival === null ? undefined : survival.mine ? rankText(survival.mine.rank, `${survival.mine.score} đợt`) : null },
    { title: "Quần Hùng · mùa tuần", text: arena === null ? undefined : arena.mine ? rankText(arena.mine.rank, `+${arena.mine.score} điểm`) : null },
  ];
  if (destinyEnabled) out.push({ title: "Tháp Thiên Mệnh · chu kỳ", text: destiny === null ? undefined : destiny.mine ? rankText(destiny.mine.rank, `tầng ${destiny.mine.clearedFloor}`) : null });
  if (tamTuongKyRanked) out.push({ title: "Tầm Tướng Ký · hạng tuần", text: ttk === null ? undefined : ttk.mine ? rankText(ttk.mine.rank, `${ttk.mine.points} điểm`) : null });
  if (formation?.enabled) {
    for (const l of formation.levels) {
      const won = l.mine?.status === "won" && l.mine.rank ? l.mine : null;
      out.push({ title: `Trận Đồ · ${l.level === "thuong" ? "Thường" : l.level === "kho" ? "Khó" : l.level === "dai-tran" ? "Đại trận" : l.level}`, text: won ? rankText(won.rank!, `${won.score} điểm`) : null });
    }
  }
  return out;
}

const PERIOD_LABEL = (p: string) => p;

function HistoryRow({ h }: { h: HonorItem }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2 text-sm">
      <span className="min-w-0 flex-1 font-semibold">{h.title}</span>
      <span className="text-caption text-on-wood-soft">kỳ {PERIOD_LABEL(h.period)}</span>
      <span className="tabular-nums">hạng {h.rank}{h.participants ? `/${h.participants}` : ""}</span>
      <span className="font-bold text-frame-gold tabular-nums">+{h.gold} vàng</span>
    </li>
  );
}

export default function HonorsScreen({ destinyEnabled = true, tamTuongKyRanked = false }: { destinyEnabled?: boolean; tamTuongKyRanked?: boolean }) {
  const standings = useStandings(destinyEnabled, tamTuongKyRanked);
  const honors = useJson<{ signedIn?: boolean; items?: HonorItem[]; error?: string }>("/api/honors");
  return (
    <ModeScreen label="Công Trạng">
      <div className="flex w-full flex-col gap-4">
        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Hạng hiện tại của bạn ở từng chế độ có xếp hạng. Bảng đầy đủ xem ngay trong màn của chế độ đó.">Mùa này</SectionTitle>
          <ul className="grid gap-2 sm:grid-cols-2">
            {standings.map((s) => (
              <li key={s.title} className="rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2">
                <p className="text-caption text-on-wood-soft">{s.title}</p>
                <p className="font-semibold text-title-on-wood">{s.text === undefined ? "Đang tải…" : (s.text ?? "Chưa có tên trên bảng")}</p>
              </li>
            ))}
          </ul>
        </OrnateFrame>

        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Các kỳ đã khép mà bạn nhận thưởng hạng, mới nhất trước.">Các mùa trước</SectionTitle>
          {!honors?.items ? (
            <BoardEmpty>{honors?.error ? "Không tải được công trạng." : "Đang tải…"}</BoardEmpty>
          ) : honors.items.length === 0 ? (
            <BoardEmpty>Chưa có kỳ nào được nhận thưởng. Lên hạng ở một kỳ rồi nhận thưởng khi kỳ khép lại.</BoardEmpty>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {honors.items.map((h) => <HistoryRow key={`${h.source}-${h.period}`} h={h} />)}
            </ol>
          )}
        </OrnateFrame>
      </div>
    </ModeScreen>
  );
}
