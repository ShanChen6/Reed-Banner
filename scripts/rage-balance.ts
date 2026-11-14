// So sánh luật Nộ cũ (một thanh của thủ lĩnh) với Nộ riêng từng tướng ở Nhật Lệnh và Quần Hùng (bóng ma).
// Chạy hai lần rồi so: PER_FIGHTER_RAGE=0 pnpm exec tsx scripts/rage-balance.ts --battles 300 > cu.json
//                       PER_FIGHTER_RAGE=1 pnpm exec tsx scripts/rage-balance.ts --battles 300 > moi.json
// Người chơi do AI Thường đánh thay; Nhật Lệnh dùng đề từng ngày, Quần Hùng dùng đội khởi đầu đấu bóng ma cùng cấp.

import { parseArgs } from "node:util";
import {
  ARENA_DIFFICULTY,
  DAILY_DIFFICULTY,
  autoProgress,
  botDefense,
  dailySetup,
  ghostTeam,
  newProfile,
  profileTeam,
  runBattle,
  type SideIndex,
} from "../src/core";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: { battles: { type: "string", default: "300" }, levels: { type: "string", default: "5,10,20" } },
});
const n = Number(values.battles);

const rate = (wins: number, total: number) => Math.round((wins / total) * 1000) / 1000;

// Nhật Lệnh
let dw = 0;
let dPassives = 0;
for (let i = 0; i < n; i++) {
  const s = dailySetup(1000 + i);
  const r = runBattle(
    { sides: [{ fighters: s.team, leader: 0 }, { fighters: s.foes, leader: 0 }], seed: 5000 + i, firstSide: 0, weights: s.weights } as never,
    { difficulty: ["normal", DAILY_DIFFICULTY] },
  );
  if (r.winner === 0) dw++;
  dPassives += r.passives ?? 0;
}

// Quần Hùng: đội khởi đầu cấp L đấu bóng ma cấp L
const arena: Record<string, { winRate: number; passives: number }> = {};
for (const level of values.levels!.split(",").map(Number)) {
  let w = 0;
  let p = 0;
  for (let i = 0; i < n; i++) {
    const mine = profileTeam({ ...newProfile(), main: autoProgress(level, null) }, newProfile().team);
    const foe = ghostTeam(botDefense(2000 + i, level), "Bóng ma");
    const r = runBattle(
      { sides: [{ fighters: mine, leader: 0 }, { fighters: foe, leader: 0 }], seed: 7000 + i, firstSide: ((7000 + i) & 1) as SideIndex } as never,
      { difficulty: ["normal", ARENA_DIFFICULTY] },
    );
    if (r.winner === 0) w++;
    p += r.passives ?? 0;
  }
  arena[`cap${level}`] = { winRate: rate(w, n), passives: Math.round((p / n) * 10) / 10 };
}

console.log(
  JSON.stringify(
    { perFighterRage: process.env.PER_FIGHTER_RAGE !== "0", battles: n, nhatLenh: { winRate: rate(dw, n), passives: Math.round((dPassives / n) * 10) / 10 }, quanHung: arena },
    null,
    2,
  ),
);
