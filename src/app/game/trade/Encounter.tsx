"use client";

// Gặp nạn trên đường (GDD mục 5): nộp mãi lộ mất 10% hàng, hoặc đánh một trận ghép ô rất dễ (bàn và luật của giao tranh
// Sử Lộ, Thành lực thấp). Trận chạy ở trình duyệt, xong gửi cả chuỗi nước lên để server dựng lại từ cùng hạt giống.

import { useEffect, useState } from "react";
import { destroyCells, STANDARD_WEIGHTS, swap as boardSwap, type Pos } from "@/core/board";
import { createRng } from "@/core/rng";
import { SK_COUNSEL_NEED, SK_ENERGY_MAX, skAct, type SkAction, type SkState } from "@/core/su-lo";
import { DEFEAT_RATIO, ENCOUNTER_NAME, TOLL_RATIO, encounterBoard, type EncounterKind } from "@/core/trade";
import { Button } from "@/components/ui";
import { TileArt } from "../art/tiles";
import { destroyFrames, swapFrames, type Frame } from "../battle/animation";
import { frameCue } from "../battle/sounds";
import { useAudio } from "../audio/AudioProvider";

const FOE: Record<EncounterKind, { readonly title: string; readonly text: string; readonly hp: string }> = {
  pirates: { title: "Giặc sông chặn thuyền", text: "Thuyền giặc áp mạn, đòi mãi lộ.", hp: "Sức giặc" },
  storm: { title: "Sóng dữ ngoài cửa biển", text: "Gió nổi, sóng đánh vào mạn thuyền.", hp: "Sức sóng" },
  bandits: { title: "Thảo khấu chặn đường", text: "Toán cướp núi chặn xe hàng giữa đèo.", hp: "Sức cướp" },
};

export function EncounterPanel({ kind, seed, busy, onResolve }: { kind: EncounterKind; seed: number; busy: boolean; onResolve: (choice: "toll" | "fight", actions: SkAction[]) => void }) {
  const [fighting, setFighting] = useState(false);
  const foe = FOE[kind];
  if (!fighting)
    return (
      <section className="ui-frame flex flex-col gap-3 p-4" aria-label={ENCOUNTER_NAME[kind]}>
        <h2 className="ui-title-on-wood text-lg font-bold">{foe.title}</h2>
        <p className="text-sm">{foe.text} Nộp mãi lộ thì mất {Math.round(TOLL_RATIO * 100)}% giá trị hàng. Đánh thắng thì giữ trọn hàng, thua mất {Math.round(DEFEAT_RATIO * 100)}% (kỳ trân mất trước). Không bao giờ mất đoàn.</p>
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => setFighting(true)}>
            Đánh
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => onResolve("toll", [])}>
            Nộp mãi lộ
          </Button>
        </div>
      </section>
    );
  return <Fight kind={kind} seed={seed} busy={busy} onDone={(actions) => onResolve("fight", actions)} />;
}

function Fight({ kind, seed, busy, onDone }: { kind: EncounterKind; seed: number; busy: boolean; onDone: (actions: SkAction[]) => void }) {
  const [sk, setSk] = useState<SkState>(() => encounterBoard({ seed }));
  const [actions, setActions] = useState<SkAction[]>([]);
  const [sel, setSel] = useState<Pos | null>(null);
  const [stratagem, setStratagem] = useState(false);
  const [anim, setAnim] = useState<{ readonly frames: readonly Frame[]; readonly i: number; readonly id: number } | null>(null);
  const frame = anim?.frames[anim.i];
  const { play: playSound } = useAudio();
  useEffect(() => {
    if (!anim || !frame) return;
    const id = window.setTimeout(() => setAnim((a) => (a && a.id === anim.id ? (a.i + 1 < a.frames.length ? { ...a, i: a.i + 1 } : null) : a)), frame.ms);
    return () => window.clearTimeout(id);
  }, [anim, frame]);
  useEffect(() => {
    const c = frameCue(frame?.sound);
    if (c) playSound(c.id, { rate: c.rate });
  }, [frame, playSound]);
  const play = (frames: readonly Frame[]) => {
    if (frames.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnim((a) => ({ frames, i: 0, id: (a?.id ?? 0) + 1 }));
  };
  const act = (a: SkAction): boolean => {
    const r = skAct(sk, a);
    if (!r.ok) return false;
    setSk(r.state);
    setActions((xs) => [...xs, a]);
    return true;
  };
  const over = sk.phase !== "play";
  const locked = over || anim !== null || busy;
  const board = frame?.board ?? sk.board;

  const press = (p: Pos) => {
    if (locked || sk.counselPending) return;
    if (stratagem) {
      const before = sk.board;
      const cells = Array.from({ length: before.cols }, (_, col) => ({ row: p.row, col }));
      const r = destroyCells(before, cells, createRng(sk.rng), STANDARD_WEIGHTS);
      if (act({ type: "stratagem", row: p.row })) {
        setStratagem(false);
        play(destroyFrames(before, r.steps));
      }
      return;
    }
    if (!sel) return setSel(p);
    if (sel.row === p.row && sel.col === p.col) return setSel(null);
    if (Math.abs(sel.row - p.row) + Math.abs(sel.col - p.col) !== 1) return setSel(p);
    const before = sk.board;
    const r = boardSwap(before, sel, p, createRng(sk.rng), STANDARD_WEIGHTS);
    act({ type: "swap", from: sel, to: p });
    play(swapFrames(before, sel, p, r.valid ? r.steps : null));
    setSel(null);
  };

  return (
    <section className="flex w-full flex-col items-center gap-3" aria-label={ENCOUNTER_NAME[kind]}>
      <div className="ui-frame flex w-full flex-col gap-2 p-3">
        <h2 className="ui-title-on-wood font-bold">{FOE[kind].title}</h2>
        <span className="text-sm font-semibold">
          {FOE[kind].hp} {sk.hp}/{sk.maxHp}, còn {sk.movesLeft} nước{sk.lastDamage > 0 ? `, vừa gây ${sk.lastDamage}` : ""}
        </span>
        <div className="h-3 overflow-hidden rounded-lg bg-wood-inset">
          <div className="h-full bg-lacquer transition-[width]" style={{ width: `${(sk.hp / sk.maxHp) * 100}%` }} />
        </div>
        <p className="text-caption text-on-wood-soft">
          Đổi hai ô kề nhau để ghép từ 3 ô. Ô kiếm đánh mạnh nhất. Mưu {sk.counsel}/{SK_COUNSEL_NEED}, Kế sách {sk.energy}/{SK_ENERGY_MAX}.
        </p>
      </div>
      <div className="ui-frame-inset w-fit p-1 sm:p-2">
        <div role="grid" aria-label="Bàn đánh nạn" className="sl-sk-grid grid" style={{ "--sk-cols": board.cols, "--sk-rows": board.rows } as React.CSSProperties}>
          {board.cells.map((t, i) => {
            const p = { row: Math.floor(i / board.cols), col: i % board.cols };
            const cellAnim = frame?.anims[i];
            const picked = sel?.row === p.row && sel.col === p.col;
            return (
              <div role="gridcell" key={cellAnim ? `${anim!.id}-${anim!.i}-${i}` : i} className="contents">
                <button
                  type="button"
                  aria-label={`Hàng ${p.row + 1}, cột ${p.col + 1}${t ? `: ${t.kind}` : ""}`}
                  aria-pressed={picked}
                  disabled={locked}
                  onClick={() => press(p)}
                  className={`relative aspect-square p-0.5 disabled:cursor-default ${picked ? "rounded-lg ring-2 ring-frame-gold-hi" : ""}`}
                >
                  {t && (
                    <span
                      className={`absolute inset-0.5 flex ${cellAnim ? `tile-anim tile-anim-${cellAnim.kind}` : ""}`}
                      style={cellAnim ? ({ "--dx": cellAnim.dx, "--dy": cellAnim.dy, animationDuration: `${frame!.ms}ms` } as React.CSSProperties) : undefined}
                    >
                      <TileArt kind={t.kind} special={t.special} className="size-full" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {sk.counselPending && !over && (
          <Button disabled={anim !== null || busy} onClick={() => act({ type: "counsel", correct: true })}>
            Quân sư hiến kế
          </Button>
        )}
        {!over && (
          <Button variant={stratagem ? "primary" : "secondary"} disabled={locked || sk.energy < SK_ENERGY_MAX} aria-pressed={stratagem} onClick={() => setStratagem((v) => !v)}>
            {stratagem ? "Chọn hàng để phá" : "Kế sách: phá một hàng"}
          </Button>
        )}
        {over ? (
          <Button disabled={busy || anim !== null} onClick={() => onDone(actions)}>
            {sk.phase === "won" ? "Thắng, đi tiếp" : "Thua, chịu mất hàng"}
          </Button>
        ) : (
          <Button variant="secondary" disabled={busy} onClick={() => onDone(actions)}>
            Bỏ chạy (mất {Math.round(DEFEAT_RATIO * 100)}% hàng)
          </Button>
        )}
      </div>
    </section>
  );
}
