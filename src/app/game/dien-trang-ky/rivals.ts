// Mười hai sứ quân làm đối thủ máy ở Điền Trang Ký: chân dung, hệ, nghề lấy từ Bình Loạn; lối chơi theo tính cách (src/core/dien-trang-ky/bot.ts).

import { WARLORD_ENCOUNTERS } from "@/core";
import { LORD_STYLE, STYLES } from "@/core/dien-trang-ky";

export const DTK_RIVALS = WARLORD_ENCOUNTERS.filter((w) => w.id in LORD_STYLE).map((w) => {
  const foe = w.foes[0]!;
  const style = STYLES[LORD_STYLE[w.id]!];
  return { id: w.id, name: foe.name, element: foe.element, profession: foe.profession, place: w.place, style: style.name, summary: style.summary };
});

export type DtkRival = (typeof DTK_RIVALS)[number];

export const DTK_RIVAL_INFO: Readonly<Record<string, DtkRival>> = Object.fromEntries(DTK_RIVALS.map((r) => [r.id, r]));
