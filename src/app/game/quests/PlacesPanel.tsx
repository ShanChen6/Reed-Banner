"use client";

// Bộ sưu tập địa danh Trận Đồ trong Thành tựu (V2-05). Địa danh đã có bấm để xem lại tranh cỡ lớn kèm chú thích;
// địa danh chưa có là "? ? ?" và không bấm được.

import { OrnateFrame, SectionTitle } from "@/components/game-ui";
import { useEffect, useRef, useState } from "react";
import { MAP_POOL, type FormationMap } from "../formation/maps";

function PlaceViewer({ place, onClose }: { place: FormationMap; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="place-viewer-title"
      className="m-auto w-[min(56rem,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-xl border border-frame-gold/60 bg-wood-lo p-0 text-on-wood backdrop:bg-black/70"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tranh tĩnh cỡ lớn */}
      <img src={place.src} alt={`Tranh ${place.place}`} className="aspect-[16/9] w-full object-cover" />
      <div className="flex flex-col gap-1 p-4">
        <h2 id="place-viewer-title" className="font-serif text-xl font-bold text-title-on-wood">{place.place}</h2>
        <p className="text-[15px] leading-relaxed">{place.blurb}</p>
        <button type="button" onClick={onClose} autoFocus className="mt-2 min-h-11 self-end rounded-md border border-frame-gold/60 px-5 text-title-on-wood">
          Đóng
        </button>
      </div>
    </dialog>
  );
}

export default function PlacesPanel({ collected }: { collected: readonly string[] }) {
  const [open, setOpen] = useState<FormationMap | null>(null);
  const have = MAP_POOL.filter((m) => collected.includes(m.id)).length;
  return (
    <OrnateFrame className="flex flex-col">
      <SectionTitle description="Khai thông trọn một sa bàn Trận Đồ để thêm địa danh. Bấm địa danh đã có để xem lại tranh.">
        Bộ sưu tập địa danh: {have}/{MAP_POOL.length}
      </SectionTitle>
      <ul className="grid grid-cols-2 gap-1.5 text-[15px] sm:grid-cols-3 lg:grid-cols-5">
        {MAP_POOL.map((m) => {
          const has = collected.includes(m.id);
          return (
            <li key={m.id}>
              {has ? (
                <button type="button" onClick={() => setOpen(m)} className="min-h-11 w-full rounded border border-frame-gold/70 bg-frame-gold/15 px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-frame-gold">
                  <span aria-hidden>✓ </span>{m.place}
                </button>
              ) : (
                <span aria-label="chưa khai thông" className="block min-h-11 rounded border border-frame-bronze/30 px-2 py-2 text-on-wood-soft">? ? ?</span>
              )}
            </li>
          );
        })}
      </ul>
      {open && <PlaceViewer place={open} onClose={() => setOpen(null)} />}
    </OrnateFrame>
  );
}
