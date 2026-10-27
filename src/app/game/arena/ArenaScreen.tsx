"use client";

import { Card, Button } from "@/components/ui";

// Đấu trường bóng ma: điểm và thành tích, đội phòng thủ (bản chụp đội 3vs3 đang chọn), 3 đối thủ đang bày.
// Đánh dùng đội 3vs3 đang chọn ở hồ sơ; đối thủ do AI điều khiển.

import { useEffect, useState } from "react";
import { ARENA_DIFFICULTY, ARENA_WIN_GOLD, type ArenaMember } from "@/core";
import { ElementIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import {
  createOnline,
  fetchArena,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  type ArenaResponse,
} from "../battle/online";
import { SceneLink, useScene } from "../SceneContext";

function Members({ list }: { list: readonly ArenaMember[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {list.map((m, i) => (
        <li
          key={`${m.id}-${i}`}
          className="flex items-center gap-2 rounded-lg bg-black/30 p-1.5"
        >
          <Portrait
            id={m.id}
            element={m.element}
            profession={m.profession}
            className="size-9 shrink-0"
          />
          <div className="min-w-0 text-xs">
            <p className="truncate text-sm font-semibold">{m.name}</p>
            <p className="flex items-center gap-1 text-foreground-secondary">
              <ElementIcon element={m.element} className="size-3.5" />
              {ELEMENT_NAME[m.element]} · {PROFESSION_NAME[m.profession]} · cấp{" "}
              {m.level}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ArenaScreen() {
  const { go } = useScene();
  const [data, setData] = useState<ArenaResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchArena().then(setData);
  }, []);

  if (data?.rating === undefined) {
    return (
      <Shell>
        <p className="py-24 text-center text-foreground-secondary">
          {data ? "Không tải được đấu trường, thử tải lại trang." : "Đang tải…"}
        </p>
      </Shell>
    );
  }

  const left = data.attacksLeft ?? 0;
  const offers = data.offers ?? [];

  const command = async (action: "defend" | "refresh") => {
    setBusy(action);
    setMessage(null);
    const next = await fetchArena(action);
    setBusy(null);
    if (next.rating === undefined)
      return setMessage(ONLINE_ERROR_TEXT[next.error ?? "network"] ?? "Lỗi");
    setData(next);
    if (action === "defend") setMessage("Đã cập nhật đội phòng thủ.");
  };

  const attack = async (index: number) => {
    setBusy(`attack${index}`);
    setMessage(null);
    const res = await createOnline({
      mode: "3v3",
      element: "moc",
      profession: "tuongSi",
      companions: [],
      difficulty: "hard",
      arena: index,
    });
    if (!res.id) {
      setBusy(null);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
      if (res.error === "arenaGone") void fetchArena().then(setData);
      return;
    }
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được thì phân cảnh trận không tự tiếp tục.
    }
    go("PLAYING", { resume: "1" });
  };

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-amber-100">
            Quần Hùng
          </h1>
          <p className="text-sm text-muted">
            Đánh với đội phòng thủ của người chơi khác, do máy điều khiển ở mức{" "}
            {DIFFICULTY_NAME[ARENA_DIFFICULTY]}. Thắng cộng điểm, thua trừ điểm.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <SceneLink
            scene="PLAYING"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Chơi
          </SceneLink>
          <SceneLink
            scene="LEADERBOARD"
            className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            Xếp hạng
          </SceneLink>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4">
          <Card className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Điểm" value={String(data.rating)} big />
            <Stat
              label="Hạng"
              value={data.rank != null ? `#${data.rank}` : "–"}
            />
            <Stat
              label="Lượt hôm nay"
              value={`${left}/${data.attacksPerDay ?? 0}`}
            />
            <Stat
              label="Đánh"
              value={`${data.wins ?? 0} thắng · ${data.losses ?? 0} thua`}
              small
            />
            <Stat
              label="Bị đánh"
              value={`${data.defenseWins ?? 0} giữ · ${data.defenseLosses ?? 0} mất`}
              small
            />
            <Stat
              label="Thưởng thắng"
              value={`+${ARENA_WIN_GOLD} vàng`}
              small
            />
          </Card>

          <Card className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-bold text-amber-200">Đội phòng thủ</h2>
              {data.defense && (
                <span className="text-xs text-muted">
                  Lực chiến {data.defense.power}
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              Người khác đánh với bản chụp đội này. Nâng cấp hay đổi đội ở hồ sơ
              xong thì bấm cập nhật.
            </p>
            {data.defense && <Members list={data.defense.members} />}
            <Button variant="secondary"
              type="button"
              disabled={busy !== null}
              onClick={() => void command("defend")}
              className="self-start text-sm"
            >
              {busy === "defend" ? "Đang lưu…" : "Cập nhật theo đội hiện tại"}
            </Button>
          </Card>
        </div>

        <Card className="flex flex-col gap-3 shadow-card-inset">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-amber-100">Chọn đối thủ</h2>
            <Button variant="secondary"
              type="button"
              disabled={busy !== null}
              onClick={() => void command("refresh")}
              className="text-sm"
            >
              {busy === "refresh" ? "Đang tìm…" : "Đổi đối thủ"}
            </Button>
          </div>
          <p className="text-xs text-muted">
            Bạn ra trận với đội 3vs3 đang chọn ở hồ sơ. Đối thủ có điểm càng
            cao, thắng càng được nhiều điểm.
          </p>
          {message && <p className="text-sm text-amber-300">{message}</p>}
          <div className="grid gap-3 md:grid-cols-3">
            {offers.map((o, i) => (
              <div
                key={`${o.name}-${i}`}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/20 p-3"
              >
                <div>
                  <p className="truncate font-bold text-amber-100">{o.name}</p>
                  <p className="text-xs text-foreground-secondary">
                    {o.rating} điểm · lực chiến {o.power}
                    {o.bot && " · bóng ma luyện tập"}
                  </p>
                </div>
                <Members list={o.members} />
                <Button variant="ornate"
                  type="button"
                  disabled={busy !== null || left <= 0}
                  onClick={() => void attack(i)}
                  className="mt-auto tracking-wider uppercase"
                >
                  {busy === `attack${i}` ? "Đang vào trận…" : "Đánh"}
                </Button>
              </div>
            ))}
          </div>
          {left <= 0 && (
            <p className="text-sm text-rose-300">
              Hôm nay đã hết lượt. Lượt mới lúc 0 giờ.
            </p>
          )}
        </Card>
      </div>
    </Shell>
  );
}

function Stat({
  label,
  value,
  big,
  small,
}: {
  label: string;
  value: string;
  big?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg bg-black/25 p-2">
      <p className="text-[11px] tracking-wide text-muted uppercase">
        {label}
      </p>
      <p
        className={`font-bold text-amber-100 tabular-nums ${big ? "text-2xl" : small ? "text-xs" : "text-lg"}`}
      >
        {value}
      </p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="ui-screen ui-screen--cool">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
