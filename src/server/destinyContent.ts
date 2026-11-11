import {
  destinyEnemyPower,
  destinyFloorCount,
  destinyRunRulesVersion,
  destinyTierDifficulty,
  generateDestinyCycleRules,
  resolveFloor,
  type DestinyRun,
  type FloorDefinition,
  type LineupMember,
} from "@/core";
import { destinyCycleById, destinyCycleSeed } from "./destinyCycle";

export type DestinyContentError = "invalid_run" | "invalid_secret" | "floor_not_found";

/** Dựng lại snapshot cycle từ roster khóa; cùng cycle/secret/run luôn giống nhau. */
export function destinyCycleSnapshot(run: DestinyRun, secret: string) {
  if (run.stateVersion !== 1 || !run.cycleId || !run.fighters)
    return { ok: false as const, error: "invalid_run" as const };
  const cycleId = run.cycleId;
  const cycle = destinyCycleById(cycleId);
  // Run giữ version luật lúc tạo: run V1 mở trước khi phát hành V2 vẫn dựng lại đúng 10 tầng cũ.
  const version = destinyRunRulesVersion(run);
  if (!cycle || version > cycle.rulesVersion)
    return { ok: false as const, error: "invalid_run" as const };
  const seed = destinyCycleSeed({ ...cycle, rulesVersion: version }, secret, "rules");
  if (!seed) return { ok: false as const, error: "invalid_secret" as const };
  const roster: LineupMember[] = run.roster.slice(1).flatMap((id) => {
    const fighter = run.fighters![id];
    return fighter ? [{ id, element: fighter.config.element, profession: fighter.config.profession }] : [];
  });
  const generated = generateDestinyCycleRules(cycleId, seed, roster, { version });
  return generated.ok ? generated : { ok: false as const, error: generated.error === "invalid_secret" ? "invalid_secret" as const : "invalid_run" as const };
}

export function resolveDestinyFloor(run: DestinyRun, secret: string) {
  const snapshot = destinyCycleSnapshot(run, secret);
  if (!snapshot.ok) return snapshot;
  const version = destinyRunRulesVersion(run);
  const rule = snapshot.snapshot.floors.find(({ floor }) => floor === run.floor);
  if (!rule) return { ok: false as const, error: "floor_not_found" as const };
  const maxLevel = Math.max(1, ...Object.values(run.fighters ?? {}).map(({ level }) => level));
  const difficulty = destinyTierDifficulty(rule.tier);
  const definition: FloorDefinition = {
    mode: "destiny",
    floor: run.floor,
    rules: rule.rules,
    enemy: {
      level: maxLevel,
      power: destinyEnemyPower(run.floor, version),
      count: 3,
      difficulty,
    },
  };
  const resolved = resolveFloor(definition, snapshot.snapshot.cycleId);
  return resolved.ok
    ? { ok: true as const, floor: resolved.floor, cycle: snapshot.snapshot, floorCount: destinyFloorCount(version) }
    : { ok: false as const, error: "invalid_run" as const };
}
