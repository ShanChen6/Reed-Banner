"""Cắt lớp từ pixel ảnh gốc, không co giãn riêng các bộ phận.

python3 scripts/art/nguyen_bac.py SOURCE.png ALPHA.png
ALPHA phải đăng ký đúng khung ảnh gốc 1024×1536. Pillow chỉ cắt, chia lớp
và xuất WebP; nền alpha do imagegen tách từ ảnh gốc.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

source = Image.open(sys.argv[1]).convert('RGBA')
matte = Image.open(sys.argv[2]).convert('RGBA')
assert source.size == matte.size == (1024, 1536), 'Không được đổi kích thước ảnh nguồn'
source.putalpha(matte.getchannel('A').point(lambda a: 0 if a < 16 else a))
root = Path('public/art/characters/nguyenBac')
polygons = {
    'ribbon': [(550,40),(603,37),(583,91),(549,109),(518,169),(479,218),(430,253),(371,344),(322,388),(262,374),(256,326),(299,243),(250,250),(246,220),(254,202),(270,167),(312,146),(351,126),(373,106),(423,105),(469,83)],
    'cape': [(380,458),(362,535),(324,560),(294,600),(272,651),(254,700),(234,768),(236,815),(271,840),(281,905),(264,1004),(297,1068),(300,1159),(234,1201),(0,1201),(0,531),(150,531)],
    'sash': [(604,579),(655,593),(672,686),(694,797),(712,908),(754,1138),(706,1154),(655,1079),(615,930),(604,755)],
    'head': [(490,8),(647,0),(720,55),(725,146),(688,209),(653,226),(616,248),(573,278),(549,244),(544,204),(528,177),(516,132),(493,90)],
    'armR': [(830,505),(893,490),(925,540),(951,616),(969,674),(987,744),(974,792),(941,833),(901,828),(869,800),(865,748),(879,704),(877,667),(848,600),(825,550)],
    'sword': [(407,618),(424,632),(415,655),(375,723),(355,763),(348,784),(349,812),(329,847),(321,882),(303,947),(313,1003),(302,1080),(281,1148),(260,1158),(241,1132),(245,1080),(264,1020),(277,980),(282,925),(292,869),(270,842),(245,825),(225,804),(242,778),(271,762),(312,751),(351,690),(389,635)],
    'arm': [(373,450),(453,470),(453,489),(429,544),(403,581),(385,632),(371,689),(365,755),(343,794),(312,798),(272,780),(263,752),(281,703),(296,653),(296,608),(315,551),(342,510),(355,481)],
}
# Lưỡi đao và tua chuôi cùng nằm trong container tay, như rig tướng sĩ cũ.
blade = [(330,817),(310,870),(245,1050),(150,1240),(15,1360),(45,1200),(98,1120),(210,895),(264,814)]
masks = {}
for name, points in polygons.items():
    mask = Image.new('L', source.size)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    if name == 'sword': ImageDraw.Draw(mask).polygon(blade, fill=255)
    if name in ('head', 'sword', 'arm', 'armR'):
        mask = mask.filter(ImageFilter.MaxFilter(9))
    masks[name] = mask
# Ưu tiên tay trên vũ khí/vải; mỗi pixel nguồn thuộc đúng một lớp hiện ra.
used = Image.new('L', source.size)
layers = {}
for name in reversed(list(masks)):
    mask = ImageChops.subtract(masks[name], used)
    used = ImageChops.lighter(used, masks[name])
    part = source.copy()
    part.putalpha(ImageChops.multiply(source.getchannel('A'), mask))
    layers[name] = part
body = source.copy()
body.putalpha(ImageChops.subtract(source.getchannel('A'), used))
layers['body'] = body
# Giáp vai giữ trên thân để che điểm nối; pixel giữ nguyên vị trí nguồn.
mask = Image.new('L', source.size)
ImageDraw.Draw(mask).polygon([(399,272),(474,264),(480,337),(457,422),(449,481),(421,504),(371,479),(335,451),(348,391),(371,325)], fill=255)
cover = source.copy()
cover.putalpha(ImageChops.multiply(source.getchannel('A'), mask))
layers['shoulder'] = cover
boxes = {}
for name, part in layers.items():
    box = part.getbbox()
    assert box, name
    x,y,r,b = box
    r += (r-x)%2
    b += (b-y)%2
    boxes[name] = dict(x=x,y=y,w=r-x,h=b-y)
    cropped = part.crop((x,y,r,b))
    cropped.resize(((r-x)//2,(b-y)//2), Image.Resampling.LANCZOS).save(root/f'{name}.webp', quality=76,method=6)
# Avatar dùng cùng RGB gốc và alpha, thêm viền trống phía trên để mặt ở giữa khung tròn.
portrait = source.crop((425, -20, 855, 410)).resize((256, 256), Image.Resampling.LANCZOS)
portrait.save(root/'portrait.webp', quality=86, method=6)
assert (root/'portrait.webp').stat().st_size < 30_000
# Ảnh đứng riêng để duyệt ở /demo/characters, không nằm trong phần tải rig.
standing = source.copy()
standing.thumbnail((360, 540))
standing.save(root/'standing.webp', quality=66, method=6)
# Đối chiếu trước nén: ráp các lớp phải khớp nguyên hình nguồn, không đổi tỷ lệ.
assembled = Image.new('RGBA',source.size)
for name in ['body','ribbon','cape','sash','head','armR','sword','arm']:
    assembled.alpha_composite(layers[name])
flat_source = Image.new('RGBA', source.size, '#81948b')
flat_source.alpha_composite(source)
flat_assembled = Image.new('RGBA', source.size, '#81948b')
flat_assembled.alpha_composite(assembled)
assert ImageChops.difference(flat_source.convert('RGB'), flat_assembled.convert('RGB')).getbbox() is None, 'Lớp không ráp lại đúng ảnh nguồn'
background = Image.new('RGBA',source.size,'#81948b')
background.alpha_composite(assembled)
background.convert('RGB').save('/tmp/nguyen-source-assembled.jpg')
Path('docs/art/nguyen-bac-boxes.json').write_text(json.dumps(boxes,indent=2) + '\n')
print(json.dumps(boxes,indent=2))
