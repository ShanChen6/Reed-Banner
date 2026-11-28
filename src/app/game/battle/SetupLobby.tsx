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
import { CounterStar, type CounterFoe } from "../art/CounterStar";
import { ElementIcon, LeaderFlag, ProfessionIcon } from "../art/icons";
import { stageBackdropUrl } from "../art/portrait-data";
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

function TeamRow({ fighters, label, align, foes = [] }: {
  fighters: readonly Fighter[];
  label: string;
  align: "start" | "end";
  /** Đội bên kia, để gắn ★ cho người khắc hệ. */
  foes?: readonly CounterFoe[];
}) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-2 ${align === "end" ? "sm:items-end" : "sm:items-start"}`}>
      <span className="text-kicker text-on-wood-soft">{label}</span>
      <div className={`flex gap-2 ${align === "end" ? "sm:flex-row-reverse" : ""}`}>
        {fighters.map((f, i) => (
          <div key={f.id} className="flex w-[4.5rem] flex-col items-center gap-0.5 text-center sm:w-24">
            <div className="relative">
              <Portrait id={f.id} element={f.element} profession={f.profession} level={f.level} className="size-14 sm:size-16" />
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
            <span className="flex w-full items-center justify-center gap-0.5 text-caption font-semibold">
              <span className="truncate">{f.name}</span>
              <CounterStar element={f.element} foes={foes} />
            </span>
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
  const leader = teams[0][0];
  const stage = stageBackdropUrl(element);
  return (
    <div className="relative mx-auto flex w-full flex-col gap-4 text-on-wood">
      {/* Banner: tranh sân khấu theo hệ đang chọn, đổi hệ là đổi nền (Shan 18/11/2026). */}
      <header className="relative isolate overflow-hidden rounded-lg border border-frame-line">
        {stage && (
          <>
            {/* Tranh nền trang trí, không cần tối ưu qua next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stage} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div aria-hidden className="ui-mode-banner-shade absolute inset-0 -z-10" />
          </>
        )}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="max-w-xl">
            <p className="text-kicker text-frame-gold">{online ? "Giao Tranh" : "Thao Luyện"}</p>
            <h2 className="ui-title-on-wood font-serif text-2xl font-bold sm:text-3xl">Chuẩn bị xuất trận</h2>
            <p className="mt-1 text-sm text-on-wood">
              {online
                ? `Đội theo hồ sơ của bạn (Đinh Bộ Lĩnh cấp ${level}). Máy chủ xử lý từng nước đi, mỗi lượt 30 giây; tải lại trang vẫn tiếp tục được trận.`
                : practice
                  ? "Cả hai đội cấp 30, mọi kỹ năng cấp tối đa, mặc trang bị mẫu. Không lưu gì, cứ thử thoải mái."
                  : "Đội theo hồ sơ lưu trên trình duyệt này; thắng thua đều nhận kinh nghiệm, vàng và đồ rơi."}
            </p>
          </div>
          {!online && (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chế độ">
              {(["practice", "progress"] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => onMode(m)} className={`${chip(mode === m)} min-h-11 backdrop-blur-sm`}>
                  {m === "practice" ? "Luyện tập, tối đa" : `Tiến trình, cấp ${level}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Thế trận: hai phe hai bên, huy hiệu VS ở giữa. */}
      <section aria-label="Thế trận" className="ui-frame-inset grid items-center gap-3 rounded-lg p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:p-4">
        <TeamRow fighters={teams[0]} label="Phe bạn" align="start" foes={teams[1]} />
        <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-full border-2 border-frame-gold bg-lacquer font-serif text-xl font-bold text-paper-hi shadow-lg">VS</span>
        <TeamRow fighters={teams[1]} label="Đối thủ" align="end" />
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="lobby-leader" className="ui-frame-inset flex flex-col gap-4 rounded-lg p-3 sm:p-4">
            <h3 id="lobby-leader" className="ui-title-on-wood font-serif text-lg font-bold">Chủ tướng</h3>
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
                Bị động thủ lĩnh <span className="font-semibold text-on-wood">{PASSIVES[element].name}</span>, {ELEMENT_TRAIT[element].role}
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

            <Row title="Kỹ năng" hint="3 nghề, 2 hệ, 1 tuyệt chiêu">
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {characterSkills(profession, element).map((def) => {
                  const locked = !practice && level < MAIN_SLOT_UNLOCK[def.slot!]!;
                  return (
                    <li key={def.id} title={`${skillText(def)}${locked ? ` (mở ở cấp ${MAIN_SLOT_UNLOCK[def.slot!]})` : ""}`} className={`flex flex-col items-center gap-1 rounded-lg border border-frame-line-soft bg-black/20 p-1.5 text-center ${locked ? "opacity-45" : ""}`}>
                      <SkillIcon def={def} className="size-10" />
                      <span className="line-clamp-2 w-full text-caption leading-tight">{def.name}</span>
                    </li>
                  );
                })}
              </ul>
            </Row>
          </section>

          {practice && !online && (
            <section aria-labelledby="lobby-gear" className="ui-frame-inset flex flex-col gap-3 rounded-lg p-3 sm:p-4">
              <h3 id="lobby-gear" className="ui-title-on-wood font-serif text-lg font-bold">Trang bị mẫu</h3>
              <Row title="Phẩm">
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
              </Row>
              {gear.tier !== 0 && (
                <Row title="Bộ">
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
                  <div className="mt-2 grid grid-cols-9 gap-1" aria-hidden>
                    {GEAR_SLOTS.map((slot) => (
                      <GearIcon key={slot} slot={slot} element={element} tier={gear.tier as Tier} set={gear.set ?? undefined} profession={profession} className="aspect-square size-full max-w-12" />
                    ))}
                  </div>
                </Row>
              )}
              <p className="text-caption text-on-wood-soft">Cả hai đội mặc đủ 9 món cùng hệ; đối thủ không có thưởng bộ.</p>
            </section>
          )}

          <SkillDetails paper fighter={{ profession, element }} skills={characterSkills(profession, element)} passive={PROFESSION_COMBO[profession]} />
        </div>

        {/* Thẻ ra trận: dính bên phải trên máy tính để nút Vào trận luôn trong tầm mắt. */}
        <aside aria-label="Ra trận" className="ui-frame-inset order-first flex flex-col gap-3 rounded-lg p-3 sm:p-4 lg:sticky lg:top-20 lg:order-none">
          {leader && (
            <div className="flex items-center gap-3">
              <Portrait id={leader.id} element={leader.element} profession={leader.profession} level={leader.level} className="size-16 shrink-0" />
              <div className="min-w-0">
                <p className="text-caption text-frame-gold">Thủ lĩnh</p>
                <p className="truncate font-serif text-lg font-bold text-title-on-wood">{leader.name}</p>
                <p className="flex items-center gap-1 text-caption text-on-wood-soft">
                  <ElementIcon element={element} className="size-4" /> {ELEMENT_NAME[element]}, <ProfessionIcon profession={profession} className="size-4" /> {PROFESSION_NAME[profession]}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-semibold tracking-[0.12em] text-frame-gold uppercase">Độ khó</span>
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Độ khó">
              {difficulties.map((d) => (
                <button key={d} type="button" role="radio" aria-checked={difficulty === d} onClick={() => onDifficulty(d)} className={`${chip(difficulty === d)} min-h-11 justify-center`}>
                  {DIFFICULTY_NAME[d]}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" type="button" onClick={onStart} disabled={pending} className="flex min-h-12 w-full items-center justify-center gap-2 text-lg shadow-lg transition">
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
            <Button variant="secondary" type="button" onClick={onReturn} className="w-full">
              Quay lại trận đang đánh
            </Button>
          )}
          {onResume && (
            <Button variant="secondary" type="button" onClick={onResume} disabled={pending} className="w-full">
              Tiếp tục trận dở
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
