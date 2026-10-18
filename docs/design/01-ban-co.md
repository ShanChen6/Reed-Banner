# Bàn cờ & luật ghép

> Cập nhật: 18/10/2026

## 1. Bàn cờ

- Kích thước **12 cột × 8 hàng** (bàn ngang), đặt giữa màn hình, hai phe đứng hai bên (xem [Giao diện](11-giao-dien.md)).
- Trên điện thoại, game chơi ở **màn hình xoay ngang**; mỗi ô khoảng 40px, cả bàn khoảng 480×320px.
- **6 loại ô:**

| Ô | Tên | Tác dụng khi ghép |
|---|---|---|
| ⚔️ | Kiếm | Đánh thường vào đối thủ |
| ☯️ | Âm dương | Năng lượng kỹ năng (cho người hành động) |
| 🍙 | Bánh chưng | Lương thực (chung cả đội) |
| ❤️ | Tim | Hồi máu (cho người hành động) |
| 💰 | Thỏi vàng | Vàng (tài nguyên ngoài trận) |
| 📖 | Sách | Kinh nghiệm (tài nguyên ngoài trận) |

- **Không** gắn nguyên tố vào ô, để bàn cờ dễ đọc.

## 2. Luật ghép

Tính theo **tổng số ô của một bộ ghép liền nhau**.

| Bộ ghép | Thu hoạch | Thêm lượt | Ô đặc biệt |
|---|---|---|---|
| 3 ô | ✅ | — | — |
| 4 ô | ✅ | ✅ | — |
| Chữ L / T (5 ô) | ✅ | ✅ | Bản **yếu** |
| Thẳng 5 | ✅ | ✅ | Bản **mạnh** |

- **Cascade** (ô tự rơi rồi ghép): vẫn tạo được ô đặc biệt **và vẫn cho thêm lượt**, theo đúng bảng trên.
- **Mỗi nước đi được tối đa 1 lượt thêm**, dù nước đó và các bước cascade sau nó tạo ra bao nhiêu bộ ghép từ 4 ô trở lên.
- Ô đặc biệt xuất hiện tại ô người chơi vừa kéo. Nếu do cascade thì xuất hiện ở ô giữa bộ ghép.
- Nhiều bộ ghép trong cùng một nước được xét độc lập, nên một nước có thể tạo nhiều ô đặc biệt.
- Ô bị **nổ hoặc xóa** bởi ô đặc biệt đều **được thu hoạch**. Combo không giới hạn.
- Giới hạn kỹ thuật (người chơi không thấy): server dừng xử lý sau tối đa **100 bước cascade** mỗi lượt.
- Bàn hết nước đi hợp lệ thì xáo lại bàn.
- Ô bị **kỹ năng** phá hủy: xem [Nhân vật & kỹ năng](06-nhan-vat-ky-nang.md#5-kỹ-năng-tác-động-lên-bàn-cờ).

## 3. Ô đặc biệt

### Bản mạnh (từ thẳng 5)

| Nguồn | Ô đặc biệt | Hiệu ứng khi được ghép |
|---|---|---|
| 5 ⚔️ | Kiếm lửa | Nổ vùng 3×3 |
| 5 ☯️ | Âm dương thái cực | Xóa 1 hàng hoặc 1 cột (theo hướng bộ ghép) |
| 5 🍙 | Mâm cỗ | Biến 4 ô ngẫu nhiên thành bánh chưng |
| 5 ❤️ | Tim vàng | Hồi máu cho cả đội |
| 5 💰 | Rương vàng | Xóa toàn bộ ô cùng màu với một ô ngẫu nhiên |
| 5 📖 | Binh thư | Xóa cả hàng lẫn cột (hình chữ thập) |

- **Không có kiếm lửa rơi ngẫu nhiên** như bản gốc. Kiếm lửa chỉ sinh ra từ ghép 5 kiếm.
- Kiếm lửa khi được ghép tính **gấp đôi** một ô kiếm thường trong công thức sát thương.

### Bản yếu (từ chữ L/T)

> TODO: thiết kế bản yếu của 6 ô đặc biệt.

## 4. Sinh ô & lấp đầy bàn

### Ngẫu nhiên có seed (không có mẫu sẵn)

- Đầu mỗi trận, server bốc một **seed** mới bằng bộ sinh số ngẫu nhiên an toàn của hệ điều hành.
- Seed đưa vào một PRNG xác định (ví dụ mulberry32), cho ra dãy số 0–1. Mỗi số được đổi thành một loại ô theo bảng trọng số.
- Cùng seed thì cho ra cùng một bàn, nhờ đó server **tái hiện** được trận (khôi phục sau F5, kiểm tra lỗi).
- Hai **luồng ngẫu nhiên riêng:** (1) bàn khởi đầu và ô rơi; (2) lựa chọn ngẫu nhiên của AI.
- Ở chế độ online, seed **chỉ nằm trên server**. Client chỉ nhận bàn hiện tại và các ô vừa rơi.

### Lấp đầy sau mỗi lần ăn ô

1. **Rơi xuống:** mỗi cột xử lý độc lập; ô còn lại rơi thẳng xuống, giữ thứ tự. Ô đặc biệt rơi như ô thường.
2. **Sinh ô mới** ở đỉnh cột, đủ số ô bị mất. Ô mới luôn là ô thường, sinh **ngẫu nhiên thuần** theo trọng số của màn, và **được phép tạo cascade ngay**.
3. **Kiểm tra lại:** có bộ ghép thì cascade, quay lại bước 1. Lặp tối đa 100 bước.

### Bàn khởi đầu & xáo bàn

- Bàn khởi đầu: không có bộ ghép sẵn (bốc lại nếu ô vừa sinh tạo bộ 3) và có ít nhất một nước đi hợp lệ.
- Hết nước đi hợp lệ: xáo lại các ô đang có, giữ nguyên ô đặc biệt. Bàn sau khi xáo phải có nước đi hợp lệ và không có bộ ghép sẵn. Xáo bàn không tính lượt.

### Tỉ lệ sinh ô theo màn

- Bảng chuẩn (màn thường, chế độ Thường): ⚔️ 20% · ☯️ 18% · 🍙 18% · ❤️ 18% · 💰 13% · 📖 13%.
- **Màn thường trong chiến dịch:** có thể có bảng tỉ lệ riêng như một đặc tính của màn, ví dụ "Thành Cổ Loa: nhiều kiếm, ít tim". Đây là câu đố chọn đội.
- **Trận trùm ("sân nhà"):** tăng tỉ lệ ô theo nghề của trùm, kèm **lợi thế bất đối xứng** để trùm hưởng nhiều hơn, ví dụ trùm nhận ×1.5 từ ô nghề của nó.
  > TODO: cân bằng mức lợi thế sân nhà.
- **Giới hạn bắt buộc:** mỗi loại ô tối thiểu **8%**, tối đa **35%**.
- Tỉ lệ ô của màn được **hiển thị trước trận** (thanh màu nhỏ) để người chơi chọn đội.

## 5. Giới hạn thời gian & kéo sai

- **Mỗi lượt có 30 giây.** Hết giờ thì **mất lượt**, không mất máu.
  - Áp cho mọi chế độ online. Chế độ Luyện tập và trang `/demo` được phép tắt đồng hồ.
  - Server đếm giờ (ghi `deadline` mỗi lượt), cộng 3 giây ân hạn cho độ trễ mạng.
  - Thời gian chạy animation (cascade, kỹ năng, lượt của AI) không tính vào giờ của người chơi.
  - Lượt thêm có đồng hồ 30 giây mới.
- **Không có luật phạt đi sai.** Kéo hai ô không tạo bộ ghép thì ô bật về chỗ cũ, không tính lượt, đồng hồ vẫn chạy.
