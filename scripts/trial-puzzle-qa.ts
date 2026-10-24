import assert from "node:assert/strict";
import { analyzeFeasibility, createTrialRegistry, profileCandidates } from "../src/core";
import { TRIAL_FLOOR_DATA } from "../src/server/trialContent";
import { evaluateTrialFloor, trialTestProfile } from "../src/server/trialContentReport";

const registry = createTrialRegistry(TRIAL_FLOOR_DATA, { requireComplete: true });
assert.ok(registry.ok, "Trial registry phải đủ 20 tầng hợp lệ");
if (!registry.ok) process.exitCode = 1;
else {
  const roundtrip = createTrialRegistry(JSON.parse(registry.registry.snapshot()), { requireComplete: true });
  assert.ok(roundtrip.ok && roundtrip.registry.snapshot() === registry.registry.snapshot(), "snapshot phải deterministic");

  console.log("| Tầng | Seed | Giới hạn | Cặp starter hợp luật | Cấp -2 | Cấp chuẩn | Cấp +2 | Nhanh nhất |");
  console.log("|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const spec of registry.registry.all()) {
    const base = trialTestProfile(spec.enemy.level);
    const ids = Object.keys(base.companions);
    let legalStarterPairs = 0;
    for (let a = 0; a < ids.length; a++) {
      for (let b = a + 1; b < ids.length; b++) {
        const profile = { ...base, companions: { [ids[a]!]: base.companions[ids[a]!]!, [ids[b]!]: base.companions[ids[b]!]! } };
        if (analyzeFeasibility(spec.rules, profileCandidates(profile), { maxSamples: 1 }).status === "feasible")
          legalStarterPairs++;
      }
    }
    assert.ok(legalStarterPairs > 0, `tầng ${spec.floor} phải có ít nhất một cặp starter hợp luật`);
    const levels = [Math.max(1, spec.enemy.level - 2), spec.enemy.level, spec.enemy.level + 2];
    const results = levels.map((level) => evaluateTrialFloor(spec, 12, trialTestProfile(level)));
    const repeat = evaluateTrialFloor(spec, 12, trialTestProfile(spec.enemy.level));
    assert.deepEqual(repeat, results[1], `tầng ${spec.floor} phải deterministic`);
    assert.ok(results[1]!.wins >= 10, `tầng ${spec.floor} phải thắng >=10/12 ở cấp chuẩn`);
    assert.ok(results[0]!.wins >= 8, `tầng ${spec.floor} phải thắng >=8/12 ở cấp -2`);
    const rate = (index: number) => `${results[index]!.wins}/${results[index]!.sampleTeams}`;
    console.log(`| ${spec.floor} | ${spec.board.publicSeed} | ${spec.turnLimit} | ${legalStarterPairs}/10 | ${rate(0)} | ${rate(1)} | ${rate(2)} | ${results[1]!.sampleTurns ?? "—"} |`);
  }
}
