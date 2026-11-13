"use client";
// Lớp phủ kết thúc trận (trừ nhiệm vụ Bình Loạn): thắng/thua, thưởng, đồ rơi, kết quả từng chế độ, nút chơi tiếp.

import {
  companionById,
  RAID_TIER_INFO,
  raidBossById,
  specialQuestById,
  type BattleState,
  type SurvivalView,
  type GearItem,
} from "@/core";
import {
  gearText,
  TIER_CLASS,
} from "./labels";

import { GearIcon } from "../art/gear";

import { SceneLink } from "../SceneContext";

import { buttonVariants } from "@/components/ui";

import {
  PLAYER,
  type DemoMode,
  type Outcome,
} from "./demoSetup";
import { fighterName } from "./battleLog";

export interface BattleResultProps {
  readonly arenaFoe: { readonly name: string; readonly rating: number } | null;
  readonly dailyDay: string | null;
  readonly destinyFloorNo: number | null;
  readonly drop: GearItem | null;
  readonly expeditionMatch: boolean;
  readonly mode: DemoMode;
  readonly online: boolean;
  readonly outcome: Outcome | null;
  readonly raidBoss: string | null;
  readonly replay: () => void;
  readonly restart: () => void;
  readonly specialQuestId: string | null;
  readonly state: BattleState;
  readonly survival: SurvivalView | null;
  readonly towerFeatures: { readonly trial: boolean; readonly destiny: boolean };
}

export function BattleResult({
  arenaFoe,
  dailyDay,
  destinyFloorNo,
  drop,
  expeditionMatch,
  mode,
  online,
  outcome,
  raidBoss,
  replay,
  restart,
  specialQuestId,
  state,
  survival,
  towerFeatures,
}: BattleResultProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-wood-lo/90 text-on-wood">
      <p className="text-xl font-bold">
        {survival
          ? state.winner === PLAYER
            ? "Dừng lại, ghi điểm"
            : "Cả đội đã gục"
          : state.winner === PLAYER
            ? "Bạn thắng!"
            : "Bạn thua"}
      </p>
      {raidBoss && raidBossById(raidBoss) && (
        <p className="max-w-sm text-center text-sm text-on-wood-soft italic">
          {raidBossById(raidBoss)!.foes[0]!.name}: “
          {state.winner === PLAYER
            ? raidBossById(raidBoss)!.lines.win
            : raidBossById(raidBoss)!.lines.lose}
          ”
        </p>
      )}
      {specialQuestId && specialQuestById(specialQuestId) && (
        <p className="max-w-sm text-center text-sm text-on-wood-soft italic">
          {companionById(specialQuestId)?.name}: “
          {state.winner === PLAYER
            ? specialQuestById(specialQuestId)!.lines.win
            : specialQuestById(specialQuestId)!.lines.lose}
          ”
        </p>
      )}
      {(!online || outcome) && (
        <p className="text-sm">
          {drop ? (
            <>
              <span className="flex items-center gap-2">
                <GearIcon
                  slot={drop.slot}
                  element={drop.element}
                  tier={drop.tier}
                  set={drop.set}
                  profession={drop.profession}
                  className="size-12 shrink-0"
                />
                <span>
                  Chiến lợi phẩm:{" "}
                  <span
                    className={`font-semibold ${TIER_CLASS[drop.tier]}`}
                  >
                    {gearText(drop)}
                  </span>
                </span>
              </span>
            </>
          ) : outcome && outcome.soldFor > 0 ? (
            `Túi đồ đầy: món rơi được bán ngay, +${outcome.soldFor} vàng.`
          ) : (
            "Không rơi trang bị."
          )}
        </p>
      )}
      {outcome && (
        <div className="text-center text-sm">
          <p>
            +{outcome.rewards.xp[0]} kinh nghiệm mỗi người · +
            {outcome.rewards.gold} vàng
          </p>
          {outcome.destiny && (
            <p className={`font-semibold ${outcome.destiny.won ? "text-frame-gold" : "text-danger"}`}>
              {outcome.destiny.completed
                ? `Thiên Mệnh: đã vượt tầng ${outcome.destiny.floor}, tầng cuối của tháp. Lượt leo hoàn thành.`
                : outcome.destiny.won
                ? `Thiên Mệnh: đã vượt tầng ${outcome.destiny.floor}. Hãy chọn một phần thưởng.`
                : `Thiên Mệnh: đội hình gục ở tầng ${outcome.destiny.floor}. Lượt leo kết thúc tại đây.`}
            </p>
          )}
          {outcome.expedition && (
            <p className={`font-semibold ${outcome.expedition.won ? "text-frame-gold" : "text-danger"}`}>
              {outcome.expedition.phase === "won"
                ? `Viễn Chinh: đã chiếm thành đích! ${"★".repeat(outcome.expedition.end?.stars ?? 1)} +${outcome.expedition.end?.gold ?? 0} vàng${outcome.expedition.end?.firstClear ? " (lần đầu)" : ""}.`
                : outcome.expedition.phase === "lost"
                  ? "Viễn Chinh: hết ngày hành quân, lượt viễn chinh kết thúc."
                  : outcome.expedition.won
                    ? "Viễn Chinh: đã chiếm ô. Về sa bàn để đi tiếp."
                    : "Viễn Chinh: đạo quân thua, rút về ô cũ để nghỉ sức."}
            </p>
          )}
          {outcome.daily && (
            <p className="font-semibold text-frame-gold">
              Nhật Lệnh:{" "}
              {outcome.daily.score.won
                ? `thắng sau ${outcome.daily.score.turns} lượt`
                : "thua"}
              {outcome.daily.rank !== null &&
                `, hạng ${outcome.daily.rank} hôm nay`}
              .
            </p>
          )}
          {outcome.arena && (
            <p
              className={`font-semibold ${outcome.arena.won ? "text-frame-gold" : "text-danger"}`}
            >
              Quần Hùng: {outcome.arena.won ? "thắng" : "thua"}{" "}
              {outcome.arena.opponent},{" "}
              {outcome.arena.delta >= 0 ? "+" : "−"}
              {Math.abs(outcome.arena.delta)} điểm
              {outcome.arena.rating !== null &&
                ` (còn ${outcome.arena.rating})`}
              {outcome.arena.gold > 0 &&
                `, +${outcome.arena.gold} vàng thắng trận`}
              .
            </p>
          )}
          {outcome.survival && (
            <p className="font-semibold text-frame-gold">
              Vượt qua {outcome.survival.cleared} đợt
              {outcome.survival.gold > 0 &&
                `, +${outcome.survival.gold} vàng theo đợt`}
              .{outcome.survival.newBest && " Kỷ lục mới!"}
            </p>
          )}
          {outcome.specialQuest?.joined && (
            <p className="font-semibold text-frame-gold">
              {fighterName(outcome.specialQuest.id)} gia nhập đội ở cấp 1!
            </p>
          )}
          {outcome.raid?.firstClear && (
            <p className="font-semibold text-frame-gold">
              Thắng {RAID_TIER_INFO[outcome.raid.tier].name} lần
              đầu: +{outcome.raid.bonusGold} vàng
              {outcome.raid.item
                ? ` · ${gearText(outcome.raid.item)}`
                : outcome.raid.soldFor > 0
                  ? ` · túi đầy, món thưởng bán được ${outcome.raid.soldFor} vàng`
                  : ""}
            </p>
          )}
          {outcome.levelUps.map((u) => (
            <p
              key={u.id}
              className="font-semibold text-frame-gold"
            >
              {fighterName(u.id)} lên cấp {u.level}!
            </p>
          ))}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {!online && (
          <a
            href="/game"
            target="_blank"
            rel="noopener"
            className={buttonVariants({ size: "sm" })}
          >
            Lưu tiến độ &amp; chơi Bình Loạn
          </a>
        )}
        {destinyFloorNo !== null && towerFeatures.destiny && (
          <SceneLink
            scene="DESTINY"
            className={buttonVariants({ size: "sm" })}
          >
            {outcome?.destiny?.won && !outcome.destiny.completed ? "Chọn thưởng Thiên Mệnh" : "Về Tháp Thiên Mệnh"}
          </SceneLink>
        )}
        {expeditionMatch && (
          <SceneLink
            scene="EXPEDITION"
            className={buttonVariants({ size: "sm" })}
          >
            Về sa bàn Viễn Chinh
          </SceneLink>
        )}
        {dailyDay && (
          <SceneLink
            scene="DAILY"
            className={buttonVariants({ size: "sm" })}
          >
            Xem bảng xếp hạng
          </SceneLink>
        )}
        {arenaFoe && (
          <SceneLink
            scene="ARENA"
            className={buttonVariants({ size: "sm" })}
          >
            Về Quần Hùng
          </SceneLink>
        )}
        {survival && (
          <SceneLink
            scene="SURVIVAL"
            className={buttonVariants({ size: "sm" })}
          >
            Về Trấn Ải
          </SceneLink>
        )}
        {specialQuestId && (
          <SceneLink
            scene="QUESTS"
            className={buttonVariants({ size: "sm" })}
          >
            Về nhiệm vụ
          </SceneLink>
        )}
        {raidBoss && (
          <SceneLink
            scene="CAMPAIGN"
            className={buttonVariants({ size: "sm" })}
          >
            Về Bình Loạn
          </SceneLink>
        )}
        {!online && mode === "practice" && (
          <button
            type="button"
            onClick={replay}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Chơi lại
          </button>
        )}
        <button
          type="button"
          onClick={restart}
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          {mode === "progress"
            ? "Nâng kỹ năng & đánh tiếp"
            : "Đổi đội hình"}
        </button>
      </div>
    </div>
  );
}
