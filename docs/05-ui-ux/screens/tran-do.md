# Giao diện Trận Đồ

> Cập nhật: 02/11/2026
> Trạng thái: **DRAFT** — cơ chế sa bàn là bản đồ đã có code với ảnh giữ chỗ; ảnh bản đồ, ô che và icon chướng ngại thật do Shan thiết kế; gợi ý màn chế độ và màn chơi chi tiết đã làm một phần để Shan tham khảo rồi góp ý.

Luật chơi ở [GDD Binh Pháp](../../02-game-modes/future/02-binh-phap-gdd.md); tài liệu này chỉ nói về giao diện. Màn chơi nằm ở `src/app/game/formation/`.

## 1. Quyết định của Shan (02/11/2026)

1. **Sa bàn là một tấm bản đồ**; đặt quân vào thì ô sáng lên lộ mảnh bản đồ bên dưới; cơ chế chơi giữ nguyên.
2. **Một kho ảnh bản đồ xoay theo kỳ**, **địa danh thật của thời Loạn 12 sứ quân** (13 địa danh: Hoa Lư và 12 nơi của 12 sứ quân).
3. **Ô chưa mở** hiển thị bằng **ảnh che theo thiết kế**, đặc kín; **không** để ảnh mờ của bản đồ lộ ra vì dễ nhầm với ô đã mở.
4. **Chướng ngại có bốn biến thể** (núi, rừng, đầm lầy, thành lũy), cần icon riêng, không cần cầu kì nhưng có nét riêng; **ô chướng ngại không dùng ảnh bản đồ làm nền**.
5. **Quân** đủ huy hiệu nghề và hệ nhưng nhỏ vừa đủ.
6. **Hoàn thành một màn thì hiện ảnh đầy đủ** của màn đó.
7. **Chế độ tùy chỉnh** trong Chơi thường: chọn cột × hàng, nghề, hệ, quân đặc biệt (và chướng ngại).
8. Gợi ý giao diện màn chế độ và màn chơi: **triển khai trước**, Shan tham khảo thực tế rồi góp ý sau.

## 2. Đã code (ảnh giữ chỗ)

- **Kho bản đồ** (`maps.ts`): 13 địa danh lấy từ danh mục sứ quân của Campaign V2 (`WARLORD_ENCOUNTERS`) cộng Hoa Lư. Bản đồ của một ván chọn bằng `mapFor(bậc, theme)`; `theme` suy từ seed (chơi thường) hoặc từ muối bí mật (xếp hạng) và như nhau với mọi người trong cùng kỳ, mỗi bậc lệch một khoảng nên cùng kỳ các bậc không trùng bản đồ. Thường/Khó đổi bản đồ mỗi ngày, Đại trận mỗi tuần (theo kỳ xếp hạng).
- **Ô che đặc kín** (`public/art/formation/fog.svg`, ảnh giữ chỗ): nền sơn mài nâu với vân mây cuộn, đè hoàn toàn lên bản đồ. Ô mở thì ô che mờ dần (0,45 giây, tắt khi giảm chuyển động), ô trong suốt lộ bản đồ và viền sáng nhẹ. Ô vẫn sáng sau khi quân bị dọn (vệt khai thông).
- **Chướng ngại** (4 biến thể SVG giữ chỗ): núi (đỉnh nhọn có tuyết), rừng (cụm cây tán tròn), đầm lầy (mặt nước gợn và cỏ lau), thành lũy (tường có lỗ châu mai và cổng). Mỗi ô một kiểu theo vị trí (như nhau cho mọi người chơi cùng bàn). Ô chướng ngại có nền đá tối riêng, không lấy ảnh bản đồ.
- **Quân**: chân dung tròn có bóng như con cờ đặt lên bản đồ, kèm **hai huy hiệu tròn nhỏ**: hệ (nền theo màu hệ) ở đáy trái, nghề (nền tối) ở đáy phải; kích thước theo ô, không nhỏ hơn 11px. Quân dung hợp dùng một huy hiệu sao đỏ ở giữa đáy.
- **Hoàn thành**: quân và chướng ngại mờ đi (0,8 giây) để cả bản đồ hiện ra trên sa bàn, và khung kết quả hiện ảnh bản đồ đầy đủ kèm địa danh, một dòng giới thiệu và chú thích "tranh minh họa tái dựng, không phải bản đồ lịch sử chính xác" (theo [sổ nguồn sử](../../02-game-modes/campaign/history-sources.md): vị trí một số địa danh còn tranh luận, ví dụ Bình Kiều).
- **Tùy chỉnh** (`CustomForm.tsx`, trong Chơi thường): cột và hàng 3–10, chướng ngại 0–30%, Quân Lệnh 0–15%, Thu Hồi 0–10%, nhân vật dung hợp 0–10% (khóa tới khi có nhân vật được duyệt), chọn từng nghề (≥2) và từng hệ (≥2). Lựa chọn lưu ở máy; ván tùy chỉnh không ghi điểm cao nhất, không thưởng, không xếp hạng; engine kiểm lại giới hạn khi tạo và khi nạp ván.
- Ảnh giữ chỗ: tranh nền chiến dịch có sẵn (8 ảnh cho 13 địa danh nên có lặp, và không phải bản đồ nhìn từ trên xuống).

## 3. Yêu cầu ảnh (cho họa sĩ)

### 3.1 Ảnh bản đồ (13 ảnh, mỗi địa danh một ảnh)

| Mục | Yêu cầu |
|---|---|
| Tệp | `public/art/formation/maps/<id>.webp`, `id`: `hoaLu`, `tranLam`, `phamBachHo`, … (đúng id sứ quân trong `WARLORD_ENCOUNTERS`); sửa `src` trong `maps.ts` |
| Khổ | **Vuông 2048×2048**, WebP. Sa bàn từ 3×3 đến 10×10 và hình chữ nhật nên ảnh bị cắt theo tỉ lệ bàn; **chi tiết quan trọng nằm trong 80% giữa ảnh** |
| Phong cách | Bản đồ vẽ tay trên giấy dó, nhìn chếch từ trên xuống, mực nâu và màu đất nhạt, thế kỷ X Đại Việt (sông, núi, làng, thành, đường); khớp [art bible](../../06-art/art-bible.md) |
| Độ tương phản | Trung bình, màu hơi nhạt: **chân dung quân tròn phải đọc rõ khi đặt lên bất kỳ chỗ nào** |
| Chi tiết | Ô chỉ cỡ 1/10 ảnh nên cần địa vật đủ lớn để nhận ra khi mới lộ vài ô (một khúc sông, một mái nhà, một đoạn tường thành) |
| Cấm | Chữ, số, lưới ô, khung UI, hình người đọc được mặt (trùng chân dung quân), watermark |
| Địa danh | Chữ do UI hiển thị khi hoàn thành, không vẽ vào ảnh |

Prompt gốc (đổi `[ĐỊA ĐIỂM + ĐẶC TRƯNG]` theo bảng dưới):

> "Hand-painted 10th-century Vietnamese strategic map on aged mulberry paper, seen from a high oblique angle, [PLACE AND FEATURES], dirt roads, muted ink brown and earthy greens, soft mid-tone contrast, no text, no numbers, no grid, no UI, no faces, no watermark, square composition with the important landmarks inside the central 80%."

| id | Địa danh (nay) | Đặc trưng gợi ý cho `[PLACE AND FEATURES]` |
|---|---|---|
| `hoaLu` | Hoa Lư, Ninh Bình | Limestone karst mountains ringing a valley, a small walled citadel, narrow river gaps |
| `tranLam` | Bố Hải Khẩu, Thái Bình | River mouth near the sea, tidal flats, fishing boats and salt fields |
| `phamBachHo` | Đằng Châu, Hưng Yên | Red River delta plain, dikes, a river port with moored boats |
| `ngoXuongXi` | Bình Kiều | Rural plain, a long bridge over a stream (tên cầu), scattered villages |
| `ngoNhatKhanh` | Đường Lâm | Ancient village of laterite houses and banyan trees, a village gate |
| `nguyenKhoan` | Tam Đái | Where three rivers meet, wide water, a hilltop stronghold |
| `kieuCongHan` | Phong Châu | Upland hills and rice terraces, a river valley with a fortified hill |
| `kieuThuan` | Hồi Hồ | Lake edge with reed beds and a stilted bridge, a fortified village |
| `lyKhue` | Siêu Loại | Canal-crossed plain, low hills, a moated stronghold |
| `nguyenThuTiep` | Tiên Du | Mountain with temples and pines overlooking fields |
| `luDuong` | Tế Giang | Misty marsh with reeds and a wooden causeway |
| `nguyenSieu` | Tây Phù Liệt | Village between ponds and fields with a small earthen wall |
| `doCanhThac` | Đỗ Động Giang | River bend with embankments, villages on raised ground |

*(Cột id ở trên là gợi ý đối chiếu; id thật lấy từ `WARLORD_ENCOUNTERS` trong `src/core/campaign/warlords.ts`. Đặc trưng là phỏng theo cảnh quan hiện nay và thông tin trong sổ nguồn sử, mang tính minh họa; Bình Kiều định vị còn tranh luận nên không vẽ chi tiết địa lý cụ thể.)*

### 3.2 Ảnh ô che (1 họa tiết lát được)

| Mục | Yêu cầu |
|---|---|
| Tệp | `public/art/formation/fog.svg` hoặc `fog.webp` (đổi đường dẫn trong `src/app/globals.css`, lớp `.fm-cell[data-state="fog"]::before`) |
| Khổ | Ô vuông **lát được liền mạch** 256×256 (hiển thị khoảng 48px mỗi ô lặp) |
| Phong cách | Sơn mài nâu sẫm với vân mây cuộn hoặc họa tiết Đông Sơn chìm, **đặc kín hoàn toàn (không trong suốt)**, độ tương phản thấp để không rối khi nhiều ô cạnh nhau, **khác hẳn** màu và chất liệu bản đồ để không nhầm với ô đã mở |

> "Seamless tileable texture, dark lacquered brown wood with faint embossed Dong Son bronze-drum cloud swirls, fully opaque, low contrast, flat lighting, no text, no objects, no borders, 256x256."

### 3.3 Bốn icon chướng ngại

Mỗi icon: **256×256, PNG/WebP nền trong suốt**, nhìn rõ ở cỡ 32px, nhìn từ chếch trên xuống, có bóng đổ nhẹ, mực nâu và màu đất khớp bản đồ; **không** chữ. Tệp `public/art/formation/obstacles/<nui|rung|damLay|thanhLuy>.webp`, rồi đổi `Obstacle` trong `FormationScreen.tsx` sang thẻ ảnh. Nền ô chướng ngại do UI vẽ (đá tối), icon không cần nền.

| Icon | Prompt gốc |
|---|---|
| Núi (`nui`) | "Isolated hand-painted game icon of a rugged limestone mountain peak with a snow-white cap, ink outlines, muted brown and grey, transparent background, readable at 32px, no text." |
| Rừng (`rung`) | "Isolated hand-painted game icon of a small cluster of three round-canopy trees with thin trunks, ink outlines, muted greens and browns, transparent background, readable at 32px, no text." |
| Đầm lầy (`damLay`) | "Isolated hand-painted game icon of a small marsh pond with rippling teal water and tall reeds with brown seed heads, ink outlines, transparent background, readable at 32px, no text." |
| Thành lũy (`thanhLuy`) | "Isolated hand-painted game icon of a short stone fortress wall with crenellations and an arched gate, 10th-century Vietnamese earthen-stone style, ink outlines, muted grey-brown, transparent background, readable at 32px, no text." |

## 4. Còn thiếu và rủi ro

- Ảnh thật chưa có: cần chỉnh lại độ tương phản của quân và ô che khi có ảnh thật.
- Ô nhỏ trên điện thoại (bàn 10×10 còn khoảng 33px, dưới mức 44px của nút điều khiển); hai huy hiệu bù bằng cỡ tối thiểu 11px nhưng vẫn rất nhỏ.
- Chưa có chuyển động khi dọn hàng/cột (chỉ có tin nhắn dưới sa bàn) và chưa có âm thanh (DEFERRED).
- Một số địa danh có định vị còn tranh luận (Bình Kiều); ảnh phải là tranh minh họa tái dựng và UI đã ghi chú như vậy.
- 13 địa danh nên kỳ xoay vòng sau khoảng hai tuần ở Đại trận và hai tuần ở bậc theo ngày nếu chọn tuần tự; hiện chọn theo băm nên có thể lặp lại trước khi hết vòng.

## 5. Gợi ý màn chế độ (để Shan tham khảo thực tế rồi góp ý)

Đã làm: thẻ bậc, tab, bảng thưởng như hiện tại. **Chưa làm** (đang chờ góp ý): thẻ bậc là ảnh bản đồ mờ sương của kỳ này, đồng hồ kỳ ("còn 5 giờ") và hạng hiện tại trên thẻ, thang thưởng dạng bậc thang, hai tab Xếp hạng/Chơi thường, bộ sưu tập địa danh đã hoàn thành (hướng cho thưởng không phải vàng sau này).

## 6. Gợi ý màn chơi chi tiết (để Shan tham khảo thực tế rồi góp ý)

Đã làm: bản đồ là trung tâm, quân tròn kèm hai huy hiệu, hoàn thành hiện cả bản đồ và địa danh. **Chưa làm**: thanh dưới màn hình trên điện thoại (quân đang cầm và Bỏ Lệnh), "lệnh bài" lớn cho quân đang cầm và thanh Bỏ Lệnh vẽ như ba vạch lửa, hiệu ứng dọn hàng bằng vệt sáng, gợi ý ô đặt được chỉ khi rê hoặc bật tắt, hướng dẫn từng bước bằng lớp phủ ở bậc 3×3.

## 7. Câu hỏi còn mở

1. Gần đến lúc có ảnh thật: kho 13 địa danh đủ chưa, hay thêm địa danh khác (ví dụ Đại La, Cổ Loa)?
2. Chọn bản đồ theo băm (có thể lặp trong vòng) hay xoay tuần tự để mỗi bản đồ xuất hiện đều?
3. Hướng nào ở mục 5 và 6 làm tiếp sau khi Shan tham khảo?
