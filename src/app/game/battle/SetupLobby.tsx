"use client";
import { Button, choiceVariants } from "@/components/ui";


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
import { GearIcon, SetEmblem } from "../art/gear";
import { DongSonBand, ElementIcon, LeaderFlag, ProfessionIcon } from "../art/icons";
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
  choiceVariants({ size: "sm", className: `rounded-full${on ? " is-selected" : ""}` });

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
      <h3 className="text-sm font-bold tracking-wide text-frame-gold sm:pt-3">
        {title}
        {hint && <span className="block text-caption font-normal text-on-wood-soft">{hint}</span>}
      </h3>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function TeamRow({ fighters, label, align }: { fighters: readonly Fighter[]; label: string; align: "start" | "end" }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 ${align === "end" ? "sm:items-end" : "sm:items-start"}`}>
      <span className="text-kicker text-on-wood-soft">{label}</span>
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
            <span className="w-full truncate text-caption font-semibold">{f.name}</span>
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
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl text-on-wood">
      <div className="relative flex flex-col gap-4 p-1 sm:p-2">
        <header className="flex flex-col items-center gap-1 text-center">
          <p className="text-kicker text-frame-gold">{online ? "Giao Tranh" : "Thao Luyện"}</p>
          <h2 className="font-serif text-2xl font-bold text-title-on-wood sm:text-3xl">Chuẩn bị xuất trận</h2>
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
        <p className="-mt-2 text-center text-caption text-on-wood-soft">
          {online
            ? `Đội theo hồ sơ của bạn (Đinh Bộ Lĩnh cấp ${level}). Máy chủ xử lý từng nước đi, mỗi lượt 30 giây; tải lại trang vẫn tiếp tục được trận.`
            : practice
              ? "Cả hai đội cấp 30, mọi kỹ năng cấp tối đa, mặc trang bị mẫu. Không lưu gì, cứ thử thoải mái."
              : "Đội theo hồ sơ lưu trên trình duyệt này; thắng thua đều nhận kinh nghiệm, vàng và đồ rơi."}
        </p>

        <div className="flex flex-col items-center gap-2 ui-frame-inset rounded-xl p-3 sm:flex-row">
          <TeamRow fighters={teams[0]} label="Phe bạn" align="start" />
          <span className="font-serif text-2xl font-bold text-frame-gold sm:text-3xl">VS</span>
          <TeamRow fighters={teams[1]} label="Tianwu" align="end" />
        </div>

        {/* Ba khối chọn gọn một hàng nhãn + chip: nhãn trái, lựa chọn phải; đang chọn là giấy dó (quy tắc bề mặt ở theme.md). */}
        <div className="flex flex-col gap-3 ui-frame-inset rounded-xl p-3">
          <Row title="Nguyên tố">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Nguyên tố chủ tướng">
              {elements.map((e) => (
                <button key={e} type="button" role="radio" aria-checked={element === e} onClick={() => onElement(e)} title={ELEMENT_TRAIT[e].role} className={`${chip(element === e)} min-h-11 gap-1.5`}>
                  <ElementIcon element={e} className="size-6" />
                  {ELEMENT_NAME[e]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-caption text-on-wood-soft">
              Bị động thủ lĩnh <span className="font-semibold text-on-wood">{PASSIVES[element].name}</span> · {ELEMENT_TRAIT[element].role}
            </p>
          </Row>

          <Row title="Nghề">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Nghề chủ tướng">
              {PROFESSIONS.map((p) => (
                <button key={p} type="button" role="radio" aria-checked={profession === p} onClick={() => onProfession(p)} title={PROFESSION_PERK[p]} className={`${chip(profession === p)} min-h-11 gap-1.5`}>
                  <ProfessionIcon profession={p} className="size-6" />
                  {PROFESSION_NAME[p]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-caption text-on-wood-soft">{PROFESSION_PERK[profession]}</p>
          </Row>

          <Row title="Kỹ năng" hint="3 nghề · 2 hệ · 1 tuyệt chiêu">
            <ul className="flex flex-wrap gap-2">
              {characterSkills(profession, element).map((def) => {
                const locked = !practice && level < MAIN_SLOT_UNLOCK[def.slot!]!;
                return (
                  <li key={def.id} title={`${skillText(def)}${locked ? ` (mở ở cấp ${MAIN_SLOT_UNLOCK[def.slot!]})` : ""}`} className={`flex w-[4.5rem] flex-col items-center gap-0.5 text-center ${locked ? "opacity-45" : ""}`}>
                    <SkillIcon def={def} className="size-10" />
                    <span className="line-clamp-2 w-full text-caption leading-tight">{def.name}</span>
                  </li>
                );
              })}
            </ul>
          </Row>

          {practice && !online && (
          <Row title="Trang bị">
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
                      className={`${chip(gear.set === id)} inline-flex items-center gap-1`}
                    >
                      {id && <SetEmblem set={id} className="size-4" />}
                      {id ? `Bộ ${getGearSet(id)!.name}` : "Không bộ"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1" aria-hidden>
                  {GEAR_SLOTS.map((slot) => (
                    <GearIcon key={slot} slot={slot} element={element} tier={gear.tier as Tier} set={gear.set ?? undefined} profession={profession} className="size-9" />
                  ))}
                </div>
              </>
            )}
          <p className="mt-1.5 text-caption text-on-wood-soft">Trang bị mẫu: cả hai đội mặc đủ 9 món cùng hệ; đối thủ không có thưởng bộ.</p>
          </Row>
        )}

        <Row title="Độ khó">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Độ khó">
            {difficulties.map((d) => (
              <button key={d} type="button" role="radio" aria-checked={difficulty === d} onClick={() => onDifficulty(d)} className={chip(difficulty === d)}>
                {DIFFICULTY_NAME[d]}
              </button>
            ))}
          </div>
        </Row>

          <SkillDetails paper fighter={{ profession, element }} skills={characterSkills(profession, element)} passive={PROFESSION_COMBO[profession]} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button variant="primary"
            type="button"
            onClick={onStart}
            disabled={pending}
            className="flex items-center gap-2 text-lg shadow-lg transition"
          >
            {pending ? (
              <>
                <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang tạo trận…
              </>
            ) : (
              <>
                <LeaderFlag className="size-6" /> Vào trận
              </>
            )}
          </Button>
          {canReturn && (
            <Button variant="secondary" type="button" onClick={onReturn}>
              Quay lại trận đang đánh
            </Button>
          )}
          {onResume && (
            <Button variant="secondary" type="button" onClick={onResume} disabled={pending}>
              Tiếp tục trận dở
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
