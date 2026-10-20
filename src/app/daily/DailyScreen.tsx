"use client";

// Thử thách hằng ngày: đề chung hôm nay (đội cho sẵn, đối thủ, sân nhà), lượt của mình và bảng xếp hạng.
// Mỗi người một lượt mỗi ngày; server giữ chỗ lượt trước khi tạo trận.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DAILY_GOLD,
  DAILY_LEVEL,
  stageById,
  type DailyScore,
  type FighterConfig,
} from "@/core";
import { ElementIcon } from "../demo/art/icons";
import { Portrait } from "../demo/art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../demo/labels";
import {
  createOnline,
  fetchDaily,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  type DailyResponse,
} from "../demo/online";

function scoreText(s: DailyScore): string {
  return s.won
    ? `Thắng · ${s.turns} lượt · còn ${Math.round(s.permille / 10)}% máu`
    : `Thua · gây ${Math.round(s.permille / 10)}% sát thương`;
}

function Fighters({ list }: { list: readonly FighterConfig[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {list.map((f) => (
        <li
          key={f.id}
          className="flex items-center gap-2 rounded-lg bg-black/30 p-2"
        >
          <Portrait
            id={f.id}
            element={f.element}
            profession={f.profession}
            className="size-10 shrink-0"
          />
          <div className="min-w-0 text-xs">
            <p className="truncate text-sm font-semibold">{f.name}</p>
            <p className="flex items-center gap-1 text-stone-300">
              <ElementIcon element={f.element} className="size-3.5" />
              {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]} ·{" "}
              {f.maxHp} máu
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DailyScreen() {
  const router = useRouter();
  const [data, setData] = useState<DailyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchDaily().then(setData);
  }, []);

  if (!data?.setup) {
    return (
      <Shell>
        <p className="py-24 text-center text-stone-300">
          {data
            ? "Không tải được thử thách hôm nay, thử tải lại trang."
            : "Đang tải…"}
        </p>
      </Shell>
    );
  }

  const { setup, mine, top = [] } = data;
  const stage = stageById(setup.stage);

  const play = async () => {
    if (mine && !mine.result) {
      try {
        window.localStorage.setItem(ONLINE_BATTLE_KEY, mine.matchId);
      } catch {
        // Bỏ qua: /play vẫn có nút Tiếp tục.
      }
      router.push("/play?resume=1");
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: "3v3",
      element: "moc",
      profession: "tuongSi",
      companions: [],
      difficulty: "hard",
      daily: true,
    });
    if (!res.id) {
      setBusy(false);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì /play không tự tiếp tục.
    }
    router.push("/play?resume=1");
  };

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">
            Ngày {data.day?.split("-").reverse().join("/")}
          </p>
          <h1 className="text-2xl font-black text-amber-100">Thử thách ngày</h1>
          <p className="text-sm text-stone-400">
            Một đề chung cho mọi người, mỗi người đánh một lần. Đề mới lúc 0
            giờ.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/play"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Chơi
          </Link>
          <Link
            href="/survival"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Sinh tồn
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4 shadow-[inset_0_0_24px_#0009]">
          <h2 className="text-lg font-bold text-amber-100">Đề hôm nay</h2>
          <p className="text-sm text-stone-300">
            Đội cho sẵn, cấp {DAILY_LEVEL}, không trang bị. Đối thủ đánh ở mức{" "}
            {DIFFICULTY_NAME[setup.difficulty]}
            {stage ? `, trên sân nhà ${stage.region}` : ""}. Bạn đi trước. Ai đi
            cùng nước sẽ gặp cùng ô rơi.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-amber-200">
                Đội của bạn
              </h3>
              <Fighters list={setup.team} />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-rose-300">
                Đối thủ
              </h3>
              <Fighters list={setup.foes} />
            </div>
          </div>
          <p className="text-xs text-stone-400">
            Xếp hạng: thắng đứng trên thua; cùng thắng thì ít lượt hơn đứng
            trên, rồi còn nhiều máu hơn. Thưởng {DAILY_GOLD.win} vàng khi thắng,{" "}
            {DAILY_GOLD.loss} vàng khi thua.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {mine?.result ? (
              <p className="font-semibold text-amber-200">
                Bạn đã đánh hôm nay: {scoreText(mine.result)}
                {mine.rank !== null && ` · hạng ${mine.rank}`}
              </p>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void play()}
                className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:opacity-50"
              >
                {busy
                  ? "Đang vào trận…"
                  : mine
                    ? "Tiếp tục trận"
                    : "Đánh (1 lần)"}
              </button>
            )}
            {message && (
              <span className="text-sm text-rose-400">{message}</span>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4">
          <h2 className="font-bold text-amber-200">Bảng xếp hạng</h2>
          {top.length === 0 ? (
            <p className="text-sm text-stone-400">Chưa ai đánh xong hôm nay.</p>
          ) : (
            <ol className="flex flex-col gap-1 text-sm">
              {top.map((r) => (
                <li
                  key={r.rank}
                  className={`flex items-center gap-2 rounded px-2 py-1 ${r.mine ? "bg-amber-500/20 font-semibold" : "bg-black/20"}`}
                >
                  <span className="w-6 text-right tabular-nums text-amber-300">
                    {r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.name}
                    {r.mine && " (bạn)"}
                  </span>
                  <span className="text-xs text-stone-300">
                    {scoreText(r.score)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {mine?.rank != null && !top.some((r) => r.mine) && (
            <p className="text-sm text-amber-200">Hạng của bạn: {mine.rank}</p>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2b2440_0%,#17110e_60%)] px-3 py-6 text-stone-100 [--gold:#d4a24c] sm:px-6">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
