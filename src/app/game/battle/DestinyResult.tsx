"use client";
// Lớp phủ kết thúc trận Tháp Thiên Mệnh: tầng vừa vượt (hoặc gục), tiến độ cả tháp, máu ba tướng mang sang tầng sau,
// đá mốc vừa nhận và một nút đi tiếp duy nhất. Không có kinh nghiệm, vàng hay đồ rơi nên không ghi các dòng đó.

import type { BattleState } from "@/core";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui";
import { Portrait } from "../art/portraits";
import { SceneLink } from "../SceneContext";
import { PLAYER, type Outcome } from "./demoSetup";

const DEFAULT_FLOORS = 20;

export function DestinyResult({ floor, outcome, state }: {
  /** Tầng của trận (từ trận online), dùng khi máy chủ chưa trả kết quả. */
  floor: number;
  outcome: Outcome | null;
  state: BattleState;
}) {
  const result = outcome?.destiny ?? null;
  const won = state.winner === PLAYER;
  const floorCount = result?.floorCount ?? DEFAULT_FLOORS;
  const completed = result?.completed === true;
  const cleared = won ? floor : floor - 1;
  const title = completed ? "Chinh phục Tháp Thiên Mệnh!" : won ? `Vượt tầng ${floor}` : `Gục ở tầng ${floor}`;
  const team = state.sides[PLAYER].fighters;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto rounded-lg bg-wood-lo/90 p-3 text-on-wood">
      <section aria-labelledby="destiny-result-title"
        className={cn(
          "ui-frame flex w-full max-w-md flex-col gap-3 p-4 text-center sm:p-5",
          won ? "border-frame-gold/70" : "border-danger/50",
        )}>
        <div>
          <p className="text-kicker text-frame-gold">Tháp Thiên Mệnh · Tầng {floor}/{floorCount}</p>
          <h2 id="destiny-result-title" className={cn("mt-1 font-serif text-2xl font-bold", won ? "text-title-on-wood" : "text-danger")}>
            {title}
          </h2>
          <p className="mt-1 text-sm text-on-wood-soft">
            {!result ? "Đang chốt kết quả với máy chủ…"
              : completed ? "Lượt leo hoàn thành. Thành tích đã ghi vào bảng công trạng tuần."
              : won ? "Máu, năng lượng và Nộ của cả đội giữ nguyên sang tầng sau."
              : "Lượt leo kết thúc tại đây. Kỷ lục chu kỳ và đá đã nhận vẫn giữ."}
          </p>
        </div>

        <ol className="flex gap-0.5" aria-label={`Đã vượt ${Math.max(0, cleared)}/${floorCount} tầng`}>
          {Array.from({ length: floorCount }, (_, i) => i + 1).map((n) => (
            <li key={n} aria-hidden className={cn(
              "h-1.5 flex-1 rounded-full",
              n <= cleared ? "bg-jade" : n === floor ? "bg-danger" : "bg-black/40",
            )} />
          ))}
        </ol>

        {result && (result.turns !== undefined || (result.stones ?? 0) > 0) && (
          <dl className="flex justify-center gap-2 text-sm">
            {result.turns !== undefined && (
              <div className="ui-frame-inset min-w-24 px-3 py-1.5">
                <dt className="text-caption text-on-wood-soft">Số lượt</dt>
                <dd className="font-bold tabular-nums">{result.turns}</dd>
              </div>
            )}
            {(result.stones ?? 0) > 0 && (
              <div className="ui-frame-inset min-w-24 px-3 py-1.5">
                <dt className="text-caption text-on-wood-soft">Đá Cường Hóa</dt>
                <dd className="font-bold text-frame-gold tabular-nums">+{result.stones}</dd>
              </div>
            )}
          </dl>
        )}

        <ul className="grid grid-cols-3 gap-2" aria-label="Đội ra trận sau trận">
          {team.map((f) => {
            const ratio = Math.max(0, Math.min(1, f.hp / Math.max(1, f.maxHp)));
            const down = f.hp <= 0;
            return (
              <li key={f.id} className="ui-frame-inset flex min-w-0 flex-col items-center gap-1 p-2">
                <Portrait id={f.id} element={f.element} profession={f.profession}
                  className={cn("size-11 shrink-0", down && "opacity-50 grayscale")} />
                <span className="w-full truncate text-caption font-semibold">{f.name}</span>
                <span className="h-1.5 w-full overflow-hidden rounded bg-black/40" role="img"
                  aria-label={down ? `${f.name} đã gục` : `${f.name} còn ${Math.round(ratio * 100)}% máu`}>
                  <span className={cn("block h-full", ratio < 0.3 ? "bg-danger" : "bg-jade")} style={{ width: `${ratio * 100}%` }} />
                </span>
                <span className={cn("text-caption tabular-nums", down ? "font-semibold text-danger" : "text-on-wood-soft")}>
                  {down ? "Đã gục" : `${Math.round(ratio * 100)}% máu`}
                </span>
              </li>
            );
          })}
        </ul>

        <SceneLink scene="DESTINY" className={buttonVariants({ className: "min-h-11 self-center" })}>
          {result?.won && !completed ? `Chọn thưởng tầng ${floor}` : "Về Tháp Thiên Mệnh"}
        </SceneLink>
        {result?.won && !completed && (
          <p className="-mt-1 text-caption text-on-wood-soft">Chọn một trong ba: hồi phục cho tướng bị thương hoặc nhận Phúc.</p>
        )}
      </section>
    </div>
  );
}
