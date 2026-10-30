import {
  comboSkillCost,
  ENERGY_MAX,
  fighterSkill,
  FOOD_MAX,
  RAGE_MAX,
  type BattleEvent,
  type BattleState,
  type Side,
} from "@/core";

type Sides = BattleState["sides"];

/**
 * Chỉ số hai phe sau một nhóm sự kiện, dựng từ `sides` trước đó.
 * Một lần act có thể kết thúc lượt phe này và mở lượt phe kia; giao diện diễn từng phe một rồi mới commit
 * state cuối, nên trong lúc nghỉ chuyển phe thẻ nhân vật phải hiện chỉ số đã cộng (năng lượng, máu, nộ...)
 * thay vì giữ số cũ tới lượt sau. `after` là state cuối của act, dùng để lấy giá trị hiệu ứng mới
 * (sự kiện "effect" không mang giá trị) và hai phe khi sang đợt sinh tồn mới.
 */
export function sidesAfterEvents(
  sides: Sides,
  events: readonly BattleEvent[],
  after: BattleState,
): Sides {
  const next = structuredClone(sides) as [Side, Side];
  const fighter = (e: { side: 0 | 1; fighter: number }) =>
    next[e.side].fighters[e.fighter];
  for (const e of events) {
    switch (e.type) {
      case "damage": {
        const f = fighter(e);
        if (!f) break;
        f.hp = Math.max(0, f.hp - e.amount);
        const shield = f.effects.find((x) => x.kind === "shield");
        if (shield && e.absorbed > 0) {
          shield.value -= e.absorbed;
          if (shield.value <= 0) f.effects = f.effects.filter((x) => x !== shield);
        }
        break;
      }
      case "heal": {
        const f = fighter(e);
        if (f) f.hp = Math.min(f.maxHp, f.hp + e.amount);
        break;
      }
      case "energy": {
        const f = fighter(e);
        if (f) f.energy = Math.min(ENERGY_MAX, Math.max(0, f.energy + e.amount));
        break;
      }
      case "spirit": {
        const f = fighter(e);
        if (f) f.spirit = e.spirit;
        break;
      }
      case "ko": {
        const f = fighter(e);
        if (f) f.hp = 0;
        break;
      }
      case "revive": {
        const f = fighter(e);
        if (f) f.hp = e.hp;
        break;
      }
      case "effect": {
        const f = fighter(e);
        if (!f) break;
        const now = after.sides[e.side].fighters[e.fighter]?.effects.find(
          (x) => x.kind === e.effect,
        );
        if (!now) break;
        f.effects = [...f.effects.filter((x) => x.kind !== e.effect), { ...now }];
        break;
      }
      case "effectEnd": {
        const f = fighter(e);
        if (!f) break;
        f.effects = f.effects.filter((x) => x.kind !== e.effect);
        // One poison source may expire while another still has a tick remaining.
        if (e.effect === 'poison') f.effects.push(...structuredClone(after.sides[e.side].fighters[e.fighter]?.effects.filter(x=>x.kind==='poison') ?? []));
        // Hết Đóng băng thì core tự thêm Miễn băng, không phát sự kiện "effect".
        const immune = e.effect === "freeze" &&
          after.sides[e.side].fighters[e.fighter]?.effects.find((x) => x.kind === "freezeImmune");
        if (immune && !f.effects.some((x) => x.kind === "freezeImmune")) f.effects.push({ ...immune });
        break;
      }
      case "food":
        next[e.side].food = Math.min(FOOD_MAX, Math.max(0, next[e.side].food + e.amount));
        break;
      case "upkeep":
        next[e.side].food = e.food;
        break;
      case "rage":
        next[e.side].rage = Math.min(RAGE_MAX, next[e.side].rage + e.amount);
        break;
      case "passive":
        // Đầy nộ thì bị động kích hoạt và nộ về 0.
        next[e.side].rage = 0;
        break;
      case "skill": {
        // Tiền kỹ năng trừ thẳng, không có sự kiện "energy" riêng.
        const f = fighter(e);
        const def = f && fighterSkill(f, e.skill);
        if (f && def) f.energy = Math.max(0, f.energy - comboSkillCost(f, def));
        break;
      }
      case "wave":
        // Sang đợt sinh tồn mới: dựng lại cả hai phe (hồi máu, đội đối thủ mới).
        return structuredClone(after.sides);
    }
  }
  return next;
}
