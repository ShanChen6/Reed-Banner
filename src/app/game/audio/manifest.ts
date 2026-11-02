// Manifest âm thanh: `public/audio/manifest.json` ánh xạ mã cue/nhạc tới tệp (không kèm đuôi; engine chọn .ogg hoặc .m4a theo trình duyệt).
// Chưa có tệp (manifest rỗng) thì mọi cue im lặng, không báo lỗi. Thêm âm thanh = thêm tệp + một dòng ở đây.

export interface CueEntry {
  /** Một hoặc nhiều biến thể (đường dẫn tương đối `public/audio/`, không đuôi); mỗi lần phát chọn ngẫu nhiên một biến thể. */
  readonly files: readonly string[];
  /** Âm lượng gốc 0..1 (mặc định 1). */
  readonly volume?: number;
}

export interface MusicEntry {
  readonly file: string;
  /** Lớp thêm vào (vd. lớp căng thẳng), phát cùng nhịp và độ dài với `file`, âm lượng theo `setLayer`. */
  readonly layer?: string;
  readonly volume?: number;
  /** Mặc định lặp; nhạc kết quả ngắn đặt `false`. */
  readonly loop?: boolean;
}

export interface Manifest {
  readonly version: 1;
  readonly sfx: Readonly<Record<string, CueEntry>>;
  readonly music: Readonly<Record<string, MusicEntry>>;
  /** Âm thanh nền lặp (gió, chim, ...), cùng dạng với nhạc nhưng đi qua bus ambience. */
  readonly ambience: Readonly<Record<string, MusicEntry>>;
}

export const EMPTY_MANIFEST: Manifest = { version: 1, sfx: {}, music: {}, ambience: {} };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isPath = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9/_-]*$/i.test(v) && !v.includes("..");
const vol = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : undefined);

/** Đọc manifest, bỏ mọi mục sai định dạng (đường dẫn lạ, thiếu tệp) thay vì hỏng cả bộ. */
export function parseManifest(raw: unknown): Manifest {
  if (!isObj(raw) || raw.version !== 1) return EMPTY_MANIFEST;
  const sfx: Record<string, CueEntry> = {};
  if (isObj(raw.sfx)) {
    for (const [id, e] of Object.entries(raw.sfx)) {
      if (!isObj(e) || !Array.isArray(e.files)) continue;
      const files = e.files.filter(isPath);
      if (files.length > 0) sfx[id] = { files, volume: vol(e.volume) };
    }
  }
  const loops = (src: unknown): Record<string, MusicEntry> => {
    const out: Record<string, MusicEntry> = {};
    if (isObj(src)) {
      for (const [id, e] of Object.entries(src)) {
        if (!isObj(e) || !isPath(e.file)) continue;
        out[id] = { file: e.file, layer: isPath(e.layer) ? e.layer : undefined, volume: vol(e.volume), loop: e.loop === false ? false : undefined };
      }
    }
    return out;
  };
  const music = loops(raw.music);
  const ambience = loops(raw.ambience);
  return { version: 1, sfx, music, ambience };
}
