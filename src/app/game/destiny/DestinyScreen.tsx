"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DESTINY_BOON_CATALOG,
  DESTINY_ROSTER_MIN,
  MAIN_ID,
  companionById,
  type DestinyLeaderBuild,
  type DestinyProgress,
  type DestinyRewardOffer,
  type FloorRules,
  type Profile,
} from "@/core";
import { ONLINE_BATTLE_KEY } from "../battle/online";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { useScene, SceneLink } from "../SceneContext";
import { describeRules } from "../trial/trial-ui";
import {
  DESTINY_ERROR_TEXT,
  aliveIds,
  defaultDestinyBuild,
  legalLeaderBuilds,
  lineupLegal,
  rewardCandidates,
  rewardTargetLimit,
} from "./destiny-ui";

interface DestinyOverview {
  readonly supported: boolean;
  readonly cycleId: string | null;
  readonly stones: number;
  readonly progress: DestinyProgress | null;
  readonly floor: {
    readonly floor: number;
    readonly rules: FloorRules;
    readonly difficulty: string;
    readonly foes: readonly { readonly id: string; readonly name: string }[];
  } | null;
}

interface ApiResult {
  readonly ok?: boolean;
  readonly id?: string;
  readonly error?: string;
}

async function json<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, cache: "no-store" });
    return await response.json() as T;
  } catch {
    return null;
  }
}

const post = <T,>(url: string, body?: unknown) => json<T>(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

const offerText = (offer: DestinyRewardOffer): { title: string; body: string } => {
  switch (offer.kind) {
    case "targeted_heal": return { title: "Chữa thương", body: "Hồi 50% HP tối đa cho một tướng còn sống." };
    case "field_medic": return { title: "Quân y", body: "Hồi 20% HP tối đa cho tối đa ba tướng còn sống." };
    case "rescue": return { title: "Cứu viện", body: "Hồi sinh một tướng gục với 30% HP và 0 năng lượng." };
    case "boon": {
      const boon = DESTINY_BOON_CATALOG[offer.boonId];
      return { title: `Phúc · ${offer.boonId}`, body: `${boon.group} · ${boon.rarity} · tối đa ${boon.maxStacks} stack` };
    }
  }
};

function rememberBattle(id: string) {
  try { window.localStorage.setItem(ONLINE_BATTLE_KEY, id); } catch { /* server vẫn giữ matchId */ }
}

export default function DestinyScreen() {
  const { go } = useScene();
  const [overview, setOverview] = useState<DestinyOverview | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roster, setRoster] = useState<readonly string[]>([]);
  const [active, setActive] = useState<readonly string[]>([]);
  const [build, setBuild] = useState<DestinyLeaderBuild | null>(null);
  const [offerIndex, setOfferIndex] = useState<number | null>(null);
  const [targets, setTargets] = useState<readonly string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const [destiny, stored] = await Promise.all([
      json<DestinyOverview>("/api/destiny"),
      json<{ profile?: Profile }>("/api/profile"),
    ]);
    if (!destiny || !stored?.profile) { setFailed(true); return; }
    setFailed(false);
    setOverview(destiny);
    setProfile(stored.profile);
    const run = destiny.progress?.run;
    if (run?.active) {
      const alive = aliveIds(run);
      setActive([MAIN_ID, ...alive.filter((id) => id !== MAIN_ID).slice(0, 2)]);
    } else {
      setRoster([MAIN_ID, ...Object.keys(stored.profile.companions).sort()]);
    }
    setBuild(null);
    setOfferIndex(null);
    setTargets([]);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const run = overview?.progress?.run ?? null;
  const rules = overview?.floor?.rules ?? null;
  const builds = useMemo(() => run && rules ? legalLeaderBuilds(run, rules, active) : [], [run, rules, active]);
  const chosenBuild = build ?? (run && rules ? defaultDestinyBuild(run, rules, active) : null);
  const chosenOffer = run?.offer && offerIndex !== null ? run.offer[offerIndex] : null;
  const candidates = chosenOffer && run ? rewardCandidates(run, chosenOffer) : [];
  const leaderNeedsRescue = !!run?.fighters?.[MAIN_ID] &&
    (run.fighters[MAIN_ID]!.downed || run.fighters[MAIN_ID]!.hp <= 0);

  const fail = (error?: string) => setMessage(DESTINY_ERROR_TEXT[error ?? "network"] ?? "Không thực hiện được. Hãy tải lại.");
  const refreshAfter = async () => { await load(); setBusy(false); };

  const startRun = async () => {
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/run", { rosterIds: roster });
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  const startBattle = async () => {
    if (!chosenBuild) return;
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/battles", { activeIds: active, leaderBuild: chosenBuild });
    if (!result?.id) { setBusy(false); fail(result?.error); return; }
    rememberBattle(result.id);
    go("PLAYING", { resume: "1" });
  };

  const resume = () => {
    if (!run?.matchId) return;
    rememberBattle(run.matchId);
    go("PLAYING", { resume: "1" });
  };

  const claim = async () => {
    if (!run || offerIndex === null || !chosenOffer) return;
    const limit = rewardTargetLimit(chosenOffer);
    if (targets.length < limit.min || targets.length > limit.max) {
      setMessage(`Hãy chọn ${limit.min === limit.max ? limit.min : `${limit.min}–${limit.max}`} mục tiêu.`);
      return;
    }
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/reward", { floor: run.floor, index: offerIndex, targetIds: targets });
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  const stop = async () => {
    setBusy(true); setMessage(null);
    const result = await post<ApiResult>("/api/destiny/stop");
    if (!result?.ok) { setBusy(false); fail(result?.error); return; }
    await refreshAfter();
  };

  if (!overview || !profile) return (
    <main className="flex flex-1 items-center justify-center bg-[#17110e] p-6 text-stone-200">
      <div className="text-center">{failed ? <><p role="alert">Không tải được Tháp Vận Mệnh.</p><button className="mt-3 rounded bg-white/10 px-4 py-2" onClick={() => void load()}>Tải lại</button></> : <p role="status">Đang tải Tháp Vận Mệnh…</p>}</div>
    </main>
  );

  const fighterName = (id: string) => run?.fighters?.[id]?.config.name ?? (id === MAIN_ID ? "Đinh Bộ Lĩnh" : companionById(id)?.name ?? id);
  const noActiveRun = !run?.active && run?.phase !== "reward";

  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,#34251d_0%,#17110e_62%)] px-3 py-6 text-stone-100 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-xl border border-amber-500/30 bg-black/20 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[.2em] text-amber-400">Chu kỳ {overview.cycleId ?? "—"}</p><h1 className="font-serif text-3xl font-bold text-amber-100">Tháp Vận Mệnh</h1><p className="mt-1 text-sm text-stone-400">HP, năng lượng và lương được giữ xuyên tầng. Roster khóa cho cả run.</p></div>
            <div className="text-right text-sm"><p>Đá Cường Hóa: <strong className="text-amber-300">{overview.stones}</strong></p><p>Kỷ lục chu kỳ: tầng {overview.progress?.cycleBest ?? 0}</p><SceneLink scene="LEADERBOARD" params={{ board: "destiny" }} className="text-amber-300 underline">BXH Vận Mệnh</SceneLink></div>
          </div>
        </header>

        {message && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/50 p-3 text-rose-100">{message}</p>}

        {noActiveRun && (
          <section className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h2 className="font-serif text-xl font-bold">Khóa roster mới</h2>
            {run?.phase === "done" && <p className="mt-1 text-sm text-stone-400">Run trước đã kết thúc ở tầng {run.floor}.</p>}
            <p className="mt-2 text-sm text-stone-300">Chỉ cần tổng cộng tối thiểu {DESTINY_ROSTER_MIN} tướng: Đinh Bộ Lĩnh và ít nhất 2 tướng sở hữu. Có thể mang toàn bộ tướng đã sở hữu.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(profile.companions).sort().map((id) => {
                const companion = companionById(id);
                if (!companion) return null;
                const selected = roster.includes(id);
                return <button key={id} type="button" onClick={() => setRoster(selected ? roster.filter((x) => x !== id) : [...roster, id])} className={`rounded-lg border p-3 text-left ${selected ? "border-amber-400 bg-amber-500/15" : "border-white/10 bg-white/5"}`}><strong>{companion.name}</strong><span className="block text-xs text-stone-400">{ELEMENT_NAME[companion.element]} · {PROFESSION_NAME[companion.profession]}</span></button>;
              })}
            </div>
            <button disabled={busy || roster.length < DESTINY_ROSTER_MIN} onClick={() => void startRun()} className="mt-4 rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-stone-950 disabled:opacity-40">{busy ? "Đang bắt đầu…" : `Bắt đầu với ${roster.length} tướng`}</button>
          </section>
        )}

        {run && run.active && (
          <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h2 className="font-serif text-xl font-bold">Run · tầng {run.floor}</h2>
              <p className="mt-1">Lương: <strong className="text-amber-300">{run.food}</strong> · Nộ khí: {run.rage ?? 0}</p>
              <div className="mt-4 space-y-2">{run.roster.map((id) => { const f = run.fighters?.[id]; if (!f) return null; const ratio = Math.round(100 * f.hp / f.config.maxHp); return <div key={id} className="rounded-lg bg-white/5 p-3"><div className="flex justify-between"><strong>{f.config.name}</strong><span className={f.downed ? "text-rose-400" : "text-stone-300"}>{f.downed ? "Đã gục" : `${f.hp}/${f.config.maxHp} HP · ${f.energy} NL`}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded bg-black/40"><div className="h-full bg-emerald-500" style={{ width: `${ratio}%` }} /></div></div>; })}</div>
              <h3 className="mt-4 font-semibold text-amber-200">Phúc đang có</h3>
              <p className="text-sm text-stone-400">{run.boons?.length ? run.boons.map((b) => `${b.id} ×${b.stacks}`).join(" · ") : "Chưa có Phúc"}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              {run.phase === "battle" && <><h2 className="font-serif text-xl font-bold">Trận tầng {run.floor} đang diễn ra</h2><p className="mt-2 text-stone-300">Tiếp tục đúng match đã lưu; mở tab khác không tạo trận mới.</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy || !run.matchId} onClick={resume} className="rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-stone-950">Tiếp tục trận</button><button disabled={busy} onClick={() => void stop()} className="rounded-lg bg-white/10 px-4 py-2.5">Dừng và nhận thua</button></div></>}

              {run.phase === "prepare" && rules && <><h2 className="font-serif text-xl font-bold">Chuẩn bị tầng {run.floor}</h2><div className="mt-2 flex flex-wrap gap-2 text-sm">{describeRules(rules).map((line) => <span key={line.text} className="rounded-full bg-white/10 px-3 py-1">{line.text}</span>)}</div><p className="mt-3 text-sm text-stone-400">Đối thủ: {overview.floor?.foes.map((f) => f.name).join(", ")} · {overview.floor?.difficulty}</p><h3 className="mt-4 font-semibold">Chọn 2 tướng active</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{run.roster.filter((id) => id !== MAIN_ID).map((id) => { const f = run.fighters?.[id]; if (!f) return null; const selected = active.includes(id); const disabled = f.downed || f.hp <= 0 || (!selected && active.length >= 3); return <button key={id} disabled={disabled} onClick={() => { setActive(selected ? active.filter((x) => x !== id) : [...active, id]); setBuild(null); }} className={`rounded-lg border p-3 text-left ${selected ? "border-amber-400 bg-amber-500/15" : "border-white/10 bg-white/5"} disabled:opacity-35`}><strong>{f.config.name}</strong><span className="block text-xs text-stone-400">{f.hp}/{f.config.maxHp} HP · {f.energy} NL</span></button>; })}</div><h3 className="mt-4 font-semibold">Nghề và hệ của Đinh Bộ Lĩnh</h3><div className="mt-2 flex flex-wrap gap-2">{builds.map((option) => { const selected = chosenBuild?.element === option.element && chosenBuild.profession === option.profession; return <button key={`${option.element}-${option.profession}`} onClick={() => setBuild(option)} className={`rounded px-3 py-2 text-sm ${selected ? "bg-amber-500 font-bold text-stone-950" : "bg-white/10"}`}>{ELEMENT_NAME[option.element]} · {PROFESSION_NAME[option.profession]}</button>; })}</div>{builds.length === 0 && <p className="mt-2 text-sm text-rose-300">Đội đang chọn không có build thủ lĩnh hợp luật.</p>}<div className="mt-5 flex flex-wrap gap-2"><button disabled={busy || !chosenBuild || !lineupLegal(run, rules, active, chosenBuild)} onClick={() => void startBattle()} className="rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-stone-950 disabled:opacity-40">{busy ? "Đang mở trận…" : "Đánh tầng này"}</button><button disabled={busy} onClick={() => void stop()} className="rounded-lg bg-white/10 px-4 py-2.5">Dừng run</button></div></>}

              {run.phase === "reward" && run.offer && <><h2 className="font-serif text-xl font-bold">Chọn một phần thưởng tầng {run.floor}</h2><p className="mt-1 text-sm text-stone-400">Ba lựa chọn đã được khóa; tải lại không đổi offer.</p>{leaderNeedsRescue && <p role="alert" className="mt-3 rounded-lg border border-rose-400/30 bg-rose-950/50 p-3 text-sm text-rose-100">Đinh Bộ Lĩnh đã gục. Phải chọn Cứu viện cho thủ lĩnh trước khi sang tầng kế.</p>}<div className="mt-4 grid gap-3">{run.offer.map((offer, index) => { const text = offerText(offer); const blocked = leaderNeedsRescue && offer.kind !== "rescue"; return <button key={`${offer.kind}-${index}`} disabled={blocked} onClick={() => { setOfferIndex(index); setTargets([]); }} className={`rounded-lg border p-4 text-left ${offerIndex === index ? "border-amber-400 bg-amber-500/15" : "border-white/10 bg-white/5"} disabled:cursor-not-allowed disabled:opacity-35`}><strong className="text-amber-100">{text.title}</strong><span className="block text-sm text-stone-400">{text.body}</span></button>; })}</div>{chosenOffer && chosenOffer.kind !== "boon" && <div className="mt-4"><h3 className="font-semibold">Chọn mục tiêu</h3><div className="mt-2 flex flex-wrap gap-2">{candidates.map((id) => { const selected = targets.includes(id); const max = rewardTargetLimit(chosenOffer).max; return <button key={id} disabled={(!selected && targets.length >= max) || (leaderNeedsRescue && id !== MAIN_ID)} onClick={() => setTargets(selected ? targets.filter((x) => x !== id) : [...targets, id])} className={`rounded px-3 py-2 ${selected ? "bg-emerald-600" : "bg-white/10"} disabled:opacity-40`}>{fighterName(id)}</button>; })}</div></div>}<button disabled={busy || offerIndex === null || (leaderNeedsRescue && (chosenOffer?.kind !== "rescue" || targets[0] !== MAIN_ID))} onClick={() => void claim()} className="mt-5 rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-stone-950 disabled:opacity-40">{busy ? "Đang nhận…" : "Nhận và sang tầng kế"}</button></>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
