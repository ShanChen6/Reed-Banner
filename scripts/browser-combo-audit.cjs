/* eslint-disable @typescript-eslint/no-require-imports */
// Browser-only fixtures. No production routes, accounts, battle settings or persisted server data changed.
const { chromium } = require("playwright");
const core = require("../src/core/index.ts");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const out = process.env.AUDIT_OUTPUT_DIR || "/workspace/combo-audit";
fs.mkdirSync(out, { recursive: true });
const names = {
  tuongSi: "Tướng sĩ",
  phapSu: "Pháp sư",
  binhLinh: "Binh lính",
  ySu: "Y sư",
  muuSi: "Mưu sĩ",
  quanSu: "Quân sư",
};
(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const results = [],
    errors = [];
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({
      viewport,
      isMobile: device === "mobile",
      hasTouch: device === "mobile",
    });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto("http://127.0.0.1:3000/game/practice");
    await p.getByRole("button", { name: "Đổi đội hình", exact: true }).click();
    for (const profession of core.PROFESSIONS) {
      await p
        .getByRole("radiogroup", { name: "Nghề nhân vật chính" })
        .getByRole("radio", { name: new RegExp("^" + names[profession]) })
        .click();
      const section = p
        .locator("section")
        .filter({ has: p.getByRole("heading", { name: /^Bộ kỹ năng/ }) });
      const rows = await section.locator("li").allTextContents();
      assert.equal(rows.length, 6);
      rows.forEach((s, i) => assert.ok(s.includes(`Ô ${i + 1}`)));
      const detail = p
        .locator("details")
        .filter({ has: p.getByText("Chi tiết kỹ năng", { exact: true }) })
        .first();
      if (!(await detail.evaluate((e) => e.open)))
        await detail.locator("summary").click();
      assert.ok(
        (await detail.innerText()).includes(
          core.COMBO_PASSIVES[core.PROFESSION_COMBO[profession]].name,
        ),
      );
    }
    results.push(
      `${device}: six profession previews, slots 1..6, ultimate at4; shared passive and skill opener details`,
    );
    // Actual legacy-profile parse -> real upgrade -> browser persistence -> reload, not a synthetic migration call.
    const old = core.newProfile();
    delete old.skillLayout;
    old.main = {
      ...core.autoProgress(20, null),
      skillPoints: 8,
      skillLevels: { o4: 5, o5: 2 },
    };
    await p.evaluate(
      (v) => localStorage.setItem("coLau.profile.v1", JSON.stringify(v)),
      old,
    );
    await p.reload();
    await p.getByRole("button", { name: "Đổi đội hình", exact: true }).click();
    await p
      .getByRole("radio", { name: "Tiến trình · cấp 20", exact: true })
      .click();
    await p.getByRole("button", { name: "+ (1)", exact: true }).first().click();
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("coLau.profile.v1")).main
          .skillPoints === 7,
    );
    const saved = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("coLau.profile.v1")),
    );
    assert.equal(saved.skillLayout, 2);
    assert.equal(saved.main.skillLevels.o4, 2);
    assert.equal(saved.main.skillLevels.o5, 5);
    await p.reload();
    assert.deepEqual(core.parseProfile(saved).main, saved.main);
    results.push(
      `${device}: real upgrade persists migrated o4=2/o5=5, layout2, points7; reload does not swap again`,
    );
    const main = core.buildMain(core.autoProgress(20, null), "loi", "tuongSi");
    const mate = core.buildCompanion(
      core.companionById("tranCuong"),
      core.autoProgress(20, null),
    );
    const healer = core.buildCompanion(
      core.companionById("maiThanh"),
      core.autoProgress(20, null),
    );
    const enemy = (i) => ({
      id: "foe" + i,
      name: "Đối thủ " + i,
      profession: "tuongSi",
      element: "loi",
      maxHp: 10000,
      atk: 10,
      def: 20,
      skills: ["role_tramKich"],
    });
    let state = core.createBattle({
      sides: [
        { fighters: [main, mate, healer], leader: 0 },
        { fighters: [enemy(1), enemy(2), enemy(3)], leader: 0 },
      ],
      seed: 71,
      timer: false,
    }).state;
    state.sides[0].fighters[0].energy = 100;
    state.sides[0].fighters[1].energy = 100;
    let r = core.act(state, {
      type: "skill",
      skill: "role_phaTran",
      target: 0,
    });
    assert.ok(r.ok);
    state = r.state;
    for (let n = 0; n < 2; n++) {
      r = core.act(
        { ...state, timer: true, turn: { ...state.turn, deadline: 0 } },
        { type: "timeout" },
        1,
      );
      assert.ok(r.ok);
      state = r.state;
    }
    state = { ...state, timer: false, turn: { ...state.turn, deadline: null } };
    r = core.act(state, { type: "selectActor", fighter: 1 });
    assert.ok(r.ok);
    state = r.state;
    assert.ok(state.sides[0].fighters[1].comboReady);
    const plain = structuredClone(state);
    delete plain.sides[0].fighters[1].comboReady;
    const baseline = core.act(plain, {
      type: "skill",
      skill: "role_tramKich",
      target: 0,
    });
    assert.ok(baseline.ok);
    const baseDamage = baseline.events.find(
      (e) => e.type === "damage" && e.source === "skill",
    ).amount;
    let seq = 0,
      sent = [],
      last = [];
    const payload = (events = []) => ({
      id: "combo-fixture",
      now: Date.now(),
      view: {
        battle: core.toView(state),
        seq,
        difficulty: "normal",
        forfeited: false,
      },
      events,
    });
    await ctx.addInitScript(() =>
      localStorage.setItem("coLau.online.battle", "combo-fixture"),
    );
    await p.route("**/api/battles/combo-fixture**", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        sent.push(body.action);
        const result = core.act(state, body.action);
        assert.ok(result.ok);
        state = result.state;
        last = result.events;
        seq++;
        await route.fulfill({ json: payload(last) });
      } else await route.fulfill({ json: payload() });
    });
    await p.goto("http://127.0.0.1:3000/game/play");
    await p
      .getByRole("button", { name: "Tiếp tục trận dở", exact: true })
      .click();
    const follow = p
      .locator("button")
      .filter({ has: p.getByText("Trần Cương", { exact: true }) })
      .first();
    await follow.getByText(/Phối hợp: Thừa thắng · Sẵn sàng/).waitFor();
    assert.ok((await follow.innerText()).includes("Đối thủ 1"));
    assert.ok((await follow.innerText()).includes("Đinh Bộ Lĩnh"));
    assert.ok(
      await p.evaluate(
        (w) => document.documentElement.scrollWidth <= w + 1,
        viewport.width,
      ),
    );
    const effects = structuredClone(state.sides[0].fighters[1].effects);
    state.sides[0].fighters[1].effects.push({
      kind: "silence",
      value: 0,
      turns: 2,
    });
    await p.reload();
    await p
      .getByRole("button", { name: "Tiếp tục trận dở", exact: true })
      .click();
    await follow.getByText(/Phối hợp: Thừa thắng · Đang bị chặn/).waitFor();
    state.sides[0].fighters[1].effects = effects;
    await p.reload();
    await p
      .getByRole("button", { name: "Tiếp tục trận dở", exact: true })
      .click();
    await follow.getByText(/Phối hợp: Thừa thắng · Sẵn sàng/).waitFor();
    results.push(
      `${device}: silence visibly blocks prepared combo; clearing silence restores availability before expiry`,
    );
    await p.screenshot({ path: `${out}/${device}-combo-ready.png` });
    const attack = p.locator("button").filter({ hasText: "Trảm kích" }).first();
    await attack.click();
    await p.keyboard.press("Escape");
    assert.equal(sent.length, 0);
    await attack.click();
    await Promise.all([
      p.waitForResponse(
        (r) => r.url().endsWith("/actions") && r.request().method() === "POST",
      ),
      p
        .locator("button")
        .filter({ has: p.getByText("Đối thủ 1", { exact: true }) })
        .first()
        .click(),
    ]);
    assert.equal(sent[0].target, 0);
    assert.ok(last.some((e) => e.type === "combo" && e.outcome === "used"));
    const damage = last.find(
      (e) => e.type === "damage" && e.source === "skill",
    ).amount;
    assert.equal(damage, Math.round(baseDamage * 1.2));
    assert.equal(state.sides[0].fighters[1].comboReady, undefined);
    results.push(
      `${device}: real skill -> passive -> chosen follow-up; target/source visible, cancel sends no action; damage ${baseDamage} -> ${damage}`,
    );
    // Real online profile UI + simulated authoritative handler verifies the wire layout marker.
    let onlineProfile = structuredClone(saved),
      profileSeq = 0,
      lastUpgrade;
    await p.route("**/api/profile", async (route) => {
      if (route.request().method() === "POST") {
        const a = route.request().postDataJSON().action;
        assert.equal(a.skillLayout, 2);
        lastUpgrade = a;
        const parsed = core.parseProfileAction(a);
        assert.ok(parsed);
        const update = core.applyProfileAction(onlineProfile, parsed);
        assert.ok(update.ok);
        onlineProfile = update.profile;
        profileSeq++;
      }
      await route.fulfill({
        json: { profile: onlineProfile, version: profileSeq },
      });
    });
    await p.goto("http://127.0.0.1:3000/game/profile");
    await p.getByRole("tab", { name: "Kỹ năng", exact: true }).click();
    const ult = core
      .characterSkills(onlineProfile.profession, onlineProfile.element)
      .find((d) => d.slot === 4);
    const upgrade = p
      .locator("li")
      .filter({ hasText: ult.name })
      .filter({ has: p.getByRole("button", { name: "+ (1)", exact: true }) })
      .first();
    await Promise.all([
      p.waitForResponse(
        (r) =>
          r.url().endsWith("/api/profile") && r.request().method() === "POST",
      ),
      upgrade.getByRole("button", { name: "+ (1)", exact: true }).click(),
    ]);
    assert.equal(lastUpgrade.key, "o4");
    assert.equal(onlineProfile.main.skillLevels.o4, 3);
    assert.equal(onlineProfile.main.skillLevels.o5, 5);
    assert.equal(onlineProfile.main.skillPoints, 6);
    results.push(
      `${device}: online ultimate upgrade sends layout2/o4; server parser upgrades correct skill and preserves o5`,
    );
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, errors }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
