# 18 — Tầm Tướng Ký: Gói 1 và mô phỏng LT-05

> Cập nhật: 04/11/2026
> Trạng thái: **DRAFT** — Gói 1 (12 tướng) có code (`PACK_1`, chạy sau cờ, còn `draft`), viết lại theo A-22 (không dựa vào art) và có lời dẫn A-23. Chờ Shan duyệt công thức, lời dẫn và chọn các con số ở [mục 6](#6-cần-shan-chọn).

Luật theo [Design Freeze](14-tam-tuong-ky-design-freeze.md). File này ghi nội dung Gói 1, kết quả kiểm và mô phỏng; không đặt luật mới.

## 1. Cách dựng công thức (A-22)

Art nhân vật sẽ đổi nên công thức không dùng vũ khí, trang phục hay phụ kiện. **Công thức cuối của mỗi tướng = node vai trò + dấu danh tính:**

- **Vai trò**: tri thức nghề nhuộm hệ của tướng, ví dụ “Võ nghệ hệ Hỏa” = Võ nghệ + Hỏa. Validator đối chiếu với nghề/hệ trong roster (`roleMismatch`), nên roster đổi thì test báo ngay. Hai tướng đặc biệt dung hợp tám nghề, bảy hệ dùng chung vai trò “Vạn tượng”.
- **Dấu danh tính**: lấy từ tước hiệu, địa danh, mốc chiến dịch, tên chiêu riêng hoặc lore đã duyệt; ghi trong `anchors` của tướng (`missingAnchor` nếu thiếu).
- Vật dụng trung gian (Binh khí, Giáp, Cờ lệnh, Thẻ tre, Ấn đồng, Thuyền…) là đồ chung, không gắn với art của tướng nào.

Hai tướng cùng nghề, cùng hệ (Nguyễn Bặc và Phạm Bạch Hổ, Tướng sĩ hệ Hỏa) dùng chung vai trò, khác nhau ở dấu danh tính. Ba quân sư (Lê Hoàn, Trần Lãm, Ngô Nhật Khánh) khác hệ nên khác cả vai trò.

## 2. Mười hai tướng

| Tướng | Bậc | Công thức cuối | Dựa vào | Lời dẫn chế độ Hạng |
|---|---|---|---|---|
| Nguyễn Bặc | lịch sử | Võ nghệ hệ Hỏa + Cờ lau | mốc chiến dịch “Cờ lau tập trận”; tên chiêu “Định Quốc Hỏa Kỳ” | Võ tướng mang lửa trong tay, theo về từ buổi tập trận cờ lau. |
| Đinh Điền | lịch sử | Đội ngũ hệ Thổ + Ngoại giáp | tước hiệu “Ngoại giáp”; tên chiêu “Ngoại Giáp Hộ Quân” | Người giữ chức Ngoại giáp, đứng chắn trước đội ngũ vững như đất. |
| Lưu Cơ | lịch sử | Mưu kế hệ Kim + Đô hộ phủ | tước hiệu “Đô hộ phủ sĩ sư”; tên chiêu “Đô Hộ Phủ Lệnh” | Người bày mưu trong phủ đô hộ, lặng như mây mà sắc như kim. |
| Trịnh Tú | lịch sử | Y thuật hệ Mộc + Thảo dược Hoa Lư | tên chiêu “Hoa Lư Thảo Dược”; địa danh “Hoa Lư” | Thầy thuốc theo quân, mang thảo dược của đất núi sông Hoa Lư. |
| Lê Hoàn | lịch sử | Binh thư hệ Lôi + Thập đạo | tước hiệu “Thập đạo tướng quân”; tên chiêu “Thập Đạo Lôi Binh” | Người được giao điều mười đạo quân, ra lệnh nhanh như sấm. |
| Đinh Liễn | lịch sử | Pháp thuật hệ Thủy + Vương ấn Nam Việt | tước hiệu “Nam Việt vương”; tên chiêu “Nam Việt Vương Ấn” | Người mang vương ấn Nam Việt, phép thuật mềm như nước. |
| Phạm Bạch Hổ | lịch sử | Võ nghệ hệ Hỏa + Hổ xuất sơn | tên chiêu “Bạch Hổ Xuất Sơn”; địa danh “Đằng Châu” | Tên gọi như một mãnh thú trắng; có ngày rời núi đem quân về. |
| Đỗ Cảnh Thạc | lịch sử | Võ nghệ hệ Thổ + Đỗ Động kiên tâm | địa danh “Đỗ Động”; tên chiêu “Đỗ Động Kiên Tâm” | Chủ một vùng đất mang họ mình, lòng vững như đá tảng. |
| Trần Lãm | lịch sử | Binh thư hệ Thủy + Bố Hải trấn giang | địa danh “Bố Hải Khẩu”; tên chiêu “Bố Hải Trấn Giang” | Người giữ cửa sông nơi nước gặp biển, bày trận trên mặt nước. |
| Ngô Nhật Khánh | lịch sử | Binh thư hệ Phong + Đường Lâm phong khởi | địa danh “Đường Lâm”; tên chiêu “Đường Lâm Phong Khởi” | Gió nổi lên từ một làng cổ; người bày trận theo chiều gió. |
| Đinh Ngọc | đặc biệt | Vạn tượng + Giữ đường cứu người | lore “Vạn Tượng Hành Giả”; lore “Cứu trợ, giữ đường” | Hành giả muôn hình, giữ đường cho người lỡ bước. |
| Trần Vũ Phong | đặc biệt | Vạn tượng + Vân du | lore “Vân Du Tử”; lore “Rong ruổi tìm người” | Kẻ rong chơi trên mây, đi khắp các làng để tìm một người. |

- Lời dẫn là **chữ của trò chơi**, không phải trích dẫn lịch sử; không chứa tên tướng nào trong gói (test). Lời dẫn dạng ảnh hoặc câu nói để sau: câu nói của nhân vật lịch sử phải có nguồn.
- Lời dẫn gợi tới dấu danh tính (cờ lau, mười đạo quân, cửa sông…) và hệ, nên người đã chơi chế độ Thường đoán được tướng và công thức.
- Nguồn sử: tướng theo Đinh Bộ Lĩnh `S04`; sứ quân `S01` + `S05`. Tước hiệu (Ngoại giáp, Đô hộ phủ sĩ sư, Thập đạo tướng quân, Nam Việt vương) lấy theo [danh sách nhân vật](../../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử); sổ nguồn **chưa có claim** cho từng tước, cần thêm và đối chiếu trước khi Tướng Lục hiện mô tả lịch sử.

## 3. Kết quả kiểm

`validatePack(PACK_1)`: **0 lỗi, 0 cảnh báo**. Slice-1 giờ là tập con của Gói 1 (`subPack`), cùng ID.

| Mục | Kết quả |
|---|---|
| Quy mô | 76 node, 57 yếu tố trung gian, 69 công thức |
| Số lần ghép tối thiểu | 10 tướng lịch sử đều 12, 2 tướng đặc biệt đều 9 |
| Nguyên tố tiêu ở chế độ Hạng | Lịch sử 13 đơn vị mỗi tướng, đặc biệt 10 |
| Ngõ cụt, công thức cuối trùng | Không |
| Cặp starter có công thức | 15/49, trong đó 3 cặp `A+A` (Mộc, Thủy, Thổ) |
| Cặp gương ra hai kết quả khác nhau | Mộc+Thủy / Thủy+Mộc; Kim+Thổ / Thổ+Kim |
| Yếu tố dùng lại nhiều nhất | Lũy đất 8 công thức; Tre 5; Cờ lệnh, Mây trời 4 |
| Nguyên tố dùng làm nguyên liệu | Thủy 11 công thức, Thổ 9, Mộc 8, Kim 6, Phong 6, Hỏa 4, **Lôi 2** |
| Nhu cầu cả gói ở chế độ Hạng | Mộc 43, Thổ 35, Thủy 25, Phong 19, Hỏa 13, Kim 12, **Lôi 3** đơn vị |

Thành tựu bộ theo P-21 giữ nguyên: 9 bộ, 3 200 vàng.

## 4. Mô phỏng chế độ Thường

`scripts/tam-tuong-ky-sim.ts`, 200 lần chạy mỗi kiểu; số đầy đủ trong `docs/reports/2026-11-04-tam-tuong-ky-lt05/sim.json`. Phiếu mỗi tuần theo P-10: 10, tức khoảng 21 lần ghép mỗi ngày với 15 lần mỗi phiếu, 29 với 20 lần. Người biết hết công thức cần **69 lần ghép** cho cả gói (8–12 mỗi tướng).

Người mới mô phỏng **đoán mò** (thử cặp chưa thử, không đọc nghĩa tên) nên là cận dưới; người thật nhanh hơn.

| Người mới (trung vị, ngày) | Tướng đầu | 6 tướng | 12 tướng |
|---|---|---|---|
| Không gợi ý, 15 lần/phiếu | 56 | 138 | 191 |
| Gợi ý hiện tại (2/ngày), 15 lần/phiếu | 67 | 83 | 101 |
| + dấu “còn công thức chưa tìm”, 15 lần/phiếu | 49 | 56 | 59 |
| + gợi ý nhắm tướng, 15 lần/phiếu | **9** | **43** | **57** |
| Gợi ý hiện tại, 20 lần/phiếu | 51 | 63 | 76 |
| + dấu + gợi ý nhắm tướng, 20 lần/phiếu | **8** | **35** | **44** |

- Gợi ý hiện tại chọn công thức nông nhất trong cả sổ, dẫn người chơi đi rộng nên tướng đầu không tới sớm hơn.
- **Dấu “còn công thức chưa tìm”**: yếu tố trong Vạn Vật Lục có dấu nếu còn là nguyên liệu của công thức chưa tìm (không nói cặp nào).
- **Gợi ý nhắm tướng**: gợi ý mức 2 lộ một nguyên liệu của công thức ghép được ngay trên đường tới tướng chưa tìm gần nhất; vẫn không lộ đủ công thức hay thứ tự ô (A-12).

## 5. Mô phỏng chế độ Hạng

Giả sử đã biết công thức (học ở chế độ Thường); đề cử xoay vòng, mỗi tuần ít nhất 1 tướng đặc biệt; ghép tướng rẻ trước. Nguồn bó mỗi tuần: cấp nền 3 (P-12); nửa trên ở hai chế độ tuần 2 + 2; top 10 ở hai chế độ 3 + 3; mua tối đa 2 (P-13). Theo A-23 người chơi chỉ thấy lời dẫn; mô phỏng giả sử đã đoán đúng tướng.

| Đề cử | Bó cần để xong (chia đều / tự chọn) | Cấp nền 3 | Nửa trên 2 chế độ (7) | + mua 2 (9) | Top 10 + mua 2 (11) |
|---|---|---|---|---|---|
| 5 tướng | 19 / 9 | 1 / 1 | 2 / 4 | 2 / 5 | 3 / 5 |
| 7 tướng | 26 / 13 | 1 / 1 | 2 / 4 | 3 / 5 | 3 / 6 |
| 10 tướng | 37 / 18 | 1 / 2 | 2 / 4 | 3 / 5 | 3 / 6 |

Ô là trung vị số tướng ghép được (bó chia đều 7 hệ / bó tự chọn 7 đơn vị). Lần ghép cần để xong: 57 / 81 / 114.

- Bó chia đều phí vì nhu cầu lệch hệ (Mộc 43, Lôi 3): với 9 bó chỉ ghép được 2/5.
- Bó tự chọn khớp P-17 (“trung bình ghép được khoảng một nửa”) ở **7 tướng**: 4/7 với 7 bó, 5/7 khi mua thêm, 6/7 cho top 10.

## 6. Cần Shan chọn

| # | Câu hỏi | Claude đề xuất |
|---|---|---|
| L5-1 | Số lần ghép mỗi phiếu (khung 15–20) | **15**: người mới có dấu và gợi ý nhắm tướng đủ 12 tướng sau khoảng 8 tuần |
| L5-2 | Bó nguyên tố chia đều 7 hệ (P-11) hay tự chọn 7 đơn vị | **Tự chọn** |
| L5-3 | Số tướng đề cử mỗi tuần (cố định, xoay vòng) | **7** nếu bó tự chọn; **5** nếu giữ chia đều |
| L5-4 | Dấu “còn công thức chưa tìm” trong Vạn Vật Lục | **Có** |
| L5-5 | Gợi ý mức 2 nhắm tướng chưa tìm gần nhất | **Có** (vẫn 2 lượt/ngày, không lộ đủ công thức) |
| L5-6 | Duyệt 69 công thức (mục 7) và 12 lời dẫn (mục 2) | |
| L5-7 | Lời dẫn đề cử có kèm số điểm của ô (theo bậc) không | **Có** (P-16 sửa 04/11/2026): người chơi cần biết ô nào đáng giá hơn, điểm không lộ tên |

L5-2, L5-4, L5-5 đổi luật đã FROZEN nên cần quyết định mới trước khi code.

## 7. Công thức Gói 1

Đọc “ô trước + ô sau → kết quả (số lần ghép tối thiểu)”. Mỗi bảng là cây rẻ nhất của một tướng; yếu tố dùng chung lặp lại ở nhiều bảng. Lý do biểu trưng ghi trong code (`reason`).

#### Nguyễn Bặc

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Mộc | Mộc | Tre (1) |
| Sắt rèn | Tre | Binh khí (3) |
| Thổ | Thổ | Lũy đất (1) |
| Binh khí | Lũy đất | Võ nghệ (5) |
| Võ nghệ | Hỏa | Võ nghệ hệ Hỏa (6) |
| Mộc | Thủy | Lau sậy (1) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Lau sậy | Cờ lệnh | Cờ lau (5) |
| Võ nghệ hệ Hỏa | Cờ lau | **Nguyễn Bặc (12)** |

#### Đinh Điền

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thổ | Thổ | Lũy đất (1) |
| Mộc | Mộc | Tre (1) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Lũy đất | Cờ lệnh | Đội ngũ (5) |
| Đội ngũ | Thổ | Đội ngũ hệ Thổ (6) |
| Kim | Hỏa | Sắt rèn (1) |
| Sắt rèn | Vải gai | Giáp (3) |
| Giáp | Lũy đất | Ngoại giáp (5) |
| Đội ngũ hệ Thổ | Ngoại giáp | **Đinh Điền (12)** |

#### Lưu Cơ

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Phong | Mây trời (1) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Mây trời | Mực | Mưu kế (4) |
| Mưu kế | Kim | Mưu kế hệ Kim (5) |
| Kim | Thổ | Đồng đen (1) |
| Đồng đen | Mực | Ấn đồng (4) |
| Thổ | Thổ | Lũy đất (1) |
| Ấn đồng | Lũy đất | Đô hộ phủ (6) |
| Mưu kế hệ Kim | Đô hộ phủ | **Lưu Cơ (12)** |

#### Trịnh Tú

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Mộc | Dược thảo (1) |
| Thủy | Thủy | Giọt sương (1) |
| Mộc | Giọt sương | Quả bầu (2) |
| Dược thảo | Quả bầu | Y thuật (4) |
| Y thuật | Mộc | Y thuật hệ Mộc (5) |
| Thổ | Phong | Núi (1) |
| Mộc | Mộc | Tre (1) |
| Tre | Thủy | Thuyền (2) |
| Núi | Thuyền | Hoa Lư (4) |
| Dược thảo | Hoa Lư | Thảo dược Hoa Lư (6) |
| Y thuật hệ Mộc | Thảo dược Hoa Lư | **Trịnh Tú (12)** |

#### Lê Hoàn

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Mộc | Tre (1) |
| Tre | Kim | Thẻ tre (2) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Thẻ tre | Mực | Binh thư (5) |
| Binh thư | Lôi | Binh thư hệ Lôi (6) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Lôi | Phong | Giông tố (1) |
| Cờ lệnh | Giông tố | Thập đạo (5) |
| Binh thư hệ Lôi | Thập đạo | **Lê Hoàn (12)** |

#### Đinh Liễn

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Thủy | Giọt sương (1) |
| Thổ | Kim | Đá ngọc thô (1) |
| Giọt sương | Đá ngọc thô | Ngọc tụ khí (3) |
| Thủy | Phong | Mây trời (1) |
| Ngọc tụ khí | Mây trời | Pháp thuật (5) |
| Pháp thuật | Thủy | Pháp thuật hệ Thủy (6) |
| Kim | Thổ | Đồng đen (1) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Đồng đen | Mực | Ấn đồng (4) |
| Ấn đồng | Thủy | Vương ấn Nam Việt (5) |
| Pháp thuật hệ Thủy | Vương ấn Nam Việt | **Đinh Liễn (12)** |

#### Phạm Bạch Hổ

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Mộc | Mộc | Tre (1) |
| Sắt rèn | Tre | Binh khí (3) |
| Thổ | Thổ | Lũy đất (1) |
| Binh khí | Lũy đất | Võ nghệ (5) |
| Võ nghệ | Hỏa | Võ nghệ hệ Hỏa (6) |
| Thổ | Phong | Núi (1) |
| Núi | Kim | Mãnh thú trắng (2) |
| Lũy đất | Phong | Đường xa (2) |
| Mãnh thú trắng | Đường xa | Hổ xuất sơn (5) |
| Võ nghệ hệ Hỏa | Hổ xuất sơn | **Phạm Bạch Hổ (12)** |

#### Đỗ Cảnh Thạc

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) |
| Mộc | Mộc | Tre (1) |
| Sắt rèn | Tre | Binh khí (3) |
| Thổ | Thổ | Lũy đất (1) |
| Binh khí | Lũy đất | Võ nghệ (5) |
| Võ nghệ | Thổ | Võ nghệ hệ Thổ (6) |
| Lũy đất | Lũy đất | Lũy kép (3) |
| Thổ | Hỏa | Đá tảng (1) |
| Lũy kép | Đá tảng | Đỗ Động kiên tâm (5) |
| Võ nghệ hệ Thổ | Đỗ Động kiên tâm | **Đỗ Cảnh Thạc (12)** |

#### Trần Lãm

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Mộc | Tre (1) |
| Tre | Kim | Thẻ tre (2) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Thẻ tre | Mực | Binh thư (5) |
| Binh thư | Thủy | Binh thư hệ Thủy (6) |
| Thủy | Thổ | Cửa sông (1) |
| Mộc | Phong | Vải gai (1) |
| Tre | Vải gai | Cờ lệnh (3) |
| Cửa sông | Cờ lệnh | Bố Hải trấn giang (5) |
| Binh thư hệ Thủy | Bố Hải trấn giang | **Trần Lãm (12)** |

#### Ngô Nhật Khánh

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Mộc | Tre (1) |
| Tre | Kim | Thẻ tre (2) |
| Mộc | Hỏa | Than củi (1) |
| Than củi | Thủy | Mực (2) |
| Thẻ tre | Mực | Binh thư (5) |
| Binh thư | Phong | Binh thư hệ Phong (6) |
| Thổ | Thổ | Lũy đất (1) |
| Tre | Lũy đất | Lũy tre làng (3) |
| Lôi | Phong | Giông tố (1) |
| Lũy tre làng | Giông tố | Đường Lâm phong khởi (5) |
| Binh thư hệ Phong | Đường Lâm phong khởi | **Ngô Nhật Khánh (12)** |

#### Đinh Ngọc

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Phong | Mây trời (1) |
| Thổ | Phong | Núi (1) |
| Mây trời | Núi | Vạn tượng (3) |
| Thổ | Thổ | Lũy đất (1) |
| Lũy đất | Phong | Đường xa (2) |
| Thủy | Thủy | Giọt sương (1) |
| Mộc | Giọt sương | Quả bầu (2) |
| Đường xa | Quả bầu | Giữ đường cứu người (5) |
| Vạn tượng | Giữ đường cứu người | **Đinh Ngọc (9)** |

#### Trần Vũ Phong

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Phong | Mây trời (1) |
| Thổ | Phong | Núi (1) |
| Mây trời | Núi | Vạn tượng (3) |
| Mộc | Mộc | Tre (1) |
| Thổ | Thổ | Lũy đất (1) |
| Tre | Lũy đất | Lũy tre làng (3) |
| Mây trời | Lũy tre làng | Vân du (5) |
| Vạn tượng | Vân du | **Trần Vũ Phong (9)** |
