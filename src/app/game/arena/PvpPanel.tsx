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
  PASSIVE,
  skillTargetOptions,
  whirlStep,
  type BattleAction,
  type BattleState,
  type Fighter,
  type Pos,
  type SkillDef,
  type Whirl,
} from "@/core";
import type { PvpMatchView, PvpOverview } from "@/server/pvp";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { FrameInset, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { ElementIcon } from "../art/icons";
import { TileArt } from "../art/tiles";
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
  return { available: true, busy: !!o.matchId || !!o.queue };
}

const ERROR_NAME: Record<string, string> = {
  network: "Mất kết nối tới máy chủ. Hãy kiểm tra mạng, ván vẫn chạy trong lúc bạn tải lại.",
  inMatch: "Bạn đang có một trận dở. Hãy vào lại trận đó.",
  badFormat: "Thể thức này chưa mở.",
  conflict: "Máy chủ đang bận, hãy thử lại.",
  notYourTurn: "Chưa đến lượt bạn.",
  notCaptain: "Chỉ đội trưởng mới đổi được người hành động.",
  left: "Bạn đã mất kết nối quá lâu, tướng của bạn do máy điều khiển.",
  battleOver: "Trận đã kết thúc.",
  rejected: "Nước đi không hợp lệ.",
  badAction: "Nước đi không hợp lệ.",
  notFound: "Không tìm thấy trận này.",
};

const errorText = (data: Json): string => {
  const detail = typeof data.detail === "string" ? data.detail : "";
  if (detail in ERROR_TEXT) return ERROR_TEXT[detail as keyof typeof ERROR_TEXT];
  return ERROR_NAME[String(data.error)] ?? "Có lỗi xảy ra, hãy thử lại.";
};

export default function PvpPanel({ onBusyChange }: { onBusyChange?: (busy: boolean) => void }) {
  const [overview, setOverview] = useState<PvpOverview | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const r = await call("/api/pvp");
    if (r.status === 200) {
      const o = r.data as unknown as PvpOverview;
      setOverview(o);
      setMatchId((cur) => cur ?? o.matchId);
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
    onBusyChange?.(!!matchId || !!overview?.queue);
  }, [matchId, overview?.queue, onBusyChange]);

  const queue = async () => {
    setBusy(true);
    const r = await call("/api/pvp", { action: "queue", format: "duel" });
    setBusy(false);
    if (r.status === 200) {
      setMessage("");
      const o = r.data as unknown as PvpOverview;
      setOverview(o);
      if (o.matchId) setMatchId(o.matchId);
    } else setMessage(errorText(r.data));
  };

  const leave = async () => {
    setBusy(true);
    const r = await call("/api/pvp", { action: "leave" });
    setBusy(false);
    if (r.status === 200) setOverview(r.data as unknown as PvpOverview);
  };

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
    <OrnateFrame level="raised" className="flex flex-col gap-4">
      <SectionTitle description="Đấu 1vs1 với người khác, mỗi bên chỉ có Đinh Bộ Lĩnh. Điểm hạng riêng cho Đấu người, thắng tăng, thua giảm.">
        Đấu người
      </SectionTitle>
      {message && <Alert role="alert">{message}</Alert>}
      <div className="grid grid-cols-3 gap-2 text-center" aria-label="Thành tích Đấu người">
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
      </div>
      {o?.queue ? (
        <div role="status" aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-on-wood">
            Đang tìm đối thủ có điểm gần bạn… đã chờ {Math.floor(o.queue.waitedMs / 1000)} giây. Hãy để trang này mở.
          </p>
          <Button variant="secondary" disabled={busy} onClick={() => void leave()}>
            Rời hàng đợi
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={busy || !o} onClick={() => void queue()}>
            Tìm đối thủ
          </Button>
          <p className="text-sm text-on-wood-soft">
            Mỗi lượt 30 giây. Bỏ lượt liên tục là phá trận và không được tính điểm; mất mạng được tha 3 lần mỗi ngày.
          </p>
        </div>
      )}
    </OrnateFrame>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const toState = (v: PvpMatchView): BattleState => ({ ...v.battle, boardRng: 0, aiRng: 0 }) as BattleState;

function Bar({ value, max, label, tone }: { value: number; max: number; label: string; tone: "hp" | "energy" | "rage" }) {
  const pct = Math.max(0, Math.min(100, max <= 0 ? 0 : (value / max) * 100));
  const color = tone === "hp" ? "bg-stat-hp" : tone === "energy" ? "bg-stat-energy" : "bg-stat-rage";
  return (
    <div className="flex items-center gap-2 text-caption">
      <span className="w-14 shrink-0 text-on-wood-soft">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded bg-wood-inset" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right tabular-nums">
        {Math.round(value)}/{Math.round(max)}
      </span>
    </div>
  );
}

function FighterPanel({ f, rage, mine, active }: { f: Fighter; rage: number; mine: boolean; active: boolean }) {
  return (
    <FrameInset className={`flex flex-col gap-1.5 p-3 ${active ? "ring-2 ring-frame-gold" : ""}`}>
      <div className="flex items-center gap-2">
        <ElementIcon element={f.element} className="size-5" />
        <p className="font-semibold">
          {f.name}
          <span className="ml-2 text-caption font-normal text-on-wood-soft">
            {mine ? "Bạn" : "Đối thủ"} · {PROFESSION_NAME[f.profession as keyof typeof PROFESSION_NAME] ?? f.profession} · {ELEMENT_NAME[f.element]}
            {f.level ? ` · cấp ${f.level}` : ""}
          </span>
        </p>
      </div>
      <Bar value={f.hp} max={f.maxHp} label="Máu" tone="hp" />
      <Bar value={f.energy} max={100} label="Năng lượng" tone="energy" />
      <Bar value={rage} max={100} label="Nộ" tone="rage" />
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
                  : "Đối thủ đang đánh"}
          </p>
          {!over && (
            <p className={`text-lg font-bold tabular-nums ${myTurn && remaining !== null && remaining <= 10 ? "text-danger" : "text-title-on-wood"}`} aria-label="Thời gian còn lại của lượt">
              {remaining ?? "–"} giây
            </p>
          )}
        </div>
        {message && <Alert role="alert">{message}</Alert>}

        <FighterPanel f={foe.fighters[0] as Fighter} rage={foe.rage} mine={false} active={!myTurn && !over} />

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

        <FighterPanel f={own.fighters[0] as Fighter} rage={own.rage} mine active={myTurn} />

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
          {result ? (
            <p>
              {result.counted
                ? `Điểm ${result.before} → ${result.after} (${result.delta >= 0 ? "+" : ""}${result.delta}).`
                : result.left
                  ? "Tướng của bạn đã do máy điều khiển nên trận này không đổi điểm."
                  : "Bạn bị tính phá trận nên trận này không đổi điểm."}
            </p>
          ) : view.winner === null ? (
            <p>Cả hai bên mất kết nối quá lâu nên trận bị hủy, không ai đổi điểm.</p>
          ) : (
            <p>Đang tính điểm…</p>
          )}
          <Button size="lg" onClick={onExit}>
            Về sảnh
          </Button>
        </OrnateFrame>
      )}
    </div>
  );
}
