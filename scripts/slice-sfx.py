#!/usr/bin/env python3
"""Cắt các tiếng đơn sạch nhất ra khỏi một tệp âm thanh dài, làm hiệu ứng (SFX) cho game.

Công cụ tạo nhạc/âm thanh hay trả về một đoạn 1 phút gồm nhiều tiếng lặp (thay vì một tiếng ngắn). Script tìm các tiếng gõ (tăng đột ngột
sau một quãng yên), chấm điểm theo độ tách biệt với phần trước và độ tắt dần phía sau, chọn N tiếng tốt nhất, cắt đúng độ dài, làm mờ
đầu và đuôi, chuẩn hóa đỉnh -3 dBFS, đơn âm, rồi xuất .ogg (Opus) và .m4a (AAC) theo quy ước `public/audio/` của game.

Dùng:  python3 scripts/slice-sfx.py <tệp vào> <thư mục ra> <tên cue> [số biến thể=3] [độ dài giây=0.28] [tách biệt tối thiểu dB=20] [tắt dần tối thiểu dB=8]
Ví dụ: python3 scripts/slice-sfx.py ~/Downloads/place.mp3 public/audio/sfx/formation place 3 0.28
       -> place_a.ogg/.m4a, place_b..., place_c...
Cần: ffmpeg (có libopus, aac), numpy.
In ra thời điểm và điểm số từng tiếng được chọn để nghe lại khi cần đổi.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 44100
MIN_ISO = 20  # tách biệt tối thiểu với phần trước (dB); hạ xuống nếu tệp nguồn ít tiếng sạch
MIN_DECAY = 8  # tắt dần tối thiểu phía sau (dB)


def load(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def rms_db(x: np.ndarray) -> float:
    return float(20 * np.log10(np.sqrt(np.mean(x**2)) + 1e-7))


def find_hits(x: np.ndarray, length: float):
    hop = 441
    env = np.array([np.sqrt(np.mean(x[i : i + 2 * hop] ** 2)) for i in range(0, len(x) - 2 * hop, hop)])
    db = 20 * np.log10(env + 1e-6)
    hits = []
    i = 8
    while i < len(db) - 3:
        base = db[i - 8 : i - 1].min()
        if db[i + 2] - base > 12 and db[i + 2] > -30:
            # Mốc chính xác: mẫu đầu tiên vượt 25% đỉnh trong 60 ms đầu.
            s0 = max(0, i * hop - hop)
            win = np.abs(x[s0 : s0 + int(0.08 * SR)])
            onset = s0 + int(np.argmax(win > 0.25 * win.max()))
            pre = rms_db(x[max(0, onset - int(0.08 * SR)) : onset])
            body = rms_db(x[onset : onset + int(0.12 * SR)])
            tail = rms_db(x[onset + int(length * SR) : onset + int((length + 0.12) * SR)]) if onset + int((length + 0.12) * SR) < len(x) else body
            hits.append((onset, body - pre, body - tail))
            i += 30
        else:
            i += 1
    return hits


def main() -> None:
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    src, out_dir, name = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
    count = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    length = float(sys.argv[5]) if len(sys.argv) > 5 else 0.28
    global MIN_ISO, MIN_DECAY
    if len(sys.argv) > 6:
        MIN_ISO = float(sys.argv[6])
    if len(sys.argv) > 7:
        MIN_DECAY = float(sys.argv[7])
    x = load(src)
    hits = find_hits(x, length)
    # Điểm = tách biệt với phần trước (tối đa 40 dB) + tắt dần phía sau (tối đa 25 dB); loại tiếng có đuôi còn to.
    scored = [(min(iso, 40) + min(dec, 25), onset, iso, dec) for onset, iso, dec in hits if dec >= MIN_DECAY and iso >= MIN_ISO]
    scored.sort(reverse=True)
    if len(scored) < 1:
        sys.exit("Không tìm thấy tiếng đơn sạch nào.")
    chosen = []
    for sc, onset, iso, dec in scored:
        if all(abs(onset - o) > SR for _, o, *_ in chosen):
            chosen.append((sc, onset, iso, dec))
        if len(chosen) == count:
            break
    out_dir.mkdir(parents=True, exist_ok=True)
    for k, (sc, onset, iso, dec) in enumerate(chosen):
        start = max(0, onset - int(0.012 * SR))
        clip = x[start : start + int(length * SR)].copy()
        n = len(clip)
        fi = int(0.003 * SR)
        fo = int(0.06 * SR)
        clip[:fi] *= np.linspace(0, 1, fi)
        clip[-fo:] *= np.linspace(1, 0, fo)
        clip *= (10 ** (-3 / 20)) / max(1e-6, float(np.abs(clip).max()))
        tag = "abcdefgh"[k]
        base = out_dir / f"{name}_{tag}"
        wav = base.with_suffix(".wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(wav)], input=clip.astype("<f4").tobytes(), check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libopus", "-b:a", "64k", str(base.with_suffix(".ogg"))], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "96k", str(base.with_suffix(".m4a"))], check=True)
        wav.unlink()
        print(f"{base.name}: {onset / SR:.2f}s, điểm {sc:.0f} (tách biệt {iso:.0f} dB, tắt dần {dec:.0f} dB), {n / SR:.2f}s")


if __name__ == "__main__":
    main()
