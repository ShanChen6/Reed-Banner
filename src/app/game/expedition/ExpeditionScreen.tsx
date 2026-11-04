"use client";

// Viễn Chinh: chọn sa bàn và bậc, chia 6 tướng làm hai đạo, rồi điều quân trên sa bàn. Mọi luật chạy ở server
// (/api/expedition); màn này chỉ hiển thị và gửi ý định. Luật: docs/02-game-modes/expedition/01-vien-chinh-gdd.md.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import {
  EXPEDITION_PINCER_HP,
  EXPEDITION_REINFORCE_PER_DAY,
  EXPEDITION_REST_HEAL,
  EXPEDITION_VILLAGE_HEAL,
  EXPEDITION_GRANARY_FOOD,
  MAIN_ID,
  companionById,
  expeditionNeighbors,
  type ArmyIndex,
  type Element,
  type ExpeditionMap,
  type ExpeditionNodeKind,
  type ExpeditionResult,
  type ExpeditionRun,
  type ExpeditionTier,
  type Profession,
  type Profile,
} from "@/core";
import { ElementIcon, FoodIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ONLINE_BATTLE_KEY } from "../battle/online";
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME, SLOT_NAME, TIER_COLOR_NAME } from "../battle/labels";
import { useScene } from "../SceneContext";

interface TierView {
  readonly tier: ExpeditionTier;
  readonly name: string;
  readonly level: number;
  readonly firstGold: number;
  readonly repeatGold: number;
  readonly unlocked: boolean;
  readonly stars: number;
  readonly bestDays: number | null;
}

type MapView = ExpeditionMap & { readonly tiers: readonly TierView[] };

interface FoePreview {
  readonly id: string;
  readonly name: string;
  readonly element: Element;
  readonly profession: Profession;
  readonly level: number;
  readonly maxHp: number;
  readonly hpRatio: number;
}

interface EncounterPreview {
  readonly node: string;
  readonly difficulty: keyof typeof DIFFICULTY_NAME;
  readonly power: number;
  readonly pincer: boolean;
  readonly foes: readonly FoePreview[];
}

interface Overview {
  readonly enabled: boolean;
  readonly maps: readonly MapView[];
  readonly run: Omit<ExpeditionRun, "seed"> | null;
  readonly runsLeft: number;
  readonly runsPerDay: number;
  readonly encounters: Readonly<Record<string, readonly [EncounterPreview, EncounterPreview]>>;
}

interface ApiResult {
  readonly ok?: boolean;
  readonly kind?: "moved" | "battle";
  readonly id?: string;
  readonly error?: string;
}

const ERROR_TEXT: Record<string, string> = {
  runActive: "Đang có một lượt viễn chinh. Hãy đi tiếp hoặc rút quân trước.",
  tierLocked: "Bậc này chưa mở: hãy thắng bậc trước của sa bàn này.",
  duplicate: "Mỗi tướng chỉ đi một đạo.",
  notOwned: "Có tướng chưa chiêu mộ.",
  badArmy: "Đạo Chính cần 2 tướng đi cùng Đinh Bộ Lĩnh, Biệt đạo cần 3 tướng.",
  notAdjacent: "Chỉ tiến được sang ô kề vị trí của đạo quân.",
  armyDown: "Cả đạo đang gục. Hãy cho đạo này nghỉ (đạo kia tiến quân hoặc đóng quân) để hồi sức.",
  notMarching: "Lượt viễn chinh đã kết thúc hoặc đang có trận.",
  conflict: "Dữ liệu vừa đổi ở nơi khác. Đang tải lại.",
  dailyLimit: "Hôm nay đã hết lượt xuất quân. Lượt mới mở lúc 0 giờ (giờ Việt Nam).",
  featureDisabled: "Viễn Chinh chưa mở.",
  loginRequired: "Viễn Chinh cần tài khoản đã đăng nhập.",
};

const KIND_NAME: Record<ExpeditionNodeKind, string> = {
  camp: "Trại",
  outpost: "Đồn",
  granary: "Kho lương",
  fort: "Lũy",
  village: "Làng",
  citadel: "Thành đích",
};

const KIND_TEXT: Record<ExpeditionNodeKind, string> = {
  camp: "Trại xuất phát. Không có địch.",
  outpost: "Đồn nhỏ, 2 địch.",
  granary: `Kho lương có lính giữ, 2 địch. Chiếm được: cả hai đạo thêm ${EXPEDITION_GRANARY_FOOD} lương.`,
  fort: "Lũy, 3 địch.",
  village: `Làng. Lần đầu ghé: cả đạo hồi ${Math.round(EXPEDITION_VILLAGE_HEAL * 100)}% máu (kể cả người gục) và thêm lương.`,
  citadel: "Thành đích, 3 địch, tướng giữ thành máu ×1,5. Chiếm được là thắng viễn chinh.",
};

const ARMY_NAME = ["Đạo Chính", "Biệt đạo"] as const;
const ARMY_COLOR = ["#e0a33a", "#5fb3c9"] as const;

async function json<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, cache: "no-store" });
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const post = <T,>(url: string, body?: unknown) =>
  json<T>(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={className} aria-label={`${n} sao`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? "text-amber-300" : "text-stone-600"}>★</span>
      ))}
    </span>
  );
}

function HpBar({ ratio }: { ratio: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  return (
    <div className="h-1.5 overflow-hidden rounded bg-black/40">
      <div className={`h-full ${pct > 50 ? "bg-emerald-500" : pct > 0 ? "bg-amber-500" : "bg-rose-700"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ExpeditionScreen() {
  const { go } = useScene();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Chuẩn bị
  const [mapId, setMapId] = useState<string>("aiBac");
  const [tier, setTier] = useState<ExpeditionTier>(1);
  const [main, setMain] = useState<readonly string[]>([]);
  const [second, setSecond] = useState<readonly string[]>([]);
  const [setup, setSetup] = useState(false);
  // Đang đi
  const [army, setArmy] = useState<ArmyIndex>(0);
  const [target, setTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [o, p] = await Promise.all([json<Overview>("/api/expedition"), json<{ profile?: Profile }>("/api/profile")]);
    if (!o || !p?.profile) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setOverview(o);
    setProfile(p.profile);
    setTarget(null);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const owned = useMemo(
    () => (profile ? Object.keys(profile.companions).filter((id) => companionById(id)).sort() : []),
    [profile],
  );

  const fail = (error?: string) => setMessage(ERROR_TEXT[error ?? ""] ?? "Không thực hiện được. Hãy tải lại.");

  const act = async (url: string, body?: unknown) => {
    setBusy(true);
    setMessage(null);
    const r = await post<ApiResult>(url, body);
    if (!r?.ok) {
      fail(r?.error);
      if (r?.error === "conflict") await load();
      setBusy(false);
      return null;
    }
    if (r.kind === "battle" && r.id) {
      try {
        window.localStorage.setItem(ONLINE_BATTLE_KEY, r.id);
      } catch {
        /* server vẫn giữ id trận trong lượt viễn chinh */
      }
      go("PLAYING", { resume: "1" });
      return r;
    }
    await load();
    setBusy(false);
    return r;
  };

  if (!overview || !profile)
    return (
      <main className="flex flex-1 items-center justify-center bg-[#17110e] p-6 text-stone-200">
        {failed ? (
          <div className="text-center">
            <p role="alert">Không tải được Viễn Chinh.</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>Tải lại</Button>
          </div>
        ) : (
          <p role="status">Đang tải sa bàn…</p>
        )}
      </main>
    );

  const run = overview.run;
  const active = run && (run.phase === "march" || run.phase === "battle");
  const mapOf = (id: string) => overview.maps.find((m) => m.id === id)!;

  return (
    <main className="ui-screen tower-screen tower-screen--expedition">
      <div className="tower-screen__content space-y-5">
        <header className="tower-screen__banner">
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-amber-400">Hai đạo quân trên sa bàn</p>
            <h1 className="font-serif text-3xl font-bold text-amber-100">Viễn Chinh</h1>
            <p className="mt-1 max-w-2xl text-sm text-foreground-secondary">
              Chia sáu tướng làm hai đạo. Mỗi ngày một đạo tiến một ô, đạo kia nghỉ hồi sức. Giặc tăng viện theo
              ngày; đứng kề ô bị đánh thì hai đạo giáp công. Chiếm thành đích trước khi hết ngày.
            </p>
          </div>
        </header>

        {message && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/50 p-3 text-rose-100">{message}</p>}

        {active && run ? (
          <RunView
            run={run}
            map={mapOf(run.map)}
            encounters={overview.encounters}
            army={army}
            setArmy={(a) => { setArmy(a); setTarget(null); }}
            target={target}
            setTarget={setTarget}
            busy={busy}
            onMarch={(to) => void act("/api/expedition/march", { army, to })}
            onCamp={() => void act("/api/expedition/camp")}
            onAbandon={() => void act("/api/expedition/abandon")}
            onResume={() => void act("/api/expedition/march", { army: run.battle?.army ?? 0, to: run.battle?.node ?? "" })}
          />
        ) : run?.result && !setup ? (
          <ResultView run={run} map={mapOf(run.map)} result={run.result} onNew={() => setSetup(true)} />
        ) : (
          <SetupView
            maps={overview.maps}
            mapId={mapId}
            setMapId={(id) => { setMapId(id); setTier(1); }}
            tier={tier}
            setTier={setTier}
            owned={owned}
            profile={profile}
            main={main}
            second={second}
            setMain={setMain}
            setSecond={setSecond}
            busy={busy}
            runsLeft={overview.runsLeft}
            runsPerDay={overview.runsPerDay}
            onStart={async () => {
              const r = await act("/api/expedition/run", { map: mapId, tier, main, second });
              if (r) { setSetup(false); setArmy(0); }
            }}
          />
        )}
      </div>
    </main>
  );
}

// ——— Chuẩn bị ———

function SetupView(props: {
  maps: readonly MapView[];
  mapId: string;
  setMapId: (id: string) => void;
  tier: ExpeditionTier;
  setTier: (t: ExpeditionTier) => void;
  owned: readonly string[];
  profile: Profile;
  main: readonly string[];
  second: readonly string[];
  setMain: (ids: readonly string[]) => void;
  setSecond: (ids: readonly string[]) => void;
  busy: boolean;
  runsLeft: number;
  runsPerDay: number;
  onStart: () => void;
}) {
  const { maps, mapId, tier, owned, profile, main, second, setMain, setSecond } = props;
  const map = maps.find((m) => m.id === mapId) ?? maps[0]!;
  const info = map.tiers.find((t) => t.tier === tier)!;
  const ready = main.length === 2 && second.length === 3 && info.unlocked && props.runsLeft > 0;

  // Bấm một tướng: chưa đi → Đạo Chính (nếu còn chỗ) → Biệt đạo (nếu còn chỗ) → bỏ.
  const cycle = (id: string) => {
    if (main.includes(id)) {
      setMain(main.filter((x) => x !== id));
      if (second.length < 3) setSecond([...second, id]);
    } else if (second.includes(id)) setSecond(second.filter((x) => x !== id));
    else if (main.length < 2) setMain([...main, id]);
    else if (second.length < 3) setSecond([...second, id]);
  };

  return (
    <>
      <section className="tower-screen__panel">
        <h2 className="font-serif text-xl font-bold">1. Chọn sa bàn</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {maps.map((m) => {
            const best = Math.max(0, ...m.tiers.filter((t) => t.stars > 0).map((t) => t.tier));
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={m.id === map.id}
                onClick={() => props.setMapId(m.id)}
                className={`tower-screen__choice p-3 text-left ${m.id === map.id ? "border-amber-400 bg-amber-500/15" : "border-white/10 bg-white/5"}`}
              >
                <span className="flex items-center gap-2">
                  <ElementIcon element={m.element} className="size-5" />
                  <strong className="font-serif text-lg text-amber-100">{m.name}</strong>
                  {best > 0 && <span className="ml-auto text-xs text-amber-300">Đã thắng bậc {best}</span>}
                </span>
                <span className="mt-1 block text-sm text-muted">{m.blurb}</span>
                <span className="mt-2 block text-xs text-foreground-secondary">
                  Chiến địa hệ {ELEMENT_NAME[m.element]} · {m.days} ngày · chuẩn {m.parDays} ngày
                </span>
              </button>
            );
          })}
        </div>
        <h3 className="mt-4 font-semibold">Bậc</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {map.tiers.map((t) => (
            <button
              key={t.tier}
              type="button"
              disabled={!t.unlocked}
              aria-pressed={t.tier === tier}
              onClick={() => props.setTier(t.tier)}
              className={`rounded-lg border px-3 py-2 text-left text-sm disabled:opacity-40 ${t.tier === tier ? "border-amber-400 bg-amber-500/15" : "border-white/10 bg-white/5"}`}
            >
              <strong>{t.name}</strong> <Stars n={t.stars} className="ml-1" />
              <span className="block text-xs text-muted">
                {t.unlocked ? `Cấp gợi ý ${t.level} · lần đầu ${t.firstGold} vàng + món ${TIER_COLOR_NAME[(t.tier + 2) as 3 | 4 | 5]}` : "Thắng bậc trước để mở"}
              </span>
              {t.bestDays !== null && <span className="block text-xs text-amber-200">Nhanh nhất {t.bestDays} ngày</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="tower-screen__panel">
        <h2 className="font-serif text-xl font-bold">2. Chia hai đạo quân</h2>
        <p className="mt-1 text-sm text-muted">
          Bấm tướng để đưa vào Đạo Chính (đi cùng Đinh Bộ Lĩnh, 2 chỗ), bấm lần nữa để chuyển sang Biệt đạo (3 chỗ, người
          đầu là thống lĩnh), bấm lần ba để bỏ ra. Chỉ số và trang bị được chụp lúc xuất quân.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {([0, 1] as const).map((a) => {
            const ids = a === 0 ? [MAIN_ID, ...main] : second;
            const size = 3;
            return (
              <div key={a} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <h3 className="font-semibold" style={{ color: ARMY_COLOR[a] }}>{ARMY_NAME[a]} · {ids.length}/{size}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ids.map((id) => {
                    const c = id === MAIN_ID ? null : companionById(id);
                    const element = c?.element ?? profile.element;
                    const profession = c?.profession ?? profile.profession;
                    return (
                      <span key={id} className="flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 text-sm">
                        <Portrait id={id} element={element} profession={profession} className="size-7" />
                        {c?.name ?? "Đinh Bộ Lĩnh"}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((id) => {
            const c = companionById(id)!;
            const where = main.includes(id) ? 0 : second.includes(id) ? 1 : null;
            const lv = profile.companions[id]?.level ?? 1;
            return (
              <button
                key={id}
                type="button"
                onClick={() => cycle(id)}
                className="tower-screen__choice flex items-center gap-2 p-2 text-left"
                style={{ borderColor: where === null ? undefined : ARMY_COLOR[where] }}
              >
                <Portrait id={id} element={c.element} profession={c.profession} className="size-10" level={lv} />
                <span className="min-w-0">
                  <strong className="block truncate">{c.name}</strong>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <ElementIcon element={c.element} className="size-3.5" /> {ELEMENT_NAME[c.element]}
                    <ProfessionIcon profession={c.profession} className="size-3.5" /> {PROFESSION_NAME[c.profession]}
                  </span>
                </span>
                {where !== null && <span className="ml-auto text-xs font-semibold" style={{ color: ARMY_COLOR[where] }}>{ARMY_NAME[where]}</span>}
              </button>
            );
          })}
        </div>
        {owned.length < 5 && <p className="mt-2 text-sm text-rose-300">Cần ít nhất 5 tướng ngoài Đinh Bộ Lĩnh.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled={props.busy || !ready} onClick={props.onStart}>
            {props.busy ? "Đang xuất quân…" : `Xuất quân: ${map.name} · ${info.name}`}
          </Button>
          <span className={`text-sm ${props.runsLeft > 0 ? "text-muted" : "text-rose-300"}`}>
            {props.runsLeft > 0
              ? `Hôm nay còn ${props.runsLeft}/${props.runsPerDay} lượt xuất quân.`
              : "Hôm nay đã hết lượt xuất quân, mở lại lúc 0 giờ."}
          </span>
        </div>
      </section>
    </>
  );
}

// ——— Sa bàn ———

function NodeGlyph({ kind, x, y }: { kind: ExpeditionNodeKind; x: number; y: number }) {
  const s = 2.1;
  switch (kind) {
    case "camp":
      return <path d={`M${x - s} ${y + s} L${x} ${y - s} L${x + s} ${y + s} Z`} fill="currentColor" />;
    case "village":
      return <path d={`M${x - s} ${y + s * 0.8} V${y - s * 0.1} L${x} ${y - s} L${x + s} ${y - s * 0.1} V${y + s * 0.8} Z`} fill="currentColor" />;
    case "granary":
      return <ellipse cx={x} cy={y} rx={s} ry={s * 0.8} fill="currentColor" />;
    case "outpost":
      return <rect x={x - s * 0.7} y={y - s} width={s * 1.4} height={s * 2} fill="currentColor" />;
    case "fort":
      return <path d={`M${x - s} ${y + s} V${y - s} h${s * 0.6} v${s * 0.6} h${s * 0.8} v${-s * 0.6} h${s * 0.6} V${y + s} Z`} fill="currentColor" />;
    case "citadel":
      return <path d={`M${x - s * 1.3} ${y + s} V${y - s * 0.4} L${x} ${y - s * 1.4} L${x + s * 1.3} ${y - s * 0.4} V${y + s} Z`} fill="currentColor" />;
  }
}

function RunView(props: {
  run: Omit<ExpeditionRun, "seed">;
  map: MapView;
  encounters: Overview["encounters"];
  army: ArmyIndex;
  setArmy: (a: ArmyIndex) => void;
  target: string | null;
  setTarget: (id: string | null) => void;
  busy: boolean;
  onMarch: (to: string) => void;
  onCamp: () => void;
  onAbandon: () => void;
  onResume: () => void;
}) {
  const { run, map, encounters, army, target } = props;
  const selected = run.armies[army];
  const reachable = run.phase === "march" ? expeditionNeighbors(map, selected.at) : [];
  const node = target ? map.nodes.find((n) => n.id === target) : undefined;
  const preview = target ? encounters[target]?.[army] : undefined;
  const cleared = (id: string) => run.nodes[id]?.cleared === true;
  const canFight = (a: ArmyIndex) => run.armies[a].ids.some((id) => (run.armies[a].fighters[id]?.hp ?? 0) > 0);
  const reinforce = Math.round(EXPEDITION_REINFORCE_PER_DAY * (run.day - 1) * 100);
  const tierInfo = map.tiers.find((t) => t.tier === run.tier)!;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="tower-screen__panel">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold">{map.name} · {tierInfo.name}</h2>
          <p className="text-sm">
            Ngày <strong className="text-amber-300">{run.day}</strong>/{map.days} · chuẩn {map.parDays} ngày
            {reinforce > 0 && <> · giặc tăng viện <strong className="text-rose-300">+{reinforce}%</strong></>}
          </p>
        </div>
        <svg viewBox="0 -4 100 66" className="mt-3 w-full rounded-lg border border-[#85602e] bg-[#2a1f14]" role="group" aria-label={`Sa bàn ${map.name}`}>
          <defs>
            <pattern id="exp-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0H0V5" fill="none" stroke="#e7d2a10f" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect y="-4" width="100" height="66" fill="url(#exp-grid)" />
          {map.edges.map(([a, b]) => {
            const na = map.nodes.find((n) => n.id === a)!;
            const nb = map.nodes.find((n) => n.id === b)!;
            const hot = (a === selected.at && reachable.includes(b)) || (b === selected.at && reachable.includes(a));
            return <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={hot ? ARMY_COLOR[army] : "#a47a3f88"} strokeWidth={hot ? 0.7 : 0.45} strokeDasharray={hot ? undefined : "1.2 0.8"} />;
          })}
          {map.nodes.map((n) => {
            const can = reachable.includes(n.id);
            const done = cleared(n.id);
            const damaged = !done && (run.nodes[n.id]?.foeHp?.length ?? 0) > 0;
            const color = done ? "#7fb685" : n.kind === "citadel" ? "#e06a4f" : n.kind === "village" ? "#d9c27a" : "#e7d2a1";
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${n.name} (${KIND_NAME[n.kind]}${done ? ", đã chiếm" : ""})`}
                onClick={() => props.setTarget(n.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") props.setTarget(n.id); }}
                className="cursor-pointer focus:outline-none"
                style={{ color }}
              >
                <circle cx={n.x} cy={n.y} r={n.kind === "citadel" ? 4.4 : 3.4} fill="#1b1411" stroke={target === n.id ? "#fff" : can ? ARMY_COLOR[army] : color} strokeWidth={target === n.id || can ? 0.8 : 0.4} />
                <NodeGlyph kind={n.kind} x={n.x} y={n.y} />
                {damaged && <circle cx={n.x + 3} cy={n.y - 3} r={0.9} fill="#e06a4f" />}
                <text x={n.x} y={n.y + (n.kind === "citadel" ? 7.4 : 6.2)} textAnchor="middle" fontSize="2.3" fill="#e7d2a1cc">{n.name}</text>
              </g>
            );
          })}
          {run.armies.map((a, i) => {
            const n = map.nodes.find((x) => x.id === a.at)!;
            // Hai cờ cùng hướng phải, cờ Chính cao hơn cờ Biệt để đứng chung một ô vẫn đọc được.
            const px = n.x + (i === 0 ? -1.6 : 1.6);
            const top = n.y - (i === 0 ? 11 : 7.4);
            return (
              <g key={i} onClick={() => props.setArmy(i as ArmyIndex)} className="cursor-pointer" opacity={canFight(i as ArmyIndex) ? 1 : 0.45}>
                <line x1={px} y1={n.y - 2.5} x2={px} y2={top} stroke="#1b1411" strokeWidth={0.5} />
                <path d={`M${px} ${top} h7 l-1.2 1.5 l1.2 1.5 h-7 Z`} fill={ARMY_COLOR[i]} stroke={army === i ? "#fff" : "#1b1411"} strokeWidth={0.3} />
                <text x={px + 3.2} y={top + 2.15} textAnchor="middle" fontSize="1.9" fill="#1b1411" fontWeight="bold">{i === 0 ? "Chính" : "Biệt"}</text>
              </g>
            );
          })}
        </svg>
        <p className="mt-2 text-xs text-muted">
          Chạm cờ để chọn đạo quân, chạm ô kề (viền màu đạo) để xem rồi tiến quân. Đạo không tiến được nghỉ, hồi
          {` ${Math.round(EXPEDITION_REST_HEAL * 100)}% `}máu mỗi ngày (kể cả người gục). Chấm đỏ: đồn đánh dở, địch giữ thương vong.
        </p>
      </div>

      <div className="space-y-4">
        {run.phase === "battle" && run.battle ? (
          <div className="tower-screen__panel">
            <h3 className="font-serif text-lg font-bold">Trận đang đánh</h3>
            <p className="mt-1 text-sm text-foreground-secondary">
              {ARMY_NAME[run.battle.army]} đánh {map.nodes.find((n) => n.id === run.battle!.node)?.name}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" disabled={props.busy} onClick={props.onResume}>Vào trận</Button>
              <Button variant="secondary" disabled={props.busy} onClick={props.onAbandon}>Rút khỏi viễn chinh</Button>
            </div>
          </div>
        ) : (
          <div className="tower-screen__panel">
            {node ? (
              <>
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold">
                  {node.name} <span className="text-xs font-normal text-muted">{KIND_NAME[node.kind]}{cleared(node.id) ? " · đã chiếm" : ""}</span>
                </h3>
                <p className="mt-1 text-sm text-foreground-secondary">{KIND_TEXT[node.kind]}</p>
                {preview && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs text-muted">
                      AI {DIFFICULTY_NAME[preview.difficulty]} · cấp {preview.foes[0]?.level}
                      {preview.pincer && <span className="ml-2 rounded bg-emerald-700/50 px-1.5 py-0.5 text-emerald-100">Giáp công: máu địch −{Math.round((1 - EXPEDITION_PINCER_HP) * 100)}%</span>}
                    </p>
                    {preview.foes.map((f, i) => (
                      <div key={`${f.id}-${i}`} className="flex items-center gap-2 rounded bg-white/5 p-1.5">
                        <Portrait id={f.id} element={f.element} profession={f.profession} className="size-8" level={f.level} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-sm">
                            <strong className="truncate">{f.name}</strong>
                            <ElementIcon element={f.element} className="size-3.5" />
                            <ProfessionIcon profession={f.profession} className="size-3.5" />
                            <span className="ml-auto text-xs text-muted">{Math.round(f.maxHp * f.hpRatio)} máu</span>
                          </div>
                          <HpBar ratio={f.hpRatio} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {reachable.includes(node.id) ? (
                  <Button variant="primary" className="mt-3" disabled={props.busy || !canFight(army)} onClick={() => props.onMarch(node.id)}>
                    {preview ? `${ARMY_NAME[army]} tấn công` : `${ARMY_NAME[army]} tiến quân`}
                  </Button>
                ) : (
                  <p className="mt-3 text-xs text-muted">{ARMY_NAME[army]} chưa tới được ô này (chỉ đi sang ô kề).</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Chọn một ô trên sa bàn để xem địch và tiến quân.</p>
            )}
          </div>
        )}

        {run.armies.map((a, i) => {
          const at = map.nodes.find((n) => n.id === a.at);
          return (
            <button
              key={i}
              type="button"
              aria-pressed={army === i}
              onClick={() => props.setArmy(i as ArmyIndex)}
              className="tower-screen__panel block w-full text-left"
              style={{ borderColor: army === i ? ARMY_COLOR[i] : undefined }}
            >
              <div className="flex items-baseline justify-between">
                <strong style={{ color: ARMY_COLOR[i] }}>{ARMY_NAME[i]}</strong>
                <span className="flex items-center gap-1 text-xs text-muted"><FoodIcon className="size-3.5" />{a.food} · tại {at?.name}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {a.ids.map((id) => {
                  const f = a.fighters[id]!;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Portrait id={id} element={f.config.element} profession={f.config.profession} className="size-7" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs"><span>{f.config.name}</span><span className={f.hp <= 0 ? "text-rose-400" : "text-muted"}>{f.hp <= 0 ? "Gục" : `${f.hp}/${f.config.maxHp}`}</span></div>
                        <HpBar ratio={f.hp / f.config.maxHp} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {!canFight(i as ArmyIndex) && <p className="mt-2 text-xs text-rose-300">Cả đạo đang gục, cần nghỉ để hồi sức.</p>}
            </button>
          );
        })}

        {run.phase === "march" && (
          <div className="tower-screen__panel flex flex-wrap gap-2">
            <Button variant="secondary" disabled={props.busy} onClick={props.onCamp}>Đóng quân (cả hai đạo nghỉ 1 ngày)</Button>
            <Button variant="secondary" disabled={props.busy} onClick={props.onAbandon}>Rút khỏi viễn chinh</Button>
            <p className="w-full text-xs text-muted">Thua một trận: đạo đó rút về ô cũ, cả ba gục, phải nghỉ để hồi. Không mất lượt viễn chinh.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ——— Kết thúc ———

function ResultView({ run, map, result, onNew }: { run: Omit<ExpeditionRun, "seed">; map: MapView; result: ExpeditionResult; onNew: () => void }) {
  const tierName = map.tiers.find((t) => t.tier === run.tier)?.name;
  const reason = run.endReason === "timeout" ? "Hết ngày hành quân mà chưa chiếm được thành." : run.endReason === "abandoned" ? "Đã rút quân." : "";
  return (
    <section className="tower-screen__panel text-center">
      <h2 className={`font-serif text-2xl font-bold ${result.won ? "text-amber-200" : "text-rose-200"}`}>
        {result.won ? `Đã chiếm ${map.nodes.find((n) => n.id === map.citadel)?.name}!` : "Viễn chinh thất bại"}
      </h2>
      <p className="mt-1 text-sm text-muted">{map.name} · {tierName} · {result.days} ngày</p>
      {result.won ? (
        <>
          <Stars n={result.stars} className="mt-2 block text-3xl" />
          <p className="mt-1 text-xs text-muted">★ chiếm thành · ★ xong trong {map.parDays} ngày · ★ không thua trận nào</p>
          <p className="mt-3 font-semibold text-amber-300">
            +{result.gold} vàng{result.firstClear ? " (thắng lần đầu)" : ""}
            {result.item && ` · ${SLOT_NAME[result.item.slot]} phẩm ${TIER_COLOR_NAME[result.item.tier]} hệ ${ELEMENT_NAME[result.item.element]}`}
            {result.soldFor > 0 && ` · túi đầy, món thưởng bán được ${result.soldFor} vàng`}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-foreground-secondary">{reason} Vàng, kinh nghiệm và đồ rơi của từng trận vẫn được giữ.</p>
      )}
      <Button variant="primary" className="mt-4" onClick={onNew}>Viễn chinh mới</Button>
    </section>
  );
}
