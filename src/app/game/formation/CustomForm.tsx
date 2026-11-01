"use client";

// Chế độ tùy chỉnh của Chơi thường: tự chọn cỡ bàn (cột × hàng), nghề, hệ và quân đặc biệt xuất hiện. Không thưởng, không
// xếp hạng, không ghi điểm cao nhất. Giới hạn ở CUSTOM_LIMITS (src/core/binh-phap/rulesets.ts); engine kiểm lại khi tạo ván.

import { useState } from "react";
import { ELEMENTS, PROFESSIONS, type Element, type Profession } from "@/core/battle";
import { CUSTOM_LIMITS, FUSION_CHARACTERS, customRuleset, type CustomOptions, type Ruleset } from "@/core/binh-phap";
import { ElementIcon, ProfessionIcon } from "../art/icons";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

const KEY = "reed-banner:tran-do:custom:v1";

const DEFAULTS: CustomOptions = {
  width: 6,
  height: 6,
  professions: ["tuongSi", "phapSu", "ySu"],
  elements: ["kim", "moc", "hoa"],
  wildPermille: 60,
  eraserPermille: 40,
  fusionPermille: 0,
  obstaclePercent: 10,
};

function load(): CustomOptions {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as unknown;
    return customRuleset(raw) ? (raw as CustomOptions) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function toggle<T>(list: readonly T[], item: T, order: readonly T[]): T[] {
  const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  return order.filter((x) => next.includes(x));
}

const rangeClass = "h-2 w-full cursor-pointer accent-[#C9A25A]";

function Slider({ id, label, value, min, max, step = 1, unit, onChange, disabled = false }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-center justify-between text-[15px]">
        <span>{label}</span>
        <b className="tabular-nums">{value}{unit}</b>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} className={`${rangeClass} disabled:opacity-50`} />
    </div>
  );
}

export default function CustomForm({ onStart }: { onStart: (rules: Ruleset) => void }) {
  // Giá trị lưu lần trước nạp lười ở lần mở đầu tiên của khối (chỉ chạy ở client, vì form nằm sau một lần bấm mở).
  const [o, setO] = useState<CustomOptions>(() => (typeof window === "undefined" ? DEFAULTS : load()));
  const L = CUSTOM_LIMITS;
  const hasFusion = FUSION_CHARACTERS.length > 0;
  const rules = customRuleset(o);
  const set = (patch: Partial<CustomOptions>) => setO((cur) => ({ ...cur, ...patch }));
  const area = o.width * o.height;

  return (
    <details className="atlas-frame atlas-frame-wood p-4">
      <summary className="cursor-pointer font-serif text-xl font-bold text-[var(--atlas-title)]">Tùy chỉnh</summary>
      <p className="mt-1 text-sm text-[var(--atlas-muted)]">Tự dựng sa bàn của riêng bạn. Không thưởng, không xếp hạng, không lưu điểm cao nhất.</p>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Slider id="fm-w" label="Số cột (x)" value={o.width} min={L.minSide} max={L.maxSide} unit="" onChange={(n) => set({ width: n })} />
          <Slider id="fm-h" label="Số hàng (y)" value={o.height} min={L.minSide} max={L.maxSide} unit="" onChange={(n) => set({ height: n })} />
          <p className="text-sm text-[var(--atlas-muted)]">Sa bàn {o.width}×{o.height} = {area} ô.</p>
          <Slider id="fm-ob" label="Chướng ngại" value={o.obstaclePercent} min={0} max={L.maxObstaclePercent} unit="%" onChange={(n) => set({ obstaclePercent: n })} />
        </div>

        <div className="flex flex-col gap-3">
          <Slider id="fm-wild" label="Quân Lệnh" value={o.wildPermille / 10} min={0} max={L.maxWildPermille / 10} step={0.5} unit="%" onChange={(n) => set({ wildPermille: Math.round(n * 10) })} />
          <Slider id="fm-eraser" label="Thu Hồi" value={o.eraserPermille / 10} min={0} max={L.maxEraserPermille / 10} step={0.5} unit="%" onChange={(n) => set({ eraserPermille: Math.round(n * 10) })} />
          <Slider id="fm-fusion" label="Nhân vật dung hợp" value={o.fusionPermille / 10} min={0} max={L.maxFusionPermille / 10} step={0.5} unit="%" disabled={!hasFusion} onChange={(n) => set({ fusionPermille: Math.round(n * 10) })} />
          {!hasFusion && <p className="text-sm text-[var(--atlas-muted)]">Chưa có nhân vật dung hợp nào được duyệt nên chưa dùng được.</p>}
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-1.5 font-serif font-bold text-[var(--atlas-title)]">Nghề xuất hiện ({o.professions.length}, tối thiểu {L.minProfessions})</legend>
        <div className="flex flex-wrap gap-2">
          {(PROFESSIONS as readonly Profession[]).map((p) => {
            const on = o.professions.includes(p);
            return (
              <button key={p} type="button" role="checkbox" aria-checked={on} disabled={on && o.professions.length <= L.minProfessions} onClick={() => set({ professions: toggle(o.professions, p, PROFESSIONS as readonly Profession[]) })} className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-[15px] ${on ? "border-[#C9A25A] bg-[#C9A25A]/25 font-semibold" : "border-[#8F6A32]/50 bg-black/20 text-[var(--atlas-muted)]"} disabled:opacity-60`}>
                <ProfessionIcon profession={p} className="size-5" /> {PROFESSION_NAME[p]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-1.5 font-serif font-bold text-[var(--atlas-title)]">Hệ xuất hiện ({o.elements.length}, tối thiểu {L.minElements})</legend>
        <div className="flex flex-wrap gap-2">
          {(ELEMENTS as readonly Element[]).map((e) => {
            const on = o.elements.includes(e);
            return (
              <button key={e} type="button" role="checkbox" aria-checked={on} disabled={on && o.elements.length <= L.minElements} onClick={() => set({ elements: toggle(o.elements, e, ELEMENTS as readonly Element[]) })} className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-[15px] ${on ? "border-[#C9A25A] bg-[#C9A25A]/25 font-semibold" : "border-[#8F6A32]/50 bg-black/20 text-[var(--atlas-muted)]"} disabled:opacity-60`}>
                <ElementIcon element={e} className="size-5" /> {ELEMENT_NAME[e]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!rules}
          onClick={() => {
            if (!rules) return;
            try {
              window.localStorage.setItem(KEY, JSON.stringify(o));
            } catch {
              /* không lưu được lựa chọn: vẫn chơi được */
            }
            onStart(rules);
          }}
          className="home-cta min-h-12 rounded-lg px-8 font-serif font-bold disabled:opacity-60"
        >
          Chơi sa bàn tùy chỉnh
        </button>
        <span className="text-sm text-[var(--atlas-muted)]">{o.professions.length} nghề × {o.elements.length} hệ = {o.professions.length * o.elements.length} loại quân</span>
      </div>
    </details>
  );
}
