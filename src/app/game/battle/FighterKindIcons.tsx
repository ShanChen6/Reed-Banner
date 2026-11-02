import { ElementIcon, ProfessionIcon } from "@/app/game/art/icons";
import type { FighterConfig } from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME } from "./labels";
import { FUSION_PROFESSION_TITLE, elementTitle, isFusion } from "./special-labels";

/**
 * Biểu tượng nghề và hệ của một nhân vật trong trận. Nhân vật dung hợp: biểu tượng nghề tổng hợp, và biểu tượng hệ
 * phòng thủ (quyết định khắc chế) kèm dấu tổng hợp nhỏ ở góc.
 */
export default function FighterKindIcons({
  fighter,
  className = "size-3.5",
  showName = false,
}: {
  fighter: Pick<FighterConfig, "special" | "profession" | "element">;
  className?: string;
  showName?: boolean;
}) {
  const fusion = isFusion(fighter);
  const professionTitle = fusion ? FUSION_PROFESSION_TITLE : PROFESSION_NAME[fighter.profession];
  return (
    <>
      <span title={professionTitle} className="shrink-0">
        <ProfessionIcon profession={fusion ? "tongHop" : fighter.profession} className={className} />
        <span className="sr-only">{fusion ? "Nghề tổng hợp" : PROFESSION_NAME[fighter.profession]}</span>
      </span>
      <span title={elementTitle(fighter)} className="relative inline-flex shrink-0" data-fusion={fusion || undefined}>
        <ElementIcon element={fighter.element} className={className} />
        {fusion && <ElementIcon element="tongHop" className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-1 ring-black/60" />}
        <span className="sr-only">{fusion ? `${ELEMENT_NAME[fighter.element]}, hệ tổng hợp` : ELEMENT_NAME[fighter.element]}</span>
      </span>
      {showName && <span className="hidden lg:inline">{fusion ? `${ELEMENT_NAME[fighter.element]} · tổng hợp` : ELEMENT_NAME[fighter.element]}</span>}
    </>
  );
}
