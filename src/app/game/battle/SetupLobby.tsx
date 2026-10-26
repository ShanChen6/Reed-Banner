"use client";
import { Button } from "@/components/ui";


// Màn chờ trước trận: xem hai đội, chọn nguyên tố, nghề, trang bị mẫu và độ khó rồi vào trận. Luôn là nền
// sơn mài tối (không theo giao diện sáng/tối) để chữ màu phẩm trang bị đọc được.

import {
  characterSkills,
  PROFESSION_COMBO,
  MAIN_SLOT_UNLOCK,
  GEAR_SETS,
  GEAR_SLOTS,
  getGearSet,
  PASSIVES,
  PROFESSIONS,
  TIERS,
  type Difficulty,
  type Element,
  type Fighter,
  type Profession,
  type Tier,
} from "@/core";
import { ELEMENT_TRAIT, PROFESSION_PERK } from "../../home/data";
import { GearIcon } from "../art/gear";
import { DongSonBand, ELEMENT_COLOR, ElementIcon, LeaderFlag, PROFESSION_COLOR, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import SkillDetails from "./SkillDetails";
import { SkillIcon } from "../art/skills";
import { skillText, DIFFICULTY_NAME, ELEMENT_NAME, PROFESSION_NAME, TIER_CLASS, TIER_COLOR_NAME } from "./labels";

export type LobbyMode = "practice" | "progress";

export interface LobbyGear {
  readonly tier: 0 | Tier;
  readonly set: string | null;
}

const chip = (on: boolean) =>
  `rounded-full px-3 py-1 text-sm transition ${
    on ? "bg-amber-500 font-semibold text-stone-950 shadow" : "bg-white/10 hover:bg-white/20"
  }`;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-baseline gap-2 text-sm font-bold tracking-wide text-amber-200">
        {title}
        {hint && <span className="text-xs font-normal text-stone-400">{hint}</span>}
      </h3>
      {children}
    </section>
  );
}

function TeamRow({ fighters, label, align }: { fighters: readonly Fighter[]; label: string; align: "start" | "end" }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 ${align === "end" ? "sm:items-end" : "sm:items-start"}`}>
      <span className="text-xs uppercase tracking-widest text-stone-400">{label}</span>
      <div className={`flex gap-2 ${align === "end" ? "sm:flex-row-reverse" : ""}`}>
        {fighters.map((f, i) => (
          <div key={f.id} className="flex w-16 flex-col items-center gap-0.5 text-center sm:w-20">
            <div className="relative">
              <Portrait id={f.id} element={f.element} profession={f.profession} level={f.level} className="size-12 sm:size-14" />
              <span className="absolute -top-1 -right-1 flex" title={PROFESSION_NAME[f.profession]}>
                <ProfessionIcon profession={f.profession} className="size-5" />
              </span>
              <span className="absolute -bottom-1 -left-1 flex" title={ELEMENT_NAME[f.element]}>
                <ElementIcon element={f.element} className="size-5" />
              </span>
              {i === 0 && (
                <span className="absolute -left-1 -top-1" title="Thủ lĩnh">
                  <LeaderFlag className="size-5" />
                </span>
              )}
            </div>
            <span className="w-full truncate text-xs font-semibold">{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SetupLobby({
  online,
  mode,
  onMode,
  level,
  elements,
  element,
  onElement,
  profession,
  onProfession,
  gear,
  onGear,
  difficulties,
  difficulty,
  onDifficulty,
  teams,
  pending,
  canReturn,
  onStart,
  onResume,
  onReturn,
}: {
  online: boolean;
  mode: LobbyMode;
  onMode: (m: LobbyMode) => void;
  /** Cấp nhân vật chính theo hồ sơ (Tiến trình, Chơi online). */
  level: number;
  elements: readonly Element[];
  element: Element;
  onElement: (e: Element) => void;
  profession: Profession;
  onProfession: (p: Profession) => void;
  gear: LobbyGear;
  onGear: (g: LobbyGear) => void;
  difficulties: readonly Difficulty[];
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  /** Hai đội theo lựa chọn hiện tại. */
  teams: readonly [readonly Fighter[], readonly Fighter[]];
  pending: boolean;
  /** Có trận chơi thử đang dở để quay lại. */
  canReturn: boolean;
  onStart: () => void;
  onResume?: () => void;
  onReturn: () => void;
}) {
  const practice = mode === "practice";
  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border-2 border-[#d4a24c]/70 bg-[#1d1511] text-stone-100 shadow-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(60% 50% at 15% 0%, ${ELEMENT_COLOR[element]}55, transparent 70%), radial-gradient(50% 40% at 100% 100%, ${PROFESSION_COLOR[profession]}55, transparent 70%)`,
        }}
      />
      <div className="relative flex flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{online ? "Chơi online" : "Chơi thử"}</p>
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">Chuẩn bị xuất trận</h2>
          <DongSonBand className="mt-1 w-48 opacity-80" />
        </header>

        {!online && (
          <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Chế độ">
            {(["practice", "progress"] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => onMode(m)} className={chip(mode === m)}>
                {m === "practice" ? "Luyện tập · tối đa" : `Tiến trình · cấp ${level}`}
              </button>
            ))}
          </div>
        )}
        <p className="-mt-2 text-center text-xs text-stone-400">
          {online
            ? `Đội theo hồ sơ của bạn (Đinh Bộ Lĩnh cấp ${level}). Server xử lý từng nước đi, mỗi lượt 30 giây; tải lại trang vẫn tiếp tục được trận.`
            : practice
              ? "Cả hai đội cấp 30, mọi kỹ năng cấp tối đa, mặc trang bị mẫu. Không lưu gì, cứ thử thoải mái."
              : "Đội theo hồ sơ lưu trên trình duyệt này; thắng thua đều nhận kinh nghiệm, vàng và đồ rơi."}
        </p>

        <div className="flex flex-col items-center gap-2 rounded-xl bg-black/30 p-3 sm:flex-row">
          <TeamRow fighters={teams[0]} label="Phe bạn" align="start" />
          <span className="font-serif text-2xl font-bold text-amber-400 sm:text-3xl">VS</span>
          <TeamRow fighters={teams[1]} label="Tianwu" align="end" />
        </div>

        <Section title="Nguyên tố" hint={`Bị động thủ lĩnh: ${PASSIVES[element].name}`}>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Nguyên tố nhân vật chính">
            {elements.map((e) => {
              const on = element === e;
              return (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onElement(e)}
                  title={ELEMENT_TRAIT[e].role}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
                    on ? "border-transparent bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                  style={on ? { boxShadow: `0 0 0 2px ${ELEMENT_COLOR[e]}, 0 0 18px -4px ${ELEMENT_COLOR[e]}` } : undefined}
                >
                  <ElementIcon element={e} className="size-8 sm:size-9" />
                  <span className="text-sm font-semibold">{ELEMENT_NAME[e]}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-300">
            <span className="font-semibold" style={{ color: ELEMENT_COLOR[element] }}>
              {ELEMENT_NAME[element]}:
            </span>{" "}
            {ELEMENT_TRAIT[element].role} · {ELEMENT_TRAIT[element].tags.join(", ")}
          </p>
        </Section>

        <Section title="Nghề">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Nghề nhân vật chính">
            {PROFESSIONS.map((p) => {
              const on = profession === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onProfession(p)}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                    on ? "border-transparent bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                  style={on ? { boxShadow: `0 0 0 2px ${PROFESSION_COLOR[p]}, 0 0 18px -4px ${PROFESSION_COLOR[p]}` } : undefined}
                >
                  <ProfessionIcon profession={p} className="size-9 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{PROFESSION_NAME[p]}</span>
                    <span className="block text-[11px] leading-snug text-stone-400">{PROFESSION_PERK[p]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Bộ kỹ năng" hint="3 nghề · 2 hệ · 1 tuyệt chiêu">
          <ul className="grid gap-2 sm:grid-cols-3">
            {characterSkills(profession, element).map(def => {
              const locked = !practice && level < MAIN_SLOT_UNLOCK[def.slot!]!;
              return <li key={def.id} title={skillText(def)} className={`flex gap-2 text-xs ${locked ? "opacity-50" : ""}`}>
                <SkillIcon def={def} className="size-8 shrink-0" />
                <span>{def.name}<br />Ô {def.slot} · {def.cost} NL · cấp {MAIN_SLOT_UNLOCK[def.slot!]}</span>
              </li>;
            })}
          </ul>
        </Section>

        <SkillDetails fighter={{profession,element}} skills={characterSkills(profession, element)} passive={PROFESSION_COMBO[profession]} />

        {practice && !online && (
          <Section title="Trang bị mẫu" hint="cả hai đội mặc đủ 9 món cùng hệ; Tianwu không có thưởng bộ">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Phẩm trang bị">
              {([0, ...TIERS] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={gear.tier === t}
                  onClick={() => onGear({ ...gear, tier: t })}
                  className={`${chip(gear.tier === t)} ${gear.tier === t || t === 0 ? "" : TIER_CLASS[t]}`}
                >
                  {t === 0 ? "Không" : TIER_COLOR_NAME[t]}
                </button>
              ))}
            </div>
            {gear.tier !== 0 && (
              <>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Bộ trang bị">
                  {[null, ...GEAR_SETS.map((g) => g.id)].map((id) => (
                    <button
                      key={id ?? "none"}
                      type="button"
                      role="radio"
                      aria-checked={gear.set === id}
                      onClick={() => onGear({ ...gear, set: id })}
                      className={chip(gear.set === id)}
                    >
                      {id ? `Bộ ${getGearSet(id)!.name}` : "Không bộ"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1" aria-hidden>
                  {GEAR_SLOTS.map((slot) => (
                    <GearIcon key={slot} slot={slot} element={element} tier={gear.tier as Tier} profession={profession} className="size-9" />
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        <Section title="Độ khó">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Độ khó">
            {difficulties.map((d) => (
              <button key={d} type="button" role="radio" aria-checked={difficulty === d} onClick={() => onDifficulty(d)} className={chip(difficulty === d)}>
                {DIFFICULTY_NAME[d]}
              </button>
            ))}
          </div>
        </Section>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button variant="primary"
            type="button"
            onClick={onStart}
            disabled={pending}
            className="flex items-center gap-2 text-lg shadow-lg transition"
          >
            {pending ? (
              <>
                <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
                Đang tạo trận…
              </>
            ) : (
              <>
                <LeaderFlag className="size-6" /> Vào trận
              </>
            )}
          </Button>
          {canReturn && (
            <button type="button" onClick={onReturn} className="rounded-xl bg-white/15 px-4 py-2.5 hover:bg-white/25">
              Quay lại trận đang đánh
            </button>
          )}
          {onResume && (
            <button type="button" onClick={onResume} disabled={pending} className="rounded-xl bg-white/15 px-4 py-2.5 hover:bg-white/25 disabled:opacity-60">
              Tiếp tục trận dở
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
