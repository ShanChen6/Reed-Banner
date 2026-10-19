"use client";

import { useState } from "react";
import { type Element, ELEMENTS, elementRelation, mainSkills, PASSIVES } from "@/core";
import { ELEMENT_NAME } from "../demo/labels";
import { ELEMENT_COLOR, ElementIcon } from "../demo/art/icons";
import { Portrait } from "../demo/art/portraits";
import { SkillIcon } from "../demo/art/skills";
import { ELEMENT_TRAIT } from "./data";

function related(e: Element, test: (other: Element) => boolean) {
  return ELEMENTS.filter((o) => o !== e && test(o));
}

/** Chọn một nguyên tố để xem Đinh Bộ Lĩnh đổi hệ: chân dung, bị động, 6 kỹ năng và quan hệ khắc chế. */
export default function ElementPicker() {
  const [element, setElement] = useState<Element>("moc");
  const trait = ELEMENT_TRAIT[element];
  const counters = related(element, (o) => elementRelation(element, o) === "counter");
  const counteredBy = related(element, (o) => elementRelation(o, element) === "counter");
  const feeds = related(element, (o) => elementRelation(element, o) === "generate");

  return (
    <div className="space-y-5">
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
        className="grid gap-6 rounded-2xl border border-stone-700/70 bg-[var(--panel)] p-5 md:grid-cols-[auto_1fr] md:p-7"
        style={{ boxShadow: `inset 0 0 0 1px ${ELEMENT_COLOR[element]}33, 0 0 60px -20px ${ELEMENT_COLOR[element]}` }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Portrait id="dinhBoLinh" element={element} profession="tuongSi" className="size-36 md:size-44" />
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
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mainSkills(element).map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-lg bg-stone-900/60 p-2 text-xs">
                <SkillIcon def={s} className="size-9 shrink-0" />
                <span className="leading-tight">
                  <span className="block font-semibold text-stone-100">{s.name}</span>
                  <span className="text-stone-500">{s.cost} năng lượng</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
