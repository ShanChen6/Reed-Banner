# 24 — Khai Lộ: giải đố xóa khối ô ngọc

> Cập nhật: 05/11/2026
> Trạng thái: **DRAFT** — Shan duyệt ý tưởng và chốt tên **Khai Lộ** ngày 05/11/2026; có bản chơi thử offline (không thưởng, không xếp hạng). Các số ở [mục 4](#4-số-liệu-bản-đầu) do Claude đặt theo mô phỏng, chờ Shan chơi thử.

## 1. Định vị

Mini game giải đố một chạm trên bàn ô ngọc của Cờ Lau. Người chơi chạm một ô; cả **khối** ô cùng loại liền cạnh với nó biến mất, ô phía trên rơi xuống, cột trống thì các cột dồn lại. Cái hay nằm ở việc tính trước: xóa khối nhỏ nào để các khối khác dồn lại thành khối lớn, rồi mới xóa khối lớn lấy điểm.

- Thể loại: "xóa nhóm cùng màu" (SameGame, 1985), cảm hứng từ Block'D (EA Mobile, J2ME). Làm clean-room: không dùng tên, hình, âm thanh hay số liệu của game gốc.
- Dùng 7 loại ô ngọc và tranh ô có sẵn (`public/art/tiles/`), không cần đồ họa mới để chơi được.
- Khác các chế độ khác: không đánh nhau, không đổi hai ô như match-3 (Giao Tranh), không đặt quân như Trận Đồ, không ghép công thức như Tầm Tướng Ký.
- Không có ô mới rơi vào: mỗi màn là một bài toán tất định theo seed, nên sau này phát lại được trên server để chấm điểm.

## 2. Luật chơi

### 2.1. Bàn cờ

- Bàn 10 cột × 8 hàng, đầy ô khi bắt đầu màn.
- Màn 1–4 có 3 loại ô, màn 5–9 có 4, màn 10–16 có 5, từ màn 17 có 6. Loại ô của mỗi màn được xáo theo seed.
- Từ màn 3 có **ô hào quang** (vẽ bằng bản yếu của ô): 1 ô ở màn 3–5, thêm 1 mỗi 3 màn, tối đa 4.
- Bàn sinh ra luôn có ít nhất một khối xóa được.

### 2.2. Xóa khối

- **Khối** là các ô cùng loại nối nhau theo cạnh (trên, dưới, trái, phải; không tính chéo).
- Chạm vào bất kỳ ô nào của một khối từ **2 ô** trở lên: cả khối biến mất. Ô lẻ không xóa được.
- Ô phía trên rơi thẳng xuống lấp chỗ trống. Cột trống hẳn thì các cột bên phải dồn sang trái.
- Điểm: khối n ô được **n²** điểm, nhân thêm (1 + số ô hào quang trong khối). Ví dụ khối 6 ô có 1 ô hào quang được 72 điểm.

### 2.3. Kết thúc màn và quân lực

- Ván bắt đầu với **30 quân lực**.
- Hết khối để xóa thì màn kết thúc: mỗi ô còn sót trừ 1 quân lực.
- **Dọn sạch bàn**: cộng 800 × số màn điểm, +5 quân lực, +1 mỗi đạo cụ.
- Hết khối nhưng còn đạo cụ thì màn ở trạng thái **bế tắc**: người chơi dùng đạo cụ hoặc bấm *Kết thúc màn*. Người chơi cũng có thể kết thúc màn sớm bất cứ lúc nào.
- Quân lực về 0 thì hết ván. Điểm cuối là tổng điểm các màn.

### 2.4. Đạo cụ và hoàn tác

| Đạo cụ | Tác dụng | Ban đầu | Nhận thêm |
|---|---|---|---|
| **Lốc Phong** | Chọn một tâm không sát mép: 8 ô quanh tâm xoay một nấc theo chiều kim đồng hồ (giống lốc xoáy hệ Phong trong trận), rồi ô rơi và dồn cột. Không cộng điểm. | 1 | +1 khi dọn sạch bàn |
| **Sấm Sét** | Phá vùng 3×3 quanh ô được chọn. Không cộng điểm. | 1 | +1 khi dọn sạch bàn |

- Mỗi loại giữ tối đa 9.
- **Hoàn tác**: mỗi màn 1 lần, chỉ lùi được nước vừa đi. Không lùi qua khi màn đã kết thúc.

## 3. Điều khiển

Người chơi không phải kéo nối từng ô: chỉ chọn một ô, máy tự tìm cả khối.

| Thiết bị | Xem trước | Thực hiện |
|---|---|---|
| Máy tính (chuột) | Rê chuột qua ô: cả khối sáng viền vàng, hiện số ô và điểm dự kiến. Ô lẻ không sáng. | Bấm |
| Bàn phím | Mũi tên di chuyển tiêu điểm (cũng hiện xem trước) | Enter/Space; Z hoàn tác; 1 Lốc Phong; 2 Sấm Sét; Esc bỏ chọn đạo cụ |
| Điện thoại | Chạm lần đầu: xem trước khối | Chạm lại vào cùng khối (với đạo cụ: cùng ô) |

Khi đang cầm đạo cụ, phần xem trước đổi thành vòng 8 ô (Lốc, viền ngọc lam) hoặc vùng 3×3 (Sấm, viền đỏ cam).

## 4. Số liệu bản đầu

Mô phỏng bằng bot tham lam nhìn trước 1 nước, **không dùng đạo cụ**, 150 ván:

- Màn đạt được: trung vị 8, p10 = 6, p90 = 10.
- Một màn riêng lẻ (bot, 200 bàn): 3 loại ô còn sót trung vị 2 ô, dọn sạch 21%; 4 loại sót 8; 5 loại sót 14; 6 loại sót 23.

Người chơi thật có đạo cụ và tính sâu hơn, nên kỳ vọng đi xa hơn bot vài màn. Các hằng số nằm đầu `src/core/khai-lo/engine.ts` (`KL_START_TROOPS`, `KL_CLEAR_*`, `levelConfig`).

## 5. Bản chơi thử hiện có (05/11/2026)

- Lõi: `src/core/khai-lo/` (thuần TypeScript, seed qua `src/core/rng.ts`), test ở `tests/core/khai-lo/`.
- Màn chơi: `/game/clear-path` (phân cảnh `KHAI_LO`), `src/app/game/khai-lo/KhaiLoScreen.tsx`. Thẻ ở hàng "Sắp ra mắt / đã mở" trên Home cạnh Trận Đồ.
- Offline: ván dở và điểm cao nhất lưu `localStorage` (`reed-banner:khai-lo:*`); không cần đăng nhập, không thưởng.
- Ô rơi và dồn cột có hoạt ảnh (đổi `transform`), khối vừa xóa bung mờ; tôn trọng `prefers-reduced-motion`.
- Chưa có: âm thanh, tranh thẻ Home (`public/art/home/khai-lo.webp`), hướng dẫn từng bước.

## 6. Hướng phát triển (chưa làm, chờ Shan chọn)

1. **Cấp tốc**: thêm đồng hồ cho mỗi màn, hết giờ là kết thúc màn.
2. **Đề ngày**: một seed chung mỗi ngày (kiểu Nhật Lệnh), server phát lại chuỗi nước để chấm điểm và xếp hạng; cần đăng nhập.
3. **Thưởng**: vàng/sách theo mốc điểm hoặc nhiệm vụ ngày (`quests.ts`), cần server xác nhận ván.
4. **Màn soạn sẵn**: chuỗi đề có sao (ví dụ "dọn sạch trong 12 nước"), dùng chung lõi.

## 7. Câu hỏi mở

- Có muốn thưởng ảnh hưởng sức mạnh (vàng, đồ) hay chỉ danh hiệu/khung?
- Giữ hoàn tác 1 lần/màn hay bỏ hẳn để khó hơn?
- Tranh thẻ Home: vẽ riêng hay cắt từ tranh có sẵn?
