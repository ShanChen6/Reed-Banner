# 24 — Khai Lộ: giải đố xóa khối ô ngọc

> Cập nhật: 20/11/2026 (cân bằng lại độ khó, đạo cụ, thưởng; tối ưu bố cục máy tính/điện thoại)
> Trạng thái: **DRAFT** — Shan duyệt ý tưởng và chốt tên **Khai Lộ** ngày 05/11/2026; có bản chơi thử offline (không thưởng, không xếp hạng) với hai chế độ Thường và Cấp tốc, quân là 7 nguyên tố. Ngày 20/11/2026 Shan duyệt bộ số cân bằng lại ở [mục 4](#4-số-liệu-bản-đầu).

## 1. Định vị

Mini game giải đố một chạm trên bàn cờ của Cờ Lau. Người chơi chạm một quân; cả **khối** quân cùng hệ liền cạnh với nó biến mất, ô phía trên rơi xuống, cột trống thì các cột dồn lại. Cái hay nằm ở việc tính trước: xóa khối nhỏ nào để các khối khác dồn lại thành khối lớn, rồi mới xóa khối lớn lấy điểm.

- Thể loại: "xóa nhóm cùng màu" (SameGame, 1985), cảm hứng từ Block'D (EA Mobile, J2ME). Làm clean-room: không dùng tên, hình, âm thanh hay số liệu của game gốc.
- Quân là **7 nguyên tố** của game (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong): nền ngọc nhuộm màu riêng của từng hệ (`ELEMENT_COLOR`) và biểu tượng hệ vẽ tay (`public/art/elements/`). Shan đổi từ ô ngọc vật phẩm sang nguyên tố ngày 05/11/2026 vì màu hệ dễ phân biệt hơn.
- Khác các chế độ khác: không đánh nhau, không đổi hai ô như match-3 (Giao Tranh), không đặt quân như Trận Đồ, không ghép công thức như Tầm Tướng Ký.
- Không có ô mới rơi vào: mỗi màn là một bài toán tất định theo seed, nên sau này phát lại được trên server để chấm điểm.

## 2. Luật chơi

### 2.1. Bàn cờ

- Bàn 10 cột × 8 hàng, đầy ô khi bắt đầu màn.
- Màn 1–3 có 3 hệ, màn 4–7 có 4, màn 8–13 có 5, từ màn 14 có 6. Hệ của mỗi màn được xáo theo seed.
- Từ màn 3 có **quân hào quang** (viền vàng dày, ánh sáng lướt qua): 1 quân ở màn 3–5, thêm 1 mỗi 3 màn, tối đa 4.
- Bàn sinh ra luôn có ít nhất một khối xóa được.

### 2.2. Xóa khối

- **Khối** là các quân cùng hệ nối nhau theo cạnh (trên, dưới, trái, phải; không tính chéo).
- Chạm vào bất kỳ ô nào của một khối từ **2 ô** trở lên: cả khối biến mất. Ô lẻ không xóa được.
- Ô phía trên rơi thẳng xuống lấp chỗ trống. Cột trống hẳn thì các cột bên phải dồn sang trái.
- Điểm: khối n ô được **n²** điểm, nhân thêm (1 + số ô hào quang trong khối). Ví dụ khối 6 ô có 1 ô hào quang được 72 điểm.

### 2.3. Kết thúc màn và quân lực

- Ván bắt đầu với **30 quân lực**.
- Hết khối để xóa thì màn kết thúc: mỗi ô còn sót trừ 1 quân lực.
- **Dọn sạch bàn**: cộng 300 + 50 × số màn điểm (`clearBonus`), +4 quân lực, +1 đạo cụ: màn lẻ Sấm Sét, màn chẵn Lốc Phong (`clearTool`).
- **Gần sạch** (còn 1–3 quân): +100 điểm; quân còn lại vẫn trừ quân lực.
- Hết khối nhưng còn đạo cụ thì màn ở trạng thái **bế tắc**: người chơi dùng đạo cụ hoặc bấm *Kết thúc màn*. Người chơi cũng có thể kết thúc màn sớm bất cứ lúc nào.
- Quân lực về 0 thì hết ván. Điểm cuối là tổng điểm các màn.

### 2.4. Đạo cụ và hoàn tác

| Đạo cụ | Tác dụng | Ban đầu | Nhận thêm |
|---|---|---|---|
| **Lốc Phong** | Chọn một tâm không sát mép: 8 ô quanh tâm xoay một nấc theo chiều kim đồng hồ (giống lốc xoáy hệ Phong trong trận), rồi ô rơi và dồn cột. Không cộng điểm. | 1 | +1 khi dọn sạch màn chẵn |
| **Sấm Sét** | Phá vùng 3×3 quanh ô được chọn. Không cộng điểm. | 1 | +1 khi dọn sạch màn lẻ |

- Mỗi loại giữ tối đa 5 (trước 20/11/2026 là 9).
- **Hoàn tác**: mỗi màn 1 lần, chỉ lùi được nước vừa đi. Không lùi qua khi màn đã kết thúc.

### 2.5. Chế độ

| Chế độ | Luật riêng |
|---|---|
| **Thường** | Không giới hạn thời gian. |
| **Cấp tốc** | Mỗi màn có đồng hồ: 60 giây với 3 hệ, thêm 15 giây mỗi hệ mới (75 / 90 / 105 giây; với đường cong mới: màn 1–3 60 giây, 4–7 75 giây, 8–13 90 giây, từ 14 là 105 giây). Hết giờ là hết màn (quân còn sót trừ quân lực như thường). Dọn sạch bàn thì mỗi giây dư được **25 điểm** (`KL_TIME_BONUS_PER_SECOND`). Đồng hồ chỉ chạy khi đang chơi màn và tab đang mở; giờ còn lại lưu cùng ván dở. |

Hai chế độ có ván dở và điểm cao nhất riêng. Lõi không đọc giờ: giao diện truyền số giây còn lại (`timeLeft`) kèm nước đi và gửi `endLevel` với `timeout` khi hết giờ.

## 3. Điều khiển

Người chơi không phải kéo nối từng ô: chỉ chọn một ô, máy tự tìm cả khối.

| Thiết bị | Xem trước | Thực hiện |
|---|---|---|
| Máy tính (chuột) | Rê chuột qua ô: cả khối sáng viền vàng, hiện số ô và điểm dự kiến. Ô lẻ không sáng. | Bấm |
| Bàn phím | Mũi tên di chuyển tiêu điểm (cũng hiện xem trước) | Enter/Space; Z hoàn tác; 1 Lốc Phong; 2 Sấm Sét; Esc bỏ chọn đạo cụ |
| Điện thoại | Chạm lần đầu: xem trước khối | Chạm lại vào cùng khối (với đạo cụ: cùng ô) |

Khi đang cầm đạo cụ, phần xem trước đổi thành vòng 8 ô (Lốc, viền ngọc lam) hoặc vùng 3×3 (Sấm, viền đỏ cam).

## 4. Số liệu bản đầu

### 4.1. Cân bằng lại 20/11/2026 (Shan duyệt)

Mô phỏng 200 ván bằng bot tham lam nhìn trước 1 nước (chọn nước để lại ít quân lẻ nhất), **có dùng Sấm Sét khi bế tắc**. Bộ số cũ (3/4/5/6 hệ từ màn 1/5/10/17, kho đạo cụ 9, +1 mỗi loại và +5 quân lực khi dọn sạch, thưởng 800 × màn) cho thấy:

- Màn 1–9 quá dễ: dọn sạch 72–99% số màn; kho đạo cụ đầy trước màn 10.
- Ván quá dài: trung vị tới màn 17 (p10 = 13, p90 = 21), khoảng 500 lần chạm; từ màn 17 không dọn sạch nổi màn nào (độ khó dựng đứng).
- Thưởng dọn sạch chiếm 84% tổng điểm, gom khối to (n²) gần như không ảnh hưởng tới điểm.
- Lốc Phong ít khi có ích.

Bộ số mới (đang dùng): số hệ 3/4/5/6 từ màn 1/4/8/14; dọn sạch +4 quân lực, +1 đạo cụ xen kẽ, kho tối đa 5; thưởng dọn sạch 300 + 50 × màn, gần sạch (≤ 3 quân) 100 điểm. Cùng bot, 200 ván:

| | Cũ | Mới |
|---|---|---|
| Màn đạt được (p10 / trung vị / p90) | 13 / 17 / 21 | 9 / 11 / 14 |
| Tỉ lệ dọn sạch màn 4 / 7 / 10 | 98% / 81% / 47% | 64% / 18% / 2% |
| Điểm từ gom khối / tổng điểm | 16% | 69% |

Người chơi thật tính sâu hơn bot nên kỳ vọng đi xa hơn vài màn. Các hằng số nằm đầu `src/core/khai-lo/engine.ts` (`KL_START_TROOPS`, `KL_CLEAR_*`, `KL_NEAR_CLEAR_*`, `KL_MAX_TOOLS`, `levelConfig`). Chưa làm: Lốc Phong mạnh hơn (để sau).

## 5. Bản chơi thử hiện có (05/11/2026)

- Lõi: `src/core/khai-lo/` (thuần TypeScript, seed qua `src/core/rng.ts`), test ở `tests/core/khai-lo/`.
- Màn chơi: `/game/clear-path` (phân cảnh `KHAI_LO`), `src/app/game/khai-lo/KhaiLoScreen.tsx`. Thẻ ở hàng "Sắp ra mắt / đã mở" trên Home cạnh Trận Đồ.
- Offline: ván dở và điểm cao nhất lưu `localStorage` (`reed-banner:khai-lo:*`); không cần đăng nhập, không thưởng.
- Bố cục (20/11/2026): điện thoại xếp dọc số liệu → bàn → thanh 4 nút (Lốc, Sấm, Hoàn tác, Kết thúc màn) ngay dưới bàn; từ 1024px bàn bên trái, chế độ, số liệu và đạo cụ ở cột phải. Cỡ ô đo theo chỗ trống thật (tối đa 60px), trên máy tính còn giới hạn theo chiều cao cửa sổ để cả bàn lọt màn hình. Bảng kết màn và hết ván hiện đè lên bàn.
- *Kết thúc màn* khi bàn còn khối xóa được phải bấm hai lần (lần đầu hỏi lại và nói rõ mỗi quân còn lại trừ 1 quân lực); lúc bế tắc thì một lần.
- Ô rơi và dồn cột có hoạt ảnh (đổi `transform`), khối vừa xóa bung mờ; tôn trọng `prefers-reduced-motion`.
- Chưa có: âm thanh, tranh thẻ Home (`public/art/home/khai-lo.webp`), hướng dẫn từng bước.

## 6. Hướng phát triển (chưa làm, chờ Shan chọn)

1. **Đề ngày**: một seed chung mỗi ngày (kiểu Nhật Lệnh), server phát lại chuỗi nước để chấm điểm và xếp hạng; cần đăng nhập.
2. **Thưởng**: vàng/sách theo mốc điểm hoặc nhiệm vụ ngày (`quests.ts`), cần server xác nhận ván.
3. **Màn soạn sẵn**: chuỗi đề có sao (ví dụ "dọn sạch trong 12 nước"), dùng chung lõi.

## 7. Câu hỏi mở

- Có muốn thưởng ảnh hưởng sức mạnh (vàng, đồ) hay chỉ danh hiệu/khung?
- Giữ hoàn tác 1 lần/màn hay bỏ hẳn để khó hơn?
- Tranh thẻ Home: vẽ riêng hay cắt từ tranh có sẵn?
