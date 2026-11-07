// Tạo dữ liệu giả nhiều (hồ sơ đủ 74 tướng, kho 200 món, thành tựu, bảng xếp hạng 50 dòng, đấu trường, nhật lệnh, công trạng)
// cho `scripts/ui-audit.mjs --mock`. Chỉ để đo giao diện: JSON này không bao giờ ghi vào server hay cơ sở dữ liệu.
//
//   pnpm tsx scripts/ui-mock-data.ts /đường/dẫn/mock.json
//   node scripts/ui-audit.mjs --base http://localhost:3000 --register --mock /đường/dẫn/mock.json --detail

import { writeFileSync } from "node:fs";
import {
  ACHIEVEMENTS, ALL_COMPANIONS, CAMPAIGN_MISSION_IDS, GEAR_SETS, ELEMENTS, PROFESSIONS, buyGear, newProfile,
  type Profile, type GearOrder,
} from "@/core";
import { MAP_POOL } from "@/app/game/formation/maps";

let p: Profile = newProfile();
// Tất cả tướng, đủ cấp, có điểm kỹ năng.
const companions: Record<string, unknown> = {};
ALL_COMPANIONS.forEach((c, i) => { companions[c.id] = { xp: 100 * i, level: 1 + (i % 30), skillPoints: i % 5, skillLevels: { o1: 1 + (i % 5), o2: 1 + ((i + 1) % 5) }, branches: [] }; });
p = { ...p, gold: 987654, stones: 240, companions: companions as Profile["companions"],
  main: { ...p.main, level: 30, xp: 99999, skillPoints: 12 }, team: Object.keys(companions).slice(2, 4) };
// Kho đồ ~200 món.
p = { ...p, gold: 99_999_999 };
const slots = ["dinhMao", "yPhuc", "hoThu", "baoNgoa", "gioiChi", "hangLien", "hoPhu", "ngocBoi", "vuKhi"] as const;
let n = 0;
outer: for (let k = 0; k < 4; k++) for (const set of GEAR_SETS) for (const element of ELEMENTS) for (const slot of slots) {
  const order: GearOrder = { slot, element, set: set.id, tier: (k % 2 === 0 ? 2 : 3) as 2 | 3, ...(slot === "vuKhi" ? { profession: PROFESSIONS[n % PROFESSIONS.length] } : {}) };
  const r = buyGear(p, order);
  if (r.ok) { p = r.profile; n++; }
  if (n >= 200) break outer;
}
const ach = ACHIEVEMENTS.map((a) => a.id).filter((_, i) => i % 3 !== 0);
p = { ...p, campaign: { ...p.campaign, completed: [...CAMPAIGN_MISSION_IDS] as Profile["campaign"]["completed"] },
  quests: { ...p.quests, achievements: ach },
  survival: { best: 47 },
  formation: { collection: MAP_POOL.slice(0, 18).map((m) => m.id) },
};
const names = ["Trần Hồng Sơn", "Nguyễn Thị Phương Thảo", "Lê Văn Quang", "Đặng Hoàng Bảo Châu", "ShanChen", "Phạm Ngọc Khánh Linh", "Vũ Đức Thịnh", "Bùi Thanh Hằng", "Hoàng Minh Nhật Quang Huy", "Ngô Quyền"];
const nm = (i: number) => `${names[i % names.length]}${i >= names.length ? " " + i : ""}`;
const top = Array.from({ length: 50 }, (_, i) => ({ rank: i + 1, name: nm(i), mine: i === 6, score: 400 - i * 7 }));
const member = (c: (typeof ALL_COMPANIONS)[number]) => ({ id: c.id, name: c.name, element: c.element, profession: c.profession, level: 30 });
const mem = ALL_COMPANIONS.slice(0, 74);
const bundle = {
  profile: p,
  boards: { top, mine: { rank: 7, score: 358 } },
  destiny: { cycle: { cycleId: "c1", startAt: 0, endAt: 1 }, entries: top.map((t, i) => ({ rank: t.rank, name: t.name, mine: t.mine, clearedFloor: 40 - (i >> 1), totalTurns: 300 + i * 9 })), mine: { rank: 7, clearedFloor: 37, totalTurns: 360 } },
  ttk: { week: "w", top: top.map((t) => ({ rank: t.rank, name: t.name, mine: t.mine, points: 3000 - t.rank * 40, unitsSpent: 20 + t.rank })), mine: { rank: 7, points: 2700, unitsSpent: 27 } },
  arena: {
    rating: 1840, rank: 7, wins: 52, losses: 31, defenseWins: 18, defenseLosses: 9, attacksLeft: 3, attacksPerDay: 5,
    defense: { members: mem.slice(0, 3).map(member), power: 12400 },
    offers: Array.from({ length: 5 }, (_, i) => ({ name: nm(i + 2), rating: 1700 + i * 60, members: mem.slice(3 + i * 3, 6 + i * 3).map(member), power: 11000 + i * 700, bot: i % 2 === 0 })),
  },
  daily: {
    day: "2026-11-07",
    setup: { team: mem.slice(0, 3), foes: mem.slice(3, 6), warlord: "dinhLien", difficulty: "normal" },
    mine: { matchId: "m1", result: { won: true, turns: 14, permille: 620 }, rank: 7 },
    top: top.map((t) => ({ rank: t.rank, name: t.name, mine: t.mine, score: { won: t.rank % 3 !== 0, turns: 10 + t.rank, permille: 700 - t.rank * 6 } })),
  },
  honors: { signedIn: true, items: Array.from({ length: 40 }, (_, i) => ({ source: ["daily", "destiny", "survival", "arena", "tamTuongKy"][i % 5], title: "Hạng " + (i + 1) + " mùa", period: "2026-W" + (10 + i), rank: (i % 9) + 1, participants: 120 + i, gold: 500, claimedAt: 1760000000000 + i * 86400000 })) },
};
const out = process.argv[2];
if (!out) {
  console.error("Thiếu đường dẫn tệp đầu ra: pnpm tsx scripts/ui-mock-data.ts mock.json");
  process.exit(2);
}
writeFileSync(out, JSON.stringify(bundle));
console.log(`đã ghi ${out}: kho ${p.bag.length} món, ${Object.keys(p.companions).length} tướng, ${ach.length} thành tựu đã nhận`);
