#!/usr/bin/env python3
"""Biến một bản nhạc dài thành vòng lặp liền mạch cho game: chuẩn hóa độ lớn, cắt phần tắt dần ở cuối, trộn đuôi vào đầu, xuất .ogg và .m4a.

Công cụ tạo nhạc thường trả một bài có đoạn vào nhỏ và đoạn tắt dần ở cuối, nên phát lặp sẽ nghe một "khe". Script cắt `cắt_cuối` giây cuối
(phần tắt dần) rồi trộn `giây_trộn` giây cuối với giây_trộn giây đầu bằng crossfade công suất đều, nên điểm lặp liền mạch.

Dùng:  python3 scripts/make-music-loop.py <tệp vào> <đường dẫn ra không đuôi> [cắt_cuối giây=6] [giây_trộn=3] [LUFS=-18]
Ví dụ: python3 scripts/make-music-loop.py ~/Downloads/menu.mp3 public/audio/music/formation_menu 6 3
Cần: ffmpeg (libopus, aac), numpy.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 44100


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src, out = sys.argv[1], Path(sys.argv[2])
    trim = float(sys.argv[3]) if len(sys.argv) > 3 else 6.0
    xf = float(sys.argv[4]) if len(sys.argv) > 4 else 3.0
    lufs = float(sys.argv[5]) if len(sys.argv) > 5 else -18.0
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", src, "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "2", "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
    x = x[: len(x) - int(trim * SR)]
    n = int(xf * SR)
    if len(x) < 4 * n:
        sys.exit("Bản nhạc quá ngắn để trộn vòng lặp.")
    t = np.linspace(0, np.pi / 2, n, dtype=np.float32)[:, None]
    head, tail = x[:n], x[-n:]
    body = x[:-n].copy()
    body[:n] = head * np.sin(t) + tail * np.cos(t)  # công suất đều: đầu vào dần, đuôi ra dần
    out.parent.mkdir(parents=True, exist_ok=True)
    wav = out.with_suffix(".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(wav)], input=body.astype("<f4").tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libopus", "-b:a", "96k", str(out.with_suffix(".ogg"))], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "128k", str(out.with_suffix(".m4a"))], check=True)
    wav.unlink()
    print(f"{out.name}: {len(body) / SR:.1f}s lặp (cắt cuối {trim}s, trộn {xf}s, {lufs} LUFS)")


if __name__ == "__main__":
    main()
