"use client";

import { Alert, Button, buttonVariants, choiceVariants } from "@/components/ui";

// Các chương Campaign V2 đã có nội dung (Chương I–III, Chương IV có M13, M15, M16): intro → lựa chọn trình diễn → hoàn thành (story) hoặc chuẩn bị xuất quân
// (trận). Mọi tiến độ, lựa chọn và thưởng lấy từ hồ sơ server; trình duyệt chỉ nhớ bước đang xem và màn
// thưởng đã xem để tải lại trang không phải xem lại từ đầu.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DESKTOP_FIT_QUERY, PHONE_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui";
import { ResultModal } from "@/components/game-ui";
import BattlePrep, { type BattleChoice } from "./BattlePrep";
import { nextMissionAfter } from "./startMission";
import {
  CAMPAIGN_CHAPTERS,
  CAMPAIGN_FINAL_NODE,
  CAMPAIGN_UNIFICATION_NODE,
  campaignCompleted,
  campaignEventByNode,
  campaignBattleScenario,
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
  type Profile,
  type ProfileAction,
} from "@/core";
import {
  completeCampaignEventOnline,
  createOnline,
  fetchOnline,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  toBattleState,
} from "../battle/online";
import WorldMap from "./WorldMap";
import {
  AtlasHeader,
  ChapterPanel,
  ChapterRail,
  ROMAN,
  StrongholdPanel,
  type AtlasView,
} from "./AtlasShell";
import { strongholdById, type StrongholdId } from "./worldAtlas";
import { AtlasCorners } from "./AtlasFrame";
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
import { guideFirst, markGuideSeen, ModeGuidePanel } from "../ModeGuide";

/** Bước đang xem của nhiệm vụ: chỉ là tiện ích hiển thị, không phải tiến độ. */
const STEP_KEY = "coLau.campaign.v2.step";
/** Màn đang xem (bản đồ Sử ký hay một nhiệm vụ) và cứ điểm đang chọn: chỉ là trạng thái giao diện. */
const ATLAS_KEY = "coLau.campaign.v2.atlas";
/** Phiếu thưởng đã xem màn thưởng (rewardReceipts của server). */
const SEEN_KEY = "coLau.campaign.v2.seen";

type Phase = "intro" | "choice" | "prep";
interface AtlasState {
  readonly view: AtlasView;
  readonly stronghold: StrongholdId | null;
}

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
/** Lời đáp đã chọn rồi (nếu có) kết thúc nhiệm vụ, phát từng câu. Chỉ trình diễn, không gửi gì lên server. */
function StoryLines({
  profile,
  nodeId,
  choice,
  outro,
  finishLabel,
  onFinished,
}: {
  profile: Profile;
  nodeId: string;
  choice?: string;
  outro?: boolean;
  /** Nút ở câu cuối (đi tiếp): chỉ hiện khi đã đọc hết thoại. Không có thoại thì hiện nút riêng. */
  finishLabel?: string;
  onFinished?: () => void;
}) {
  const copy = missionCopy(nodeId);
  const picked = copy?.choices.find((c) => c.id === choice);
  const segments = [
    ...(picked
      ? [{ section: `choice:${picked.id}`, beats: picked.beats }]
      : []),
    ...(outro && copy ? [{ section: "outro", beats: copy.outro }] : []),
  ];
  if (segments.every((s) => s.beats.length === 0))
    return finishLabel && onFinished ? (
      <Button variant="ornate" type="button" onClick={onFinished} className="self-start">
        {finishLabel}
      </Button>
    ) : null;
  const sequence = segments.map((s) => s.section).join("+");
  return (
    <DialoguePlayer
      key={`${nodeId}:${sequence}`}
      missionId={nodeId}
      sequence={sequence}
      label={outro ? `Kết thúc ${nodeId}` : `Lời đáp ${nodeId}`}
      segments={segments}
      main={profile}
      {...(finishLabel && onFinished ? { finishLabel, onFinished } : {})}
    />
  );
}

function RewardNotice({
  profile,
  seen,
  onClose,
}: {
  profile: Profile;
  seen: readonly string[];
  /** Nhận thưởng: ẩn dòng báo và mở màn nhiệm vụ vừa xong để đọc thoại kết ở đó. */
  onClose: (receipts: readonly string[], nodeId: CampaignMissionId) => void;
}) {
  const reward = pendingFirstClear(profile.campaign, seen);
  if (!reward) return null;
  const node = storyNodeById(reward.nodeId)!;
  return (
    // Báo thưởng thành hộp giữa màn (Shan 28/11/2026: khối báo trên đầu khung đẩy màn Sử ký dài quá màn hình).
    <ResultModal
      open
      tone="win"
      kicker="Hoàn thành lần đầu"
      title={node.title}
      actions={
        <Button variant="ornate" size="lg" autoFocus type="button" onClick={() => onClose(reward.receipts, reward.nodeId)}>
          Nhận thưởng
        </Button>
      }
    >
      <ul className="ui-frame-inset flex w-full flex-col gap-1 p-3 text-left text-sm">
        <li className="font-semibold text-frame-gold">+{reward.missionGold} vàng thưởng nhiệm vụ</li>
        {reward.chapterGold > 0 && (
          <li className="font-semibold text-frame-gold">+{reward.chapterGold} vàng hoàn thành chương</li>
        )}
        {(() => {
          const faction = campaignEventByNode(node.id)?.faction;
          return faction ? (
            <li className="text-info">
              Thế cục: {companionById(faction.faction)?.name ?? faction.faction}{" "}
              {FACTION_STATUS_TEXT[faction.status].toLowerCase()} (không tính là trận thắng)
            </li>
          ) : null;
        })()}
        {reward.unlockedHeroes.map((id) => (
          <li key={id} className="text-jade">
            Tướng quân gia nhập: {companionById(id)?.name ?? id}
          </li>
        ))}
      </ul>
      <p className="text-caption text-on-wood-soft">Thưởng chỉ nhận một lần; đánh lại hoặc xem lại không nhận thêm.</p>
    </ResultModal>
  );
}

export default function ChapterOne({
  profile,
  onProfile,
  onAction,
  busy: actionBusy,
  footer,
}: {
  profile: Profile;
  onProfile: (p: Profile) => void;
  onAction: (a: ProfileAction) => void;
  busy: boolean;
  /** Nội dung tab Tái đấu (khu Tái đấu sứ quân), nằm trong đại card. */
  footer?: ReactNode;
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
  // Bản đồ hay nhiệm vụ, và cứ điểm đang chọn ở panel phải (null = thông tin chương). Quay lại bản đồ giữ nguyên
  // chương và cứ điểm; tải lại trang thì mở lại đúng màn đang xem.
  const [atlas, setAtlas] = useState<AtlasState>(() => {
    const saved = readJson<AtlasState>(ATLAS_KEY);
    return {
      // Vào Bình Loạn từ Chiến Trường thì gặp Hướng dẫn trước; quay lại sau trận thì mở lại đúng màn đang xem.
      view: guideFirst("CAMPAIGN") ? "guide" :
        saved?.view === "mission" || saved?.view === "codex" || saved?.view === "raid" || saved?.view === "guide"
          ? saved.view
          : "atlas",
      stronghold:
        saved?.stronghold && strongholdById(saved.stronghold)
          ? saved.stronghold
          : null,
    };
  });
  const updateAtlas = (next: AtlasState) => {
    if (next.view !== "guide") markGuideSeen("CAMPAIGN");
    setAtlas(next);
    writeJson(ATLAS_KEY, next);
  };
  // Điện thoại: Hướng dẫn là bảng trượt mở từ nút "?" trên thanh Sử ký (Shan chọn 5B, 21/11/2026), không còn là một màn.
  const phone = useMediaQuery(PHONE_QUERY);
  // Máy tính rộng: card Sử ký cao đúng một màn hình, năm thẻ chung chiều cao, nội dung dài chia trang (Shan 28/11/2026).
  const fit = useMediaQuery(DESKTOP_FIT_QUERY);
  /** Trang của thẻ Bản đồ khi khung cố định: 0 là ba cột, 1 là Hội quân / tuyến chương / hồi kết bên dưới. */
  const [atlasPage, setAtlasPage] = useState(0);
  const view = phone && atlas.view === "guide" ? "atlas" : atlas.view;
  const strongholdId = atlas.stronghold;
  const stronghold = strongholdId ? strongholdById(strongholdId) : undefined;
  const setStronghold = (id: StrongholdId | null) =>
    updateAtlas({ ...atlas, stronghold: id });
  const sectionRef = useRef<HTMLElement>(null);
  const missionHeadingRef = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const shownView = useRef(atlas.view);
  /** Khung cần tới khi về bản đồ (Hội quân, hồi kết) để không phải tự tìm dưới bản đồ. */
  const jumpTo = useRef<string | null>(null);
  // Đổi màn thì đưa tiêu điểm tới tiêu đề nhiệm vụ hoặc về bản đồ (người dùng bàn phím, đọc màn hình không lạc).
  // Không để trình duyệt tự cuộn theo tiêu điểm (preventScroll) và chỉ cuộn trang khi đầu card đang nằm trên khung nhìn
  // (ví dụ mở nhiệm vụ từ danh sách ở cuối bản đồ); bấm tab ở đầu card thì giữ nguyên vị trí cuộn.
  useEffect(() => {
    if (shownView.current === atlas.view) return;
    shownView.current = atlas.view;
    const section = sectionRef.current;
    const jump = jumpTo.current ? document.getElementById(jumpTo.current) : null;
    jumpTo.current = null;
    if (jump && atlas.view === "atlas") {
      jump.scrollIntoView({ block: "start" });
      jump.focus({ preventScroll: true });
      return;
    }
    if (section && section.getBoundingClientRect().top < 0) section.scrollIntoView({ block: "start" });
    if (atlas.view === "mission") {
      missionHeadingRef.current?.focus({ preventScroll: true });
      return;
    }
    const map = mapRef.current;
    const target =
      map?.querySelector<SVGElement>("[aria-pressed=true]") ??
      map?.querySelector<SVGElement>("svg");
    target?.focus({ preventScroll: true });
  }, [atlas.view]);
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

  /** Mở một nhiệm vụ đã mở khóa ở màn nhiệm vụ; chỉ đổi màn, không gọi API. */
  const openMission = (id: CampaignMissionId) => {
    move({ nodeId: id, phase: "intro" });
    updateAtlas({ ...atlas, view: "mission" });
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
  /** Nhiệm vụ có trận: cột Bày trận bên phải (máy tính) hoặc dưới cốt truyện (điện thoại), luôn có từ đầu nhiệm vụ. */
  const prepSide = isBattle && !!copy && node.type !== "diplomacy";
  // Xong nhiệm vụ: nút đi tiếp ở câu cuối của thoại kết (mọi loại nhiệm vụ, cả hội kiến), nên phải đọc hết thoại
  // mới sang được nhiệm vụ hoặc chương kế. Không còn nhiệm vụ mở thì về bản đồ Sử ký.
  const nextId = done ? nextMissionAfter(campaign, step.nodeId) : null;
  const nextChapter = nextId ? chapterContentOf(nextId) : null;
  const finish: { finishLabel?: string; onFinished?: () => void } = !done
    ? {}
    : nextId
      ? {
          finishLabel:
            nextChapter && nextChapter.chapter !== chapterContentOf(step.nodeId)?.chapter
              ? `Sang Chương ${ROMAN[nextChapter.chapter]}: ${storyNodeById(nextId)!.title}`
              : `Tiếp: ${storyNodeById(nextId)!.title}`,
          onFinished: () => openMission(nextId),
        }
      : {
          finishLabel: campaignCompleted(campaign)
            ? "Xem hồi kết Bình Loạn"
            : campaignMusterReady(campaign)
              ? "Xem Hội quân Hoa Lư"
              : "Về bản đồ Sử ký",
          onFinished: () => {
            jumpTo.current = campaignCompleted(campaign)
              ? "campaign-ending-title"
              : campaignMusterReady(campaign)
                ? "muster-title"
                : null;
            if (jumpTo.current) setAtlasPage(1);
            updateAtlas({ ...atlas, view: "atlas" });
          },
        };

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
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Chưa bày được trận. Xin thử lại.",
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
      ref={sectionRef}
      aria-labelledby={
        view === "atlas" ? "chapter-one-title" : view === "guide" ? "mode-guide-title" : "mission-title"
      }
      className="flex scroll-mt-4 flex-col gap-4 xl:h-[var(--mode-fit-h)]"
    >
      <RewardNotice
        profile={profile}
        seen={seen}
        onClose={(receipts, nodeId) => {
          markSeen(receipts);
          // Thoại chỉ phát một kiểu: trong màn nhiệm vụ. Bảng thưởng chỉ báo thưởng rồi đưa về đúng nhiệm vụ.
          move({ nodeId, phase: "choice", choice: campaign.storyChoices[nodeId] });
          updateAtlas({ ...atlas, view: "mission" });
        }}
      />
      {/* Đại card Sử ký (Polish V2 P02): header, ba cột và tuyến dưới nằm trong một khung gỗ. Màn nhiệm vụ và
          Sử ký chỉ giữ header trong khung, nội dung của chúng nằm dưới. */}
      <div className="campaign-atlas xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <div className="atlas-frame atlas-frame-wood atlas-shell flex flex-col gap-3 p-2 sm:p-3 xl:min-h-0 xl:flex-1">
          <AtlasCorners />
          <AtlasHeader
            view={view}
            level={profile.main.level}
            gold={profile.gold}
            supply={campaign.supply}
            onView={(view) => updateAtlas({ ...atlas, view })}
          />
          {view === "atlas" && (() => {
            const extras = [
              chapter.chapter === 6 && campaignCompleted(campaign) && (
                <CampaignEnding
                  key="ending"
                  campaign={campaign}
                  onReplay={() => openMission(CAMPAIGN_FINAL_NODE)}
                />
              ),
              chapter.chapter === 3 && campaignMusterReady(campaign) && (
                <MusterPanel
                  key="muster"
                  profile={profile}
                  busy={actionBusy}
                  onAction={onAction}
                  onPick={openMission}
                />
              ),
              chapter.chapter >= 4 && (
                <RouteSummary
                  key="route"
                  campaign={campaign}
                  chapter={chapter.chapter}
                  onPick={openMission}
                />
              ),
            ].filter(Boolean);
            // Khung cố định: ba cột là trang 1, các khối dưới bản đồ (hồi kết, Hội quân, tuyến chương) là trang 2.
            const paged = fit && extras.length > 0;
            const page = paged ? atlasPage : 0;
            return (
            <div ref={mapRef} className="flex flex-col gap-3 xl:min-h-0 xl:flex-1">
              {page === 0 && (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(260px,0.22fr)_minmax(0,1fr)_minmax(300px,0.3fr)] xl:grid-rows-[minmax(0,1fr)]">
                <div className="md:col-span-2 xl:col-span-1 xl:min-h-0">
                  <ChapterRail
                    campaign={campaign}
                    current={chapter}
                    onPick={(c) => {
                      updateAtlas({ view: "atlas", stronghold: null });
                      setAtlasPage(0);
                      move({
                        nodeId: chapterFocus(campaign, c),
                        phase: "intro",
                      });
                    }}
                  />
                </div>
                <WorldMap
                  campaign={campaign}
                  chapter={chapter}
                  selected={strongholdId}
                  onSelect={setStronghold}
                />
                {/* Bảng chương/cứ điểm cao bằng hàng; dài hơn thì chia trang (FitPages), không cuộn lồng. */}
                <div className="min-w-0 xl:min-h-0">
                  {stronghold ? (
                    <StrongholdPanel
                      key={stronghold.id}
                      campaign={campaign}
                      stronghold={stronghold}
                      current={step.nodeId}
                      onPick={openMission}
                      onClose={() => setStronghold(null)}
                      fit={fit}
                    />
                  ) : (
                    <ChapterPanel
                      key={chapter.chapter}
                      campaign={campaign}
                      chapter={chapter}
                      current={step.nodeId}
                      onPick={openMission}
                      fit={fit}
                    />
                  )}
                </div>
              </div>
              )}
              {(!paged || page === 1) && extras.length > 0 && (
                <div className="flex flex-col gap-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pb-6">{extras}</div>
              )}
              {paged && (
                <nav aria-label="Trang Bản đồ" className="flex shrink-0 items-center justify-center gap-3">
                  <button type="button" aria-label="Trang trước" disabled={page === 0} onClick={() => setAtlasPage(0)}
                    className={buttonVariants({ variant: "secondary", size: "icon", className: "disabled:opacity-40" })}>
                    <ChevronLeftIcon className="size-5" />
                  </button>
                  <span aria-live="polite" className="text-sm font-semibold text-on-wood tabular-nums">
                    {page === 0 ? "Bản đồ" : chapter.chapter === 3 ? "Hội quân Hoa Lư" : chapter.chapter >= 4 ? "Tuyến chương" : "Hồi kết"}, trang {page + 1}/2
                  </span>
                  <button type="button" aria-label="Trang sau" disabled={page === 1} onClick={() => setAtlasPage(1)}
                    className={buttonVariants({ variant: "secondary", size: "icon", className: "disabled:opacity-40" })}>
                    <ChevronRightIcon className="size-5" />
                  </button>
                </nav>
              )}
            </div>
            );
          })()}
      {view === "guide" ? (
        <div className="flex flex-col px-1 sm:px-2 xl:min-h-0 xl:flex-1">
          <ModeGuidePanel scene="CAMPAIGN" headingId="mode-guide-title" paged onPlay={() => updateAtlas({ ...atlas, view: "atlas" })} />
        </div>
      ) : view === "codex" ? (
        <WarlordCodex campaign={campaign} fit={fit} ledger={<WorldLedger campaign={profile.campaign} />} />
      ) : view === "raid" ? (
        <div className="px-1 sm:px-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pb-6">{footer}</div>
      ) : view === "atlas" ? null : (
        <>

          <article
            className={`px-1 pt-1 sm:px-2 xl:min-h-0 xl:flex-1 ${
              prepSide
                ? "grid gap-4 pb-24 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:pb-0 xl:grid-cols-[minmax(0,1fr)_26rem] xl:grid-rows-[minmax(0,1fr)] xl:items-stretch"
                : "flex flex-col gap-3 xl:overflow-y-auto xl:pb-6"
            }`}
          >
           <div className="flex min-w-0 flex-col gap-3 xl:min-h-0 xl:overflow-y-auto xl:pb-6">
            <header>
              <p className="text-kicker text-frame-gold">
                {node.location.name},{" "}
                {CERTAINTY_TEXT[node.location.certainty]}
                {node.location.modernRegion && (
                  <span className="text-on-wood-soft normal-case">
                    {" "}
                    (ngày nay: {node.location.modernRegion})
                  </span>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2
                  id="mission-title"
                  ref={missionHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-bold text-title-on-wood focus:outline-none"
                >
                  {node.title}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {node.historicalBasis.map((b) => (
                    <BasisBadge key={b} basis={b} />
                  ))}
                </div>
              </div>
              {node.type === "diplomacy" && !copy && (
                <p className="mt-2 text-caption text-on-wood-soft">
                  Hội kiến: không có trận, không có thanh máu. Hoàn thành bằng
                  lựa chọn lời đáp; máy chủ ghi kết quả.
                </p>
              )}
              {!event &&
                isBattle &&
                (() => {
                  const fate = factionResolutionOfMission(node.id);
                  return fate ? (
                    <p className="mt-1 text-caption text-info">
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
                <p className="mt-1 text-caption text-info">
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
              <p className="text-on-wood-soft">
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
                {...finish}
              />
            ) : (
              <>
                {step.nodeId === "M23" && (
                  <p className="ui-frame-inset p-3 text-sm text-on-wood">
                    <span className="font-semibold text-frame-gold">
                      Trích đoạn xây dựng quốc gia.
                    </span>{" "}
                    Chọn một việc ưu tiên rồi đọc kết quả. Không có trận, đồng
                    hồ hay tài nguyên mới; lựa chọn không đổi lịch sử chính hay
                    kinh tế trong game.
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
                    className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-11 self-start" })}
                  >
                    Xem lại lời dẫn
                  </button>
                )}
                {step.nodeId === CAMPAIGN_UNIFICATION_NODE && (
                  <FactionDossiers campaign={campaign} />
                )}
                {step.phase !== "intro" && (
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-frame-gold">
                      {copy.prompt}
                    </p>
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
                            className={choiceVariants({ className: "px-3 py-1.5 text-sm font-normal" })}
                          >
                            {c.label}
                            {(() => {
                              const tone = event?.choices.find(
                                (x) => x.id === c.id,
                              )?.tone;
                              return tone ? (
                                <span className="ml-1.5 text-caption uppercase opacity-75">
                                  {TONE_TEXT[tone]}
                                </span>
                              ) : null;
                            })()}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-caption text-on-wood-soft">
                      Lựa chọn chỉ đổi lời kể; kết quả nhiệm vụ và ban thưởng
                      như nhau.
                    </p>
                    <StoryLines
                      profile={profile}
                      nodeId={step.nodeId}
                      choice={choice}
                      outro={done}
                      {...finish}
                    />
                    {!isBattle && !done && (
                      <button
                        type="button"
                        disabled={!choice || busy}
                        onClick={() => void submitEvent()}
                        className={buttonVariants({ size: "lg", className: "min-h-11 self-start" })}
                      >
                        {busy ? "Đang ghi…" : "Hoàn thành nhiệm vụ"}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            {copy && (
              <MissionSources nodeId={step.nodeId}>
                <SourceNotes nodeId={step.nodeId} bare />
              </MissionSources>
            )}
            {message && (
              <Alert tone="error" className="p-3 text-sm">
                {message}
              </Alert>
            )}
           </div>
            {prepSide && (
              <aside
                aria-label="Bày trận"
                className="ui-frame-inset rounded-lg p-3 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto xl:static xl:max-h-none xl:min-h-0"
              >
                <BattlePrep
                  key={step.nodeId}
                  profile={profile}
                  nodeId={step.nodeId}
                  busy={busy || actionBusy}
                  resumeId={
                    resumable?.nodeId === step.nodeId ? resumable.id : null
                  }
                  needChoice={!choice}
                  onAction={onAction}
                  onStart={(c) => void startBattle(c)}
                  onResume={resumeBattle}
                />
              </aside>
            )}
          </article>
        </>
      )}
        </div>
      </div>
    </section>
  );
}
