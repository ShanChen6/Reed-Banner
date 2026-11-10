// Tiểu sử ngắn trong tab Chi tiết của tướng thường, Xạ thủ và Sát thủ: ngoại hiệu, phe, xuất thân, tính cách, câu nói và
// người liên quan (chỉ mức đã chốt). Chữ lấy từ lore.ts (docs/03-characters/thiet-ke-lai-nhan-vat.md); nhân vật không có
// tiểu sử (Đinh Bộ Lĩnh, tướng lịch sử, sứ quân) thì không hiện gì. Mọi nhân vật ở đây là hư cấu.

import { FACTIONS, loreOf, relatedTo } from "@/core";
import { FLAG_ART } from "../campaign/factionMarks";

export default function Biography({ id }: { id: string }) {
  const lore = loreOf(id);
  if (!lore) return null;
  const faction = FACTIONS[lore.faction];
  const people = relatedTo(id);
  return (
    <section aria-label="Tiểu sử" className="barracks-inset flex flex-col gap-2 rounded-md p-3">
      <p>
        <span className="font-serif text-lg font-bold text-title-on-wood">{lore.epithet}</span>
        {lore.epithetMeaning && <span className="text-sm text-[var(--on-wood-soft)]"> · {lore.epithetMeaning}</span>}
      </p>
      <p className="flex items-center gap-2 text-sm">
        {FLAG_ART.has(lore.faction) && (
          // eslint-disable-next-line @next/next/no-img-element -- ký hiệu cờ 256px, trang trí.
          <img src={`/art/flags/co-${faction.id}.webp`} alt="" className="size-6 shrink-0 object-contain" draggable={false} />
        )}
        <span>
          <span className="text-[var(--on-wood-soft)]">Phe: </span>
          {lore.factionNote}
        </span>
      </p>
      {lore.age !== undefined && lore.hometown && (
        <p className="text-sm text-[var(--on-wood-soft)]">
          Khoảng {lore.age} tuổi · {lore.hometown}
        </p>
      )}
      <p className="leading-relaxed">{lore.backstory}</p>
      {lore.personality && (
        <p className="text-sm leading-relaxed text-[var(--on-wood-soft)]">
          <span className="font-semibold text-on-wood">Tính cách: </span>
          {lore.personality}
        </p>
      )}
      {lore.quote && <blockquote className="border-l-2 border-[var(--frame-gold)] pl-3 italic">“{lore.quote}”</blockquote>}
      {people.length > 0 && (
        <div>
          <h4 className="text-sm text-[var(--on-wood-soft)]">Người liên quan</h4>
          <ul className="text-sm">
            {people.map((p) => (
              <li key={p.id}>
                {p.role}: <span className="font-semibold text-title-on-wood">{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-caption text-[var(--on-wood-soft)]">Nhân vật hư cấu của game, không phải người có trong sử.</p>
    </section>
  );
}
