"use client";

// Tầm Tướng Ký chế độ Thường: Vạn Vật Lục + Đài Hợp Nguyên + Tướng Lục. Phiếu, lượt, gợi ý và sổ khám phá nằm trên
// server theo tài khoản (LT-04, src/server/tamTuongKy.ts); màn chỉ gửi ý định và vẽ lại theo `view` server trả về.
// Chế độ Hạng là LT-06. Luật: docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md.
// Giao diện: docs/05-ui-ux/screens/tam-tuong-ky.md.

import { ModeBanner } from "@/components/game-ui";
import { ChoiceChip, buttonVariants } from "@/components/ui";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PROFESSION_DISPLAY_NAME, type Element } from "@/core/battle";
import { PACK_NAMES, catalogForPack, openIngredients, type Catalog, type CatalogNode, type DiscoveryState, type HintLevel, type NodeId } from "@/core/tam-tuong-ky";
import { AtlasCorners } from "../campaign/AtlasFrame";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { personalSkillArtFile } from "../art/skills";
import { Portrait } from "../art/portraits";
import {
  EMPTY_SLOTS,
  TIER_NAME,
  clearSlot,
  discoveredNodes,
  filterNodes,
  groupsOf,
  hintText,
  ledger,
  nameOf,
  rankedNodes,
  noticeFor,
  pickInto,
  swapSlots,
  tutorialTip,
  type LedgerEntry,
  type Notice,
  type Slots,
} from "./altar";
import {
  ERROR_TEXT,
  buyBundleApi,
  combineApi,
  fetchRanked,
  fetchState,
  hintApi,
  newRequestId,
  openSessionApi,
  rankedCombineApi,
  type ApiResult,
  type RankedResult,
  type TtkRankedView,
  type TtkView,
} from "./client";

/** Sổ đang chạy, theo `packId` server trả về (Gói 1, hoặc Gói 1 + Gói 2). */
const CatalogContext = createContext<Catalog>(catalogForPack(undefined));
const useCatalog = () => useContext(CatalogContext);

const ELEMENT_NAME: Readonly<Record<Element, string>> = { kim: "Kim", moc: "Mộc", thuy: "Thủy", hoa: "Hỏa", tho: "Thổ", loi: "Lôi", phong: "Phong" };

type Tab = "library" | "ledger";

type Mode = "normal" | "ranked";

/** Màn chế độ: tab Thường / Hạng tuần (Hạng bật cùng cờ `TAM_TUONG_KY_ENABLED`). */
export default function TamTuongKyScreen({
  initial = null,
  ranked = false,
  initialRanked = null,
  initialMode = "normal",
}: {
  initial?: TtkView | null;
  ranked?: boolean;
  initialRanked?: TtkRankedView | null;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(ranked ? initialMode : "normal");
  return (
    <>
      {ranked && (
        <div role="group" aria-label="Chế độ" className="campaign-atlas mx-auto flex w-full max-w-[1480px] gap-2 px-4 pt-4 sm:px-6 lg:px-8">
          {(["normal", "ranked"] as const).map((m) => (
            <ChoiceChip key={m} size="md" selected={mode === m} onClick={() => setMode(m)}>
              {m === "normal" ? "Thường" : "Hạng tuần"}
            </ChoiceChip>
          ))}
        </div>
      )}
      {mode === "normal" ? <NormalMode initial={initial} /> : <RankedMode initial={initialRanked} />}
    </>
  );
}

function NormalMode({ initial }: { initial: TtkView | null }) {
  const [view, setView] = useState<TtkView | null>(initial);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slots>(EMPTY_SLOTS);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [recent, setRecent] = useState<readonly string[]>([]);
  const [tab, setTab] = useState<Tab>("library");
  // Một requestId cho mỗi ý định; lỗi mạng thì bấm lại dùng đúng id cũ để server không trừ hai lần.
  const retry = useRef<{ key: string; id: string } | null>(null);
  const requestIdFor = (key: string) => {
    if (retry.current?.key !== key) retry.current = { key, id: newRequestId() };
    return retry.current.id;
  };

  useEffect(() => {
    if (initial) return;
    let alive = true;
    fetchState().then((r) => {
      if (!alive) return;
      if (r.ok) setView(r.view);
      else setLoadError(ERROR_TEXT[r.error] ?? ERROR_TEXT.network!);
    });
    return () => {
      alive = false;
    };
  }, [initial]);

  const catalog = catalogForPack(view?.packId);
  const state: DiscoveryState | null = view?.discovery ?? null;
  const entries = useMemo(() => (state ? ledger(catalog, state) : []), [catalog, state]);
  const found = entries.filter((e) => e.found).length;
  const left = view?.session?.combinesLeft ?? 0;
  const ready = !pending && slots[0] !== null && slots[1] !== null && left > 0;
  const tried = triedPair(view?.triedPairs, slots);

  /** Chạy một thao tác: khóa nút trong lúc chờ (chống bấm đúp), cập nhật view, báo lỗi. */
  const run = useCallback(async (key: string, call: (id: string) => Promise<ApiResult>, onOk: (r: Extract<ApiResult, { ok: true }>) => void) => {
    setPending(true);
    const r = await call(requestIdFor(key));
    setPending(false);
    if (r.ok || r.error !== "network") retry.current = null;
    if (r.view) setView(r.view);
    if (r.ok) onOk(r);
    else setNotice({ tone: "invalid", text: ERROR_TEXT[r.error] ?? ERROR_TEXT.network! });
  }, []);

  const combine = () => {
    const [a, b] = slots;
    if (a === null || b === null || !ready) return;
    void run(`combine:${a}>${b}:${left}`, (id) => combineApi(id, a, b), (r) => {
      if (r.response?.kind !== "combine") return;
      const n = noticeFor(catalog, r.response);
      setNotice(n);
      setRecent((list) => [`${nameOf(catalog, a)} + ${nameOf(catalog, b)}: ${n.text}`, ...list].slice(0, 5));
      if (r.response.status === "created" && r.response.isCharacter) setTab("ledger");
      setSlots(EMPTY_SLOTS);
    });
  };

  const askHint = (level: HintLevel) => {
    if (pending || !view || view.hintsLeft <= 0) return;
    void run(`hint:${level}:${view.hintsLeft}:${view.discovery.discoveredRecipeIds.length}`, (id) => hintApi(id, level), (r) => {
      if (r.response?.kind === "hint") setNotice({ tone: "repeat", text: hintText(r.response.hint) });
    });
  };

  const openSession = () => {
    if (pending || !view) return;
    void run(`session:${view.tickets}`, openSessionApi, (r) => {
      if (r.response?.kind === "session")
        setNotice({ tone: "repeat", text: r.response.charged ? "Đã mở lượt mới, trừ 1 phiếu." : "Đang có lượt dở, chơi tiếp lượt đó." });
    });
  };

  if (!view || !state)
    return (
      <main className="campaign-atlas flex flex-1 items-center justify-center bg-[#17110e] px-4 text-[var(--atlas-ink-on-wood)]">
        <p role="status">{loadError ?? "Đang mở Tướng Lục…"}</p>
      </main>
    );

  const tip = tutorialTip(state);

  return (
    <CatalogContext.Provider value={catalog}>
    <main aria-label="Tầm Tướng Ký" className="campaign-atlas flex flex-1 flex-col bg-[#17110e] pb-28 text-[var(--atlas-ink-on-wood)] lg:pb-10">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 pt-4 sm:px-6 lg:px-8">
        <ModeBanner
          title="Tầm Tướng Ký"
          kicker="Ghép yếu tố"
          art="/art/home/tam-tuong-ky.webp"
          description="Ghép yếu tố từ bảy hệ để tìm lại chân dung danh tướng. Công thức biểu trưng của trò chơi, không phải diễn giải sử học."
          stats={[{ label: "Phiếu", value: `${view.tickets}/${view.maxTickets}` }]}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,26fr)_minmax(20rem,44fr)_minmax(16rem,30fr)]">
          <Altar
            view={view}
            slots={slots}
            ready={ready}
            pending={pending}
            notice={notice ?? (tip ? { tone: "repeat", text: tip } : null)}
            recent={recent}
            tried={tried}
            onClear={(i) => setSlots((s) => clearSlot(s, i))}
            onSwap={() => setSlots(swapSlots)}
            onCombine={combine}
            onHint={askHint}
            onOpenSession={openSession}
          />

          <div role="group" aria-label="Chọn sổ" className="flex gap-2 lg:hidden">
            {(["library", "ledger"] as const).map((t) => (
              <ChoiceChip
                key={t}
                size="md"
                selected={tab === t}
                aria-controls={`ttk-${t}`}
                onClick={() => setTab(t)}
                className="flex-1"
              >
                {t === "library" ? "Vạn Vật Lục" : `Tướng Lục ${found}/${entries.length}`}
              </ChoiceChip>
            ))}
          </div>

          <Library
            nodes={discoveredNodes(catalog, state)}
            badges={openIngredients(catalog, state)}
            onPick={(id) => setSlots((s) => pickInto(s, id))}
            hidden={tab !== "library"}
          />
          <Ledger entries={entries} found={found} hidden={tab !== "ledger"} />
        </div>
      </div>
      <MobileBar slots={slots} ready={ready} tried={tried} onCombine={combine} />
    </main>
    </CatalogContext.Provider>
  );
}

/** Hai ô đang đặt đúng một cặp đã ghép trước đây mà không ra gì. */
function triedPair(list: readonly string[] | undefined, [a, b]: Slots): boolean {
  return a !== null && b !== null && (list ?? []).includes(`${a}>${b}`);
}

/**
 * Cảnh báo khi đặt lại cặp đã ghép (Shan, 04/11/2026): lần đầu ghép sai vẫn mất, lần sau báo trước. Không nói thẳng
 * là công thức sai, chỉ nhắc đã thử và cái giá nếu ghép lại.
 */
function TriedWarning({ cost }: { cost: string }) {
  return (
    <p role="note" className="rounded-lg border border-[var(--atlas-red-hi)] px-3 py-2 text-sm">
      Bạn đã ghép cặp này ở lần trước. Ghép lại vẫn {cost}.
    </p>
  );
}

/** Chế độ Hạng tuần (LT-06): túi nguyên tố tự chọn, kho tuần, ô đề cử chỉ có lời dẫn (A-23), cửa hàng bó, bảng tuần. */
function RankedMode({ initial }: { initial: TtkRankedView | null }) {
  const [view, setView] = useState<TtkRankedView | null>(initial);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slots>(EMPTY_SLOTS);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const retry = useRef<{ key: string; id: string } | null>(null);
  const requestIdFor = (key: string) => {
    if (retry.current?.key !== key) retry.current = { key, id: newRequestId() };
    return retry.current.id;
  };

  useEffect(() => {
    if (initial) return;
    let alive = true;
    fetchRanked().then((r) => {
      if (!alive) return;
      if (r.ok) setView(r.view);
      else setLoadError(ERROR_TEXT[r.error] ?? ERROR_TEXT.network!);
    });
    return () => {
      alive = false;
    };
  }, [initial]);

  const run = useCallback(async (key: string, call: (id: string) => Promise<RankedResult>, onOk: (r: Extract<RankedResult, { ok: true }>) => void) => {
    setPending(true);
    const r = await call(requestIdFor(key));
    setPending(false);
    if (r.ok || r.error !== "network") retry.current = null;
    if (r.view) setView(r.view);
    if (r.ok) onOk(r);
    else setNotice({ tone: "invalid", text: ERROR_TEXT[r.error] ?? ERROR_TEXT.network! });
  }, []);

  if (!view)
    return (
      <main className="campaign-atlas flex flex-1 items-center justify-center bg-[#17110e] px-4 text-[var(--atlas-ink-on-wood)]">
        <p role="status">{loadError ?? "Đang mở tuần Hạng…"}</p>
      </main>
    );

  const catalog = catalogForPack(view.packId);
  const ready = !pending && slots[0] !== null && slots[1] !== null;
  const tried = triedPair(view.triedPairs, slots);
  const combine = () => {
    const [a, b] = slots;
    if (a === null || b === null || !ready) return;
    void run(`ranked:${a}>${b}:${view.unitsSpent}:${JSON.stringify(view.stock)}`, (id) => rankedCombineApi(id, a, b), (r) => {
      if (r.response?.kind !== "rankedCombine") return;
      const res = r.response;
      const base = res.status === "noRecipe" ? "Chưa tìm được mối liên hệ. Nguyên liệu đã mất." : noticeFor(catalog, { ...res, status: res.status }).text;
      setNotice({ tone: res.points > 0 ? "hero" : res.status === "created" ? "discovery" : res.status === "invalid" ? "invalid" : "miss", text: res.points > 0 ? `${base} +${res.points} điểm.` : base });
      setSlots(EMPTY_SLOTS);
    });
  };
  const buy = () => {
    if (pending) return;
    void run(`buy:${view.shop.bought}`, buyBundleApi, () => setNotice({ tone: "repeat", text: "Đã mua 1 bó: +7 đơn vị nguyên tố." }));
  };

  return (
    <CatalogContext.Provider value={catalog}>
    <main aria-label="Tầm Tướng Ký" className="campaign-atlas flex flex-1 flex-col bg-[#17110e] pb-28 text-[var(--atlas-ink-on-wood)] lg:pb-10">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 pt-4 sm:px-6 lg:px-8">
        <ModeBanner
          title={`Tầm Tướng Ký · Hạng tuần ${view.week}`}
          kicker={`Hạng tuần ${view.week}`}
          art="/art/home/tam-tuong-ky.webp"
          description="Không có gợi ý. Mỗi lần ghép tiêu nguyên liệu, ghép sai cũng mất."
          stats={[
            { label: "Túi nguyên tố", value: view.units },
            { label: "Điểm", value: view.points },
            { label: "Đã tiêu", value: view.unitsSpent },
          ]}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,26fr)_minmax(20rem,44fr)_minmax(16rem,30fr)]">
          <Panel id="ttk-ranked-altar" title="Đài Hợp Nguyên" className="lg:sticky lg:top-4 lg:self-start">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Slot label="Ô trước" id={slots[0]} onClear={() => setSlots((s) => clearSlot(s, 0))} />
              <button type="button" onClick={() => setSlots(swapSlots)} aria-label="Đổi chỗ ô trước và ô sau" className="grid size-11 place-items-center rounded-full border border-[var(--atlas-border-soft)] font-serif text-lg hover:border-[var(--atlas-gold)]">
                ⇄
              </button>
              <Slot label="Ô sau" id={slots[1]} onClear={() => setSlots((s) => clearSlot(s, 1))} />
            </div>
            <p className="text-xs text-[var(--atlas-muted)]">Nguyên tố lấy từ túi, dùng cho hệ nào cũng được.</p>
            {tried && <TriedWarning cost="tiêu nguyên liệu" />}
            <button type="button" disabled={!ready} aria-busy={pending} onClick={combine} className={buttonVariants({ className: "min-h-12 text-lg tracking-[0.12em] uppercase" })}>
              {tried ? "Vẫn hợp nguyên" : "Hợp Nguyên"}
            </button>
            <div aria-live="polite" role="status" className="min-h-12 rounded-lg border border-[var(--atlas-border-soft)] px-3 py-2 text-sm">
              {notice?.text ?? "Đoán tướng từ lời dẫn, rồi ghép theo công thức đã học ở chế độ Thường."}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>Cửa hàng: {view.shop.price} vàng một bó · tuần này {view.shop.bought}/{view.shop.max} · vàng: {view.gold}</span>
              <button type="button" disabled={pending || view.shop.bought >= view.shop.max || view.gold < view.shop.price} onClick={buy} className="min-h-11 rounded border border-[var(--atlas-gold)] px-3 font-semibold disabled:opacity-50">
                Mua 1 bó
              </button>
            </div>
          </Panel>

          <Library nodes={rankedNodes(catalog, view.stock)} counts={view.stock} units={view.units} onPick={(id) => setSlots((s) => pickInto(s, id))} hidden={false} />

          <Panel id="ttk-featured" title={`Đề cử tuần · ${view.featured.filter((f) => f.found).length}/${view.featured.length}`}>
            <ul className="flex flex-col gap-2">
              {view.featured.map((f) => (
                <li key={f.slot} className={`rounded-lg border p-3 ${f.found ? "border-[var(--atlas-gold)] bg-[var(--atlas-wood-hi)]" : "border-dashed border-[var(--atlas-border-soft)]"}`}>
                  {f.found ? (
                    <p className="font-serif font-bold text-[var(--atlas-title)]">{f.found.name} · +{f.points}</p>
                  ) : (
                    <p className="text-xs text-[var(--atlas-muted)]">Tướng chưa tìm thấy · {f.points} điểm</p>
                  )}
                  <p className="mt-1 text-sm italic">“{f.clue}”</p>
                </li>
              ))}
            </ul>
            <section aria-labelledby="ttk-board-title">
              <h3 id="ttk-board-title" className="font-serif font-bold text-[var(--atlas-title)]">Bảng tuần</h3>
              {view.board.top.length === 0 ? (
                <p className="text-sm text-[var(--atlas-muted)]">Chưa có ai ghép ra tướng đề cử.</p>
              ) : (
                <ol className="mt-1 space-y-0.5 text-sm">
                  {view.board.top.map((e) => (
                    <li key={e.rank} className={e.mine ? "font-bold text-[var(--atlas-title)]" : ""}>
                      {e.rank}. {e.name} · {e.points} điểm
                    </li>
                  ))}
                </ol>
              )}
              {view.board.mine && !view.board.top.some((e) => e.mine) && <p className="mt-1 text-sm">Bạn: hạng {view.board.mine.rank} · {view.board.mine.points} điểm</p>}
            </section>
          </Panel>
        </div>
      </div>
      <MobileBar slots={slots} ready={ready} tried={tried} onCombine={combine} />
    </main>
    </CatalogContext.Provider>
  );
}

/** Điện thoại: thanh ghép cố định ở đáy để chọn ở Vạn Vật Lục xong bấm ngay, không phải cuộn lên. */
function MobileBar({ slots, ready, tried, onCombine }: { slots: Slots; ready: boolean; tried: boolean; onCombine: () => void }) {
  const catalog = useCatalog();
  const label = (id: NodeId | null) => (id ? nameOf(catalog, id) : "…");
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--atlas-border)] bg-[var(--atlas-wood)]/95 px-4 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-sm" aria-hidden>
          {label(slots[0])} <span className="text-[var(--atlas-muted)]">+</span> {label(slots[1])}
          {tried && <span className="block text-xs text-[var(--atlas-muted)]">Đã ghép cặp này ở lần trước</span>}
        </p>
        <button type="button" disabled={!ready} onClick={onCombine} className={buttonVariants({ className: "min-h-11 shrink-0 px-5" })}>
          {tried ? "Vẫn ghép" : "Hợp Nguyên"}
        </button>
      </div>
    </div>
  );
}

function Panel({ id, title, children, className = "", hidden = false }: { id: string; title: React.ReactNode; children: React.ReactNode; className?: string; hidden?: boolean }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`atlas-frame atlas-frame-wood relative flex min-w-0 flex-col gap-3 p-4 lg:self-start ${hidden ? "hidden lg:flex" : ""} ${className}`}
    >
      <AtlasCorners size="size-5" />
      <h2 id={`${id}-title`} className="atlas-title font-serif text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function NodeChip({ node, onPick, badge, count }: { node: CatalogNode; onPick: (id: NodeId) => void; badge?: boolean; count?: number }) {
  return (
    <button
      type="button"
      onClick={() => onPick(node.id)}
      aria-label={`${node.nameVi}${count !== undefined ? `, còn ${count}` : ""}${badge ? ", còn công thức chưa tìm" : ""}`}
      className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-[var(--atlas-border-soft)] bg-[var(--atlas-wood-lo)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--atlas-gold)] focus-visible:outline-2 focus-visible:outline-[var(--atlas-gold-hi)]"
    >
      <NodeGlyph node={node} />
      <span className="flex-1">{node.nameVi}</span>
      {count !== undefined && <span aria-hidden className="text-xs text-[var(--atlas-muted)]">×{count}</span>}
      {badge && <span aria-hidden className="size-2 shrink-0 rounded-full bg-[var(--atlas-gold-hi)]" title="Còn công thức chưa tìm" />}
    </button>
  );
}

/** Yếu tố có tranh riêng ở public/art/tam-tuong-ky/yeu-to/<mã yếu tố>.webp. */
const NODE_ART: ReadonlySet<NodeId> = new Set([
  "know.daiCoViet",
  "know.doHoPhu",
  "know.duongLam",
  "know.guardRoad",
  "know.hoaLuHerbs",
  "know.hoaLuy",
  "know.hoiHo",
  "know.magic",
  "know.martial",
  "know.medicine",
  "know.ngoGia",
  "know.outerArmor",
  "know.phaGiap",
  "know.phongChau",
  "know.reedBanner",
  "know.riverGuard",
  "know.royalSeal",
  "know.steadfast",
  "know.stratagem",
  "know.tamDai",
  "know.teGiang",
  "know.tenCircuits",
  "know.tienDu",
  "know.tigerLeaves",
  "know.troops",
  "know.wandering",
  "know.warManual",
  "know.whiteTiger",
  "mat.armor",
  "mat.bamboo",
  "mat.bambooSlips",
  "mat.blackBronze",
  "mat.boat",
  "mat.boulder",
  "mat.bridge",
  "mat.charcoal",
  "mat.cloth",
  "mat.cloud",
  "mat.commandFlag",
  "mat.dew",
  "mat.estuary",
  "mat.forgedIron",
  "mat.fortress",
  "mat.gourd",
  "mat.grain",
  "mat.granary",
  "mat.herbs",
  "mat.hoaLu",
  "mat.ink",
  "mat.jadeStone",
  "mat.lake",
  "mat.mountain",
  "mat.rampart",
  "mat.reed",
  "mat.road",
  "mat.seal",
  "mat.storm",
  "mat.village",
  "mat.waterOrb",
  "mat.weapon",
  "role.hybrid",
]);

/**
 * Tranh của yếu tố, nếu có. Không có tranh riêng thì tri thức sơ học và node vai trò (tri thức nghề nhuộm hệ) dùng tranh
 * của nghề ở public/art/tam-tuong-ky/tri-thuc-nghe/<nghề>.webp.
 */
const SKILL_NODE_PREFIX = "know.skill.";

function nodeArt(node: CatalogNode): string | undefined {
  if (NODE_ART.has(node.id)) return `/art/tam-tuong-ky/yeu-to/${node.id}.webp`;
  // Tuyệt chiêu Gói 3 (`know.skill.<mã tướng>`) dùng ảnh kỹ năng ô 4 của chính tướng đó.
  if (node.id.startsWith(SKILL_NODE_PREFIX)) {
    const file = personalSkillArtFile(node.id.slice(SKILL_NODE_PREFIX.length));
    if (file) return `/art/skills/${file}.webp`;
  }
  const profession = node.professionHint ?? (node.role?.hybrid ? undefined : node.role?.profession);
  return profession && `/art/tam-tuong-ky/tri-thuc-nghe/${profession}.webp`;
}

function NodeGlyph({ node, className = "size-6" }: { node: CatalogNode; className?: string }) {
  if (node.element) return <ElementIcon element={node.element} className={className} />;
  const art = nodeArt(node);
  if (art) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} aria-hidden focusable="false">
        <image href={art} width={24} height={24} />
      </svg>
    );
  }
  return (
    <span aria-hidden className={`${className} grid shrink-0 place-items-center rounded-full border border-[var(--atlas-bronze)] bg-[var(--atlas-paper-deep)] font-serif text-xs font-bold text-[var(--atlas-ink)]`}>
      {node.nameVi.charAt(0)}
    </span>
  );
}

function Library({
  nodes: all,
  onPick,
  hidden,
  badges,
  counts,
  units,
}: {
  nodes: readonly CatalogNode[];
  onPick: (id: NodeId) => void;
  hidden: boolean;
  /** Chế độ Thường: dấu “còn công thức chưa tìm” (L5-4). */
  badges?: ReadonlySet<NodeId>;
  /** Chế độ Hạng: số đơn vị trong kho tuần; nguyên tố hiện số đơn vị trong túi. */
  counts?: Readonly<Record<NodeId, number>>;
  units?: number;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const nodes = filterNodes(all, query, group);
  const groups = groupsOf(all);
  return (
    <Panel id="ttk-library" title="Vạn Vật Lục" hidden={hidden} className="lg:order-first">
      <label className="flex flex-col gap-1 text-sm">
        <span className="sr-only">Tìm yếu tố</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm yếu tố, ví dụ: thap dao"
          className="min-h-11 rounded-lg border border-[var(--atlas-border-soft)] bg-[var(--atlas-wood-lo)] px-3 text-[var(--atlas-ink-on-wood)] placeholder:text-[var(--atlas-muted)]"
        />
      </label>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo nhóm">
        {[{ id: null, name: "Tất cả" }, ...groups].map((g) => (
          <button
            key={g.id ?? "all"}
            type="button"
            aria-pressed={group === g.id}
            onClick={() => setGroup(g.id)}
            className={`min-h-9 rounded-full border px-3 text-xs ${group === g.id ? "border-[var(--atlas-gold)] bg-[var(--atlas-wood-hi)] text-[var(--atlas-title)]" : "border-[var(--atlas-border-soft)]"}`}
          >
            {g.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--atlas-muted)]">
        Bấm một yếu tố để đặt vào ô trước, bấm tiếp để đặt vào ô sau.
        {units !== undefined && ` Bảy nguyên tố dùng chung túi (còn ${units} đơn vị).`}
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {nodes.map((n) => (
          <li key={n.id}>
            <NodeChip
              node={n}
              onPick={onPick}
              badge={badges?.has(n.id)}
              count={counts && n.kind !== "element" ? counts[n.id] : undefined}
            />
          </li>
        ))}
      </ul>
      {nodes.length === 0 && <p className="text-sm text-[var(--atlas-muted)]">Không có yếu tố nào khớp.</p>}
    </Panel>
  );
}

function Altar(props: {
  view: TtkView;
  slots: Slots;
  ready: boolean;
  pending: boolean;
  notice: Notice | null;
  recent: readonly string[];
  tried: boolean;
  onClear: (i: 0 | 1) => void;
  onSwap: () => void;
  onCombine: () => void;
  onHint: (level: HintLevel) => void;
  onOpenSession: () => void;
}) {
  const { view, slots, ready, pending, notice, recent } = props;
  const session = view.session;
  const toneClass =
    notice?.tone === "hero" || notice?.tone === "discovery"
      ? "border-[var(--atlas-gold-hi)] text-[var(--atlas-title)] motion-safe:animate-[ttk-reveal_0.4s_ease-out]"
      : notice?.tone === "invalid"
        ? "border-[var(--atlas-red-hi)] text-[var(--atlas-ink-on-wood)]"
        : "border-[var(--atlas-border-soft)] text-[var(--atlas-ink-on-wood)]/90";
  return (
    <Panel id="ttk-altar" title="Đài Hợp Nguyên" className="lg:sticky lg:top-4 lg:self-start">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Slot label="Ô trước" id={slots[0]} onClear={() => props.onClear(0)} />
        <button
          type="button"
          onClick={props.onSwap}
          aria-label="Đổi chỗ ô trước và ô sau"
          className="grid size-11 place-items-center rounded-full border border-[var(--atlas-border-soft)] font-serif text-lg hover:border-[var(--atlas-gold)]"
        >
          ⇄
        </button>
        <Slot label="Ô sau" id={slots[1]} onClear={() => props.onClear(1)} />
      </div>
      <p className="text-xs text-[var(--atlas-muted)]">Thứ tự ô có nghĩa: “Mộc + Thủy” khác “Thủy + Mộc”.</p>
      {session && props.tried && <TriedWarning cost="trừ 1 lần ghép" />}
      {session ? (
        <button
          type="button"
          disabled={!ready}
          aria-busy={pending}
          onClick={props.onCombine}
          className={buttonVariants({ className: "min-h-12 text-lg tracking-[0.12em] uppercase" })}
        >
          {props.tried ? "Vẫn hợp nguyên" : "Hợp Nguyên"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending || view.tickets < 1}
          onClick={props.onOpenSession}
          className={buttonVariants({ className: "min-h-12 text-lg" })}
        >
          Mở lượt mới · 1 phiếu
        </button>
      )}
      <div aria-live="polite" role="status" className={`min-h-12 rounded-lg border px-3 py-2 text-sm ${toneClass}`}>
        {notice?.text ?? (session ? "Chọn hai yếu tố rồi bấm Hợp Nguyên." : view.tickets > 0 ? "Mở lượt để bắt đầu ghép." : ERROR_TEXT.noTicket)}
      </div>
      <p className="text-sm">
        {session ? (
          <>
            Lượt này còn <strong className="text-[var(--atlas-title)]">{session.combinesLeft}</strong>/{session.combinesPerSession} lần ghép
          </>
        ) : (
          <>Mỗi lượt 15 lần ghép; ghép trùng công thức đã biết không trừ lần.</>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>Gợi ý hôm nay: {view.hintsLeft}/{view.hintsPerDay}</span>
        <button type="button" disabled={pending || view.hintsLeft <= 0} onClick={() => props.onHint(1)} className="min-h-11 rounded border border-[var(--atlas-border-soft)] px-3 disabled:opacity-50">
          Gợi ý nhóm
        </button>
        <button type="button" disabled={pending || view.hintsLeft <= 0} onClick={() => props.onHint(2)} className="min-h-11 rounded border border-[var(--atlas-border-soft)] px-3 disabled:opacity-50">
          Gợi ý nguyên liệu
        </button>
      </div>
      {recent.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-[var(--atlas-muted)]">Lần ghép gần đây</summary>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            {recent.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </details>
      )}
    </Panel>
  );
}

function Slot({ label, id, onClear }: { label: string; id: NodeId | null; onClear: () => void }) {
  const catalog = useCatalog();
  const node = id ? catalog.nodes.get(id) : undefined;
  return (
    <div className="atlas-frame atlas-frame-paper flex min-h-24 flex-col items-center justify-center gap-1 p-2 text-center">
      <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--atlas-ink-soft)]">{label}</span>
      {node ? (
        <>
          <NodeGlyph node={node} className="size-8" />
          <span className="font-serif font-bold text-[var(--atlas-ink)]">{node.nameVi}</span>
          <button type="button" onClick={onClear} aria-label={`Bỏ ${node.nameVi} khỏi ${label.toLowerCase()}`} className="min-h-8 px-2 text-xs text-[var(--atlas-red)] underline">
            Bỏ
          </button>
        </>
      ) : (
        <span className="text-sm text-[var(--atlas-ink-soft)]">Trống</span>
      )}
    </div>
  );
}

function Ledger({ entries, found, hidden }: { entries: readonly LedgerEntry[]; found: number; hidden: boolean }) {
  // Nhiều gói thì chia mục theo gói (A-15: bóng mờ đủ số tướng của từng gói).
  const packs = [...new Set(entries.map((e) => e.pack))];
  if (packs.length > 1)
    return (
      <Panel id="ttk-ledger" title={`Tướng Lục · ${found}/${entries.length}`} hidden={hidden}>
        {packs.map((pack) => {
          const list = entries.filter((e) => e.pack === pack);
          return (
            <section key={pack} aria-label={PACK_NAMES[pack] ?? pack} className="flex flex-col gap-2">
              <h3 className="font-serif font-bold text-[var(--atlas-title)]">
                {PACK_NAMES[pack] ?? pack} · {list.filter((e) => e.found).length}/{list.length}
              </h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {list.map((e) => (
                  <li key={e.nodeId}>
                    <LedgerCard entry={e} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <p className="text-xs text-[var(--atlas-muted)]">Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội.</p>
      </Panel>
    );
  return (
    <Panel id="ttk-ledger" title={`Tướng Lục · ${found}/${entries.length}`} hidden={hidden}>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {entries.map((e) => (
          <li key={e.nodeId}>
            <LedgerCard entry={e} />
          </li>
        ))}
      </ul>
      <p className="text-xs text-[var(--atlas-muted)]">Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội.</p>
    </Panel>
  );
}

function LedgerCard({ entry }: { entry: LedgerEntry }) {
  if (!entry.found)
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--atlas-border-soft)] p-3 opacity-80">
        <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--atlas-wood-lo)] font-serif text-2xl text-[var(--atlas-muted)]">?</span>
        <div>
          <p className="font-serif font-bold">Tướng chưa tìm thấy</p>
          <p className="text-xs text-[var(--atlas-muted)]">{TIER_NAME[entry.tier]}</p>
        </div>
      </div>
    );
  const { info } = entry;
  return (
    <article
      className="flex items-start gap-3 rounded-lg border border-[var(--atlas-gold)] bg-[var(--atlas-wood-hi)] p-3"
    >
      <Portrait id={entry.characterId} element={info.element} profession={info.profession} className="size-14 shrink-0" />
      <div className="min-w-0">
        <h3 className="font-serif font-bold text-[var(--atlas-title)]">{entry.name}</h3>
        <p className="text-xs text-[var(--atlas-muted)]">{TIER_NAME[entry.tier]}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="flex items-center gap-1"><ProfessionIcon profession={info.profession} /> {PROFESSION_DISPLAY_NAME[info.profession]}</span>
          <span className="flex items-center gap-1"><ElementIcon element={info.element} /> {ELEMENT_NAME[info.element]}</span>
        </p>
        {entry.symbols.length > 0 && <p className="mt-1 text-xs">Dấu tích: {entry.symbols.join(", ")}</p>}
      </div>
    </article>
  );
}
