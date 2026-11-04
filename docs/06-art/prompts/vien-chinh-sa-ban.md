# Prompt tranh sa bàn Viễn Chinh

> Cập nhật: 04/11/2026
> Trạng thái: **DRAFT** — Claude soạn theo yêu cầu của Shan (04/11/2026: mỗi sa bàn một tranh mới); chưa có tranh.

Mỗi sa bàn của [Viễn Chinh](../../02-game-modes/expedition/01-vien-chinh-gdd.md) cần một tranh nền riêng. Tranh là
bản đồ địa hình vẽ tay nhìn từ trên cao, cùng chất liệu với bản đồ tổng Bình Loạn (`public/art/campaign/world-map.webp`)
nhưng **là tranh mới**, không cắt từ bản đồ tổng. Trên tranh, code vẽ thêm ô, đường đi, cờ đạo quân và sương mù.
Prompt viết bằng tiếng Anh, giải thích bằng tiếng Việt.

## 1. Cách dùng

- Mỗi khối dưới đây là một tranh. Dán **khối phong cách chung** rồi tới **khối bố cục** của sa bàn.
- Khổ **5:3 ngang**, tốt nhất 1600×960 hoặc lớn hơn cùng tỉ lệ. Không chữ, không cờ, không mũi tên, không ô tròn hay
  dấu nhiệm vụ: những thứ đó do code vẽ.
- Gửi Claude file PNG gốc đặt tên theo cột tên file. Claude xuất WebP vào `public/art/expedition/<tên>.webp`, khai báo
  trong `EXPEDITION_MAP_IMAGES` (`src/app/game/expedition/ExpeditionScreen.tsx`) rồi **dời tọa độ từng ô cho khớp
  đúng thành, làng, bến trên tranh** (`src/core/expedition/maps.ts`). Vì vậy tranh không cần đặt đúng từng điểm như bảng
  vị trí dưới đây; chỉ cần đủ số công trình, đúng hướng sông và đúng thế đất.
- Chưa có tranh thì sa bàn tạm dùng một vùng của bản đồ tổng Bình Loạn.

| Sa bàn | Tên file | Hệ | Điểm nhấn |
|---|---|---|---|
| Ải Bắc | `ai-bac.png` | Kim | Đèo đá, chòi gác, thành núi |
| Thượng Du | `thuong-du.png` | Mộc | Hai thung lũng rừng, một đèo nối giữa |
| Cửa Biển | `cua-bien.png` | Thủy | Bãi bồi, cầu phao, bãi cạn, thủy trại |
| Ngã Ba Sông | `nga-ba-song.png` | Thổ | Thành giữa ba nhánh sông, ruộng phù sa |
| Kinh Thành | `kinh-thanh.png` | Hỏa | Kinh thành lớn ba cổng lũy |
| Quần Đảo | `quan-dao.png` | Phong | Thành đảo giữa vịnh, một cầu dài |

## 2. Khối phong cách chung

```text
Hand-painted top-down strategy map in the style of an antique Vietnamese war atlas, 10th century Đại Cồ Việt.
Seen from high above at a slight three-quarter angle, like a sand table in a general's tent.
Aged warm parchment paper base with soft torn edges and a faint vignette; ink outlines with flat watercolour washes;
jade-green forests, ochre fields, turquoise rivers, deep teal sea, grey-green karst mountains with drifting white clouds.
Walled forts drawn as small grey stone compounds with red-lacquered gate towers and curved tiled roofs;
villages as clusters of thatched stilt houses among bamboo; dirt roads as thin pale paths connecting every settlement.
Clear readable layout: every settlement stands on open ground with space around it, roads are visible between them.
No text, no letters, no labels, no flags, no banners, no arrows, no map markers, no compass rose, no border frame,
no people close-up, no modern objects. 5:3 landscape composition, evenly lit, high detail, game background asset.
```

## 3. Khối bố cục từng sa bàn

Vị trí trong bảng là phần trăm bề ngang (trái → phải) và bề cao (trên → dưới) của tranh. Đó là vị trí ô đang dùng trong
code, để tranh ra gần đúng thì Claude dời ít. "Đường" là đường bộ; "vượt nước" là chỗ phải lội sông hay đi thuyền.

### 3.1 Ải Bắc (`ai-bac.png`)

```text
Layout: a rugged northern frontier. Tall karst mountain ranges with cloud along the whole top edge and right edge.
Two small wooden army camps with palisades on the far left, one upper-left, one lower-left.
In the middle band, a narrow rocky gorge outpost (upper-left), a thatched mountain village (left-centre),
a small stream outpost (lower-left), a stone fort on a mountain pass (upper-centre-left),
a horse-stable granary with storehouses (centre), a reed-marsh fort by a wooden bridge (lower-centre).
Two stone gate forts guarding the approaches (upper-right-centre and lower-right-centre).
On the right, a large grey mountain citadel with double walls and a tall gate tower, the most imposing structure.
A winding river flows from the upper-left down through the centre. Roads link every settlement in a dense web.
```

| Ô | Loại | Vị trí |
|---|---|---|
| Trại Tả, Trại Hữu | trại | 6/25, 6/45 |
| Đồn Khe Đá, Bản Na, Đồn Suối Lạnh | đồn, làng, đồn | 17/13, 15/36, 21/53 |
| Lũy Đèo Mây, Kho Ngựa Thồ, Lũy Bãi Lau | lũy, kho lương, lũy | 27/22, 42/28, 37/47 |
| Lũy Gác Bắc, Lũy Gác Nam | lũy | 57/15, 66/43 |
| Thành Ải Bắc | thành đích | 76/29 |

### 3.2 Thượng Du (`thuong-du.png`)

```text
Layout: deep highland forest split by a long mountain ridge running left to right through the middle.
Upper half: a northern valley with a river; an army camp at the far upper-left, a bamboo-forest outpost,
a stilt-house village, a stacked-stone fort, a cloud-covered lookout post, in a line toward the upper-right.
Lower half: a southern valley among steep karst peaks with waterfalls; an army camp at the far lower-left,
a reed-slope outpost, a silver-waterfall outpost, a terraced rice-field village, a narrow-gorge lookout post,
in a line toward the right.
In the centre, one dangerous mountain pass fort crossing the ridge, the only link between the two valleys.
At the top-right, a forest citadel with wooden and stone walls where both valleys meet.
```

| Ô | Loại | Vị trí |
|---|---|---|
| Trại Đầu Nguồn, Trại Bến Suối | trại | 9/12, 8/46 |
| Đồn Rừng Tre, Bản Mộc, Lũy Đá Chồng, Chòi Mây Phủ | đồn, làng, lũy, đồn | 21/22, 36/17, 55/11, 72/15 |
| Đồn Dốc Lau, Đồn Thác Bạc, Bản Ruộng Bậc, Chòi Khe Hẹp | đồn, đồn, làng, đồn | 24/52, 38/37, 63/41, 82/30 |
| Đèo Ngang Núi | lũy | 58/32 |
| Thành Thượng Du | thành đích | 87/5 |

### 3.3 Cửa Biển (`cua-bien.png`)

Kịch bản cố định ([thiết kế](../../02-game-modes/expedition/03-cua-bien-thiet-ke.md)); bố cục đổi 04/11/2026.

```text
Layout: a river mouth meeting the sea. Land on the left and centre, open teal sea and tidal flats on the right.
Two army camps on the far left (upper boat landing, lower reed bank).
A sedge-landing outpost (upper-left), a fishing village on stilts near the top, a signal tower on a dune
watching the tide (top-centre-right), a busy river-mouth market with storehouses (centre-left, the crossroads),
a mangrove-flat outpost (lower-centre-left), a long pontoon bridge of boats across a channel (centre-right),
a sand-spit fort on a dike (lower-centre), a wide tidal shoal with a narrow water gate (bottom-right).
On the right, a western water camp: a wooden-walled fortress on stilts with a heavy timber gate and moored war boats.
A wide river channel separates the upper camp from the market; a reed marsh runs along the bottom.
```

| Ô | Loại | Vị trí |
|---|---|---|
| Trại Bến Thuyền, Trại Bãi Sậy | trại | 6/30, 10/52 |
| Đồn Bến Cói, Đồn Bãi Sú, Làng Chài | đồn, đồn, làng | 18/18, 32/47, 31/7 |
| Chợ Cửa Sông, Đài Quan Triều | kho lương, chòi canh | 36/31, 56/8 |
| Cầu Phao Doi Cát, Đồn Mũi Cát, Bãi Cạn | cầu, lũy, bãi cạn | 60/25, 59/44, 82/54 |
| Thủy Trại Tây | thành đích | 84/30 |

### 3.4 Ngã Ba Sông (`nga-ba-song.png`)

```text
Layout: a fertile alluvial plain where three broad rivers meet. In the exact middle-upper area, a walled citadel
standing on an island at the river confluence, surrounded by water on most sides, with one stone bridge on its
lower-right side. Ochre and green rice paddies everywhere, dikes and small canals.
Far left: an army camp on the west bank. Far right: an army camp on the east bank.
West side: a reed-landing outpost on the riverbank, a watchtower on a low hill near the top-left,
a rice-field village at the lower-left, a wooden-bridge outpost on a river island (left-centre).
North: an outpost on a northern sandbank (upper-centre-right) and a village by an upper landing (upper-right).
South: a granary with long storehouses on a river island (bottom-centre), a fort on a small hill (centre, below
the citadel), a ferry-landing fort next to the bridge (right-centre), an eastern sandbank outpost (lower-right).
Rivers must clearly separate the west bank, the north bank, the south island and the citadel island.
```

| Ô | Loại | Vị trí |
|---|---|---|
| Trại Bờ Tây, Trại Bờ Đông | trại | 5/15, 87/33 |
| Đồn Bến Lau, Chòi Đồi Trám, Làng Ruộng Chiêm | đồn, chòi canh, làng | 20/26, 25/8, 16/52 |
| Đồn Bãi Đông, Làng Bến Thượng | đồn, làng | 78/45, 76/11 |
| Đồn Cầu Gỗ, Đồn Bãi Bắc, Kho Thóc Bãi Giữa | đồn, đồn, kho lương | 37/33, 60/8, 48/53 |
| Lũy Bến Đò, Lũy Núi Sơn | lũy | 63/33, 54/42 |
| Thành Ngã Ba | thành đích | 51/22 |

### 3.5 Kinh Thành (`kinh-thanh.png`)

```text
Layout: the southern royal capital. In the centre-right, a very large walled imperial city with golden-roofed palace
halls, red gate towers and a moat; three fortified gate barbicans in front of its walls: one on the west wall,
one on the north wall, one on the east wall. Karst mountains with clouds along the left and bottom edges.
Top-left: an army camp. Top-right: an army camp beside a lagoon.
A village at the upper-left, a rice-seedling outpost (left-centre), a market town with storehouses (upper-centre),
a riverside outpost (upper-right), a watchtower on a western mountain (left), a fort at a western bridge
(centre-left), a watchtower on a rocky shore by the lagoon (right), a village at a southern landing (lower-right).
A river runs from the top-centre down the left side of the capital and along the bottom; a lagoon fills the right edge.
```

| Ô | Loại | Vị trí |
|---|---|---|
| Trại Bắc Thành, Trại Thủy Đông | trại | 18/5, 70/10 |
| Làng Đầu Bãi, Đồn Ruộng Mạ, Chợ Phiên, Đồn Bến Nước | làng, đồn, kho lương, đồn | 14/19, 28/30, 52/16, 74/27 |
| Chòi Núi Tây, Lũy Cầu Tây, Chòi Mép Nước | chòi canh, lũy, chòi canh | 12/36, 38/22, 84/38 |
| Cổng Tây, Cổng Bắc, Cổng Đông | lũy | 38/43, 56/26, 72/44 |
| Làng Bến Nam | làng | 69/53 |
| Kinh Thành | thành đích | 55/38 |

### 3.6 Quần Đảo (`quan-dao.png`)

```text
Layout: a wide bay of deep teal sea dotted with rocky green islands. A strip of mainland coast along the left edge.
Two army camps on the mainland: one at the top-left, one at the lower-left beach.
On the mainland: a rocky headland outpost (upper-left), a fort at the land end of a very long wooden bridge
(left-centre), a southern beach outpost (bottom-left).
In the centre-left of the bay, a large island with a walled sea citadel and harbour; the long wooden bridge
runs from the mainland fort to this island, the only dry route to it.
Other islands: a small northern island with a watchtower (top-centre), a turtle-shaped island with a fishing
village (centre), a large rocky eastern island with a fort (upper-right), a tiny islet with an outpost (far right),
an eastern island fort close to the citadel (centre-right), a southern island with granary storehouses (bottom-centre).
Small boats and sea lanes between the islands, no bridges except the one long bridge.
```

| Ô | Loại | Vị trí |
|---|---|---|
| Trại Bờ Bắc, Trại Bãi Cát | trại | 6/9, 5/47 |
| Đồn Mũi Đá, Đồn Bãi Nam, Lũy Cầu Dài | đồn, đồn, lũy | 22/15, 17/54, 23/34 |
| Chòi Đảo Bắc, Làng Đảo Rùa, Kho Đảo Nam | chòi canh, làng, kho lương | 41/8, 48/22, 50/56 |
| Lũy Đảo Đông, Đồn Hòn Nhỏ, Lũy Hòn Đông | lũy, đồn, lũy | 67/18, 85/26, 68/43 |
| Thành Đảo | thành đích | 42/38 |
