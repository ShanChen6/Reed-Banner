# Nhật ký thay đổi thiết kế

> Mới nhất ở trên cùng. Mỗi mục ghi quyết định và lý do nếu có.

## 18/10/2026

**Tổ chức docs**
- Tách `docs/co-lau-design.md` thành các file theo chủ đề trong `docs/design/` và `docs/tech/`; gom TODO về [cau-hoi-mo.md](cau-hoi-mo.md).
- Thống nhất tên: Cờ Lau (Reed Banner), repo `ShanChen6/Reed-Banner`. Bỏ đề xuất tạo repo mới `co-lau`.
- Đổi "Ngũ hành" thành "Nguyên tố" vì giờ có 6 nguyên tố.

**Gameplay (Shan chốt)**
- Bàn cờ từ 8×8 thành **12 cột × 8 hàng**, bố cục ngang (theo ảnh tham khảo bố cục).
- **Cascade** vẫn tạo ô đặc biệt và **cho thêm lượt**; mỗi nước đi tối đa 1 lượt thêm.
- **Bỏ luật đi sai bị trừ máu.** Thay bằng đồng hồ **30 giây mỗi lượt**, hết giờ mất lượt.
- Thêm thể thức **1vs1** bên cạnh **3vs3**.
- **Nhân vật chính** là Đinh Bộ Lĩnh, có từ lúc tạo game, chọn 1 trong 6 nguyên tố và được đổi nguyên tố trước mỗi trận.
- Thêm nguyên tố **Lôi**: Kim, Mộc, Thủy, Hỏa, Thổ, Lôi.
- Nhân vật chính có **7 kỹ năng** (1 bị động, 6 chủ động) theo nguyên tố, gồm kỹ năng tác động trực tiếp lên đối thủ và lên bàn cờ. Đã có tên 6 kỹ năng chủ động hệ Mộc.
- Trang bị từ 3 ô thành **9 ô**: Vũ khí, Đính mão, Y phục, Hộ thủ, Bảo ngoa, Giới chỉ, Hạng liên, Hộ phù, Ngọc bội.

**Sau khi tham khảo trang Loạn 12 Sứ Quân bản mới (Shan chốt)**
- Lôi chỉ khắc Thủy, bị Thổ khắc.
- Thêm bảng tính cách nguyên tố để định hướng kỹ năng.
- Tương sinh có tác dụng trong trận: ×1.1 sát thương khi nguyên tố người đánh sinh ra nguyên tố mục tiêu.
- Trang bị có thưởng bộ và cộng hưởng nguyên tố khi mặc đủ 9 món.
- Đổi tên kỹ năng "Thiên Nhiên Đại Chú" (trùng tên chiêu của game đó) thành tên tạm "Cổ Thụ Trấn Thiên".
- Không xây cộng điểm tiềm năng, chí mạng, né và bang hội.

**Bộ kỹ năng nhân vật chính (bản nháp, chờ duyệt)**
- Viết chi tiết 42 kỹ năng (6 nguyên tố × 7) theo một khung chung: chi phí 20/30/40/60/100/50, mở khóa cấp 1/1/5/10/20/15, nâng cấp 1–5.
- Ở 1vs1, kỹ năng toàn bộ kẻ địch gây ×1.5 sát thương.

**Đề xuất kèm theo (chờ chốt, đã ghi trong câu hỏi mở)**
- Dấu ấn của Lôi.
- Đồng hồ 30 giây được tắt ở Luyện tập và `/demo`.
- Luật 1vs1, luật phá ô bằng kỹ năng, chỉ số chính của 9 ô trang bị.

## 16/10/2026

- Bản chốt thiết kế đầu tiên sau buổi phản biện (`docs/co-lau-design.md`).
