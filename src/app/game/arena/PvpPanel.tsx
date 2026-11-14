"use client";

// Quần Hùng, Đấu người (PvP 1vs1): vào hàng đợi, chờ ghép, đánh trực tiếp với người khác. Server có thẩm quyền; client hỏi
// lại mỗi 1,5 giây (cũng là tín hiệu còn sống) và chỉ gửi ý định. Luật ở docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canFreeWhirl,
  comboSkillCost,
  defaultSkillTarget,
  fighterSkill,
  isAdjacent,
  isWhirlCenter,
  needsCell,
  ELEMENTS,
  PASSIVE,
  MAIN_ID,
  PROFESSIONS,
  selectableActors,
  skillTargetOptions,
  whirlStep,
  type BattleAction,
  type BattleEvent,
  type Element,
  type Profession,
  type BattleState,
  type Fighter,
  type Pos,
  type SkillDef,
  type Whirl,
} from "@/core";
import type { PvpMatchView, PvpOverview } from "@/server/pvp";
import type { PvpRoomView } from "@/server/pvpRooms";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { FrameInset, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { ElementIcon } from "../art/icons";
import { TileArt } from "../art/tiles";
import PvpDraftScreen from "./PvpDraft";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { SeasonBoardPanel } from "../leaderboard/boards";
import { describe } from "../battle/battleLog";
import { ELEMENT_NAME, EFFECT_NAME, ERROR_TEXT, PROFESSION_NAME, skillText } from "../battle/labels";

const POLL_MS = 1500;
const OVERVIEW_POLL_MS = 2000;

type Json = Record<string, unknown>;

async function call(url: string, body?: unknown): Promise<{ status: number; data: Json }> {
  try {
    const res = await fetch(url, {
      ...(body === undefined ? {} : { method: "POST", body: JSON.stringify(body) }),
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });
    return { status: res.status, data: (await res.json().catch(() => ({}))) as Json };
  } catch {
    return { status: 0, data: { error: "network" } };
  }
}

/** Dò xem Đấu người có đang mở không (cờ tính năng) và đã đăng nhập chưa. */
export async function probePvp(): Promise<{ available: boolean; busy: boolean }> {
  const r = await call("/api/pvp");
  if (r.status !== 200) return { available: false, busy: false };
  const o = r.data as unknown as PvpOverview;
  return { available: true, busy: !!o.matchId || !!o.draftId || !!o.queue };
}

const ERROR_NAME: Record<string, string> = {
  network: "Mất kết nối tới máy chủ. Hãy kiểm tra mạng, ván vẫn chạy trong lúc bạn tải lại.",
  inMatch: "Bạn đang có một trận dở. Hãy vào lại trận đó.",
  badFormat: "Thể thức này chưa mở.",
  banned: "Bạn đang bị hạn chế ghép trận vì phá trận.",
  needHeroes: "Đấu 3vs3 xếp hạng cần từ 7 tướng trở lên (kể cả Đinh Bộ Lĩnh), vì sáu lượt cấm vẫn phải chừa tướng cho bạn chọn.",
  conflict: "Máy chủ đang bận, hãy thử lại.",
  notYourTurn: "Chưa đến lượt bạn.",
  notCaptain: "Chỉ đội trưởng mới đổi được người hành động.",
  left: "Bạn đã mất kết nối quá lâu, tướng của bạn do máy điều khiển.",
  battleOver: "Trận đã kết thúc.",
  rejected: "Nước đi không hợp lệ.",
  badAction: "Nước đi không hợp lệ.",
  notFound: "Không tìm thấy trận này.",
};

const clockTime = (ms: number) => new Date(ms).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const errorText = (data: Json): string => {
  if (data.error === "banned" && typeof data.until === "number") return `Bạn bị hạn chế ghép trận vì phá trận, được ghép lại sau ${clockTime(data.until)}.`;
  const detail = typeof data.detail === "string" ? data.detail : "";
  if (detail in ERROR_TEXT) return ERROR_TEXT[detail as keyof typeof ERROR_TEXT];
  return ERROR_NAME[String(data.error)] ?? "Có lỗi xảy ra, hãy thử lại.";
};

export default function PvpPanel({ onBusyChange }: { onBusyChange?: (busy: boolean) => void }) {
  const [overview, setOverview] = useState<PvpOverview | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [inRoom, setInRoom] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  /** Nghề và hệ chọn cho trận kế tiếp; chưa chọn thì lấy theo hồ sơ. */
  const [pick, setPick] = useState<{ element?: Element; profession?: Profession }>({});

  const refresh = useCallback(async () => {
    const r = await call("/api/pvp");
    if (r.status === 200) {
      const o = r.data as unknown as PvpOverview;
      setOverview(o);
      setMatchId((cur) => cur ?? o.matchId);
      setDraftId((cur) => cur ?? o.draftId);
    } else if (r.data.error === "network") setMessage(errorText(r.data));
  }, []);

  useEffect(() => {
    if (matchId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu máy chủ khi vào màn
    void refresh();
    const id = window.setInterval(() => void refresh(), OVERVIEW_POLL_MS);
    return () => window.clearInterval(id);
  }, [matchId, refresh]);

  useEffect(() => {
    onBusyChange?.(!!matchId || !!draftId || !!overview?.queue);
  }, [matchId, draftId, overview?.queue, onBusyChange]);

  const queue = async (format: "duel" | "team" = "duel") => {
    setBusy(true);
    const r = await call("/api/pvp", { action: "queue", format, element: pick.element ?? overview?.build.element, profession: pick.profession ?? overview?.build.profession });
    setBusy(false);
    if (r.status === 200) {
      setMessage("");
      const o = r.data as unknown as PvpOverview;
      setOverview(o);
      if (o.matchId) setMatchId(o.matchId);
      if (o.draftId) setDraftId(o.draftId);
    } else setMessage(errorText(r.data));
  };

  const leave = async () => {
    setBusy(true);
    const r = await call("/api/pvp", { action: "leave" });
    setBusy(false);
    if (r.status === 200) setOverview(r.data as unknown as PvpOverview);
  };

  if (inRoom || (overview?.room && !matchId)) {
    return (
      <PvpRoom
        onMatch={(id) => {
          setInRoom(false);
          setMatchId(id);
        }}
        onExit={() => {
          setInRoom(false);
          void refresh();
        }}
      />
    );
  }

  if (draftId && !matchId) {
    return (
      <PvpDraftScreen
        id={draftId}
        onMatch={(id) => {
          setDraftId(null);
          setMatchId(id);
        }}
        onExit={() => {
          setDraftId(null);
          void refresh();
        }}
      />
    );
  }

  if (matchId) {
    return (
      <PvpMatch
        id={matchId}
        onExit={() => {
          setMatchId(null);
          void refresh();
        }}
      />
    );
  }

  const o = overview;
  return (
    <div className="flex flex-col gap-4">
    <OrnateFrame level="raised" className="flex flex-col gap-4">
      <SectionTitle description="Đấu 1vs1 với người khác, mỗi bên chỉ có Đinh Bộ Lĩnh. Điểm hạng riêng cho Đấu người, thắng tăng, thua giảm. Số trận không giới hạn, vàng thưởng có trần mỗi ngày.">
        Đấu người
      </SectionTitle>
      {message && <Alert role="alert">{message}</Alert>}
      <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4" aria-label="Thành tích Đấu người">
        <FrameInset>
          <p className="text-caption text-on-wood-soft">Điểm</p>
          <p className="text-xl font-bold text-title-on-wood">{o?.ratings.duel.rating ?? "–"}</p>
        </FrameInset>
        <FrameInset>
          <p className="text-caption text-on-wood-soft">Đánh</p>
          <p className="text-base font-bold text-title-on-wood">
            {o ? `${o.ratings.duel.wins} thắng · ${o.ratings.duel.losses} thua` : "–"}
          </p>
        </FrameInset>
        <FrameInset>
          <p className="text-caption text-on-wood-soft">Lượt mất mạng được tha hôm nay</p>
          <p className="text-xl font-bold text-title-on-wood">{o?.forgiveLeft ?? "–"}</p>
        </FrameInset>
        <FrameInset>
          <p className="text-caption text-on-wood-soft">Vàng còn nhận được hôm nay</p>
          <p className="text-xl font-bold text-title-on-wood">{o?.goldLeft ?? "–"}</p>
        </FrameInset>
      </div>
      {o?.banUntil && <Alert role="alert">Bạn bị hạn chế ghép trận vì phá trận, được ghép lại sau {clockTime(o.banUntil)}.</Alert>}
      {!o?.banUntil && !!o?.breakCount && (
        <Alert role="status">Bạn đã bị tính phá trận {o.breakCount} lần trong tuần này. Phá trận thêm sẽ bị hạn chế ghép trận.</Alert>
      )}
      {o?.queue ? (
        <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-on-wood">
            {o.queue.format === "team" ? "Đang ghép trận 3vs3, máy sẽ điền chỗ trống nếu chờ lâu…" : "Đang tìm đối thủ có điểm gần bạn…"} đã chờ {Math.floor(o.queue.waitedMs / 1000)} giây. Hãy để trang này mở.
          </p>
          <Button variant="secondary" disabled={busy} onClick={() => void leave()}>
            Rời hàng đợi
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {o && (
            <div className="flex flex-wrap items-end gap-3" role="group" aria-label="Chuẩn bị Đinh Bộ Lĩnh">
              <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
                Nghề
                <select
                  className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
                  value={pick.profession ?? o.build.profession}
                  onChange={(e) => setPick((p) => ({ ...p, profession: e.target.value as Profession }))}
                >
                  {PROFESSIONS.map((x) => (
                    <option key={x} value={x}>
                      {PROFESSION_NAME[x as keyof typeof PROFESSION_NAME] ?? x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
                Hệ
                <select
                  className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
                  value={pick.element ?? o.build.element}
                  onChange={(e) => setPick((p) => ({ ...p, element: e.target.value as Element }))}
                >
                  {ELEMENTS.map((x) => (
                    <option key={x} value={x}>
                      {ELEMENT_NAME[x]}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm text-on-wood-soft">
                Cấp và trang bị theo Doanh Trại. Nghề và hệ khóa khi vào trận.
              </p>
            </div>
          )}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={busy || !o || !!o.banUntil} onClick={() => void queue()}>
            Tìm đối thủ 1vs1
          </Button>
          <p className="text-sm text-on-wood-soft">
            Mỗi lượt 30 giây. Bỏ lượt liên tục là phá trận và không được tính điểm; mất mạng được tha 3 lần mỗi ngày.
          </p>
        </div>
        </div>
      )}
    </OrnateFrame>
      {o && !o.queue && (
        <OrnateFrame level="raised" className="flex flex-col gap-3">
          <SectionTitle description="Đấu 3vs3 xếp hạng: đủ sáu người thì cấm chọn ngay, chờ lâu thì máy điền chỗ trống (trận có máy được ít điểm hơn). Điểm 3vs3 tính riêng.">
            3vs3 xếp hạng
          </SectionTitle>
          <p className="text-on-wood">
            Điểm {o.ratings.team.rating} · {o.ratings.team.wins} thắng · {o.ratings.team.losses} thua
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={busy || !!o.banUntil || o.heroCount.have < o.heroCount.need} onClick={() => void queue("team")}>
              Tìm trận 3vs3
            </Button>
            {o.heroCount.have < o.heroCount.need && <p className="text-sm text-on-wood-soft">Cần từ {o.heroCount.need} tướng trở lên, bạn đang có {o.heroCount.have}.</p>}
            <p className="text-sm text-on-wood-soft">Ghép đủ người thì cấm chọn tướng công khai, mỗi phe cấm 3 tướng rồi mỗi người chọn một tướng của mình.</p>
          </div>
        </OrnateFrame>
      )}
      {o && !o.queue && (
        <OrnateFrame level="raised" className="flex flex-col gap-3">
          <SectionTitle description="Đấu 3vs3 giao hữu với bạn bè: mỗi người một tướng của mình, chỗ trống có thể để máy điều khiển. Giao hữu không tính điểm hạng, không có vàng.">
            Phòng 3vs3
          </SectionTitle>
          <Button variant="secondary" disabled={busy || !!o.banUntil} onClick={() => setInRoom(true)}>
            Lập hoặc vào phòng
          </Button>
        </OrnateFrame>
      )}
      <RankRewardsPanel mode="pvp" />
      <SeasonBoardPanel board="pvp" />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const ROOM_ERROR: Record<string, string> = {
  notFound: "Không có phòng với mã này.",
  inRoom: "Bạn đang ở một phòng khác.",
  inMatch: "Bạn đang có một trận dở. Hãy vào lại trận đó.",
  full: "Phòng đã đủ người.",
  closed: "Phòng đã đóng.",
  started: "Phòng đã bắt đầu trận.",
  notHost: "Chỉ chủ phòng làm được việc này.",
  notMember: "Bạn không còn ở trong phòng này.",
  badHero: "Bạn không chọn được tướng này.",
  badBuild: "Nghề hoặc hệ không hợp lệ.",
  heroTaken: "Phe này đã có tướng đó.",
  dblTaken: "Đinh Bộ Lĩnh đã có người chọn trong phòng.",
  badSlot: "Chỗ không hợp lệ.",
  slotTaken: "Chỗ đã có người.",
  needHero: "Mọi người cần chọn tướng trước khi bắt đầu.",
  needHumans: "Mỗi phe cần ít nhất một người thật.",
  needFull: "Còn chỗ trống. Hãy bật máy điền chỗ hoặc chờ thêm người.",
  conflict: "Máy chủ đang bận, hãy thử lại.",
};

const roomError = (data: Json): string => ROOM_ERROR[String(data.error)] ?? ERROR_NAME[String(data.error)] ?? "Có lỗi xảy ra, hãy thử lại.";

/** Phòng giao hữu 3vs3: lập phòng hoặc vào bằng mã, chọn tướng, chủ phòng bắt đầu. */
function PvpRoom({ onMatch, onExit }: { onMatch: (matchId: string) => void; onExit: () => void }) {
  const [room, setRoom] = useState<PvpRoomView | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [looked, setLooked] = useState(false);
  const [pick, setPick] = useState<{ element?: Element; profession?: Profession }>({});

  const apply = useCallback(
    (r: { status: number; data: Json }) => {
      if (r.status === 200) {
        const v = r.data.room as PvpRoomView;
        setRoom(v);
        setMessage("");
        if (v.matchId) onMatch(v.matchId);
        return true;
      }
      setMessage(roomError(r.data));
      return false;
    },
    [onMatch],
  );

  const poll = useCallback(async () => {
    const r = await call("/api/pvp/rooms");
    setLooked(true);
    if (r.status === 200) apply(r);
    else if (r.status === 404 || r.status === 403) setRoom(null);
  }, [apply]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải phòng hiện tại khi vào màn
    void poll();
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(id);
  }, [poll]);

  const act = async (body: Json) => {
    setBusy(true);
    const r = await call("/api/pvp/rooms", body);
    setBusy(false);
    return apply(r);
  };

  const leave = async () => {
    setBusy(true);
    await call("/api/pvp/rooms", { action: "leave" });
    setBusy(false);
    setRoom(null);
    onExit();
  };

  if (!looked) return <p role="status" className="text-on-wood-soft">Đang tải…</p>;

  if (!room || room.status === "closed") {
    return (
      <OrnateFrame level="raised" className="flex flex-col gap-4">
        <SectionTitle description="Lập phòng rồi đưa mã cho bạn bè, hoặc gõ mã bạn bè đưa để vào. Mỗi phe ba chỗ.">Phòng 3vs3</SectionTitle>
        {message && <Alert role="alert">{message}</Alert>}
        <div className="flex flex-wrap items-end gap-3">
          <Button size="lg" disabled={busy} onClick={() => void act({ action: "create" })}>
            Lập phòng mới
          </Button>
          <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
            Mã phòng
            <input
              className="min-h-11 w-40 rounded-control border border-frame-line bg-wood-inset px-3 uppercase tracking-widest text-on-wood"
              value={code}
              maxLength={6}
              autoComplete="off"
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </label>
          <Button variant="secondary" disabled={busy || code.length < 6} onClick={() => void act({ action: "join", code })}>
            Vào phòng
          </Button>
          <Button variant="secondary" disabled={busy} onClick={onExit}>
            Quay lại
          </Button>
        </div>
      </OrnateFrame>
    );
  }

  const mine = room.slots.find((x) => x.mine);
  const myHero = mine?.hero ?? null;
  const chosen = room.heroes.find((h) => h.id === myHero?.id);
  const side = (from: number, label: string) => (
    <div className="flex flex-col gap-2">
      <p className="font-bold text-title-on-wood">{label}</p>
      {room.slots.slice(from, from + 3).map((x) => (
        <FrameInset key={x.slot} className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-on-wood">
              {x.occupied ? `${x.name ?? "Người chơi"}${x.host ? " (chủ phòng)" : ""}${x.mine ? " · bạn" : ""}` : "Chỗ trống"}
            </p>
            {x.hero && (
              <p className="text-sm text-on-wood-soft">
                {x.hero.name} · cấp {x.hero.level} · {PROFESSION_NAME[x.hero.profession as keyof typeof PROFESSION_NAME] ?? x.hero.profession} · {ELEMENT_NAME[x.hero.element]}
              </p>
            )}
            {x.occupied && !x.hero && <p className="text-sm text-on-wood-soft">Chưa chọn tướng</p>}
          </div>
          {!x.occupied && room.you.slot !== null && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => void act({ action: "move", slot: x.slot })}>
              Ngồi đây
            </Button>
          )}
        </FrameInset>
      ))}
    </div>
  );

  return (
    <OrnateFrame level="raised" className="flex flex-col gap-4">
      <SectionTitle description="Đưa mã này cho bạn bè để họ vào phòng.">
        Phòng {room.code}
      </SectionTitle>
      {message && <Alert role="alert">{message}</Alert>}
      <div className="grid gap-3 md:grid-cols-2">
        {side(0, "Phe thứ nhất")}
        {side(3, "Phe thứ hai")}
      </div>
      <div className="flex flex-wrap items-end gap-3" role="group" aria-label="Chọn tướng">
        <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
          Tướng của bạn
          <select
            className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
            value={myHero?.id ?? ""}
            disabled={busy}
            onChange={(e) => e.target.value && void act({ action: "hero", hero: e.target.value, element: pick.element, profession: pick.profession })}
          >
            <option value="">Chọn tướng</option>
            {room.heroes.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} · cấp {h.level}
              </option>
            ))}
          </select>
        </label>
        {myHero?.id === MAIN_ID && chosen && (
          <>
            <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
              Nghề
              <select
                className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
                value={pick.profession ?? myHero.profession}
                onChange={(e) => {
                  const profession = e.target.value as Profession;
                  setPick((p) => ({ ...p, profession }));
                  void act({ action: "hero", hero: myHero.id, element: pick.element ?? myHero.element, profession });
                }}
              >
                {PROFESSIONS.map((x) => (
                  <option key={x} value={x}>
                    {PROFESSION_NAME[x as keyof typeof PROFESSION_NAME] ?? x}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-wood-soft">
              Hệ
              <select
                className="min-h-11 rounded-control border border-frame-line bg-wood-inset px-3 text-on-wood"
                value={pick.element ?? myHero.element}
                onChange={(e) => {
                  const element = e.target.value as Element;
                  setPick((p) => ({ ...p, element }));
                  void act({ action: "hero", hero: myHero.id, element, profession: pick.profession ?? myHero.profession });
                }}
              >
                {ELEMENTS.map((x) => (
                  <option key={x} value={x}>
                    {ELEMENT_NAME[x]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
      <p className="text-sm text-on-wood-soft">Cấp và trang bị theo hồ sơ của từng tướng. Mỗi trận chỉ một người được chọn Đinh Bộ Lĩnh.</p>
      {room.you.host ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-11 items-center gap-2 text-on-wood">
            <input type="checkbox" checked={room.fillAi} disabled={busy} onChange={(e) => void act({ action: "fill", fillAi: e.target.checked })} />
            Chỗ trống do máy điều khiển
          </label>
          <Button size="lg" disabled={busy || room.startBlock !== null} onClick={() => void act({ action: "start" })}>
            Bắt đầu trận
          </Button>
          {room.startBlock && <p className="text-sm text-on-wood-soft">{ROOM_ERROR[room.startBlock]}</p>}
        </div>
      ) : (
        <p role="status" className="text-on-wood-soft">Chờ chủ phòng bắt đầu trận.</p>
      )}
      <div>
        <Button variant="secondary" disabled={busy} onClick={() => void leave()}>
          Rời phòng
        </Button>
      </div>
    </OrnateFrame>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

/** Đổi chỗ hai phe để người xem luôn là phe 0 ("bạn"): đảo mọi chỉ số phe trong trạng thái và sự kiện. */
const flip = <T,>(v: T): T => JSON.parse(JSON.stringify(v), (k, x) => ((k === "side" || k === "winner") && (x === 0 || x === 1) ? 1 - x : x)) as T;

function asMine(state: BattleState, mySide: 0 | 1): BattleState {
  if (mySide === 0) return state;
  const f = flip(state);
  return { ...f, sides: [f.sides[1], f.sides[0]], lastActors: [f.lastActors[1], f.lastActors[0]] } as BattleState;
}

const toState = (v: PvpMatchView): BattleState => ({ ...v.battle, boardRng: 0, aiRng: 0 }) as BattleState;

function Bar({ value, max, label, tone }: { value: number; max: number; label: string; tone: "hp" | "energy" | "rage" }) {
  const pct = Math.max(0, Math.min(100, max <= 0 ? 0 : (value / max) * 100));
  const color = tone === "hp" ? "bg-stat-hp" : tone === "energy" ? "bg-stat-energy" : "bg-stat-rage";
  return (
    <div className="flex items-center gap-2 text-caption">
      <span className="w-14 shrink-0 text-on-wood-soft">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded bg-wood-inset" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className={`h-full ${color} transition-[width] duration-500 motion-reduce:transition-none`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right tabular-nums">
        {Math.round(value)}/{Math.round(max)}
      </span>
    </div>
  );
}

function FighterPanel({ f, rage, showRage, mine, active, tag }: { f: Fighter; rage: number; showRage: boolean; mine: boolean; active: boolean; tag?: string }) {
  return (
    <FrameInset className={`flex flex-col gap-1.5 p-3 ${active ? "ring-2 ring-frame-gold" : ""}`}>
      <div className="flex items-center gap-2">
        <ElementIcon element={f.element} className="size-5" />
        <p className="font-semibold">
          {f.name}
          <span className="ml-2 text-caption font-normal text-on-wood-soft">
            {tag ?? (mine ? "Bạn" : "Đối thủ")} · {PROFESSION_NAME[f.profession as keyof typeof PROFESSION_NAME] ?? f.profession} · {ELEMENT_NAME[f.element]}
            {f.level ? ` · cấp ${f.level}` : ""}
          </span>
        </p>
      </div>
      <Bar value={f.hp} max={f.maxHp} label="Máu" tone="hp" />
      <Bar value={f.energy} max={100} label="Năng lượng" tone="energy" />
      {showRage && <Bar value={rage} max={100} label="Nộ" tone="rage" />}
      {f.effects.length > 0 && (
        <p className="text-caption text-on-wood-soft">
          {f.effects.map((e) => `${EFFECT_NAME[e.kind] ?? e.kind}${e.turns ? ` (${e.turns})` : ""}`).join(", ")}
        </p>
      )}
    </FrameInset>
  );
}

function PvpMatch({ id, onExit }: { id: string; onExit: () => void }) {
  const [view, setView] = useState<PvpMatchView | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<Pos | null>(null);
  const [aim, setAim] = useState<{ skill: SkillDef; choose: boolean; target?: number; whirl?: Whirl } | null>(null);
  const [whirlAim, setWhirlAim] = useState<{ skill: SkillDef | null; max: number; center: Pos | null } | null>(null);

  const receive = useCallback((data: Json) => {
    const v = (data.view ?? null) as PvpMatchView | null;
    if (!v) return;
    // Bỏ phản hồi cũ hơn trạng thái đang có (hai request chạy chéo nhau).
    setView((prev) => (prev && v.seq < prev.seq ? prev : v));
    setOffset(v.serverNow - Date.now());
  }, []);

  useEffect(() => {
    let stop = false;
    let timer = 0;
    const loop = async () => {
      const r = await call(`/api/pvp/${id}`);
      if (stop) return;
      if (r.status === 200) {
        receive(r.data);
        if ((r.data.view as PvpMatchView | undefined)?.status !== "active") return; // trận xong: dừng hỏi
      } else if (r.status === 404) {
        setMessage(errorText(r.data));
        return;
      }
      timer = window.setTimeout(() => void loop(), POLL_MS);
    };
    void loop();
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [id, receive]);

  useEffect(() => {
    const t = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  const state = useMemo(() => (view ? toState(view) : null), [view]);
  /** Nhật ký diễn biến theo góc nhìn của bạn, mới nhất trước. */
  const lines = useMemo(() => {
    if (!view || !state) return [];
    // Hai bên đều là Đinh Bộ Lĩnh nên nhật ký gọi theo phe: "Bạn" và "Đối thủ".
    const base = asMine(state, view.you.side);
    const mine = { ...base, sides: base.sides.map((sd, i) => ({ ...sd, fighters: sd.fighters.map((f) => ({ ...f, name: i === 0 ? "Bạn" : "Đối thủ" })) })) } as unknown as BattleState;
    return view.log
      .slice(-30)
      .map((entry) => ({ id: entry.id, text: describe(mine, view.you.side === 0 ? entry.event : flip<BattleEvent>(entry.event)) }))
      .filter((l): l is { id: number; text: string } => !!l.text)
      .reverse()
      .slice(0, 14);
  }, [view, state]);
  const mySide = view?.you.side ?? 0;
  const foeSide = (1 - mySide) as 0 | 1;
  const myTurn = !!view && view.status === "active" && view.clock.mine && !view.you.left;

  const play = useCallback(
    async (action: BattleAction) => {
      if (busy) return false;
      setBusy(true);
      const r = await call(`/api/pvp/${id}`, { action });
      setBusy(false);
      if (r.status === 200) {
        receive(r.data);
        setMessage("");
        return true;
      }
      setMessage(errorText(r.data));
      return false;
    },
    [busy, id, receive],
  );

  if (!view || !state) {
    return (
      <OrnateFrame level="raised">
        <p role="status">{message || "Đang vào trận…"}</p>
        {message && (
          <Button variant="secondary" onClick={onExit} className="mt-2">
            Về sảnh
          </Button>
        )}
      </OrnateFrame>
    );
  }

  const own = state.sides[mySide];
  const foe = state.sides[foeSide];
  const actor = state.sides[state.turn.side].fighters[state.turn.actor] as Fighter;
  const board = state.board;
  const remaining = view.clock.deadline === null ? null : Math.max(0, Math.ceil((view.clock.deadline - (clockNow + offset)) / 1000));
  const over = view.status !== "active";
  const team = view.format === "team";
  /** Nhãn chỗ ngồi: "Bạn", tên đồng đội hoặc đối thủ, hoặc "Máy" khi do máy điều khiển. */
  const seatTag = (side: 0 | 1, position: number) => {
    const seat = view.seats.find((x) => x.side === side && x.position === position);
    if (!seat) return side === mySide ? "Đồng đội" : "Đối thủ";
    return seat.mine ? "Bạn" : seat.ai ? "Máy" : (seat.name ?? (side === mySide ? "Đồng đội" : "Đối thủ"));
  };
  /** Đội trưởng của phe đang đánh được chọn người hành động trong số người ra tay được. */
  const captainPick = !over && view.you.captain && !view.you.left && state.turn.side === mySide && !state.turn.skillUsed ? selectableActors(state) : [];
  const skills = myTurn ? (actor.skills ?? []).map((sid) => fighterSkill(actor, sid)).filter((d): d is SkillDef => !!d) : [];

  const cast = (def: SkillDef, whirl?: Whirl) => {
    const options = skillTargetOptions(state, def);
    if (options.length > 1 || needsCell(def)) {
      setAim({ skill: def, choose: options.length > 1, ...(whirl ? { whirl } : {}), ...(defaultSkillTarget(state, def) != null ? { target: defaultSkillTarget(state, def) as number } : {}) });
      setSelected(null);
      return;
    }
    void play({ type: "skill", skill: def.id, ...(whirl ? { whirl } : {}) });
  };

  const pickSkill = (def: SkillDef) => {
    if (!myTurn) return;
    if (state.turn.skillUsed) return setMessage(ERROR_TEXT.skillUsed);
    if (actor.energy < comboSkillCost(actor, def)) return setMessage(`${ERROR_TEXT.notEnoughEnergy} (${actor.energy}/${comboSkillCost(actor, def)})`);
    setAim(null);
    setWhirlAim(null);
    const w = whirlStep(def);
    if (w) {
      setWhirlAim({ skill: def, max: w.turns, center: null });
      setMessage("Chọn tâm xoáy trên bàn cờ.");
      return;
    }
    cast(def);
  };

  const fire = (target?: number, cell?: Pos) => {
    if (!aim) return;
    const t = target ?? aim.target;
    if (needsCell(aim.skill) && !cell) {
      if (target !== undefined) setAim({ ...aim, target });
      return setMessage("Chọn một ô trên bàn cờ làm tâm.");
    }
    void play({ type: "skill", skill: aim.skill.id, ...(t !== undefined ? { target: t } : {}), ...(cell ? { cell } : {}), ...(aim.whirl ? { whirl: aim.whirl } : {}) }).then((ok) => ok && setAim(null));
  };

  const onCell = (pos: Pos) => {
    if (!myTurn || busy) return;
    if (whirlAim) {
      if (!isWhirlCenter(board, pos)) return setMessage("Tâm xoáy không được sát mép bàn.");
      return setWhirlAim({ ...whirlAim, center: pos });
    }
    if (aim && needsCell(aim.skill)) return fire(undefined, pos);
    if (selected && isAdjacent(selected, pos)) {
      const from = selected;
      setSelected(null);
      void play({ type: "swap", from, to: pos });
      return;
    }
    setSelected(selected && selected.row === pos.row && selected.col === pos.col ? null : pos);
  };

  const spin = (turns: number) => {
    if (!whirlAim?.center || Math.abs(turns) > whirlAim.max) return;
    const whirl: Whirl = { center: whirlAim.center, turns };
    const skill = whirlAim.skill;
    setWhirlAim(null);
    if (!skill) void play({ type: "whirl", whirl });
    else cast(skill, whirl);
  };

  const freeWhirl = myTurn && canFreeWhirl(state);
  const targetNames = aim && state.sides[aim.skill.target === "ally" || aim.skill.target === "team" ? state.turn.side : 1 - state.turn.side]!.fighters;
  const result = view.result;

  return (
    <div className="flex flex-col gap-4">
      <OrnateFrame level="raised" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="ui-title-on-wood text-xl font-bold" role="status" aria-live="polite">
            {over
              ? view.winner === mySide
                ? "Chúa công thắng!"
                : view.winner === null
                  ? "Trận bị hủy"
                  : "Chúa công thua"
              : view.you.left
                ? "Tướng của bạn do máy điều khiển"
                : myTurn
                  ? state.turn.extra
                    ? "Lượt thêm của bạn"
                    : "Lượt của bạn"
                  : team
                    ? state.turn.side === mySide
                      ? `Lượt của ${seatTag(mySide, state.turn.actor)} (đồng đội)`
                      : `${seatTag(foeSide, state.turn.actor)} đang đánh`
                    : "Đối thủ đang đánh"}
          </p>
          {!over && (
            <p className={`text-lg font-bold tabular-nums ${myTurn && remaining !== null && remaining <= 10 ? "text-danger" : "text-title-on-wood"}`} aria-label="Thời gian còn lại của lượt">
              {remaining ?? "–"} giây
            </p>
          )}
        </div>
        {view.friendly && <p className="text-caption text-on-wood-soft">Giao hữu: không tính điểm hạng, không có vàng.</p>}
        {message && <Alert role="alert">{message}</Alert>}

        <div className={team ? "grid gap-2 md:grid-cols-3" : ""}>
          {foe.fighters.map((f, i) => (
            <FighterPanel key={i} f={f} rage={foe.rages?.[i] ?? foe.rage} showRage={foe.rages ? true : i === foe.leader} mine={false} active={!over && state.turn.side === foeSide && state.turn.actor === i} tag={team ? seatTag(foeSide, i) : undefined} />
          ))}
        </div>

        <div className="mx-auto w-full max-w-[34rem]">
          <div
            role="grid"
            aria-label="Bàn cờ"
            className="grid gap-0.5 rounded bg-wood-inset p-1"
            style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))` }}
          >
            {board.cells.map((tile, i) => {
              const pos = { row: Math.floor(i / board.cols), col: i % board.cols };
              const sel = selected && selected.row === pos.row && selected.col === pos.col;
              const center = whirlAim?.center && whirlAim.center.row === pos.row && whirlAim.center.col === pos.col;
              return (
                <div role="gridcell" key={i} className="contents">
                  <button
                    type="button"
                    disabled={!myTurn || busy || !tile}
                    aria-label={`Hàng ${pos.row + 1}, cột ${pos.col + 1}`}
                    aria-pressed={!!sel}
                    onClick={() => onCell(pos)}
                    className={`aspect-square rounded p-0.5 focus-visible:outline-2 focus-visible:outline-frame-gold ${sel || center ? "ring-2 ring-frame-gold-hi" : ""} ${myTurn ? "" : "opacity-80"}`}
                  >
                    {tile && <TileArt kind={tile.kind} {...(tile.special ? { special: tile.special } : {})} className="size-full" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={team ? "grid gap-2 md:grid-cols-3" : ""}>
          {own.fighters.map((f, i) => (
            <FighterPanel key={i} f={f} rage={own.rages?.[i] ?? own.rage} showRage={own.rages ? true : i === own.leader} mine active={!over && state.turn.side === mySide && state.turn.actor === i} tag={team ? seatTag(mySide, i) : undefined} />
          ))}
        </div>
        {captainPick.length > 1 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chọn người hành động">
            <span className="text-sm text-on-wood-soft">Đội trưởng chọn người đánh lượt này:</span>
            {captainPick.map((i) => (
              <ChoiceChip key={i} selected={state.turn.actor === i} size="sm" disabled={busy} onClick={() => void play({ type: "selectActor", fighter: i })}>
                {own.fighters[i]?.name} ({seatTag(mySide, i)})
              </ChoiceChip>
            ))}
          </div>
        )}

        {lines.length > 0 && (
          <FrameInset className="flex flex-col gap-1 p-3">
            <h3 className="text-sm font-bold text-frame-gold">Diễn biến</h3>
            <ol className="flex flex-col gap-0.5 text-caption text-on-wood-soft" aria-label="Diễn biến trận">
              {lines.map((l) => (
                <li key={l.id}>{l.text}</li>
              ))}
            </ol>
          </FrameInset>
        )}
        {aim?.choose && targetNames && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chọn mục tiêu">
            <span className="text-sm text-on-wood-soft">Chọn mục tiêu:</span>
            {skillTargetOptions(state, aim.skill).map((t) => (
              <ChoiceChip key={t} selected={aim.target === t} size="sm" onClick={() => fire(t)}>
                {targetNames[t]?.name ?? `Vị trí ${t + 1}`}
              </ChoiceChip>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setAim(null)}>
              Bỏ chọn
            </Button>
          </div>
        )}
        {whirlAim && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Xoáy ô">
            <span className="text-sm text-on-wood-soft">{whirlAim.center ? "Xoay theo chiều:" : "Chọn tâm xoáy trên bàn cờ."}</span>
            {whirlAim.center &&
              Array.from({ length: whirlAim.max * 2 + 1 }, (_, k) => k - whirlAim.max)
                .filter((n) => n !== 0)
                .map((n) => (
                  <Button key={n} size="sm" variant="secondary" onClick={() => spin(n)}>
                    {n > 0 ? `Theo kim đồng hồ ${n}` : `Ngược kim đồng hồ ${-n}`}
                  </Button>
                ))}
            <Button variant="secondary" size="sm" onClick={() => setWhirlAim(null)}>
              Bỏ chọn
            </Button>
          </div>
        )}
        {myTurn && (
          <div className="flex flex-col gap-2" aria-label="Kỹ năng">
            <p className="text-sm text-on-wood-soft">
              Kỹ năng của {actor.name} (năng lượng {actor.energy}). Chạm hai ô liền nhau trên bàn cờ để đổi chỗ.
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((def) => {
                const cost = comboSkillCost(actor, def);
                return (
                  <Button
                    key={def.id}
                    size="sm"
                    variant={aim?.skill.id === def.id || whirlAim?.skill?.id === def.id ? "primary" : "secondary"}
                    disabled={busy || state.turn.skillUsed || actor.energy < cost}
                    title={skillText(def)}
                    onClick={() => pickSkill(def)}
                  >
                    {def.name} · {cost}
                  </Button>
                );
              })}
              {freeWhirl && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => setWhirlAim({ skill: null, max: PASSIVE.phongFreeWhirlTurns, center: null })}>
                  Xoáy miễn phí
                </Button>
              )}
            </div>
          </div>
        )}
        {view.you.streak > 0 && !over && <p className="text-sm text-warning">Bạn đã bỏ {view.you.streak} lượt liên tiếp. Bỏ thêm sẽ bị coi là phá trận và không được tính điểm.</p>}
      </OrnateFrame>

      {over && (
        <OrnateFrame level="raised" className="flex flex-col items-center gap-2 text-center" role="status">
          <h3 className="ui-title-on-wood text-2xl font-bold">{view.winner === null ? "Trận bị hủy" : view.winner === mySide ? "Chúa công thắng!" : "Chúa công thua"}</h3>
          {view.friendly ? (
            <p>Trận giao hữu nên không đổi điểm hạng và không có vàng.</p>
          ) : result ? (
            <p>
              {result.counted
                ? `Điểm ${result.before} → ${result.after} (${result.delta >= 0 ? "+" : ""}${result.delta}).${result.gold > 0 ? ` Thưởng ${result.gold} vàng.` : " Trận này không có vàng (đã đủ trần vàng hôm nay, hoặc đã đấu quá nhiều trận với cùng một người)."}`
                : result.left
                  ? "Tướng của bạn đã do máy điều khiển nên trận này không đổi điểm."
                  : "Bạn bị tính phá trận nên trận này không đổi điểm."}
            </p>
          ) : view.winner === null ? (
            <p>Cả hai bên mất kết nối quá lâu nên trận bị hủy, không ai đổi điểm.</p>
          ) : (
            <p>Đang tính điểm…</p>
          )}
          {result?.warned && <Alert role="alert">Bạn bị cảnh cáo phá trận. Lần sau trong tuần này bạn sẽ bị hạn chế ghép trận.</Alert>}
          {result?.banUntil && <Alert role="alert">Bạn bị hạn chế ghép trận vì phá trận, được ghép lại sau {clockTime(result.banUntil)}.</Alert>}
          <Button size="lg" onClick={onExit}>
            Về sảnh
          </Button>
        </OrnateFrame>
      )}
    </div>
  );
}
