# Tranh nền sân khấu ảnh phong thái theo hệ

> Cập nhật: 08/11/2026
> Trạng thái: **APPROVED** — Shan chốt phương án B (08/11/2026): nền chung theo **hệ** (7 tranh), nhân vật là ảnh trong suốt đặt lên trên bằng mã. **Hệ Hỏa đã có tranh và đã gắn vào game**; sáu hệ còn lại chưa tạo (thiếu thì sân khấu giữ nền gỗ tối với quầng sáng màu hệ như cũ).

Trang chi tiết tướng ở Doanh Trại (`HeroDetail.tsx`, khung `.barracks-stage`) đặt ảnh phong thái của nhân vật cùng 9 ô trang bị. Tranh mẫu của Shan cho nhân vật đứng trên một cảnh có vầng sáng tròn, hoa, mây; tài liệu này là chuẩn tạo và gắn các tranh nền đó. Prompt nhân vật ở [prompt chân dung](chan-dung-lich-su.md) (mục 9).

## 1. Vì sao nền chung theo hệ

| | A. Nền riêng từng người (77) | **B. Nền chung theo hệ (7), đã chọn** | C. Nền theo phe (13) |
|---|---|---|---|
| Đồng bộ phong cách | dễ lệch giữa 77 ảnh | **chỉ 7 tranh cần giữ đồng bộ** | tốt |
| Nhân vật | dính liền nền | **ảnh trong suốt**, dùng lại cho hình động và ảnh phong thái | trong suốt |
| Đổi sau này | vẽ lại từng ảnh | **đổi một tranh nền** | tương tự B |
| Đinh Bộ Lĩnh đổi hệ | không đổi được | **nền đổi theo hệ đã chọn** | không |
| Nhận diện | tự do | **khớp hệ (màu nhận diện của game)** | khớp phe, ít liên quan lúc chơi |

Phe thể hiện bằng ký hiệu cờ trong mục Tiểu sử và bằng cảnh nền của **chân dung bán thân** (đổi dòng `Background:` theo phe; bảng 13 cảnh ở file [thiết kế lại nhân vật](../../03-characters/thiet-ke-lai-nhan-vat.md) mục 2.1 và prompt chân dung).

## 2. Thông số

| Mục | Giá trị |
|---|---|
| Tệp | `public/art/stage/he-<hệ>.webp` với `<hệ>` là id hệ trong mã: `kim`, `moc`, `thuy`, `hoa`, `tho`, `loi`, `phong`. PNG gốc đặt tên `he-<hệ>.png` |
| Khổ | **Ngang 2:1**, tạo từ 2400×1200 trở lên; Claude xuất WebP 1600×800 (khoảng 80 KB) |
| Nền | Không trong suốt; **không có người** |
| Bố cục | **Khu giữa** (vòng tròn cao khoảng 45% khung, có vầng sáng tròn nhạt) **êm, sáng, ít chi tiết** vì nhân vật đứng ở đó; chi tiết dồn vào hai phần ba bên ngoài vì ô trang bị nằm hai bên. Ảnh được cắt `cover` ở giữa, nên màn dọc (điện thoại) chỉ thấy phần giữa |
| **Chỗ đứng** | Phần giữa phía dưới (cao khoảng 18% khung, rộng khoảng 60%) là **một mặt phẳng để đứng**: bệ đá thấp, thềm đá hoặc bờ đất phẳng, ít chi tiết, hơi tối hơn vầng sáng, mép trên mềm, để nhân vật có nơi đặt chân (không phải mặt nước hay sương). Bản Hỏa đầu tiên **thiếu** chỗ này nên nhân vật trông lơ lửng; bản Hỏa thứ hai đã có bệ, code vẫn vẽ bóng tiếp đất nhẹ dưới chân |
| Cấm | Chữ, khung, viền, người, mặt, sét hoặc lửa sát khu giữa |
| Cảnh | Mô-típ Đông Sơn (sóng, mây cuộn, răng cưa, chim Lạc) dùng tiết chế; kiến trúc mái ngói Việt, tránh dáng cung điện Trung Hoa |

**Khối phong cách (dán đầu mọi tranh nền):**

```text
Style: hand-painted digital background illustration for a strategy game, WIDE landscape 2:1 composition, soft painterly shading, clean confident ink-wash contours, minimal brush texture, medium-low saturation, no people, no animals except tiny distant birds, no text, no frame, no border. The CENTRE of the image (a circle about 45% of the height, with a pale luminous halo disc) must stay calm, soft and lighter so a character can stand in front of it; keep all detailed elements in the outer thirds. In the lower centre, about 18 percent of the height and 60 percent of the width, a FLAT STANDING GROUND: a low weathered stone terrace or flat packed-earth ledge, calm and uncluttered, slightly darker than the halo, with a soft misty upper edge, clearly a solid surface where a character can plant their feet (never open water or fog). Slight dark vignette toward the bottom edge. 10th-century Vietnam mood, Dong Son decorative scrolls used sparingly.
```

**Negative prompt:** `people, characters, faces, text, letters, logo, frame, border, watermark, bright neon, oversaturated, photorealistic, 3d render, harsh lightning bolts near the centre, busy detail in the centre`

## 3. Cảnh từng hệ (dòng `Scene:` dán sau khối phong cách)

| Hệ | Trạng thái | Dòng `Scene:` |
|---|---|---|
| Hỏa | **Đã gắn** (`he-hoa.webp`) | Crimson and ember dusk sky with a large pale-gold circular halo disc (sun or moon) centred; red cherry-blossom and maple branches framing the left edge; a lotus pond with a few lotus flowers and wide leaves only along the lower right corner, while the lower centre is the flat stone terrace with a few fallen petals; a soft band of cloud scrolls with Dong Son wave-and-cloud patterns; far on both sides faint silhouettes of curved temple roofs and pagoda eaves in mist. Palette: brick red, burnt sienna, ochre, antique gold, dusty rose. |
| Thủy | chưa tạo | Deep teal and slate-blue dusk with a large pale silver-blue circular halo disc centred; a calm river with drifting mist across the lower half, reeds and wide lotus leaves, faint silhouette of an arched wooden bridge far on one side; cloud scrolls with Dong Son wave patterns. Palette: teal, slate blue, dusty turquoise, pale silver, touches of antique gold. |
| Mộc | chưa tạo | Moss-green and warm gold dusk with a large pale gold-green circular halo disc centred; tall bamboo groves and old trees framing both edges, ferns and hanging vines, soft light through leaves, cloud scrolls with Dong Son patterns. Palette: moss green, olive, bamboo yellow, warm gold, dark umber. |
| Kim | chưa tạo | Silver-grey and bronze dusk with a large pale silver circular halo disc centred; a ridge of craggy limestone peaks in mist behind, wind-swept grass in the foreground, faint Dong Son bronze-drum sun motif hidden in the cloud scrolls. Palette: steel grey, brushed silver, antique bronze, ivory, warm umber. |
| Thổ | chưa tạo | Ochre and umber earth-toned dusk with a large amber circular halo disc centred; terraced hills, a rammed-earth village wall and a simple tiled gate in haze, dust drifting in light, cloud scrolls with Dong Son patterns. Palette: ochre, raw sienna, umber, clay red, warm gold. |
| Lôi | chưa tạo | Violet and indigo storm dusk with a large pale lilac circular halo disc centred; towering mountain peaks, heavy cloud scrolls with Dong Son patterns, very faint distant lightning veins inside the far clouds only (no glow, no bolts near the centre). Palette: indigo, violet, slate, dusty purple, antique gold edges. |
| Phong | chưa tạo | Jade-teal and pale ivory dusk with a large pale jade circular halo disc centred; wind-swept clouds streaming sideways, bamboo leaning in the wind at one edge, a few distant birds in a loose line, cloud scrolls with Dong Son patterns. Palette: jade, pale teal, ivory, sage, touches of antique gold. |

**Nhận xét tranh Hỏa đã dùng (08/11/2026):** Shan nhận xét nhân vật "hơi thiếu chỗ đứng": nền phía dưới là mặt nước và sương, không có mặt phẳng để đứng. Đã thêm bóng tiếp đất bằng mã (`.barracks-ground`), đưa yêu cầu "chỗ đứng" vào chuẩn ở trên và thay bằng **bản Hỏa thứ hai có bệ đá phẳng** (1600×800, ~90KB; bệ rộng hơn 60% và cao khoảng 23%, vầng sáng hơi tương phản với trời hơn bản đầu). Ở bản đầu khu giữa rất êm và sáng (độ lệch chuẩn độ sáng 3,5 so với khoảng 40 ở hai bên), vầng sáng nằm đúng sau đầu nhân vật, hai ô trang bị đọc rõ. Hai chi tiết nên tránh ở các tranh sau: **mái đền kiểu Trung Hoa cong vút** (ở tranh Hỏa là mái cong hai bên, chấp nhận được nhưng nên thuần Việt hơn) và **lá phong kiểu Nhật** (nên dùng lá và hoa Việt: đào, sen, tre).

## 4. Gắn vào game

- `src/app/game/art/portrait-data.ts`: `STAGE_BACKDROP_ELEMENTS` (tập hệ đã có tranh) và `stageBackdropUrl(hệ)`. **Thêm hệ vào tập này khi có tệp.**
- `src/app/game/profile/HeroDetail.tsx`: khung `.barracks-stage` dùng tranh làm nền (`cover`, giữa) kèm lớp tối dần ở đáy; hệ chưa có tranh thì giữ nền gỗ tối với quầng sáng màu hệ.
- Khi có tranh nền, nhân vật có thêm **bóng tiếp đất** (`.barracks-ground` trong `globals.css`) dưới chân.
- Nhân vật chọn hệ khác (Đinh Bộ Lĩnh) thì nền đổi theo hệ đang chọn.
- Test `tests/game/bust-art.test.ts` kiểm các tệp trong tập tồn tại.

## 5. Việc còn lại

0. (Xong) tranh Hỏa có bệ đứng đã thay `he-hoa.webp`.
1. Tạo sáu tranh nền còn lại (Thủy, Mộc, Kim, Thổ, Lôi, Phong), thêm hệ vào `STAGE_BACKDROP_ELEMENTS`.
2. Ảnh phong thái mới của từng nhân vật (trong suốt, độ phân giải gấp đôi tranh cũ 250×379) để nhìn sắc nét trên nền mới; hiện ảnh cũ nhỏ nên hơi mờ trên nền lớn.
