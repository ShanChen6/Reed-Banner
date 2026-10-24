# Reed Banner — QA nhóm B: 18 tướng Kim / Mộc / Thủy

> Ngày 25/10/2026 · Nhánh `develop` · Chỉ chỉnh tài liệu Markdown, không tạo ảnh hay thay code gameplay.

## File nguồn chuẩn

- [02-tuong-thuong-kim-moc-thuy.md](./02-tuong-thuong-kim-moc-thuy.md) — nguồn mới nhất cho 18 tướng nhóm B
- `src/core/battle/skills.ts` + `src/core/roster/roster.ts` — kiểm chứng nghề, hành, tuyệt chiêu / ID
- [07-medium-weapon-design-proposals.md](./07-medium-weapon-design-proposals.md) — **đề xuất** khác biệt vũ khí chưa áp dụng vào nhóm B
- Commit cập nhật prompt: `36808e592619fa397a9a65fac955ae5cbe7b93ae`

## Kết quả cập nhật

- 18 nhân vật RB-020–RB-037, 108 khung gốc vẫn còn nguyên.
- Đã cá nhân hóa 17 × 3 = **51 prompt**, chỉ khung **2 — Đánh thường**, **3 — Ra chiêu nghề**, **4 — Tuyệt chiêu**.
- **RB-020 Trần Cương không thay đổi bất kỳ ký tự nào trong hồ sơ và 6 prompt**, đúng yêu cầu. Nguyễn Bặc thuộc nhóm A và cũng không có thay đổi.
- 51 khung đã thay không còn câu pose chung; **3 pose chung còn lại thuộc Trần Cương** và được giữ nguyên có chủ đích.
- Weapon DNA, trang phục, Color DNA, mô tả nguồn và khung Master/Idle — Hạ gục — Phong cách cá nhân đều giữ nguyên.
- Kỹ năng ô 3 tham chiếu đúng `ROLE_SKILLS`; ô 4 tham chiếu ID tuyệt chiêu riêng trong `ULTIMATES`.
- Các tỷ lệ vũ khí là đặc tả đang có; **không tự thêm số đo hình học hoặc thay đổi trang bị**.

## Trường hợp phải bảo toàn

| Nhân vật | Yêu cầu khóa |
|---|---|
| Trần Cương RB-020 | Giữ nguyên tuyệt đối cả sáu prompt |
| Chu Ngân RB-021 | Trượng đồng ba chuông, một cầu bạc và ống sáu ngân châm |
| Châu Ngọc RB-023 | Một hồ lô trắng, một hộp bốn kim ở hông trái |
| Cao Kiên RB-022 | Giáo ngắn và khiên mây có đúng một núm sắt |
| Hoàng Mộc RB-028 | Giáo thân tre liền mạch, khiên có biểu tượng lá tre |
| Thái Hà RB-034 | Đinh ba ngư dân đúng ba mũi, cán liền mạch |
| Hồ Lãng RB-032 | Tuyệt chiêu **Lãng Đào Trảm** vẫn sử dụng giáo, không đổi sang đao |
| Đàm Thảo RB-027 | Trượng gỗ sống có dáng cong tự nhiên, không ép thẳng; khác trường hợp cán giáo bị gãy |
| Tô Kim / Nhan Trúc / Quách Ẩn | Quạt lông quạ / quạt tre tròn / quạt giấy lam nửa mở không hoán đổi thiết kế |

## Phân biệt pose

- **Basic:** hành động ngắn có thể lặp lại, không tạo VFX.
- **Slot 3 Skill:** động tác theo nghề thực: `role_phaTran`, `role_nguHanhAn`, `role_tuongKhien`, `role_duongSinh`, `role_lyGian`, `role_hieuLenh`.
- **Slot 4 Ultimate:** tư thế riêng theo tên/ID/steps của từng nhân vật. Không vẽ burn/freeze/heal/energy/whirl lên body asset; skill VFX nằm ngoài prompt.
- **Geometry:** giữ mũi–cán–chuôi một trục liên tục với thương, giáo và cờ; nếu pose khó thì đổi pose, không bẻ vũ khí.

## Checklist

- [x] 18 hồ sơ và 108 prompt còn đầy đủ.
- [x] 51 pose khung 2/3/4 được cá nhân hóa, gắn đúng kỹ năng.
- [x] Trần Cương được so sánh nguyên bản với bản sau và giữ nguyên tuyệt đối.
- [x] Không thay Weapon DNA và khung 1/5/6.
- [x] Không có gameplay/asset đổi.
- [ ] Chưa nghiệm thu ảnh render thực tế.
- [ ] Những đề xuất thay trang bị ở file 07 vẫn chưa được duyệt/applied và không thuộc đợt chỉnh pose này.
