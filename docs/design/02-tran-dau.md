# Trận đấu

> Cập nhật: 18/10/2026

## 1. Hai thể thức

| Thể thức | Phe người chơi | Phe đối thủ |
|---|---|---|
| **1vs1** | Nhân vật chính (Đinh Bộ Lĩnh) | 1 nhân vật |
| **3vs3** | Nhân vật chính + 2 nhân vật kèm | 3 nhân vật |

- Nhân vật chính **luôn ra trận** ở cả hai thể thức.
- Trước trận, người chơi được **đổi nguyên tố và nghề** của nhân vật chính (xem [Nhân vật & kỹ năng](06-nhan-vat-ky-nang.md)). Trong trận thì không đổi được.
- Chế độ nào dùng thể thức nào: xem [Chế độ chơi](09-che-do-choi.md).

## 2. Luật 3vs3

### 2.1 Đội hình
- Cả 3 người cùng có mặt trên sân.
- Xếp vị trí 1 / 2 / 3 **trước trận**, không đổi giữa trận.
- Vị trí chỉ quyết định **thứ tự đánh mặc định** và **đối thủ đối diện** (vị trí 1 đối diện vị trí 1…).

### 2.2 Người hành động mỗi lượt
- Mặc định là **người kế tiếp sau người vừa ra tay**, theo thứ tự vị trí, và **được làm sáng sẵn**. Người chơi chỉ chạm vào chân dung khi muốn đổi người.
- **Người vừa hành động phải nghỉ 1 lượt** (không được chọn liên tiếp). Luật mặc định tự thỏa mãn điều này.
- Bỏ qua người đã gục và người đang bị Đóng băng.
- **Lượt thêm:** thuộc về phe, phải chọn người khác; mặc định là người kế tiếp. Cách đếm lượt thêm: xem [mục 5](#5-cấu-trúc-một-lượt).
- Chỉ còn một người sống thì người đó đánh mọi lượt.

### 2.3 Mục tiêu
- **Đánh thường** (ghép kiếm) nhắm vào **đối thủ đối diện**. Đối diện đã gục thì nhắm vào đối thủ còn sống gần nhất.
- **Khiêu khích** ghi đè luật trên (xem [Hiệu ứng](04-hieu-ung.md)).
- **Kỹ năng** nhắm vào đồng đội hoặc đối thủ được người chơi chọn, theo loại kỹ năng.

## 3. Luật 1vs1

Mọi luật của 3vs3 áp dụng, trừ các điểm sau:

- Nhân vật duy nhất đánh **mọi lượt**, kể cả lượt thêm. Không có luật nghỉ 1 lượt.
- Đánh thường và kỹ năng đơn mục tiêu luôn nhắm vào đối thủ duy nhất. **Khiêu khích** không có tác dụng.
- Kỹ năng "cho cả đội" chỉ tác động lên bản thân; kỹ năng "toàn bộ kẻ địch" chỉ trúng một đối thủ nhưng gây ×1.5 sát thương.
- **Tĩnh tâm** (năng lượng cho đồng đội không hành động) không áp dụng.
- Đóng băng làm nhân vật **mất lượt** thay vì bị bỏ qua trong luân phiên.

- **Máu tối đa ×2** ở 1vs1, vì không có đồng đội chia sát thương.
- **Tinh thần** (19/10/2026, thay luật Mệt mỏi): trận kéo dài thì Tinh thần của mỗi tướng giảm, kéo ATK, DEF, hồi máu và Khiên xuống. Áp dụng cả 1vs1 và 3vs3, xem [Tài nguyên & công thức](03-tai-nguyen-cong-thuc.md#5-tinh-thần-riêng-từng-tướng).
- Mô phỏng 19/10/2026 (150 trận, AI Thường): trung vị 20 lượt mỗi bên, 90% trận xong trong 48.5 lượt, không còn trận chạm giới hạn lượt.

> TODO: thời lượng mục tiêu riêng cho 1vs1.

## 4. Máu & thời lượng

- **Không có luật trụ vững** (đã bỏ ngày 18/10/2026). Nhân vật có thể bị hạ gục trong một lượt; việc tránh bị quét sạch bằng một combo được giải quyết bằng cân bằng **máu và sát thương** của nhân vật.
- Máu gốc phải đủ cao so với sát thương, để một combo lớn hoặc một tuyệt kỹ không hạ gục nhân vật đang đầy máu. Mục tiêu cụ thể đặt khi chạy mô phỏng.
- Mỗi lượt có tối đa **30 giây** (xem [Bàn cờ](01-ban-co.md#5-giới-hạn-thời-gian--kéo-sai)).
- **Thời lượng mục tiêu (chế độ Thường, 3vs3):** 6–10 phút, nghiêng về 6–8 phút, tương đương 20–30 lượt mỗi bên.
- **Trận trùm:** dài khoảng gấp rưỡi bình thường.
- Máu, ATK, tốc độ tụt lương và chi phí năng lượng được **tính ngược** từ thời lượng mục tiêu, rồi kiểm chứng bằng script mô phỏng (AI đấu AI hàng nghìn trận).

## 5. Cấu trúc một lượt

> Shan chốt ngày 18/10/2026.

- Mỗi lần ra tay gồm, theo đúng thứ tự:
  1. **Trượt miễn phí** (chỉ khi bị động Thuận Phong của hệ Phong đang có hiệu lực).
  2. **Tối đa 1 kỹ năng.**
  3. **1 nước đổi ô.** Chỉ nước đổi ô mới kết thúc lượt; trượt và kỹ năng không bao giờ kết thúc lượt.
- **Đồng hồ:** dùng xong một kỹ năng tốn năng lượng thì đồng hồ được đặt lại **30 giây** để còn đổi ô. Trượt miễn phí không đặt lại đồng hồ. Vì mỗi lần ra tay chỉ có 1 kỹ năng, một lượt dài tối đa khoảng 60 giây; mô phỏng cân thời lượng trận tính theo mức này.
- **Hết giờ giữa lượt:** các bước server đã ghi nhận (trượt, kỹ năng) giữ nguyên, chỉ mất phần còn lại của lượt.
- **Lượt thêm:**
  - Là **phần nối dài của lượt hiện tại** trong cách đếm thời gian: không trừ thời hạn hiệu ứng, không chạy Thiêu đốt hay Hồi phục, không trừ lượt của kỹ năng bị động.
  - Nhưng về hành động thì như một lần ra tay mới: được làm lại đủ 3 bước trên (trượt miễn phí nếu còn hiệu lực, 1 kỹ năng, 1 nước đổi ô) và có đồng hồ 30 giây mới. Câm lặng hay thiếu năng lượng vẫn chặn kỹ năng như thường.
