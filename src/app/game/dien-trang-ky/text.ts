// Chữ hiển thị của Điền Trang Ký: nhật ký ván, tên ô, tiền.

import { LEVEL_NAME, OMENS, TILES, type DtkEvent, type DtkState } from "@/core/dien-trang-ky";

export const money = (n: number) => `${n.toLocaleString("vi-VN")} quan`;
export const tileName = (i: number) => TILES[i]?.name ?? "";

const PAY_REASON = { poll: "thuế đinh", tribute: "cống nạp", omen: "theo quẻ", boat: "tiền đò", each: "chia cho mỗi người" } as const;

/** Một dòng nhật ký; null với sự kiện không cần kể (đi ô đã có dòng đổ xúc xắc). */
export function eventText(e: DtkEvent, s: DtkState): string | null {
  const who = s.players[e.seat]?.name ?? "";
  const name = (seat: number) => s.players[seat]?.name ?? "";
  switch (e.k) {
    case "roll":
      return `${who} đổ ${e.dice[0]} và ${e.dice[1]}${e.dice[0] === e.dice[1] ? ", ra đôi" : ""}.`;
    case "move":
      return e.back ? `${who} lùi về ${tileName(e.to)}.` : `${who} tới ${tileName(e.to)}.`;
    case "salary":
      return `${who} qua Hoa Lư, lĩnh ${money(e.amount)} lương vòng.`;
    case "buy":
      return `${who} mua ${tileName(e.tile)}${e.level ? `, dựng luôn ${LEVEL_NAME[e.level]}` : ""} (${money(e.cost)}).`;
    case "build":
      return `${who} xây ${tileName(e.tile)} lên ${LEVEL_NAME[e.level]} (${money(e.cost)}).`;
    case "rent":
      return `${who} nộp ${money(e.amount)} tô cho ${name(e.owner)} ở ${tileName(e.tile)}.`;
    case "blessUsed":
      return `${who} được phúc Thổ Thần, miễn tô ở ${tileName(e.tile)}.`;
    case "buyout":
      return `${who} mua lại ${tileName(e.tile)} của ${name(e.from)} với giá ${money(e.cost)}.`;
    case "omen": {
      const o = OMENS.find((x) => x.id === e.omen);
      return o ? `${who} rút quẻ “${o.title}”: ${o.text}` : null;
    }
    case "pay":
      return `${who} nộp ${money(e.amount)} ${PAY_REASON[e.reason]}.`;
    case "gain":
      return `${who} nhận ${money(e.amount)}.`;
    case "sell":
      return `${who} bán ${tileName(e.tile)} lại cho triều đình, được ${money(e.amount)}.`;
    case "out":
      return e.resign ? `${who} rời ván, đất về trống.` : `${who} phá sản${e.by !== null ? ` vì nợ ${name(e.by)}` : ""}, đất về trống.`;
    case "skipTurn":
      return `${who} mất lượt này.`;
    case "mire":
      return `${who} sa lầy, mất lượt kế tiếp.`;
    case "blessing":
      return `${who} được phúc Thổ Thần: lần nộp tô kế tiếp được miễn.`;
    case "festival":
      return `${who} mở Hội Cờ Lau ở ${tileName(e.tile)}, tô ô này gấp đôi.`;
    case "ride":
      return `${who} phi ngựa trạm tới ${tileName(e.to)}.`;
    case "freeBuild":
      return `Thợ làng dựng giúp ${who}: ${tileName(e.tile)} lên ${LEVEL_NAME[e.level]}.`;
    case "extra":
      return `${who} ra đôi, được đổ thêm một lần.`;
    case "end":
      return `Ván xong. ${name(e.ranking[0]!)} thành phú hộ đất Hoa Lư.`;
  }
}
