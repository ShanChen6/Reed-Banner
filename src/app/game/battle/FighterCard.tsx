"use client";
// Thẻ nhân vật trong trận: chân dung, thanh máu/năng lượng/tinh thần/Nộ, hiệu ứng đang có, kỹ năng và bị động.

import FighterKindIcons from "./FighterKindIcons";
import { fusionPassiveLines, fusionSummary, isFusion } from "./special-labels";

import { useEffect, useRef } from "react";
import {
  isAlive,
  PASSIVES,
  COMBO_PASSIVES,
  comboDescription,
  CHASE_PASSIVES,
  DEFAULT_SPIRIT_EXPERIMENT,
  chasePassives,
  type SpiritExperiment,
  spiritStatMultiplier,
  spiritHealMultiplier,
  type Fighter,
} from "@/core";
import {
  EFFECT_NAME,
  passiveText,
  GOOD_EFFECTS,
} from "./labels";

import {
  ELEMENT_COLOR,
  LeaderFlag,
  ShieldIcon,
} from "../art/icons";

import { Portrait } from "../art/portraits";

import { PassiveIcon, ragePassiveId } from "../art/passives";

export function Bar({
  value,
  max,
  color,
  label,
  keepValue = false,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  /** Trên điện thoại thẻ gọn chỉ còn thanh; giữ số (máu) khi cần. */
  keepValue?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className="flex items-center gap-1.5 text-caption leading-none"
      aria-label={`${label} ${Math.round(value)}/${max}`}
    >
      <span className="hidden w-7 shrink-0 opacity-70 md:block">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-black/30 md:h-2">
        <div
          className={`h-full ${color} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`${keepValue ? "" : "hidden md:block"} shrink-0 text-right tabular-nums md:w-11 lg:w-[4.5rem]`}>
        {Math.round(value)}
        <span className="hidden lg:inline">/{max}</span>
      </span>
    </div>
  );
}

export function FighterCard({
  fighter,
  experimentalSpirit = DEFAULT_SPIRIT_EXPERIMENT,
  comboTurns, comboSource, comboTarget,
  leader,
  rage,
  rageTurns = 0,
  active,
  selectable,
  targetable,
  floats,
  onClick,
}: {
  fighter: Fighter;
  experimentalSpirit?: SpiritExperiment;
  comboTurns?: number; comboSource?: string; comboTarget?: string;
  leader: boolean;
  rage: number | null;
  /** Số lượt còn lại của bị động thủ lĩnh khi đầy Nộ (chỉ thẻ thủ lĩnh). */
  rageTurns?: number;
  active: boolean;
  selectable: boolean;
  targetable: boolean;
  floats: readonly Float[];
  onClick?: () => void;
}) {
  const alive = isAlive(fighter);
  const comboBlocked = fighter.effects.some(e => e.kind === "silence" || e.kind === "freeze");
  const ref = useRef<HTMLButtonElement>(null);
  const lastFloat = floats.at(-1)?.id;

  // Rung thẻ khi trúng đòn, viền xanh khi được hồi máu.
  useEffect(() => {
    const el = ref.current;
    if (lastFloat === undefined || !el || prefersReducedMotion()) return;
    const hit = floats.some((f) => f.tone !== "heal");
    el.animate(
      hit
        ? [
            { transform: "none" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(4px)" },
            { transform: "translateX(-2px)" },
            { transform: "none" },
          ]
        : [
            { boxShadow: "none" },
            { boxShadow: "0 0 0 3px rgb(52 211 153 / 0.6)" },
            { boxShadow: "none" },
          ],
      { duration: hit ? 380 : 600, easing: "ease-in-out" },
    );
    // Chỉ chạy khi có lượt số mới, không chạy lại khi floats đổi vì số cũ hết hạn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFloat]);

  // Nội tại chỉ nằm trong tooltip; thẻ chỉ hiện buff/debuff.
  const cardTitle = [
    `Công ${fighter.atk} · Thủ ${fighter.def} · Máu tối đa ${fighter.maxHp}`,
    fusionSummary(fighter),
    isFusion(fighter)
      ? `Nội tại: ${fusionPassiveLines(fighter).map((l) => l.name).join(" · ")}`
      : fighter.comboPassive && `Nội tại · ${comboDescription(fighter)}`,
    !isFusion(fighter) &&
      fighter.chasePassives &&
      `Truy kích: ${chasePassives(fighter).map((id) => CHASE_PASSIVES[id].name).join(" · ")}`,
    `Tinh thần: Công/Thủ ${Math.round(spiritStatMultiplier(fighter.spirit, experimentalSpirit) * 100)}% · Hồi/Khiên mới ${Math.round(spiritHealMultiplier(fighter.spirit, experimentalSpirit) * 100)}%`,
  ]
    .filter(Boolean)
    .join("\n");

  const ring = targetable
    ? "ring-2 ring-stat-hp"
    : active
      ? "ring-2 ring-frame-gold-hi"
      : selectable
        ? "ring-1 ring-frame-gold-hi/40"
        : "ring-1 ring-white/10";
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={!onClick || !alive}
      className={`relative w-full min-w-0 rounded-lg border border-l-4 border-frame-line-soft bg-wood-panel p-1.5 text-left md:p-2 ${ring} ${alive ? "" : "opacity-40 grayscale"} disabled:cursor-default`}
      style={{ borderLeftColor: ELEMENT_COLOR[fighter.element] }}
      title={cardTitle}
    >
      <div className="mb-1 flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
        <Portrait
          id={fighter.id}
          element={fighter.element}
          profession={fighter.profession}
          level={fighter.level}
          className="size-8 shrink-0 md:size-7 lg:size-11"
        />
        <div className="w-full min-w-0 md:flex-1">
          <span className="flex min-w-0 items-center gap-1 text-caption font-semibold leading-tight md:text-sm">
            {leader && (
              <span title="Thủ lĩnh" className="shrink-0">
                <LeaderFlag className="size-3 md:size-4" />
              </span>
            )}
            <span className="line-clamp-2 break-words md:truncate">{fighter.name}</span>
          </span>
          <span className="hidden items-center gap-1 text-caption opacity-75 md:flex">
            <FighterKindIcons fighter={fighter} showName />
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <Bar
          label={fighter.structure ? "Độ bền" : "Máu"}
          value={fighter.hp}
          max={fighter.maxHp}
          color={fighter.structure ? "bg-frame-bronze" : "bg-stat-hp"}
          keepValue
        />
        {/* Công trình (cổng thành) không ra tay: không có năng lượng, tinh thần. */}
        {!fighter.structure && (
          <>
            <Bar label="NL" value={fighter.energy} max={100} color="bg-stat-energy" />
            <div className="hidden md:block">
              <Bar
                label="TT"
                value={fighter.spirit}
                max={100}
                color="bg-stat-spirit"
              />
            </div>
          </>
        )}
        {rage !== null && (
          <Bar label="Nộ" value={rage} max={100} color="bg-stat-rage" />
        )}
      </div>
      {(fighter.effects.length > 0 || fighter.comboReady || rageTurns > 0) && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {rageTurns > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded bg-stat-rage/40 px-1 py-0.5 text-caption"
              title={`Bị động khi đầy Nộ · ${passiveText(fighter.element)} · còn ${rageTurns} lượt`}
            >
              <PassiveIcon id={ragePassiveId(fighter.element)} name={PASSIVES[fighter.element].name} className="size-3.5" />
              {PASSIVES[fighter.element].name} · {rageTurns}
            </span>
          )}
          {fighter.comboReady && fighter.comboPassive && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1 py-0.5 text-caption ${comboBlocked ? "bg-ash/50" : "bg-frame-bronze/40"}`}
              title={`Do ${comboSource} mở${comboTarget ? ` · mục tiêu ${comboTarget}` : ""} · ${comboTurns ? `${comboTurns} lượt thường kế tiếp` : "lượt hiện tại"}. Chọn hành động để tận dụng.`}
            >
              <PassiveIcon id={fighter.comboPassive} name={COMBO_PASSIVES[fighter.comboPassive].name} className="size-3.5" />
              {COMBO_PASSIVES[fighter.comboPassive].name}
              {comboBlocked ? " · bị chặn" : ""}
            </span>
          )}
          {fighter.effects.map((e) => (
            <span
              key={e.kind}
              className={`rounded px-1 py-0.5 text-caption ${GOOD_EFFECTS.includes(e.kind) ? "bg-stat-spirit/40" : "bg-stat-hp/40"}`}
            >
              {EFFECT_NAME[e.kind]}
              {e.kind === "shield"
                ? ` ${Math.round(e.value)}`
                : e.turns !== null
                  ? ` ${e.turns}`
                  : ""}
            </span>
          ))}
        </div>
      )}
      {floats.map((f) => (
        <span
          key={f.id}
          aria-hidden
          className={`float-up pointer-events-none absolute right-2 top-1 flex items-center gap-0.5 text-lg font-extrabold tabular-nums drop-shadow ${FLOAT_TONE[f.tone]}`}
          style={{ animationDelay: `${f.order * FLOAT_STAGGER_MS}ms` }}
        >
          {f.tone === "shield" && <ShieldIcon className="size-4" />}
          {f.text}
        </span>
      ))}
    </button>
  );
}

/** Số sát thương/hồi máu bay lên trên thẻ nhân vật. */
export interface Float {
  readonly id: number;
  readonly side: number;
  readonly fighter: number;
  readonly text: string;
  readonly tone: "damage" | "shield" | "heal";
  /** Thứ tự trong cùng thẻ, để các số nối đuôi nhau thay vì chồng lên nhau. */
  readonly order: number;
}

export const FLOAT_STAGGER_MS = 160;

export const FLOAT_TONE: Record<Float["tone"], string> = {
  damage: "text-stat-hp",
  shield: "text-stat-shield",
  heal: "text-stat-spirit",
};

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
