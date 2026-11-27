"use client";

// Một ván Điền Trang Ký đang chơi: bàn, khung người chơi, nút theo bước hiện tại, nhật ký. Dùng chung cho ván cùng máy
// (trình duyệt tự chạy luật) và ván trên máy chủ (gửi lệnh lên /api/tycoon).

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BOAT_FARE,
  DTK_COLORS,
  FAIR_RATE,
  colorHex,
  colorOf,
  disasterTargets,
  REGION_TILES,
  JAIL_BAIL,
  JAIL_TRIES,
  SCENIC_RENT,
  LEVEL_NAME,
  MAX_LEVEL_ON_BUY,
  TILES,
  assetsOf,
  buildCostBetween,
  freeLands,
  holdsRegion,
  isScenic,
  levelCap,
  ownedTiles,
  priceOf,
  rentOf,
  scenicCount,
  type DtkAction,
  type DtkState,
} from "@/core/dien-trang-ky";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME } from "../battle/labels";
import { Board, Token, regionName } from "./Board";
import { usePlayback } from "./usePlayback";
import { DTK_RIVAL_INFO } from "./rivals";
import { eventText, money, tileName } from "./text";

export interface TableProps {
  readonly state: DtkState;
  /** Ghế nào người xem được ra lệnh (cùng máy: mọi ghế người; máy chủ: ghế của mình). */
  readonly controls: (seat: number) => boolean;
  readonly onAction: (a: DtkAction) => void;
  readonly busy?: boolean;
  /** Ghi chú cạnh nút (đồng hồ, chờ người khác…). */
  readonly status?: ReactNode;
  readonly toolbar?: ReactNode;
  /** Ghế của người xem để tô đậm khung (máy chủ). */
  readonly me?: number;
  /** Báo khi bắt đầu hoặc diễn xong hoạt ảnh (máy cùng máy chờ diễn xong mới đi). */
  readonly onPlaying?: (playing: boolean) => void;
}

const PAPER = "#f6efe0";

const Dice = ({ n, tilt = 0 }: { n: number; tilt?: number }) => {
  const pips: Record<number, [number, number][]> = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]],
  };
  return (
    <svg viewBox="0 0 4 4" className="size-[clamp(22px,6vw,44px)] rounded-lg shadow transition-transform duration-75" style={{ background: PAPER, transform: tilt ? `rotate(${tilt}deg) translateY(-3px)` : undefined }} role="img" aria-label={`${n} chấm`}>
      {pips[n]!.map(([r, c], i) => (
        <circle key={i} cx={c} cy={r} r={0.38} fill={n === 1 || n === 4 ? "#b3261e" : "#2b1d10"} />
      ))}
    </svg>
  );
};

function TileInfo({ state, tile }: { state: DtkState; tile: number }) {
  const t = TILES[tile]!;
  if (t.kind === "scenic") {
    const plot = state.plots[tile]!;
    const owner = plot.owner !== null ? state.players[plot.owner]! : null;
    return (
      <p className="text-caption text-on-wood-soft">
        <b className="text-on-wood">{t.name}</b>, danh thắng, giá {money(t.price)}{state.fairs?.includes(tile) ? ", có lễ hội nhỏ" : ""}. Không xây nhà; tô theo số danh thắng cùng chủ ({SCENIC_RENT.slice(1).join(", ")} quan).{" "}
        {owner ? `Của ${owner.name}, giữ ${scenicCount(state, plot.owner!)} danh thắng. Tô hiện tại ${money(rentOf(state, tile))}.` : "Còn trống."}
      </p>
    );
  }
  if (t.kind !== "land") return <p className="text-caption text-on-wood-soft"><b className="text-on-wood">{t.name}</b>. {SPECIAL_HELP[t.kind]}</p>;
  const plot = state.plots[tile]!;
  const owner = plot.owner !== null ? state.players[plot.owner]! : null;
  return (
    <p className="text-caption text-on-wood-soft">
      <b className="text-on-wood">{t.name}</b>, dãy {regionName(t.region)} ({REGION_TILES[t.region]!.length} ô), giá {money(t.price)}.{" "}
      {owner
        ? `Của ${owner.name}, ${LEVEL_NAME[plot.level]}${holdsRegion(state, tile, plot.owner!) ? ", hùng cứ" : ""}. Tô hiện tại ${money(rentOf(state, tile))}.`
        : "Còn trống."}
      {state.fairs?.includes(tile) ? ` Có lễ hội nhỏ suốt ván, tô nhân ${FAIR_RATE.toLocaleString("vi-VN")}.` : ""}
      {(plot.ruin ?? 0) > 0 ? ` Nhà đang sửa sau thiên tai, chưa thu tô (còn ${plot.ruin} lượt).` : ""}
      {state.festival === tile ? " Đang mở Hội Cờ Lau." : ""}
    </p>
  );
}

const SPECIAL_HELP = {
  start: "Đi qua nhận lương vòng.",
  boat: `Trả ${BOAT_FARE} quan tiền đò để tới một ô bất kỳ.`,
  festival: "Mở hội trên một ô đất của mình: tô ô đó gấp đôi tới khi mở hội nơi khác.",
  jail: `Bị giam: mỗi lượt đổ thử, ra đôi thì ra; hoặc nộp ${JAIL_BAIL} quan chuộc ra ngay. Đổ hỏng ${JAIL_TRIES} lần thì cũng được ra.`,
  omen: "Rút một quẻ thời loạn.",
  poll: "Nộp một phần mười tiền mặt.",
  tribute: "Nộp cống theo số bậc nhà đang có.",
  market: "Được mua một ô đất trống bất kỳ theo giá gốc.",
} as const;

export function Table({ state, controls, onAction, busy = false, status, toolbar, me, onPlaying }: TableProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const pb = usePlayback(state);
  useEffect(() => onPlaying?.(pb.playing), [pb.playing, onPlaying]);
  const ph = state.phase;
  const seat = state.turn;
  const p = state.players[seat]!;
  const mine = ph.k !== "ended" && controls(seat);
  const can = mine && !busy && !pb.playing;

  const pickable = useMemo(() => {
    if (!mine || pb.playing) return undefined;
    if (ph.k === "pick") {
      if (ph.what === "market") return new Set(freeLands(state).filter((i) => priceOf(i) <= p.cash));
      if (ph.what === "festival") return new Set(ownedTiles(state, seat));
      if (ph.what === "quake" || ph.what === "storm") return new Set(disasterTargets(state, seat, ph.what));
      return new Set(TILES.flatMap((t, i) => (i !== p.pos && t.kind !== "boat" ? [i] : [])));
    }
    if (ph.k === "raise") return new Set(ownedTiles(state, seat));
    return undefined;
  }, [mine, pb.playing, ph, state, p.cash, p.pos, seat]);

  const tap = (i: number) => {
    if (can && pickable?.has(i)) {
      if (ph.k === "raise") onAction({ t: "sell", tile: i });
      else onAction({ t: "pick", tile: i });
      setSelected(null);
      return;
    }
    setSelected((cur) => (cur === i ? null : i));
  };

  const recent = useMemo(
    () => state.log.flatMap((e) => (e.n > pb.shownN || (e.k === "move" && !e.back) ? [] : [{ n: e.n, text: eventText(e, state) }])).filter((x) => x.text).slice(-8).reverse(),
    [state, pb.shownN],
  );

  const prompt = (() => {
    if (pb.playing) return `${state.players[pb.view.turn]?.name ?? ""} đang đi…`;
    if (ph.k === "ended") return "Ván đã xong.";
    if (!mine) return `${p.name} đang đi…`;
    switch (ph.k) {
      case "roll":
        if (p.jail > 0) return `${p.name} đang ở Lao Ngục: đổ ra đôi để ra (còn ${p.jail} lần thử), hoặc nộp ${money(JAIL_BAIL)} chuộc.`;
        return state.extraUsed ? "Ra đôi: đổ thêm một lần." : `Tới lượt ${p.name}: đổ xúc xắc.`;
      case "buy":
        return `${tileName(ph.tile)} còn trống. Mua không?`;
      case "build":
        return `Đất của bạn: ${tileName(ph.tile)}, đang là ${LEVEL_NAME[state.plots[ph.tile]!.level]}. Xây thêm không?`;
      case "rent":
        return ph.amount === 0 ? `Nhà của ${state.players[ph.owner]!.name} đang sửa sau thiên tai, chưa thu tô. Mua lại ${money(ph.buyout)} không?` : `Đất của ${state.players[ph.owner]!.name}: nộp tô ${money(ph.amount)} hoặc mua lại ${money(ph.buyout)}.`;
      case "pick":
        if (ph.what === "quake") return "Động đất: chọn một ngôi nhà của nhà khác sáng lên, nhà đó sập một bậc.";
        if (ph.what === "storm") return "Bão lũ: chọn một ngôi nhà của nhà khác sáng lên, nhà đó phải sửa 1 tới 3 lượt, không thu tô.";
        return ph.what === "market" ? "Chợ phiên: chọn một ô đất trống sáng lên để mua theo giá gốc." : ph.what === "boat" ? `Bến đò: chọn ô muốn tới (tiền đò ${money(BOAT_FARE)}).` : "Hội Cờ Lau: chọn một ô đất của bạn để mở hội.";
      case "raise":
        return `Cần ${money(ph.amount)}, đang có ${money(p.cash)}. Chọn ô đất để bán lại cho triều đình (nửa giá).`;
    }
  })();

  const buttons: ReactNode = (() => {
    if (!mine) return null;
    switch (ph.k) {
      case "roll":
        return (
          <>
            <Button disabled={!can} onClick={() => onAction({ t: "roll" })} autoFocus>{p.jail > 0 ? "Đổ thử" : "Đổ xúc xắc"}</Button>
            {p.jail > 0 && <Button variant="secondary" disabled={!can || p.cash < JAIL_BAIL} onClick={() => onAction({ t: "bail" })}>Nộp {money(JAIL_BAIL)} chuộc</Button>}
          </>
        );
      case "buy": {
        const price = priceOf(ph.tile);
        const opts = Array.from({ length: (isScenic(ph.tile) ? 0 : MAX_LEVEL_ON_BUY) + 1 }, (_, l) => ({ l, cost: price + buildCostBetween(ph.tile, 0, l) })).filter((o) => o.cost <= p.cash);
        return (
          <>
            {opts.map((o) => (
              <Button key={o.l} size="sm" variant={o.l === 0 ? "primary" : "secondary"} disabled={!can} onClick={() => onAction({ t: "buy", level: o.l })}>
                {o.l === 0 ? `Mua đất ${money(o.cost)}` : `Mua và dựng ${LEVEL_NAME[o.l]} ${money(o.cost)}`}
              </Button>
            ))}
            <Button size="sm" variant="secondary" disabled={!can} onClick={() => onAction({ t: "skip" })}>Bỏ qua</Button>
          </>
        );
      }
      case "build": {
        const plot = state.plots[ph.tile]!;
        const cap = levelCap(state, ph.tile, seat);
        const opts = [];
        for (let l = plot.level + 1; l <= cap; l++) {
          const cost = buildCostBetween(ph.tile, plot.level, l);
          if (cost <= p.cash) opts.push({ l, cost });
        }
        return (
          <>
            {opts.map((o) => (
              <Button key={o.l} size="sm" variant="secondary" disabled={!can} onClick={() => onAction({ t: "build", level: o.l })}>
                Lên {LEVEL_NAME[o.l]} {money(o.cost)}
              </Button>
            ))}
            <Button size="sm" variant="secondary" disabled={!can} onClick={() => onAction({ t: "skip" })}>Thôi</Button>
          </>
        );
      }
      case "rent":
        return (
          <>
            <Button size="sm" disabled={!can} onClick={() => onAction({ t: "pay" })}>{ph.amount === 0 ? "Đi tiếp" : `Nộp tô ${money(ph.amount)}`}</Button>
            <Button size="sm" variant="secondary" disabled={!can} onClick={() => onAction({ t: "buyout" })}>Mua lại {money(ph.buyout)}</Button>
          </>
        );
      case "pick":
        return <Button size="sm" variant="secondary" disabled={!can} onClick={() => onAction({ t: "skip" })}>Bỏ qua</Button>;
      case "raise":
        return <Button size="sm" variant="secondary" disabled={!can} onClick={() => onAction({ t: "bankrupt" })}>Chịu phá sản</Button>;
    }
  })();

  const center = (
    <>
      <p className="font-serif text-[clamp(10px,2.4vw,20px)] font-bold tracking-wide text-frame-gold">Điền Trang Ký</p>
      {pb.view.dice && (
        <div className="flex gap-2">
          <Dice n={pb.view.dice[0]} tilt={pb.rolling ? (pb.view.dice[0] * 37) % 50 - 25 : 0} />
          <Dice n={pb.view.dice[1]} tilt={pb.rolling ? (pb.view.dice[1] * 53) % 50 - 25 : 0} />
        </div>
      )}
      <p className="line-clamp-3 max-w-[90%] text-center text-[clamp(8px,1.6vw,13px)] leading-snug opacity-90" aria-hidden>{recent[0]?.text}</p>
    </>
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <div className="mx-auto w-full max-w-[min(100%,46rem)] lg:flex-1">
        <Board state={pb.view} pickable={pickable} selected={selected} onTile={tap} center={center} />
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-80 lg:shrink-0">
        <section className="ui-frame-inset flex flex-col gap-2 p-3" aria-label="Lượt hiện tại">
          <p role="status" aria-live="polite" className="font-semibold text-on-wood">{prompt}</p>
          {status && <div className="text-caption text-on-wood-soft">{status}</div>}
          {buttons && <div className="flex flex-wrap gap-2">{buttons}</div>}
          {selected !== null && <TileInfo state={state} tile={selected} />}
        </section>
        <PlayersPanel state={pb.view} me={me} />
        {toolbar && <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Thao tác">{toolbar}</div>}
        <section className="ui-frame-inset p-3" aria-label="Nhật ký ván">
          <h2 className="mb-1 text-caption font-semibold text-frame-gold">Nhật ký</h2>
          <ol className="flex max-h-48 flex-col gap-1 overflow-y-auto text-caption text-on-wood-soft">
            {recent.map((e) => (
              <li key={e.n}>{e.text}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export function PlayersPanel({ state, me }: { state: DtkState; me?: number }) {
  return (
    <ul className="flex flex-col gap-1.5" aria-label="Các nhà">
      {state.players.map((pl, i) => {
        const info = pl.bot ? DTK_RIVAL_INFO[pl.bot] : null;
        const active = state.turn === i && state.phase.k !== "ended";
        const lands = ownedTiles(state, i).length;
        return (
          <li
            key={i}
            className={cn("ui-frame-inset flex items-center gap-2 p-2", active && "ring-2 ring-frame-gold", pl.out && "opacity-50", me === i && "font-semibold")}
            style={{ borderLeft: `4px solid ${colorHex(colorOf(state, i))}` }}
          >
            {info ? <Portrait id={pl.bot!} element={info.element} profession={info.profession} className="size-8 shrink-0" /> : <Token seat={i} state={state} className="!size-8 !text-sm" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-on-wood">{pl.name}{me === i ? " (bạn)" : ""}</p>
              <p className="text-caption text-on-wood-soft">
                {pl.out ? "Đã phá sản" : `${money(pl.cash)}, ${lands} ô, tài sản ${money(assetsOf(state, i))}`}
                {pl.jail > 0 ? ", đang bị giam" : ""}
                {pl.blessing ? ", có phúc" : ""}
              </p>
            </div>
            <span className="text-caption text-on-wood-soft">{ELEMENT_NAME[pl.element]}, {DTK_COLORS.find((c) => c.id === colorOf(state, i))!.name.toLowerCase()}</span>
          </li>
        );
      })}
    </ul>
  );
}
