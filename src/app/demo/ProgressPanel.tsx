"use client";

// Bảng tiến trình của /demo và /play: cấp, kinh nghiệm, điểm kỹ năng, nâng kỹ năng, mua và chọn chiêu nhánh,
// tuyệt chiêu nấc 3.
// Mọi luật nằm trong @/core/progress; ở đây chỉ hiển thị và gửi thao tác (/demo áp tại chỗ, /play gửi server).

import { useState } from "react";
import {
  BRANCH_COST,
  BRANCH_UNLOCK_LEVEL,
  MAIN_ID,
  MAIN_SLOT_UNLOCK,
  mainSkills,
  mainSlotKey,
  MAX_LEVEL,
  professionSkills,
  progressOf,
  scaleSkill,
  SKILL_MAX_LEVEL,
  STARTER_COMPANIONS,
  totalXpFor,
  ULTIMATE_UNLOCK_LEVEL,
  ultimateOf,
  upgradeCost,
  xpToNext,
  type CharacterProgress,
  type Profile,
  type ProfileAction,
  type ProgressError,
  type SkillDef,
} from "@/core";
import { PROFESSION_NAME } from "./labels";
import { SkillIcon } from "./art/skills";

const ERROR: Record<ProgressError | "network" | "conflict", string> = {
  maxLevel: "Đã đạt cấp tối đa",
  notEnoughPoints: "Không đủ điểm kỹ năng",
  locked: "Chưa mở khóa",
  owned: "Đã có",
  invalidSkill: "Kỹ năng không hợp lệ",
  network: "Mất kết nối tới server, thử lại",
  conflict: "Hồ sơ vừa đổi ở nơi khác, đã tải lại",
};

function XpBar({ p }: { p: CharacterProgress }) {
  const max = p.level >= MAX_LEVEL ? 1 : xpToNext(p.level);
  const cur = p.level >= MAX_LEVEL ? 1 : p.xp - totalXpFor(p.level);
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="font-semibold">Cấp {p.level}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded bg-black/20" role="meter" aria-valuenow={cur} aria-valuemax={max} aria-label="Kinh nghiệm">
        <div className="h-full bg-amber-500" style={{ width: `${(cur / max) * 100}%` }} />
      </div>
      <span className="tabular-nums opacity-70">{p.level >= MAX_LEVEL ? "Tối đa" : `${cur}/${max}`}</span>
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
            <span className="opacity-30">{"★".repeat(SKILL_MAX_LEVEL - level)}</span>
          </span>
          <button
            type="button"
            disabled={!canUp || cost === null || points < cost}
            onClick={onUp}
            className="w-12 rounded bg-amber-500 px-1 py-0.5 text-[10px] font-semibold text-stone-950 disabled:opacity-30"
            title={cost === null ? "Đã tối đa" : `Nâng lên cấp ${level + 1}: ${cost} điểm`}
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
 * không nâng hay đổi chiêu nhánh. `onAction` trả về mã lỗi, hoặc null khi thành công. Không có `onReset`
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
      setMessage(error ? (ERROR[error as keyof typeof ERROR] ?? error) : null);
    });
  };

  return (
    <section aria-label="Tiến trình" className="rounded-lg bg-[var(--panel)] p-2 text-xs">
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
      {locked && <p className="mb-2 opacity-70">Đang trong trận: nâng kỹ năng và đổi chiêu nhánh sau khi trận kết thúc.</p>}
      <div className="grid gap-3 md:grid-cols-3">
        {teamIds.map((id) => {
          const p = progressOf(profile, id);
          const isMain = id === MAIN_ID;
          const ultimate = isMain ? undefined : ultimateOf(id);
          const companion = isMain ? null : [...professionSkills(companionProfession(id)), ...(ultimate ? [ultimate] : [])];
          return (
            <div key={id} className="flex flex-col gap-1.5 rounded bg-black/5 p-2">
              <div className="flex items-center justify-between font-semibold">
                <span>{isMain ? "Đinh Bộ Lĩnh" : companionName(id)}</span>
                <span className="font-normal tabular-nums">Điểm: {p.skillPoints}</span>
              </div>
              <XpBar p={p} />
              <ul className="flex flex-col gap-1">
                {isMain
                  ? mainSkills(profile.element).map((def) => {
                      const slot = def.slot!;
                      const key = mainSlotKey(slot);
                      const unlock = MAIN_SLOT_UNLOCK[slot]!;
                      return (
                        <SkillRow
                          key={def.id}
                          def={def}
                          level={p.skillLevels[key] ?? 1}
                          lockedText={p.level < unlock ? `Mở ở cấp ${unlock}` : null}
                          canUp={!locked && !busy}
                          points={p.skillPoints}
                          onUp={() => commit({ type: "upgrade", character: id, key })}
                        />
                      );
                    })
                  : companion!.map((def) => {
                      const owned = def.tier === 1 || p.branches.includes(def.id);
                      const chosen = profile.branchChoice[id] ?? p.branches[0];
                      return (
                        <SkillRow
                          key={def.id}
                          def={def}
                          level={p.skillLevels[def.id] ?? 1}
                          lockedText={
                            def.tier === 3
                              ? p.level < ULTIMATE_UNLOCK_LEVEL
                                ? `Tuyệt chiêu, mở ở cấp ${ULTIMATE_UNLOCK_LEVEL}`
                                : null
                              : owned
                                ? null
                                : p.level < BRANCH_UNLOCK_LEVEL
                                  ? `Mở ở cấp ${BRANCH_UNLOCK_LEVEL}`
                                  : null
                          }
                          canUp={!locked && !busy}
                          points={p.skillPoints}
                          onUp={() => commit({ type: "upgrade", character: id, key: def.id })}
                          extra={
                            def.tier === 2 &&
                            (owned ? (
                              <button
                                type="button"
                                disabled={locked || busy}
                                aria-pressed={chosen === def.id}
                                onClick={() => commit({ type: "chooseBranch", character: id, skill: def.id })}
                                className={`rounded px-1.5 py-0.5 text-[10px] ${chosen === def.id ? "bg-emerald-600 text-white" : "bg-black/15"}`}
                                title="Mỗi trận mang 1 chiêu nhánh"
                              >
                                {chosen === def.id ? "Mang" : "Chọn"}
                              </button>
                            ) : (
                              p.level >= BRANCH_UNLOCK_LEVEL && (
                                <button
                                  type="button"
                                  disabled={locked || busy || p.skillPoints < BRANCH_COST}
                                  onClick={() => commit({ type: "buyBranch", character: id, skill: def.id })}
                                  className="rounded bg-sky-700 px-1.5 py-0.5 text-[10px] text-white disabled:opacity-30"
                                >
                                  Mua ({BRANCH_COST})
                                </button>
                              )
                            ))
                          }
                        />
                      );
                    })}
              </ul>
              {!isMain && (
                <p className="opacity-60">
                  {PROFESSION_NAME[companionProfession(id)]} · chiêu nhánh nấc 2 mua từ cấp {BRANCH_UNLOCK_LEVEL}, mỗi trận mang 1; tuyệt chiêu
                  nấc 3 tự mở ở cấp {ULTIMATE_UNLOCK_LEVEL}.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 opacity-60">
        Lên cấp nhận 1 điểm kỹ năng. Mỗi cấp kỹ năng +10% sức mạnh; cấp {SKILL_MAX_LEVEL} giảm 10% năng lượng. Kỹ năng nhân vật
        chính nâng theo ô nên giữ nguyên khi đổi nguyên tố. Đối thủ Tianwu cùng cấp với Đinh Bộ Lĩnh.
      </p>
    </section>
  );
}

const companionOf = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id);
const companionProfession = (id: string) => companionOf(id)!.profession;
const companionName = (id: string) => companionOf(id)?.name ?? id;
