"use client";

// Viễn Chinh: chọn sa bàn và bậc, chia 6 tướng làm hai đạo, rồi điều quân trên sa bàn. Mọi luật chạy ở server
// (/api/expedition); màn này chỉ hiển thị và gửi ý định. Luật: docs/02-game-modes/expedition/01-vien-chinh-gdd.md.

import { requestJson, postJson } from "../api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ModeBanner, ModeScreen } from "@/components/game-ui";
import { Alert, Button, choiceVariants } from "@/components/ui";
import {
  EXPEDITION_PINCER_HP,
  EXPEDITION_REINFORCE_PER_DAY,
  EXPEDITION_REST_HEAL,
  EXPEDITION_VILLAGE_HEAL,
  EXPEDITION_GRANARY_FOOD,
  MAIN_ID,
  companionById,
  EXPEDITION_WATCHTOWER_SIGHT,
  EXPEDITION_SCOUT_SIGHT,
  expeditionEdgeDays,
  expeditionEdgeKey,
  expeditionEdgeKind,
  expeditionEndingName,
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
  readonly mode?: "chase" | "counter" | "gate";
  readonly objective?: { readonly type: "hold" | "escort"; readonly turns: number } | { readonly type: "gate"; readonly fighter: number };
}

/** Kịch bản của lượt (Cửa Biển), server gửi: không có đường bị phá chưa lộ, lịch con nước chỉ khi đã biết. */
/** Kịch bản của sa bàn (server gửi chỉ những khối sa bàn có). */
interface ScenarioView {
  /** Có bốn kết thúc riêng (Cửa Biển). */
  readonly endings: boolean;
  readonly brokenRoads: boolean;
  readonly village?: string;
  readonly home?: string;
  /** Tên việc hộ tống (Rút dân, Giải cứu tù binh…) và người được đưa về. */
  readonly refugeeTitle?: string;
  readonly refugeeNoun?: string;
  /** Sa bàn thường: hệ số vàng khi thắng mà xong nhiệm vụ. */
  readonly missionGold?: number;
  readonly chaseUnless?: string;
  readonly market?: string;
  readonly counterAfterDays?: number;
  readonly reinforcementDays?: readonly number[];
  readonly reinforcementLabel?: string;
  readonly tideDays?: readonly number[] | null;
  readonly tideRevealedBy?: string;
  readonly holdNodes?: readonly string[];
  readonly holdTurns?: number;
  readonly gate?: boolean;
  readonly gateSkipFrom?: string | null;
  readonly chase?: EncounterPreview;
  readonly counter?: EncounterPreview & { readonly army: ArmyIndex };
}

interface Overview {
  readonly enabled: boolean;
  readonly maps: readonly MapView[];
  readonly run: Omit<ExpeditionRun, "seed"> | null;
  readonly runsLeft: number;
  readonly runsPerDay: number;
  readonly encounters: Readonly<Record<string, readonly [EncounterPreview, EncounterPreview]>>;
  /** Ô đang thấy (ngoài sương mù), server tính. */
  readonly visible: readonly string[];
  readonly scenario: ScenarioView | null;
}

interface ApiResult {
  readonly ok?: boolean;
  readonly kind?: "moved" | "battle" | "blocked";
  readonly reason?: "broken" | "tide";
  readonly id?: string;
  readonly error?: string;
}

const ERROR_TEXT: Record<string, string> = {
  runActive: "Đang có một lượt viễn chinh. Xin đi tiếp hoặc rút quân trước.",
  tierLocked: "Bậc này chưa mở: xin thắng bậc trước của sa bàn này.",
  duplicate: "Mỗi tướng chỉ đi một đạo.",
  notOwned: "Có tướng chưa chiêu mộ.",
  badArmy: "Đạo Chính cần 2 tướng đi cùng Đinh Bộ Lĩnh, Biệt Đạo cần 3 tướng.",
  notAdjacent: "Chỉ tiến được sang ô kề vị trí của đạo quân.",
  armyDown: "Cả đạo đang gục. Xin cho đạo này nghỉ (đạo kia tiến quân hoặc đóng quân) để hồi sức.",
  notMarching: "Lượt viễn chinh đã kết thúc hoặc đang có trận.",
  conflict: "Quân tình vừa đổi ở nơi khác. Đang tải lại.",
  dailyLimit: "Hôm nay đã hết lượt xuất quân. Lượt mới mở lúc 0 giờ (giờ Việt Nam).",
  featureDisabled: "Viễn Chinh chưa mở.",
  roadBroken: "Đường này đã bị phá. Xin đi đường khác.",
  highTide: "Cửa nước đang lên. Chờ ngày nước rút.",
  counterPending: "Giặc đang phản công Chợ: đạo giữ chợ phải đánh trước.",
};

const BLOCK_TEXT = {
  broken: "Đường bị phá! Đạo quân đứng yên và mất ngày này. Từ giờ đường hiện là bị phá.",
  tide: "Cửa nước đang lên! Đạo quân đứng yên và mất ngày này. Đã biết lịch con nước.",
} as const;

const KIND_NAME: Record<ExpeditionNodeKind, string> = {
  camp: "Trại",
  outpost: "Đồn",
  watchtower: "Chòi canh",
  granary: "Kho lương",
  fort: "Lũy",
  village: "Làng",
  citadel: "Thành đích",
  bridge: "Cầu",
  shoal: "Bãi cạn",
};

const KIND_TEXT: Record<ExpeditionNodeKind, string> = {
  camp: "Trại xuất phát. Không có địch.",
  outpost: "Đồn nhỏ, 2 địch.",
  watchtower: `Chòi canh, 2 địch. Chiếm được: vén sương mù mọi ô trong ${EXPEDITION_WATCHTOWER_SIGHT} bước.`,
  granary: `Kho lương có lính giữ, 2 địch. Chiếm được: cả hai đạo thêm ${EXPEDITION_GRANARY_FOOD} lương.`,
  fort: "Lũy, 3 địch.",
  village: `Làng. Lần đầu ghé: cả đạo hồi ${Math.round(EXPEDITION_VILLAGE_HEAL * 100)}% máu (kể cả người gục) và thêm lương.`,
  citadel: "Thành đích, 3 địch, tướng giữ thành máu ×1,5. Chiếm được là thắng viễn chinh.",
  bridge: "Cầu, 3 địch. Trận giữ cầu: cầm cự đủ lượt (hoặc hạ hết) là chiếm được, chặn thuyền viện của giặc.",
  shoal: "Bãi cạn, không có địch. Đứng chờ con nước được; ngày nước rút đi được cửa nước vào thành.",
};

const ARMY_NAME = ["Đạo Chính", "Biệt Đạo"] as const;
const ARMY_COLOR = ["#e0a33a", "#5fb3c9"] as const;



function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={className} aria-label={`${n} sao`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? "text-frame-gold" : "text-on-wood-soft/40"}>★</span>
      ))}
    </span>
  );
}

function HpBar({ ratio }: { ratio: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  return (
    <div className="h-1.5 overflow-hidden rounded bg-wood-inset">
      <div className={`h-full ${pct > 50 ? "bg-jade" : pct > 0 ? "bg-frame-gold" : "bg-danger"}`} style={{ width: `${pct}%` }} />
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
  const [notice, setNotice] = useState<string | null>(null);
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
    const [o, p] = await Promise.all([requestJson<Overview>("/api/expedition"), requestJson<{ profile?: Profile }>("/api/profile")]);
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

  const fail = (error?: string) => setMessage(ERROR_TEXT[error ?? ""] ?? "Lệnh chưa thành. Xin tải lại trang.");

  const act = async (url: string, body?: unknown) => {
    setBusy(true);
    setMessage(null);
    setNotice(null);
    const r = await postJson<ApiResult>(url, body);
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
    if (r.kind === "blocked" && r.reason) setNotice(BLOCK_TEXT[r.reason]);
    setBusy(false);
    return r;
  };

  if (!overview || !profile)
    return (
      <ModeScreen label="Viễn Chinh">
        <div className="py-24 text-center text-on-wood-soft">
        {failed ? (
          <div className="text-center">
            <p role="alert">Chưa mở được sa bàn Viễn Chinh. Xin tải lại trang.</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>Tải lại</Button>
          </div>
        ) : (
          <p role="status">Đang tải sa bàn…</p>
        )}
        </div>
      </ModeScreen>
    );

  const run = overview.run;
  const active = run && (run.phase === "march" || run.phase === "battle");
  const mapOf = (id: string) => overview.maps.find((m) => m.id === id)!;

  return (
    <ModeScreen wide label="Viễn Chinh">
      <div className="space-y-5">
        <ModeBanner
          title="Viễn Chinh"
          kicker="Hai đạo quân trên sa bàn"
          art="/art/home/campaign.webp"
          description="Chia sáu tướng làm hai đạo. Mỗi ngày một đạo tiến một ô, đạo kia nghỉ hồi sức. Giặc tăng viện theo ngày; đứng kề ô bị đánh thì hai đạo giáp công. Chiếm thành đích trước khi hết ngày."
        />

        {message && <Alert>{message}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        {active && run ? (
          <RunView
            run={run}
            map={mapOf(run.map)}
            encounters={overview.encounters}
            visible={overview.visible}
            scenario={overview.scenario}
            army={army}
            setArmy={(a) => { setArmy(a); setTarget(null); }}
            target={target}
            setTarget={setTarget}
            busy={busy}
            onMarch={(to) => void act("/api/expedition/march", { army, to })}
            onCamp={() => void act("/api/expedition/camp")}
            onScout={() => void act("/api/expedition/scout", { army })}
            onCounter={(a) => void act("/api/expedition/march", { army: a, to: run.armies[a].at })}
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
    </ModeScreen>
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

  // Bấm một tướng: chưa đi → Đạo Chính (nếu còn chỗ) → Biệt Đạo (nếu còn chỗ) → bỏ.
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
      <section className="ui-frame p-4 sm:p-5">
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
                className={choiceVariants({ className: "flex-col items-stretch justify-start overflow-hidden p-0 text-left font-normal" })}
              >
                <span aria-hidden className="block aspect-[5/2] w-full bg-no-repeat opacity-90" style={mapArtStyle(m)} />
                <span className="block p-3">
                <span className="flex items-center gap-2">
                  <ElementIcon element={m.element} className="size-5" />
                  <strong className="font-serif text-lg">{m.name}</strong>
                  {best > 0 && <span className="ml-auto text-caption font-semibold">Đã thắng bậc {best}</span>}
                </span>
                <span className="mt-1 block text-sm opacity-80">{m.blurb}</span>
                <span className="mt-2 block text-caption opacity-80">
                  Chiến địa hệ {ELEMENT_NAME[m.element]} · {m.days} ngày · chuẩn {m.parDays} ngày
                </span>
                </span>
              </button>
            );
          })}
        </div>
        <h3 className="mt-4 font-semibold text-frame-gold">Bậc</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {map.tiers.map((t) => (
            <button
              key={t.tier}
              type="button"
              disabled={!t.unlocked}
              aria-pressed={t.tier === tier}
              onClick={() => props.setTier(t.tier)}
              className={choiceVariants({ className: "flex-col items-start gap-0.5 text-left text-sm" })}
            >
              <span><strong>{t.name}</strong> <Stars n={t.stars} className="ml-1" /></span>
              <span className="block text-caption font-normal opacity-80">
                {t.unlocked ? `Cấp gợi ý ${t.level} · lần đầu ${t.firstGold} vàng + món ${TIER_COLOR_NAME[(t.tier + 2) as 3 | 4 | 5]}` : "Thắng bậc trước để mở"}
              </span>
              {t.bestDays !== null && <span className="block text-caption font-normal">Nhanh nhất {t.bestDays} ngày</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="ui-frame p-4 sm:p-5">
        <h2 className="font-serif text-xl font-bold">2. Chia hai đạo quân</h2>
        <p className="mt-1 text-sm text-on-wood-soft">
          Bấm tướng để đưa vào Đạo Chính (đi cùng Đinh Bộ Lĩnh, 2 chỗ), bấm lần nữa để chuyển sang Biệt Đạo (3 chỗ, người
          đầu là thống lĩnh), bấm lần ba để bỏ ra. Chỉ số và trang bị được chụp lúc xuất quân.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {([0, 1] as const).map((a) => {
            const ids = a === 0 ? [MAIN_ID, ...main] : second;
            const size = 3;
            return (
              <div key={a} className="ui-frame-inset p-3">
                <h3 className="font-semibold" style={{ color: ARMY_COLOR[a] }}>{ARMY_NAME[a]} · {ids.length}/{size}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ids.map((id) => {
                    const c = id === MAIN_ID ? null : companionById(id);
                    const element = c?.element ?? profile.element;
                    const profession = c?.profession ?? profile.profession;
                    return (
                      <span key={id} className="flex items-center gap-1.5 rounded bg-wood-hi px-2 py-1 text-sm">
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
                className={choiceVariants({ className: "justify-start p-2 text-left font-normal" })}
                style={{ borderColor: where === null ? undefined : ARMY_COLOR[where] }}
              >
                <Portrait id={id} element={c.element} profession={c.profession} className="size-10" level={lv} />
                <span className="min-w-0">
                  <strong className="block truncate">{c.name}</strong>
                  <span className="flex items-center gap-1 text-caption opacity-80">
                    <ElementIcon element={c.element} className="size-3.5" /> {ELEMENT_NAME[c.element]}
                    <ProfessionIcon profession={c.profession} className="size-3.5" /> {PROFESSION_NAME[c.profession]}
                  </span>
                </span>
                {where !== null && <span className="ml-auto text-caption font-semibold" style={{ color: ARMY_COLOR[where] }}>{ARMY_NAME[where]}</span>}
              </button>
            );
          })}
        </div>
        {owned.length < 5 && <p className="mt-2 text-sm text-danger">Cần ít nhất 5 tướng ngoài Đinh Bộ Lĩnh.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled={props.busy || !ready} onClick={props.onStart}>
            {props.busy ? "Đang xuất quân…" : `Xuất quân: ${map.name} · ${info.name}`}
          </Button>
          <span className={`text-sm ${props.runsLeft > 0 ? "text-on-wood-soft" : "text-danger"}`}>
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
    case "watchtower":
      return <path d={`M${x - s * 0.9} ${y + s} L${x - s * 0.45} ${y - s * 0.5} H${x - s * 0.9} L${x} ${y - s * 1.2} L${x + s * 0.9} ${y - s * 0.5} H${x + s * 0.45} L${x + s * 0.9} ${y + s} Z`} fill="currentColor" />;
    case "fort":
      return <path d={`M${x - s} ${y + s} V${y - s} h${s * 0.6} v${s * 0.6} h${s * 0.8} v${-s * 0.6} h${s * 0.6} V${y + s} Z`} fill="currentColor" />;
    case "citadel":
      return <path d={`M${x - s * 1.3} ${y + s} V${y - s * 0.4} L${x} ${y - s * 1.4} L${x + s * 1.3} ${y - s * 0.4} V${y + s} Z`} fill="currentColor" />;
    case "bridge":
      return <path d={`M${x - s * 1.2} ${y + s * 0.6} Q${x} ${y - s * 1.4} ${x + s * 1.2} ${y + s * 0.6} M${x - s * 0.6} ${y - s * 0.1} V${y + s * 0.6} M${x + s * 0.6} ${y - s * 0.1} V${y + s * 0.6}`} fill="none" stroke="currentColor" strokeWidth={0.6} />;
    case "shoal":
      return <path d={`M${x - s * 1.2} ${y + s * 0.2} q${s * 0.6} ${-s * 0.6} ${s * 1.2} 0 t${s * 1.2} 0 M${x - s * 1.2} ${y + s * 0.9} q${s * 0.6} ${-s * 0.6} ${s * 1.2} 0 t${s * 1.2} 0`} fill="none" stroke="currentColor" strokeWidth={0.5} />;
  }
}

/**
 * Tranh riêng của từng sa bàn (5:3, `public/art/expedition/<id>.webp`, vẽ theo docs/06-art/prompts/vien-chinh-sa-ban.md).
 * Sa bàn chưa có tranh thì tạm lấy một vùng của bản đồ tổng Bình Loạn (`ExpeditionMap.art`) cho tới khi có tranh.
 */
const EXPEDITION_MAP_IMAGES: Partial<Record<ExpeditionMap["id"], string>> = {};
const WORLD_ART = "/art/campaign/world-map.webp";
const WORLD_W = 1536;
const WORLD_H = 1024;

/** Ảnh nền của một sa bàn, phủ đúng khung 100 × 60 của SVG. */
function MapArt({ map }: { map: ExpeditionMap }) {
  const own = EXPEDITION_MAP_IMAGES[map.id];
  if (own) return <image href={own} x={0} y={0} width={100} height={60} preserveAspectRatio="xMidYMid slice" />;
  const art = map.art;
  const k = 100 / art.w;
  return (
    <image
      href={WORLD_ART}
      x={-art.x * k}
      y={-art.y * k}
      width={WORLD_W * k}
      height={WORLD_H * k}
      preserveAspectRatio="none"
    />
  );
}

/** Nền CSS cho thẻ chọn sa bàn: cùng tranh với sa bàn. */
export function mapArtStyle(map: ExpeditionMap): React.CSSProperties {
  const own = EXPEDITION_MAP_IMAGES[map.id];
  if (own) return { backgroundImage: `url(${own})`, backgroundSize: "cover", backgroundPosition: "center" };
  const art = map.art;
  const h = art.w * 0.6;
  return {
    backgroundImage: `url(${WORLD_ART})`,
    // Thẻ thấp hơn khung 5:3 nên giữ tỉ lệ tranh và lấy dải giữa vùng tranh theo chiều dọc.
    backgroundSize: `${(WORLD_W / art.w) * 100}% auto`,
    backgroundPosition: `${(art.x / (WORLD_W - art.w)) * 100}% ${((art.y + h / 2) / WORLD_H) * 100}%`,
  };
}

const LABEL_HALO = { paintOrder: "stroke", stroke: "#1b1411", strokeWidth: 0.7, strokeLinejoin: "round" } as const;

/** Tên ô; ô sát mép trái/phải thì canh chữ vào trong để không bị cắt. */
function NodeLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const anchor = x < 12 ? "start" : x > 88 ? "end" : "middle";
  const tx = anchor === "start" ? Math.max(0.6, x - 3) : anchor === "end" ? Math.min(99.4, x + 3) : x;
  return <text x={tx} y={y} textAnchor={anchor} fontSize="2.2" fill="#f3dfae" style={LABEL_HALO}>{text}</text>;
}

function SandTable(props: {
  run: Omit<ExpeditionRun, "seed">;
  map: MapView;
  seen: ReadonlySet<string>;
  army: ArmyIndex;
  target: string | null;
  reachable: readonly string[];
  setArmy: (a: ArmyIndex) => void;
  setTarget: (id: string | null) => void;
}) {
  const { run, map, seen, army, target, reachable } = props;
  const byId = (id: string) => map.nodes.find((n) => n.id === id)!;
  const selected = run.armies[army];
  const canFight = (a: ArmyIndex) => run.armies[a].ids.some((id) => (run.armies[a].fighters[id]?.hp ?? 0) > 0);
  const citadel = byId(map.citadel);
  const fogId = `exp-fog-${map.id}`;
  return (
    <svg viewBox="0 0 100 60" className="mt-3 w-full overflow-hidden rounded-lg border border-frame-line bg-wood-lo" role="group" aria-label={`Sa bàn ${map.name}`}>
      <defs>
        <radialGradient id={`${fogId}-hole`}>
          <stop offset="45%" stopColor="#000" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id={`${fogId}-cloud`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="7" />
          <feColorMatrix values="0 0 0 0 0.86  0 0 0 0 0.79  0 0 0 0 0.66  0 0 0 0.9 0.15" />
        </filter>
        <mask id={`${fogId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="60">
          <rect width="100" height="60" fill="#fff" />
          {map.nodes.filter((n) => seen.has(n.id)).map((n) => (
            <circle key={n.id} cx={n.x} cy={n.y} r={10} fill={`url(#${fogId}-hole)`} />
          ))}
        </mask>
      </defs>
      <MapArt map={map} />
      {/* Đường đi: chỉ vẽ đường có ít nhất một đầu đã thấy; phần chạy vào sương bị sương phủ. */}
      {map.edges.map(([a, b, kind]) => {
        if (!seen.has(a) && !seen.has(b)) return null;
        const na = byId(a);
        const nb = byId(b);
        const broken = run.knownBroken?.includes(expeditionEdgeKey(a, b)) ?? false;
        const hot = !broken && ((a === selected.at && reachable.includes(b)) || (b === selected.at && reachable.includes(a)));
        const wet = kind === "water" || kind === "tide";
        const base = broken ? "#e06a4f" : wet ? "#7fd0e6" : kind === "marsh" ? "#9fc47a" : "#f3dfae";
        const mx = (na.x + nb.x) / 2;
        const my = (na.y + nb.y) / 2;
        return (
          <g key={`${a}-${b}`}>
            <line
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={hot ? ARMY_COLOR[army] : base}
              strokeOpacity={hot ? 1 : 0.85}
              strokeWidth={hot ? 0.75 : 0.5}
              strokeDasharray={kind === "tide" ? "0.4 0.7" : wet || kind === "marsh" || broken ? "1.4 0.9" : hot ? undefined : "0.9 0.6"}
              style={{ filter: "drop-shadow(0 0 0.4px #1b1411)" }}
            />
            {broken && <text x={mx} y={my + 0.9} textAnchor="middle" fontSize="2.6" fontWeight="bold" fill="#e06a4f" style={LABEL_HALO}>✕</text>}
            {kind === "tide" && !broken && <text x={mx} y={my + 0.8} textAnchor="middle" fontSize="2.2" fill="#7fd0e6" style={LABEL_HALO}>≈</text>}
          </g>
        );
      })}
      {/* Sương mù: phủ cả sa bàn, khoét lỗ mờ quanh các ô đang thấy. */}
      <g mask={`url(#${fogId}-mask)`} pointerEvents="none">
        <rect width="100" height="60" fill="#2a2118" fillOpacity="0.72" />
        <rect width="100" height="60" filter={`url(#${fogId}-cloud)`} opacity="0.55" />
      </g>
      {!seen.has(citadel.id) && (
        <g aria-label={`${citadel.name}: thành đích, chưa trinh sát`} opacity={0.85}>
          <circle cx={citadel.x} cy={citadel.y} r={3.6} fill="#1b1411aa" stroke="#e06a4f" strokeWidth={0.4} strokeDasharray="0.8 0.6" />
          <text x={citadel.x} y={citadel.y + 1.1} textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#e06a4f">?</text>
          <NodeLabel x={citadel.x} y={citadel.y + 6.4} text={citadel.name} />
        </g>
      )}
      {map.nodes.filter((n) => seen.has(n.id)).map((n) => {
        const can = reachable.includes(n.id);
        const done = run.nodes[n.id]?.cleared === true;
        const damaged = !done && (run.nodes[n.id]?.foeHp?.length ?? 0) > 0;
        const color = done ? "#8fd39a" : n.kind === "citadel" ? "#ff8a6a" : n.kind === "village" ? "#f0d77f" : "#f3dfae";
        const r = n.kind === "citadel" ? 3.6 : 2.8;
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
            <circle cx={n.x} cy={n.y} r={r} fill="#1b1411cc" stroke={target === n.id ? "#fff" : can ? ARMY_COLOR[army] : color} strokeWidth={target === n.id || can ? 0.8 : 0.4} />
            <g transform={`translate(${n.x} ${n.y}) scale(0.8) translate(${-n.x} ${-n.y})`}>
              <NodeGlyph kind={n.kind} x={n.x} y={n.y} />
            </g>
            {damaged && <circle cx={n.x + r * 0.8} cy={n.y - r * 0.8} r={0.8} fill="#e06a4f" />}
            <NodeLabel x={n.x} y={n.y + r + 2.6} text={n.name} />
          </g>
        );
      })}
      {run.armies.map((a, i) => {
        const n = byId(a.at);
        // Hai cờ cùng hướng phải, cờ Chính cao hơn cờ Biệt để đứng chung một ô vẫn đọc được.
        const px = n.x + (i === 0 ? -1.4 : 1.4);
        const top = Math.max(0.4, n.y - (i === 0 ? 10 : 6.8));
        return (
          <g key={i} onClick={() => props.setArmy(i as ArmyIndex)} className="cursor-pointer" opacity={canFight(i as ArmyIndex) ? 1 : 0.45}>
            <line x1={px} y1={n.y - 2.2} x2={px} y2={top} stroke="#1b1411" strokeWidth={0.5} />
            <path d={`M${px} ${top} h7 l-1.2 1.5 l1.2 1.5 h-7 Z`} fill={ARMY_COLOR[i]} stroke={army === i ? "#fff" : "#1b1411"} strokeWidth={0.3} />
            <text x={px + 3.2} y={top + 2.15} textAnchor="middle" fontSize="1.9" fill="#1b1411" fontWeight="bold">{i === 0 ? "Chính" : "Biệt"}</text>
            {run.refugees === i && (
              <text x={px + 8} y={top + 2.15} fontSize="1.9" fill="#f0d77f" style={LABEL_HALO} aria-label="đang hộ tống">⚑ hộ tống</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function RunView(props: {
  run: Omit<ExpeditionRun, "seed">;
  map: MapView;
  encounters: Overview["encounters"];
  visible: readonly string[];
  scenario: ScenarioView | null;
  army: ArmyIndex;
  setArmy: (a: ArmyIndex) => void;
  target: string | null;
  setTarget: (id: string | null) => void;
  busy: boolean;
  onMarch: (to: string) => void;
  onCamp: () => void;
  onScout: () => void;
  onCounter: (army: ArmyIndex) => void;
  onAbandon: () => void;
  onResume: () => void;
}) {
  const { run, map, encounters, army, target, scenario } = props;
  const seen = new Set(props.visible);
  const selected = run.armies[army];
  const reachable = run.phase === "march" ? expeditionNeighbors(map, selected.at) : [];
  const node = target && seen.has(target) ? map.nodes.find((n) => n.id === target) : undefined;
  const nameOf = (id: string) => map.nodes.find((n) => n.id === id)?.name ?? id;
  // Đạo mang dân rời làng tới ô không có trận khi đồn chặn chưa chiếm: gặp truy binh (server đã tính sẵn).
  const hasFight = (id: string) => !!encounters[id];
  const chase = node && scenario?.chase && run.refugees === army && !hasFight(node.id) ? scenario.chase : undefined;
  const noun = scenario?.refugeeNoun ?? "đoàn dân";
  const preview = chase ?? (target ? encounters[target]?.[army] : undefined);
  const roadKind = node && reachable.includes(node.id) ? expeditionEdgeKind(map, selected.at, node.id) : undefined;
  const roadBroken = !!node && !!run.knownBroken?.includes(expeditionEdgeKey(selected.at, node.id));
  const tideClosed = roadKind === "tide" && !!scenario?.tideDays && !scenario.tideDays.includes(run.day);
  const counter = scenario?.counter;
  const cleared = (id: string) => run.nodes[id]?.cleared === true;
  const canFight = (a: ArmyIndex) => run.armies[a].ids.some((id) => (run.armies[a].fighters[id]?.hp ?? 0) > 0);
  const reinforce = Math.round(EXPEDITION_REINFORCE_PER_DAY * (run.day - 1) * 100);
  const tierInfo = map.tiers.find((t) => t.tier === run.tier)!;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="ui-frame p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold">{map.name} · {tierInfo.name}</h2>
          <p className="text-sm">
            Ngày <strong className="text-frame-gold">{run.day}</strong>/{map.days} · chuẩn {map.parDays} ngày
            {reinforce > 0 && <> · giặc tăng viện <strong className="text-danger">+{reinforce}%</strong></>}
          </p>
        </div>
        <SandTable
          run={run}
          map={map}
          seen={seen}
          army={army}
          target={target}
          reachable={reachable}
          setArmy={props.setArmy}
          setTarget={props.setTarget}
        />
        <p className="mt-2 text-caption text-on-wood-soft">
          Chạm cờ để chọn đạo quân, chạm ô kề (viền màu đạo) để xem rồi tiến quân. Đạo không tiến được nghỉ, hồi
          {` ${Math.round(EXPEDITION_REST_HEAL * 100)}% `}máu mỗi ngày (kể cả người gục). Đường xanh đứt nét là vượt nước, mất
          2 ngày; xanh lá đứt nét là lội đầm (2 ngày); chấm xanh ≈ là cửa nước, chỉ qua lúc nước rút; đỏ ✕ là đường đã biết bị
          phá. Sương mù che các ô chưa trinh sát; chiếm chòi canh để nhìn xa. Chấm đỏ: đồn đánh dở, địch giữ thương vong.
        </p>
      </div>

      <div className="space-y-4">
        {counter && run.phase === "march" && (
          <div className="ui-frame p-4 sm:p-5 border-danger/60">
            <h3 className="font-serif text-lg font-bold text-danger">Giặc phản công {nameOf(scenario?.market ?? "")}</h3>
            <p className="mt-1 text-sm text-on-wood-soft">
              {ARMY_NAME[counter.army]} đang giữ {nameOf(scenario?.market ?? "")} phải đánh trước: cầm cự{" "}
              {counter.objective && "turns" in counter.objective ? counter.objective.turns : 6} lượt (hoặc hạ hết) là giữ được,
              thêm lương{scenario?.village ? " và đưa dân về đây được" : ""}. Thua thì rút khỏi kho.
            </p>
            <Button variant="primary" className="mt-3" disabled={props.busy || !canFight(counter.army)} onClick={() => props.onCounter(counter.army)}>
              {ARMY_NAME[counter.army]} giữ {nameOf(scenario?.market ?? "")}
            </Button>
          </div>
        )}
        {scenario && <MissionPanel run={run} scenario={scenario} nameOf={nameOf} />}
        {run.phase === "battle" && run.battle ? (
          <div className="ui-frame p-4 sm:p-5">
            <h3 className="font-serif text-lg font-bold">Trận đang đánh</h3>
            <p className="mt-1 text-sm text-on-wood-soft">
              {ARMY_NAME[run.battle.army]} đánh {map.nodes.find((n) => n.id === run.battle!.node)?.name}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" disabled={props.busy} onClick={props.onResume}>Vào trận</Button>
              <Button variant="secondary" disabled={props.busy} onClick={props.onAbandon}>Rút khỏi viễn chinh</Button>
            </div>
          </div>
        ) : (
          <div className="ui-frame p-4 sm:p-5">
            {node ? (
              <>
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold">
                  {node.name} <span className="text-caption font-normal text-on-wood-soft">{KIND_NAME[node.kind]}{cleared(node.id) ? " · đã chiếm" : ""}</span>
                </h3>
                <p className="mt-1 text-sm text-on-wood-soft">{KIND_TEXT[node.kind]}</p>
                {chase && (
                  <p className="mt-2 rounded bg-danger-surface p-2 text-caption text-on-wood">
                    Truy binh đuổi {noun} vì {nameOf(scenario?.chaseUnless ?? "")} chưa chiếm: rời {nameOf(scenario?.village ?? "")} là vào
                    trận hộ tống (giữ {chase.objective && "turns" in chase.objective ? chase.objective.turns : 6} lượt hoặc hạ hết). Thua thì {noun} bị bắt lại.
                  </p>
                )}
                {!chase && preview && run.refugees === army && (
                  <p className="mt-2 rounded bg-danger-surface p-2 text-caption text-on-wood">Đạo này đang hộ tống {noun}: thua trận này thì {noun} bị bắt lại.</p>
                )}
                {preview?.objective?.type === "hold" && (
                  <p className="mt-2 text-caption text-frame-gold">
                    Trận giữ: cầm cự {preview.objective.turns} lượt của bạn (hoặc hạ hết) là thắng
                    {scenario?.reinforcementLabel && !run.reinforcementsCut ? `, chặn được ${scenario.reinforcementLabel}` : ""}.
                  </p>
                )}
                {preview?.mode === "gate" && (
                  <p className="mt-2 text-caption text-frame-gold">
                    Phase 1 phá cổng: hạ Cổng thành là qua (lính giữ còn lại theo sang trận sau).
                    {scenario?.gateSkipFrom ? ` Đánh vào từ ${nameOf(scenario.gateSkipFrom)} thì bỏ qua cổng.` : ""}
                  </p>
                )}
                {preview && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-caption text-on-wood-soft">
                      AI {DIFFICULTY_NAME[preview.difficulty]} · cấp {preview.foes[0]?.level}
                      {preview.pincer && <span className="ml-2 rounded bg-jade/20 px-1.5 py-0.5 text-jade">Giáp công: máu địch −{Math.round((1 - EXPEDITION_PINCER_HP) * 100)}%</span>}
                    </p>
                    {preview.foes.map((f, i) => (
                      <div key={`${f.id}-${i}`} className="flex items-center gap-2 rounded bg-wood-inset p-1.5">
                        <Portrait id={f.id} element={f.element} profession={f.profession} className="size-8" level={f.level} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-sm">
                            <strong className="truncate">{f.name}</strong>
                            <ElementIcon element={f.element} className="size-3.5" />
                            <ProfessionIcon profession={f.profession} className="size-3.5" />
                            <span className="ml-auto text-caption text-on-wood-soft">{Math.round(f.maxHp * f.hpRatio)} máu</span>
                          </div>
                          <HpBar ratio={f.hpRatio} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {reachable.includes(node.id) && expeditionEdgeDays(map, selected.at, node.id) > 1 && (
                  <p className="mt-2 text-caption text-info">Vượt nước: đi mất {expeditionEdgeDays(map, selected.at, node.id)} ngày, đạo kia nghỉ cả {expeditionEdgeDays(map, selected.at, node.id)} ngày.</p>
                )}
                {roadKind === "tide" && (
                  <p className="mt-2 text-caption text-info">
                    Cửa nước: {scenario?.tideDays ? `nước rút các ngày ${scenario.tideDays.join(", ")}${tideClosed ? "; hôm nay nước đang lên" : "; hôm nay đi được"}.` : `chưa rõ con nước (chiếm ${nameOf(scenario?.tideRevealedBy ?? "")} hoặc đưa dân về để biết). Đi trúng ngày nước lên thì mất ngày.`}
                  </p>
                )}
                {roadBroken ? (
                  <p className="mt-3 text-caption text-danger">Đường từ {nameOf(selected.at)} tới đây đã bị phá.</p>
                ) : reachable.includes(node.id) ? (
                  <Button variant="primary" className="mt-3" disabled={props.busy || !canFight(army) || tideClosed || !!counter} onClick={() => props.onMarch(node.id)}>
                    {chase ? `${ARMY_NAME[army]} đưa dân đi, đánh truy binh` : preview ? `${ARMY_NAME[army]} tấn công` : `${ARMY_NAME[army]} tiến quân`}
                  </Button>
                ) : (
                  <p className="mt-3 text-caption text-on-wood-soft">{ARMY_NAME[army]} chưa tới được ô này (chỉ đi sang ô kề).</p>
                )}
              </>
            ) : (
              <p className="text-sm text-on-wood-soft">Chọn một ô trên sa bàn để xem địch và tiến quân.</p>
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
              className="ui-frame p-4 sm:p-5 block w-full text-left"
              style={{ borderColor: army === i ? ARMY_COLOR[i] : undefined }}
            >
              <div className="flex items-baseline justify-between">
                <strong style={{ color: ARMY_COLOR[i] }}>{ARMY_NAME[i]}</strong>
                <span className="flex items-center gap-1 text-caption text-on-wood-soft"><FoodIcon className="size-3.5" />{a.food} · tại {at?.name}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {a.ids.map((id) => {
                  const f = a.fighters[id]!;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Portrait id={id} element={f.config.element} profession={f.config.profession} className="size-7" />
                      <div className="flex-1">
                        <div className="flex justify-between text-caption"><span>{f.config.name}</span><span className={f.hp <= 0 ? "text-danger" : "text-on-wood-soft"}>{f.hp <= 0 ? "Gục" : `${f.hp}/${f.config.maxHp}`}</span></div>
                        <HpBar ratio={f.hp / f.config.maxHp} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {!canFight(i as ArmyIndex) && <p className="mt-2 text-caption text-danger">Cả đạo đang gục, cần nghỉ để hồi sức.</p>}
            </button>
          );
        })}

        {run.phase === "march" && (
          <div className="ui-frame p-4 sm:p-5 flex flex-wrap gap-2">
            <Button variant="secondary" disabled={props.busy || !!counter} onClick={props.onScout}>
              {ARMY_NAME[army]} trinh sát
            </Button>
            <Button variant="secondary" disabled={props.busy || !!counter} onClick={props.onCamp}>Đóng quân (cả hai đạo nghỉ 1 ngày)</Button>
            <Button variant="secondary" disabled={props.busy} onClick={props.onAbandon}>Rút khỏi viễn chinh</Button>
            <p className="w-full text-caption text-on-wood-soft">Thua một trận: đạo đó rút về ô cũ, cả ba gục, phải nghỉ để hồi. Không mất lượt viễn chinh.</p>
            <p className="w-full text-caption text-on-wood-soft">
              Trinh sát: đạo đang chọn đứng yên 1 ngày (không hồi sức), vén sương mọi ô trong {EXPEDITION_SCOUT_SIGHT} bước
              {scenario?.brokenRoads
                ? " và phát hiện đường bị phá quanh đó. Đường bị phá trông như đường thường; đi trúng thì mất ngày."
                : "."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function MissionPanel({ run, scenario, nameOf }: { run: Omit<ExpeditionRun, "seed">; scenario: ScenarioView; nameOf: (id: string) => string }) {
  const rows: { done: boolean; text: string; label: string }[] = [];
  if (scenario.village && scenario.home) {
    const home = nameOf(scenario.home);
    const market = scenario.market && run.market?.status === "held" ? ` hoặc ${nameOf(scenario.market)}` : "";
    const noun = scenario.refugeeNoun ?? "đoàn dân";
    const Noun = `${noun[0]!.toUpperCase()}${noun.slice(1)}`;
    rows.push({
      label: scenario.refugeeTitle ?? "Rút dân",
      ...(run.refugees === "saved"
        ? { done: true, text: `Đã đưa ${noun} về.` }
        : run.refugees === "lost"
          ? { done: false, text: `${Noun} đã bị bắt lại.` }
          : run.refugees === 0 || run.refugees === 1
            ? { done: false, text: `${ARMY_NAME[run.refugees]} đang hộ tống ${noun}, đưa về ${home}${market}.` }
            : { done: false, text: `Tới ${nameOf(scenario.village)} nhận ${noun}, đưa về ${home}${market}.` }),
    });
  }
  if (scenario.reinforcementDays) {
    const label = scenario.reinforcementLabel ?? "viện binh";
    const holdAt = (scenario.holdNodes ?? []).map(nameOf).join(", ");
    const next = scenario.reinforcementDays.find((d) => d >= run.day);
    rows.push({
      label: `Chặn ${label}`,
      ...(run.reinforcementsCut
        ? { done: true, text: `Đã giữ ${holdAt}, ${label} bị chặn.` }
        : {
            done: false,
            text: next
              ? `${label[0]!.toUpperCase()}${label.slice(1)} tới cuối ngày ${next}${run.arrivals ? ` (đã tới ${run.arrivals} lần)` : ""}.${holdAt ? ` Giữ ${holdAt} để chặn.` : ""}`
              : `${label[0]!.toUpperCase()}${label.slice(1)} đã tới ${run.arrivals ?? 0} lần.`,
          }),
    });
  }
  if (scenario.tideRevealedBy)
    rows.push({
      label: "Cửa nước",
      ...(scenario.tideDays
        ? { done: true, text: `Nước rút các ngày ${scenario.tideDays.join(", ")}.` }
        : { done: false, text: `Chưa rõ con nước: chiếm ${nameOf(scenario.tideRevealedBy)}${scenario.village ? " hoặc đưa dân về" : ""}.` }),
    });
  if (scenario.market)
    rows.push({
      label: nameOf(scenario.market),
      ...(run.market?.status === "held"
        ? { done: true, text: "Đã giữ được trước đợt phản công." }
        : run.market?.status === "lost"
          ? { done: false, text: "Giặc đã chiếm lại." }
          : run.market?.status === "due"
            ? { done: false, text: "Giặc đang phản công." }
            : run.market
              ? { done: false, text: `Giặc sẽ phản công cuối ngày ${run.market.taken + (scenario.counterAfterDays ?? 0)}; cần một đạo đứng giữ.` }
              : { done: false, text: `Chiếm được thì ${scenario.counterAfterDays ?? 0} ngày sau giặc phản công.` }),
    });
  if (scenario.gate)
    rows.push({
      label: "Cổng thành",
      ...(Object.values(run.nodes).some((n) => n?.gateDown)
        ? { done: true, text: "Cổng đã sụp." }
        : { done: false, text: `Phải phá cổng trước khi đánh tướng giữ thành${scenario.gateSkipFrom ? `, trừ khi đánh vào từ ${nameOf(scenario.gateSkipFrom)}` : ""}.` }),
    });
  if (scenario.brokenRoads)
    rows.push({ label: "Đường bị phá", done: false, text: `Đã biết ${run.knownBroken?.length ?? 0} đường. Trinh sát để phát hiện trước.` });
  return (
    <div className="ui-frame p-4 sm:p-5">
      <h3 className="font-serif text-lg font-bold">{scenario.endings || scenario.missionGold ? "Nhiệm vụ" : "Luật sa bàn"}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex gap-2">
            <span className={r.done ? "text-jade" : "text-on-wood-soft/70"} aria-hidden>{r.done ? "✔" : "○"}</span>
            <span><strong>{r.label}:</strong> {r.text}</span>
          </li>
        ))}
      </ul>
      {scenario.endings && (
        <p className="mt-2 text-caption text-on-wood-soft">Chiếm thành sau khi rút dân và cắt viện là Toàn thắng. Chưa chiếm được thành mà đã làm đủ hai việc đó là Giữ dân: có ít vàng nhưng chưa tính qua bậc.</p>
      )}
      {!scenario.endings && scenario.missionGold && (
        <p className="mt-2 text-caption text-on-wood-soft">
          Nhiệm vụ không bắt buộc: chiếm thành sau khi xong {scenario.village && scenario.reinforcementDays ? "cả hai việc hộ tống và chặn viện" : "nhiệm vụ"} thì
          vàng thưởng ×{String(scenario.missionGold).replace(".", ",")}.
        </p>
      )}
      {run.log && run.log.length > 0 && (
        <ol className="mt-3 space-y-0.5 border-t border-frame-line-soft pt-2 text-caption text-on-wood-soft">
          {run.log.map((line, i) => <li key={i}>{line}</li>)}
        </ol>
      )}
    </div>
  );
}

// ——— Kết thúc ———

function ResultView({ run, map, result, onNew }: { run: Omit<ExpeditionRun, "seed">; map: MapView; result: ExpeditionResult; onNew: () => void }) {
  const tierName = map.tiers.find((t) => t.tier === run.tier)?.name;
  const reason = run.endReason === "timeout" ? "Hết ngày hành quân mà chưa chiếm được thành." : run.endReason === "abandoned" ? "Đã rút quân." : "";
  return (
    <section className="ui-frame p-4 sm:p-5 text-center">
      <h2 className={`font-serif text-2xl font-bold ${result.won || result.ending ? "text-frame-gold" : "text-danger"}`}>
        {result.ending
          ? `${expeditionEndingName(result.ending)}${result.won ? `: đã chiếm ${map.nodes.find((n) => n.id === map.citadel)?.name}!` : ": chưa chiếm được thành, nhưng đã cứu dân và chặn viện."}`
          : result.won
            ? `Đã chiếm ${map.nodes.find((n) => n.id === map.citadel)?.name}!`
            : "Viễn chinh thất bại"}
      </h2>
      <p className="mt-1 text-sm text-on-wood-soft">{map.name} · {tierName} · {result.days} ngày</p>
      {result.won || result.ending ? (
        <>
          <Stars n={result.stars} className="mt-2 block text-3xl" />
          <p className="mt-1 text-caption text-on-wood-soft">
            {result.ending
              ? `★★★ toàn thắng · ★★ chiếm trại trong ${map.parDays} ngày · ★ chiếm trại muộn hoặc giữ dân`
              : `★ chiếm thành · ★ xong trong ${map.parDays} ngày · ★ không thua trận nào`}
          </p>
          <p className="mt-3 font-semibold text-frame-gold">
            +{result.gold} vàng{result.firstClear ? " (thắng lần đầu)" : ""}{result.mission ? " · xong nhiệm vụ" : ""}
            {result.item && ` · ${SLOT_NAME[result.item.slot]} phẩm ${TIER_COLOR_NAME[result.item.tier]} hệ ${ELEMENT_NAME[result.item.element]}`}
            {result.bonusItem && ` · thưởng toàn thắng: ${SLOT_NAME[result.bonusItem.slot]} phẩm ${TIER_COLOR_NAME[result.bonusItem.tier]}`}
            {result.soldFor > 0 && ` · túi đầy, món thưởng bán được ${result.soldFor} vàng`}
          </p>
          {!result.won && result.ending && (
            <p className="mt-1 text-caption text-on-wood-soft">Giữ dân chưa tính là qua bậc: phải chiếm thành mới mở bậc sau.</p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-on-wood-soft">{reason} Vàng, kinh nghiệm và đồ rơi của từng trận vẫn được giữ.</p>
      )}
      <Button variant="primary" className="mt-4" onClick={onNew}>Viễn chinh mới</Button>
    </section>
  );
}
