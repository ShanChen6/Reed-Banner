# Reed Banner — QA nhóm C sau cá nhân hóa 72 prompt

> 25/10/2026 · Nhánh `develop` · Phạm vi: tài liệu, **không tạo ảnh hoặc thay đổi code gameplay**.

## Nguồn mới nhất

- Prompt nhóm C: [03-tuong-thuong-hoa-tho-loi-phong.md](./03-tuong-thuong-hoa-tho-loi-phong.md)
- Kỹ năng thực: `src/core/battle/skills.ts`, đối chiếu ID bằng `src/core/roster/roster.ts`.
- Đề xuất vũ khí MEDIUM chờ duyệt: [07-medium-weapon-design-proposals.md](./07-medium-weapon-design-proposals.md)
- Những thay đổi vũ khí đã có cho Lý Liệt, Tiêu Minh, Mạnh Tường được **giữ nguyên** trong Master và cả sáu prompt.

## Kết quả thực thi

- Đã cập nhật **72 đoạn POSE**: khung 2/3/4 của 24 nhân vật RB-038–RB-061.
- Đối chiếu đúng nghề (slot 3) và tuyệt chiêu riêng (slot 4), bao gồm các ID `xichHoaDoatKy`, `loiChamKhoiTu`, `phongLuyHoKy`, `loiDaoLienTram` và những ID còn lại.
- Không chỉnh mô tả Weapon DNA, diện mạo, y phục, bảng màu, hồ sơ lore, khung 1/5/6.
- Cảnh báo quan trọng: Tống Tấn sử dụng **kiếm thẳng hai tay** dù skill tên *Lôi Đao Liên Trảm*; không sửa vũ khí theo tên chiêu.
- Các vật trường cán (giáo, trượng, cán cờ, rìu) phải là một trục liên tục, không gãy, không bị khiên hay thân che khuyết vô lý.
- Các kỹ năng hồi phục/đốt/đóng băng/đổi ô/giảm năng lượng/whirl chỉ sinh hiệu ứng qua engine, không vẽ cố định thành vũ khí.
- Không có hình ảnh mới để nghiệm thu hình học; không suy diễn rằng lỗi đã được giải quyết trên asset cũ.

## Kiểm tra cấu trúc tài liệu

- [x] 24 nhân vật, 144 khung hình.
- [x] 72 khung 2/3/4 được viết lại, không còn mẫu câu động tác chung.
- [x] 24 khung 3 có nghề và Skill ID tương ứng.
- [x] 24 khung 4 có tuyệt chiêu và Skill ID tương ứng.
- [x] Vũ khí trong đoạn `ORIGINAL WEAPON OR HELD ITEM` được giữ nguyên từng người.
- [x] Nguyễn Bặc và Trần Cương không bị sửa.
- [ ] Chưa thử nghiệm ảnh thực tế.
- [ ] Đề xuất thay đổi hình dáng vũ khí MEDIUM vẫn chờ duyệt riêng.

## Bước tiếp theo

Rà **nhóm B (18 tướng Kim, Mộc, Thủy)** theo cùng quy trình. Bảo lưu ngoại lệ **Trần Cương không thay đổi**, nếu xuất hiện trong nhóm này; nhân vật Nguyễn Bặc cũng không bị đụng tới.
