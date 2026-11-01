#!/usr/bin/env python3
"""Cắt nền caro/trắng giả của icon Trận Đồ thành nền trong suốt thật.

Công cụ tạo ảnh hay trả về ảnh RGB có họa tiết ô caro VẼ SẴN thay vì kênh alpha. Script này coi mọi điểm sáng, ít bão hòa
và liền với mép ảnh là nền (lan từ mép vào, dừng ở nét viền tối của vật thể), đặt alpha 0 ở đó, bào nhẹ viền để mất quầng
sáng, cắt sát vật thể, đưa về khung vuông và thu nhỏ.

Dùng:  python3 scripts/cutout-formation-icon.py <ảnh vào> <ảnh ra.webp> [kích thước=256] [ngưỡng sáng=205]
Ví dụ: python3 scripts/cutout-formation-icon.py ~/Downloads/nui.webp public/art/formation/obstacles/nui.webp
Cần: Pillow, numpy.
"""
import sys

import numpy as np
from PIL import Image


def background_mask(rgb: np.ndarray, bright: int) -> np.ndarray:
    """Điểm 'giống nền': sáng và gần như không có màu (trắng và xám của ô caro, kể cả vệt mờ)."""
    mx = rgb.max(axis=2).astype(int)
    mn = rgb.min(axis=2).astype(int)
    return (mn >= bright) & ((mx - mn) <= 14)


def flood_from_border(candidate: np.ndarray) -> np.ndarray:
    """Phần của `candidate` liền với mép ảnh (lan 4 hướng bằng phép giãn lặp)."""
    h, w = candidate.shape
    reached = np.zeros_like(candidate)
    reached[0, :] = candidate[0, :]
    reached[-1, :] = candidate[-1, :]
    reached[:, 0] = candidate[:, 0]
    reached[:, -1] = candidate[:, -1]
    while True:
        grown = reached.copy()
        grown[1:, :] |= reached[:-1, :]
        grown[:-1, :] |= reached[1:, :]
        grown[:, 1:] |= reached[:, :-1]
        grown[:, :-1] |= reached[:, 1:]
        grown &= candidate
        if (grown == reached).all():
            return reached
        reached = grown


def largest_component(mask: np.ndarray) -> np.ndarray:
    """Chỉ giữ mảng liền lớn nhất (bỏ các đốm caro sót lại quanh vật thể)."""
    from scipy import ndimage

    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    return lab == (1 + int(np.argmax(sizes)))


def enclosed_checker(rgb: np.ndarray, solid: np.ndarray) -> np.ndarray:
    """Ô caro lọt trong vật thể (vd. giữa các thân cây): vùng xám trung tính thuần, đủ rộng."""
    from scipy import ndimage

    mx = rgb.max(axis=2).astype(int)
    mn = rgb.min(axis=2).astype(int)
    neutral = (mn >= 185) & ((mx - mn) <= 5) & solid
    lab, n = ndimage.label(ndimage.binary_closing(neutral, iterations=2))
    out = np.zeros_like(neutral)
    for i in range(1, n + 1):
        region = lab == i
        if region.sum() > 1500:
            out |= region
    return out


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src, dst = sys.argv[1], sys.argv[2]
    size = int(sys.argv[3]) if len(sys.argv) > 3 else 256
    bright = int(sys.argv[4]) if len(sys.argv) > 4 else 205
    im = Image.open(src).convert("RGB")
    rgb = np.asarray(im)
    bg = flood_from_border(background_mask(rgb, bright))
    # Bào 1 điểm ảnh quanh vật thể để mất quầng sáng của nền cũ, rồi làm mềm viền alpha.
    solid = ~bg
    solid &= ~enclosed_checker(rgb, solid)
    solid = largest_component(solid)
    er = solid.copy()
    er[1:, :] &= solid[:-1, :]
    er[:-1, :] &= solid[1:, :]
    er[:, 1:] &= solid[:, :-1]
    er[:, :-1] &= solid[:, 1:]
    alpha = er.astype(np.float32)
    pad = np.pad(alpha, 1, mode="edge")
    alpha = sum(pad[dy : dy + alpha.shape[0], dx : dx + alpha.shape[1]] for dy in range(3) for dx in range(3)) / 9.0
    alpha = np.clip((alpha - 0.35) / 0.5, 0, 1)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    out = Image.fromarray(rgba, "RGBA")
    box = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        sys.exit("Không tìm thấy vật thể (có thể ngưỡng sáng quá thấp).")
    out = out.crop(box)
    side = int(max(out.size) * 1.08)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
    canvas = canvas.resize((size, size), Image.LANCZOS)
    canvas.save(dst, "WEBP", quality=92, method=6)
    print(f"{dst}: {size}x{size}, vật thể {out.size[0]}x{out.size[1]} (từ {im.size[0]}x{im.size[1]})")


if __name__ == "__main__":
    main()
