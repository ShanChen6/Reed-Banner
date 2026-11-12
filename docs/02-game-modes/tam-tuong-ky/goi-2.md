# 21 — Tầm Tướng Ký: Gói 2

> Cập nhật: 04/11/2026
> Trạng thái: **IMPLEMENTED** — Shan duyệt công thức, lời dẫn và thành tựu ngày 04/11/2026; code trên `develop` (PR #258); Shan bật cờ `TAM_TUONG_KY_PACK2_ENABLED` cùng ngày.

Shan chọn ngày 04/11/2026: Gói 2 gồm **8 sứ quân còn lại + Đinh Bộ Lĩnh**, **gộp vào cùng một sổ** với Gói 1. Luật theo [Design Freeze](design-freeze.md); cách dựng công thức như [Gói 1](goi-1.md#1-cách-dựng-công-thức-a-22): vai trò (nghề × hệ theo roster) + dấu danh tính, không dựa vào art.

## 1. Chín tướng

| Tướng | Nghề / hệ | Công thức cuối | Dựa vào | Lời dẫn chế độ Hạng |
|---|---|---|---|---|
| Ngô Xương Xí | Mưu sĩ / Kim | Mưu kế hệ Kim + Ngô gia di mưu | địa danh “Bình Kiều”; tên chiêu “Ngô Gia Di Mưu” | Người nhà Ngô giữ đất Bình Kiều, mưu kế sắc như kim. |
| Nguyễn Khoan | Binh lính / Thổ | Đội ngũ hệ Thổ + Tam Đái kiên thành | địa danh “Tam Đái”; tên chiêu “Tam Đái Kiên Thành” | Chủ thành Tam Đái, đội ngũ đứng vững như đất. |
| Kiều Công Hãn | Pháp sư / Lôi | Pháp thuật hệ Lôi + Phong Châu lôi kích | địa danh “Phong Châu”; tên chiêu “Phong Châu Lôi Kích” | Sấm nổ trên đất Phong Châu; người dùng phép gọi sét. |
| Kiều Thuận | Y sư / Mộc | Y thuật hệ Mộc + Hồi Hồ sinh khí | địa danh “Hồi Hồ”; tên chiêu “Hồi Hồ Sinh Khí” | Thầy thuốc bên hồ Hồi Hồ, giữ sinh khí cho quân. |
| Lý Khuê | Tướng sĩ / Kim | Võ nghệ hệ Kim + Siêu Loại phá giáp | địa danh “Siêu Loại”; tên chiêu “Siêu Loại Phá Giáp” | Võ tướng đất Siêu Loại, đòn đánh sắc phá cả giáp. |
| Nguyễn Thủ Tiệp | Mưu sĩ / Thủy | Mưu kế hệ Thủy + Tiên Du đoạt lương | địa danh “Tiên Du”; tên chiêu “Tiên Du Đoạt Lương” | Người giữ Tiên Du, mưu cướp kho lương theo đường nước. |
| Lữ Đường | Pháp sư / Thủy | Pháp thuật hệ Thủy + Tế Giang thủy trận | địa danh “Tế Giang”; tên chiêu “Tế Giang Thủy Trận” | Bày thủy trận trên sông Tế Giang, phép mềm như nước. |
| Nguyễn Siêu | Binh lính / Hỏa | Đội ngũ hệ Hỏa + Phù Liệt hỏa lũy | địa danh “Tây Phù Liệt”; tên chiêu “Phù Liệt Hỏa Lũy” | Đốt lửa quanh lũy ở Tây Phù Liệt, đội ngũ nóng như lửa. |
| Đinh Bộ Lĩnh | Đặc biệt (dung hợp) | Vạn tượng + Dựng nước Đại Cồ Việt | địa danh “Hoa Lư”; lore “Dẹp loạn, dựng nước Đại Cồ Việt” | Người từ đất núi sông dẹp loạn mười hai sứ quân, dựng nước Đại Cồ Việt. |

- Đinh Bộ Lĩnh vào bậc **đặc biệt** (A-21, P-27): nghề/hệ đổi theo người chơi nên dùng vai trò “Vạn tượng” như Đinh Ngọc, Trần Vũ Phong; Tướng Lục hiện nghề/hệ mặc định của hồ sơ mới (Tướng sĩ, Mộc).
- Đất và tên chiêu lấy theo [danh sách nhân vật mục 6](../../03-characters/danh-sach-nhan-vat.md#6-sứ-quân) (cột “Đất (màn mở bán)” là dữ liệu chiến dịch của game). Nguồn sử: sứ quân `S01` + `S05`, Đinh Bộ Lĩnh `S04`; chưa có claim riêng từng đất, cần đối chiếu như Gói 1.
- Lời dẫn là chữ của trò chơi, không trích dẫn lịch sử; không chứa tên tướng nào trong sổ (test).

## 2. Gộp sổ

- **Một sổ cho cả hai gói**: cờ Gói 2 bật thì server chạy `PACK_1_2` (21 tướng); tắt thì chạy Gói 1. View có `packId` (`pack-1` / `pack-1-2`) để màn chơi vẽ đúng sổ.
- Gói 2 không đổi nghĩa ID nào của Gói 1 và không làm thay đổi số lần ghép của bất kỳ yếu tố Gói 1 nào (test).
- **Tướng Lục** chia mục theo gói khi có nhiều gói: “Gói 1: Dẹp loạn · x/12”, “Gói 2: Thập nhị sứ quân · y/9”, mỗi gói đủ bóng mờ (A-15).
- **Chế độ Hạng** xoay vòng 7 đề cử qua cả 21 tướng; tuần nào cũng có ít nhất một tướng đặc biệt (giờ có 3). Bật Gói 2 giữa tuần thì danh sách đề cử của tuần đó đổi, nên **bật vào thứ Hai**.
- **Rút lại an toàn**: tắt cờ Gói 2 thì sổ người chơi **giữ nguyên** khám phá Gói 2 (`KNOWN_NODE_IDS`), chỉ không chơi tiếp được; bật lại thì còn nguyên. ID lạ không thuộc gói nào vẫn bị bỏ.

## 3. Kết quả kiểm

`validatePack(PACK_1_2)`: **0 lỗi, 0 cảnh báo**. 102 node, 95 công thức, 21 tướng; không ngõ cụt; công thức cuối 21 tướng khác nhau.

| Mục | Kết quả |
|---|---|
| Số lần ghép tối thiểu | 8 sứ quân đều 12, Đinh Bộ Lĩnh 9 |
| Nguyên tố tiêu ở chế độ Hạng | Sứ quân 13 đơn vị, Đinh Bộ Lĩnh 10 |
| Yếu tố mới | Lúa, Cầu tre, Hồ nước, Kho lương; 4 vai trò mới (Võ nghệ hệ Kim, Mưu kế hệ Thủy, Pháp thuật hệ Lôi, Đội ngũ hệ Hỏa); 9 dấu danh tính |
| Cặp gương mới | Giông tố + Lũy tre làng (Phong Châu lôi kích) ≠ Lũy tre làng + Giông tố (Đường Lâm phong khởi) |

Test: `tests/core/tam-tuong-ky/pack-2.test.ts` (10), Gói 2 trên server (`tests/server/tamTuongKyRanked.test.ts`), Tướng Lục chia mục (`tests/game/tam-tuong-ky-screen.test.ts`).

## 4. Thành tựu

Theo khung P-21; thành tựu Gói 2 chỉ hiện ở trang Nhiệm vụ khi gói được duyệt (`published`) **và** cờ Gói 2 bật.

| Bộ | Tướng | Vàng |
|---|---|---|
| Đủ tướng hệ Kim Gói 2 | Ngô Xương Xí, Lý Khuê | 200 |
| Đủ tướng hệ Thủy Gói 2 | Nguyễn Thủ Tiệp, Lữ Đường | 200 |
| Đủ tướng hệ Mộc | Trịnh Tú (Gói 1), Kiều Thuận | 200 |
| Đủ tướng hệ Lôi | Lê Hoàn (Gói 1), Kiều Công Hãn | 200 |
| Đủ tám sứ quân Gói 2 | 8 sứ quân Gói 2 | 600 |
| Đủ mười hai sứ quân | 4 sứ quân Gói 1 + 8 sứ quân Gói 2 | 800 |
| Đủ ba tướng đặc biệt | Đinh Ngọc, Trần Vũ Phong, Đinh Bộ Lĩnh | 300 |
| Đủ Gói 2 | 9 tướng Gói 2 | 1 000 |

Tổng 3 500 vàng một lần. Hệ Thổ, Hỏa của Gói 2 mỗi hệ một tướng nên chưa có bộ riêng.

## 5. Cần Shan duyệt

- [x] 9 công thức cuối và cây công thức (mục 6), 9 lời dẫn (mục 1) — Shan duyệt 04/11/2026.
- [x] 8 thành tựu và số vàng (mục 4) — Shan duyệt 04/11/2026; `PACK_2.status` = `published`.
- [x] Bật `TAM_TUONG_KY_PACK2_ENABLED` (Shan, 04/11/2026, thứ Tư). Nếu chế độ Hạng đang bật, danh sách đề cử tuần 2026-11-02 đổi từ lúc bật; điểm đã ghi giữ nguyên.

## 6. Công thức Gói 2

Mỗi bảng là cây rẻ nhất của một tướng; dấu `·` đánh dấu công thức có sẵn từ Gói 1. Lý do biểu trưng ghi trong code (`reason`).


#### Ngô Xương Xí

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Phong | Mây trời (1) · |
| Mộc | Hỏa | Than củi (1) · |
| Than củi | Thủy | Mực (2) · |
| Mây trời | Mực | Mưu kế (4) · |
| Mưu kế | Kim | Mưu kế hệ Kim (5) · |
| Mộc | Mộc | Tre (1) · |
| Tre | Kim | Thẻ tre (2) · |
| Thủy | Thổ | Cửa sông (1) · |
| Tre | Cửa sông | Cầu tre (3) |
| Thẻ tre | Cầu tre | Ngô gia di mưu (6) |
| Mưu kế hệ Kim | Ngô gia di mưu | **Ngô Xương Xí (12)** |

#### Nguyễn Khoan

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thổ | Thổ | Lũy đất (1) · |
| Mộc | Mộc | Tre (1) · |
| Mộc | Phong | Vải gai (1) · |
| Tre | Vải gai | Cờ lệnh (3) · |
| Lũy đất | Cờ lệnh | Đội ngũ (5) · |
| Đội ngũ | Thổ | Đội ngũ hệ Thổ (6) · |
| Tre | Lũy đất | Lũy tre làng (3) · |
| Lũy tre làng | Lũy đất | Tam Đái kiên thành (5) |
| Đội ngũ hệ Thổ | Tam Đái kiên thành | **Nguyễn Khoan (12)** |

#### Kiều Công Hãn

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Thủy | Giọt sương (1) · |
| Thổ | Kim | Đá ngọc thô (1) · |
| Giọt sương | Đá ngọc thô | Ngọc tụ khí (3) · |
| Thủy | Phong | Mây trời (1) · |
| Ngọc tụ khí | Mây trời | Pháp thuật (5) · |
| Pháp thuật | Lôi | Pháp thuật hệ Lôi (6) |
| Lôi | Phong | Giông tố (1) · |
| Mộc | Mộc | Tre (1) · |
| Thổ | Thổ | Lũy đất (1) · |
| Tre | Lũy đất | Lũy tre làng (3) · |
| Giông tố | Lũy tre làng | Phong Châu lôi kích (5) |
| Pháp thuật hệ Lôi | Phong Châu lôi kích | **Kiều Công Hãn (12)** |

#### Kiều Thuận

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Mộc | Dược thảo (1) · |
| Thủy | Thủy | Giọt sương (1) · |
| Mộc | Giọt sương | Quả bầu (2) · |
| Dược thảo | Quả bầu | Y thuật (4) · |
| Y thuật | Mộc | Y thuật hệ Mộc (5) · |
| Thủy | Thổ | Cửa sông (1) · |
| Cửa sông | Giọt sương | Hồ nước (3) |
| Hồ nước | Quả bầu | Hồi Hồ sinh khí (6) |
| Y thuật hệ Mộc | Hồi Hồ sinh khí | **Kiều Thuận (12)** |

#### Lý Khuê

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Kim | Hỏa | Sắt rèn (1) · |
| Mộc | Mộc | Tre (1) · |
| Sắt rèn | Tre | Binh khí (3) · |
| Thổ | Thổ | Lũy đất (1) · |
| Binh khí | Lũy đất | Võ nghệ (5) · |
| Võ nghệ | Kim | Võ nghệ hệ Kim (6) |
| Mộc | Phong | Vải gai (1) · |
| Sắt rèn | Vải gai | Giáp (3) · |
| Giáp | Sắt rèn | Siêu Loại phá giáp (5) |
| Võ nghệ hệ Kim | Siêu Loại phá giáp | **Lý Khuê (12)** |

#### Nguyễn Thủ Tiệp

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Phong | Mây trời (1) · |
| Mộc | Hỏa | Than củi (1) · |
| Than củi | Thủy | Mực (2) · |
| Mây trời | Mực | Mưu kế (4) · |
| Mưu kế | Thủy | Mưu kế hệ Thủy (5) |
| Thổ | Mộc | Lúa (1) |
| Thổ | Thổ | Lũy đất (1) · |
| Lúa | Lũy đất | Kho lương (3) |
| Mộc | Mộc | Tre (1) · |
| Tre | Thủy | Thuyền (2) · |
| Kho lương | Thuyền | Tiên Du đoạt lương (6) |
| Mưu kế hệ Thủy | Tiên Du đoạt lương | **Nguyễn Thủ Tiệp (12)** |

#### Lữ Đường

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Thủy | Giọt sương (1) · |
| Thổ | Kim | Đá ngọc thô (1) · |
| Giọt sương | Đá ngọc thô | Ngọc tụ khí (3) · |
| Thủy | Phong | Mây trời (1) · |
| Ngọc tụ khí | Mây trời | Pháp thuật (5) · |
| Pháp thuật | Thủy | Pháp thuật hệ Thủy (6) · |
| Thủy | Thổ | Cửa sông (1) · |
| Cửa sông | Ngọc tụ khí | Tế Giang thủy trận (5) |
| Pháp thuật hệ Thủy | Tế Giang thủy trận | **Lữ Đường (12)** |

#### Nguyễn Siêu

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thổ | Thổ | Lũy đất (1) · |
| Mộc | Mộc | Tre (1) · |
| Mộc | Phong | Vải gai (1) · |
| Tre | Vải gai | Cờ lệnh (3) · |
| Lũy đất | Cờ lệnh | Đội ngũ (5) · |
| Đội ngũ | Hỏa | Đội ngũ hệ Hỏa (6) |
| Lũy đất | Lũy đất | Lũy kép (3) · |
| Mộc | Hỏa | Than củi (1) · |
| Lũy kép | Than củi | Phù Liệt hỏa lũy (5) |
| Đội ngũ hệ Hỏa | Phù Liệt hỏa lũy | **Nguyễn Siêu (12)** |

#### Đinh Bộ Lĩnh

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Thủy | Phong | Mây trời (1) · |
| Thổ | Phong | Núi (1) · |
| Mây trời | Núi | Vạn tượng (3) · |
| Mộc | Mộc | Tre (1) · |
| Tre | Thủy | Thuyền (2) · |
| Núi | Thuyền | Hoa Lư (4) · |
| Hoa Lư | Thổ | Dựng nước Đại Cồ Việt (5) |
| Vạn tượng | Dựng nước Đại Cồ Việt | **Đinh Bộ Lĩnh (9)** |
