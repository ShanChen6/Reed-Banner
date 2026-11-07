"use client";

// Vùng phải của tab Tướng sĩ: tên, cấp, hệ, nghề và trạng thái đội hình; tranh nhân vật với 9 ô trang bị quanh;
// ba thẻ Tổng quan / Kỹ năng / Chi tiết. Mọi số lấy từ @/core (profileTeam, gearStats…); ở đây không có công thức
// riêng. Bấm ô trang bị mở GearPicker cho đúng ô đó.

import { useState } from "react";
import {
  activeBonuses,
  characterSkills,
  dinhBoLinhUltimate,
  equippedItems,
  getGearSet,
  loadoutOf,
  MAIN_ID,
  MAIN_SLOT_UNLOCK,
  mainSlotKey,
  MAX_LEVEL,
  personalSkillOf,
  PROFESSION_COMBO,
  profileTeam,
  progressOf,
  scaleSkill,
  SKILL_MAX_LEVEL,
  totalXpFor,
  upgradeCost,
  xpToNext,
  type ActiveBonus,
  type FighterConfig,
  type GearItem,
  type GearSlot,
  type GearStat,
  type NonWeaponSlot,
  type Profile,
  type ProfileAction,
  type SkillDef,
} from "@/core";
import { EmptySlotIcon, GearIcon, SetEmblem } from "../art/gear";
import { ElementIcon, ELEMENT_COLOR, ProfessionIcon } from "../art/icons";
import { ProfileArt } from "../art/ProfileArt";
import { ELEMENT_NAME, gearText, PROFESSION_NAME, skillText, SLOT_NAME, TIER_CLASS } from "../battle/labels";
import { SkillIcon } from "../art/skills";
import SkillDetails from "../battle/SkillDetails";
import { BackGlyph, InfoGlyph, PlusGlyph, TeamGlyph } from "./glyphs";
import { nameOf } from "./roster";

/** Ô trang bị hai bên tranh; vũ khí đứng giữa phía dưới. Đúng 9 ô như luật trang bị. */
export const LEFT_SLOTS: readonly NonWeaponSlot[] = ["dinhMao", "yPhuc", "hoThu", "baoNgoa"];
export const RIGHT_SLOTS: readonly NonWeaponSlot[] = ["gioiChi", "hangLien", "hoPhu", "ngocBoi"];

export const STAT_NAME: Record<GearStat, string> = { maxHp: "Máu", atk: "Công", def: "Thủ" };

/** Cấu hình vào trận của một nhân vật theo hồ sơ, có hoặc không tính trang bị. */
export function fighterOf(profile: Profile, id: string, withGear = true): FighterConfig {
  const p = withGear ? profile : { ...profile, loadouts: {} };
  return id === MAIN_ID ? profileTeam(p)[0]! : profileTeam(p, [id])[1]!;
}

/** Món đang mặc ở một ô (vũ khí theo nghề hiện tại). */
export function slotItem(profile: Profile, id: string, slot: GearSlot, profession: FighterConfig["profession"]): GearItem | undefined {
  const loadout = loadoutOf(profile, id);
  return slot === "vuKhi" ? loadout.weapons[profession] : loadout.slots[slot as NonWeaponSlot];
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function bonusText(b: ActiveBonus): string {
  const what = b.kind === "set" ? `Bộ ${getGearSet(b.id)?.name ?? b.id}` : `Cộng hưởng ${ELEMENT_NAME[b.id as keyof typeof ELEMENT_NAME]}`;
  const parts = (Object.entries(b.bonus) as [GearStat, number][]).map(([s, v]) => `${STAT_NAME[s]} +${pct(v)}`);
  return `${what} (${b.level} món): ${parts.join(", ")}`;
}

type Sub = "overview" | "skills" | "details";
const SUBS: readonly { id: Sub; name: string }[] = [
  { id: "overview", name: "Tổng quan" },
  { id: "skills", name: "Kỹ năng" },
  { id: "details", name: "Chi tiết" },
];

export default function HeroDetail({
  profile,
  id,
  busy,
  onAction,
  openSlot,
  onOpenSlot,
  onBack,
}: {
  profile: Profile;
  id: string;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
  /** Ô đang mở bảng chọn đồ (để tô viền). */
  openSlot: GearSlot | null;
  onOpenSlot: (slot: GearSlot) => void;
  /** Điện thoại: quay lại danh sách. */
  onBack?: () => void;
}) {
  const [sub, setSub] = useState<Sub>("overview");
  const fighter = fighterOf(profile, id);
  const bare = fighterOf(profile, id, false);
  const progress = progressOf(profile, id);
  const worn = equippedItems(loadoutOf(profile, id), fighter.profession);
  const name = nameOf(id);

  const slot = (s: GearSlot) => (
    <GearSlotButton
      key={s}
      slot={s}
      item={slotItem(profile, id, s, fighter.profession)}
      element={fighter.element}
      profession={fighter.profession}
      selected={openSlot === s}
      onClick={() => onOpenSlot(s)}
    />
  );

  return (
    <div className="flex flex-col">
      {onBack && (
        <button type="button" onClick={onBack} className="barracks-btn mb-2 flex min-h-11 items-center gap-2 self-start rounded-md px-3 text-[15px] lg:hidden">
          <BackGlyph className="size-5" /> Danh sách tướng sĩ
        </button>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--bk-line-soft)] pb-3">
        <h2 className="barracks-title mr-1 min-w-0 font-serif text-2xl font-bold break-words sm:text-[1.7rem]">{name}</h2>
        <span className="barracks-pill">Cấp {progress.level}</span>
        <span className="barracks-pill">
          <ElementIcon element={fighter.element} className="size-4" /> {ELEMENT_NAME[fighter.element]}
        </span>
        <span className="barracks-pill">
          <ProfessionIcon profession={fighter.profession} className="size-4" /> {PROFESSION_NAME[fighter.profession]}
        </span>
        <div className="ml-auto">
          <TeamControl profile={profile} id={id} busy={busy} onAction={onAction} />
        </div>
      </div>

      {/* Tranh và 9 ô: khung cao cố định nên đổi nhân vật không làm nhảy bố cục. */}
      <div
        className="barracks-stage relative mt-3 grid h-[clamp(18rem,42vh,26rem)] grid-cols-[auto_minmax(0,1fr)_auto] gap-2 rounded-lg p-2 sm:gap-3 sm:p-3"
        style={{ ["--stage-tint" as string]: `${ELEMENT_COLOR[fighter.element]}66` }}
      >
        <div className="z-10 flex flex-col justify-between" aria-label="Ô trang bị bên trái">
          {LEFT_SLOTS.map(slot)}
        </div>
        <div className="flex min-h-0 min-w-0 flex-col items-center gap-2">
          <div className="relative flex min-h-0 w-full flex-1 items-end justify-center">
            <ProfileArt
              key={id}
              id={id}
              element={fighter.element}
              profession={fighter.profession}
              className="barracks-art absolute inset-0 m-auto size-full object-contain object-bottom drop-shadow-[0_8px_14px_#000c]"
              fallbackClassName="relative mb-4 size-40 drop-shadow-[0_6px_10px_#000c] sm:size-48"
            />
          </div>
          {slot("vuKhi")}
        </div>
        <div className="z-10 flex flex-col justify-between" aria-label="Ô trang bị bên phải">
          {RIGHT_SLOTS.map(slot)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5" role="tablist" aria-label={`Thông tin ${name}`}>
        {SUBS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`hero-sub-${t.id}`}
            aria-selected={sub === t.id}
            aria-controls="hero-sub-panel"
            onClick={() => setSub(t.id)}
            className={`barracks-tab min-h-10 pointer-coarse:min-h-11 rounded-md px-2 font-serif text-[15px] font-semibold sm:text-base ${sub === t.id ? "is-on" : ""}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div id="hero-sub-panel" role="tabpanel" aria-labelledby={`hero-sub-${sub}`} className="mt-3">
        {sub === "overview" && <Overview profile={profile} id={id} fighter={fighter} bare={bare} worn={worn} />}
        {sub === "skills" && <Skills profile={profile} id={id} fighter={fighter} busy={busy} onAction={onAction} />}
        {sub === "details" && <Details profile={profile} id={id} fighter={fighter} bare={bare} worn={worn} />}
      </div>
    </div>
  );
}

function TeamControl({
  profile,
  id,
  busy,
  onAction,
}: {
  profile: Profile;
  id: string;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
}) {
  const [open, setOpen] = useState<string | null>(null);
  if (id === MAIN_ID)
    return (
      <span className="barracks-pill is-gold">
        <TeamGlyph className="size-4" /> Chủ tướng · luôn ra trận
      </span>
    );
  if (profile.team.includes(id))
    return (
      <span className="barracks-pill is-gold">
        <TeamGlyph className="size-4" /> Đang trong đội hình
      </span>
    );
  if (open !== id)
    return (
      <button type="button" disabled={busy} onClick={() => setOpen(id)} className="barracks-btn is-action flex min-h-10 pointer-coarse:min-h-11 items-center gap-1.5 rounded-md px-3 text-[15px] disabled:opacity-50">
        <PlusGlyph className="size-4" /> Thêm vào đội hình
      </button>
    );
  // Đội 3vs3 luôn đủ 2 nhân vật kèm, nên thêm người là thay một người đang ra trận.
  return (
    <div role="group" aria-label="Chọn người được thay" className="flex flex-wrap items-center gap-1.5 text-sm">
      <span className="text-[var(--bk-soft)]">Thay cho:</span>
      {profile.team.map((t, i) => (
        <button
          key={t}
          type="button"
          disabled={busy}
          onClick={() =>
            void onAction({ type: "chooseTeam", companions: profile.team.map((x, j) => (j === i ? id : x)) }).then((e) => {
              if (!e) setOpen(null);
            })
          }
          className="barracks-btn min-h-10 pointer-coarse:min-h-11 rounded-md px-3 disabled:opacity-50"
        >
          {nameOf(t)}
        </button>
      ))}
      <button type="button" onClick={() => setOpen(null)} className="min-h-10 pointer-coarse:min-h-11 rounded-md px-2 text-[var(--bk-soft)] hover:text-on-wood">
        Hủy
      </button>
    </div>
  );
}

export function GearSlotButton({
  slot,
  item,
  profession,
  selected,
  onClick,
  size = "size-12 sm:size-14",
}: {
  slot: GearSlot;
  item: GearItem | undefined;
  element: FighterConfig["element"];
  profession: FighterConfig["profession"];
  selected: boolean;
  onClick: () => void;
  size?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={item ? `${SLOT_NAME[slot]}: ${gearText(item)}. Bấm để thay hoặc tháo` : `${SLOT_NAME[slot]}: trống. Bấm để chọn đồ`}
      title={item ? gearText(item) : `${SLOT_NAME[slot]}: trống`}
      className={`gear-slot relative flex items-center justify-center rounded-lg p-0.5 ${item ? "" : "is-empty"} ${selected ? "is-selected" : ""}`}
    >
      {item ? (
        <GearIcon
          slot={slot}
          element={item.element}
          tier={item.tier}
          set={item.set}
          profession={slot === "vuKhi" ? (item.profession ?? profession) : undefined}
          className={size}
        />
      ) : (
        <EmptySlotIcon slot={slot} className={size} />
      )}
      {!item && <PlusGlyph className="absolute right-1 bottom-1 size-3.5 text-[var(--bk-soft)]" />}
    </button>
  );
}

function Meter({ label, value, max, text }: { label: string; value: number; max: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[15px] text-[var(--bk-soft)]">{label}</span>
      <div role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/50 shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-frame-bronze to-frame-gold-hi" style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%` }} />
      </div>
      <span className="min-w-20 text-right text-[15px] text-on-wood tabular-nums">{text}</span>
    </div>
  );
}

function StatCard({ label, value, bonus }: { label: string; value: number | string; bonus?: number }) {
  return (
    <div className="barracks-inset rounded-md px-3 py-2">
      <dt className="text-sm text-[var(--bk-soft)]">{label}</dt>
      <dd className="font-serif text-xl font-bold text-title-on-wood tabular-nums">
        {value}
        {bonus !== undefined && bonus > 0 && <span className="ml-1.5 text-sm font-semibold text-success">+{bonus}</span>}
      </dd>
    </div>
  );
}

function Overview({ profile, id, fighter, bare, worn }: { profile: Profile; id: string; fighter: FighterConfig; bare: FighterConfig; worn: readonly GearItem[] }) {
  const p = progressOf(profile, id);
  const maxed = p.level >= MAX_LEVEL;
  const xpMax = maxed ? 1 : xpToNext(p.level);
  const xpNow = maxed ? 1 : p.xp - totalXpFor(p.level);
  const bonuses = activeBonuses(worn);
  return (
    <div className="flex flex-col gap-3">
      <Meter label="Kinh nghiệm" value={xpNow} max={xpMax} text={maxed ? "Cấp tối đa" : `${xpNow} / ${xpMax}`} />
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Máu" value={fighter.maxHp} bonus={fighter.maxHp - bare.maxHp} />
        <StatCard label="Công (ATK)" value={fighter.atk} bonus={fighter.atk - bare.atk} />
        <StatCard label="Thủ (DEF)" value={fighter.def} bonus={fighter.def - bare.def} />
        <StatCard label="Trang bị" value={`${worn.length}/9`} />
      </dl>
      {bonuses.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-success" aria-label="Thưởng bộ và cộng hưởng đang kích hoạt">
          {bonuses.map((b) => (
            <li key={`${b.kind}-${b.id}-${b.level}`} className="flex items-center gap-1.5">
              {b.kind === "set" ? <SetEmblem set={b.id} className="size-5 shrink-0" /> : "✦"} {bonusText(b)}
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--bk-soft)]">
        <InfoGlyph className="size-4" /> Chọn ô trang bị để thay, tháo hoặc so sánh. Điểm kỹ năng: {p.skillPoints}
      </p>
    </div>
  );
}

function Skills({
  profile,
  id,
  fighter,
  busy,
  onAction,
}: {
  profile: Profile;
  id: string;
  fighter: FighterConfig;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
}) {
  const p = progressOf(profile, id);
  const defs = characterSkills(fighter.profession, fighter.element, id);
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[var(--bk-soft)]">Kỹ năng nâng theo ô; lên cấp nhận 1 điểm.</span>
        <span className="barracks-pill">Điểm kỹ năng: {p.skillPoints}</span>
      </p>
      <ul className="flex flex-col gap-2" aria-label={`Kỹ năng của ${nameOf(id)}`}>
        {defs.map((def) => {
          const slot = def.slot!;
          const unlock = MAIN_SLOT_UNLOCK[slot]!;
          return (
            <SkillLine
              key={def.id}
              def={def}
              level={p.skillLevels[mainSlotKey(slot)] ?? 1}
              unlock={p.level < unlock ? unlock : null}
              disabled={busy}
              points={p.skillPoints}
              onUp={() => void onAction({ type: "upgrade", character: id, key: mainSlotKey(slot) })}
            />
          );
        })}
      </ul>
      <SkillDetails
        fighter={fighter}
        passive={fighter.comboPassive ?? PROFESSION_COMBO[fighter.profession]}
        skills={defs.map((d) => scaleSkill(d, p.skillLevels[mainSlotKey(d.slot!)] ?? 1))}
      />
    </div>
  );
}

/** Một kỹ năng: hình, tên, năng lượng, cấp sao và nút nâng (giá theo upgradeCost của @/core). */
function SkillLine({
  def,
  level,
  unlock,
  disabled,
  points,
  onUp,
}: {
  def: SkillDef;
  level: number;
  unlock: number | null;
  disabled: boolean;
  points: number;
  onUp: () => void;
}) {
  const cost = upgradeCost(level);
  const scaled = scaleSkill(def, level);
  return (
    <li className={`barracks-inset flex items-center gap-3 rounded-md px-2.5 py-2 ${unlock ? "opacity-55" : ""}`}>
      <SkillIcon def={def} className="size-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug font-semibold text-title-on-wood">
          {def.name} <span className="text-sm font-normal text-[var(--bk-soft)]">· ô {def.slot} · {scaled.cost} NL</span>
        </p>
        <p className="line-clamp-2 text-sm text-[var(--bk-soft)]" title={skillText(scaled)}>
          {skillText(scaled)}
        </p>
      </div>
      {unlock ? (
        <span className="shrink-0 text-sm text-[var(--bk-soft)]">Mở ở cấp {unlock}</span>
      ) : (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm text-frame-gold tabular-nums" aria-label={`Cấp kỹ năng ${level}/${SKILL_MAX_LEVEL}`}>
            {"★".repeat(level)}
            <span className="text-ash">{"★".repeat(SKILL_MAX_LEVEL - level)}</span>
          </span>
          <button
            type="button"
            disabled={disabled || cost === null || points < cost}
            onClick={onUp}
            aria-label={cost === null ? `${def.name} đã tối đa` : `Nâng ${def.name} lên cấp ${level + 1}, tốn ${cost} điểm`}
            className="barracks-btn min-h-9 pointer-coarse:min-h-11 rounded-md px-2.5 text-sm whitespace-nowrap disabled:opacity-45"
          >
            {cost === null ? "Tối đa" : `Nâng · ${cost} điểm`}
          </button>
        </div>
      )}
    </li>
  );
}

function Details({ profile, id, fighter, bare, worn }: { profile: Profile; id: string; fighter: FighterConfig; bare: FighterConfig; worn: readonly GearItem[] }) {
  const p = progressOf(profile, id);
  const ultimate = id === MAIN_ID ? dinhBoLinhUltimate(profile.profession, profile.element) : personalSkillOf(id);
  const rows: readonly [string, number, number][] = [
    ["Máu", bare.maxHp, fighter.maxHp],
    ["Công (ATK)", bare.atk, fighter.atk],
    ["Thủ (DEF)", bare.def, fighter.def],
  ];
  return (
    <div className="flex flex-col gap-3 text-[15px]">
      <table className="w-full overflow-hidden rounded-md text-left">
        <caption className="sr-only">Chỉ số gốc, phần cộng từ trang bị và tổng</caption>
        <thead className="text-sm text-[var(--bk-soft)]">
          <tr>
            <th className="py-1 font-normal">Chỉ số</th>
            <th className="py-1 text-right font-normal">Gốc</th>
            <th className="py-1 text-right font-normal">Trang bị</th>
            <th className="py-1 text-right font-normal">Tổng</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map(([k, base, total]) => (
            <tr key={k} className="border-t border-[var(--bk-line-soft)]">
              <th scope="row" className="py-1.5 font-normal text-on-wood">{k}</th>
              <td className="py-1.5 text-right">{base}</td>
              <td className="py-1.5 text-right text-success">{total - base > 0 ? `+${total - base}` : "–"}</td>
              <td className="py-1.5 text-right font-semibold text-title-on-wood">{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <dt className="text-[var(--bk-soft)]">Nguyên tố</dt>
        <dd>{ELEMENT_NAME[fighter.element]}</dd>
        <dt className="text-[var(--bk-soft)]">Nghề</dt>
        <dd>{PROFESSION_NAME[fighter.profession]}</dd>
        <dt className="text-[var(--bk-soft)]">Cấp</dt>
        <dd className="tabular-nums">
          {p.level}/{MAX_LEVEL}
        </dd>
        {ultimate && (
          <>
            <dt className="text-[var(--bk-soft)]">Kỹ năng riêng</dt>
            <dd>
              <span className="font-semibold text-title-on-wood">{ultimate.name}</span>
              {p.level < MAIN_SLOT_UNLOCK[4]! && <span className="text-[var(--bk-soft)]"> · mở ở cấp {MAIN_SLOT_UNLOCK[4]}</span>}
            </dd>
          </>
        )}
      </dl>
      <div>
        <h3 className="mb-1 text-sm text-[var(--bk-soft)]">Đang mặc ({worn.length}/9)</h3>
        {worn.length === 0 ? (
          <p className="text-sm text-[var(--bk-soft)]">Chưa mặc món nào.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {worn.map((it) => (
              <li key={it.id} className={TIER_CLASS[it.tier]}>
                {gearText(it)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
