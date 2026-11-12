# 23 — Tầm Tướng Ký: cân bằng nguyên tố và cảnh báo cặp đã thử

> Cập nhật: 06/11/2026
> Trạng thái: **APPROVED** — Shan duyệt 11 cặp ghép mới ([mục 1](#1-cân-bằng-nguyên-tố)) và lời cảnh báo ([mục 2](#2-cảnh-báo-cặp-đã-thử)) ngày 04/11/2026; có code, chờ merge vào `develop`. Bật cùng cờ `TAM_TUONG_KY_ENABLED` khi deploy.

Shan (04/11/2026), xem trên bản đang chạy:

1. Đồng ý có những cặp ghép không ra gì, nhưng muốn **cân bằng nguyên tố**: bước ghép đầu đang lệch về Mộc, Thủy, Thổ.
2. **Lần đầu ghép sai vẫn mất** (lần ghép ở Thường, nguyên liệu ở Hạng). **Lần sau phải có cảnh báo**, nhưng không nói rõ là công thức sai.

Luật gốc ở [Design Freeze](design-freeze.md) (cặp có thứ tự, A+A được; ghép sai mất nguyên liệu A-8; Thường trừ lần ghép khi ra yếu tố mới hoặc ghép sai P-9) giữ nguyên.

## 1. Cân bằng nguyên tố

Trước đây, trong 49 cặp theo thứ tự của 7 hệ, chỉ 16 cặp có công thức. Hỏa và Phong không bao giờ đứng ở ô trước, Lôi chỉ có đúng một cặp (Lôi + Phong).

| Hệ | Trước: ô trước / ô sau / tổng | Sau: ô trước / ô sau / tổng |
|---|---|---|
| Kim | 2 / 1 / 3 | 4 / 4 / 7 |
| Mộc | 4 / 3 / 6 | 4 / 4 / 7 |
| Thủy | 4 / 2 / 5 | 4 / 4 / 7 |
| Hỏa | 0 / 3 / 3 | 3 / 4 / 7 |
| Thổ | 5 / 3 / 7 | 5 / 4 / 8 |
| Lôi | 1 / 0 / 1 | 4 / 3 / 7 |
| Phong | 0 / 4 / 4 | 3 / 4 / 7 |

Số tính trên sổ ba gói (Thổ + Mộc = Lúa thuộc Gói 2); cặp A+A đếm một lần ở cột tổng. Sau khi thêm: 27/49 cặp có công thức, mỗi hệ có 7 cặp (Thổ 8).

**11 cặp mới** (`PACK_1`, `contentVersion` 2 → 3):

| Ô trước | Ô sau | Ra | Lý do |
|---|---|---|---|
| Hỏa | Kim | Đồng đen | Lửa nấu kim, đúc thành đồng đen |
| Hỏa | Thủy | Mây trời | Lửa hong nước, hơi bốc thành mây |
| Hỏa | Lôi | Giông tố | Lửa trời gặp sấm, nổi cơn giông |
| Phong | Kim | Sắt rèn | Bễ gió thổi lò, kim thành sắt rèn |
| Phong | Hỏa | Than củi | Gió quạt lửa, củi cháy còn than |
| Phong | Lôi | Mây trời | Gió cuốn tiếng sấm, kéo mây về |
| Lôi | Thủy | Giông tố | Sấm gọi mưa thành giông tố |
| Lôi | Mộc | Than củi | Sét đánh cây cháy thành than |
| Lôi | Thổ | Đá ngọc thô | Sét đánh xuống đất kết đá ngọc thô |
| Kim | Kim | Đá ngọc thô | Kim thạch tụ lại thành đá ngọc thô |
| Kim | Lôi | Sắt rèn | Kim hứng sét tôi thành sắt |

Cách làm:

- Mỗi cặp mới ra một **vật liệu bậc 1 đã có**, bằng đường khác. Không thêm yếu tố, nên không có ngõ cụt mới. Mọi tướng giữ đúng số lần ghép và số đơn vị như cũ (test so từng yếu tố của cả ba sổ).
- Không cặp nào là gương của cặp cũ mà cùng kết quả (validator `mirrorSameResult`). Ví dụ Kim + Hỏa vẫn ra Sắt rèn, còn Hỏa + Kim ra Đồng đen.
- Sổ người chơi không mất gì. Cặp mới là công thức mới để tìm: ghép ra vật liệu đã có thì vẫn tính là một công thức mới (trừ lần ghép như khám phá).
- Phong + Lôi (cặp Shan thấy “chưa tìm được mối liên hệ”) giờ ra Mây trời; Lôi + Phong vẫn ra Giông tố.
- Hạng tuần: tướng đề cử, điểm và số đơn vị tối thiểu không đổi.

## 2. Cảnh báo cặp đã thử

- Server ghi lại mỗi cặp đã ghép mà không ra gì (`Profile.tamTuongKy.triedPairs`, khóa `a>b` theo thứ tự ô, chung cho Thường và Hạng, giữ tối đa 400 cặp gần nhất). Hồ sơ cũ không có trường này vẫn đọc được.
- Lần đầu ghép sai: như cũ, trừ 1 lần ghép (Thường) hoặc mất nguyên liệu (Hạng), báo “Chưa tìm được mối liên hệ”.
- Lần sau đặt lại **đúng cặp đó, đúng thứ tự** vào hai ô: màn hiện cảnh báo trước khi bấm (thanh dưới trên điện thoại kèm dòng “Đã ghép cặp này ở lần trước”). Nút giữ nguyên chữ “Hợp Nguyên” (Shan đổi ngày 06/11/2026; trước đó nút đổi thành “Vẫn hợp nguyên”, điện thoại “Vẫn ghép”).
  - Thường: “Bạn đã ghép cặp này ở lần trước. Ghép lại vẫn trừ 1 lần ghép.”
  - Hạng: “Bạn đã ghép cặp này ở lần trước. Ghép lại vẫn tiêu nguyên liệu.”
- Lời cảnh báo không nói công thức sai, chỉ nhắc đã thử và cái giá nếu ghép lại. Người chơi vẫn được ghép lại, và vẫn bị trừ như lần đầu.
- Cặp nào về sau có công thức (như Phong + Lôi ở mục 1, hoặc gói mới) thì tự bỏ khỏi cảnh báo.

## 3. Kiểm thử

- `tests/core/tam-tuong-ky/balance-tried.test.ts` (5): phân bố theo hệ; 11 cặp không đổi chỉ số của yếu tố nào trong ba sổ; ghi cặp ở Thường và Hạng; ghép lại vẫn trừ; bỏ cặp đã có công thức, lưu qua JSON, giới hạn 400.
- Hai test engine trước dùng Phong + Lôi, Lôi + Mộc làm cặp sai; nay đổi sang Hỏa + Hỏa (vẫn không có công thức).
- Validator: sổ ba gói 0 lỗi.

## 4. Shan duyệt

- [x] 11 cặp mới và lý do (mục 1).
- [x] Lời cảnh báo (mục 2); nút giữ chữ “Hợp Nguyên” từ 06/11/2026.
