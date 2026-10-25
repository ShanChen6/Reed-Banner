"use client";

import { useState } from "react";
import { type Element, ELEMENTS, elementRelation, characterSkills, PROFESSIONS, type Profession, PASSIVES, PROFESSION_COMBO, COMBO_PASSIVES, CHASE_PASSIVES, chasePassives } from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME, passiveText } from "../game/battle/labels";
import { ELEMENT_COLOR, ElementIcon } from "../game/art/icons";
import { Portrait } from "../game/art/portraits";
import { SkillIcon } from "../game/art/skills";
import SkillInfo from "../game/battle/SkillInfo";
import { ELEMENT_TRAIT } from "./data";

function related(e: Element, test: (other: Element) => boolean) {
  return ELEMENTS.filter((o) => o !== e && test(o));
}

/** Chọn một nguyên tố để xem Đinh Bộ Lĩnh đổi hệ: chân dung, bị động, 6 kỹ năng và quan hệ khắc chế. */
export default function ElementPicker() {
  const [element, setElement] = useState<Element>("moc");
  const [profession, setProfession] = useState<Profession>("tuongSi");
  const [slot, setSlot] = useState(1);
  const skills = characterSkills(profession, element);
  const skill = skills.find((s) => s.slot === slot) ?? skills[0]!;
  const combo = COMBO_PASSIVES[PROFESSION_COMBO[profession]];
  const chase = chasePassives({ profession, element });
  const trait = ELEMENT_TRAIT[element];
  const counters = related(element, (o) => elementRelation(element, o) === "counter");
  const counteredBy = related(element, (o) => elementRelation(o, element) === "counter");
  const feeds = related(element, (o) => elementRelation(element, o) === "generate");

  return (
    <div className="space-y-5">
      <label className="flex justify-center gap-2 text-sm">Nghề
        <select className="rounded bg-stone-900 p-1" value={profession} onChange={e => setProfession(e.target.value as Profession)}>
          {PROFESSIONS.map(p => <option key={p} value={p}>{PROFESSION_NAME[p]}</option>)}
        </select>
      </label>
      <div role="tablist" aria-label="Chọn nguyên tố" className="flex flex-wrap justify-center gap-2">
        {ELEMENTS.map((e) => (
          <button
            key={e}
            type="button"
            role="tab"
            aria-selected={e === element}
            onClick={() => setElement(e)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              e === element
                ? "border-[var(--gold)] bg-[var(--gold)]/15 text-amber-100"
                : "border-stone-700 text-stone-300 hover:border-stone-500"
            }`}
          >
            <ElementIcon element={e} className="size-5" />
            {ELEMENT_NAME[e]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className="grid gap-6 fx-panel rounded-2xl p-5 md:grid-cols-[auto_1fr] md:p-7"
        style={{ boxShadow: `inset 0 0 0 1px ${ELEMENT_COLOR[element]}33, 0 0 60px -20px ${ELEMENT_COLOR[element]}` }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Portrait id="dinhBoLinh" element={element} profession={profession} className="size-36 md:size-44" />
          <p className="font-serif text-xl font-bold">Đinh Bộ Lĩnh</p>
          <p className="text-sm text-stone-400">Hệ {ELEMENT_NAME[element]}</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-serif text-2xl font-bold" style={{ color: ELEMENT_COLOR[element] }}>
              {trait.role}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {trait.tags.map((t) => (
                <span key={t} className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs text-stone-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            {[
              ["Khắc", counters],
              ["Bị khắc bởi", counteredBy],
              ["Sinh ra", feeds],
            ].map(([label, list]) => (
              <div key={label as string} className="rounded-lg bg-stone-900/60 px-3 py-2">
                <dt className="text-xs uppercase tracking-wider text-stone-500">{label as string}</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  {(list as Element[]).length === 0
                    ? "—"
                    : (list as Element[]).map((o) => (
                        <span key={o} className="flex items-center gap-1">
                          <ElementIcon element={o} className="size-4" />
                          {ELEMENT_NAME[o]}
                        </span>
                      ))}
                </dd>
              </div>
            ))}
          </dl>

          <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/5 px-3 py-2 text-sm">
            <span className="text-xs uppercase tracking-wider text-[var(--gold)]">Bị động khi đầy Nộ</span>
            <p className="font-semibold">{PASSIVES[element].name}</p>
            <p className="mt-0.5 text-stone-300">{passiveText(element)}</p>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-stone-500">6 kỹ năng chủ động · chạm để xem chi tiết</p>
            <ul role="tablist" aria-label="Chọn kỹ năng" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {skills.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={s.id === skill.id}
                    onClick={() => setSlot(s.slot!)}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs transition ${
                      s.id === skill.id ? "bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/60" : "bg-stone-900/60 hover:bg-stone-800/80"
                    }`}
                  >
                    <SkillIcon def={s} className="size-9 shrink-0" />
                    <span className="leading-tight">
                      <span className="block font-semibold text-stone-100">{s.name}</span>
                      <span className="text-stone-500">{s.cost} năng lượng</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div role="tabpanel" className="mt-2 rounded-lg bg-stone-900/70 p-3">
              <SkillInfo def={skill} />
            </div>
          </div>

          <div className="text-sm">
            <p className="mb-2 text-xs uppercase tracking-wider text-stone-500">4 bị động phối hợp</p>
            <ul className="space-y-1.5 text-stone-300">
              <li><span className="font-semibold text-stone-100">Nghề · {combo.name}:</span> {combo.description}</li>
              {chase.map((id, i) => (
                <li key={id}><span className="font-semibold text-stone-100">{i === 0 ? "Nghề" : "Hệ"} · {CHASE_PASSIVES[id].name}:</span> {CHASE_PASSIVES[id].description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
