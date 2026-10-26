"use client";

// Các chương Campaign V2 đã có nội dung (Chương I–III, Chương IV có M13, M15, M16): intro → lựa chọn trình diễn → hoàn thành (story) hoặc chuẩn bị xuất quân
// (trận). Mọi tiến độ, lựa chọn và thưởng lấy từ hồ sơ server; trình duyệt chỉ nhớ bước đang xem và màn
// thưởng đã xem để tải lại trang không phải xem lại từ đầu.

import { useEffect, useState } from "react";
import {
  CAMPAIGN_CHAPTERS,
  CAMPAIGN_FINAL_NODE,
  CAMPAIGN_UNIFICATION_NODE,
  campaignCompleted,
  CAMPAIGN_FOOD_MAX,
  CAMPAIGN_ROUTES,
  ELEMENTS,
  FOOD_PRICE,
  MAIN_ID,
  PROFESSIONS,
  loadoutOf,
  ownsCompanion,
  campaignBattleAdvice,
  campaignEventByNode,
  campaignBattleScenario,
  campaignEncounter,
  campaignEncounterFoes,
  campaignSurviveTurns,
  campaignTerrain,
  campaignPhaseLabels,
  campaignScenarioByNode,
  campaignFocusChapter,
  campaignMusterReady,
  chapterContentOf,
  chapterFocus,
  chapterStatus,
  companionById,
  factionResolutionOfMission,
  missionCopy,
  pendingFirstClear,
  settleCampaignScenario,
  storyNodeById,
  type CampaignMissionId,
  type ChapterContent,
  type Element,
  type Profession,
  type Profile,
  type ProfileAction,
} from "@/core";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import {
  DIFFICULTY_NAME,
  ELEMENT_NAME,
  PROFESSION_NAME,
  gearText,
} from "../battle/labels";
import {
  completeCampaignEventOnline,
  createOnline,
  fetchOnline,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  toBattleState,
} from "../battle/online";
import WorldMap from "./WorldMap";
import { ChapterPanel, ChapterRail, StrongholdPanel } from "./AtlasShell";
import { strongholdById, type StrongholdId } from "./worldAtlas";
import { atlasSerif } from "./atlasFont";
import DiplomacyScene from "./DiplomacyScene";
import DialoguePlayer from "./DialoguePlayer";
import MusterPanel from "./MusterPanel";
import RouteSummary from "./RouteSummary";
import WorldLedger from "./WorldLedger";
import FactionDossiers from "./FactionDossiers";
import CampaignEnding from "./CampaignEnding";
import WarlordCodex, { MissionSources } from "./HistoricalCodex";
import {
  BasisBadge,
  FACTION_STATUS_TEXT,
  SourceNotes,
  TONE_TEXT,
} from "./StoryBeats";
import { useScene } from "../SceneContext";

/** Bước đang xem của nhiệm vụ: chỉ là tiện ích hiển thị, không phải tiến độ. */
const STEP_KEY = "coLau.campaign.v2.step";
/** Phiếu thưởng đã xem màn thưởng (rewardReceipts của server). */
const SEEN_KEY = "coLau.campaign.v2.seen";

type Phase = "intro" | "choice" | "prep";
interface Step {
  readonly nodeId: CampaignMissionId;
  readonly phase: Phase;
  readonly choice?: string;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Trình duyệt chặn lưu trữ: chỉ mất phần nhớ bước đang xem.
  }
}

const CERTAINTY_TEXT = {
  recorded: "vị trí có sử chép",
  traditional: "định vị truyền thống",
  disputed: "vị trí còn tranh luận",
  fictional: "địa điểm hư cấu",
} as const;

/** Nhiệm vụ kế tiếp sau khi hoàn thành: trong chương, hết chương thì sang chương sau nếu đã mở. */
function nextMission(
  profile: Profile,
  nodeId: CampaignMissionId,
): CampaignMissionId | null {
  const chapter = chapterContentOf(nodeId);
  if (!chapter) return null;
  // Khép Chương III thì ở lại xem Hội quân Hoa Lư trước khi chọn tuyến.
  if (chapter.chapter === 3 && campaignMusterReady(profile.campaign))
    return null;
  const index = CAMPAIGN_CHAPTERS.indexOf(chapter);
  for (const c of CAMPAIGN_CHAPTERS.slice(index)) {
    const next = chapterStatus(profile.campaign, c).find(
      (m) => m.status === "open" || m.status === "inProgress",
    );
    if (next) return next.id;
  }
  return null;
}

/** Lời đáp đã chọn rồi (nếu có) kết thúc nhiệm vụ, phát từng câu. Chỉ trình diễn, không gửi gì lên server. */
function StoryLines({
  profile,
  nodeId,
  choice,
  outro,
}: {
  profile: Profile;
  nodeId: string;
  choice?: string;
  outro?: boolean;
}) {
  const copy = missionCopy(nodeId);
  const picked = copy?.choices.find((c) => c.id === choice);
  const segments = [
    ...(picked
      ? [{ section: `choice:${picked.id}`, beats: picked.beats }]
      : []),
    ...(outro && copy ? [{ section: "outro", beats: copy.outro }] : []),
  ];
  if (segments.length === 0) return null;
  const sequence = segments.map((s) => s.section).join("+");
  return (
    <DialoguePlayer
      key={`${nodeId}:${sequence}`}
      missionId={nodeId}
      sequence={sequence}
      label={outro ? `Kết thúc ${nodeId}` : `Lời đáp ${nodeId}`}
      segments={segments}
      main={profile}
    />
  );
}

function RewardModal({
  profile,
  seen,
  onClose,
  onNext,
}: {
  profile: Profile;
  seen: readonly string[];
  onClose: (receipts: readonly string[]) => void;
  onNext: (receipts: readonly string[], next: CampaignMissionId | null) => void;
}) {
  const reward = pendingFirstClear(profile.campaign, seen);
  if (!reward) return null;
  const node = storyNodeById(reward.nodeId)!;
  const copy = missionCopy(reward.nodeId);
  const nextId = nextMission(profile, reward.nodeId);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-clear-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-[var(--gold)] bg-[#2a1f19] p-4 text-stone-100 shadow-2xl">
        <p className="text-xs tracking-widest text-amber-300/80 uppercase">
          Hoàn thành lần đầu · {node.id}
        </p>
        <h2
          id="first-clear-title"
          className="text-xl font-black text-amber-100"
        >
          {node.title}
        </h2>
        {copy && (
          <div className="mt-3">
            <StoryLines
              profile={profile}
              nodeId={node.id}
              choice={profile.campaign.storyChoices[node.id]}
              outro
            />
          </div>
        )}
        <ul className="mt-3 flex flex-col gap-1 rounded-md bg-black/30 p-2 text-sm">
          <li className="font-semibold text-amber-300">
            +{reward.missionGold} vàng thưởng nhiệm vụ
          </li>
          {reward.chapterGold > 0 && (
            <li className="font-semibold text-amber-300">
              +{reward.chapterGold} vàng hoàn thành chương
            </li>
          )}
          {(() => {
            const faction = campaignEventByNode(node.id)?.faction;
            return faction ? (
              <li className="text-sky-200">
                Thế cục:{" "}
                {companionById(faction.faction)?.name ?? faction.faction}{" "}
                {FACTION_STATUS_TEXT[faction.status].toLowerCase()} (không tính
                là trận thắng)
              </li>
            ) : null;
          })()}
          {reward.unlockedHeroes.map((id) => (
            <li key={id} className="text-emerald-300">
              Mở khóa đồng hành: {companionById(id)?.name ?? id}
            </li>
          ))}
          <li className="text-xs text-stone-400">
            Server đã ghi thưởng một lần; đánh lại hoặc xem lại không nhận thêm.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {nextId && (
            <button
              type="button"
              onClick={() => onNext(reward.receipts, nextId)}
              className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-4 py-2 font-bold text-amber-50"
            >
              Tiếp: {storyNodeById(nextId)!.title}
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose(reward.receipts)}
            className="rounded bg-white/10 px-4 py-2 hover:bg-white/15"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

interface BattleChoice {
  readonly element: Element;
  readonly profession: Profession;
  readonly team: readonly string[];
}

function BattlePrep({
  profile,
  nodeId,
  busy,
  resumeId,
  onAction,
  onStart,
  onResume,
}: {
  profile: Profile;
  nodeId: CampaignMissionId;
  busy: boolean;
  resumeId: string | null;
  onAction: (a: ProfileAction) => void;
  onStart: (choice: BattleChoice) => void;
  onResume: () => void;
}) {
  const [element, setElement] = useState<Element>(profile.element);
  const [profession, setProfession] = useState<Profession>(profile.profession);
  // Đội 3vs3: hai người đi cùng, chọn trong số nhân vật đã có (kể cả người mới gia nhập). Server kiểm lại.
  const owned = Object.keys(profile.companions).filter((id) =>
    ownsCompanion(profile, id),
  );
  const [team, setTeam] = useState<readonly string[]>(() => {
    const kept = profile.team.filter((id) => owned.includes(id));
    return kept.length === 2 ? kept : owned.slice(0, 2);
  });
  const toggleTeam = (id: string) =>
    setTeam((t) =>
      t.includes(id)
        ? t.filter((x) => x !== id)
        : t.length < 2
          ? [...t, id]
          : t,
    );
  const weapon = loadoutOf(profile, MAIN_ID).weapons[profession];
  // Công thành nhiều trận: phase kế tiếp do server ghi trong hồ sơ.
  const phase = profile.campaign.siegePhases[nodeId] ?? 0;
  const labels = campaignPhaseLabels(nodeId);
  const objective = campaignScenarioByNode(nodeId)?.phases[phase]?.objective;
  const bossHp = profile.campaign.phaseBossHp[nodeId];
  const advice = campaignBattleAdvice(
    { ...profile, element, profession },
    nodeId,
    phase,
  );
  const scenario = campaignBattleScenario(nodeId);
  const encounter = campaignEncounter(nodeId, phase);
  const foes = campaignEncounterFoes(nodeId, phase);
  const copy = missionCopy(nodeId);
  const turns = campaignSurviveTurns(nodeId, phase);
  const stage = objective?.type === "breakSiege" ? objective.stage : undefined;
  const terrain = campaignTerrain(nodeId);
  if (!advice || !scenario || !encounter || !foes) return null;
  const counters = advice.counterElements.includes(element);
  const weak = advice.weakElements.includes(element);
  const missing = Math.max(0, advice.suggestedFood - advice.food);
  const teamReady = advice.mode === "1v1" || team.length === 2;
  return (
    <div className="flex flex-col gap-3">
      {profile.campaign.completed.includes(nodeId) && (
        <p className="rounded-md border border-sky-400/40 bg-sky-500/10 p-2 text-xs text-sky-100">
          Đánh lại: chỉ nhận thưởng trận thường và có thể ghi số lượt tốt hơn.
          Thưởng nhiệm vụ, thế cục sứ quân và lựa chọn đã ghi không đổi.
        </p>
      )}
      {labels.length > 1 && (
        <ol className="flex flex-wrap gap-1 text-xs" aria-label="Các phase">
          {labels.map((label, i) => (
            <li
              key={label}
              aria-current={i === phase ? "step" : undefined}
              className={`rounded border px-2 py-1 ${
                i < phase
                  ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                  : i === phase
                    ? "border-amber-300 bg-amber-500/25 font-semibold text-amber-50"
                    : "border-white/10 bg-black/30 text-stone-400"
              }`}
            >
              {i < phase ? "✓ " : ""}Phase {i + 1}/{labels.length}: {label}
            </li>
          ))}
        </ol>
      )}
      {stage === "escort" && (
        <p className="rounded-md border border-violet-400/50 bg-violet-500/15 p-2 text-xs text-violet-100">
          <span className="font-semibold">Tình tiết phục vụ gameplay.</span>{" "}
          Đoàn lương và toán chặn đường do game sáng tác; sử không chép trận nào
          trên đường tiếp viện.
        </p>
      )}
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-100">
        <p className="font-semibold">⚑ Mục tiêu</p>
        <p>
          {stage === "escort"
            ? `Giữ đoàn lương ${turns} lượt của bạn hoặc hạ hết toán chặn đường.`
            : stage === "breach"
              ? `${labels[phase] ?? "Phá lũy"}: hạ hết quân giữ đường để mở lối vào thành.`
              : objective?.type === "bossPhases" && objective.hpThreshold
                ? `Đẩy ${foes[0]?.name} xuống còn ${Math.round(objective.hpThreshold * 100)}% máu. Trận dừng ở đó và chuyển sang phase sau; máu đã mất không hồi lại.`
                : objective?.type === "bossPhases" && labels.length > 1
                  ? `Hạ ${foes[0]?.name}${bossHp ? `, vào trận với ${Math.round(bossHp * 100)}% máu còn lại từ phase trước` : ""}, cùng hai tùy tướng.`
                  : turns
                    ? `Cầm cự ${turns} lượt của bạn hoặc hạ ${scenario.mode === "3v3" ? "hết đối thủ" : "thủ lĩnh"}.`
                    : copy?.objective}
        </p>
        {labels.length > 1 && (
          <p className="mt-1 text-xs text-amber-200/80">
            Mỗi phase là một trận. Qua phase chưa hoàn thành nhiệm vụ; thua thì
            đánh lại đúng phase đó. Lương còn lại mang sang phase sau.
          </p>
        )}
        {terrain && (
          <p className="mt-1 text-xs text-amber-200/80">
            {terrain.name}: {terrain.summary}. Địa hình do game dựng, không phải
            sơ đồ một trận có sử chép.
          </p>
        )}
        {encounter.foeFood !== undefined && (
          <p className="mt-1 text-xs text-amber-200/80">
            Đối thủ vào trận với {encounter.foeFood} lương (luật game). Mang đủ
            lương để không đói giữa trận.
          </p>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-md bg-black/25 p-2 text-sm sm:grid-cols-4">
        <dt className="text-stone-400">Thể thức</dt>
        <dd className="font-semibold">
          {scenario.mode === "3v3" ? "3vs3" : "1vs1"}
        </dd>
        <dt className="text-stone-400">Độ khó</dt>
        <dd className="font-semibold">
          {DIFFICULTY_NAME[scenario.difficulty]}
        </dd>
        <dt className="text-stone-400">Cấp đối thủ</dt>
        <dd className="font-semibold">{encounter.level}</dd>
        <dt className="text-stone-400">Cấp gợi ý</dt>
        <dd
          className={`font-semibold ${advice.underLevel ? "text-rose-400" : "text-emerald-400"}`}
        >
          {advice.recommendedLevel}
        </dd>
      </dl>
      <ul className="grid gap-2 sm:grid-cols-3">
        {foes.map((f, i) => (
          <li
            key={f.id}
            className="flex items-center gap-2 rounded-lg bg-black/30 p-2"
          >
            <Portrait
              id={f.id}
              element={f.element}
              profession={f.profession}
              className="size-12 shrink-0"
            />
            <div className="min-w-0 text-xs">
              <p className="truncate text-sm font-semibold">{f.name}</p>
              <p className="flex items-center gap-1 text-stone-300">
                <ElementIcon element={f.element} className="size-3.5" />
                {ELEMENT_NAME[f.element]} · {PROFESSION_NAME[f.profession]}
              </p>
              <p className="text-stone-400">
                {encounter.foes[i]?.hero
                  ? "Sứ quân có tên trong sử · trận do game dựng"
                  : "Nhân vật hư cấu"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <section
        className="rounded-md bg-black/25 p-2 text-sm"
        aria-label="Gợi ý đội hình"
      >
        <h3 className="mb-1 font-semibold text-amber-200">Gợi ý đội hình</h3>
        <p className="text-stone-300">
          {advice.mode === "1v1"
            ? "Trận 1vs1: chỉ Đinh Bộ Lĩnh ra trận."
            : "Trận 3vs3: Đinh Bộ Lĩnh cùng hai người bạn chọn dưới đây."}{" "}
          Thủ lĩnh hệ {ELEMENT_NAME[advice.leaderElement]}: hệ{" "}
          {advice.counterElements.map((e) => ELEMENT_NAME[e]).join(", ")} khắc
          được.
        </p>
        {advice.mode === "3v3" && (
          <div className="mt-2">
            <p className="text-xs text-stone-400" id={`team-${nodeId}`}>
              Đi cùng ({team.length}/2):{" "}
              {team.map((id) => companionById(id)?.name ?? id).join(", ") ||
                "chưa chọn"}
            </p>
            <div
              className="mt-1 flex flex-wrap gap-1"
              role="group"
              aria-labelledby={`team-${nodeId}`}
            >
              {owned.map((id) => {
                const c = companionById(id)!;
                const on = team.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    disabled={!on && team.length >= 2}
                    onClick={() => toggleTeam(id)}
                    className={`flex min-h-9 items-center gap-1 rounded border px-2 py-1 text-xs ${
                      on
                        ? "border-amber-300 bg-amber-500/25"
                        : "border-white/10 bg-black/30"
                    } disabled:opacity-40`}
                  >
                    <ElementIcon element={c.element} className="size-3.5" />
                    {c.name}
                    <span className="text-stone-400">
                      {PROFESSION_NAME[c.profession]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div
          className="mt-2 flex flex-wrap gap-1"
          role="radiogroup"
          aria-label="Nghề của Đinh Bộ Lĩnh"
        >
          {PROFESSIONS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={profession === p}
              onClick={() => setProfession(p)}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs ${
                profession === p
                  ? "border-amber-300 bg-amber-500/25"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <ProfessionIcon profession={p} className="size-4" />
              {PROFESSION_NAME[p]}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-stone-400">
          Vũ khí nghề {PROFESSION_NAME[profession]}:{" "}
          {weapon ? gearText(weapon) : "chưa trang bị (đổi ở Hồ sơ)"}. Mỗi nghề
          dùng vũ khí riêng; nghề và hệ chọn ở đây được lưu khi xuất quân.
        </p>
        <div
          className="mt-2 flex flex-wrap gap-1"
          role="radiogroup"
          aria-label="Nguyên tố ra trận"
        >
          {ELEMENTS.map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={element === e}
              onClick={() => setElement(e)}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs ${
                element === e
                  ? "border-amber-300 bg-amber-500/25"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <ElementIcon element={e} className="size-4" />
              {ELEMENT_NAME[e]}
              {advice.counterElements.includes(e) && (
                <span className="text-emerald-300">★</span>
              )}
            </button>
          ))}
        </div>
        <p
          className={`mt-1 text-xs ${counters ? "text-emerald-300" : weak ? "text-rose-300" : "text-stone-400"}`}
        >
          {counters
            ? "Hệ đang chọn khắc thủ lĩnh đối phương."
            : weak
              ? "Hệ đang chọn bị thủ lĩnh đối phương khắc; vẫn đánh được nhưng sẽ vất vả hơn."
              : "Hệ đang chọn không khắc cũng không bị khắc."}
        </p>
      </section>

      <section
        className="rounded-md bg-black/25 p-2 text-sm"
        aria-label="Gợi ý lương"
      >
        <h3 className="mb-1 font-semibold text-amber-200">Lương mang theo</h3>
        <p className={advice.lowFood ? "text-rose-300" : "text-stone-300"}>
          Đang có {advice.food}/{CAMPAIGN_FOOD_MAX} lương; gợi ý từ{" "}
          {advice.suggestedFood} để quân không đói suốt trận.
          {advice.lowFood &&
            ` Thiếu ${missing} lương: quân đói sẽ đánh yếu hơn.`}
        </p>
        {advice.lowFood && (
          <button
            type="button"
            disabled={busy || profile.gold < missing * FOOD_PRICE}
            onClick={() => onAction({ type: "buyFood", amount: missing })}
            className="mt-1 rounded bg-amber-500 px-3 py-1 font-semibold text-stone-950 disabled:opacity-35"
          >
            Mua {missing} lương ({missing * FOOD_PRICE} vàng)
          </button>
        )}
      </section>

      {advice.underLevel && (
        <p className="rounded-md border border-rose-400/50 bg-rose-500/10 p-2 text-sm text-rose-200">
          Đinh Bộ Lĩnh mới cấp {advice.playerLevel}, thấp hơn cấp gợi ý{" "}
          {advice.recommendedLevel}. Bạn vẫn có thể xuất quân; thua thì giữ
          nguyên tiến độ và thử lại.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {resumeId ? (
          <button
            type="button"
            disabled={busy}
            onClick={onResume}
            className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:opacity-50"
          >
            Tiếp tục trận
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || !teamReady}
            onClick={() => onStart({ element, profession, team })}
            className="rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-6 py-2 font-bold tracking-wider text-amber-50 uppercase disabled:opacity-50"
          >
            {!teamReady
              ? "Chọn đủ 2 người đi cùng"
              : busy
                ? "Đang xuất quân…"
                : phase > 0
                  ? `Vào phase ${phase + 1}/${labels.length}`
                  : profile.campaign.completed.includes(nodeId)
                    ? "Đánh lại"
                    : "Xuất quân"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChapterOne({
  profile,
  onProfile,
  onAction,
  busy: actionBusy,
}: {
  profile: Profile;
  onProfile: (p: Profile) => void;
  onAction: (a: ProfileAction) => void;
  busy: boolean;
}) {
  const { go } = useScene();
  const campaign = profile.campaign;
  // ChapterOne chỉ dựng sau khi đã tải hồ sơ trên trình duyệt, nên đọc localStorage ngay khi khởi tạo được.
  const [savedStep, setStep] = useState<Step>(() => {
    const saved = readJson<Step>(STEP_KEY);
    const savedChapter = saved && chapterContentOf(saved.nodeId);
    const status =
      savedChapter &&
      chapterStatus(campaign, savedChapter).find((m) => m.id === saved.nodeId)
        ?.status;
    return saved && status && status !== "locked" && status !== "comingSoon"
      ? saved
      : {
          nodeId: chapterFocus(campaign, campaignFocusChapter(campaign)),
          phase: "intro",
        };
  });
  const chapter: ChapterContent =
    chapterContentOf(savedStep.nodeId) ?? CAMPAIGN_CHAPTERS[0]!;
  const statuses = chapterStatus(campaign, chapter);
  /** Cứ điểm đang xem ở panel phải (chỉ là trạng thái giao diện); null = thông tin chương. */
  const [strongholdId, setStronghold] = useState<StrongholdId | null>(null);
  const stronghold = strongholdId ? strongholdById(strongholdId) : undefined;
  const [seen, setSeen] = useState<readonly string[]>(
    () => readJson<string[]>(SEEN_KEY) ?? [],
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  /** Trận Campaign V2 đang dở được lưu ở trình duyệt (để Tiếp tục sau khi tải lại). */
  const [resumable, setResumable] = useState<{
    id: string;
    nodeId: string;
  } | null>(null);

  // Trận dở sau khi tải lại trang: hỏi server, chỉ nhận khi mục tiêu chưa xong.
  useEffect(() => {
    let id: string | null = null;
    try {
      id = window.localStorage.getItem(ONLINE_BATTLE_KEY);
    } catch {
      id = null;
    }
    if (!id) return;
    const battleId = id;
    void fetchOnline(battleId).then((res) => {
      const tag = res.view?.campaignScenario;
      if (!res.view || !tag) return;
      const verdict = settleCampaignScenario(tag, toBattleState(res.view));
      if (verdict.ok && verdict.verdict.status === "pending")
        setResumable({ id: battleId, nodeId: tag.nodeId });
    });
  }, []);

  // Nhiệm vụ server ghi đang dở: mở thẳng bước chuẩn bị với lựa chọn đã ghi.
  const inProgress = statuses.find((m) => m.status === "inProgress")?.id;
  const step: Step =
    inProgress && savedStep.nodeId === inProgress && savedStep.phase === "intro"
      ? {
          nodeId: inProgress,
          phase: "prep",
          choice: campaign.storyChoices[inProgress],
        }
      : savedStep;

  const move = (next: Step) => {
    setStep(next);
    setMessage(null);
    writeJson(STEP_KEY, next);
  };

  const markSeen = (receipts: readonly string[]) => {
    const all = [...new Set([...seen, ...receipts])];
    setSeen(all);
    writeJson(SEEN_KEY, all);
  };

  const node = storyNodeById(step.nodeId)!;
  const copy = missionCopy(step.nodeId);
  const status = statuses.find((m) => m.id === step.nodeId)!.status;
  const isBattle = !!campaignBattleScenario(step.nodeId);
  const event = campaignEventByNode(step.nodeId);
  const recorded = campaign.storyChoices[step.nodeId];
  const choice = step.choice ?? recorded;
  const done = status === "completed";
  const routeId = CAMPAIGN_ROUTES.find(
    (r) => r.chapter === chapter.chapter,
  )?.id;

  const submitEvent = async () => {
    if (!choice) return;
    setBusy(true);
    const res = await completeCampaignEventOnline(step.nodeId, choice);
    setBusy(false);
    if (res.profile) onProfile(res.profile);
    if (res.error) setMessage(ONLINE_ERROR_TEXT[res.error] ?? res.error);
  };

  const startBattle = async ({ element, profession, team }: BattleChoice) => {
    const scenario = campaignBattleScenario(step.nodeId);
    if (!scenario) return;
    setBusy(true);
    setMessage(null);
    const res = await createOnline({
      mode: scenario.mode,
      element,
      profession,
      companions: scenario.mode === "3v3" ? team : [],
      difficulty: scenario.difficulty,
      campaignMission: step.nodeId,
      ...(choice && !done ? { campaignChoice: choice } : {}),
    });
    if (!res.id) {
      setBusy(false);
      setMessage(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
      return;
    }
    writeJson(STEP_KEY, { ...step, phase: "prep", choice });
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được: phân cảnh trận vẫn mở được trận vừa tạo nhờ resume trong cùng lần tải.
    }
    go("PLAYING", { resume: "1" });
  };

  const resumeBattle = () => {
    if (!resumable) return;
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, resumable.id);
    } catch {
      // Bỏ qua.
    }
    go("PLAYING", { resume: "1" });
  };

  return (
    <section
      aria-labelledby="chapter-one-title"
      className="flex flex-col gap-4"
    >
      <RewardModal
        profile={profile}
        seen={seen}
        onClose={markSeen}
        onNext={(receipts, next) => {
          markSeen(receipts);
          if (next) move({ nodeId: next, phase: "intro" });
        }}
      />
      <div
        className={`campaign-atlas ${atlasSerif.variable} flex flex-col gap-3`}
      >
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1
              id="chapter-one-title"
              className="atlas-title text-2xl font-black tracking-wide uppercase sm:text-3xl"
            >
              Sử ký Đại Việt
            </h1>
            <p className="text-sm text-amber-100/70">
              Loạn 12 sứ quân · cục diện thế kỷ X
            </p>
          </div>
          <p className="text-sm text-stone-300">
            Đinh Bộ Lĩnh cấp {profile.main.level} · {profile.gold} vàng ·{" "}
            {campaign.supply} lương
          </p>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] xl:grid-cols-[250px_minmax(0,1fr)_340px]">
          <div className="md:col-span-2 xl:col-span-1">
            <ChapterRail
              campaign={campaign}
              current={chapter}
              onPick={(c) => {
                setStronghold(null);
                move({ nodeId: chapterFocus(campaign, c), phase: "intro" });
              }}
            />
          </div>
          <WorldMap
            campaign={campaign}
            chapter={chapter}
            selected={strongholdId}
            onSelect={setStronghold}
          />
          {stronghold ? (
            <StrongholdPanel
              campaign={campaign}
              stronghold={stronghold}
              current={step.nodeId}
              onPick={(id) => move({ nodeId: id, phase: "intro" })}
              onClose={() => setStronghold(null)}
            />
          ) : (
            <ChapterPanel
              campaign={campaign}
              chapter={chapter}
              current={step.nodeId}
              onPick={(id) => move({ nodeId: id, phase: "intro" })}
            />
          )}
        </div>
      </div>

      {chapter.chapter === 6 && campaignCompleted(campaign) && (
        <CampaignEnding
          campaign={campaign}
          onReplay={() => move({ nodeId: CAMPAIGN_FINAL_NODE, phase: "intro" })}
        />
      )}

      {chapter.chapter === 3 && campaignMusterReady(campaign) && (
        <MusterPanel
          profile={profile}
          busy={actionBusy}
          onAction={onAction}
          onPick={(id) => move({ nodeId: id, phase: "intro" })}
        />
      )}

      {routeId && (
        <RouteSummary
          campaign={campaign}
          routeId={routeId}
          onPick={(id) => move({ nodeId: id, phase: "intro" })}
        />
      )}

      <article className="flex flex-col gap-3 rounded-xl border-2 border-[#8a6a3b] bg-[#2a1f19]/90 p-4 shadow-[inset_0_0_24px_#0009]">
        <header>
          <p className="text-xs tracking-widest text-amber-300/80 uppercase">
            {node.id} · {node.location.name} ·{" "}
            {CERTAINTY_TEXT[node.location.certainty]}
            {node.location.modernRegion && (
              <span className="text-stone-400 normal-case">
                {" "}
                (ngày nay: {node.location.modernRegion})
              </span>
            )}
          </p>
          <h2 className="text-xl font-bold text-amber-100">{node.title}</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            {node.historicalBasis.map((b) => (
              <BasisBadge key={b} basis={b} />
            ))}
          </div>
          {node.type === "diplomacy" && !copy && (
            <p className="mt-2 text-xs text-stone-400">
              Hội kiến: không có trận, không có thanh máu. Hoàn thành bằng lựa
              chọn lời đáp; server ghi kết quả.
            </p>
          )}
          {!event &&
            isBattle &&
            (() => {
              const fate = factionResolutionOfMission(node.id);
              return fate ? (
                <p className="mt-1 text-xs text-sky-200">
                  Kết cục cố định của{" "}
                  {companionById(fate.faction)?.name ?? fate.faction}:{" "}
                  {FACTION_STATUS_TEXT[fate.status].toLowerCase()} theo tổng
                  thuật. Trận là cách game kể việc ấy.{" "}
                  {campaign.factions[fate.faction]
                    ? "Đã ghi vào thế cục sứ quân."
                    : "Thắng lần đầu sẽ ghi vào thế cục sứ quân một lần."}
                </p>
              ) : null;
            })()}
          {event?.faction && node.type !== "diplomacy" && (
            <p className="mt-1 text-xs text-sky-200">
              Kết cục cố định:{" "}
              {companionById(event.faction.faction)?.name ??
                event.faction.faction}{" "}
              {FACTION_STATUS_TEXT[event.faction.status].toLowerCase()}.{" "}
              {campaign.factions[event.faction.faction]
                ? "Đã ghi vào thế cục sứ quân."
                : "Hoàn thành sẽ ghi vào thế cục sứ quân một lần."}
            </p>
          )}
        </header>

        {!copy ? (
          <p className="text-stone-300">
            Nội dung nhiệm vụ này sẽ mở ở bản sau.
          </p>
        ) : node.type === "diplomacy" ? (
          <DiplomacyScene
            profile={profile}
            nodeId={step.nodeId}
            phase={step.phase === "intro" ? "intro" : "choice"}
            {...(step.choice ? { choice: step.choice } : {})}
            onMove={(phase, c) =>
              move({
                nodeId: step.nodeId,
                phase,
                ...(c ? { choice: c } : {}),
              })
            }
            onProfile={onProfile}
          />
        ) : (
          <>
            {step.nodeId === "M23" && (
              <p className="rounded-xl border border-amber-500/30 bg-black/30 p-3 text-sm text-amber-100">
                <span className="font-semibold text-amber-200">
                  Trích đoạn xây dựng quốc gia.
                </span>{" "}
                Chọn một việc ưu tiên rồi đọc kết quả. Không có trận, đồng hồ
                hay tài nguyên mới; lựa chọn không đổi lịch sử chính hay kinh tế
                trong game.
              </p>
            )}
            {step.phase === "intro" ? (
              <DialoguePlayer
                key={`${step.nodeId}:intro`}
                missionId={step.nodeId}
                sequence="intro"
                label={`Lời dẫn ${node.id}`}
                segments={[
                  {
                    section: "cinematic",
                    beats: copy.cinematic ?? [],
                    cinematic: true,
                  },
                  { section: "intro", beats: copy.intro },
                ]}
                main={profile}
                finishLabel="Tiếp tục"
                onFinished={() =>
                  move({
                    nodeId: step.nodeId,
                    phase: "choice",
                    choice: choice ?? recorded,
                  })
                }
              />
            ) : inProgress === step.nodeId ? null : (
              <button
                type="button"
                onClick={() =>
                  move({
                    nodeId: step.nodeId,
                    phase: "intro",
                    ...(step.choice ? { choice: step.choice } : {}),
                  })
                }
                className="min-h-11 self-start rounded-lg bg-white/10 px-4 text-sm hover:bg-white/15"
              >
                ↺ Xem lại lời dẫn
              </button>
            )}
            {step.nodeId === CAMPAIGN_UNIFICATION_NODE && (
              <FactionDossiers campaign={campaign} />
            )}
            <SourceNotes nodeId={step.nodeId} />
            {step.phase !== "intro" && (
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-amber-200">{copy.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {copy.choices.map((c) => {
                    // Đã hoàn thành thì lựa chọn đã ghi trên server là cố định.
                    const locked =
                      done && recorded !== undefined && recorded !== c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={locked || step.phase === "prep"}
                        aria-pressed={choice === c.id}
                        onClick={() =>
                          move({
                            nodeId: step.nodeId,
                            phase: "choice",
                            choice: c.id,
                          })
                        }
                        className={`rounded border px-3 py-1.5 text-sm ${
                          choice === c.id
                            ? "border-amber-300 bg-amber-500/25"
                            : "border-white/15 bg-black/30"
                        } disabled:opacity-40`}
                      >
                        {c.label}
                        {(() => {
                          const tone = event?.choices.find(
                            (x) => x.id === c.id,
                          )?.tone;
                          return tone ? (
                            <span className="ml-1.5 text-[10px] text-stone-400 uppercase">
                              {TONE_TEXT[tone]}
                            </span>
                          ) : null;
                        })()}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-400">
                  Lựa chọn chỉ đổi lời kể; kết quả nhiệm vụ và phần thưởng như
                  nhau.
                </p>
                <StoryLines
                  profile={profile}
                  nodeId={step.nodeId}
                  choice={choice}
                  outro={done}
                />
                {!isBattle && !done && (
                  <button
                    type="button"
                    disabled={!choice || busy}
                    onClick={() => void submitEvent()}
                    className="self-start rounded-lg border-2 border-[var(--gold)] bg-gradient-to-b from-[#c0392b] to-[#7a2c1d] px-5 py-2 font-bold text-amber-50 disabled:opacity-50"
                  >
                    {busy ? "Đang ghi…" : "Hoàn thành nhiệm vụ"}
                  </button>
                )}
                {isBattle && step.phase === "choice" && (
                  <button
                    type="button"
                    disabled={!choice}
                    onClick={() =>
                      move({ nodeId: step.nodeId, phase: "prep", choice })
                    }
                    className="self-start rounded bg-amber-500 px-4 py-1.5 font-semibold text-stone-950 disabled:opacity-40"
                  >
                    Chuẩn bị xuất quân
                  </button>
                )}
                {isBattle && step.phase === "prep" && (
                  <BattlePrep
                    profile={profile}
                    nodeId={step.nodeId}
                    busy={busy || actionBusy}
                    resumeId={
                      resumable?.nodeId === step.nodeId ? resumable.id : null
                    }
                    onAction={onAction}
                    onStart={(c) => void startBattle(c)}
                    onResume={resumeBattle}
                  />
                )}
              </div>
            )}
          </>
        )}
        {copy && <MissionSources nodeId={step.nodeId} />}
        {message && <p className="text-sm text-rose-400">{message}</p>}
      </article>

      <WorldLedger campaign={profile.campaign} />

      <WarlordCodex campaign={campaign} />
    </section>
  );
}
