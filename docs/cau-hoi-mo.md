# Câu hỏi còn mở

> Cập nhật: 19/10/2026
>
> Mọi TODO trong docs đều có mặt ở đây. Chốt xong mục nào thì sửa file liên quan, đánh dấu ở đây và ghi vào [nhật ký thay đổi](nhat-ky-thay-doi.md).

## Gameplay

- [ ] Kiểm tra tốc độ tích nộ bằng mô phỏng. → [Tài nguyên](design/03-tai-nguyen-cong-thuc.md#3-nộ-và-kỹ-năng-bị-động)
- [ ] Mức lợi thế "sân nhà" của trùm và bảng tỉ lệ ô cho từng màn. → [Bàn cờ](design/01-ban-co.md#tỉ-lệ-sinh-ô-theo-màn)
- [ ] Thời lượng mục tiêu riêng cho 1vs1 (đã có máu ×2 và Tinh thần). → [Trận đấu](design/02-tran-dau.md#3-luật-1vs1)
- [ ] Chỉ số gốc theo nghề và theo cấp (sau khi chạy mô phỏng), cân lại máu và sát thương vì đã bỏ luật trụ vững. → [Trận đấu](design/02-tran-dau.md#4-máu--thời-lượng)


## Nhân vật & kỹ năng

- [ ] Số điểm kỹ năng cần cho mỗi cấp nâng kỹ năng. Đã có điểm xuất phát (1, 1, 2, 2), chờ Shan duyệt. → [Bộ kỹ năng](design/12-ky-nang-nhan-vat-chinh.md#11-nâng-cấp)
- [ ] Mô phỏng cân bằng 7 bộ kỹ năng với nhau và với nhân vật kèm. → [Bộ kỹ năng](design/12-ky-nang-nhan-vat-chinh.md#9-so-sánh-nhanh)
- [x] Nguyên tố và tuyệt chiêu đặc trưng của 5 nhân vật kèm khởi đầu (Claude đặt 19/10/2026, chờ Shan duyệt). → [Nhân vật](design/06-nhan-vat-ky-nang.md#4-nhân-vật-kèm-nghề--chiêu-nghề)
- [x] Danh sách nhân vật kèm trong cửa hàng (12 người) và giá 1 500/3 000 vàng (Claude đặt 19/10/2026, chờ Shan duyệt). → [Tiến trình](design/08-tien-trinh-kinh-te.md#3-cửa-hàng)

## Trang bị & kinh tế

- [x] Trang sức có chỉ số phụ hay không: không (Shan chốt 19/10/2026). → [Trang bị](design/07-trang-bi.md#1-chín-ô-trang-bị)
- [x] Thưởng bộ và cộng hưởng nguyên tố ở mốc 6 và 9 món, chốt theo mô phỏng (19/10/2026).
- [ ] Thêm bộ trang bị, có hiệu ứng bộ ngoài chỉ số hay không. → [Trang bị](design/07-trang-bi.md#3-thưởng-bộ--cộng-hưởng-nguyên-tố)
- [x] Phí vàng khi ghép nâng bậc: thấp, 10–80 vàng (19/10/2026). → [Trang bị](design/07-trang-bi.md#5-ghép-nâng-bậc)
- [x] Bảng rơi đồ theo phẩm (19/10/2026).
- [ ] Danh sách trang bị cố định của cửa hàng và giá. → [Trang bị](design/07-trang-bi.md#6-nguồn-trang-bị)
- [ ] Giá trị mỗi ô vàng và ô sách. Đã có điểm xuất phát (3 vàng, 5 kinh nghiệm), chờ Shan duyệt.
- [ ] Đường cong kinh nghiệm, chỉ số theo cấp (+3% mỗi cấp) và cấp tối đa 30. → [Tiến trình](design/08-tien-trinh-kinh-te.md#11-số-liệu-điểm-xuất-phát-19102026) → [Tiến trình](design/08-tien-trinh-kinh-te.md#2-vàng)

## Chế độ chơi

- [ ] Cấu trúc các màn chiến dịch, phe phái, danh sách trùm, phần thưởng, lời thoại. → [Chế độ chơi](design/09-che-do-choi.md#2-chiến-dịch)
- [ ] Chi tiết Sinh tồn (số đối thủ mỗi đợt, đường cong sức mạnh) và Leo tháp (phần thưởng giữa các tầng). → [Chế độ chơi](design/09-che-do-choi.md#3-leo-tháp-vô-hạn)

## Giao diện

- [ ] Người vẽ hoặc công cụ AI, ngân sách và thời điểm vẽ chân dung, trang bị; danh sách 12 sứ quân theo thứ tự chiến dịch. → [Hình ảnh](design/13-hinh-anh.md#25-định-dạng-giao-hàng)
- [ ] Cho phép đổi phím trong cài đặt; phím tắt Túi đồ và xem chi tiết sát thương. → [Giao diện](design/11-giao-dien.md#23-bàn-phím)

## AI

- [ ] Tính cách AI theo nghề và độ ngẫu nhiên từng mức khó. → [AI](design/10-ai.md#chấm-điểm-theo-độ-khó)

## Kỹ thuật

- [ ] Chốt tên miền (đề xuất `colau.vercel.app`). → [Kiến trúc](tech/kien-truc.md#3-sơ-đồ)

## Đã chốt ngày 18/10/2026

- [x] Hết giờ xử lý kiểu tính lười, không dùng dịch vụ ngoài; người chơi bỏ đi thì AI đánh tới hết trận.
- [x] Đồng hồ không dừng khi mất mạng.
- [x] Client chỉ chạy trước phần biết chắc của nước đi.
- [x] Cách AI chấm nước đi theo từng mức độ khó.
- [x] Không chặn cày vàng và sách; thua giữ 100%.
- [x] Cấu trúc một lượt (trượt, kỹ năng, đổi ô), đặt lại đồng hồ sau kỹ năng, cách đếm lượt thêm.

- [x] Ô Trống trận, thanh Nộ và 7 kỹ năng bị động kích hoạt bằng nộ.
- [x] Bản yếu (từ chữ L/T) của 7 ô đặc biệt.
- [x] Đồng hồ 30 giây được tắt ở Luyện tập và `/demo`.
- [x] Dấu ấn Lôi (trừ 10 năng lượng / Câm lặng) và Phong (Công −10% / Xua tan).
- [x] Bộ 49 kỹ năng nhân vật chính và toàn bộ tên kỹ năng, gồm "Sinh Sôi Bất Tận" và "Cổ Thụ Trấn Thiên".
- [x] Luật phá ô bằng kỹ năng.
- [x] Chỉ số chính của 9 ô trang bị (3 ô ATK, 3 ô Máu, 3 ô DEF).
- [x] 5 phẩm Trắng, Lục, Lam, Tím, Cam; ghép luôn thành công.
- [x] Thể thức của từng chế độ chơi; thêm Thử thách hằng ngày, Thế cờ, Đấu trường bóng ma.
