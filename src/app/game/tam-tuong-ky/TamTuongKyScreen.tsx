"use client";

// Tầm Tướng Ký (LT-03): Vạn Vật Lục + Đài Hợp Nguyên + Tướng Lục, chế độ Thường. Bản xem trước chạy engine ở trình duyệt,
// chưa lưu và chưa tốn phiếu; server (phiếu, lượt, gợi ý theo ngày, sổ theo tài khoản) là LT-04, chế độ Hạng là LT-06.
// Luật: docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md. Giao diện: docs/05-ui-ux/screens/tam-tuong-ky.md.

import { useMemo, useState } from "react";
import { PROFESSION_DISPLAY_NAME, type Element } from "@/core/battle";
import {
  SLICE_PACK,
  buildCatalog,
  chargesCombine,
  combineNormal,
  hintFor,
  initialDiscovery,
  type CatalogNode,
  type DiscoveryState,
  type HintLevel,
  type NodeId,
} from "@/core/tam-tuong-ky";
import { AtlasCorners } from "../campaign/AtlasFrame";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import {
  COMBINES_PER_SESSION,
  EMPTY_SLOTS,
  HINTS_PER_DAY,
  TIER_NAME,
  clearSlot,
  hintText,
  ledger,
  libraryGroups,
  libraryNodes,
  nameOf,
  noticeFor,
  pickInto,
  swapSlots,
  type LedgerEntry,
  type Notice,
  type Slots,
} from "./altar";

const catalog = buildCatalog(SLICE_PACK);

const ELEMENT_NAME: Readonly<Record<Element, string>> = { kim: "Kim", moc: "Mộc", thuy: "Thủy", hoa: "Hỏa", tho: "Thổ", loi: "Lôi", phong: "Phong" };

type Tab = "library" | "ledger";

export default function TamTuongKyScreen() {
  const [state, setState] = useState<DiscoveryState>(() => initialDiscovery(catalog));
  const [slots, setSlots] = useState<Slots>(EMPTY_SLOTS);
  const [left, setLeft] = useState(COMBINES_PER_SESSION);
  const [hints, setHints] = useState(HINTS_PER_DAY);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [recent, setRecent] = useState<readonly string[]>([]);
  const [tab, setTab] = useState<Tab>("library");

  const entries = useMemo(() => ledger(catalog, state), [state]);
  const found = entries.filter((e) => e.found).length;
  const ready = slots[0] !== null && slots[1] !== null && left > 0;

  const combine = () => {
    const [a, b] = slots;
    if (a === null || b === null || left <= 0) return;
    const out = combineNormal(catalog, state, a, b);
    if (chargesCombine(out)) setLeft((n) => n - 1);
    setState(out.next);
    const n = noticeFor(catalog, out);
    setNotice(n);
    setRecent((r) => [`${nameOf(catalog, a)} + ${nameOf(catalog, b)}: ${n.text}`, ...r].slice(0, 5));
    if (out.status === "created" && out.isCharacter) setTab("ledger");
    setSlots(EMPTY_SLOTS);
  };

  const askHint = (level: HintLevel) => {
    if (hints <= 0) return;
    setHints((n) => n - 1);
    setNotice({ tone: "repeat", text: hintText(hintFor(catalog, state, level)) });
  };

  const newSession = () => {
    setLeft(COMBINES_PER_SESSION);
    setNotice({ tone: "repeat", text: "Lượt mới (bản xem trước chưa trừ phiếu)." });
  };

  return (
    <main className="campaign-atlas flex flex-1 flex-col bg-[#17110e] pb-28 text-[var(--atlas-ink-on-wood)] lg:pb-10">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 pt-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="atlas-title font-serif text-2xl font-bold sm:text-3xl">Tầm Tướng Ký</h1>
            <p className="text-sm text-[var(--atlas-muted)]">Công thức biểu trưng của trò chơi, không phải diễn giải sử học.</p>
          </div>
          <p className="rounded border border-[var(--atlas-border-soft)] px-2 py-1 text-xs text-[var(--atlas-ink-on-wood)]/85">
            Bản xem trước · chưa lưu, chưa tốn phiếu
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,26fr)_minmax(20rem,44fr)_minmax(16rem,30fr)]">
          <Altar
            slots={slots}
            left={left}
            hints={hints}
            ready={ready}
            notice={notice}
            recent={recent}
            onClear={(i) => setSlots((s) => clearSlot(s, i))}
            onSwap={() => setSlots(swapSlots)}
            onCombine={combine}
            onHint={askHint}
            onNewSession={newSession}
          />

          <div role="group" aria-label="Chọn sổ" className="flex gap-2 lg:hidden">
            {(["library", "ledger"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                aria-controls={`ttk-${t}`}
                onClick={() => setTab(t)}
                className={`min-h-11 flex-1 rounded-lg border px-3 font-serif font-semibold ${tab === t ? "border-[var(--atlas-gold)] bg-[var(--atlas-wood-hi)] text-[var(--atlas-title)]" : "border-[var(--atlas-border-soft)] text-[var(--atlas-ink-on-wood)]/80"}`}
              >
                {t === "library" ? "Vạn Vật Lục" : `Tướng Lục ${found}/${entries.length}`}
              </button>
            ))}
          </div>

          <Library state={state} onPick={(id) => setSlots((s) => pickInto(s, id))} hidden={tab !== "library"} />
          <Ledger entries={entries} found={found} hidden={tab !== "ledger"} />
        </div>
      </div>
      <MobileBar slots={slots} ready={ready} onCombine={combine} />
    </main>
  );
}

/** Điện thoại: thanh ghép cố định ở đáy để chọn ở Vạn Vật Lục xong bấm ngay, không phải cuộn lên. */
function MobileBar({ slots, ready, onCombine }: { slots: Slots; ready: boolean; onCombine: () => void }) {
  const label = (id: NodeId | null) => (id ? nameOf(catalog, id) : "…");
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--atlas-border)] bg-[var(--atlas-wood)]/95 px-4 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-sm" aria-hidden>
          {label(slots[0])} <span className="text-[var(--atlas-muted)]">+</span> {label(slots[1])}
        </p>
        <button type="button" disabled={!ready} onClick={onCombine} className="home-cta min-h-11 shrink-0 rounded-lg px-5 font-serif font-bold disabled:opacity-50">
          Hợp Nguyên
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

function NodeChip({ node, onPick }: { node: CatalogNode; onPick: (id: NodeId) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(node.id)}
      className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-[var(--atlas-border-soft)] bg-[var(--atlas-wood-lo)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--atlas-gold)] focus-visible:outline-2 focus-visible:outline-[var(--atlas-gold-hi)]"
    >
      <NodeGlyph node={node} />
      <span>{node.nameVi}</span>
    </button>
  );
}

function NodeGlyph({ node, className = "size-6" }: { node: CatalogNode; className?: string }) {
  if (node.element) return <ElementIcon element={node.element} className={className} />;
  return (
    <span aria-hidden className={`${className} grid shrink-0 place-items-center rounded-full border border-[var(--atlas-bronze)] bg-[var(--atlas-paper-deep)] font-serif text-xs font-bold text-[var(--atlas-ink)]`}>
      {node.nameVi.charAt(0)}
    </span>
  );
}

function Library({ state, onPick, hidden }: { state: DiscoveryState; onPick: (id: NodeId) => void; hidden: boolean }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const nodes = libraryNodes(catalog, state, query, group);
  const groups = libraryGroups(catalog, state);
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
      <p className="text-xs text-[var(--atlas-muted)]">Bấm một yếu tố để đặt vào ô trước, bấm tiếp để đặt vào ô sau.</p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {nodes.map((n) => (
          <li key={n.id}>
            <NodeChip node={n} onPick={onPick} />
          </li>
        ))}
      </ul>
      {nodes.length === 0 && <p className="text-sm text-[var(--atlas-muted)]">Không có yếu tố nào khớp.</p>}
    </Panel>
  );
}

function Altar(props: {
  slots: Slots;
  left: number;
  hints: number;
  ready: boolean;
  notice: Notice | null;
  recent: readonly string[];
  onClear: (i: 0 | 1) => void;
  onSwap: () => void;
  onCombine: () => void;
  onHint: (level: HintLevel) => void;
  onNewSession: () => void;
}) {
  const { slots, left, hints, ready, notice, recent } = props;
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
      <button
        type="button"
        disabled={!ready}
        onClick={props.onCombine}
        className="home-cta min-h-12 rounded-lg font-serif text-lg font-bold tracking-[0.12em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        Hợp Nguyên
      </button>
      <div aria-live="polite" role="status" className={`min-h-12 rounded-lg border px-3 py-2 text-sm ${toneClass}`}>
        {notice?.text ?? "Chọn hai yếu tố rồi bấm Hợp Nguyên."}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>
          Lượt này còn <strong className="text-[var(--atlas-title)]">{left}</strong>/{COMBINES_PER_SESSION} lần ghép
        </span>
        {left === 0 && (
          <button type="button" onClick={props.onNewSession} className="min-h-11 rounded border border-[var(--atlas-gold)] px-3 font-semibold">
            Lượt mới
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>Gợi ý hôm nay: {hints}/{HINTS_PER_DAY}</span>
        <button type="button" disabled={hints <= 0} onClick={() => props.onHint(1)} className="min-h-11 rounded border border-[var(--atlas-border-soft)] px-3 disabled:opacity-50">
          Gợi ý nhóm
        </button>
        <button type="button" disabled={hints <= 0} onClick={() => props.onHint(2)} className="min-h-11 rounded border border-[var(--atlas-border-soft)] px-3 disabled:opacity-50">
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
        {entry.symbols.length > 0 && <p className="mt-1 text-xs">Vật biểu trưng: {entry.symbols.join(", ")}</p>}
      </div>
    </article>
  );
}
