#!/usr/bin/env python3
"""Cắt một tệp giọng đọc dài (nhiều câu liền nhau) thành từng câu riêng, làm lời thoại nhân vật cho game.

Gemini TTS (gói miễn phí) giới hạn số yêu cầu mỗi ngày, nên gộp cả bộ câu của một nhân vật vào MỘT yêu cầu, các câu cách nhau bằng
dòng trống, rồi dùng script này cắt theo quãng lặng. Script tìm các quãng lặng, chọn (số câu - 1) quãng dài nhất làm chỗ cắt, cắt bỏ
khoảng lặng đầu và cuối mỗi câu (chừa 60 ms), làm mờ 8 ms hai đầu, đưa mọi câu về cùng mức to (RMS -20 dBFS, đỉnh tối đa -1 dBFS), đơn âm,
rồi xuất .ogg (Opus) và .m4a (AAC) theo quy ước `public/audio/` của game.

Dùng:  python3 scripts/slice-voice.py <tệp vào> <thư mục ra> <id nhân vật> [nhãn các câu, cách nhau dấu phẩy] [lặng tối thiểu giây=0.35]
Mặc định nhãn (8 câu theo thứ tự): quote (câu đặc trưng), enter (vào trận), hit (ra đòn), cast (ra chiêu), ultimate (tuyệt chiêu), hurt (bị thương), healed (được chữa), win (thắng trận).
Ví dụ: python3 scripts/slice-voice.py ~/Downloads/haVan.wav public/audio/voice/haVan haVan
       -> haVan_quote.ogg/.m4a, haVan_enter..., haVan_win...
Cần: ffmpeg (có libopus, aac), numpy.
Script in thời điểm và độ dài từng câu. Nếu số quãng lặng tìm được ít hơn số câu - 1, hạ ngưỡng và thử lại; nếu vẫn thiếu thì báo lỗi
(khi đó tạo lại bằng cách thêm "[pause]" hoặc dòng trống giữa các câu trong văn bản gửi Gemini).
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 24000
HOP = int(0.01 * SR)  # 10 ms
DEFAULT_LABELS = ["quote", "enter", "hit", "cast", "ultimate", "hurt", "healed", "win"]
PAD = 0.06  # chừa quanh mỗi câu (giây)


def load(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def envelope_db(x: np.ndarray) -> np.ndarray:
    n = len(x) // HOP
    frames = x[: n * HOP].reshape(n, HOP)
    return 20 * np.log10(np.sqrt((frames**2).mean(axis=1)) + 1e-7)


def find_gaps(db: np.ndarray, floor_db: float, min_len: float):
    """Các quãng liên tiếp có mức dưới ngưỡng, dài ít nhất min_len giây: (bắt đầu, kết thúc) tính theo khung."""
    quiet = db < floor_db
    gaps, start = [], None
    for i, q in enumerate(quiet):
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) * HOP / SR >= min_len:
                gaps.append((start, i))
            start = None
    return gaps


def pick_cuts(db: np.ndarray, count: int, min_len: float):
    """Chọn (count - 1) quãng lặng dài nhất; hạ ngưỡng dần nếu thiếu."""
    peak = float(np.percentile(db, 98))
    for drop in (35, 30, 25, 20):
        gaps = find_gaps(db, peak - drop, min_len)
        # Bỏ quãng lặng ở sát đầu và cuối tệp (không phải chỗ ngắt giữa hai câu).
        inner = [g for g in gaps if g[0] > 3 and g[1] < len(db) - 3]
        if len(inner) >= count - 1:
            best = sorted(inner, key=lambda g: g[1] - g[0], reverse=True)[: count - 1]
            return sorted(best), drop
    return None, None


def main() -> None:
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    src, out_dir, ident = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
    labels = sys.argv[4].split(",") if len(sys.argv) > 4 and sys.argv[4] else DEFAULT_LABELS
    min_len = float(sys.argv[5]) if len(sys.argv) > 5 else 0.35
    x = load(src)
    db = envelope_db(x)
    cuts, drop = pick_cuts(db, len(labels), min_len)
    if cuts is None:
        sys.exit(f"Chỉ tìm được ít quãng lặng hơn {len(labels) - 1} chỗ ngắt. Thử hạ 'lặng tối thiểu' (vd 0.25) hoặc tạo lại với dòng trống/[pause] giữa các câu.")
    bounds = [0] + [(a + b) // 2 for a, b in cuts] + [len(db)]
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"{ident}: {len(x) / SR:.1f}s, ngưỡng lặng = đỉnh - {drop} dB, {len(labels)} câu")
    for k, label in enumerate(labels):
        seg = x[bounds[k] * HOP : bounds[k + 1] * HOP].copy()
        sdb = envelope_db(seg)
        voiced = np.where(sdb > float(np.percentile(sdb, 98)) - 35)[0]
        if len(voiced) == 0:
            sys.exit(f"Câu {k + 1} ({label}) không có tiếng.")
        a = max(0, voiced[0] * HOP - int(PAD * SR))
        b = min(len(seg), (voiced[-1] + 1) * HOP + int(PAD * SR))
        clip = seg[a:b].copy()
        fade = int(0.008 * SR)
        clip[:fade] *= np.linspace(0, 1, fade)
        clip[-fade:] *= np.linspace(1, 0, fade)
        rms = float(np.sqrt(np.mean(clip**2)) + 1e-9)
        clip *= (10 ** (-20 / 20)) / rms
        peak = float(np.abs(clip).max())
        if peak > 10 ** (-1 / 20):
            clip *= (10 ** (-1 / 20)) / peak
        base = out_dir / f"{ident}_{label}"
        wav = base.with_suffix(".wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(wav)], input=clip.astype("<f4").tobytes(), check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libopus", "-b:a", "48k", str(base.with_suffix(".ogg"))], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "64k", str(base.with_suffix(".m4a"))], check=True)
        wav.unlink()
        start = (bounds[k] * HOP + a) / SR
        print(f"  {base.name}: bắt đầu {start:.2f}s, dài {len(clip) / SR:.2f}s")


if __name__ == "__main__":
    main()
