"use client";
import RankRewardsPanel from "../rankRewards/RankRewardsPanel";
import { FrameInset, ModeBanner, ModeScreen, OrnateFrame, SectionTitle } from "@/components/game-ui";
import { Alert, Button, ChoiceChip } from "@/components/ui";
import { PageControls, usePagedItems } from "@/components/ui/Pagination";
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
import { DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";
import { Portrait } from "../art/portraits";
import { DestinyBoardPanel } from "../leaderboard/boards";
import { useScene } from "../SceneContext";
import { describeRules, RULE_TAG } from "../trial/trial-ui";
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

const difficultyName = (d?: string) => (d ? DIFFICULTY_NAME[d as keyof typeof DIFFICULTY_NAME] ?? d : "");

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
  // Danh sách tướng chọn vào đội: cắt trang 12 (chọn giữ nguyên khi sang trang). Hook đặt trước các return sớm.
  const rosterIds = useMemo(() => (profile ? Object.keys(profile.companions).sort() : []), [profile]);
  const pagedRoster = usePagedItems(rosterIds, 12);

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
    <ModeScreen label="Tháp Thiên Mệnh">
      <div className="py-24 text-center text-on-wood-soft">
        {failed ? (
          <>
            <p role="alert">Không tải được Tháp Thiên Mệnh.</p>
            <Button variant="secondary" className="mt-3 min-h-11" onClick={() => void load()}>Tải lại</Button>
          </>
        ) : <p role="status">Đang tải Tháp Thiên Mệnh…</p>}
      </div>
    </ModeScreen>
  );

  const fighterName = (id: string) => run?.fighters?.[id]?.config.name ?? (id === MAIN_ID ? "Đinh Bộ Lĩnh" : companionById(id)?.name ?? id);
  const noActiveRun = !run?.active && run?.phase !== "reward";

  return (
    <ModeScreen wide label="Tháp Thiên Mệnh">
      <ModeBanner
        title="Tháp Thiên Mệnh"
        kicker={`Song Tháp · chu kỳ ${overview.cycleId ?? "—"}`}
        art="/art/home/destiny.webp"
        artPosition="center 42%"
        description="Máu, năng lượng và lương giữ xuyên tầng. Đội khóa cho cả lượt leo."
        stats={[
          { label: "Kỷ lục chu kỳ", value: `Tầng ${overview.progress?.cycleBest ?? 0}` },
          { label: "Đá Cường Hóa", value: overview.stones },
        ]}
      />

      {message && <Alert className="p-3 text-sm">{message}</Alert>}

      <RankRewardsPanel mode="destiny" />
      <DestinyBoardPanel />

      {noActiveRun && (
        <OrnateFrame level="raised">
          <SectionTitle description={run?.phase === "done" ? `Lượt trước đã kết thúc ở tầng ${run.floor}.` : undefined}>
            Khóa đội mới
          </SectionTitle>
          <p className="text-sm text-on-wood">
            Cần tối thiểu {DESTINY_ROSTER_MIN} tướng: Đinh Bộ Lĩnh và ít nhất 2 tướng sở hữu. Có thể mang toàn bộ tướng đã sở hữu.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {pagedRoster.pageItems.map((id) => {
              const companion = companionById(id);
              if (!companion) return null;
              const selected = roster.includes(id);
              return (
                <ChoiceChip key={id} size="md" selected={selected}
                  onClick={() => setRoster(selected ? roster.filter((x) => x !== id) : [...roster, id])}
                  className="items-center gap-2.5 p-2.5 text-left">
                  <Portrait id={id} element={companion.element} profession={companion.profession} className="size-12 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <strong>{companion.name}</strong>
                    <span className="text-caption font-normal opacity-80">{ELEMENT_NAME[companion.element]} · {PROFESSION_NAME[companion.profession]}</span>
                  </span>
                </ChoiceChip>
              );
            })}
          </div>
          <PageControls paged={pagedRoster} label="Phân trang tướng" className="mt-2" />
          <Button disabled={busy || roster.length < DESTINY_ROSTER_MIN} onClick={() => void startRun()} className="mt-4 min-h-11">
            {busy ? "Đang bắt đầu…" : `Bắt đầu với ${roster.length} tướng`}
          </Button>
        </OrnateFrame>
      )}

      {run && run.active && (
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_1.4fr]">
          <OrnateFrame className="order-2 min-w-0 self-start lg:order-1">
            <SectionTitle description={`Lương ${run.food} · Nộ khí ${run.rage ?? 0}`}>Đội · tầng {run.floor}</SectionTitle>
            <ul className="space-y-2">
              {run.roster.map((id) => {
                const f = run.fighters?.[id];
                if (!f) return null;
                const ratio = Math.round(100 * f.hp / f.config.maxHp);
                return (
                  <li key={id}>
                    <FrameInset>
                      <div className="flex justify-between gap-2 text-sm">
                        <strong className="text-on-wood">{f.config.name}</strong>
                        <span className={f.downed ? "text-danger" : "text-on-wood-soft"}>
                          {f.downed ? "Đã gục" : `${f.hp}/${f.config.maxHp} HP · ${f.energy} NL`}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-black/40">
                        <div className="h-full bg-jade" style={{ width: `${ratio}%` }} />
                      </div>
                    </FrameInset>
                  </li>
                );
              })}
            </ul>
            <h3 className="ui-title-on-wood mt-4 text-base">Phúc đang có</h3>
            <p className="text-sm text-on-wood-soft">{run.boons?.length ? run.boons.map((b) => `${b.id} ×${b.stacks}`).join(" · ") : "Chưa có Phúc"}</p>
          </OrnateFrame>

          <OrnateFrame level="raised" className="order-1 min-w-0 lg:order-2">
            {run.phase === "battle" && (
              <>
                <SectionTitle>Trận tầng {run.floor} đang diễn ra</SectionTitle>
                <p className="text-sm text-on-wood">Tiếp tục đúng trận đã lưu; mở tab khác không tạo trận mới.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button disabled={busy || !run.matchId} onClick={resume} className="min-h-11">Tiếp tục trận</Button>
                  <Button variant="secondary" disabled={busy} onClick={() => void stop()} className="min-h-11">Dừng và nhận thua</Button>
                </div>
              </>
            )}

            {run.phase === "prepare" && rules && (
              <>
                <SectionTitle description={`Đối thủ: ${overview.floor?.foes.map((f) => f.name).join(", ") ?? ""} · ${difficultyName(overview.floor?.difficulty)}`}>
                  Chuẩn bị tầng {run.floor}
                </SectionTitle>
                {describeRules(rules).length > 0 && (
                  <ul className="flex flex-col gap-1.5 text-sm text-on-wood">
                    {describeRules(rules).map((line) => (
                      <li key={line.text} className="flex items-start gap-2">
                        <span className="ui-rule-tag shrink-0" data-kind={line.kind}>{RULE_TAG[line.kind]}</span>
                        <span>{line.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">Chọn 2 tướng ra trận</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {run.roster.filter((id) => id !== MAIN_ID).map((id) => {
                    const f = run.fighters?.[id];
                    if (!f) return null;
                    const selected = active.includes(id);
                    const disabled = f.downed || f.hp <= 0 || (!selected && active.length >= 3);
                    return (
                      <ChoiceChip key={id} size="md" selected={selected} disabled={disabled}
                        onClick={() => { setActive(selected ? active.filter((x) => x !== id) : [...active, id]); setBuild(null); }}
                        className="flex-col items-start gap-0 p-3 text-left">
                        <strong>{f.config.name}</strong>
                        <span className="text-caption font-normal opacity-80">{f.hp}/{f.config.maxHp} HP · {f.energy} NL</span>
                      </ChoiceChip>
                    );
                  })}
                </div>
                <h3 className="ui-title-on-wood mt-4 mb-1.5 text-base">Nghề và hệ của Đinh Bộ Lĩnh</h3>
                <div className="flex flex-wrap gap-2">
                  {builds.map((option) => {
                    const selected = chosenBuild?.element === option.element && chosenBuild.profession === option.profession;
                    return (
                      <ChoiceChip key={`${option.element}-${option.profession}`} selected={selected} onClick={() => setBuild(option)}>
                        {ELEMENT_NAME[option.element]} · {PROFESSION_NAME[option.profession]}
                      </ChoiceChip>
                    );
                  })}
                </div>
                {builds.length === 0 && <p className="mt-2 text-sm text-danger">Đội đang chọn không có build thủ lĩnh hợp luật.</p>}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button disabled={busy || !chosenBuild || !lineupLegal(run, rules, active, chosenBuild)} onClick={() => void startBattle()} className="min-h-11">
                    {busy ? "Đang mở trận…" : "Đánh tầng này"}
                  </Button>
                  <Button variant="secondary" disabled={busy} onClick={() => void stop()} className="min-h-11">Dừng lượt leo</Button>
                </div>
              </>
            )}

            {run.phase === "reward" && run.offer && (
              <>
                <SectionTitle description="Ba lựa chọn đã khóa; tải lại không đổi.">Chọn một phần thưởng tầng {run.floor}</SectionTitle>
                {leaderNeedsRescue && (
                  <Alert className="p-3 text-sm">Đinh Bộ Lĩnh đã gục. Phải chọn Cứu viện cho thủ lĩnh trước khi sang tầng kế.</Alert>
                )}
                <div className="mt-3 grid gap-2">
                  {run.offer.map((offer, index) => {
                    const text = offerText(offer);
                    const blocked = leaderNeedsRescue && offer.kind !== "rescue";
                    return (
                      <ChoiceChip key={`${offer.kind}-${index}`} size="md" selected={offerIndex === index} disabled={blocked}
                        onClick={() => { setOfferIndex(index); setTargets([]); }}
                        className="flex-col items-start gap-0.5 p-4 text-left">
                        <strong>{text.title}</strong>
                        <span className="text-sm font-normal opacity-80">{text.body}</span>
                      </ChoiceChip>
                    );
                  })}
                </div>
                {chosenOffer && chosenOffer.kind !== "boon" && (
                  <div className="mt-4">
                    <h3 className="ui-title-on-wood mb-1.5 text-base">Chọn mục tiêu</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map((id) => {
                        const selected = targets.includes(id);
                        const max = rewardTargetLimit(chosenOffer).max;
                        return (
                          <ChoiceChip key={id} selected={selected}
                            disabled={(!selected && targets.length >= max) || (leaderNeedsRescue && id !== MAIN_ID)}
                            onClick={() => setTargets(selected ? targets.filter((x) => x !== id) : [...targets, id])}>
                            {fighterName(id)}
                          </ChoiceChip>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button disabled={busy || offerIndex === null || (leaderNeedsRescue && (chosenOffer?.kind !== "rescue" || targets[0] !== MAIN_ID))}
                  onClick={() => void claim()} className="mt-5 min-h-11">
                  {busy ? "Đang nhận…" : "Nhận và sang tầng kế"}
                </Button>
              </>
            )}
          </OrnateFrame>
        </section>
      )}
    </ModeScreen>
  );
}
