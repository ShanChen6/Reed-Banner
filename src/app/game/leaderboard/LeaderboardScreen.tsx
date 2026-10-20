"use client";

// Bảng xếp hạng: chiến dịch (số màn, rồi tổng lượt ít nhất), từng màn (ít lượt nhất), leo tháp, sinh tồn, đấu trường.
// Điểm do server ghi sau mỗi lần cộng thưởng.

import { useEffect, useState } from "react";
import { CAMPAIGN, describeScore, type BoardId } from "@/core";
import { SceneLink } from "../SceneContext";

interface BoardResponse {
  readonly board?: BoardId;
  readonly top?: readonly {
    readonly rank: number;
    readonly name: string;
    readonly mine: boolean;
    readonly score: number;
  }[];
  readonly mine?: { readonly rank: number; readonly score: number } | null;
  readonly error?: string;
}

const TABS: readonly {
  id: "campaign" | "stage" | "tower" | "survival" | "arena";
  label: string;
}[] = [
  { id: "campaign", label: "Chiến dịch" },
  { id: "stage", label: "Từng màn" },
  { id: "tower", label: "Leo tháp" },
  { id: "survival", label: "Sinh tồn" },
  { id: "arena", label: "Đấu trường" },
];

const NOTE: Record<(typeof TABS)[number]["id"], string> = {
  campaign:
    "Qua nhiều màn hơn đứng trên; bằng nhau thì tổng số lượt ít nhất của các màn ít hơn đứng trên.",
  stage: "Thắng màn này với ít lượt nhất (tính cả hai phe).",
  tower: "Tầng cao nhất đã qua.",
  survival: "Số đợt nhiều nhất đã vượt qua.",
  arena:
    "Điểm đấu trường bóng ma: thắng cộng, thua trừ, nhiều hơn khi gặp đối thủ mạnh hơn.",
};

function scoreText(board: BoardId, score: number): string {
  const d = describeScore(board, score);
  if (board === "campaign") return `${d.main} màn · ${d.turns} lượt`;
  if (board.startsWith("stage:")) return `${d.main} lượt`;
  if (board === "arena") return `${d.main} điểm`;
  return board === "tower" ? `Tầng ${d.main}` : `${d.main} đợt`;
}

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("campaign");
  const [stage, setStage] = useState(CAMPAIGN[0]!.id);
  const [data, setData] = useState<BoardResponse | null>(null);
  const board: BoardId = tab === "stage" ? `stage:${stage}` : tab;

  useEffect(() => {
    let live = true;
    void fetch(`/api/leaderboard?board=${encodeURIComponent(board)}`, {
      cache: "no-store",
    })
      .then((r) => r.json() as Promise<BoardResponse>)
      .catch((): BoardResponse => ({ error: "network" }))
      .then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, [board]);

  const shown = data?.board === board ? data : null;

  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#2b2440_0%,#17110e_60%)] px-3 py-6 text-stone-100 sm:px-6">
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
              Thử thách ngày
            </SceneLink>
          </div>
        </div>

        <div role="tablist" className="mb-3 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
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

        <section className="flex flex-col gap-2 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4">
          {tab === "stage" && (
            <label className="flex flex-wrap items-center gap-2 text-sm">
              Màn
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="rounded bg-black/40 px-2 py-1"
              >
                {CAMPAIGN.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}. {s.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className="text-xs text-stone-400">{NOTE[tab]}</p>
          {!shown ? (
            <p className="py-6 text-center text-sm text-stone-400">
              {data?.error ? "Không tải được bảng xếp hạng." : "Đang tải…"}
            </p>
          ) : shown.top!.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">
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
                    className={`w-7 text-right tabular-nums ${r.rank <= 3 ? "font-black text-amber-300" : "text-stone-400"}`}
                  >
                    {r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.name}
                    {r.mine && " (bạn)"}
                  </span>
                  <span className="text-xs text-stone-300 tabular-nums">
                    {scoreText(board, r.score)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {shown?.mine && !shown.top!.some((r) => r.mine) && (
            <p className="text-sm text-amber-200">
              Hạng của bạn: {shown.mine.rank} ·{" "}
              {scoreText(board, shown.mine.score)}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
