import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { AMBIENCE_IDS, CUE_IDS, MUSIC_IDS } from "../../src/app/game/audio/cues";
import { AudioEngine, MAX_CONCURRENT, MIN_GAP_MS, type ContextLike, type EngineEnv, type GainLike, type SourceLike } from "../../src/app/game/audio/engine";
import { EMPTY_MANIFEST, parseManifest } from "../../src/app/game/audio/manifest";
import { DEFAULT_SETTINGS, parseSettings } from "../../src/app/game/audio/settings";

class FakeParam {
  value = 1;
  targets: number[] = [];
  setTargetAtTime(target: number) {
    this.targets.push(target);
    this.value = target;
  }
}
class FakeGain implements GainLike {
  gain = new FakeParam();
  connect() {}
  disconnect() {}
}
class FakeSource implements SourceLike {
  buffer: unknown = null;
  loop = false;
  playbackRate = new FakeParam();
  onended: (() => void) | null = null;
  started = 0;
  stopped = 0;
  connect() {}
  disconnect() {}
  start() {
    this.started += 1;
  }
  stop() {
    this.stopped += 1;
  }
}
class FakeContext implements ContextLike {
  currentTime = 0;
  destination = {};
  state = "running";
  gains: FakeGain[] = [];
  sources: FakeSource[] = [];
  suspended = 0;
  resumed = 0;
  createGain() {
    const g = new FakeGain();
    this.gains.push(g);
    return g;
  }
  createBufferSource() {
    const s = new FakeSource();
    this.sources.push(s);
    return s;
  }
  async decodeAudioData() {
    return { fake: true };
  }
  async resume() {
    this.resumed += 1;
  }
  async suspend() {
    this.suspended += 1;
  }
}

const MANIFEST = {
  ambience: { atlas: { file: "amb/atlas", volume: 0.3 } },
  version: 1,
  sfx: { "formation.place": { files: ["sfx/formation/place_a", "sfx/formation/place_b"], volume: 0.5 }, "formation.line": { files: ["sfx/formation/line"] } },
  music: { formation_play: { file: "music/formation_play", layer: "music/formation_play_layer2", volume: 0.6 }, formation_menu: { file: "music/formation_menu" } },
};

function setup(opts: { ctx?: boolean; manifest?: unknown } = {}) {
  const ctx = new FakeContext();
  let clock = 1000;
  const fetched: string[] = [];
  const env: EngineEnv = {
    createContext: () => (opts.ctx === false ? null : ctx),
    fetchBytes: async (url) => {
      fetched.push(url);
      return new ArrayBuffer(8);
    },
    loadManifest: async () => opts.manifest ?? MANIFEST,
    ext: ".ogg",
    random: () => 0.5,
    now: () => clock,
    parseManifest,
  };
  const engine = new AudioEngine(env);
  return { engine, ctx, fetched, tick: (ms: number) => (clock += ms) };
}

/** Mở khóa và tải sẵn để cue phát được ngay. */
async function ready(opts: Parameters<typeof setup>[0] = {}) {
  const s = setup(opts);
  await s.engine.unlock();
  await s.engine.preload(["formation.place", "formation.line"]);
  return s;
}

describe("AudioEngine", () => {
  it("chưa mở khóa thì không phát gì", async () => {
    const { engine, ctx } = setup();
    assert.equal(engine.play("formation.place"), false);
    assert.equal(ctx.sources.length, 0);
    assert.equal(engine.isUnlocked, false);
  });

  it("không có AudioContext (trình duyệt cũ) thì im lặng, không lỗi", async () => {
    const { engine } = setup({ ctx: false });
    await engine.unlock();
    assert.equal(engine.isUnlocked, false);
    assert.equal(engine.play("formation.place"), false);
  });

  it("phát cue có trong manifest sau khi mở khóa và tải sẵn, với âm lượng gốc và tốc độ lệch trong ±3%", async () => {
    const { engine, ctx } = await ready();
    assert.equal(engine.play("formation.place"), true);
    const src = ctx.sources.at(-1)!;
    assert.equal(src.started, 1);
    assert.ok(Math.abs(src.playbackRate.value - 1) <= 0.03 + 1e-9);
    const gain = ctx.gains.at(-1)!;
    assert.equal(gain.gain.value, 0.5);
  });

  it("cue ngoài manifest hoặc chưa tải thì im lặng; lần đầu chưa có buffer sẽ tải để lần sau phát được", async () => {
    const { engine, fetched } = await ready();
    assert.equal(engine.play("formation.win"), false);
    const s = setup();
    await s.engine.unlock();
    assert.equal(s.engine.play("formation.place"), false);
    await new Promise((r) => setTimeout(r, 5));
    assert.ok(s.fetched.some((u) => u.startsWith("/audio/sfx/formation/place_") && u.endsWith(".ogg")));
    s.tick(100);
    assert.equal(s.engine.play("formation.place"), true);
    assert.ok(fetched.length > 0);
  });

  it("tắt tiếng thì không phát; bật lại thì phát", async () => {
    const { engine, tick } = await ready();
    engine.setMuted(true);
    assert.equal(engine.play("formation.place"), false);
    engine.setMuted(false);
    tick(100);
    assert.equal(engine.play("formation.place"), true);
  });

  it("cùng cue cách nhau tối thiểu 40 ms", async () => {
    const { engine, tick } = await ready();
    assert.equal(engine.play("formation.place"), true);
    tick(MIN_GAP_MS - 5);
    assert.equal(engine.play("formation.place"), false);
    tick(10);
    assert.equal(engine.play("formation.place"), true);
  });

  it("tối đa 8 cue đồng thời; kết thúc thì giải phóng chỗ", async () => {
    const { engine, ctx, tick } = await ready();
    const ids = ["formation.place", "formation.line"] as const;
    let played = 0;
    for (let i = 0; i < 20; i++) {
      tick(MIN_GAP_MS + 1);
      if (engine.play(ids[i % 2]!)) played += 1;
    }
    assert.equal(played, MAX_CONCURRENT);
    assert.equal(engine.activeCount, MAX_CONCURRENT);
    ctx.sources[ctx.sources.length - 1]!.onended?.();
    assert.equal(engine.activeCount, MAX_CONCURRENT - 1);
  });

  it("rate truyền vào nhân với tốc độ phát", async () => {
    const { engine, ctx } = await ready();
    engine.play("formation.line", { rate: 1.2 });
    assert.ok(Math.abs(ctx.sources.at(-1)!.playbackRate.value - 1.2) <= 1.2 * 0.03 + 1e-9);
  });

  it("âm lượng từng bus được kẹp 0..1 và áp dụng", async () => {
    const { engine, ctx } = await ready();
    engine.setVolume("sfx", 5);
    engine.setVolume("music", -2);
    const values = ctx.gains.flatMap((g) => g.gain.targets);
    assert.ok(values.includes(1) && values.includes(0));
  });

  it("nhạc nền: gọi trước khi mở khóa thì nhớ và phát khi mở khóa; lớp căng thẳng theo setLayer; cùng bài không phát lại", async () => {
    const { engine, ctx } = setup();
    void engine.playMusic("formation_play");
    assert.equal(ctx.sources.length, 0);
    await engine.unlock();
    await new Promise((r) => setTimeout(r, 5));
    assert.equal(engine.currentMusic, "formation_play");
    const sources = ctx.sources.length;
    assert.equal(sources, 2, "bài chính và lớp thêm");
    assert.ok(ctx.sources.every((s) => s.loop && s.started === 1));
    await engine.playMusic("formation_play");
    assert.equal(ctx.sources.length, sources);
    engine.setLayer(0.66);
    assert.ok(ctx.gains.some((g) => g.gain.targets.includes(0.66)));
  });

  it("đổi bài thì bài cũ dừng sau crossfade và bài mới phát", async () => {
    const { engine, ctx } = await ready();
    await engine.playMusic("formation_play");
    await engine.playMusic("formation_menu");
    assert.equal(engine.currentMusic, "formation_menu");
    assert.ok(ctx.sources.filter((s) => s.stopped > 0).length >= 2);
    engine.stopMusic(0);
    assert.equal(engine.currentMusic, null);
  });

  it("âm thanh nền chạy kênh riêng, không đụng nhạc nền; dừng riêng được", async () => {
    const { engine, ctx } = await ready();
    await engine.playMusic("formation_menu");
    await engine.playAmbience("atlas");
    assert.equal(engine.currentMusic, "formation_menu");
    assert.equal(engine.currentAmbience, "atlas");
    const amb = ctx.sources.at(-1)!;
    assert.ok(amb.loop && amb.started === 1);
    engine.stopAmbience(0);
    assert.equal(engine.currentAmbience, null);
    assert.equal(engine.currentMusic, "formation_menu");
    assert.ok(amb.stopped > 0);
  });

  it("âm thanh nền gọi trước khi mở khóa thì phát khi mở khóa", async () => {
    const { engine } = setup();
    void engine.playAmbience("atlas");
    await engine.unlock();
    await new Promise((r) => setTimeout(r, 5));
    assert.equal(engine.currentAmbience, "atlas");
  });

  it("nhạc không có trong manifest thì không phát và bỏ bài cũ", async () => {
    const { engine } = await ready();
    await engine.playMusic("formation_play");
    await engine.playMusic("formation_result_win");
    assert.equal(engine.currentMusic, null);
  });

  it("tab ẩn thì tạm dừng, hiện lại thì tiếp tục", async () => {
    const { engine, ctx } = await ready();
    engine.setHidden(true);
    engine.setHidden(false);
    assert.equal(ctx.suspended, 1);
    assert.ok(ctx.resumed >= 2);
  });

  it("hạ nhạc khi có giọng đọc rồi trả lại", async () => {
    const { engine, ctx, tick } = await ready();
    engine.duckFor(300);
    assert.ok(ctx.gains.some((g) => g.gain.targets.some((t) => Math.abs(t - 0.5 * 0.45) < 1e-9)));
    tick(400);
    engine.play("formation.place");
    assert.ok(ctx.gains.some((g) => g.gain.targets.filter((t) => t === 0.5).length >= 2));
  });
});

describe("manifest và cài đặt", () => {
  it("manifest lạ hoặc sai định dạng thành manifest rỗng; mục sai bị bỏ riêng từng mục", () => {
    assert.deepEqual(parseManifest(null), EMPTY_MANIFEST);
    assert.deepEqual(parseManifest({ version: 2 }), EMPTY_MANIFEST);
    const m = parseManifest({ version: 1, sfx: { a: { files: ["../x", "ok/file"] }, b: { files: [] }, c: 5 }, music: { m: { file: "../bad" }, n: { file: "music/n", loop: false } } });
    assert.deepEqual(Object.keys(m.sfx), ["a"]);
    assert.deepEqual(m.sfx.a!.files, ["ok/file"]);
    assert.deepEqual(Object.keys(m.music), ["n"]);
    assert.equal(m.music.n!.loop, false);
  });

  it("cài đặt sai thì về mặc định, giá trị ngoài khoảng bị kẹp", () => {
    assert.deepEqual(parseSettings("{{"), DEFAULT_SETTINGS);
    const s = parseSettings({ muted: true, volume: { music: 3, sfx: "x" } });
    assert.equal(s.muted, true);
    assert.equal(s.volume.music, 1);
    assert.equal(s.volume.sfx, DEFAULT_SETTINGS.volume.sfx);
  });

  it("manifest thật: mọi mục hợp lệ, mã cue/nhạc đều đã khai báo và tệp có thật", () => {
    const raw = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as unknown;
    const m = parseManifest(raw);
    assert.equal(m.version, 1);
    for (const [id, e] of Object.entries(m.sfx)) {
      assert.ok((CUE_IDS as readonly string[]).includes(id), `cue lạ: ${id}`);
      for (const f of e.files) assert.ok(existsSync(`public/audio/${f}.ogg`) && existsSync(`public/audio/${f}.m4a`), `thiếu tệp ${f}`);
    }
    for (const [id, e] of Object.entries(m.ambience)) {
      assert.ok((AMBIENCE_IDS as readonly string[]).includes(id), `âm nền lạ: ${id}`);
      assert.ok(existsSync(`public/audio/${e.file}.ogg`) && existsSync(`public/audio/${e.file}.m4a`), `thiếu tệp ${e.file}`);
    }
    for (const [id, e] of Object.entries(m.music)) {
      assert.ok((MUSIC_IDS as readonly string[]).includes(id), `nhạc lạ: ${id}`);
      for (const f of [e.file, e.layer].filter(Boolean) as string[]) assert.ok(existsSync(`public/audio/${f}.ogg`) && existsSync(`public/audio/${f}.m4a`), `thiếu tệp ${f}`);
    }
  });

  it("mã cue và nhạc không trùng nhau", () => {
    assert.equal(new Set(CUE_IDS).size, CUE_IDS.length);
    assert.equal(new Set(MUSIC_IDS).size, MUSIC_IDS.length);
  });
});
