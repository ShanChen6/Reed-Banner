// Engine âm thanh dùng Web Audio API (không thư viện ngoài). Thuần TypeScript, không phụ thuộc React: môi trường (AudioContext,
// tải tệp, đọc manifest, số ngẫu nhiên) được truyền vào nên test bằng AudioContext giả.
//
// Quy tắc (docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md):
// - chỉ phát sau `unlock()` (gọi từ cử chỉ người dùng đầu tiên); trước đó mọi lệnh phát bị bỏ qua, riêng nhạc nền được nhớ và phát khi mở khóa;
// - bốn bus music/ambience/sfx/voice, mỗi bus một âm lượng, tắt tiếng chung;
// - tối đa 8 cue đồng thời, cùng cue cách nhau tối thiểu 40 ms, tốc độ phát lệch ngẫu nhiên ±3% và chọn một biến thể;
// - cue hoặc nhạc không có trong manifest hoặc chưa tải được thì im lặng.

import type { Bus } from "./cues";
import { BUSES } from "./cues";
import { EMPTY_MANIFEST, parseManifest, type Manifest } from "./manifest";
import { DEFAULT_SETTINGS, type AudioSettings } from "./settings";

export const MAX_CONCURRENT = 8;
export const MIN_GAP_MS = 40;
export const RATE_JITTER = 0.03;
export const DUCK_FACTOR = 0.45;

// Phần của Web Audio mà engine dùng, đủ nhỏ để dựng bản giả trong test.
export interface ParamLike {
  value: number;
  setTargetAtTime(target: number, startTime: number, timeConstant: number): unknown;
}
export interface NodeLike {
  connect(dest: unknown): unknown;
  disconnect(): unknown;
}
export interface GainLike extends NodeLike {
  gain: ParamLike;
}
export interface SourceLike extends NodeLike {
  buffer: unknown;
  loop: boolean;
  playbackRate: ParamLike;
  onended: (() => void) | null;
  start(when?: number): unknown;
  stop(when?: number): unknown;
}
export interface ContextLike {
  readonly currentTime: number;
  readonly destination: unknown;
  readonly state: string;
  createGain(): GainLike;
  createBufferSource(): SourceLike;
  decodeAudioData(data: ArrayBuffer): Promise<unknown>;
  resume(): Promise<unknown>;
  suspend(): Promise<unknown>;
}

export interface EngineEnv {
  createContext(): ContextLike | null;
  fetchBytes(url: string): Promise<ArrayBuffer>;
  loadManifest(): Promise<unknown>;
  /** Đuôi tệp trình duyệt phát được: Ogg/Opus hoặc M4A/AAC (Safari). */
  ext: ".ogg" | ".m4a";
  random(): number;
  now(): number;
  parseManifest(raw: unknown): Manifest;
}

export interface PlayOptions {
  /** Nhân với âm lượng gốc của cue. */
  readonly volume?: number;
  /** Nhân với tốc độ phát (cao dần theo số đường dọn cùng lúc, v.v.). */
  readonly rate?: number;
}

interface MusicPlayer {
  readonly id: string;
  readonly gain: GainLike;
  readonly layerGain: GainLike | null;
  readonly sources: SourceLike[];
}

type LoopChannel = "music" | "ambience";
interface ChannelState {
  wanted: { id: string; fadeMs: number } | null;
  player: MusicPlayer | null;
  token: number;
  layerValue: number;
}

const TC = 0.08; // hằng số thời gian làm mượt âm lượng (giây)

export class AudioEngine {
  private ctx: ContextLike | null = null;
  private master: GainLike | null = null;
  private buses = new Map<Bus, GainLike>();
  private manifest: Manifest = EMPTY_MANIFEST;
  private buffers = new Map<string, unknown>();
  private loading = new Map<string, Promise<unknown | null>>();
  private lastPlayed = new Map<string, number>();
  private active = 0;
  private unlocked = false;
  private settings: AudioSettings;
  /** Hai kênh lặp: nhạc nền (bus music) và âm thanh nền (bus ambience). */
  private channels: Record<LoopChannel, ChannelState> = {
    music: { wanted: null, player: null, token: 0, layerValue: 0 },
    ambience: { wanted: null, player: null, token: 0, layerValue: 0 },
  };
  private duckUntil = 0;
  private pendingPreload = new Set<string>();

  constructor(private readonly env: EngineEnv, settings: AudioSettings = DEFAULT_SETTINGS) {
    this.settings = settings;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }
  get activeCount(): number {
    return this.active;
  }
  get currentMusic(): string | null {
    return this.channels.music.player?.id ?? null;
  }
  get currentAmbience(): string | null {
    return this.channels.ambience.player?.id ?? null;
  }
  get muted(): boolean {
    return this.settings.muted;
  }

  /** Mở khóa bằng cử chỉ người dùng đầu tiên: dựng AudioContext, các bus và đọc manifest. Gọi lại nhiều lần vô hại. */
  async unlock(): Promise<void> {
    if (this.unlocked) return;
    const ctx = this.env.createContext();
    if (!ctx) return;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    for (const b of BUSES) {
      const g = ctx.createGain();
      g.connect(this.master);
      this.buses.set(b, g);
    }
    this.unlocked = true;
    this.applyGains(true);
    try {
      await ctx.resume();
    } catch {
      /* trình duyệt từ chối resume: sẽ thử lại ở cử chỉ sau */
    }
    try {
      this.manifest = this.env.parseManifest(await this.env.loadManifest());
    } catch {
      this.manifest = EMPTY_MANIFEST;
    }
    if (this.pendingPreload.size > 0) void this.preload([...this.pendingPreload]);
    for (const ch of ["music", "ambience"] as const) {
      const w = this.channels[ch].wanted;
      if (w) void this.playLoop(ch, w.id, w.fadeMs);
    }
  }

  private applyGains(immediate = false): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const tc = immediate ? 0.001 : TC;
    this.master.gain.setTargetAtTime(this.settings.muted ? 0 : 1, ctx.currentTime, tc);
    const ducked = this.env.now() < this.duckUntil;
    for (const b of BUSES) {
      const factor = ducked && (b === "music" || b === "ambience") ? DUCK_FACTOR : 1;
      this.buses.get(b)?.gain.setTargetAtTime(this.settings.volume[b] * factor, ctx.currentTime, tc);
    }
  }

  setMuted(muted: boolean): void {
    this.settings = { ...this.settings, muted };
    this.applyGains();
  }

  setVolume(bus: Bus, value: number): void {
    const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
    this.settings = { ...this.settings, volume: { ...this.settings.volume, [bus]: v } };
    this.applyGains();
  }

  /** Hạ nhạc nền và ambience khi có giọng đọc (sau này); tự trả lại sau `ms`. */
  duckFor(ms: number): void {
    this.duckUntil = this.env.now() + ms;
    this.applyGains();
  }
  /** Tab ẩn thì tạm dừng toàn bộ, hiện lại thì tiếp tục. */
  setHidden(hidden: boolean): void {
    const ctx = this.ctx;
    if (!ctx) return;
    void (hidden ? ctx.suspend() : ctx.resume()).catch(() => undefined);
  }

  private url(file: string): string {
    return `/audio/${file}${this.env.ext}`;
  }

  private load(file: string): Promise<unknown | null> {
    const have = this.buffers.get(file);
    if (have) return Promise.resolve(have);
    let p = this.loading.get(file);
    if (!p) {
      const ctx = this.ctx;
      p = ctx
        ? this.env
            .fetchBytes(this.url(file))
            .then((bytes) => ctx.decodeAudioData(bytes))
            .then((buf) => {
              this.buffers.set(file, buf);
              return buf;
            })
            .catch(() => null)
            .finally(() => this.loading.delete(file))
        : Promise.resolve(null);
      this.loading.set(file, p);
    }
    return p;
  }

  /** Tải sẵn các cue (gọi khi vào một scene) để lần phát đầu không im lặng. */
  async preload(cueIds: readonly string[]): Promise<void> {
    if (!this.unlocked) {
      for (const id of cueIds) this.pendingPreload.add(id); // nhớ và tải khi mở khóa
      return;
    }
    const files = new Set<string>();
    for (const id of cueIds) for (const f of this.manifest.sfx[id]?.files ?? []) files.add(f);
    await Promise.all([...files].map((f) => this.load(f)));
  }

  /** Phát một cue. Trả `true` nếu thật sự đã phát (để test và để gỡ lỗi). */
  play(id: string, opts: PlayOptions = {}): boolean {
    const ctx = this.ctx;
    if (!this.unlocked || !ctx || this.settings.muted) return false;
    const entry = this.manifest.sfx[id];
    if (!entry) return false;
    const now = this.env.now();
    if (now >= this.duckUntil && this.duckUntil !== 0) {
      this.duckUntil = 0;
      this.applyGains();
    }
    const last = this.lastPlayed.get(id);
    if (last !== undefined && now - last < MIN_GAP_MS) return false;
    if (this.active >= MAX_CONCURRENT) return false;
    const file = entry.files[Math.floor(this.env.random() * entry.files.length) % entry.files.length]!;
    const buffer = this.buffers.get(file);
    if (!buffer) {
      void this.load(file); // lần đầu chưa có buffer: tải để lần sau phát được
      return false;
    }
    const bus = this.buses.get("sfx");
    if (!bus) return false;
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer;
    src.playbackRate.value = (opts.rate ?? 1) * (1 + (this.env.random() * 2 - 1) * RATE_JITTER);
    g.gain.value = (entry.volume ?? 1) * (opts.volume ?? 1);
    src.connect(g);
    g.connect(bus);
    this.active += 1;
    this.lastPlayed.set(id, now);
    src.onended = () => {
      this.active = Math.max(0, this.active - 1);
      src.disconnect();
      g.disconnect();
    };
    src.start();
    return true;
  }

  /** Đổi nhạc nền sang `id` (crossfade `fadeMs`). Chưa mở khóa thì nhớ và phát khi mở khóa; cùng bài đang phát thì giữ nguyên. */
  playMusic(id: string, fadeMs = 800): Promise<void> {
    return this.playLoop("music", id, fadeMs);
  }
  stopMusic(fadeMs = 600): void {
    this.stopLoop("music", fadeMs);
  }
  /** Âm thanh nền (gió, chim, ...) đi qua bus ambience, cùng cách hoạt động với nhạc. */
  playAmbience(id: string, fadeMs = 1200): Promise<void> {
    return this.playLoop("ambience", id, fadeMs);
  }
  stopAmbience(fadeMs = 800): void {
    this.stopLoop("ambience", fadeMs);
  }

  private async playLoop(channel: LoopChannel, id: string, fadeMs: number): Promise<void> {
    const ch = this.channels[channel];
    ch.wanted = { id, fadeMs };
    if (!this.unlocked || !this.ctx) return;
    if (ch.player?.id === id) return;
    const entry = this.manifest[channel][id];
    const token = ++ch.token;
    if (!entry) {
      this.fadeOutLoop(channel, fadeMs);
      return;
    }
    const [main, layer] = await Promise.all([this.load(entry.file), entry.layer ? this.load(entry.layer) : Promise.resolve(null)]);
    if (token !== ch.token || !main || !this.ctx) return; // đã có yêu cầu mới hơn, hoặc không tải được
    const ctx = this.ctx;
    const bus = this.buses.get(channel)!;
    this.fadeOutLoop(channel, fadeMs);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(bus);
    const sources: SourceLike[] = [];
    const mk = (buf: unknown, into: GainLike) => {
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.loop = entry.loop !== false;
      s.connect(into);
      sources.push(s);
    };
    mk(main, gain);
    let layerGain: GainLike | null = null;
    if (layer) {
      layerGain = ctx.createGain();
      layerGain.gain.value = ch.layerValue;
      layerGain.connect(gain);
      mk(layer, layerGain);
    }
    for (const s of sources) s.start();
    gain.gain.setTargetAtTime(entry.volume ?? 1, ctx.currentTime, Math.max(0.01, fadeMs / 3000));
    ch.player = { id, gain, layerGain, sources };
  }

  private fadeOutLoop(channel: LoopChannel, fadeMs: number): void {
    const ch = this.channels[channel];
    const old = ch.player;
    const ctx = this.ctx;
    ch.player = null;
    if (!old || !ctx) return;
    old.gain.gain.setTargetAtTime(0, ctx.currentTime, Math.max(0.01, fadeMs / 3000));
    const stopAt = ctx.currentTime + fadeMs / 1000 + 0.2;
    for (const s of old.sources) {
      try {
        s.stop(stopAt);
      } catch {
        /* đã dừng */
      }
    }
  }

  private stopLoop(channel: LoopChannel, fadeMs: number): void {
    const ch = this.channels[channel];
    ch.wanted = null;
    ch.token += 1;
    this.fadeOutLoop(channel, fadeMs);
  }

  /** Lớp thêm của nhạc hiện tại (0..1), ví dụ lớp căng thẳng theo thanh Bỏ Lệnh. */
  setLayer(value: number): void {
    const ch = this.channels.music;
    ch.layerValue = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
    const lg = ch.player?.layerGain;
    if (lg && this.ctx) lg.gain.setTargetAtTime(ch.layerValue, this.ctx.currentTime, 0.3);
  }
}

/** Môi trường thật của trình duyệt. */
export function browserEnv(): EngineEnv {
  const ext: ".ogg" | ".m4a" = (() => {
    try {
      return new Audio().canPlayType('audio/ogg; codecs="opus"') ? ".ogg" : ".m4a";
    } catch {
      return ".m4a";
    }
  })();
  return {
    createContext: () => {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      return Ctor ? (new Ctor() as unknown as ContextLike) : null;
    },
    fetchBytes: async (url) => {
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      return r.arrayBuffer();
    },
    loadManifest: async () => {
      const r = await fetch("/audio/manifest.json", { cache: "no-cache" });
      return r.ok ? r.json() : null;
    },
    ext,
    random: Math.random,
    now: () => performance.now(),
    parseManifest,
  };
}
