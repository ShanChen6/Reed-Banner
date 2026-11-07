"use client";

// Bảng chọn đồ cho một ô trang bị: món đang mặc, các món cùng ô trong kho (vũ khí: đúng nghề), ai đang dùng món
// nào, chỉ số và so sánh trước khi thay (gearComparison của @/core). Luật mặc/tháo/chuyển vẫn là thao tác hồ sơ
// equip/unequip; chuyển món đang ở người khác cần bấm xác nhận lần nữa. Dùng <dialog> gốc để có khóa tiêu điểm
// và phím Esc; trên điện thoại hiện như tấm trượt từ đáy.

import { useEffect, useRef, useState } from "react";
import { itemStat, SLOT_STAT, wearerOf, type GearItem, type GearSlot, type Profile, type ProfileAction } from "@/core";
import { GearIcon } from "../art/gear";
import { gearText, PROFESSION_NAME, SLOT_NAME, TIER_CLASS } from "../battle/labels";
import { gearComparison } from "../battle/GearPanel";
import { SceneLink } from "../SceneContext";
import { fighterOf, slotItem, STAT_NAME } from "./HeroDetail";
import { XGlyph } from "./glyphs";
import { nameOf } from "./roster";

/** Món trong kho đặt được vào ô này cho nhân vật này, món tốt trước, món chưa ai dùng trước. */
export function candidatesFor(profile: Profile, id: string, slot: GearSlot): { usable: GearItem[]; otherProfession: number } {
  const profession = fighterOf(profile, id, false).profession;
  const same = profile.bag.filter((it) => it.slot === slot);
  const usable = same
    .filter((it) => slot !== "vuKhi" || it.profession === profession)
    .sort((a, b) => b.tier - a.tier || Number(wearerOf(profile, a.id) !== null) - Number(wearerOf(profile, b.id) !== null) || a.element.localeCompare(b.element) || a.id.localeCompare(b.id));
  return { usable, otherProfession: same.length - usable.length };
}

export default function GearPicker({
  profile,
  id,
  slot,
  busy,
  onAction,
  onClose,
}: {
  profile: Profile;
  id: string;
  slot: GearSlot;
  busy: boolean;
  onAction: (a: ProfileAction) => Promise<string | null>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const fighter = fighterOf(profile, id);
  const current = slotItem(profile, id, slot, fighter.profession);
  const { usable, otherProfession } = candidatesFor(profile, id, slot);
  const [pick, setPick] = useState<string | null>(current?.id ?? usable[0]?.id ?? null);
  const [confirm, setConfirm] = useState(false);
  const chosen = usable.find((it) => it.id === pick) ?? null;
  const wearer = chosen ? wearerOf(profile, chosen.id) : null;
  const name = nameOf(id);
  const stat = STAT_NAME[SLOT_STAT[slot]];

  useEffect(() => {
    const d = ref.current;
    // Không đóng ở cleanup: gỡ <dialog> khỏi DOM là tự thoát chế độ modal, còn close() sẽ gọi lại onClose.
    if (d && !d.open) d.showModal();
  }, []);

  const run = (a: ProfileAction) =>
    void onAction(a).then((error) => {
      if (!error) onClose();
    });

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="gear-picker-title"
      className="barracks gear-picker m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-xl p-0 text-on-wood sm:m-auto sm:max-h-[min(42rem,90dvh)] sm:w-[min(40rem,calc(100vw-2rem))] sm:rounded-xl"
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--bk-line-soft)] px-4 py-3">
          <GearIcon slot={slot} element={current?.element ?? fighter.element} tier={current?.tier} set={current?.set} profession={slot === "vuKhi" ? fighter.profession : undefined} className="size-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 id="gear-picker-title" className="barracks-title font-serif text-lg font-bold">
              {SLOT_NAME[slot]} · {name}
            </h2>
            <p className="text-sm text-[var(--bk-soft)]">
              {slot === "vuKhi" ? `Chỉ vũ khí nghề ${PROFESSION_NAME[fighter.profession]}.` : "Mọi tướng sĩ mặc được."} Mỗi món chỉ một người dùng.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng bảng chọn đồ" className="barracks-btn flex size-11 shrink-0 items-center justify-center rounded-md">
            <XGlyph className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <p className="mb-2 text-sm text-[var(--bk-soft)]">
            Đang mặc: {current ? <span className={TIER_CLASS[current.tier]}>{gearText(current)}</span> : "trống"}
          </p>
          {usable.length === 0 ? (
            <div className="barracks-inset flex flex-col items-center gap-2 rounded-md p-4 text-center text-[15px]">
              <p>Kho chưa có món {SLOT_NAME[slot].toLowerCase()} dùng được cho {name}.</p>
              {otherProfession > 0 && <p className="text-sm text-[var(--bk-soft)]">{otherProfession} vũ khí của nghề khác không dùng được.</p>}
              <SceneLink scene="SHOP" className="barracks-btn is-action min-h-10 pointer-coarse:min-h-11 rounded-md px-4 leading-10">
                Mua ở Cửa hàng
              </SceneLink>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5" aria-label={`Món ${SLOT_NAME[slot]} trong kho`}>
              {usable.map((it) => {
                const by = wearerOf(profile, it.id);
                const on = it.id === pick;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setPick(it.id);
                        setConfirm(false);
                      }}
                      className={`gear-row flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left ${on ? "is-selected" : ""}`}
                    >
                      <GearIcon slot={it.slot} element={it.element} tier={it.tier} set={it.set} profession={it.profession} className="size-11 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[15px] leading-snug font-semibold ${TIER_CLASS[it.tier]}`}>{gearText(it)}</span>
                        <span className="block text-sm text-[var(--bk-soft)] tabular-nums">
                          {stat} +{itemStat(it, fighter.element)}
                        </span>
                      </span>
                      {by && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${by === id ? "bg-success-surface text-success" : "bg-ash text-on-wood"}`}>
                          {by === id ? "Đang mặc" : `${nameOf(by)} đang dùng`}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {chosen && (
          <footer className="border-t border-[var(--bk-line-soft)] px-4 py-3">
            <p className="text-sm text-on-wood" aria-live="polite">
              {wearer === id ? "Món đang mặc." : (gearComparison(profile, id, chosen) ?? "Không mặc được món này.")}
            </p>
            {wearer && wearer !== id && (
              <p className="mt-1 text-sm text-title-on-wood">Món này đang ở {nameOf(wearer)}; trang bị sẽ tháo khỏi {nameOf(wearer)}.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {wearer === id ? (
                <button type="button" disabled={busy} onClick={() => run({ type: "unequip", character: id, item: chosen.id })} className="barracks-btn min-h-11 rounded-md px-4 disabled:opacity-50">
                  Tháo khỏi {name}
                </button>
              ) : wearer && !confirm ? (
                <button type="button" disabled={busy} onClick={() => setConfirm(true)} className="barracks-btn is-action min-h-11 rounded-md px-4 disabled:opacity-50">
                  Chuyển sang {name}
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={() => run({ type: "equip", character: id, item: chosen.id })} className="barracks-btn is-action min-h-11 rounded-md px-4 disabled:opacity-50">
                  {wearer ? `Xác nhận chuyển từ ${nameOf(wearer)}` : current ? "Thay món này" : "Trang bị"}
                </button>
              )}
              {current && wearer !== id && (
                <button type="button" disabled={busy} onClick={() => run({ type: "unequip", character: id, item: current.id })} className="barracks-btn min-h-11 rounded-md px-4 disabled:opacity-50">
                  Tháo món đang mặc
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
    </dialog>
  );
}
