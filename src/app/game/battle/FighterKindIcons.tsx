import { ElementIcon, ProfessionIcon } from "@/app/game/art/icons";
import type { FighterConfig } from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME } from "./labels";
import { FUSION_ELEMENT_NAME, FUSION_PROFESSION_NAME, FUSION_PROFESSION_TITLE, elementLabel, elementTitle, isFusion } from "./special-labels";

/**
 * Biểu tượng nghề và hệ của một nhân vật trong trận. Nhân vật dung hợp dùng hai biểu tượng riêng (Vạn nghề, Vạn hệ);
 * hệ phòng thủ, quyết định khắc chế, ghi bằng chữ cạnh biểu tượng và trong chú thích.
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
  return (
    <>
      <span title={fusion ? FUSION_PROFESSION_TITLE : PROFESSION_NAME[fighter.profession]} className="shrink-0">
        <ProfessionIcon profession={fusion ? "tongHop" : fighter.profession} className={className} />
        <span className="sr-only">{fusion ? FUSION_PROFESSION_NAME : PROFESSION_NAME[fighter.profession]}</span>
      </span>
      <span title={elementTitle(fighter)} className="shrink-0">
        <ElementIcon element={fusion ? "tongHop" : fighter.element} className={className} />
        <span className="sr-only">{fusion ? `${FUSION_ELEMENT_NAME}, phòng thủ ${ELEMENT_NAME[fighter.element]}` : ELEMENT_NAME[fighter.element]}</span>
      </span>
      {showName && <span className={fusion ? "truncate" : "hidden lg:inline"}>{elementLabel(fighter)}</span>}
    </>
  );
}
