// Fresh on/off controls on the SAME skill layout, AI, gear, seeds and cap. Never reuse old skill outcomes.
import { parseArgs } from "node:util";
import {
  screeningCases,
  spiritCases,
  pressureCases,
  campaignAuditCases,
} from "../src/core/sim/audit";
import { runMeasured } from "./lib/spirit-runner";
const { values: v } = parseArgs({
  options: {
    group: { type: "string", default: "pilot" },
    mode: { type: "string", default: "on" },
    shard: { type: "string", default: "0" },
    shards: { type: "string", default: "1" },
    trace: { type: "string" },
  },
});
if (
  !["pilot", "screen", "focused", "campaign"].includes(v.group) ||
  !["on", "off"].includes(v.mode)
)
  throw new Error("invalid group/mode");
const shard = Number(v.shard),
  shards = Number(v.shards);
if (
  !Number.isSafeInteger(shard) ||
  !Number.isSafeInteger(shards) ||
  shards < 1 ||
  shard < 0 ||
  shard >= shards
)
  throw new Error("invalid shard");
const cases =
  v.group === "screen"
    ? screeningCases()
    : v.group === "campaign"
      ? campaignAuditCases()
      : v.group === "focused"
        ? [...spiritCases(), ...pressureCases()]
        : [
            ...spiritCases().filter(
              (c) => c.level === 20 && c.id.includes("3v3"),
            ),
            ...pressureCases()
              .filter((c) => c.level === 20)
              .slice(0, 8),
          ];
const selected = cases.filter((c, i) =>
  v.trace ? c.id === v.trace : i % shards === shard,
);
if (!selected.length) throw new Error("empty selection");
for (const original of selected) {
  const c = structuredClone(original);
  if (v.mode === "off")
    for (const s of c.matchup.sides)
      for (const f of s.fighters)
        delete (f as { comboPassive?: string }).comboPassive;
  const r = runMeasured(c, "after", "A", 120, Boolean(v.trace));
  console.log(JSON.stringify({ ...r, comboMode: v.mode }));
}
