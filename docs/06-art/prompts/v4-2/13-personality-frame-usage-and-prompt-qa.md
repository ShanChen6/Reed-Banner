# Reed Banner — Ứng dụng khung 6 và QA prompt nhân vật

## Quyết định sử dụng khung Phong cách cá nhân

Khung 6 không phải animation chiến đấu. Sử dụng trong **Hồ sơ tướng** (ưu tiên MVP), **Bộ sưu tập tướng** (tiếp theo), **cốt truyện chiến dịch/hồi tưởng** (khi có nội dung), **Doanh trại** và **hệ thống gắn bó** (về sau). Không bắt buộc sinh riêng sprite chuyển động từ frame 6.

Tính độc bản: mỗi nhân vật có hoạt động đời thường liên quan trực tiếp tiểu sử, nghề hoặc sở trường: luyện tập, sửa trang bị, nghiên cứu đường hành quân, chuẩn bị dược liệu, kể chuyện bên bếp, đọc thẻ tre. Không ép 78 nhân vật cùng ngồi hoặc cùng giữ vũ khí.

**Chuẩn prompt khung 6:** Giữ Character DNA (mặt, trang phục, phụ kiện, màu và vũ khí với Weapon ID); thay đổi hành động/tư thế đúng cá tính; nếu thêm vật dụng đời thường phải cố định vị trí và có lý do trong hồ sơ. Một nhân vật toàn thân, nền tách hình đơn sắc, không khung cảnh cầu kỳ; vật mang theo không được tự biến hình. Không thay khung 6 bằng pose chiến thắng hoặc tuyệt chiêu.

## Kết quả xử lý trực tiếp hai lỗi được báo

Tại `01-chinh-lich-su-su-quan.md`, đã cập nhật **6 prompt của Kiều Công Hãn (RB-013)** và **6 prompt của Nguyễn Khoan (RB-012)**.

- **Kiều Công Hãn:** Master cầm trượng thấp; đánh thường là bước tới và điểm trượng thấp bằng tay phải; ra chiêu ô 3 **Ngũ hành ấn** (`role_nguHanhAn`) đứng thẳng, trượng dựng bên phải và **tay trái mở bàn tay làm ấn**; tuyệt chiêu **Phong Châu Lôi Kích** (`phongChauLoiKich`) dùng hai tay giơ pháp trượng cao. Ba hình bóng được tách biệt bằng chân trụ, hướng trượng, vị trí khuỷu và tay trái.
- **Nguyễn Khoan:** chuẩn hóa giáo mã `RB-012-W01` thành **một cán thẳng liên tục từ chuôi đến mũi**, tỷ lệ đề xuất tổng chiều dài ~1.12H và mũi ~0.13L; khiên mây tròn bên trái; mọi frame buộc thấy đủ hai đầu giáo, không để giáo nằm sau khiên hoặc đứt đoạn tại cơ thể. Đánh thường đâm giáo, ra chiêu ô 3 **Tường khiên** (`role_tuongKhien`) giơ khiên bảo hộ, tuyệt chiêu **Tam Đái Kiên Thành** (`tamDaiKienThanh`) trấn thủ.
- Tỷ lệ trang bị là **đề xuất art**; ảnh cũ đang lỗi sẽ không tự thay thế nếu không sinh lại ảnh. Không có asset mới và không sửa gameplay.

## Rà soát sơ bộ tài liệu gốc

Dữ liệu kiểm tra từ Markdown V4.2:
- `01-chinh-lich-su-su-quan.md`: 19 nhân vật, 114 frame; nguyên bản có 19 prompt đánh thường/19 ra chiêu/19 tuyệt chiêu dùng câu chỉ dẫn chung.
- `02-tuong-thuong-kim-moc-thuy.md`: 18 nhân vật, 108 frame; nguyên bản có 18/18/18 prompt chung tương ứng.
- `03-tuong-thuong-hoa-tho-loi-phong.md`: 24 nhân vật, 144 frame; nguyên bản có 24/24/24 prompt chung tương ứng.
- Sau chỉnh sửa riêng hai tướng, còn **59/61 nhân vật cũ** chưa được rà động tác cá nhân hóa đến mức tương đương. Đây là **rủi ro nội dung phát hiện bằng văn bản**, không được coi 59 nhân vật đã xuất ảnh lỗi.
- `09-14-heroes-character-and-frame-prompts-v4-3.md`: 14 tướng nghề mới đã được cá nhân hóa ở các frame chính theo tài liệu hiện có; chưa nghiệm thu ảnh.
- `12-four-historical-heroes-character-prompts.md`: 3 nhân vật bổ sung, 18 prompt; đã quy định pose và skill ID; chưa nghiệm thu ảnh.

**Nhận định nguyên nhân:** prompt chung chung dễ khiến model tạo ra hai pose gần giống nhau; câu “keep shaft straight” đơn lẻ không ngăn được thương bị che khuất làm trông như bị gãy. Tốt hơn là chỉ rõ **trục cán, vị trí từng tay, hai đầu cán luôn nhìn thấy, hướng khiên không che cán và hình bóng khác nhau giữa khung**.

## Checklist QA tiếp theo (chỉ Markdown)

1. [ ] Với 59 nhân vật cũ còn lại, đối chiếu skill ID thực và viết cặp pose Basic/Skill khác nhau về hành động chính, điểm tì chân, hướng vũ khí và tay tự do.
2. [ ] Với mọi binh lính cầm giáo, kiểm tra tính liên tục mũi–cán–chuôi và khiên không che/mất đoạn cán.
3. [ ] Với pháp sư cầm trượng, khung Basic tập trung đòn ngắn; khung Skill tập trung thủ ấn/tác dụng chiêu nghề; Ultimate riêng theo mã kỹ năng.
4. [ ] Giữ chi tiết cảnh đời thường khung 6 phù hợp từng tiểu sử, không sử dụng một tư thế mặc định cho mọi tướng.
5. [ ] Chỉ đánh dấu “đạt ảnh” khi có asset được duyệt; chưa cần sinh ảnh trong giai đoạn hiện tại.

## Ưu tiên triển khai UI tương lai

Hồ sơ tướng → Bộ sưu tập → Cutscene chiến dịch → Doanh trại → Hệ thống gắn bó. Khung 6 không thay Sprite đánh thường hoặc Ultimate.
