"use client";

// Bản đồ Hành Thương Ký: tranh nền Bình Loạn (1536×1024) với 13 điểm giao dịch và các chặng. Thuyền, xe ngựa chỉ là hoạt
// ảnh theo loại đường (Shan, 26/11/2026): đường thủy hiện thuyền, đường bộ hiện xe ngựa, sức chở như nhau. Tranh ở
// public/art/trade/boat.webp, cart.webp (28/11/2026).

import { TRADE_EDGES, TRADE_NODE_KIND_NAME, TRADE_NODES, tradeEdge, tradeNode, type TradeLeg, type TradeNodeId } from "@/core/trade";

const W = 1536;
const H = 1024;
const ART = "/art/campaign/world-map.webp";
const HALO = { paintOrder: "stroke", stroke: "#1b1411", strokeWidth: 6, strokeLinejoin: "round" } as const;

const KIND_COLOR = { sea: "#7fd0e6", river: "#9fc4e8", plain: "#f0d77f", mountain: "#c9a27a" } as const;

/** Thuyền buôn hoặc xe ngựa (tranh Shan vẽ, quay sang phải), tâm ở (0, 0). */
function Vehicle({ boat }: { boat: boolean }) {
  return boat ? (
    <image href="/art/trade/boat.webp" x={-54} y={-50} width={108} height={100} />
  ) : (
    <image href="/art/trade/cart.webp" x={-76} y={-38} width={152} height={76} />
  );
}

export function TradeMap({
  here,
  leg,
  now,
  traveling,
  selected,
  reachable,
  onSelect,
}: {
  here: TradeNodeId;
  leg: TradeLeg | null;
  now: number;
  traveling: boolean;
  selected: TradeNodeId | null;
  reachable: readonly TradeNodeId[];
  onSelect: (id: TradeNodeId) => void;
}) {
  const moving = traveling && leg ? leg : null;
  const t = moving ? Math.min(1, Math.max(0, (now - moving.departAt) / (moving.arriveAt - moving.departAt))) : 0;
  const pos = (() => {
    if (!moving) return null;
    const [ax, ay] = tradeNode(moving.from).at;
    const [bx, by] = tradeNode(moving.to).at;
    return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, flip: bx < ax, boat: tradeEdge(moving.from, moving.to)?.route !== "land" };
  })();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-hidden rounded-lg border border-frame-line bg-wood-lo" role="group" aria-label="Bản đồ giao thương">
      <image href={ART} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
      <rect width={W} height={H} fill="#1b1411" opacity={0.18} />
      {TRADE_EDGES.map((e) => {
        const [ax, ay] = tradeNode(e.a).at;
        const [bx, by] = tradeNode(e.b).at;
        const active = moving && ((moving.from === e.a && moving.to === e.b) || (moving.from === e.b && moving.to === e.a));
        const hot = !traveling && ((e.a === here && reachable.includes(e.b)) || (e.b === here && reachable.includes(e.a)));
        const wet = e.route !== "land";
        return (
          <line
            key={`${e.a}-${e.b}`}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke={active ? "#ffd27a" : hot ? "#f3dfae" : wet ? "#7fd0e6" : "#e8c98c"}
            strokeOpacity={active || hot ? 1 : 0.75}
            strokeWidth={active || hot ? 7 : 4}
            strokeDasharray={e.route === "water" ? "18 12" : e.route === "land" ? "6 10" : undefined}
            strokeLinecap="round"
          />
        );
      })}
      {TRADE_NODES.map((n) => {
        const [x, y] = n.at;
        const isHere = n.id === here && !traveling;
        const can = !traveling && reachable.includes(n.id);
        const picked = selected === n.id;
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={`${n.name} (${TRADE_NODE_KIND_NAME[n.kind]}${isHere ? ", đang ở đây" : can ? ", đi thẳng tới được" : ""})`}
            aria-pressed={picked}
            onClick={() => onSelect(n.id)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onSelect(n.id);
              }
            }}
            className="cursor-pointer focus:outline-none"
          >
            {(picked || isHere) && <circle cx={x} cy={y} r={34} fill="none" stroke={isHere ? "#ffd27a" : "#f3dfae"} strokeWidth={5} strokeDasharray={isHere ? undefined : "8 6"} />}
            <circle cx={x} cy={y} r={can ? 22 : 18} fill={KIND_COLOR[n.kind]} stroke="#1b1411" strokeWidth={5} />
            <text x={x} y={y + 62} textAnchor="middle" fontSize={38} fontWeight={700} fill={isHere ? "#ffd27a" : "#f3dfae"} style={HALO}>
              {n.name}
            </text>
          </g>
        );
      })}
      {pos && (
        <g transform={`translate(${pos.x} ${pos.y - 30}) scale(${pos.flip ? -1 : 1} 1)`} aria-label="Đoàn hàng của bạn đang đi" className="trade-caravan">
          <Vehicle boat={pos.boat} />
        </g>
      )}
    </svg>
  );
}
