# 18 — Tầm Tướng Ký: Gói 1 và mô phỏng LT-05

> Cập nhật: 04/11/2026
> Trạng thái: **DRAFT** — Gói 1 (12 tướng) có code (`PACK_1`, đang chạy sau cờ, còn `draft`); mô phỏng có số liệu. Chờ Shan duyệt công thức và chọn ba con số ở [mục 5](#5-cần-shan-chọn).

Luật theo [Design Freeze](14-tam-tuong-ky-design-freeze.md) (FROZEN). File này ghi nội dung Gói 1, kết quả kiểm và mô phỏng; không đổi luật. Khi Shan chọn ở mục 5, kết quả ghi vào changelog và Design Freeze qua quyết định mới.

## 1. Nội dung

- **12 tướng** theo danh sách Shan duyệt ([Design Freeze mục 5](14-tam-tuong-ky-design-freeze.md#5-gói-đầu-tiên-10-lịch-sử--2-đặc-biệt)): 6 tướng theo Đinh Bộ Lĩnh, 4 sứ quân, Đinh Ngọc và Trần Vũ Phong.
- **82 công thức, 70 yếu tố trung gian**, 89 node. Nhiều hơn chỉ tiêu cũ 30–50 vì mỗi tướng lịch sử phải đúng 12 lần ghép tối thiểu.
- Giữ nguyên mọi ID của slice-1: sổ đã chơi ở slice chuyển sang Gói 1 không mất gì (có test).
- Vật biểu trưng theo art ([audit vũ khí nhóm A](../../06-art/prompts/v4-2/14-group-a-19-character-weapon-pose-audit.md), [Đinh Ngọc](../../03-characters/dinh-ngoc.md), [Trần Vũ Phong](../../03-characters/vu-phong.md)); tên tri thức gợi tới tên chiêu riêng trong game.
- Ba quân sư cùng “cờ lệnh + thẻ tre” trong art (Lê Hoàn, Trần Lãm, Ngô Nhật Khánh) có công thức cuối khác nhau: Thập đạo + Binh thư; Trấn giang + Thủy quân; Cờ lệnh trong gió + Làng Đường Lâm.
- Nguồn sử: tướng theo Đinh Bộ Lĩnh `S04`; sứ quân `S01` + `S05` (danh sách Thập nhị sứ quân). Tướng Lục vẫn chỉ hiện nghề, hệ, vật biểu trưng (A-16).
- Thành tựu bộ theo P-21: 5 bộ hệ (Hỏa, Thổ, Kim, Thủy, Phong) 200 vàng; 2 tướng đặc biệt 300; 6 tướng theo Đinh Bộ Lĩnh 500; 4 sứ quân 400; đủ gói 1 000. Tổng 3 200 vàng. Mộc, Lôi mỗi hệ một tướng nên chưa có bộ.

## 2. Kết quả kiểm

`validatePack(PACK_1)`: **0 lỗi, 0 cảnh báo**. `tests/core/tam-tuong-ky/pack-1.test.ts` (10 test).

| Mục | Kết quả |
|---|---|
| Số lần ghép tối thiểu | 10 tướng lịch sử đều 12, 2 tướng đặc biệt đều 9 |
| Nguyên tố tiêu ở chế độ Hạng | Lịch sử 13 đơn vị mỗi tướng, đặc biệt 10 |
| Ngõ cụt | Không còn (Dược thảo nối vào Trịnh Tú) |
| Công thức cuối trùng | Không |
| Cặp starter có công thức | 18/49, trong đó 4 cặp `A+A` (Mộc, Thủy, Thổ, Phong) |
| Cặp gương ra hai kết quả khác nhau | Mộc+Thủy / Thủy+Mộc; Kim+Thổ / Thổ+Kim; Giọt sương+Đá ngọc thô / Đá ngọc thô+Giọt sương |
| Yếu tố dùng lại nhiều nhất | Tre 8 công thức; Lũy đất, Đồng đen 5; Vải gai, Cờ lệnh, Sắt rèn 4 |
| Nguyên tố dùng làm nguyên liệu | Mộc 13 công thức, Thổ 10, Thủy 9, Phong 8, Kim 7, Hỏa 6, **Lôi 1** |

**Lệch hệ:** cả gói ở chế độ Hạng cần 51 đơn vị Mộc, 26 Thổ, 20 Phong, 19 Kim, 18 Thủy, 13 Hỏa nhưng chỉ 3 Lôi. Lê Hoàn (hệ Lôi) chỉ cần 1 Lôi.

## 3. Mô phỏng chế độ Thường

`scripts/tam-tuong-ky-sim.ts`, 200 lần chạy mỗi kiểu, kết quả đầy đủ trong `docs/reports/2026-11-04-tam-tuong-ky-lt05/sim.json`. Phiếu mỗi tuần theo P-10: 10 (7 nhiệm vụ ngày + 2 “Thắng 15 trận” + 1 điểm danh ngày 7), tức khoảng 21 lần ghép mỗi ngày với 15 lần mỗi phiếu, 29 với 20 lần.

Người biết hết công thức cần **82 lần ghép** cho cả gói (8–12 lần mỗi tướng), tức 6 phiếu. Người mới mô phỏng là **người đoán mò**: thử cặp chưa thử trong số yếu tố đã có, không suy nghĩa tên. Người thật sẽ nhanh hơn, nên đây là cận dưới.

| Người mới (trung vị, ngày) | Tướng đầu | 6 tướng | 12 tướng |
|---|---|---|---|
| Không gợi ý, 15 lần/phiếu | 92 | 203 | 278 |
| Gợi ý hiện tại (2/ngày), 15 lần/phiếu | 97 | 115 | 136 |
| + dấu “còn công thức chưa tìm” trên yếu tố, 15 lần/phiếu | 72 | 79 | 83 |
| + gợi ý nhắm tướng, 15 lần/phiếu | **9** | **55** | **72** |
| Gợi ý hiện tại, 20 lần/phiếu | 73 | 86 | 103 |
| + dấu + gợi ý nhắm tướng, 20 lần/phiếu | **8** | **44** | **57** |

- Gợi ý hiện tại chọn công thức nông nhất trong cả sổ nên dẫn người chơi đi rộng, không về tướng nào: tướng đầu không tới sớm hơn.
- **Dấu “còn công thức chưa tìm”**: mỗi yếu tố trong Vạn Vật Lục có dấu nếu nó còn là nguyên liệu của công thức chưa tìm (không nói cặp nào).
- **Gợi ý nhắm tướng**: gợi ý mức 2 lộ một nguyên liệu của công thức ghép được ngay trên đường tới tướng chưa tìm gần nhất. Vẫn không lộ đủ công thức hay thứ tự ô (A-12).

## 4. Mô phỏng chế độ Hạng

Giả sử người chơi đã biết công thức (học ở chế độ Thường), danh sách đề cử xoay vòng cố định, mỗi tuần ít nhất 1 tướng đặc biệt; ghép tướng rẻ trước. Nguồn bó mỗi tuần: cấp nền 3 (P-12); nửa trên ở hai chế độ tuần 2 + 2; top 10 ở hai chế độ 3 + 3; mua tối đa 2 (P-13).

**Bó chia đều** (như P-11: 1 đơn vị mỗi hệ) so với **bó tự chọn** (7 đơn vị, người chơi chọn hệ):

| Đề cử | Bó cần để xong (chia đều / tự chọn) | Cấp nền 3 bó | Nửa trên 2 chế độ (7) | + mua 2 (9) | Top 10 2 chế độ + mua 2 (11) |
|---|---|---|---|---|---|
| 5 tướng | 21 / 9 | 1 / 1 | 2 / 4 | 2 / 5 | 3 / 5 |
| 7 tướng | 30 / 13 | 1 / 1 | 2 / 4 | 3 / 5 | 3 / 6 |
| 10 tướng | 45 / 18 | 1 / 2 | 3 / 4 | 3 / 5 | 4 / 6 |

Số trong ô là trung vị số tướng ghép được (chia đều / tự chọn). Lần ghép cần để xong: 57 / 81 / 114.

- Bó chia đều phí vì nhu cầu lệch hệ (mục 2): Mộc cạn trước, Lôi thừa. Với 9 bó, người chơi trung bình chỉ ghép được 2/5 tướng.
- Bó tự chọn khớp P-17 (“người chơi trung bình ghép được khoảng một nửa nếu biết công thức”) ở **7 tướng**: 4/7 với 7 bó, 5/7 khi mua thêm, 6/7 cho top 10; còn chỗ để cạnh tranh hạng.

## 5. Cần Shan chọn

| # | Câu hỏi | Claude đề xuất |
|---|---|---|
| L5-1 | Số lần ghép mỗi phiếu (khung đã duyệt 15–20) | **15**: đủ 12 tướng sau khoảng 10 tuần cho người mới có dấu và gợi ý nhắm tướng, không mở hết quá nhanh (A-6) |
| L5-2 | Bó nguyên tố: chia đều 7 hệ (P-11) hay tự chọn 7 đơn vị | **Tự chọn**; nếu giữ chia đều thì phải giảm đề cử xuống 5 và vẫn chỉ ~40% |
| L5-3 | Số tướng đề cử mỗi tuần (cố định, xoay vòng) | **7** nếu bó tự chọn; **5** nếu bó chia đều |
| L5-4 | Thêm dấu “còn công thức chưa tìm” vào Vạn Vật Lục | **Có** (không lộ cặp, giống thể loại) |
| L5-5 | Gợi ý mức 2 nhắm tướng chưa tìm gần nhất thay vì công thức nông nhất | **Có** (vẫn 2 lượt/ngày, không lộ đủ công thức) |
| L5-6 | Duyệt 82 công thức ở mục 6 | |

L5-2, L5-4, L5-5 đổi luật đã FROZEN (P-11, A-12 về cách chọn gợi ý) nên cần quyết định mới trước khi code.

## 6. Công thức Gói 1

Đọc “ô trước + ô sau → kết quả (số lần ghép tối thiểu)”. Mỗi bảng là cây rẻ nhất của một tướng; yếu tố dùng chung lặp lại ở nhiều bảng. Lý do biểu trưng ghi trong code (`reason`).

#### Nguyễn Bặc

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Mộc | Mộc | Tre (1) |
| Sắt rèn | Tre | Đại đao (3) |
| Mộc | Phong | Vải gai (1) |
| Vải gai | Hỏa | Dải vải đỏ (2) |
| Đại đao | Dải vải đỏ | Đại đao buộc vải đỏ (6) |
| Mộc | Thủy | Lau sậy (1) |
| Lau sậy | Dải vải đỏ | Cờ lau (4) |
| Cờ lau | Hỏa | Hỏa kỳ (5) |
| Đại đao buộc vải đỏ | Hỏa kỳ | **Nguyễn Bặc (12)** |

#### Lê Hoàn

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Mộc | Tre (1) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Lôi | Phong | Giông tố (1) |
| Giông tố | Mộc | Trống trận (2) |
| Cờ lệnh | Trống trận | Thập đạo (6) |
| Tre | Kim | Thẻ tre (2) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Thẻ tre | Mực | Binh thư (5) |
| Thập đạo | Binh thư | **Lê Hoàn (12)** |

#### Đinh Ngọc

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Sắt rèn | Kim | Kiếm ngắn (2) |
| Thổ | Kim | Đá ngọc thô (1) |
| Thủy | Thủy | Giọt sương (1) |
| Đá ngọc thô | Giọt sương | Ngọc giọt nước (3) |
| Kiếm ngắn | Ngọc giọt nước | Kiếm ngọc (6) |
| Thổ | Thổ | Lũy đất (1) |
| Lũy đất | Phong | Đường xa (2) |
| Kiếm ngọc | Đường xa | **Đinh Ngọc (9)** |

#### Đinh Điền

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Sắt rèn | Mộc | Mũi giáo lá (2) |
| Mộc | Mộc | Tre (1) |
| Mũi giáo lá | Tre | Giáo cán gỗ (4) |
| Mộc | Thủy | Lau sậy (1) |
| Lau sậy | Phong | Chùm lông lau (2) |
| Giáo cán gỗ | Chùm lông lau | Giáo chùm lông lau (7) |
| Mộc | Thổ | Dây mây (1) |
| Dây mây | Dây mây | Mây đan (3) |
| Mây đan | Thổ | Khiên mây (4) |
| Giáo chùm lông lau | Khiên mây | **Đinh Điền (12)** |

#### Lưu Cơ

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Phong | Phong | Lông vũ (1) |
| Kim | Thổ | Đồng đen (1) |
| Đồng đen | Hỏa | Hoa thị đồng (2) |
| Lông vũ | Hoa thị đồng | Quạt lông trắng (4) |
| Mộc | Mộc | Tre (1) |
| Tre | Kim | Thẻ tre (2) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Đồng đen | Mực | Ấn đồng (4) |
| Thẻ tre | Ấn đồng | Phủ lệnh (7) |
| Quạt lông trắng | Phủ lệnh | **Lưu Cơ (12)** |

#### Trịnh Tú

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Thủy | Giọt sương (1) |
| Mộc | Giọt sương | Quả bầu (2) |
| Kim | Thổ | Đồng đen (1) |
| Quả bầu | Đồng đen | Hồ lô nắp đồng (4) |
| Mộc | Phong | Vải gai (1) |
| Vải gai | Mộc | Tua xanh (2) |
| Hồ lô nắp đồng | Tua xanh | Hồ lô thuốc (7) |
| Thủy | Mộc | Dược thảo (1) |
| Mộc | Mộc | Tre (1) |
| Tre | Kim | Thẻ tre (2) |
| Dược thảo | Thẻ tre | Sách thuốc (4) |
| Hồ lô thuốc | Sách thuốc | **Trịnh Tú (12)** |

#### Đinh Liễn

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Kim | Cán gỗ bịt đồng (1) |
| Thủy | Thủy | Giọt sương (1) |
| Thổ | Kim | Đá ngọc thô (1) |
| Giọt sương | Đá ngọc thô | Ngọc cầu Thủy (3) |
| Cán gỗ bịt đồng | Ngọc cầu Thủy | Trượng đầu cầu Thủy (5) |
| Kim | Thổ | Đồng đen (1) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Đồng đen | Mực | Ấn đồng (4) |
| Mộc | Phong | Vải gai (1) |
| Ấn đồng | Vải gai | Vương ấn (6) |
| Trượng đầu cầu Thủy | Vương ấn | **Đinh Liễn (12)** |

#### Phạm Bạch Hổ

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Mộc | Mộc | Tre (1) |
| Sắt rèn | Tre | Đại đao (3) |
| Đại đao | Sắt rèn | Đại đao sống khía (5) |
| Phong | Phong | Lông vũ (1) |
| Đại đao sống khía | Lông vũ | Đại đao cán quấn lông (7) |
| Thổ | Phong | Núi (1) |
| Núi | Kim | Bạch hổ (2) |
| Bạch hổ | Núi | Hổ xuất sơn (4) |
| Đại đao cán quấn lông | Hổ xuất sơn | **Phạm Bạch Hổ (12)** |

#### Đỗ Cảnh Thạc

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Thổ | Đồng đen (1) |
| Thổ | Thổ | Lũy đất (1) |
| Đồng đen | Lũy đất | Đầu búa đồng vuông (3) |
| Mộc | Mộc | Tre (1) |
| Tre | Mộc | Cán dài (2) |
| Đầu búa đồng vuông | Cán dài | Búa chiến (6) |
| Lũy đất | Lũy đất | Lũy kép (3) |
| Thổ | Hỏa | Đá tảng (1) |
| Lũy kép | Đá tảng | Kiên tâm (5) |
| Búa chiến | Kiên tâm | **Đỗ Cảnh Thạc (12)** |

#### Trần Lãm

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Thổ | Cửa sông (1) |
| Mộc | Mộc | Tre (1) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Cửa sông | Cờ lệnh | Trấn giang (5) |
| Tre | Thủy | Thuyền (2) |
| Thuyền | Cờ lệnh | Thủy quân (6) |
| Trấn giang | Thủy quân | **Trần Lãm (12)** |

#### Ngô Nhật Khánh

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Mộc | Tre (1) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Lôi | Phong | Giông tố (1) |
| Giông tố | Giông tố | Phong khởi (3) |
| Cờ lệnh | Phong khởi | Cờ lệnh trong gió (7) |
| Thổ | Thổ | Lũy đất (1) |
| Tre | Lũy đất | Lũy tre làng (3) |
| Lũy tre làng | Thổ | Làng Đường Lâm (4) |
| Cờ lệnh trong gió | Làng Đường Lâm | **Ngô Nhật Khánh (12)** |

#### Trần Vũ Phong

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Mộc | Tre (1) |
| Kim | Thổ | Đồng đen (1) |
| Tre | Đồng đen | Trượng trúc (3) |
| Thủy | Thủy | Giọt sương (1) |
| Mộc | Giọt sương | Quả bầu (2) |
| Quả bầu | Thủy | Hồ lô nước (3) |
| Thủy | Phong | Mây trời (1) |
| Hồ lô nước | Mây trời | Hành trang vân du (5) |
| Trượng trúc | Hành trang vân du | **Trần Vũ Phong (9)** |
