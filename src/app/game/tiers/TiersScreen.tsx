"use client";

// Ban Thưởng: gom dải bậc của mọi chế độ xếp hạng vào một trang (Quần Hùng, Đấu người, Trấn Ải, Trận Đồ, Nhật Lệnh,
// Tháp Thiên Mệnh, Tầm Tướng Ký). Đạt mốc thì nhận vàng và một món, mỗi bậc một lần, như trong từng chế độ. Dữ liệu
// từ GET /api/tiers, nhận qua POST /api/tiers. Luật ở docs/02-game-modes/README.md mục 5.9.

import { useEffect, useState } from "react";
import type { ArenaTier, GearItem } from "@/core";
import { Alert, buttonVariants } from "@/components/ui";
import { ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { fetchProfile } from "../battle/online";
import { TierLadder } from "../leaderboard/RankBoard";
import { ladderOf, tierClaimNote, tierErrorNote, tierRewards } from "../arena/tiers";
import { SceneLink } from "../SceneContext";
import { SCENES, type Scene } from "../scene";

interface LadderView {
  readonly id: string;
  readonly mode: string;
  readonly scene: string;
  readonly measure: string;
  readonly unit: string;
  readonly score: number;
  readonly tiers: readonly ArenaTier[];
  readonly claimed: readonly string[];
  readonly locked?: boolean;
}

type ClaimBody = { ladders?: LadderView[]; claimed?: { tier: string; gold: number; item: GearItem | null; soldFor: number }; error?: string };

const asScene = (s: string): Scene | null => ((SCENES as readonly string[]).includes(s) ? (s as Scene) : null);

/** Số bậc đã đạt mà chưa nhận. */
export const readyCount = (l: Pick<LadderView, "score" | "tiers" | "claimed" | "locked">): number =>
  l.locked ? 0 : l.tiers.filter((t) => l.score >= t.min && !l.claimed.includes(t.id)).length;

export default function TiersScreen() {
  const [ladders, setLadders] = useState<LadderView[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/tiers", { cache: "no-store" })
      .then((r) => r.json() as Promise<ClaimBody>)
      .then((b) => live && (b.ladders ? setLadders(b.ladders) : setFailed(true)))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const claim = async (l: LadderView, tier: string) => {
    setBusy(l.id);
    setNote(null);
    try {
      const res = await fetch("/api/tiers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: l.id, tier }) });
      const body = (await res.json()) as ClaimBody;
      if (body.ladders) setLadders(body.ladders);
      setNote({ id: l.id, ok: !!body.claimed, text: body.claimed ? tierClaimNote(body.claimed) : tierErrorNote(body.error, l.unit === "điểm" ? "điểm hạng" : `số ${l.unit}`) });
      // Cập nhật số vàng trên thanh đầu trang.
      if (body.claimed) void fetchProfile();
    } catch {
      setNote({ id: l.id, ok: false, text: "Tin báo đứt quãng, chưa liên lạc được máy chủ. Xin thử lại sau giây lát." });
    }
    setBusy(null);
  };

  if (!ladders)
    return (
      <ModeScreen label="Ban Thưởng">
        <p className="py-24 text-center text-on-wood-soft">{failed ? "Chưa mở được Ban Thưởng. Xin tải lại trang." : "Đang tải…"}</p>
      </ModeScreen>
    );

  const ready = ladders.reduce((n, l) => n + readyCount(l), 0);
  return (
    <ModeScreen label="Ban Thưởng">
      <OrnateFrame>
        <SectionTitle description="Mỗi chế độ xếp hạng có sáu bậc. Lần đầu đạt mốc nhận vàng và một món trang bị hệ của Đinh Bộ Lĩnh; mỗi bậc nhận một lần, nhận rồi nút khóa.">
          Ban Thưởng
        </SectionTitle>
        <p role="status" className="text-sm text-on-wood">
          {ready > 0 ? (
            <>
              <span className="font-bold text-jade">{ready}</span> bậc đang chờ nhận.
            </>
          ) : (
            "Chưa có bậc mới để nhận."
          )}
        </p>
      </OrnateFrame>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ladders.map((l) => {
          const scene = asScene(l.scene);
          const n = readyCount(l);
          return (
            <OrnateFrame key={l.id} className="flex min-w-0 flex-col gap-2">
              <section aria-labelledby={`tier-${l.id}`} className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id={`tier-${l.id}`} className="ui-title-on-wood text-title">
                    {l.mode}
                    {n > 0 && <span className="ml-2 rounded-full bg-jade px-2 py-0.5 align-middle text-caption font-bold text-white">{n} chờ nhận</span>}
                  </h2>
                  {scene && (
                    <SceneLink scene={scene} className={buttonVariants({ variant: "outline", size: "sm", className: "min-h-11 px-4" })}>
                      Vào chế độ
                    </SceneLink>
                  )}
                </div>
                <p className="text-caption text-on-wood-soft">
                  {l.measure} Hiện: <span className="font-bold tabular-nums text-title-on-wood">{l.score}</span> {l.unit}.
                </p>
                {l.locked && <p className="text-sm text-warning">Vào {l.mode} một lần để mở dải bậc này.</p>}
                <TierLadder
                  tiers={ladderOf(l.tiers)}
                  score={l.score}
                  unit={l.unit}
                  label={`Bậc ${l.mode}`}
                  rewards={tierRewards((id) => l.claimed.includes(id), l.tiers)}
                  onClaim={(i) => void claim(l, l.tiers[i]!.id)}
                  busy={busy !== null}
                  locked={l.locked === true}
                />
                {note?.id === l.id && <Alert tone={note.ok ? "success" : "error"}>{note.text}</Alert>}
              </section>
            </OrnateFrame>
          );
        })}
      </div>
    </ModeScreen>
  );
}
