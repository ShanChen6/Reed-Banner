"use client";

// Công Trạng (V2-06): thành tích theo mùa của người chơi, gom mọi chế độ có xếp hạng. Phần "Mùa này" cho biết hạng hiện
// tại của mình; phần "Các mùa trước" liệt kê các kỳ đã nhận thưởng (hạng, vàng). Bảng xếp hạng đầy đủ của mùa hiện tại
// nằm trong màn từng chế độ và không dẫn sang trang này.

import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle, SkeletonText } from "@/components/game-ui";
import { useEffect, useState } from "react";
import { fetchOverview, type Overview } from "../formation/rankedClient";
import { BoardEmpty, BoardLoading, RankList, useJson, type DestinyBoardResponse, type SeasonBoardResponse, type TtkBoardResponse } from "./boards";
import type { HonorItem } from "@/server/honors";
import { RANKED_LEVELS } from "@/core/binh-phap";

interface Standing {
  readonly title: string;
  /** undefined: đang tải; null: chưa có tên trên bảng. */
  readonly text: string | null | undefined;
}

const levelName = (id: string) => (id === "thuong" ? "Thường" : id === "kho" ? "Khó" : id === "dai-tran" ? "Đại trận" : id);

const rankText = (rank: number, detail: string) => `Hạng ${rank}, ${detail}`;

function useStandings(destinyEnabled: boolean, tamTuongKyRanked: boolean, formationRanked: boolean, tradeEnabled: boolean): Standing[] {
  const survival = useJson<SeasonBoardResponse>("/api/leaderboard?board=survival&season=current");
  const arena = useJson<SeasonBoardResponse>("/api/leaderboard?board=arena&season=current");
  const trade = useJson<SeasonBoardResponse>(tradeEnabled ? "/api/trade?board=1" : null);
  const destiny = useJson<DestinyBoardResponse>(destinyEnabled ? "/api/destiny/leaderboard?cursor=0&limit=1" : null);
  const ttk = useJson<TtkBoardResponse>(tamTuongKyRanked ? "/api/tam-tuong-ky/board?week=current" : null);
  const [formation, setFormation] = useState<Overview | null>(null);
  useEffect(() => {
    void fetchOverview().then(setFormation);
  }, []);

  const out: Standing[] = [
    { title: "Trấn Ải – mùa tuần", text: survival === null ? undefined : survival.mine ? rankText(survival.mine.rank, `${survival.mine.score} đợt`) : null },
    { title: "Quần Hùng – mùa tuần", text: arena === null ? undefined : arena.mine ? rankText(arena.mine.rank, `+${arena.mine.score} điểm`) : null },
  ];
  if (destinyEnabled) out.push({ title: "Tháp Thiên Mệnh – chu kỳ", text: destiny === null ? undefined : destiny.mine ? rankText(destiny.mine.rank, `tầng ${destiny.mine.clearedFloor}`) : null });
  if (tradeEnabled) out.push({ title: "Hành Thương Ký – mùa tuần", text: trade === null ? undefined : trade.mine ? rankText(trade.mine.rank, `lãi ${trade.mine.score.toLocaleString("vi-VN")} kim tiền`) : null });
  if (tamTuongKyRanked) out.push({ title: "Tầm Tướng Ký – hạng tuần", text: ttk === null ? undefined : ttk.mine ? rankText(ttk.mine.rank, `${ttk.mine.points} điểm`) : null });
  if (formation === null && formationRanked) {
    // Đang tải: giữ chỗ cho các bậc Trận Đồ để lưới không cao thêm (và đẩy phần dưới) khi dữ liệu về.
    for (const l of RANKED_LEVELS) out.push({ title: `Trận Đồ – ${levelName(l.id)}`, text: undefined });
  } else if (formation?.enabled) {
    for (const l of formation.levels) {
      const won = l.mine?.status === "won" && l.mine.rank ? l.mine : null;
      out.push({ title: `Trận Đồ – ${levelName(l.level)}`, text: won ? rankText(won.rank!, `${won.score} điểm`) : null });
    }
  }
  return out;
}

const PERIOD_LABEL = (p: string) => p;

function HistoryRow({ h }: { h: HonorItem }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2 text-sm">
      <span className="min-w-0 basis-full font-semibold sm:basis-0 sm:flex-1">{h.title}</span>
      <span className="text-caption whitespace-nowrap text-on-wood-soft">kỳ {PERIOD_LABEL(h.period)}</span>
      <span className="whitespace-nowrap tabular-nums">hạng {h.rank}{h.participants ? `/${h.participants}` : ""}</span>
      <span className="ml-auto font-bold whitespace-nowrap text-frame-gold tabular-nums">+{h.gold} vàng</span>
    </li>
  );
}

export default function HonorsScreen({
  destinyEnabled = true,
  tamTuongKyRanked = false,
  formationRanked = false,
  tradeEnabled = false,
}: {
  destinyEnabled?: boolean;
  tamTuongKyRanked?: boolean;
  formationRanked?: boolean;
  tradeEnabled?: boolean;
}) {
  const standings = useStandings(destinyEnabled, tamTuongKyRanked, formationRanked, tradeEnabled);
  const honors = useJson<{ signedIn?: boolean; items?: HonorItem[]; error?: string }>("/api/honors");
  return (
    <ModeScreen card label="Công Trạng">
      <ModeBanner
        title="Công Trạng"
        kicker="Bảng vàng chiến công"
        description="Hạng của bạn ở mọi chế độ xếp hạng mùa này và các kỳ đã nhận thưởng hạng."
        stats={honors?.items ? [
          { label: "Kỳ đã nhận", value: honors.items.length },
          { label: "Vàng thưởng", value: honors.items.reduce((n, h) => n + h.gold, 0).toLocaleString("vi-VN") },
        ] : undefined}
      />
      <div className="flex w-full flex-col gap-4">
        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Hạng hiện tại của bạn ở từng chế độ có xếp hạng. Bảng đầy đủ xem ngay trong màn của chế độ đó.">Mùa này</SectionTitle>
          <ul className="grid gap-2 sm:grid-cols-2">
            {standings.map((s) => (
              <li key={s.title} className="rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2">
                <p className="text-caption text-on-wood-soft">{s.title}</p>
                <p className="font-semibold text-title-on-wood">
                  {s.text === undefined ? <><SkeletonText className="w-40" /><span className="sr-only">Đang tải…</span></> : (s.text ?? "Chưa có tên trên bảng")}
                </p>
              </li>
            ))}
          </ul>
        </OrnateFrame>

        <OrnateFrame className="flex flex-col gap-3">
          <SectionTitle description="Các kỳ đã khép mà bạn nhận thưởng hạng, mới nhất trước.">Các mùa trước</SectionTitle>
          {!honors?.items ? (
            honors?.error ? (
              <BoardEmpty>Chưa tải được Công Trạng. Xin tải lại trang.</BoardEmpty>
            ) : (
              /* Cao gần bằng dòng "Chưa có kỳ nào…" (trường hợp hay gặp nhất) để footer không nhích khi tải xong. */
              <BoardLoading rows={1} className="py-3.5" />
            )
          ) : honors.items.length === 0 ? (
            <BoardEmpty>Chưa có kỳ nào được nhận thưởng. Lên hạng ở một kỳ rồi nhận thưởng khi kỳ khép lại.</BoardEmpty>
          ) : (
            <RankList>
              {honors.items.map((h) => <HistoryRow key={`${h.source}-${h.period}`} h={h} />)}
            </RankList>
          )}
        </OrnateFrame>
      </div>
    </ModeScreen>
  );
}
