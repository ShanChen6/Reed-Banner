# Reed Banner — Báo cáo sản xuất nhân vật & chuẩn prompt V4.2

> Trạng thái: **APPROVED** — bộ prompt nhân vật đang dùng (Shan chốt 27/10/2026), thay [nhan-vat.md](../nhan-vat.md) và [tu-the.md](../tu-the.md). Các hạn chế ghi bên dưới vẫn còn.

**Ngày cập nhật:** 30/10/2026. **Nhánh:** develop.

## Trạng thái

**30/10/2026:** Xạ thủ thay Cung thủ. Kim/Mộc giữ bộ ảnh; năm hệ còn lại dùng W02. Hai bản cũ 04 và QA V4.5 đã xóa theo yêu cầu, không lưu bản prompt mâu thuẫn trong thư mục khác. Sát thủ đã thay bộ W02, chưa nghiệm thu ảnh; trạng thái APPROVED đầu file không áp dụng cho thiết kế mới đang DRAFT ở tài liệu 08/09.

Đã loại bỏ tài liệu V3.1 sai bằng commit `fb946ff82b2661b8245a27c5ff302a3a17f73bc4`. Tạo 4 tệp V4.2 theo 75 tướng, 6 khung/tướng = **450 prompt**; mỗi nhân vật có phần hồ sơ đối chiếu asset bằng tiếng Việt và prompt tiếng Anh độc lập. Master = Idle, không có ảnh đứng trùng.

## Nguyên tắc

1. Hành của 42 tướng thường xác định theo 7 nhóm 6 tướng trong `16-prompt-nhan-vat.md`, không đọc từ tên và không lấy màu Đỗ Cảnh Thạc.
2. Mỗi prompt tự chứa gương mặt/ngoại hình, trang phục, vũ khí, Color DNA với nhiều mã HEX và tư thế.
3. Weapon Geometry Lock bất biến: không đổi tỷ lệ chiều dài lưỡi/cán, không uốn cán cứng, không nhân đôi hoặc thêm vũ khí. Nếu pose xung đột phải chỉnh pose.
4. Tư thế hạ gục phải thực sự mất trọng tâm, không phải quỳ anh hùng.
5. Hồ sơ tiếng Việt phục vụ kiểm tra và biên tập tiểu sử, không phải bản dịch từng dòng prompt.
6. Tiểu sử và tư thế cưỡi voi/ngựa chỉ là lore và thiết kế đề xuất nếu chưa có dữ liệu xác nhận.

## Hạn chế / cần hoàn thiện

- Mô tả hiện tận dụng mô tả ngoại hình trong tài liệu nguồn và giải thích chức năng bằng tiếng Việt; **chưa phải 75 tiểu sử chuyên sâu khác biệt về thời thơ ấu, quan hệ và động cơ**. Cần biên tập lore riêng trước khi khóa.
- **Chưa đối chiếu kỹ năng định danh từ registry** nên động tác Ra chiêu/Tuyệt chiêu hiện theo nghề/đạo cụ, không khẳng định đúng chiêu thực thi trong game.
- Không có ảnh chuẩn vũ khí nên không thể xác nhận chiều dài/lưỡi/cán trong ảnh AI; cần Weapon Reference Sheet cho 75 tướng.
- 14 tướng mới chỉ là concept đề xuất, chưa xác thực đã thêm roster.
- Ảnh đã được duyệt có quyền ưu tiên hơn mọi gợi ý mới; không sửa asset khi chưa duyệt.

## Bàn giao

- [01-chinh-lich-su-su-quan](./01-chinh-lich-su-su-quan.md)
- [02-tuong-thuong-kim-moc-thuy](./02-tuong-thuong-kim-moc-thuy.md)
- [03-tuong-thuong-hoa-tho-loi-phong](./03-tuong-thuong-hoa-tho-loi-phong.md)
- [Xạ thủ: thiết kế](./08-new-professions-14-skill-kits.md) · [Prompt Xạ thủ và prompt Sát thủ đa vũ khí](./09-14-heroes-character-and-frame-prompts-v4-3.md)

## Checklist QA

- [ ] So tên/hệ/nghề từng tướng với roster, rà Đinh Bộ Lĩnh vì hành/nghề có thể chọn động.
- [ ] Khóa Weapon Reference Sheet, đối chiếu tỉ lệ hình học qua 6 ảnh.
- [ ] Ghép tuyệt chiêu với skill ID thực tế trước duyệt.
- [ ] Duyệt tattoo/scar, không tự áp họ Trần đồng loạt.
- [ ] Kiểm thử silhouette, kiểm tra màu 7 hành và khả năng nhận diện ở thumbnail.
- [ ] Chốt lore riêng cho từng nhân vật thay vì suy từ ngoại hình.

