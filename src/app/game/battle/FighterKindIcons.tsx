import { ElementIcon, ProfessionIcon } from "@/app/game/art/icons";
import type { FighterConfig } from "@/core";
import { ELEMENT_NAME, PROFESSION_NAME } from "./labels";
import { FUSION_ELEMENT_NAME, FUSION_PROFESSION_NAME, FUSION_PROFESSION_TITLE, elementTitle, isFusion } from "./special-labels";

/**
 * Biểu tượng nghề và hệ của một nhân vật trong trận. Nhân vật dung hợp dùng hai biểu tượng riêng (Vạn nghề, Vạn hệ);
 * hệ phòng thủ, quyết định khắc chế, hiện bằng biểu tượng hệ nhỏ ở góc dưới biểu tượng Vạn hệ, và chú thích khi rê chuột.
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
      <span title={elementTitle(fighter)} className={`relative inline-flex shrink-0 ${fusion ? "mr-1.5" : ""}`}>
        <ElementIcon element={fusion ? "tongHop" : fighter.element} className={className} />
        {/* Nhân vật dung hợp: biểu tượng hệ phòng thủ nhỏ ở góc dưới biểu tượng Vạn hệ. */}
        {fusion && <ElementIcon element={fighter.element} className="absolute -bottom-1 -right-1.5 size-3 rounded-full bg-black/60 ring-1 ring-black/70" />}
        <span className="sr-only">{fusion ? `${FUSION_ELEMENT_NAME}, phòng thủ ${ELEMENT_NAME[fighter.element]}` : ELEMENT_NAME[fighter.element]}</span>
      </span>
      {/* Nhân vật dung hợp đã có biểu tượng hệ phòng thủ ở góc nên không ghi chữ; chi tiết ở chú thích. */}
      {showName && !fusion && <span className="hidden lg:inline">{ELEMENT_NAME[fighter.element]}</span>}
    </>
  );
}
