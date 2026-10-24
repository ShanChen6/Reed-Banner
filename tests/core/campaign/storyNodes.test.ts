import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_MISSION_IDS,
  HISTORICAL_REFERENCE_IDS,
  STORY_NODES,
  isCombatStoryNode,
  storyNodeById,
  validateStoryNodeRegistry,
  type StoryNode,
} from "../../../src/core";

describe("Campaign V2 story-node registry", () => {
  it("locks 24 unique stable IDs/slugs across six four-node chapters", () => {
    assert.equal(STORY_NODES.length, 24);
    assert.deepEqual(
      STORY_NODES.map((node) => node.id),
      CAMPAIGN_MISSION_IDS,
    );
    assert.equal(new Set(STORY_NODES.map((node) => node.id)).size, 24);
    assert.equal(new Set(STORY_NODES.map((node) => node.slug)).size, 24);
    assert.deepEqual(
      STORY_NODES.map((node) => node.slug),
      [
        "co-lau-trong-ky-uc",
        "sau-trieu-ngo-quyen",
        "giu-loi-vao-hoa-lu",
        "hoa-lu-nam-951",
        "duong-ra-bo-hai",
        "hoi-kien-tran-minh-cong",
        "hai-doi-mot-co-hieu",
        "ganh-quan-bo-hai",
        "tin-du-nam-965",
        "ban-do-khong-co-thu-tu",
        "dang-chau-quy-phuc",
        "binh-kieu-tu-dinh",
        "duong-lam-va-loi-cam-ket",
        "tam-dai-roi-thanh",
        "phong-chau",
        "hoi-ho",
        "sieu-loai",
        "tien-du",
        "te-giang-mo-duong",
        "tay-phu-liet",
        "do-dong",
        "sau-tieng-trong-tran",
        "hoi-quan-hoa-lu",
        "dai-co-viet-968",
      ],
    );
    for (let chapter = 1; chapter <= 6; chapter += 1)
      assert.equal(
        STORY_NODES.filter((node) => node.chapter === chapter).length,
        4,
      );
  });

  it("keeps non-combat nodes free of scenarios and fake foes", () => {
    for (const node of STORY_NODES) {
      if (isCombatStoryNode(node)) {
        assert.ok(node.scenario.encounterKey, node.id);
        assert.ok(
          [
            "defeatEnemies",
            "surviveTurns",
            "breakSiege",
            "bossPhases",
          ].includes(node.scenario.objective),
        );
      } else {
        assert.ok(!("scenario" in node), node.id);
        assert.ok(!("foes" in node), node.id);
      }
    }
    assert.ok(!isCombatStoryNode(storyNodeById("M01")!));
    assert.ok(!isCombatStoryNode(storyNodeById("M06")!));
  });

  it("resolves every historical reference and prerequisite", () => {
    const references = new Set<string>(HISTORICAL_REFERENCE_IDS);
    const ids = new Set<string>(CAMPAIGN_MISSION_IDS);
    for (const node of STORY_NODES) {
      assert.ok(node.references.length > 0, node.id);
      for (const reference of node.references)
        assert.ok(references.has(reference), `${node.id}: ${reference}`);
      for (const prereq of node.prereqs)
        assert.ok(ids.has(prereq), `${node.id}: ${prereq}`);
    }
    assert.deepEqual(validateStoryNodeRegistry(STORY_NODES), []);
  });

  it("locks the branching graph and canonical reward total", () => {
    assert.deepEqual(storyNodeById("M13")!.prereqs, ["M12"]);
    assert.deepEqual(storyNodeById("M17")!.prereqs, ["M12"]);
    assert.deepEqual(storyNodeById("M21")!.prereqs, ["M16", "M20"]);
    assert.equal(
      STORY_NODES.reduce(
        (total, node) => total + node.rewards.firstClearGold,
        0,
      ),
      3975,
    );
  });

  it("validates every boss target and all seven discriminants", () => {
    assert.deepEqual(
      [...new Set(STORY_NODES.map((node) => node.type))].sort(),
      [
        "battle",
        "boss",
        "defense",
        "diplomacy",
        "preparation",
        "siege",
        "story",
      ],
    );
    const bosses = STORY_NODES.filter((node) => node.type === "boss");
    assert.deepEqual(
      bosses.map((node) => node.scenario.bossTarget),
      ["kieuCongHan", "kieuThuan", "lyKhue", "nguyenThuTiep", "doCanhThac"],
    );
    assert.deepEqual(
      STORY_NODES.flatMap((node) =>
        node.unlockedContent
          .filter((unlock) => unlock.kind === "companion")
          .map((unlock) => [node.id, unlock.id]),
      ),
      [
        ["M04", "dinhLien"],
        ["M08", "nguyenBac"],
        ["M12", "dinhDien"],
        ["M16", "luuCo"],
        ["M20", "trinhTu"],
        ["M24", "leHoan"],
      ],
    );
    assert.equal(
      STORY_NODES.flatMap((node) =>
        node.unlockedContent.filter((unlock) => unlock.kind === "raid"),
      ).length,
      12,
    );
  });

  it("reports invalid cross-references without accepting partial registries", () => {
    const invalid = [
      {
        ...STORY_NODES[0],
        prereqs: ["M99"],
        references: ["E99"],
      },
    ] as unknown as readonly StoryNode[];
    assert.deepEqual(validateStoryNodeRegistry(invalid), [
      "expected 24 nodes, received 1",
      "M01: unknown historical reference E99",
      "M01: unknown prerequisite M99",
      ...CAMPAIGN_MISSION_IDS.slice(1).map(
        (id) => `${id}: missing canonical mission`,
      ),
      "chapter 1: expected 4 nodes",
      "chapter 2: expected 4 nodes",
      "chapter 3: expected 4 nodes",
      "chapter 4: expected 4 nodes",
      "chapter 5: expected 4 nodes",
      "chapter 6: expected 4 nodes",
    ]);
  });
});
