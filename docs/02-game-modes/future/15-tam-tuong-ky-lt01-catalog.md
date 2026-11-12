# 15 — Tầm Tướng Ký: catalog slice LT-01

> Cập nhật: 03/11/2026
> Trạng thái: **SUPERSEDED** — công thức trong file này dựa vào art nhân vật nên đã bỏ theo A-22 (04/11/2026); slice-1 nay là tập con của Gói 1, xem [18 — Gói 1](../tam-tuong-ky/goi-1.md).

Từ LT-05, server chạy [Gói 1](../tam-tuong-ky/goi-1.md); slice-1 giữ làm dữ liệu test và mọi ID của nó nằm nguyên trong Gói 1.

Luật theo [Design Freeze](../tam-tuong-ky/design-freeze.md) (FROZEN). File này ghi nội dung slice và kết quả kiểm; dữ liệu thật nằm trong code, file này không định nghĩa luật mới.

## 1. Code

| File | Nội dung |
|---|---|
| `src/core/tam-tuong-ky/types.ts` | Node, công thức có thứ tự, pack, bậc tướng, mã lỗi |
| `src/core/tam-tuong-ky/graph.ts` | `recipeKey` (`A>B`), `computeMetrics` (`minCombines`, `starterCost`), `findCycles` |
| `src/core/tam-tuong-ky/validate.ts` | `validatePack`: lỗi và cảnh báo theo [mục 7.2](../tam-tuong-ky/design-freeze.md#72-validator-catalog); `TIER_COMBINES` (thường 7, đặc biệt 9, lịch sử 12) |
| `src/core/tam-tuong-ky/catalog.ts` | `SLICE_PACK` (draft), `rosterCharacter` đọc nghề/hệ/bậc từ roster, `CORE_CATALOG_DEPS` |
| `tests/core/tam-tuong-ky/catalog.test.ts` | 27 test: slice hợp lệ, số đo, mỗi lỗi và cảnh báo của validator |

Catalog không chép nghề, hệ hay tên chân dung: validator đọc từ `roster.ts`; test kiểm chân dung bằng `portraitUrl` và file trong `public/`. Module không import tiến trình, Battle Engine, trang bị hay hàm cấp tướng.

## 2. Kết quả kiểm

`validatePack(SLICE_PACK)`: **0 lỗi, 0 cảnh báo**.

| Tướng | Bậc | Số lần ghép bắt buộc | Số lần ghép tối thiểu | Nguyên tố tiêu | Công thức cuối (ô trước + ô sau) |
|---|---|---|---|---|---|
| Đinh Ngọc | đặc biệt | 9 | **9** | 10 | Kiếm ngọc + Đường xa |
| Lê Hoàn | lịch sử | 12 | **12** | 13 | Thập đạo + Binh thư |
| Nguyễn Bặc | lịch sử | 12 | **12** | 13 | Đại đao buộc vải đỏ + Hỏa kỳ |

- Số lần ghép bắt buộc theo [P-5](../tam-tuong-ky/design-freeze.md#32-đề-xuất-đã-duyệt): thường 7, đặc biệt 9, lịch sử 12 (Shan chốt 03/11/2026).
- 7/7 starter đều được dùng; 28 công thức, 25 node trung gian.
- 10/49 cặp starter có công thức, trong đó 3 cặp `A+A` (Mộc+Mộc, Thủy+Thủy, Thổ+Thổ) và 1 cặp gương ra hai kết quả khác nhau (Mộc+Thủy → Lau sậy, Thủy+Mộc → Dược thảo).
- Node dùng chung: Tre (3 nhánh), Vải gai (2), Dải vải đỏ (2), Sắt rèn (2).
- Một node phụ không dẫn tới tướng: Dược thảo, để minh họa thứ tự ô. Ở chế độ Hạng nó là ngõ cụt tốn nguyên liệu; LT-05 nối vào tướng khác (ví dụ Trịnh Tú, Y sư) hoặc bỏ.

## 3. Công thức

Đọc “ô trước + ô sau → kết quả”; số trong ngoặc là số lần ghép tối thiểu tới node đó. Lý do biểu trưng ghi trong code (`reason`).

### Bậc 1 (hai starter)

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Mộc | Thủy | Lau sậy |
| Thủy | Mộc | Dược thảo |
| Kim | Hỏa | Sắt rèn |
| Mộc | Mộc | Tre |
| Mộc | Phong | Vải gai |
| Lôi | Phong | Giông tố |
| Mộc | Hỏa | Than củi |
| Thủy | Thủy | Giọt sương |
| Thổ | Kim | Đá ngọc thô |
| Thổ | Thổ | Lũy đất |

### Lê Hoàn — cờ lệnh tam giác và bó thẻ tre

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Giông tố | Mộc | Trống trận (2) |
| Than củi | Thủy | Mực (2) |
| Tre | Vải gai | Cờ lệnh (3) |
| Tre | Kim | Thẻ tre (2) |
| Thẻ tre | Mực | Binh thư (5) |
| Cờ lệnh | Trống trận | Thập đạo (6) |
| Thập đạo | Binh thư | **Lê Hoàn (12)** |

### Nguyễn Bặc — đại đao đơn lưỡi, dải vải đỏ, hỏa kỳ

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Vải gai | Hỏa | Dải vải đỏ (2) |
| Lau sậy | Dải vải đỏ | Cờ lau (4) |
| Sắt rèn | Tre | Đại đao (3) |
| Đại đao | Dải vải đỏ | Đại đao buộc vải đỏ (6) |
| Cờ lau | Hỏa | Hỏa kỳ (5) |
| Đại đao buộc vải đỏ | Hỏa kỳ | **Nguyễn Bặc (12)** |

### Đinh Ngọc — kiếm ngắn thẳng, mặt ngọc giọt nước, giữ đường

| Ô trước | Ô sau | Kết quả |
|---|---|---|
| Lũy đất | Phong | Đường xa (2) |
| Sắt rèn | Kim | Kiếm ngắn (2) |
| Đá ngọc thô | Giọt sương | Ngọc giọt nước (3) |
| Kiếm ngắn | Ngọc giọt nước | Kiếm ngọc (6) |
| Kiếm ngọc | Đường xa | **Đinh Ngọc (9)** |

## 4. Nguồn vật biểu trưng và nguồn sử

| Tướng | Vật biểu trưng | Nguồn trong repo |
|---|---|---|
| Nguyễn Bặc | Đại đao đơn lưỡi, dải vải đỏ ở chắn tay; chiêu Định Quốc Hỏa Kỳ | Audit vũ khí nhóm A, [danh sách nhân vật](../../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử) |
| Lê Hoàn | Cờ lệnh tam giác, bó thẻ tre; chiêu Thập Đạo Lôi Binh | Audit vũ khí nhóm A, [danh sách nhân vật](../../03-characters/danh-sach-nhan-vat.md#5-tướng-lịch-sử) |
| Đinh Ngọc | Kiếm ngắn thẳng, mặt ngọc giọt nước ở ngực; mở khóa theo chủ đề cứu trợ, giữ đường | [Đinh Ngọc](../../03-characters/dinh-ngoc.md) |

Hai tướng lịch sử gắn mã nguồn `S04` (Việt Nam sử lược, mục Đinh Tiên Hoàng) trong [sổ nguồn](../campaign/history-sources.md). “Hỏa kỳ” và “Thập đạo” lấy từ tên chiêu trong game, gợi tới tước Định Quốc công và chức Thập đạo tướng quân. Sổ nguồn **chưa có claim** riêng cho hai tước này, và phiên làm LT-01 không mở được Wikisource để đối chiếu (mạng chặn).

> TODO: Thêm claim tước Nguyễn Bặc, Lê Hoàn vào sổ nguồn và đối chiếu S04 trước khi Tướng Lục hiện mô tả lịch sử; tới lúc đó Tướng Lục chỉ hiện nghề, hệ, vật biểu trưng (A-16).

## 5. Việc tiếp theo

- [x] Shan duyệt tên node và công thức ở mục 3 (03/11/2026).
- [x] LT-02: engine thuần cho chế độ Thường và Hạng, xem [16 — engine LT-02](../tam-tuong-ky/engine.md).
