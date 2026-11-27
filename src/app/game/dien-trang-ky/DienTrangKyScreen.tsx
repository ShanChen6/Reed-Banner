"use client";

// Điền Trang Ký (Shan chốt 27/11/2026): kiểu cờ tỷ phú trên đất mười hai sứ quân. Ba cách chơi:
// - Đấu sứ quân có thưởng: một người với 1–3 sứ quân máy, máy chủ làm trọng tài, vàng theo hạng.
// - Cùng máy: 2–4 ghế, mỗi ghế là người ngồi chung máy hoặc sứ quân máy; trình duyệt tự chạy luật, lưu ván dở, không thưởng.
// - Phòng mã: 2–4 người qua mã 6 ký tự, chủ phòng thêm sứ quân máy vào ghế trống.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ELEMENTS, type Element } from "@/core";
import { DTK_GOLD, DTK_REWARDS_PER_DAY, MAX_PLAYERS, act, chooseAction, newDtk, resign, type DtkAction, type DtkState, type Seat } from "@/core/dien-trang-ky";
import { Button, ChoiceChip, Input } from "@/components/ui";
import { ModeBanner, ModeScreen, OrnateFrame, ResultModal, SurrenderButton } from "@/components/game-ui";
import { Portrait } from "../art/portraits";
import { readStorage, writeStorage } from "../formation/storage";
import { ModeGuideTabs } from "../ModeGuide";
import { MODE_TEXT } from "../modeInfo";
import { PlayCard } from "../PlayCard";
import { Options, freshSeed } from "../tam-quan-ky/parts";
import { ElementPicker } from "../vay-thanh-ky/parts";
import { DTK_RIVALS, DTK_RIVAL_INFO } from "./rivals";
import { Table } from "./Table";
import { SERVER_ERROR, savedServerKind, useServerMatch, type DtkView } from "./useServerMatch";

type PlayMode = "reward" | "local" | "room";

const LOCAL_KEY = "reed-banner:dien-trang-ky:local:v1";
const BOT_DELAY_MS = 650;

function readLocal(): DtkState | null {
  try {
    const v = JSON.parse(readStorage(LOCAL_KEY) ?? "null") as DtkState | null;
    return v && v.v === 1 && Array.isArray(v.players) && Array.isArray(v.plots) ? v : null;
  } catch {
    return null;
  }
}

function RivalsPicker({ value, onChange, max, label = "Sứ quân cùng chơi" }: { value: readonly string[]; onChange: (v: string[]) => void; max: number; label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="ui-title-on-wood font-bold">{label} <span className="text-caption font-normal text-on-wood-soft">({value.length}/{max})</span></h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label={label}>
        {DTK_RIVALS.map((r) => {
          const on = value.includes(r.id);
          return (
            <ChoiceChip
              key={r.id}
              selected={on}
              size="md"
              disabled={!on && value.length >= max}
              onClick={() => onChange(on ? value.filter((x) => x !== r.id) : [...value, r.id])}
              className="justify-start text-left"
            >
              <Portrait id={r.id} element={r.element} profession={r.profession} className="size-9 shrink-0" />
              <span className="flex flex-col">
                <span>{r.name}</span>
                <span className="text-caption font-normal opacity-80">{r.style}: {r.summary}</span>
              </span>
            </ChoiceChip>
          );
        })}
      </div>
    </div>
  );
}

function Ranking({ state, you, gold }: { state: DtkState; you?: number; gold?: readonly number[] }) {
  return (
    <ol className="flex flex-col gap-1">
      {(state.ranking ?? []).map((seat, rank) => (
        <li key={seat} className={you === seat ? "font-semibold" : undefined}>
          Hạng {rank + 1}: {state.players[seat]!.name}{you === seat ? " (bạn)" : ""}
          {gold && gold[rank] ? `, ${gold[rank]} vàng` : ""}
        </li>
      ))}
    </ol>
  );
}

// ---------- cùng máy ----------

function LocalPlay({ modePicker }: { modePicker: ReactNode }) {
  const [state, setState] = useState<DtkState | null>(null);
  const [humans, setHumans] = useState(1);
  const [element, setElement] = useState<Element>("hoa");
  const [rivals, setRivals] = useState<string[]>(["tranLam", "phamBachHo"]);
  const [dismissed, setDismissed] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- nạp ván dở từ trình duyệt một lần khi mở màn
    setState(readLocal());
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) writeStorage(LOCAL_KEY, state ? JSON.stringify(state) : null);
  }, [state]);

  const bot = state && state.phase.k !== "ended" ? state.players[state.turn]!.bot : null;
  useEffect(() => {
    if (!state || !bot) return;
    const timer = window.setTimeout(() => {
      setState((cur) => {
        if (!cur || cur.phase.k === "ended" || !cur.players[cur.turn]!.bot) return cur;
        const r = act(cur, cur.turn, chooseAction(cur));
        return r.ok ? r.state : cur;
      });
    }, BOT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, bot]);

  const onAction = useCallback((a: DtkAction) => {
    setState((cur) => {
      if (!cur) return cur;
      const r = act(cur, cur.turn, a);
      return r.ok ? r.state : cur;
    });
  }, []);

  const maxRivals = MAX_PLAYERS - humans;
  const total = humans + Math.min(rivals.length, maxRivals);
  const start = () => {
    const taken: Element[] = [];
    const pick = (want: Element) => {
      const e = taken.includes(want) ? ELEMENTS.find((x) => !taken.includes(x))! : want;
      taken.push(e);
      return e;
    };
    const seats: Seat[] = [];
    for (let i = 0; i < humans; i++) seats.push({ name: humans === 1 ? "Bạn" : `Người ${i + 1}`, element: pick(i === 0 ? element : ELEMENTS[(ELEMENTS.indexOf(element) + i * 2) % ELEMENTS.length]!), bot: null });
    for (const id of rivals.slice(0, maxRivals)) {
      const r = DTK_RIVAL_INFO[id]!;
      seats.push({ name: r.name, element: pick(r.element), bot: id });
    }
    setDismissed(false);
    setState(newDtk({ seats, seed: freshSeed() }));
  };

  if (!state) {
    return (
      <section className="ui-frame flex flex-col gap-4 p-4" aria-label="Chuẩn bị ván">
        {modePicker}
        <Options label="Số người ngồi chung máy" value={humans} onChange={setHumans} options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n} người` }))} />
        <ElementPicker label={humans === 1 ? "Hệ của bạn (kiểu và màu nhà)" : "Hệ của người thứ nhất (kiểu và màu nhà)"} value={element} onChange={setElement} />
        {maxRivals > 0 && <RivalsPicker value={rivals.slice(0, maxRivals)} onChange={setRivals} max={maxRivals} />}
        <Button disabled={total < 2} onClick={start}>{total < 2 ? "Cần ít nhất hai ghế" : `Vào ván ${total} người`}</Button>
      </section>
    );
  }

  const ended = state.phase.k === "ended";
  const winner = ended ? state.players[state.ranking![0]!]! : null;
  return (
    <PlayCard className="sm:mt-5">
      <OrnateFrame aria-label="Vùng chơi" flush className="p-2 sm:p-4">
        <Table
          state={state}
          controls={(seat) => !state.players[seat]!.bot}
          onAction={onAction}
          toolbar={
            <>
              {!ended && !bot && (
                <SurrenderButton
                  label="Rời ván"
                  consequence={`${state.players[state.turn]!.name} rời ván, đất về trống.`}
                  onConfirm={() =>
                    setState((cur) => {
                      if (!cur) return cur;
                      const r = resign(cur, cur.turn);
                      return r.ok ? r.state : cur;
                    })
                  }
                />
              )}
              <Button variant="secondary" size="sm" onClick={() => setState(null)}>Ván mới</Button>
            </>
          }
        />
        {ended && winner && (
          <ResultModal
            open={!dismissed}
            tone={winner.bot ? "lose" : "win"}
            kicker="Điền Trang Ký"
            title={`${winner.name} thành phú hộ`}
            onDismiss={() => setDismissed(true)}
            actions={
              <>
                <Button size="lg" autoFocus onClick={() => setState(null)}>Ván mới</Button>
                <Button size="lg" variant="secondary" onClick={() => setDismissed(true)}>Xem lại bàn</Button>
              </>
            }
          >
            <Ranking state={state} />
            <p className="mt-2 text-caption">Ván cùng máy là giao hữu, không có vàng.</p>
          </ResultModal>
        )}
      </OrnateFrame>
    </PlayCard>
  );
}

// ---------- máy chủ ----------

function ServerPlay({ kind, modePicker }: { kind: "reward" | "room"; modePicker: ReactNode }) {
  const m = useServerMatch();
  const [element, setElement] = useState<Element>("hoa");
  const [rivals, setRivals] = useState<string[]>(["tranLam", "phamBachHo", "nguyenKhoan"]);
  const [code, setCode] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const v = m.view;
  const err = m.error ? (SERVER_ERROR[m.error] ?? SERVER_ERROR.network) : null;
  const errorLine = err && <p role="alert" className="text-caption text-[var(--danger,#e57373)]">{err}</p>;

  if (!v || v.you < 0) {
    return (
      <section className="ui-frame flex flex-col gap-4 p-4" aria-label="Chuẩn bị ván">
        {modePicker}
        <ElementPicker label="Hệ của bạn (kiểu và màu nhà)" value={element} onChange={setElement} />
        {kind === "reward" ? (
          <>
            <RivalsPicker value={rivals} onChange={setRivals} max={MAX_PLAYERS - 1} />
            <p className="text-caption text-on-wood-soft">
              Vàng theo hạng: ván 2 người {DTK_GOLD[2]![0]} vàng cho hạng nhất; 3 người {DTK_GOLD[3]!.slice(0, 2).join(" và ")}; 4 người {DTK_GOLD[4]!.slice(0, 3).join(", ")} cho ba hạng đầu. Tối đa {DTK_REWARDS_PER_DAY} ván có vàng mỗi ngày.
            </p>
            <Button disabled={m.busy || rivals.length < 1} onClick={() => { setDismissed(false); void m.startAi(element, rivals); }}>
              {rivals.length < 1 ? "Chọn ít nhất một sứ quân" : `Vào ván với ${rivals.length} sứ quân`}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <Button disabled={m.busy} onClick={() => { setDismissed(false); void m.host(element); }}>Mở phòng</Button>
              <span className="text-caption text-on-wood-soft">hoặc</span>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Mã phòng" maxLength={6} className="w-32" aria-label="Mã phòng" />
              <Button variant="secondary" disabled={m.busy || code.trim().length < 4} onClick={() => { setDismissed(false); void m.join(code.trim(), element); }}>Vào phòng</Button>
            </div>
            <p className="text-caption text-on-wood-soft">Phòng 2–4 ghế. Chủ phòng gửi mã cho bạn bè, thêm sứ quân máy vào ghế trống rồi khai cuộc. Mỗi quyết định có 30 giây, quá giờ máy đi thay.</p>
          </>
        )}
        {errorLine}
      </section>
    );
  }

  if (v.status === "waiting" || !v.state) return <Lobby v={v} m={m} errorLine={errorLine} />;

  const state = v.state;
  const ended = state.phase.k === "ended";
  const rank = state.ranking?.indexOf(v.you) ?? -1;
  const turnSeat = state.turn;
  const status = ended
    ? null
    : turnSeat === v.you
      ? m.turnLeft !== null ? `Còn ${Math.ceil(m.turnLeft / 1000)} giây.` : null
      : `Chờ ${state.players[turnSeat]!.name}${m.turnLeft !== null ? `, còn ${Math.ceil(m.turnLeft / 1000)} giây` : ""}.`;
  const newGame = () => {
    m.leave();
    setDismissed(false);
  };
  return (
    <PlayCard className="sm:mt-5">
      <OrnateFrame aria-label="Vùng chơi" flush className="p-2 sm:p-4">
        <Table
          state={state}
          me={v.you}
          controls={(seat) => seat === v.you}
          onAction={(a) => void m.act(a)}
          busy={m.busy}
          status={<>{status}{errorLine}</>}
          toolbar={
            <>
              {!ended && !state.players[v.you]!.out && (
                <SurrenderButton label="Rời ván" consequence="Bạn rời ván như phá sản, đất về trống, hạng tính theo lúc rời." onConfirm={() => void m.resign()} />
              )}
              {(ended || state.players[v.you]!.out) && <Button variant="secondary" size="sm" onClick={newGame}>Ván mới</Button>}
            </>
          }
        />
        {ended && (
          <ResultModal
            open={!dismissed}
            tone={rank === 0 ? "win" : "lose"}
            kicker="Điền Trang Ký"
            title={rank === 0 ? "Bạn thành phú hộ!" : `Bạn đứng hạng ${rank + 1}`}
            onDismiss={() => setDismissed(true)}
            actions={
              <>
                <Button size="lg" autoFocus onClick={newGame}>Ván mới</Button>
                <Button size="lg" variant="secondary" onClick={() => setDismissed(true)}>Xem lại bàn</Button>
              </>
            }
          >
            <Ranking state={state} you={v.you} gold={DTK_GOLD[state.players.length]} />
            <p className="mt-2">
              {v.reward ? `Bạn nhận ${v.reward} vàng.` : v.rewardCapped ? `Hôm nay đã đủ ${DTK_REWARDS_PER_DAY} ván có vàng, ván này không cộng thêm.` : "Hạng này không có vàng."}
            </p>
          </ResultModal>
        )}
      </OrnateFrame>
    </PlayCard>
  );
}

function Lobby({ v, m, errorLine }: { v: DtkView; m: ReturnType<typeof useServerMatch>; errorLine: ReactNode }) {
  const used = new Set(v.seats.map((s) => s.bot).filter(Boolean));
  const free = DTK_RIVALS.filter((r) => !used.has(r.id));
  const room = v.seats.length < MAX_PLAYERS;
  return (
    <section className="ui-frame flex flex-col gap-4 p-4" aria-label="Phòng chờ">
      <div>
        <p className="text-caption text-on-wood-soft">Mã phòng</p>
        <p className="font-mono text-3xl font-bold tracking-[0.3em] text-frame-gold">{v.code}</p>
        <p className="text-caption text-on-wood-soft">{v.host ? "Gửi mã này cho bạn bè để họ vào phòng." : "Chờ chủ phòng khai cuộc."}</p>
      </div>
      <ul className="flex flex-col gap-1.5" aria-label="Ghế trong phòng">
        {v.seats.map((s, i) => {
          const info = s.bot ? DTK_RIVAL_INFO[s.bot] : null;
          return (
            <li key={i} className="ui-frame-inset flex items-center gap-2 p-2">
              {info && <Portrait id={info.id} element={info.element} profession={info.profession} className="size-8 shrink-0" />}
              <span className="flex-1 text-on-wood">{s.name}{i === v.you ? " (bạn)" : ""}{i === 0 ? ", chủ phòng" : ""}{info ? `, máy ${info.style}` : ""}</span>
              {v.host && i > 0 && <Button size="sm" variant="secondary" disabled={m.busy} onClick={() => void m.removeSeat(i)}>Mời ra</Button>}
            </li>
          );
        })}
      </ul>
      {v.host && room && (
        <div className="flex flex-col gap-2">
          <h2 className="ui-title-on-wood font-bold">Thêm sứ quân máy vào ghế trống</h2>
          <div className="flex flex-wrap gap-2">
            {free.map((r) => (
              <ChoiceChip key={r.id} selected={false} size="md" disabled={m.busy} onClick={() => void m.addBot(r.id)}>
                <Portrait id={r.id} element={r.element} profession={r.profession} className="size-7 shrink-0" />
                {r.name}
              </ChoiceChip>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {v.host && <Button disabled={m.busy || v.seats.length < 2} onClick={() => void m.start()}>{v.seats.length < 2 ? "Cần ít nhất hai ghế" : `Khai cuộc ${v.seats.length} người`}</Button>}
        <Button variant="secondary" disabled={m.busy} onClick={() => void m.resign().then(() => m.leave())}>{v.host ? "Đóng phòng" : "Rời phòng"}</Button>
      </div>
      {errorLine}
    </section>
  );
}

export default function DienTrangKyScreen() {
  const [mode, setMode] = useState<PlayMode>("reward");
  useEffect(() => {
    const server = savedServerKind();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mở đúng cách chơi của ván dở khi tải lại trang
    if (server) setMode(server === "room" ? "room" : "reward");
    else if (readLocal()) setMode("local");
  }, []);
  const modePicker = (
    <Options label="Cách chơi" value={mode} onChange={setMode}
      options={[
        { value: "reward", label: "Đấu sứ quân có thưởng" },
        { value: "local", label: "Cùng máy" },
        { value: "room", label: "Phòng mã" },
      ]} />
  );
  return (
    <ModeScreen card label="Điền Trang Ký">
      <ModeBanner
        title="Điền Trang Ký"
        kicker="Phú hộ, bản thử"
        description={MODE_TEXT.DIEN_TRANG_KY}
        stats={[{ label: "Cách chơi", value: mode === "reward" ? "Sứ quân" : mode === "local" ? "Cùng máy" : "Phòng mã" }]}
      />
      <ModeGuideTabs scene="DIEN_TRANG_KY">
        {mode === "local" ? <LocalPlay modePicker={modePicker} /> : <ServerPlay key={mode} kind={mode} modePicker={modePicker} />}
      </ModeGuideTabs>
    </ModeScreen>
  );
}
