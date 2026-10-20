"use client";

// Bảng tiến trình của Chơi thử và Chơi online: cấp, kinh nghiệm, điểm kỹ năng, nâng kỹ năng theo ô.
// Mọi luật nằm trong @/core/progress; ở đây chỉ hiển thị và gửi thao tác (Chơi thử áp tại chỗ, Chơi online gửi server).

import { useState } from "react";
import {
  companionById,
  heroSkills,
  MAIN_ID,
  MAIN_SLOT_UNLOCK,
  mainSkills,
  mainSlotKey,
  MAX_LEVEL,
  progressOf,
  scaleSkill,
  SKILL_MAX_LEVEL,
  totalXpFor,
  upgradeCost,
  xpToNext,
  type CharacterProgress,
  type Profile,
  type ProfileAction,
  type ProfileError,
  type SkillDef,
} from "@/core";
import { PROFESSION_NAME } from "./labels";
import { SkillIcon } from "../art/skills";

/** Thông báo lỗi của thao tác hồ sơ, dùng chung với ShopPanel. */
export const PROFILE_ERROR: Record<
  ProfileError | "network" | "conflict",
  string
> = {
  maxLevel: "Đã đạt cấp tối đa",
  notEnoughPoints: "Không đủ điểm kỹ năng",
  locked: "Chưa mở khóa",
  owned: "Đã có",
  invalidSkill: "Kỹ năng không hợp lệ",
  notEnoughGold: "Không đủ vàng",
  notOwned: "Chưa có nhân vật này",
  invalidItem: "Không có món này",
  bagFull: "Túi đồ đã đầy, bán bớt rồi mua",
  notWeapon: "Món này không phải vũ khí",
  wrongProfession: "Vũ khí không đúng nghề",
  weaponNeedsProfession: "Vũ khí phải ghi nghề",
  needThree: "Chọn đúng 3 món để ghép",
  duplicate: "Ba món phải khác nhau",
  maxTier: "Phẩm Cam đã cao nhất",
  tierMismatch: "Ba món phải cùng phẩm",
  elementMismatch: "Ba món phải cùng hệ",
  slotMismatch: "Ba món phải cùng loại ô",
  professionMismatch: "Ba vũ khí phải cùng nghề",
  foodFull: "Lương đã đầy",
  noTowerOffer: "Không có phần thưởng để chọn",
  towerBusy: "Đang có trận ở tầng này, đánh xong đã",
  alreadyCheckedIn: "Hôm nay đã điểm danh rồi",
  questNotDone: "Chưa xong",
  questClaimed: "Đã nhận thưởng",
  noQuest: "Không có nhiệm vụ này",
  network: "Mất kết nối tới server, thử lại",
  conflict: "Hồ sơ vừa đổi ở nơi khác, đã tải lại",
};

function XpBar({ p }: { p: CharacterProgress }) {
  const max = p.level >= MAX_LEVEL ? 1 : xpToNext(p.level);
  const cur = p.level >= MAX_LEVEL ? 1 : p.xp - totalXpFor(p.level);
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="font-semibold">Cấp {p.level}</span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded bg-black/20"
        role="meter"
        aria-valuenow={cur}
        aria-valuemax={max}
        aria-label="Kinh nghiệm"
      >
        <div
          className="h-full bg-amber-500"
          style={{ width: `${(cur / max) * 100}%` }}
        />
      </div>
      <span className="tabular-nums opacity-70">
        {p.level >= MAX_LEVEL ? "Tối đa" : `${cur}/${max}`}
      </span>
    </div>
  );
}

function SkillRow({
  def,
  level,
  lockedText,
  canUp,
  points,
  onUp,
  extra,
}: {
  def: SkillDef;
  level: number;
  lockedText: string | null;
  canUp: boolean;
  points: number;
  onUp?: () => void;
  extra?: React.ReactNode;
}) {
  const cost = upgradeCost(level);
  const scaled = scaleSkill(def, level);
  return (
    <li className={`flex items-center gap-2 ${lockedText ? "opacity-45" : ""}`}>
      <SkillIcon def={def} className="size-7 shrink-0" />
      <span className="min-w-0 flex-1 truncate" title={def.name}>
        {def.name}
        <span className="ml-1 opacity-60">· {scaled.cost} NL</span>
      </span>
      {extra}
      {lockedText ? (
        <span className="text-[10px]">{lockedText}</span>
      ) : (
        <>
          <span className="tabular-nums" aria-label={`Cấp kỹ năng ${level}`}>
            {"★".repeat(level)}
            <span className="opacity-30">
              {"★".repeat(SKILL_MAX_LEVEL - level)}
            </span>
          </span>
          <button
            type="button"
            disabled={!canUp || cost === null || points < cost}
            onClick={onUp}
            className="w-12 rounded bg-amber-500 px-1 py-0.5 text-[10px] font-semibold text-stone-950 disabled:opacity-30"
            title={
              cost === null
                ? "Đã tối đa"
                : `Nâng lên cấp ${level + 1}: ${cost} điểm`
            }
          >
            {cost === null ? "Tối đa" : `+ (${cost})`}
          </button>
        </>
      )}
    </li>
  );
}

/**
 * `teamIds` là đội mang vào trận (nhân vật chính và nhân vật kèm). `locked` khi đang đánh: chỉ xem,
 * không nâng kỹ năng. `onAction` trả về mã lỗi, hoặc null khi thành công. Không có `onReset`
 * thì ẩn nút đặt lại (hồ sơ trên server).
 */
export default function ProgressPanel({
  profile,
  teamIds,
  locked,
  storage,
  onAction,
  onReset,
}: {
  profile: Profile;
  teamIds: readonly string[];
  locked: boolean;
  /** Nơi lưu, hiện ở tiêu đề. */
  storage: string;
  onAction: (a: ProfileAction) => Promise<string | null>;
  onReset?: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const commit = (a: ProfileAction) => {
    setBusy(true);
    void onAction(a).then((error) => {
      setBusy(false);
      setMessage(
        error
          ? (PROFILE_ERROR[error as keyof typeof PROFILE_ERROR] ?? error)
          : null,
      );
    });
  };

  return (
    <section
      aria-label="Tiến trình"
      className="rounded-lg bg-[var(--panel)] p-2 text-xs"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Tiến trình ({storage})</h2>
        <span className="tabular-nums">Vàng: {profile.gold}</span>
        {message && <span className="text-rose-500">{message}</span>}
        {onReset && (
          <button
            type="button"
            onClick={() => {
              if (!confirmReset) return setConfirmReset(true);
              setConfirmReset(false);
              onReset();
            }}
            onBlur={() => setConfirmReset(false)}
            className="rounded bg-black/15 px-2 py-0.5"
          >
            {confirmReset ? "Bấm lần nữa để xóa" : "Đặt lại hồ sơ"}
          </button>
        )}
      </div>
      {locked && (
        <p className="mb-2 opacity-70">
          Đang trong trận: nâng kỹ năng sau khi trận kết thúc.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {teamIds.map((id) => {
          const p = progressOf(profile, id);
          const isMain = id === MAIN_ID;
          return (
            <div
              key={id}
              className="flex flex-col gap-1.5 rounded bg-black/5 p-2"
            >
              <div className="flex items-center justify-between font-semibold">
                <span>{isMain ? "Đinh Bộ Lĩnh" : companionName(id)}</span>
                <span className="font-normal tabular-nums">
                  Điểm: {p.skillPoints}
                </span>
              </div>
              <XpBar p={p} />
              <ul className="flex flex-col gap-1">
                {(isMain
                  ? mainSkills(profile.element)
                  : heroSkills(companionOf(id)!.element, id)
                ).map((def) => {
                  const slot = def.slot!;
                  const key = mainSlotKey(slot);
                  const unlock = MAIN_SLOT_UNLOCK[slot]!;
                  return (
                    <SkillRow
                      key={def.id}
                      def={def}
                      level={p.skillLevels[key] ?? 1}
                      lockedText={
                        p.level < unlock ? `Mở ở cấp ${unlock}` : null
                      }
                      canUp={!locked && !busy}
                      points={p.skillPoints}
                      onUp={() =>
                        commit({ type: "upgrade", character: id, key })
                      }
                    />
                  );
                })}
              </ul>
              {!isMain && (
                <p className="opacity-60">
                  {PROFESSION_NAME[companionProfession(id)]} · kỹ năng nâng
                  theo ô như Đinh Bộ Lĩnh, ô 5 là kỹ năng riêng.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 opacity-60">
        Lên cấp nhận 1 điểm kỹ năng. Mỗi cấp kỹ năng +10% sức mạnh; cấp{" "}
        {SKILL_MAX_LEVEL} giảm 10% năng lượng. Kỹ năng nâng theo ô nên nhân vật
        chính giữ nguyên cấp kỹ năng khi đổi nguyên tố. Đối thủ Tianwu cùng cấp với Đinh Bộ
        Lĩnh.
      </p>
    </section>
  );
}

const companionOf = (id: string) => companionById(id);
const companionProfession = (id: string) => companionOf(id)!.profession;
const companionName = (id: string) => companionOf(id)?.name ?? id;
