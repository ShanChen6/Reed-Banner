"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  act,
  swapCells,
  applyProfileAction,
  applyRewards,
  battleRewards,
  defaultSkillTarget,
  skillTargetOptions,
  isAdjacent,
  isWhirlCenter,
  previewWhirl,
  fighterSkill,
  needsCell,
  newProfile,
  playAiTurn,
  receiveDrop,
  selectableActors,
  comboSkillCost,
  whirlStep,
  settleCampaignScenario,
  storyNodeById,
  campaignSurviveTurns,
  campaignPhaseLabels,
  campaignScenarioByNode,
  completedPlayerTurns,
  type CampaignScenarioTag,
  tileAt,
  GRACE_MS,
  TURN_MS,
  type BattleAction,
  type Board,
  type BattleEvent,
  type BattleState,
  type Difficulty,
  type Element,
  type Pos,
  type Profession,
  type Profile,
  type ProfileAction,
  type SkillDef,
  type Whirl,
  type MatchAction,
  type SurvivalView,
  type ExpeditionObjective,
} from "@/core";
import {
  ERROR_TEXT,
} from "./labels";
import { useAudio } from "../audio/AudioProvider";
import type { MusicId } from "../audio/cues";
import { bounceFrames, eventFrames, type Frame } from "./animation";
import { BATTLE_PRELOAD, frameCue, soundsForEvents, type CuePlay } from "./sounds";
import { sidesAfterEvents } from "./heldSides";
import { COMBAT_PACING } from "./pacing";
import {
  CloudCorner,
  DongSonBand,
} from "../art/icons";

import SurvivalBreakScreen from "../survival/SurvivalBreakScreen";
import { BoardCrest } from "../art/tiles";

import SetupLobby from "./SetupLobby";
import {
  actOnline,
  createOnline,
  fetchOnline,
  fetchProfile,
  ONLINE_BATTLE_KEY,
  ONLINE_ERROR_TEXT,
  sendProfileAction,
  toBattleState,
  type OnlineResponse,
} from "./online";

import BattleStage from "../stage/BattleStage";

import { MODE_CONTENT_WIDTH, OrnateFrame } from "@/components/game-ui";
import { createCueBus, stageCues } from "../stage/director";
import {
  PLAYER,
  AI,
  DEMO_SEED,
  randomSeed,
  DIFFICULTIES,
  MAIN_ELEMENTS,
  type DemoGear,
  MAX_GEAR,
  type DemoMode,
  type Setup,
  newBattle,
  loadProfile,
  saveProfile,
  type Outcome,
  demoDrop,
} from "./demoSetup";
import { describe, type LogLine } from "./battleLog";
import { BattleResult } from "./BattleResult";

import {
  TurnClock,
  WaveBanner,
  type Aim,
  type WhirlAim,
  whirlHint,
  useStageVisible,
} from "./BattleHud";
import { FLOAT_STAGGER_MS, prefersReducedMotion, type Float } from "./FighterCard";
import { CampaignResult } from "./CampaignResult";
import { SkillBar } from "./SkillBar";
import { useBattleKeyboard } from "./useBattleKeyboard";
import { TeamColumn } from "./TeamColumn";
import { BoardCells } from "./BoardCells";
import { BattleHeader } from "./BattleHeader";
import { ProgressSection } from "./ProgressSection";

const FLOAT_MS = 1100;

const SWIPE_PX = 12;

/** Vị trí bốn họa tiết mây ở góc khung bàn cờ (hình gốc đặt ở góc trên trái). */
const CORNERS = [
  "-left-0.5 -top-0.5",
  "-right-0.5 -top-0.5 -scale-x-100",
  "-bottom-0.5 -left-0.5 -scale-y-100",
  "-bottom-0.5 -right-0.5 -scale-100",
] as const;

/**
 * Phân cảnh trận đấu. `online`: trận do server xử lý qua /api/battles (PLAYING), đồng hồ 30 giây bật; ngược
 * lại chạy hoàn toàn trong trình duyệt (PRACTICE).
 */
export default function DemoGame({
  online = false,
  autoResume = false,
  towerFeatures = { trial: true, destiny: true },
}: {
  online?: boolean;
  /** Vào phân cảnh là tiếp tục ngay trận online đã lưu (Chiến dịch, Sinh tồn, … vừa tạo trận rồi chuyển sang). */
  autoResume?: boolean;
  towerFeatures?: { readonly trial: boolean; readonly destiny: boolean };
}) {
  const [round, setRound] = useState(0);
  const [seed, setSeed] = useState(DEMO_SEED);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  // Chơi thử vào trận ngay khi mở màn (xem replay); Chơi online chờ người chơi chọn rồi tạo trận trên server.
  const [started, setStarted] = useState(false);
  /** Chơi thử chưa vào trận đầu: chưa hiện màn chờ. */
  const [booting, setBooting] = useState(!online);
  const [element, setElement] = useState<Element>("moc");
  const [gear, setGear] = useState<DemoGear>(MAX_GEAR);
  const [profession, setProfession] = useState<Profession>("tuongSi");
  // Chơi online luôn chơi theo hồ sơ trên server.
  const [mode, setMode] = useState<DemoMode>(online ? "progress" : "practice");
  const [profile, setProfile] = useState<Profile>(newProfile);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  /** Đánh trùm: sứ quân của trận online đang chơi. */
  const [raidBoss, setRaidBoss] = useState<string | null>(null);
  const [specialQuestId, setSpecialQuestId] = useState<string | null>(null);
  /** Campaign V2: mục tiêu nhiệm vụ (có thể xong trước khi phân thắng bại, ví dụ cầm cự đủ lượt). */
  const [scenario, setScenario] = useState<CampaignScenarioTag | null>(null);
  const [destinyFloorNo, setDestinyFloorNo] = useState<number | null>(null);
  const [expeditionMatch, setExpeditionMatch] = useState(false);
  /** Viễn Chinh: mục tiêu riêng của trận (giữ cầu, hộ tống, phá cổng). */
  const [expeditionObjective, setExpeditionObjective] = useState<ExpeditionObjective | null>(null);
  /** Sinh tồn: đợt, người gục, báo trước đợt kế. */
  const [survival, setSurvival] = useState<SurvivalView | null>(null);
  /** Thử thách hằng ngày: khóa ngày của trận đang chơi. */
  const [dailyDay, setDailyDay] = useState<string | null>(null);
  /** Đấu trường: tên và điểm đối thủ. */
  const [arenaFoe, setArenaFoe] = useState<{
    name: string;
    rating: number;
  } | null>(null);
  const setup = useMemo<Setup>(
    () => ({ element, profession, gear, mode, profile }),
    [element, profession, gear, mode, profile],
  );
  /** Bàn cờ xem trước khi chưa bắt đầu; dựng lại mỗi khi đổi lựa chọn trước trận. */
  const preview = useMemo(() => newBattle(seed, setup), [seed, setup]);
  const [live, setState] = useState<BattleState | null>(null);
  const state = live ?? preview;
  const [selected, setSelected] = useState<Pos | null>(null);
  const [cursor, setCursor] = useState<Pos>({ row: 3, col: 5 });
  const [showCursor, setShowCursor] = useState(false);
  const [aim, setAim] = useState<Aim>(null);
  const [aimIndex, setAimIndex] = useState(0);
  const [whirlAim, setWhirlAim] = useState<WhirlAim>(null);
  const [pendingWhirl, setPendingWhirl] = useState<Whirl | null>(null);
  /** Nấc xoay đang rê chuột hoặc focus để xem trước kết quả (chưa bấm). */
  const [spinPreview, setSpinPreview] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const [anim, setAnim] = useState<{
    readonly frames: readonly Frame[];
    readonly i: number;
    readonly id: number;
  } | null>(null);
  const animId = useRef(0);
  /** Bàn cờ đã diễn xong nhưng state chưa commit (lúc nghỉ chuyển phe), để không hiện lại bàn cũ. */
  const [heldBoard, setHeldBoard] = useState<Board | null>(null);
  /** Chỉ số hai phe sau phần đã diễn, giữ cùng lúc với heldBoard để thanh máu/năng lượng không trễ một lượt. */
  const [heldSides, setHeldSides] = useState<BattleState["sides"] | null>(null);
  const afterAnim = useRef<(() => void) | null>(null);
  /** Online: khung đổi ô đã diễn trước trong lúc chờ server, commit kế tiếp bỏ khung đầu. */
  const swapShown = useRef(false);
  const pacingTimeouts = useRef<Set<number>>(new Set());
  const turnBannerId = useRef(0);
  const [pacing, setPacing] = useState(false);
  const [turnBanner, setTurnBanner] = useState<{
    readonly id: number;
    readonly side: 0 | 1;
  } | null>(null);
  const [floats, setFloats] = useState<Float[]>([]);
  /** Kênh động tác cho sân khấu trận. */
  const [cueBus] = useState(createCueBus);
  // Âm thanh trận: cue theo sự kiện (start/end khớp đạo diễn trận), tiếng ghép ô theo từng khung, nhạc nền theo loại trận.
  const { play: playSound, preload: preloadSounds, playMusic, stopMusic } = useAudio();
  const playCues = useCallback(
    (list: readonly CuePlay[]) => {
      for (const c of list) {
        if (c.delay) window.setTimeout(() => playSound(c.id, { rate: c.rate }), c.delay);
        else playSound(c.id, { rate: c.rate });
      }
    },
    [playSound],
  );
  const floatId = useRef(0);
  const drag = useRef<{ pos: Pos; x: number; y: number } | null>(null);
  /** Trận online: id, seq server đang có, đang chờ server trả lời, lệch giờ so với server. */
  const [battleId, setBattleId] = useState<string | null>(null);
  const seq = useRef(0);
  const [pending, setPending] = useState(false);
  const clockOffset = useRef(0);
  const [clock, setClock] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  /** Campaign V2: trạng thái mục tiêu, tính từ trạng thái server bằng chính hàm chốt của server. */
  const scenarioStatus = useMemo(() => {
    if (!scenario || !live) return null;
    const r = settleCampaignScenario(scenario, live);
    return r.ok ? r.verdict.status : null;
  }, [scenario, live]);
  const scenarioOver = scenarioStatus !== null && scenarioStatus !== "pending";
  const labels = scenario ? campaignPhaseLabels(scenario.nodeId) : [];
  const phaseObjective = scenario
    ? campaignScenarioByNode(scenario.nodeId)?.phases[scenario.phaseIndex]
        ?.objective
    : undefined;
  const bossThreshold =
    phaseObjective?.type === "bossPhases"
      ? phaseObjective.hpThreshold
      : undefined;
  const phaseBoss =
    live && phaseObjective?.type === "bossPhases"
      ? live.sides[1].fighters.find((f) => f.id === phaseObjective.bossTarget)
      : undefined;
  const phaseTurns = scenario
    ? campaignSurviveTurns(scenario.nodeId, scenario.phaseIndex)
    : undefined;
  const phaseAdvanced = scenarioStatus === "advance";
  const scenarioFailed = scenarioStatus === "failed" || state.winner === AI;
  const playerTurn =
    started &&
    state.winner === null &&
    !scenarioOver &&
    state.turn.side === PLAYER;
  /** Sinh tồn: vừa hạ hết một đợt, chờ người chơi vào đợt kế (hoặc dừng). */
  const atBreak =
    survival !== null && !survival.done && state.winner === PLAYER;
  // Nhạc nền theo loại trận (chỉ khi đang trong trận, không phải màn chuẩn bị): Sinh tồn, trùm chiến dịch, trận thường; rời trận thì tắt dần.
  const battleMusic: MusicId | null = !started
    ? null
    : survival
      ? "survival"
      : destinyFloorNo !== null
        ? "tower_destiny"
        : arenaFoe
          ? "arena"
          : raidBoss !== null || phaseObjective?.type === "bossPhases"
            ? "battle_boss"
            : "battle_normal";
  useEffect(() => {
    if (battleMusic) playMusic(battleMusic);
    else stopMusic(600);
  }, [battleMusic, playMusic, stopMusic]);
  useEffect(() => () => stopMusic(600), [stopMusic]);
  useEffect(() => preloadSounds(BATTLE_PRELOAD), [preloadSounds]);
  // Kết quả Nhật Lệnh và Đấu trường: một tiếng báo khi server trả điểm và hạng.
  const dailyDone = outcome?.daily !== undefined;
  const arenaDone = outcome?.arena !== undefined;
  useEffect(() => {
    if (dailyDone) playSound("daily.complete");
  }, [dailyDone, playSound]);
  useEffect(() => {
    if (arenaDone) playSound("arena.rank");
  }, [arenaDone, playSound]);
  /** Đang chạy hoạt ảnh thì chưa nhận thao tác mới. */
  const myTurn = playerTurn && anim === null && !pending && !pacing;
  const actor = state.sides[PLAYER].fighters[state.turn.actor]!;
  const selectable = useMemo(
    () => (myTurn ? selectableActors(state) : []),
    [myTurn, state],
  );
  const skills = useMemo(
    () =>
      (actor.skills ?? [])
        .map((id) => fighterSkill(actor, id))
        .filter((d): d is SkillDef => !!d),
    [actor],
  );

  const flash = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 1600);
  }, []);

  const pushLog = useCallback(
    (s: BattleState, events: readonly BattleEvent[]) => {
      const lines = events.flatMap((e) => {
        const text = describe(s, e);
        return text ? [{ id: logId.current++, text }] : [];
      });
      if (lines.length > 0)
        setLog((l) => [...lines.reverse(), ...l].slice(0, 30));
    },
    [],
  );

  const showNumbers = useCallback((events: readonly BattleEvent[]) => {
    const order = new Map<string, number>();
    const next = events.flatMap((e): Float[] => {
      if (e.type !== "damage" && e.type !== "heal") return [];
      const items: [string, Float["tone"]][] =
        e.type === "heal"
          ? e.amount > 0
            ? [[`+${e.amount}`, "heal"]]
            : []
          : [
              ...(e.absorbed > 0
                ? [[`${e.absorbed}`, "shield"] as [string, Float["tone"]]]
                : []),
              ...(e.amount > 0
                ? [[`-${e.amount}`, "damage"] as [string, Float["tone"]]]
                : []),
            ];
      return items.map(([text, tone]) => {
        const key = `${e.side}:${e.fighter}`;
        const n = order.get(key) ?? 0;
        order.set(key, n + 1);
        return {
          id: floatId.current++,
          side: e.side,
          fighter: e.fighter,
          text,
          tone,
          order: n,
        };
      });
    });
    if (next.length === 0) return 0;
    const ids = new Set(next.map((f) => f.id));
    setFloats((f) => [...f, ...next]);
    const last = Math.max(...next.map((f) => f.order));
    const duration = FLOAT_MS + last * FLOAT_STAGGER_MS + 100;
    window.setTimeout(
      () => setFloats((f) => f.filter((x) => !ids.has(x.id))),
      duration,
    );
    return prefersReducedMotion() ? 0 : duration;
  }, []);

  /** Chạy các khung hoạt ảnh rồi mới cập nhật trạng thái trận (máu, nhật ký, lượt). */
  const play = useCallback((frames: readonly Frame[], done: () => void) => {
    if (frames.length === 0 || prefersReducedMotion()) return done();
    afterAnim.current = done;
    setAnim({ frames, i: 0, id: animId.current++ });
  }, []);

  const afterPacingDelay = useCallback((ms: number, done: () => void) => {
    const id = window.setTimeout(() => {
      pacingTimeouts.current.delete(id);
      done();
    }, ms);
    pacingTimeouts.current.add(id);
  }, []);

  useEffect(() => () => {
    for (const id of pacingTimeouts.current) window.clearTimeout(id);
    pacingTimeouts.current.clear();
  }, []);

  // Chơi online: tải hồ sơ trên server, chọn sẵn nguyên tố và nghề đã dùng lần trước.
  useEffect(() => {
    if (!online) return;
    void fetchProfile().then((r) => {
      if (!r.profile) return;
      setProfile(r.profile);
      setElement(r.profile.element);
      setProfession(r.profile.profession);
    });
  }, [online]);

  useEffect(() => {
    if (!anim) return;
    const t = window.setTimeout(() => {
      if (anim.i + 1 < anim.frames.length)
        return setAnim({ ...anim, i: anim.i + 1 });
      setAnim(null);
      const done = afterAnim.current;
      afterAnim.current = null;
      done?.();
    }, anim.frames[anim.i]!.ms);
    return () => window.clearTimeout(t);
  }, [anim]);

  // Tiếng ghép ô phát đúng lúc từng khung hoạt ảnh bắt đầu.
  useEffect(() => {
    if (!anim) return;
    const c = frameCue(anim.frames[anim.i]?.sound);
    if (c) playSound(c.id, { rate: c.rate });
  }, [anim, playSound]);

  const commit = useCallback(
    (
      before: BattleState,
      after: BattleState,
      events: readonly BattleEvent[],
    ) => {
      const batches: { side: 0 | 1; events: BattleEvent[] }[] = [];
      let side = before.turn.side;
      let batch: BattleEvent[] = [];
      for (const event of events) {
        if (event.type === "turnStart" && event.side !== side) {
          if (batch.length > 0) batches.push({ side, events: batch });
          side = event.side;
          batch = [];
        }
        batch.push(event);
      }
      if (batch.length > 0) batches.push({ side, events: batch });
      if (batches.length === 0) batches.push({ side, events: [] });
      if (
        after.winner === null &&
        after.turn.side !== batches[batches.length - 1]!.side
      ) batches.push({ side: after.turn.side, events: [] });

      const hasTurnTransition = batches.some((item, index) =>
        index > 0 && item.side !== batches[index - 1]!.side,
      );
      if (hasTurnTransition) {
        setPacing(true);
        setSelected(null);
        setAim(null);
        setWhirlAim(null);
        setPendingWhirl(null);
      }

      let board = before.board;
      let sides = before.sides;
      const finish = () => {
        // Chơi offline: đồng hồ lượt mới tính từ lúc hoạt ảnh xong, thời gian xem hoạt ảnh không bị trừ.
        const shown =
          !online &&
          after.turn.deadline !== null &&
          after.turn.deadline !== before.turn.deadline
            ? {
                ...after,
                turn: { ...after.turn, deadline: Date.now() + TURN_MS },
              }
            : after;
        setState(shown);
        setHeldBoard(null);
        setHeldSides(null);
        // Trận online: server cộng thưởng và gửi `outcome` (xem receive).
        if (
          !online &&
          mode === "progress" &&
          before.winner === null &&
          after.winner !== null
        ) {
          const rewards = battleRewards(after, PLAYER);
          const r = applyRewards(
            profile,
            after.sides[PLAYER].fighters.map((f) => f.id),
            rewards,
          );
          const rolled = demoDrop(
            seed,
            round,
            difficulty,
            after.winner === PLAYER,
          );
          const received = rolled
            ? receiveDrop(r.profile, rolled)
            : { profile: r.profile, item: null, soldFor: 0 };
          setProfile(received.profile);
          saveProfile(received.profile);
          setOutcome({
            rewards,
            levelUps: r.levelUps,
            drop: received.item,
            soldFor: received.soldFor,
          });
        }
        setTurnBanner(null);
        setPacing(false);
      };

      const present = (index: number) => {
        const current = batches[index];
        if (!current) return finish();
        const cues = stageCues(before, current.events);
        let frames = eventFrames(board, current.events);
        if (index === 0 && swapShown.current && current.events[0]?.type === "swap")
          frames = frames.slice(1);
        if (index === 0) swapShown.current = false;
        cueBus.emit(cues.start);
        const sounds = soundsForEvents(before, current.events, PLAYER);
        playCues(sounds.start);
        play(frames, () => {
          board = frames.at(-1)?.board ?? board;
          setHeldBoard(board);
          sides = sidesAfterEvents(sides, current.events, after);
          setHeldSides(sides);
          pushLog(after, current.events);
          const effectMs = showNumbers(current.events);
          cueBus.emit(cues.end);
          playCues(sounds.end);
          const next = batches[index + 1];
          if (!next || next.side === current.side) return present(index + 1);
          const beginPause = () => afterPacingDelay(COMBAT_PACING.turnPauseMs, () => {
            setTurnBanner({ id: turnBannerId.current++, side: next.side });
            const bannerMs = next.side === AI
              ? COMBAT_PACING.enemyTurnBannerMs
              : COMBAT_PACING.playerTurnBannerMs;
            afterPacingDelay(bannerMs, () => {
              setTurnBanner(null);
              present(index + 1);
            });
          });
          if (effectMs > 0) afterPacingDelay(effectMs, beginPause);
          else beginPause();
        });
      };

      present(0);
    },
    [
      play,
      pushLog,
      showNumbers,
      cueBus,
      playCues,
      online,
      mode,
      profile,
      seed,
      round,
      difficulty,
      afterPacingDelay,
    ],
  );

  /** Nhận trả lời của server: chạy hoạt ảnh các sự kiện rồi đồng bộ trạng thái và seq. */
  const receive = useCallback(
    (before: BattleState, res: OnlineResponse) => {
      clockOffset.current = res.now - Date.now();
      if (res.error)
        flash(
          ONLINE_ERROR_TEXT[res.error] ??
            ERROR_TEXT[res.error as keyof typeof ERROR_TEXT] ??
            res.error,
        );
      if (!res.view || res.view.seq < seq.current || !res.events?.length) {
        // Không có gì để diễn: trả bàn cờ về state thật nếu đã diễn trước khung đổi ô.
        swapShown.current = false;
        setHeldBoard(null);
      }
      if (!res.view) return;
      if (res.view.seq < seq.current) return;
      seq.current = res.view.seq;
      setSurvival(res.view.survival ?? null);
      const next = toBattleState(res.view);
      if (res.events && res.events.length > 0) commit(before, next, res.events);
      else setState(next);
      if (res.outcome) {
        setOutcome(res.outcome);
        void fetchProfile().then((r) => r.profile && setProfile(r.profile));
      }
      const resting =
        res.view.survival && !res.view.survival.done && next.winner === PLAYER;
      const tag = res.view.campaignScenario;
      const verdict = tag ? settleCampaignScenario(tag, next) : null;
      const objectiveDone =
        verdict !== null && verdict.ok && verdict.verdict.status !== "pending";
      if ((next.winner !== null || objectiveDone) && !resting) {
        try {
          window.localStorage.removeItem(ONLINE_BATTLE_KEY);
        } catch {
          // Không lưu được thì thôi, trận đã xong.
        }
      }
    },
    [commit, flash],
  );

  const sendOnline = useCallback(
    (action: MatchAction) => {
      if (!battleId) return;
      const before = state;
      setPending(true);
      const requestedSeq = seq.current;
      void actOnline(battleId, requestedSeq, action).then(async (res) => {
        let response = res;
        if (
          !res.view &&
          ["network", "conflict", "staleSeq"].includes(res.error ?? "")
        ) {
          const refreshed = await fetchOnline(battleId);
          if (refreshed.view)
            response = { ...refreshed, error: res.error };
        }
        setPending(false);
        receive(before, response);
      });
    },
    [battleId, state, receive, setPending],
  );

  const apply = useCallback(
    (action: BattleAction): boolean => {
      // Online: kiểm tra trước bằng core cho phản hồi tức thì; bàn cờ thật chỉ lấy từ server.
      const r = act(state, action, Date.now() + clockOffset.current);
      if (!r.ok) {
        let text = ERROR_TEXT[r.error];
        if (r.error === "notEnoughEnergy" && action.type === "skill") {
          text += ` (${actor.energy}/${fighterSkill(actor, action.skill)?.cost ?? 0})`;
        }
        if (r.error === "invalidMove" && action.type === "swap")
          play(bounceFrames(state.board, action.from, action.to), () => {});
        flash(text);
        return false;
      }
      if (online) {
        // Đổi ô diễn ngay, không chờ server; phần xóa và rơi ô (cần rng của server) diễn khi có kết quả.
        if (action.type === "swap") {
          const swapped = swapCells(state.board, action.from, action.to);
          swapShown.current = true;
          play(eventFrames(state.board, [{ type: "swap", from: action.from, to: action.to, steps: [] }]), () =>
            setHeldBoard((held) => (swapShown.current ? swapped : held)),
          );
        }
        sendOnline(action);
      } else commit(state, r.state, r.events);
      return true;
    },
    [state, actor, flash, play, commit, online, sendOnline],
  );

  // Offline: transition player → AI đã được queue trình diễn xử lý trước khi state đổi phe.
  useEffect(() => {
    if (online || pacing || !started || state.winner !== null || state.turn.side !== AI)
      return;
    const timer = window.setTimeout(() => {
      const r = playAiTurn(state, difficulty, Date.now());
      commit(state, r.state, r.events);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [online, pacing, started, state, difficulty, commit]);

  // Đồng hồ 30 giây mỗi lượt (online lẫn offline).
  const deadline =
    started && state.winner === null && !scenarioOver
      ? state.turn.deadline
      : null;
  useEffect(() => {
    if (deadline === null) return;
    const tick = window.setInterval(
      () => setClock(Date.now() + clockOffset.current),
      250,
    );
    return () => window.clearInterval(tick);
  }, [deadline]);
  // Online: quá hạn (cộng ân hạn) thì hỏi server để chạy bù lượt mất và lượt AI.
  useEffect(() => {
    if (!online || deadline === null || !battleId) return;
    const wait = deadline + GRACE_MS + 200 - (Date.now() + clockOffset.current);
    const before = state;
    const t = window.setTimeout(
      () => {
        setPending(true);
        void fetchOnline(battleId).then((res) => {
          setPending(false);
          receive(before, res);
        });
      },
      Math.max(0, wait),
    );
    return () => window.clearTimeout(t);
  }, [online, deadline, battleId, state, receive]);
  // Offline: quá hạn (cộng ân hạn) thì mất lượt ngay trên máy; chờ hoạt ảnh đang chạy xong.
  useEffect(() => {
    if (online || deadline === null || anim !== null) return;
    if (state.turn.side !== PLAYER) return;
    const wait = deadline + GRACE_MS + 50 - Date.now();
    const t = window.setTimeout(
      () => {
        const r = act(state, { type: "timeout" }, Date.now());
        if (r.ok) commit(state, r.state, r.events);
      },
      Math.max(0, wait),
    );
    return () => window.clearTimeout(t);
  }, [online, deadline, anim, state, commit]);
  const secondsLeft =
    deadline === null
      ? null
      : Math.min(
          TURN_MS / 1000,
          Math.max(0, Math.ceil((deadline - clock) / 1000)),
        );

  // Báo chiều cao cho trang cha khi được nhúng bằng iframe (ShanVerse).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.parent === window) return;
    const post = () =>
      window.parent.postMessage(
        { type: "colau:height", height: el.scrollHeight },
        "*",
      );
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, []);

  const trySwap = useCallback(
    (from: Pos, to: Pos) => {
      setSelected(null);
      apply({ type: "swap", from, to });
    },
    [apply],
  );

  /**
   * Bắt đầu chọn mục tiêu cho kỹ năng: đối thủ/đồng đội khi có từ hai lựa chọn, rồi ô làm tâm nếu kỹ năng phá vùng.
   * Không cần chọn gì thì dùng luôn.
   */
  const aimOrCast = useCallback(
    (def: SkillDef, whirl?: Whirl) => {
      const choose = skillTargetOptions(state, def).length > 1;
      if (choose || needsCell(def)) {
        setPendingWhirl(whirl ?? null);
        setAim({ skill: def, choose });
        setSelected(null);
        setAimIndex(defaultSkillTarget(state, def) ?? 0);
        return;
      }
      apply({ type: "skill", skill: def.id, ...(whirl ? { whirl } : {}) });
    },
    [state, apply],
  );

  const castSkill = useCallback(
    (def: SkillDef) => {
      if (!myTurn) return;
      if (state.turn.skillUsed) return flash(ERROR_TEXT.skillUsed);
      if (actor.energy < comboSkillCost(actor,def))
        return flash(
          `${ERROR_TEXT.notEnoughEnergy} (${actor.energy}/${comboSkillCost(actor,def)})`,
        );
      const whirl = whirlStep(def);
      if (whirl) {
        setAim(null);
        setSelected(null);
        setWhirlAim({ skill: def, max: whirl.turns, center: null });
        return;
      }
      aimOrCast(def);
    },
    [myTurn, state, actor, aimOrCast, flash],
  );

  const fireAim = useCallback(
    (picked?: number, cell?: Pos) => {
      if (!aim) return;
      const def = aim.skill;
      const target = picked ?? aim.target;
      if (needsCell(def) && !cell) {
        // Kỹ năng phá vùng: giữ mục tiêu vừa chọn, chờ chọn tâm.
        if (picked !== undefined) setAim({ ...aim, target: picked });
        return flash("Chọn một ô trên bàn cờ làm tâm");
      }
      const ok = apply({
        type: "skill",
        skill: def.id,
        ...(target !== undefined ? { target } : {}),
        ...(cell ? { cell } : {}),
        ...(pendingWhirl ? { whirl: pendingWhirl } : {}),
      });
      if (ok) {
        setAim(null);
        setPendingWhirl(null);
      }
    },
    [aim, pendingWhirl, apply, flash],
  );

  /** Xoay quanh tâm đã chọn: dương theo chiều kim đồng hồ. */
  const spinWhirl = useCallback(
    (turns: number) => {
      if (!whirlAim?.center || Math.abs(turns) > whirlAim.max) return;
      const whirl = { center: whirlAim.center, turns };
      setWhirlAim(null);
      if (!whirlAim.skill) apply({ type: "whirl", whirl });
      else aimOrCast(whirlAim.skill, whirl);
    },
    [whirlAim, apply, aimOrCast],
  );

  const onCell = useCallback(
    (pos: Pos) => {
      if (!myTurn) return;
      if (whirlAim) {
        const c = whirlAim.center;
        if (c && c.row === pos.row && c.col === pos.col)
          return setWhirlAim({ ...whirlAim, center: null });
        if (!isWhirlCenter(state.board, pos)) return flash(whirlHint({ ...whirlAim, center: null }));
        return setWhirlAim({ ...whirlAim, center: pos });
      }
      if (aim) {
        if (aim.choose && aim.target === undefined)
          return flash(
            aim.skill.target === "ally" ? "Chọn đồng đội trước" : "Chọn đối thủ trước",
          );
        if (needsCell(aim.skill)) fireAim(undefined, pos);
        return;
      }
      if (!selected) return setSelected(pos);
      if (selected.row === pos.row && selected.col === pos.col)
        return setSelected(null);
      if (isAdjacent(selected, pos)) return trySwap(selected, pos);
      setSelected(pos);
    },
    [myTurn, whirlAim, aim, selected, state.board, flash, fireAim, trySwap],
  );

  const onPointerDown = (pos: Pos, e: React.PointerEvent) => {
    setShowCursor(false);
    drag.current = { pos, x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX || aim || whirlAim)
      return onCell(d.pos);
    if (!myTurn) return;
    const to =
      Math.abs(dx) > Math.abs(dy)
        ? { row: d.pos.row, col: d.pos.col + Math.sign(dx) }
        : { row: d.pos.row + Math.sign(dy), col: d.pos.col };
    if (tileAt(state.board, to)) trySwap(d.pos, to);
  };

  const switchActor = useCallback(
    (step: 1 | -1) => {
      if (selectable.length <= 1) return;
      const i = selectable.indexOf(state.turn.actor);
      const next =
        selectable[(i + step + selectable.length) % selectable.length]!;
      apply({ type: "selectActor", fighter: next });
    },
    [selectable, state.turn.actor, apply],
  );

  // Điều khiển bàn phím, docs/05-ui-ux/screens/battle.md mục 2.3.
  useBattleKeyboard({
    aim,
    aimIndex,
    castSkill,
    cursor,
    fireAim,
    myTurn,
    onCell,
    selected,
    setAim,
    setAimIndex,
    setCursor,
    setPendingWhirl,
    setSelected,
    setShowCursor,
    setWhirlAim,
    skills,
    spinWhirl,
    state,
    switchActor,
    trySwap,
    whirlAim,
  });

  // Món rơi sau trận theo bảng rơi đồ của core. Tiến trình (và Chơi online) lấy món đã vào túi từ `outcome`;
  // Luyện tập chỉ hiển thị.
  const drop = useMemo(
    () =>
      mode === "progress"
        ? (outcome?.drop ?? null)
        : state.winner === null
          ? null
          : demoDrop(seed, round, difficulty, state.winner === PLAYER),
    [mode, outcome, state.winner, seed, round, difficulty],
  );

  /** Dọn trận cũ; trận mới dùng bàn cờ xem trước của vòng kế. */
  const reset = () => {
    setRound(round + 1);
    setSeed(randomSeed());
    setAnim(null);
    afterAnim.current = null;
    setHeldBoard(null);
    setHeldSides(null);
    setFloats([]);
    setState(null);
    setOutcome(null);
    setSelected(null);
    setAim(null);
    setWhirlAim(null);
    setPendingWhirl(null);
    setLog([]);
    setBattleId(null);
    setScenario(null);
    setSurvival(null);
    setDailyDay(null);
    setArenaFoe(null);
    setExpeditionMatch(false);
    setExpeditionObjective(null);
  };

  /** Về màn chờ trước trận để đổi nguyên tố, nghề, trang bị hoặc nâng kỹ năng. */
  const restart = () => {
    if (!online) setProfile(loadProfile());
    reset();
    setStarted(false);
  };

  /**
   * Chơi thử: vào trận mới ngay với lựa chọn hiện tại. Mỗi trận một bàn cờ mới; đồng hồ lượt đầu tính từ
   * lúc vào trận.
   */
  const replay = () => {
    reset();
    const fresh = randomSeed();
    const battle = newBattle(fresh, setup);
    setSeed(fresh);
    setState({
      ...battle,
      turn: { ...battle.turn, deadline: Date.now() + TURN_MS },
    });
    setStarted(true);
    setBooting(false);
  };

  /** Chơi thử: quay lại trận đang đánh từ màn chờ; lượt đang đi được tính lại đủ 30 giây. */
  const backToBattle = () => {
    if (live && live.turn.deadline !== null)
      setState({
        ...live,
        turn: { ...live.turn, deadline: Date.now() + TURN_MS },
      });
    setStarted(true);
  };

  // Chơi thử vào trận ngay khi mở màn (bàn cờ ngẫu nhiên nên dựng sau khi vào trình duyệt).
  useEffect(() => {
    if (!booting) return;
    const t = window.setTimeout(replay, 0);
    return () => window.clearTimeout(t);
    // Chỉ chạy một lần khi vào màn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  const beginOnline = (res: OnlineResponse) => {
    clockOffset.current = res.now - Date.now();
    if (!res.view || !res.id)
      return flash(
        ONLINE_ERROR_TEXT[res.error ?? "network"] ?? "Không tạo được trận",
      );
    seq.current = res.view.seq;
    setRaidBoss(res.view.raidBoss ?? null);
    setSpecialQuestId(res.view.specialQuest ?? null);
    setScenario(res.view.campaignScenario ?? null);
    setDestinyFloorNo(res.view.destiny?.floor ?? null);
    setExpeditionMatch(res.view.expedition !== undefined);
    setExpeditionObjective(res.view.expedition?.objective ?? null);
    setSurvival(res.view.survival ?? null);
    setDailyDay(res.view.daily ?? null);
    setArenaFoe(res.view.arena ?? null);
    setBattleId(res.id);
    setClock(res.now);
    setState(toBattleState(res.view));
    setStarted(true);
    try {
      window.localStorage.setItem(ONLINE_BATTLE_KEY, res.id);
    } catch {
      // Không lưu được: tải lại trang sẽ không tiếp tục được trận này.
    }
  };

  const start = () => {
    if (!online) return replay();
    setPending(true);
    void createOnline({
      mode: "3v3",
      element,
      profession,
      companions: profile.team,
      difficulty,
    }).then((res) => {
      setPending(false);
      beginOnline(res);
    });
  };

  /** Tiếp tục trận online dở (sau khi tải lại trang). */
  const resume = () => {
    let id: string | null = null;
    try {
      id = window.localStorage.getItem(ONLINE_BATTLE_KEY);
    } catch {
      id = null;
    }
    if (!id) return flash("Không có trận dở");
    setPending(true);
    void fetchOnline(id).then((res) => {
      setPending(false);
      if (res.error === "notFound") {
        try {
          window.localStorage.removeItem(ONLINE_BATTLE_KEY);
        } catch {
          // Bỏ qua.
        }
      }
      beginOnline(res);
    });
  };

  const resumed = useRef(false);
  useEffect(() => {
    if (!autoResume || resumed.current) return;
    resumed.current = true;
    resume();
    // Chỉ chạy một lần khi vào trang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResume]);

  const changeProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  /** Thao tác hồ sơ (nâng kỹ năng, mua nhân vật…): Chơi thử áp tại chỗ rồi lưu trình duyệt, Chơi online gửi server. */
  const profileAction = async (a: ProfileAction): Promise<string | null> => {
    if (!online) {
      const r = applyProfileAction({ ...profile, element }, a);
      if (!r.ok) return r.error;
      changeProfile({ ...r.profile, element: profile.element });
      return null;
    }
    const r = await sendProfileAction(a);
    if (r.profile) setProfile(r.profile);
    return r.error ?? null;
  };

  // Game chỉ có một giao diện (gỗ tối), không có chế độ sáng.
  const stageVisible = useStageVisible();
  const palette =
    "text-on-wood";

  const frame = anim ? anim.frames[anim.i] : undefined;
  const board = frame?.board ?? heldBoard ?? state.board;
  /** Tâm lốc xoáy hiển thị: đang chọn chiều xoay, hoặc đã chọn xong và còn chờ chọn mục tiêu. */
  const whirlCenter = whirlAim?.center ?? (aim && pendingWhirl ? pendingWhirl.center : null);
  /** Với từng nấc xoay có thể chọn: bàn cờ sau khi xoay và các ô sẽ ghép được ngay (chỉ để xem trước, không đổi trạng thái). */
  const spinOptions = useMemo(() => {
    const center = whirlAim?.center;
    if (!whirlAim || !center) return [];
    const turnsList = [-whirlAim.max, ...(whirlAim.max > 1 ? [-1, 1] : []), whirlAim.max]
      .filter((t, i, list) => list.indexOf(t) === i)
      .sort((x, y) => x - y);
    return turnsList.map((turns) => ({ turns, ...previewWhirl(state.board, { center, turns }) }));
  }, [whirlAim, state.board]);
  const spinView = whirlAim?.center && spinPreview !== null ? spinOptions.find((o) => o.turns === spinPreview) : undefined;

  // Thẻ bấm được để chọn (hoặc đổi) mục tiêu; mục tiêu đã chọn được đánh dấu trong lúc chọn tâm.
  const aimingFoe = aim?.choose && aim.skill.target === "enemy";
  const aimingAlly = aim?.choose && aim.skill.target === "ally";
  const aimMark = aim?.target ?? aimIndex;

  /** `inline`: bản phe mình đặt ngay dưới bàn cờ, chỉ hiện trên điện thoại. */
  // Màn rộng (lg+): kỹ năng nằm dưới thẻ phe mình ở cột trái, để thấy cùng lúc sân đấu, bàn cờ và kỹ năng
  // mà không phải cuộn. Màn hẹp giữ ngay dưới bàn cờ.
  const skillBar = (stacked: boolean) => (
    <SkillBar
      actor={actor}
      aim={aim}
      castSkill={castSkill}
      myTurn={myTurn}
      setAim={setAim}
      setPendingWhirl={setPendingWhirl}
      setSelected={setSelected}
      setWhirlAim={setWhirlAim}
      skills={skills}
      stacked={stacked}
      state={state}
      whirlAim={whirlAim}
    />
  );

  const side = (s: 0 | 1, inline = false) => {
    const own = (heldSides ?? state.sides)[s];
    return (
      <TeamColumn
        aim={aim}
        aimMark={aimMark}
        aimingAlly={aimingAlly}
        aimingFoe={aimingFoe}
        apply={apply}
        arenaFoe={arenaFoe}
        fireAim={fireAim}
        floats={floats}
        inline={inline}
        own={own}
        s={s}
        selectable={selectable}
        skillBar={skillBar}
        started={started}
        state={state}
      />
    );
  };

  return (
    <div
      ref={rootRef}
      className={`${palette} ui-mode-screen`}
    >
      <OrnateFrame level="raised" flush className={`mx-auto flex w-full flex-col gap-3 p-3 sm:p-5 ${MODE_CONTENT_WIDTH}`}>
        <BattleHeader
          atBreak={atBreak}
          difficulty={difficulty}
          online={online}
          pending={pending}
          playerTurn={playerTurn}
          profession={profession}
          scenarioFailed={scenarioFailed}
          scenarioOver={scenarioOver}
          setDifficulty={setDifficulty}
          setProfile={setProfile}
          setStarted={setStarted}
          started={started}
          state={state}
          survival={survival}
        />
        {scenario && live && !scenarioOver && (phaseTurns || labels.length > 1) && (
          <p className="rounded-md border border-frame-line bg-frame-gold/10 px-3 py-1 text-sm text-title-on-wood">
            {storyNodeById(scenario.nodeId)?.title}
            {labels.length > 1 &&
              ` · giai đoạn ${scenario.phaseIndex + 1}/${labels.length}: ${labels[scenario.phaseIndex]}`}
            {phaseTurns ? (
              <>
                : {labels.length > 1 ? "đã giữ" : "cầm cự"}{" "}
                {Math.min(completedPlayerTurns(live), phaseTurns)}/{phaseTurns}{" "}
                lượt của bạn hoặc hạ{" "}
                {live.sides[1].fighters.length > 1 ? "hết đối thủ" : "thủ lĩnh"}.
              </>
            ) : bossThreshold && phaseBoss ? (
              `: đẩy ${phaseBoss.name} xuống ${Math.round(bossThreshold * 100)}% máu (đang ${Math.round((Math.max(0, phaseBoss.hp) / phaseBoss.maxHp) * 100)}%).`
            ) : phaseBoss && labels.length > 1 ? (
              `: hạ ${phaseBoss.name}; máu mất ở giai đoạn trước không hồi.`
            ) : (
              ": hạ hết đối thủ."
            )}
            {phaseObjective?.type === "breakSiege" &&
              phaseObjective.stage === "escort" && (
                <span className="block text-caption text-info">
                  Tình tiết phục vụ lối chơi: đoàn lương và toán chặn đường do
                  game sáng tác.
                </span>
              )}
          </p>
        )}
        {expeditionObjective && live && state.winner === null && (
          <p className="rounded-md border border-frame-line bg-wood-inset px-3 py-1 text-sm text-on-wood">
            {expeditionObjective.type === "gate"
              ? `Phá cổng: hạ Cổng thành là qua (cổng còn ${Math.round((Math.max(0, live.sides[1].fighters[expeditionObjective.fighter]?.hp ?? 0) / Math.max(1, live.sides[1].fighters[expeditionObjective.fighter]?.maxHp ?? 1)) * 100)}% độ bền).`
              : `${expeditionObjective.type === "hold" ? "Giữ vị trí" : "Hộ tống đoàn dân"}: đã giữ ${Math.min(completedPlayerTurns(live), expeditionObjective.turns)}/${expeditionObjective.turns} lượt của bạn, hoặc hạ hết đối thủ.`}
          </p>
        )}
        <DongSonBand className="-mt-1 w-full opacity-70" />
        {survival && started && (
          <WaveBanner survival={survival} resting={atBreak} />
        )}

        {!started && !booting && (
          <SetupLobby
            online={online}
            mode={mode}
            onMode={(m) => {
              if (m === "progress" && mode !== "progress")
                setProfile(loadProfile());
              setMode(m);
            }}
            level={profile.main.level}
            elements={MAIN_ELEMENTS}
            element={element}
            onElement={setElement}
            profession={profession}
            onProfession={setProfession}
            gear={gear}
            onGear={setGear}
            difficulties={DIFFICULTIES}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
            teams={[preview.sides[PLAYER].fighters, preview.sides[AI].fighters]}
            pending={pending}
            canReturn={!online && live !== null && live.winner === null}
            onStart={start}
            onResume={online ? resume : undefined}
            onReturn={backToBattle}
          />
        )}

        {started && stageVisible && (
          <BattleStage
            sides={[(heldSides ?? state.sides)[PLAYER].fighters, (heldSides ?? state.sides)[AI].fighters]}
            actor={
              state.winner === null
                ? { side: state.turn.side, fighter: state.turn.actor }
                : null
            }
            bus={cueBus}
          />
        )}

        <div
          className={`flex flex-col gap-3 md:flex-row md:items-start ${started ? "" : "hidden"}`}
        >
          {side(PLAYER)}

          <div className="order-2 mx-auto flex w-full min-w-0 flex-1 flex-col gap-2 md:order-none xl:max-w-[46rem] 3xl:max-w-[56rem]">
            {started && state.winner === null && !atBreak && (
              <TurnClock
                seconds={playerTurn ? secondsLeft : null}
                mine={playerTurn}
                extra={state.turn.extra}
                waiting={pending}
              />
            )}
            {/* lg+: bàn cờ không cao quá phần màn hình còn lại dưới sân đấu, để thấy cả hoạt ảnh lẫn bàn cờ khi chơi. */}
            <div
              className="relative mx-auto mt-3 w-full rounded-xl border-2 border-[var(--primary)] bg-[var(--decorative-frame)] p-1.5 shadow-lg lg:max-w-[max(30rem,calc((100dvh-21rem)*var(--board-ratio)))]"
              style={{ "--board-ratio": board.cols / board.rows } as React.CSSProperties}
            >
              <BoardCrest className="pointer-events-none absolute -top-4 left-1/2 z-10 h-8 w-40 -translate-x-1/2 md:-top-5 md:h-10 md:w-52" />
              {CORNERS.map((c) => (
                <CloudCorner
                  key={c}
                  className={`pointer-events-none absolute z-10 size-5 ${c}`}
                />
              ))}
              <div
                className="relative grid touch-none select-none gap-0.5 overflow-hidden rounded-md bg-black/25 p-0.5"
                style={{
                  gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
                }}
                onPointerUp={onPointerUp}
                onPointerLeave={() => (drag.current = null)}
                role="grid"
                aria-label="Bàn cờ"
              >
                <BoardCells
                  aim={aim}
                  anim={anim}
                  board={board}
                  cursor={cursor}
                  frame={frame}
                  onPointerDown={onPointerDown}
                  selected={selected}
                  showCursor={showCursor}
                  spinView={spinView}
                  whirlAim={whirlAim}
                  whirlCenter={whirlCenter}
                />
                {/* Nút hoa đồng ở giao điểm các ô, như đinh tán trên bàn ngọc. */}
                <div
                  aria-hidden
                  className="board-knots pointer-events-none absolute inset-px"
                  style={{ backgroundSize: `calc(100% / ${board.cols}) calc(100% / ${board.rows})` }}
                />
                {frame?.chain && (
                  <div
                    key={`${anim!.id}-${anim!.i}`}
                    className="chain-pop pointer-events-none absolute left-1/2 top-2 rounded bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow"
                  >
                    Chuỗi ×{frame.chain}
                  </div>
                )}
                {turnBanner && (
                  <div
                    key={turnBanner.id}
                    role="status"
                    aria-live="polite"
                    className={`turn-banner pointer-events-none absolute inset-x-3 top-1/2 z-20 rounded border px-3 py-2 text-center font-serif text-base font-black tracking-[0.16em] shadow-lg sm:inset-x-10 sm:text-lg ${
                      turnBanner.side === AI
                        ? "border-stat-hp/70 bg-danger-surface/90 text-danger shadow-danger-surface/60"
                        : "border-frame-gold-hi/70 bg-success-surface/90 text-title-on-wood shadow-success-surface/60"
                    }`}
                    style={{ "--turn-banner-ms": `${turnBanner.side === AI ? COMBAT_PACING.enemyTurnBannerMs : COMBAT_PACING.playerTurnBannerMs}ms` } as React.CSSProperties}
                  >
                    {turnBanner.side === AI ? "LƯỢT ĐỐI THỦ" : "ĐẾN LƯỢT BẠN"}
                  </div>
                )}
                {toast && (
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded bg-black/80 px-3 py-1.5 text-sm text-white">
                    {toast}
                  </div>
                )}
                {atBreak && (
                  <SurvivalBreakScreen
                    survival={survival!}
                    pending={pending}
                    error={toast}
                    onRefresh={() => {
                      if (!battleId) return;
                      setPending(true);
                      void fetchOnline(battleId).then((res) => {
                        setPending(false);
                        receive(state, res);
                      });
                    }}
                    onNext={(action) => sendOnline(action)}
                    onEnd={() => sendOnline({ type: "endRun" })}
                  />
                )}
                {scenario && (scenarioOver || state.winner !== null) && (
                  <CampaignResult
                    bossThreshold={bossThreshold}
                    labels={labels}
                    outcome={outcome}
                    phaseAdvanced={phaseAdvanced}
                    phaseBoss={phaseBoss}
                    scenario={scenario}
                    scenarioFailed={scenarioFailed}
                  />
                )}
                {!scenario && state.winner !== null && !atBreak && (
                  <BattleResult
                    arenaFoe={arenaFoe}
                    dailyDay={dailyDay}
                    destinyFloorNo={destinyFloorNo}
                    drop={drop}
                    expeditionMatch={expeditionMatch}
                    mode={mode}
                    online={online}
                    outcome={outcome}
                    raidBoss={raidBoss}
                    replay={replay}
                    restart={restart}
                    specialQuestId={specialQuestId}
                    state={state}
                    survival={survival}
                    towerFeatures={towerFeatures}
                  />
                )}
              </div>
            </div>

            {started && side(PLAYER, true)}

            {skillBar(false)}
            {whirlAim && (
              <div className="flex flex-wrap items-center gap-1.5 text-caption">
                {whirlAim.center &&
                  spinOptions.map(({ turns: t, matched }) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSpinPreview(null);
                        spinWhirl(t);
                      }}
                      onPointerEnter={() => setSpinPreview(t)}
                      onPointerLeave={() => setSpinPreview(null)}
                      onFocus={() => setSpinPreview(t)}
                      onBlur={() => setSpinPreview(null)}
                      className="rounded bg-info px-2 py-1 font-bold text-white"
                      aria-label={`Xoay ${Math.abs(t)} nấc ${t > 0 ? "theo" : "ngược"} chiều kim đồng hồ, ${matched.size > 0 ? `ghép được ${matched.size} ô` : "không ghép được ô nào"}`}
                    >
                      {t > 0 ? "↻" : "↺"}
                      {Math.abs(t) > 1 ? ` ×${Math.abs(t)}` : ""}
                      <span className="ml-1 font-normal opacity-90">{matched.size > 0 ? `ghép ${matched.size}` : "không ghép"}</span>
                    </button>
                  ))}
                <span className="opacity-80">{whirlHint(whirlAim)} Esc để hủy.</span>
              </div>
            )}
            {aim && (
              <p className="text-caption opacity-80">
                {pendingWhirl &&
                  `Đã chọn xoay ${pendingWhirl.turns > 0 ? "↻" : "↺"}${Math.abs(pendingWhirl.turns) > 1 ? ` ×${Math.abs(pendingWhirl.turns)}` : ""} quanh hàng ${pendingWhirl.center.row + 1}, cột ${pendingWhirl.center.col + 1}. `}
                {aim.choose && aim.target === undefined
                  ? aim.skill.target === "ally"
                    ? `Chọn đồng đội cho ${aim.skill.name} (bấm thẻ hoặc ←/→ rồi Enter). Esc để hủy.`
                    : `Chọn đối thủ nhận ${aim.skill.name} (bấm thẻ hoặc ←/→ rồi Enter). Esc để hủy.`
                  : `Chọn ô trên bàn cờ làm tâm cho ${aim.skill.name}${
                      aim.target === undefined
                        ? ""
                        : ` (nhắm ${state.sides[aim.skill.target === "ally" ? PLAYER : AI].fighters[aim.target]?.name ?? ""}; bấm thẻ khác để đổi)`
                    }. Esc để hủy.`}
              </p>
            )}
            <p className="text-caption opacity-70 md:hidden">
              Vuốt hoặc chạm hai ô kề nhau để đổi chỗ.
            </p>
            <p className="hidden text-caption opacity-70 md:block">
              Vuốt, kéo hoặc click hai ô kề nhau để đổi chỗ. Bàn phím: mũi tên
              hoặc WASD, Enter chọn ô, 1–6 dùng kỹ năng, Tab đổi người hành
              động, Esc hủy.
            </p>
          </div>

          {side(AI)}
        </div>

        {/* Giao Tranh online: chỉ giữ chọn đội nhanh và lối sang Doanh Trại (trang bị, kỹ năng chỉnh ở đó). Lúc đang đánh thì ẩn hẳn
            để bàn cờ không bị đẩy xuống. Chơi thử Tiến trình (offline) vẫn đủ panel vì hồ sơ nằm trên trình duyệt. */}
        {mode === "progress" && !(online && started && state.winner === null) && (
          <ProgressSection
            changeProfile={changeProfile}
            element={element}
            online={online}
            profession={profession}
            profile={profile}
            profileAction={profileAction}
            started={started}
            state={state}
          />
        )}

        <section
          aria-label="Nhật ký trận"
          className={`ui-frame-inset max-h-32 overflow-y-auto rounded-xl p-2 text-caption text-on-wood ${started ? "" : "hidden"}`}
        >
          {log.length === 0 ? (
            <p className="opacity-60">Nhật ký trận sẽ hiện ở đây.</p>
          ) : (
            <ul className="space-y-0.5">
              {log.map((l) => (
                <li key={l.id}>{l.text}</li>
              ))}
            </ul>
          )}
        </section>
      </OrnateFrame>
    </div>
  );
}
