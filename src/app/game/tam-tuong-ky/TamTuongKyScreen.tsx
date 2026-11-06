"use client";

// Tầm Tướng Ký chế độ Thường: Vạn Vật Lục + Đài Hợp Nguyên + Tướng Lục. Phiếu, lượt, gợi ý và sổ khám phá nằm trên
// server theo tài khoản (LT-04, src/server/tamTuongKy.ts); màn chỉ gửi ý định và vẽ lại theo `view` server trả về.
// Chế độ Hạng là LT-06. Luật: docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md.
// Giao diện: docs/05-ui-ux/screens/tam-tuong-ky.md.

import { ModeBanner } from "@/components/game-ui";
import { ChoiceChip, buttonVariants } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { PROFESSION_DISPLAY_NAME, type Element } from "@/core/battle";
import { catalogForPack, openIngredients, rosterCharacter, type Catalog, type CatalogNode, type DiscoveryState, type HintLevel, type NodeId } from "@/core/tam-tuong-ky";
import { AtlasCorners } from "../campaign/AtlasFrame";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { personalSkillArtFile } from "../art/skills";
import { Portrait } from "../art/portraits";
import {
  EMPTY_SLOTS,
  TIER_NAME,
  altarResult,
  clearSlot,
  defaultLedgerGroup,
  discoveredNodes,
  filterNodes,
  groupsOf,
  hintText,
  ledger,
  ledgerGroup,
  ledgerGroups,
  nameOf,
  rankedNodes,
  noticeFor,
  pickInto,
  swapSlots,
  tutorialTip,
  type AltarResult,
  type LedgerEntry,
  type LedgerGroupId,
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

/** Máy tính (≥ lg, 1024px): số ô mỗi trang của Vạn Vật Lục và Tướng Lục lớn hơn. Server dựng theo máy tính. */
const DESKTOP = "(min-width: 1024px)";
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

/** Lần đánh dấu một mục (yếu tố mới, tướng vừa tìm thấy); `seq` tăng để chạy lại hiệu ứng và mở đúng trang. */
interface Focus {
  readonly id: NodeId;
  readonly seq: number;
}

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
  const [result, setResult] = useState<AltarResult | null>(null);
  const [flash, setFlash] = useState<Focus | null>(null);
  const [ledgerTab, setLedgerTab] = useState<LedgerGroupId | null>(null);
  const [ledgerFocus, setLedgerFocus] = useState<Focus | null>(null);
  const seq = useRef(0);
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
      const res = altarResult(r.response, ++seq.current, [a, b]);
      setResult(res);
      if (res?.kind === "new" && res.nodeId) setFlash({ id: res.nodeId, seq: res.seq });
      if (res?.kind === "hero" && res.nodeId) {
        // Tướng vừa tìm thấy: mở nhóm và trang có tướng đó trong Tướng Lục (mục 7.2).
        const characterId = catalog.nodes.get(res.nodeId)?.characterId;
        if (characterId) setLedgerTab(ledgerGroup(characterId));
        setLedgerFocus({ id: res.nodeId, seq: res.seq });
        setTab("ledger");
      }
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
            result={result}
            onUseResult={(id) => setSlots([id, null])}
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
            flash={flash}
          />
          <Ledger entries={entries} found={found} hidden={tab !== "ledger"} group={ledgerTab} onGroup={setLedgerTab} focus={ledgerFocus} />
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
  const [result, setResult] = useState<AltarResult | null>(null);
  const seq = useRef(0);
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
      setResult(altarResult({ ...res, status: res.status }, ++seq.current, [a, b], res.points));
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
          <Panel id="ttk-ranked-altar" title="Đài Hợp Nguyên">
            <SlotsRow slots={slots} busy={pending} result={result} onClear={(i) => setSlots((s) => clearSlot(s, i))} onSwap={() => setSlots(swapSlots)} />
            <ResultCard result={result} onUse={(id) => setSlots([id, null])} />
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

/**
 * Khung một cột. Không dùng `self-start` hay `sticky` (mục 7.3): ba cột cùng hàng lưới giãn bằng nhau, mép trên thẳng
 * hàng. Danh sách dài thì phân trang thay vì cuộn dài (mục 7.2, 7.6).
 */
function Panel({ id, title, children, className = "", hidden = false }: { id: string; title: React.ReactNode; children: React.ReactNode; className?: string; hidden?: boolean }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`atlas-frame atlas-frame-wood relative flex min-w-0 flex-col gap-3 p-4 ${hidden ? "hidden lg:flex" : ""} ${className}`}
    >
      <AtlasCorners size="size-5" />
      <h2 id={`${id}-title`} className="atlas-title font-serif text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** Ô yếu tố cao cố định (mục 7.6): tên tối đa 2 dòng, chấm vàng và ×n nằm góc trên phải, không chiếm chỗ của tên. */
function NodeChip({ node, onPick, badge, count, flash }: { node: CatalogNode; onPick: (id: NodeId) => void; badge?: boolean; count?: number; flash?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onPick(node.id)}
      title={node.nameVi}
      aria-label={`${node.nameVi}${count !== undefined ? `, còn ${count}` : ""}${badge ? ", còn công thức chưa tìm" : ""}`}
      className={`relative flex h-14 w-full items-center gap-2 rounded-lg border bg-[var(--atlas-wood-lo)] py-1 pr-4 pl-2.5 text-left transition-colors hover:border-[var(--atlas-gold)] focus-visible:outline-2 focus-visible:outline-[var(--atlas-gold-hi)] ${flash ? "border-[var(--atlas-gold-hi)] motion-safe:animate-[ttk-flash_0.9s_ease-out]" : "border-[var(--atlas-border-soft)]"}`}
    >
      <NodeGlyph node={node} className="size-7" />
      <span className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-tight">{node.nameVi}</span>
      {count !== undefined && <span aria-hidden className="absolute top-0.5 right-1.5 text-[10px] text-[var(--atlas-muted)] tabular-nums">×{count}</span>}
      {badge && <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--atlas-gold-hi)]" title="Còn công thức chưa tìm" />}
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
  flash = null,
}: {
  nodes: readonly CatalogNode[];
  onPick: (id: NodeId) => void;
  hidden: boolean;
  /** Chế độ Thường: dấu “còn công thức chưa tìm” (L5-4). */
  badges?: ReadonlySet<NodeId>;
  /** Chế độ Hạng: số đơn vị trong kho tuần; nguyên tố hiện số đơn vị trong túi. */
  counts?: Readonly<Record<NodeId, number>>;
  units?: number;
  /** Yếu tố vừa khám phá: mở trang có nó và nhấp nháy một lần (mục 7.5). */
  flash?: Focus | null;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const nodes = filterNodes(all, query, group);
  const groups = groupsOf(all);
  // 2 cột × 8 hàng trên máy tính, 12 ô trên điện thoại (mục 7.6). Đổi từ khóa/nhóm thì về trang 1 (key mới);
  // có yếu tố mới trong danh sách đang lọc thì mở trang có nó.
  const pageSize = useIsDesktop() ? 16 : 12;
  const flashIndex = flash ? nodes.findIndex((n) => n.id === flash.id) : -1;
  const listKey = `${query}|${group ?? ""}${flashIndex >= 0 ? `|${flash!.seq}` : ""}`;
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
      <LibraryPage
        key={listKey}
        nodes={nodes}
        pageSize={pageSize}
        initialPage={flashIndex >= 0 ? Math.floor(flashIndex / pageSize) : 0}
        onPick={onPick}
        badges={badges}
        counts={counts}
        flashId={flash?.id}
      />
      {nodes.length === 0 && <p className="text-sm text-[var(--atlas-muted)]">Không có yếu tố nào khớp.</p>}
    </Panel>
  );
}

function LibraryPage({
  nodes,
  pageSize,
  initialPage,
  onPick,
  badges,
  counts,
  flashId,
}: {
  nodes: readonly CatalogNode[];
  pageSize: number;
  initialPage: number;
  onPick: (id: NodeId) => void;
  badges?: ReadonlySet<NodeId>;
  counts?: Readonly<Record<NodeId, number>>;
  flashId?: NodeId;
}) {
  const paged = usePagedItems(nodes, pageSize, initialPage);
  return (
    <>
      <ul className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {paged.pageItems.map((n) => (
          <li key={n.id}>
            <NodeChip
              node={n}
              onPick={onPick}
              badge={badges?.has(n.id)}
              count={counts && n.kind !== "element" ? counts[n.id] : undefined}
              flash={n.id === flashId}
            />
          </li>
        ))}
      </ul>
      <PageControls paged={paged} label="Trang Vạn Vật Lục" className="mt-auto" />
    </>
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
  result: AltarResult | null;
  onUseResult: (id: NodeId) => void;
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
    <Panel id="ttk-altar" title="Đài Hợp Nguyên">
      <SlotsRow slots={slots} busy={pending} result={props.result} onClear={props.onClear} onSwap={props.onSwap} />
      <ResultCard result={props.result} onUse={props.onUseResult} />
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

/**
 * Ô trước ⇄ ô sau. Có kết quả mới thì icon hai yếu tố vừa ghép trượt vào giữa rồi tan (mục 7.5; ghép hụt thì không
 * trượt, thẻ kết quả tự vẽ hai icon tách ra). Lớp hiệu ứng nằm đè lên hàng ô, không đổi bố cục.
 */
function SlotsRow({ slots, busy, result, onClear, onSwap }: { slots: Slots; busy: boolean; result: AltarResult | null; onClear: (i: 0 | 1) => void; onSwap: () => void }) {
  const catalog = useCatalog();
  const merging = result && result.kind !== "miss" ? result.from.map((id) => catalog.nodes.get(id)) : null;
  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <Slot label="Ô trước" id={slots[0]} busy={busy} onClear={() => onClear(0)} />
      <button
        type="button"
        onClick={onSwap}
        aria-label="Đổi chỗ ô trước và ô sau"
        className="grid size-11 place-items-center rounded-full border border-[var(--atlas-border-soft)] font-serif text-lg hover:border-[var(--atlas-gold)]"
      >
        ⇄
      </button>
      <Slot label="Ô sau" id={slots[1]} busy={busy} onClear={() => onClear(1)} />
      {merging && merging[0] && merging[1] && (
        <div key={result!.seq} aria-hidden className="pointer-events-none absolute inset-0 hidden motion-safe:block [--ttk-merge-dx:min(9rem,24vw)]">
          <span className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2">
            <span className="block opacity-0 motion-safe:animate-[ttk-merge-l_450ms_ease-in]">
              <NodeGlyph node={merging[0]} className="size-12" />
            </span>
          </span>
          <span className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2">
            <span className="block opacity-0 motion-safe:animate-[ttk-merge-r_450ms_ease-in]">
              <NodeGlyph node={merging[1]} className="size-12" />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Ô trước/ô sau cao cố định, ba hàng cố định: nhãn, icon, tên tối đa 2 dòng (mục 7.4). Ô có yếu tố là nút: bấm để bỏ,
 * hover/focus hiện ✕ và viền đỏ nhạt. Ô trống giữ chỗ icon bằng vòng nét đứt và không bấm được.
 */
function Slot({ label, id, busy, onClear }: { label: string; id: NodeId | null; busy: boolean; onClear: () => void }) {
  const catalog = useCatalog();
  const node = id ? catalog.nodes.get(id) : undefined;
  const frame = `atlas-frame atlas-frame-paper relative flex h-28 w-full flex-col items-center gap-1 p-2 text-center lg:h-36 lg:gap-1.5 lg:pt-3 ${busy && node ? "ring-2 ring-[var(--atlas-gold-hi)] motion-safe:animate-[ttk-shake_0.3s_ease-in-out_infinite]" : ""}`;
  const content = (
    <>
      <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--atlas-ink-soft)]">{label}</span>
      <span className="grid size-10 shrink-0 place-items-center lg:size-12">
        {node ? (
          <NodeGlyph node={node} className="size-10 lg:size-12" />
        ) : (
          <span aria-hidden className="size-9 rounded-full border-2 border-dashed border-[var(--atlas-ink-soft)]/45 lg:size-11" />
        )}
      </span>
      <span className={`line-clamp-2 font-serif text-sm leading-tight ${node ? "font-bold text-[var(--atlas-ink)]" : "text-[var(--atlas-ink-soft)]"}`}>{node?.nameVi ?? "Trống"}</span>
    </>
  );
  if (!node) return <div className={frame}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onClear}
      title={node.nameVi}
      aria-label={`Bỏ ${node.nameVi} khỏi ${label.toLowerCase()}`}
      className={`${frame} group cursor-pointer transition-shadow hover:ring-2 hover:ring-[var(--atlas-red-hi)]/60 focus-visible:ring-2 focus-visible:ring-[var(--atlas-red-hi)]/60 focus-visible:outline-none`}
    >
      {content}
      <span aria-hidden className="absolute top-1 right-2 text-sm font-bold text-[var(--atlas-red)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        ✕
      </span>
    </button>
  );
}

/**
 * Thẻ kết quả dưới hai ô, cao cố định để không đẩy bố cục (mục 7.5). Hiện sau khi hai icon trượt vào giữa xong.
 * Bấm thẻ khi là yếu tố thì đặt yếu tố đó vào ô trước để ghép tiếp. Chữ cho người đọc màn hình vẫn ở ô `aria-live`.
 */
function ResultCard({ result, onUse }: { result: AltarResult | null; onUse: (id: NodeId) => void }) {
  const catalog = useCatalog();
  const box = "relative flex h-20 items-center gap-3 rounded-lg border px-3 text-left";
  if (!result) return <div className={`${box} border-dashed border-[var(--atlas-border-soft)] text-sm text-[var(--atlas-muted)]`}>Thứ ghép ra sẽ hiện ở đây.</div>;
  const appear = "motion-safe:animate-[ttk-reveal_0.4s_ease-out_450ms_backwards]";
  if (result.kind === "miss") {
    const [a, b] = result.from.map((id) => catalog.nodes.get(id));
    return (
      <div key={result.seq} className={`${box} border-[var(--atlas-border-soft)] text-sm`}>
        <span aria-hidden className="relative flex w-20 shrink-0 items-center justify-center gap-2 grayscale">
          <span className="motion-safe:animate-[ttk-split-l_0.6s_ease-out_forwards]">{a && <NodeGlyph node={a} className="size-8" />}</span>
          <span className="motion-safe:animate-[ttk-split-r_0.6s_ease-out_forwards]">{b && <NodeGlyph node={b} className="size-8" />}</span>
          <span className="absolute inset-0 m-auto size-10 rounded-full bg-[radial-gradient(circle,rgb(180_170_160/0.55),transparent_70%)] opacity-0 motion-safe:animate-[ttk-smoke_0.9s_ease-out]" />
        </span>
        <span className="text-[var(--atlas-muted)]">Chưa tìm được mối liên hệ</span>
      </div>
    );
  }
  const node = result.nodeId ? catalog.nodes.get(result.nodeId) : undefined;
  if (!node) return <div className={`${box} border-[var(--atlas-border-soft)]`} />;
  if (result.kind === "hero") {
    const info = node.characterId ? rosterCharacter(node.characterId) : undefined;
    return (
      <div key={result.seq} className={`${box} border-[var(--atlas-gold-hi)] bg-[var(--atlas-wood-hi)] ${appear}`}>
        <span className="rounded-full motion-safe:animate-[ttk-glow_1.1s_ease-out_450ms_2]">
          {info && node.characterId ? <Portrait id={node.characterId} element={info.element} profession={info.profession} className="size-14 shrink-0" /> : null}
        </span>
        <span className="min-w-0">
          <span className="block font-serif font-bold text-[var(--atlas-title)]">{node.nameVi}</span>
          <span className="block text-xs text-[var(--atlas-muted)]">
            {TIER_NAME[node.tier ?? "thuong"]} · đã ghi vào Tướng Lục{result.points ? ` · +${result.points} điểm` : ""}
          </span>
        </span>
      </div>
    );
  }
  const fresh = result.kind === "new";
  return (
    <button
      key={result.seq}
      type="button"
      onClick={() => onUse(node.id)}
      aria-label={`${node.nameVi}${fresh ? ", mới" : ", đã biết"}. Đặt vào ô trước`}
      title="Đặt vào ô trước để ghép tiếp"
      className={`${box} w-full hover:border-[var(--atlas-gold)] ${fresh ? "border-[var(--atlas-gold-hi)]" : "border-[var(--atlas-border-soft)]"} ${appear}`}
    >
      <span className={`grid shrink-0 place-items-center rounded-full ${fresh ? "motion-safe:animate-[ttk-glow_1s_ease-out_450ms]" : ""}`}>
        <NodeGlyph node={node} className="size-16" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 font-serif font-bold leading-tight">{node.nameVi}</span>
        <span className="block text-xs text-[var(--atlas-muted)]">Bấm để đặt vào ô trước</span>
      </span>
      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${fresh ? "border-[var(--atlas-gold-hi)] text-[var(--atlas-title)]" : "border-[var(--atlas-border-soft)] text-[var(--atlas-muted)]"}`}>
        {fresh ? "Mới" : "Đã biết"}
      </span>
    </button>
  );
}

/**
 * Tướng Lục chia nhóm theo quan hệ (mục 7.2): hàng chip nhóm kèm x/y, dòng giới thiệu, danh sách phân trang
 * 6 thẻ (máy tính) / 4 thẻ (điện thoại). Gói phát hành không hiện ở đây. Tướng vừa tìm thấy: mở nhóm và trang của nó.
 */
function Ledger({
  entries,
  found,
  hidden,
  group,
  onGroup,
  focus,
}: {
  entries: readonly LedgerEntry[];
  found: number;
  hidden: boolean;
  group: LedgerGroupId | null;
  onGroup: (g: LedgerGroupId) => void;
  focus: Focus | null;
}) {
  const groups = ledgerGroups(entries);
  const active = groups.find((g) => g.id === group) ?? groups.find((g) => g.id === defaultLedgerGroup(groups)) ?? groups[0];
  const pageSize = useIsDesktop() ? 6 : 4;
  const focusIndex = active && focus ? active.entries.findIndex((e) => e.nodeId === focus.id) : -1;
  return (
    <Panel id="ttk-ledger" title={`Tướng Lục · ${found}/${entries.length}`} hidden={hidden}>
      <div role="group" aria-label="Nhóm tướng" className="flex flex-wrap gap-1.5">
        {groups.map((g) => (
          <ChoiceChip key={g.id} selected={g.id === active?.id} onClick={() => onGroup(g.id)}>
            {g.name} <span className="tabular-nums opacity-80">{g.found}/{g.entries.length}</span>
          </ChoiceChip>
        ))}
      </div>
      {active && (
        <>
          <p className="text-xs text-[var(--atlas-muted)] italic">{active.intro}</p>
          <LedgerPage
            key={`${active.id}${focusIndex >= 0 ? `|${focus!.seq}` : ""}`}
            entries={active.entries}
            pageSize={pageSize}
            initialPage={focusIndex >= 0 ? Math.floor(focusIndex / pageSize) : 0}
            focusId={focusIndex >= 0 ? focus!.id : undefined}
          />
        </>
      )}
      <p className="text-xs text-[var(--atlas-muted)]">Tìm thấy chân dung chỉ ghi vào Tướng Lục, không thêm tướng vào đội.</p>
    </Panel>
  );
}

function LedgerPage({ entries, pageSize, initialPage, focusId }: { entries: readonly LedgerEntry[]; pageSize: number; initialPage: number; focusId?: NodeId }) {
  const paged = usePagedItems(entries, pageSize, initialPage);
  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {paged.pageItems.map((e) => (
          <li key={e.nodeId} className={e.nodeId === focusId ? "rounded-lg motion-safe:animate-[ttk-glow_1.1s_ease-out_2]" : undefined}>
            <LedgerCard entry={e} />
          </li>
        ))}
      </ul>
      <PageControls paged={paged} label="Trang Tướng Lục" className="mt-auto" />
    </>
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
