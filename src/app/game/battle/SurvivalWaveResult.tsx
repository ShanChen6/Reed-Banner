"use client";

// Trấn Ải: hạ hết một đợt thì hiện thẻ kết quả gọn trên bàn cờ rồi chuyển sang màn chuẩn bị đợt kế ở màn Trấn Ải
// (đổi người, hồi sinh, nghề/hệ Đinh Bộ Lĩnh). Lượt chơi nằm trên máy chủ nên rời trận lúc này không mất gì.

import { useEffect } from "react";
import type { BattleState, SurvivalView } from "@/core";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Portrait } from "../art/portraits";
import { useAudio } from "../audio/AudioProvider";
import { SceneLink } from "../SceneContext";
import { PLAYER } from "./demoSetup";

export function SurvivalWaveResult({ survival, state }: { survival: SurvivalView; state: BattleState }) {
  const { play } = useAudio();
  // Báo trước đợt kế: một tiếng cảnh báo khi vừa hạ hết đợt.
  useEffect(() => play("survival.warn"), [play]);
  const next = survival.next;
  const team = state.sides[PLAYER].fighters;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto rounded-lg bg-wood-lo/90 p-3 text-on-wood">
      <section aria-labelledby="survival-wave-title" className="ui-frame flex w-full max-w-md flex-col gap-3 border-frame-gold/70 p-4 text-center sm:p-5">
        <div>
          <p className="text-kicker text-frame-gold">Trấn Ải – đã vượt {survival.cleared} đợt</p>
          <h2 id="survival-wave-title" className="mt-1 font-serif text-2xl font-bold text-title-on-wood">
            Hạ hết đợt {survival.wave}
          </h2>
          {next && (
            <p className="mt-1 text-sm text-on-wood-soft">
              Đợt {next.wave}: {next.foes.length} đối thủ cấp {next.level}
              {next.boss && <strong className="ml-1 text-danger">– đợt trùm</strong>}
            </p>
          )}
        </div>
        <ul className="grid grid-cols-3 gap-2" aria-label="Đội ra trận sau đợt">
          {team.map((f) => {
            const ratio = Math.max(0, Math.min(1, f.hp / Math.max(1, f.maxHp)));
            const down = f.hp <= 0;
            return (
              <li key={f.id} className="ui-frame-inset flex min-w-0 flex-col items-center gap-1 p-2">
                <Portrait id={f.id} element={f.element} profession={f.profession} className={cn("size-11 shrink-0", down && "opacity-50 grayscale")} />
                <span className="w-full truncate text-caption font-semibold">{f.name}</span>
                <span className="h-1.5 w-full overflow-hidden rounded-lg bg-black/40" role="img"
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
        <SceneLink scene="SURVIVAL" className={buttonVariants({ className: "min-h-11 self-center" })}>
          Chuẩn bị đợt {next?.wave ?? survival.wave + 1}
        </SceneLink>
        <p className="-mt-1 text-caption text-on-wood-soft">
          Hồi máu, tiếp lương, đổi người và hồi sinh ở màn chuẩn bị. Tiến độ đã lưu, có thể quay lại sau.
        </p>
      </section>
    </div>
  );
}
