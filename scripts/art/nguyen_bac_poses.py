"""Xuất tranh hành động từ RGB nguồn + alpha imagegen, không thay tỷ lệ.

python3 scripts/art/nguyen_bac_poses.py SOURCE_DIR CAST_ALPHA ULTIMATE_ALPHA KO_ALPHA
Cần Pillow. Các alpha phải giữ nguyên khung nguồn 1536×1024.
"""
import sys
from pathlib import Path
from PIL import Image

source_dir = Path(sys.argv[1])
root = Path('public/art/characters/nguyenBac')
for kind, original, alpha_path in [
    ('cast', 'nguyenbacrachieu.png', sys.argv[2]),
    ('ultimate', 'nguyenbactuyetchieu.png', sys.argv[3]),
    ('ko', 'nguyenbacguc.png', sys.argv[4]),
]:
    source = Image.open(source_dir/original).convert('RGBA')
    matte = Image.open(alpha_path).getchannel('A')
    assert source.size == matte.size == (1536, 1024)
    source.putalpha(matte.point(lambda a: 0 if a < 24 else a))
    # Hai điểm cắt giữ nguyên để không dịch tranh ra chiêu/tuyệt chiêu trong rig.
    box = {'cast': (13, 6, 1526, 1020), 'ultimate': (13, 10, 1524, 1006)}.get(kind) or source.getbbox()
    source = source.crop(box)
    source.resize((round(source.width/3), round(source.height/3)), Image.Resampling.LANCZOS).save(
        root/f'pose-{kind}.webp', quality=66, method=6)
    print(kind, 'origin=', box[:2], 'texScale=1/3', 'bytes=', (root/f'pose-{kind}.webp').stat().st_size)
assert sum(p.stat().st_size for p in root.glob('*.webp')) <= 350_000
