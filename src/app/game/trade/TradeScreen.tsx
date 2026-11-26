"use client";

// Hành Thương Ký (docs/02-game-modes/hanh-thuong-ky/gdd.md): buôn hàng giữa 13 điểm trên bản đồ Bình Loạn, mùa một tuần.
// Server giữ mọi số liệu (kim tiền, khoang, kho chung, giá); màn này chỉ hiện và gửi lệnh. Kim tiền của người khác chỉ
// có trên bảng Công trạng (lãi mùa), không hiện ở đây.

import { useCallback, useEffect, useState } from "react";
import {
  TRADE_GROUP_NAME,
  TRADE_LEVELS,
  TRADE_MAX_LEVEL,
  TRADE_NODE_KIND_NAME,
  TRADE_PASSES_PER_DAY,
  legMinutes,
  neighbors,
  tradeEdge,
  tradeItem,
  tradeNode,
  type Cargo,
  type EncounterKind,
  type MarketQuote,
  type TradeItemId,
  type TradeNodeId,
} from "@/core/trade";
import type { SkAction } from "@/core/su-lo";
import type { OtherCaravan, TradeView } from "@/server/trade";
import { Alert, Badge, Button, ChoiceChip, Input, Tabs } from "@/components/ui";
import { ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { ModeGuideTabs } from "../ModeGuide";
import { MODE_TEXT } from "../modeInfo";
import { SeasonBoardPanel } from "../leaderboard/boards";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { EncounterPanel } from "./Encounter";
import { TradeMap } from "./TradeMap";
import { fetchTrade, money, postTrade, tradeErrorText, type TradeReply } from "./client";

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0 ? `${h} giờ ${m} phút` : `${m}:${String(ss).padStart(2, "0")}`;
};

const cargoText = (c: Cargo) =>
  Object.entries(c)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([id, n]) => `${tradeItem(id as TradeItemId).name} ×${n}`)
    .join(", ") || "Khoang trống";

const bundleText = (b: { items: Cargo; money: number }) => [Object.keys(b.items).length ? cargoText(b.items) : "", b.money ? `${money(b.money)} kim tiền` : ""].filter(Boolean).join(" và ") || "không gì";

export default function TradeScreen() {
  const [view, setView] = useState<TradeView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<TradeNodeId | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // Lệch giờ máy so với server, để đếm ngược đúng.
  const [skew, setSkew] = useState(0);

  const apply = useCallback((r: TradeReply, ok?: string) => {
    if (r.ok) {
      setView(r.view);
      setSkew(r.view.now - Date.now());
      setError(null);
      if (ok) setNote(ok);
    } else setError(tradeErrorText(r.error));
  }, []);

  const load = useCallback(async () => apply(await fetchTrade()), [apply]);

  useEffect(() => {
    let live = true;
    void fetchTrade().then((r) => live && apply(r));
    return () => {
      live = false;
    };
  }, [apply]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const serverNow = now + skew;
  // Tới nơi hoặc sang khung giá mới thì tải lại.
  const nextEvent = view ? Math.min(view.nextSlotAt, view.player.traveling && view.player.leg ? view.player.leg.arriveAt : Infinity) : Infinity;
  useEffect(() => {
    if (!Number.isFinite(nextEvent)) return;
    const id = window.setTimeout(() => void load(), Math.max(500, nextEvent - (Date.now() + skew) + 800));
    return () => window.clearTimeout(id);
  }, [nextEvent, skew, load]);

  const run = async (action: string, payload: Record<string, unknown>, ok?: string) => {
    setBusy(true);
    setNote(null);
    apply(await postTrade(action, payload), ok);
    setBusy(false);
  };

  if (!view)
    return (
      <ModeScreen card label="Hành Thương Ký">
        <ModeBanner title="Hành Thương Ký" showTitle kicker="Buôn bán" description={MODE_TEXT.TRADE} />
        {error ? <Alert>{error}</Alert> : <p role="status" className="text-sm text-on-wood-soft">Đang mở sổ buôn…</p>}
      </ModeScreen>
    );

  const p = view.player;
  const traveling = p.traveling && p.leg !== null && serverNow < p.leg.arriveAt;
  const reachable = neighbors(p.node);
  const target = selected ?? p.node;
  const nextLevel = p.level < TRADE_MAX_LEVEL ? TRADE_LEVELS[p.level]! : null;

  return (
    <ModeScreen card label="Hành Thương Ký">
      <ModeBanner
        title="Hành Thương Ký"
        art="/art/campaign/world-map.webp"
        artPosition="center 70%"
        kicker={`Mùa từ ${view.season}`}
        description={MODE_TEXT.TRADE}
        stats={[
          { label: "Kim tiền", value: money(p.money) },
          { label: "Lộ phiếu", value: `${p.passesLeft}/${TRADE_PASSES_PER_DAY}` },
          { label: "Khoang", value: `${p.weight}/${p.capacity}` },
          { label: "Lãi mùa", value: `${p.score >= 0 ? "+" : ""}${money(p.score)}` },
        ]}
      />
      <ModeGuideTabs
        scene="TRADE"
        extraTabs={[
          {
            value: "board",
            label: "Công trạng",
            content: (
              <div className="flex flex-col gap-4">
                <RankRewardsPanel mode="trade" />
                <SeasonBoardPanel board="trade" />
              </div>
            ),
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          {note && <Alert tone="success">{note}</Alert>}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <TradeMap here={p.node} leg={p.leg} now={serverNow} traveling={traveling} selected={selected} reachable={reachable} onSelect={setSelected} />
            <NodePanel
              view={view}
              target={target}
              traveling={traveling}
              serverNow={serverNow}
              busy={busy}
              onDepart={(to) => void run("depart", { to }, `Đoàn hàng đã lên đường tới ${tradeNode(to).name}.`)}
            />
          </div>

          {p.encounter && !traveling ? (
            <EncounterPanel
              key={p.encounter.seed}
              kind={p.encounter.kind as EncounterKind}
              seed={p.encounter.seed}
              busy={busy}
              onResolve={(choice, actions: SkAction[]) => {
                void (async () => {
                  setBusy(true);
                  const r = await postTrade<{ outcome: string; lost: Cargo }>("encounter", { choice, actions });
                  const text = r.ok
                    ? r.outcome === "won"
                      ? "Thắng trận, giữ trọn hàng."
                      : `${r.outcome === "toll" ? "Đã nộp mãi lộ" : "Thua trận"}, mất: ${cargoText(r.lost)}.`
                    : undefined;
                  apply(r, text);
                  setBusy(false);
                })();
              }}
            />
          ) : (
            !traveling && (
              <Market
                key={`${p.node}-${view.slot}`}
                node={p.node}
                quotes={view.markets[p.node]}
                cargo={p.cargo}
                room={p.capacity - p.weight}
                money={p.money}
                busy={busy}
                onBuy={(item, amount) => void run("buy", { item, amount }, `Đã mua ${amount} ${tradeItem(item).name}.`)}
                onSell={(item, amount) => void run("sell", { item, amount }, `Đã bán ${amount} ${tradeItem(item).name}.`)}
              />
            )
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <OrnateFrame className="flex flex-col gap-3">
              <SectionTitle description="Thuyền hay xe ngựa chỉ là cách đi, sức chở như nhau. Nâng cấp tăng sức chở và đi nhanh hơn, làm lại từ đầu mỗi mùa.">Đoàn hàng</SectionTitle>
              <p className="text-sm">
                Cấp {p.level}/{TRADE_MAX_LEVEL}, khoang {p.weight}/{p.capacity}. Đã đi {p.legs} chặng mùa này.
              </p>
              <p className="text-sm">{cargoText(p.cargo)}</p>
              {nextLevel ? (
                <Button variant="secondary" disabled={busy || p.money < nextLevel.cost} onClick={() => void run("upgrade", {}, `Đoàn hàng lên cấp ${p.level + 1}.`)}>
                  Nâng cấp ({money(nextLevel.cost)} kim tiền): khoang {nextLevel.capacity}, đi nhanh {Math.round((1 - nextLevel.time) * 100)}%
                </Button>
              ) : (
                <p className="text-caption text-on-wood-soft">Đã ở cấp cao nhất.</p>
              )}
            </OrnateFrame>
            <Meetings view={view} busy={busy} run={run} />
          </div>
        </div>
      </ModeGuideTabs>
    </ModeScreen>
  );
}

function NodePanel({ view, target, traveling, serverNow, busy, onDepart }: { view: TradeView; target: TradeNodeId; traveling: boolean; serverNow: number; busy: boolean; onDepart: (to: TradeNodeId) => void }) {
  const p = view.player;
  const n = tradeNode(target);
  const edge = tradeEdge(p.node, target);
  const quotes = view.markets[target];
  const top = [...quotes].filter((q) => q.stock > 0).sort((a, b) => b.buy - a.buy);
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description={`${TRADE_NODE_KIND_NAME[n.kind]}${n.holder ? `, đất ${n.holder}` : ""}. Khung giá đổi lúc ${new Date(view.nextSlotAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`}>
        {n.name}
      </SectionTitle>
      {traveling && p.leg ? (
        <p className="text-sm">
          Đang đi {tradeNode(p.leg.from).name} → {tradeNode(p.leg.to).name}, còn <b>{clock(p.leg.arriveAt - serverNow)}</b>. Không cần mở game, tới nơi sẽ tự dừng.
        </p>
      ) : target === p.node ? (
        <p className="text-sm">Đoàn hàng đang ở đây. Chọn một điểm có đường nối trên bản đồ để xuất hành.</p>
      ) : edge ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Đi {edge.route === "land" ? "đường bộ" : edge.route === "water" ? "đường thủy" : "đường thủy và bộ"}, {legMinutes(edge, p.level)} phút, tốn 1 lộ phiếu.
            {edge.route === "land" ? " Có thể gặp thảo khấu." : edge.sea ? " Có thể gặp sóng dữ." : " Có thể gặp giặc sông."}
          </p>
          <Button disabled={busy || p.passesLeft <= 0 || p.encounter !== null || p.weight > p.capacity} onClick={() => onDepart(target)}>
            Xuất hành tới {n.name}
          </Button>
          {p.passesLeft <= 0 && <p className="text-caption text-on-wood-soft">Hết lộ phiếu hôm nay.</p>}
        </div>
      ) : (
        <p className="text-sm text-on-wood-soft">Không có đường đi thẳng từ chỗ đoàn hàng đang đứng.</p>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-caption text-on-wood-soft">Giá bán ra khung này (đắt nhất trước):</p>
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto text-sm">
          {top.map((q) => (
            <li key={q.item} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{tradeItem(q.item).name}</span>
              {q.rare && <Badge tone="warning">Hiếm</Badge>}
              <span className="tabular-nums">{money(q.buy)}</span>
              <Change v={q.change} />
            </li>
          ))}
        </ul>
      </div>
    </OrnateFrame>
  );
}

function Change({ v }: { v: number }) {
  if (v === 0) return <span className="w-14 text-right text-caption text-on-wood-soft tabular-nums">0%</span>;
  return <span className={`w-14 text-right text-caption tabular-nums ${v > 0 ? "text-danger" : "text-success"}`}>{v > 0 ? `+${v}` : v}%</span>;
}

function Market(props: {
  node: TradeNodeId;
  quotes: readonly MarketQuote[];
  cargo: Cargo;
  room: number;
  money: number;
  busy: boolean;
  onBuy: (item: TradeItemId, amount: number) => void;
  onSell: (item: TradeItemId, amount: number) => void;
}) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [amounts, setAmounts] = useState<Partial<Record<TradeItemId, number>>>({});
  const rows = tab === "buy" ? props.quotes : props.quotes.filter((q) => (props.cargo[q.item] ?? 0) > 0);
  const amountOf = (id: TradeItemId) => amounts[id] ?? 1;
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description="Kho chung cho mọi người: ai mua thì kho giảm, ai bán thì hàng vào kho. Giá trong một khung cố định, khung sau tính theo tồn lúc mở khung.">
        Chợ {tradeNode(props.node).name}
      </SectionTitle>
      <Tabs<"buy" | "sell">
        label="Mua hay bán"
        value={tab}
        onChange={setTab}
        items={[
          { value: "buy", label: "Mua" },
          { value: "sell", label: "Bán" },
        ]}
      />
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-on-wood-soft">Khoang chưa có hàng để bán.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((q) => {
            const it = tradeItem(q.item);
            const max =
              tab === "buy"
                ? Math.max(0, Math.min(q.stock, Math.floor(props.money / q.buy), it.group === "treasure" ? q.stock : props.room))
                : props.cargo[q.item] ?? 0;
            const disabled = props.busy || max <= 0 || (tab === "sell" && q.full);
            return (
              <li key={q.item} className="flex flex-col gap-2 rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2 text-sm sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-x-3">
                  <span className="min-w-0 flex-1">
                    <b>{it.name}</b> <span className="text-caption text-on-wood-soft">{TRADE_GROUP_NAME[it.group]}</span> {q.rare && <Badge tone="warning">Hiếm</Badge>}
                  </span>
                  <span className="tabular-nums">{money(tab === "buy" ? q.buy : q.sell)}</span>
                  <Change v={q.change} />
                  <span className="w-16 text-right text-caption text-on-wood-soft tabular-nums">{tab === "buy" ? `kho ${q.stock}` : q.full ? "chợ ứ" : `có ${props.cargo[q.item] ?? 0}`}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={Math.max(1, max)}
                    aria-label={`Số ${it.name}`}
                    className="w-20"
                    value={amountOf(q.item)}
                    onChange={(e) => setAmounts({ ...amounts, [q.item]: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                  />
                  <Button size="sm" variant="secondary" disabled={disabled} onClick={() => setAmounts({ ...amounts, [q.item]: Math.max(1, max) })}>
                    Tối đa
                  </Button>
                  <Button size="sm" disabled={disabled || amountOf(q.item) > max} onClick={() => (tab === "buy" ? props.onBuy : props.onSell)(q.item, amountOf(q.item))}>
                    {tab === "buy" ? "Mua" : "Bán"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </OrnateFrame>
  );
}

function Meetings({ view, busy, run }: { view: TradeView; busy: boolean; run: (action: string, payload: Record<string, unknown>, ok?: string) => Promise<void> }) {
  const [composing, setComposing] = useState<OtherCaravan | null>(null);
  const p = view.player;
  return (
    <OrnateFrame className="flex flex-col gap-3">
      <SectionTitle description="Đoàn đi cùng chặng (chiều nào cũng được) trùng giờ từ 5 phút là gặp nhau. Không cần cùng vào game, hai bên đồng ý mới đổi. Mỗi chuyến chỉ giao thương một lần; lời ngỏ tự hủy khi một bên xuất hành chặng mới.">
        Giao thương giữa đường
      </SectionTitle>
      {view.offers.length > 0 && (
        <ul className="flex flex-col gap-2">
          {view.offers.map((o) => (
            <li key={o.id} className="flex flex-col gap-1 rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2 text-sm">
              {o.mine ? (
                <>
                  <span>
                    Bạn ngỏ với <b>{o.toName}</b>: đưa {bundleText(o.give)}, xin {bundleText(o.want)}. Đang chờ trả lời.
                  </span>
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run("withdraw", { offerId: o.id }, "Đã rút lời ngỏ, hàng khóa đã về khoang.")}>
                    Rút lời ngỏ
                  </Button>
                </>
              ) : (
                <>
                  <span>
                    <b>{o.fromName}</b> ngỏ: đưa bạn {bundleText(o.give)}, xin {bundleText(o.want)}.
                  </span>
                  <span className="text-caption text-on-wood-soft">Khoang của họ: {cargoText(o.otherCargo)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => void run("respond", { offerId: o.id, accept: true }, "Đã đổi hàng.")}>
                      Đồng ý
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run("respond", { offerId: o.id, accept: false }, "Đã từ chối.")}>
                      Từ chối
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {view.met.length === 0 ? (
        <p className="text-sm text-on-wood-soft">Chặng vừa rồi chưa gặp đoàn nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {view.met.map((m) => (
            <li key={m.ownerId} className="flex flex-col gap-1 rounded-control border border-frame-line-soft bg-wood-inset px-3 py-2 text-sm">
              <span>
                <b>{m.name}</b>, khoang {m.weight}/{m.capacity}
                {m.busy ? " (đã giao thương chuyến này)" : ""}
              </span>
              <span className="text-caption text-on-wood-soft">{cargoText(m.cargo)}</span>
              {p.canOffer && !m.busy && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => setComposing(composing?.ownerId === m.ownerId ? null : m)}>
                  {composing?.ownerId === m.ownerId ? "Thôi" : "Ngỏ lời"}
                </Button>
              )}
              {composing?.ownerId === m.ownerId && (
                <OfferForm
                  mine={p.cargo}
                  theirs={m.cargo}
                  busy={busy}
                  onSend={(give, want) => {
                    setComposing(null);
                    void run("offer", { to: m.ownerId, legId: m.legId, give, want }, `Đã ngỏ lời với ${m.name}. Hàng đưa ra được khóa tới khi họ trả lời.`);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </OrnateFrame>
  );
}

type Draft = { items: Partial<Record<TradeItemId, number>>; money: number };

function BundleEditor({ label, source, value, onChange }: { label: string; source: Cargo; value: Draft; onChange: (d: Draft) => void }) {
  const ids = Object.keys(source).filter((id) => (source[id as TradeItemId] ?? 0) > 0) as TradeItemId[];
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-caption font-semibold">{label}</legend>
      {ids.map((id) => (
        <label key={id} className="flex items-center gap-2 text-sm">
          <span className="min-w-0 flex-1">
            {tradeItem(id).name} (có {source[id]})
          </span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={source[id]}
            className="w-20"
            value={value.items[id] ?? 0}
            onChange={(e) => onChange({ ...value, items: { ...value.items, [id]: Math.min(source[id] ?? 0, Math.max(0, Math.floor(Number(e.target.value) || 0))) } })}
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <span className="min-w-0 flex-1">Kim tiền</span>
        <Input type="number" inputMode="numeric" min={0} className="w-28" value={value.money} onChange={(e) => onChange({ ...value, money: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} />
      </label>
    </fieldset>
  );
}

function OfferForm({ mine, theirs, busy, onSend }: { mine: Cargo; theirs: Cargo; busy: boolean; onSend: (give: Draft, want: Draft) => void }) {
  const [give, setGive] = useState<Draft>({ items: {}, money: 0 });
  const [want, setWant] = useState<Draft>({ items: {}, money: 0 });
  const clean = (d: Draft): Draft => ({ money: d.money, items: Object.fromEntries(Object.entries(d.items).filter(([, n]) => (n ?? 0) > 0)) });
  const empty = (d: Draft) => d.money === 0 && Object.values(d.items).every((n) => !n);
  const [side, setSide] = useState<"give" | "want">("give");
  return (
    <div className="flex flex-col gap-2 rounded-control border border-frame-line p-2">
      <div className="flex gap-2">
        <ChoiceChip selected={side === "give"} onClick={() => setSide("give")}>
          Bạn đưa
        </ChoiceChip>
        <ChoiceChip selected={side === "want"} onClick={() => setSide("want")}>
          Bạn xin
        </ChoiceChip>
      </div>
      {side === "give" ? <BundleEditor label="Hàng và kim tiền bạn đưa" source={mine} value={give} onChange={setGive} /> : <BundleEditor label="Hàng và kim tiền bạn xin" source={theirs} value={want} onChange={setWant} />}
      <p className="text-caption text-on-wood-soft">
        Đưa: {bundleText(clean(give))}. Xin: {bundleText(clean(want))}.
      </p>
      <Button size="sm" disabled={busy || (empty(give) && empty(want))} onClick={() => onSend(clean(give), clean(want))}>
        Gửi lời ngỏ
      </Button>
    </div>
  );
}
