# CAMP-01.01 — Story Node Contract

> Runtime source: `src/core/campaign/storyNodes.ts`
>
> Design authority: [Campaign V2 Design Freeze](design-freeze.md)

## Boundary

`StoryNode` is the Campaign V2 content unit. It owns stable identity, chapter, historical classification, source references, location, prerequisites, guaranteed Campaign gold and content unlocks.

`StoryNode` is a discriminated union with seven node types:

| Type | BattleScenario | Use |
|---|---|---|
| `story` | forbidden | narration, travel outcome or ceremony |
| `diplomacy` | forbidden | presentation-only choice and fixed historical outcome |
| `preparation` | forbidden | map, council, aftermath or logistical transition |
| `battle` | required | ordinary fictional/reconstructed combat |
| `defense` | required | standard combat presented as defense |
| `siege` | required | standard combat presented as siege |
| `boss` | required, including `bossTarget` | named warlord encounter |

Non-combat nodes never contain `foes` or a placeholder `BattleScenario`. `BattleScenario.encounterKey` is a reference to battle content that will be supplied by a later task; CAMP-01.01 does not invent fighter stats or change the Battle Engine.

## Stable fields

- `id`: frozen public IDs `M01`–`M24`.
- `slug`: unique lower-case ASCII content slug; changing it is a content routing breaking change.
- `chapter`: integer 1–6.
- `historicalBasis`: one or more of `recorded`, `legend`, `reconstructed`, `fictional`, `disputed`.
- `references`: IDs present in the frozen source ledger/warlord matrix allowlist.
- `location`: display name, optional modern region and certainty label.
- `prereqs`: existing mission IDs; graph must be acyclic.
- `rewards`: first-clear gold only. Campaign has no stone or guaranteed gear field.
- `unlockedContent`: typed companion or Raid unlock. A recruit unlock is gameplay availability, not a historical recruitment date.

## Registry validation

`validateStoryNodeRegistry` reports all violations in one pass:

- count, ID and slug stability/uniqueness;
- missing canonical IDs;
- empty/unknown historical references;
- missing/self/cyclic prerequisites;
- invalid reward values;
- scenario placement and scenario ID uniqueness;
- unknown boss or Raid targets.

The canonical registry is validated at module initialization. Tests additionally lock the exact progression graph, six chapters, reward total, node-type coverage, boss targets and the absence of combat fields on non-combat nodes.

## Warlord encounter catalog (CAMP-08.04)

The old 13-stage Campaign (`CampaignStage`, `CAMPAIGN`, `stageById`, `stageUnlocked`, `stageFoes`, `applyCampaignResult`, `RAID_STAGES`) was removed. `src/core/campaign/warlords.ts` is the standalone `WarlordEncounterCatalog` required by design-freeze section 5:

- `WARLORD_ENCOUNTERS`: 12 entries keyed by faction ID (`tranLam` … `doCanhThac`), in the old Raid order, with the old stage ID kept only as the internal `encounterId`; leader + aides, mode, base difficulty, base level, recommended level, place, modern region and Raid dialogue.
- `EncounterFoe` / `encounterFighter` replace `StageFoe` / `stageFighter`; `warlordLeader`, `BOSS_HP`, `HOME_TERRAIN`, `HOME_RULE` live here.
- Tower, Survival, Daily and Arena read this catalog by index exactly as they read `RAID_STAGES`, so the same seed yields the same opponents. They do not read V2 missions.
- Raid (`raids.ts`) is keyed by faction ID. A boss opens when the server has recorded its unlock mission (`unlockedContent` kind `raid`); Only the six `military` factions of the ledger are Raid bosses (rematches); `raidBossById` returns undefined for the other six, whose `raid` unlock entry only gates the shop. Battle payload: `{ raidBoss, raid }`; any `stage` payload is rejected.
- Leaderboard boards are `campaign` and `mission:<combat mission ID>`; `stage:<id>` boards are no longer written or accepted.

The V2 registry does not read or mutate progress. Completion, choice, reward and recruit settlement remain server-authoritative work for later CAMP-01 tasks.

## CampaignProgressV2

`src/core/progress/campaignState.ts` persists graph progress with `version: 2`:

- `completed` and `inProgress` contain only M01–M24 IDs;
- `storyChoices` and `storyFlags` accept allowlisted presentation values;
- `regionalOutcomes` accepts only the frozen region/outcome combinations;
- `bestBattleTurns` accepts positive turns for combat nodes only;
- `supply` replaces the old `food` field without changing its limits or price;
- `rewardReceipts` accepts only `node:`, `chapter:` and `hero:` receipts from the frozen catalog;
- `unlockedHeroes` accepts only the six Campaign hero IDs.

Unlock uses node prerequisites plus chapter gates. Chapters IV and V open in parallel after Chapter III; Chapter VI requires both routes. `completeCampaignNode` can complete story and diplomacy events without a battle result. It is a pure transition intended to be called only after server authorization. `recordCampaignRewardReceipt` is idempotent and never grants currency itself.

`raids` stores the best Raid tier (1–3) per faction ID. The former nested `legacy` field (old stage clears, old best turns, Raid tiers by old stage ID) is dropped by the parser; only Raid tiers are carried over, mapped from old stage ID to faction ID. Old stage completion is never converted into M IDs. Parsing a V1 Campaign starts V2 clean while retaining valid Raid tiers.

`resetCampaignProgressForDev` accepts only explicit `development` or `test` environments, resets Campaign fields and preserves Raid tiers plus every shared Profile field. Production and unknown environments fail closed. The reset function does not execute database operations.

## Non-combat event settlement

`src/core/campaign/events.ts` defines the non-combat event registry and the phases `meeting`, `dialogue`, `decision`, `completion`. Choices select a tone and narration key; all choices retain the same historical outcome and first-clear reward.

M05 represents the opening audience with Trần Lãm at Bố Hải and completes without a `BattleState`; M06 remains the formal alliance decision from the Narrative Bible. Outcome vocabulary is restricted to `allianced`, `submitted`, `dispersed`, `defeated`, with the node mapping sourced from the Mission/Warlord matrices.

`src/server/campaignEvents.ts` is the authoritative settlement boundary. It validates profile ownership through the owner-scoped `ProfileStore`, node unlock, event type and choice. A CAS profile update writes completion, choice, regional outcome, first-clear gold and `node:Mxx` receipt together. A retry returns zero reward. The route never invokes battle rewards, gear drop, combat quest progress or stone settlement.

## Battle scenario adapter

`src/core/campaign/scenarios.ts` defines four objective contracts behind one deterministic settlement entrypoint:

- `defeatEnemies`: succeeds only when the Battle Engine records the human side as winner and the enemy team has no HP.
- `surviveTurns`: succeeds when the configured number of player turns is complete and the human team remains alive; defeating the enemy earlier also succeeds. An AI winner always fails the objective.
- `breakSiege`: uses explicit `breach`, optional `escort` and `assault` phases. The current engine has fighter shields but no independently targetable structure/shield, so M20 is three sequential battles (breach → escort → assault; CAMP-06.02 merged the supply-escort beat into M20 without a new mission or reward) rather than a hidden global combat rule. `escort` succeeds after its configured player turns while the human team is alive, or by defeating the raiders; it is a fictional gameplay beat. The next phase is chosen by the server from `campaign.siegePhases`, which only advances when the settled match is the phase the profile is waiting for; a stale phase match keeps battle rewards but never advances the phase, refills Campaign food or grants first-clear rewards.
- `bossPhases`: requires the named boss fighter to exist and be at zero HP before accepting a human winner. The contract supports multiple phases. M21 (CAMP-06.03) is three sequential battles: an opening `breakSiege` breach phase (road), a boss phase that ends when the boss is alive at or below `hpThreshold` of max HP, and a final boss phase. The boss HP ratio left after a threshold phase is stored server-side in `campaign.phaseBossHp` and applied as the boss's starting `hpRatio` in the next phase, so damage is never reset; aides are fresh. Other boss nodes keep one phase.

`turn.number` is the number of side turns started, beginning at one. Completed player turns are `floor((turn.number - 1) / 2)` in server matches because AI turns execute immediately and extra actions do not increment the side-turn counter. Timeout therefore advances the objective through the same engine transition; abandonment still produces an AI winner and failure.

The adapter only reads `BattleState`: HP, food, winner, turn counter, server-generated board weights and the existing RNG states. It never consumes RNG or changes AI, skills, elements, timer, food/upkeep or board generation. Scenario plans declare `seedPolicy: server`; seeds remain absent from `MatchView`.

Each V2 battle match carries a `CampaignScenarioTag` containing node, scenario and phase identity. `settleCampaignScenarioMatch` rejects missing objectives, unknown phases, missing bosses, mismatched end events and winner/HP contradictions. `src/server/battles.ts` routes tagged matches through the V2 settlement path and prevents them from falling through to legacy Campaign settlement.

## First-clear rewards and recruitment

`src/core/campaign/rewards.ts` owns the Campaign-only profile transition for both non-combat events and battle scenarios. Mission completion, `node:Mxx` receipt, 250-gold chapter receipt, milestone recruit receipt, Campaign gold and remaining battle supply are written in one owner-scoped CAS profile update.

The frozen recruit milestones are M04 Đinh Liễn, M08 Nguyễn Bặc, M12 Đinh Điền, M16 Lưu Cơ, M20 Trịnh Tú and M24 Lê Hoàn. These are gameplay unlocks, not historical recruitment dates. A new companion starts at the main character's current level with corresponding XP and unspent skill points. An existing companion instance, progress and equipped gear are retained unchanged.

Battle settlement keeps the shared battle gold, XP, quest recording and deterministic gear-drop pipeline. A siege phase advances without completing its mission; only the final successful phase receives Campaign first-clear rewards. Non-combat events call only the Campaign reward transition and never generate battle XP, quest wins, gear drops or stones. Reload, replay and concurrent requests are deduplicated by match reward claim plus Campaign receipts; Campaign never modifies `stones` or Dual Tower rewards.
