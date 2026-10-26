# Reed Banner — QA nhóm D và E: 17 nhân vật / 102 prompt

> 25/10/2026 — Nhánh `develop`. **Chỉ chỉnh tài liệu và prompt**, không sinh ảnh, không sửa runtime gameplay hoặc bảng cân bằng.

## Nguồn chuẩn

- Nhóm D — kỹ năng: [08-new-professions-14-skill-kits.md](./08-new-professions-14-skill-kits.md).
- Nhóm D — hồ sơ và 84 prompt: [09-14-heroes-character-and-frame-prompts-v4-3.md](./09-14-heroes-character-and-frame-prompts-v4-3.md).
- Nhóm E — kỹ năng: [11-four-historical-heroes-skill-design.md](./11-four-historical-heroes-skill-design.md), **chỉ còn 3 nhân vật** dù tên file lịch sử còn chứa 'four'.
- Nhóm E — hồ sơ và 18 prompt: [12-four-historical-heroes-character-prompts.md](./12-four-historical-heroes-character-prompts.md), **chỉ còn 3 nhân vật**.
- Kỹ năng hiện chạy: `src/core/battle/skills.ts`; bị động: `src/core/battle/chase.ts`; nghề hoạt động/mở rộng: `src/core/battle/rules.ts`.

## Kết quả và thay đổi

| Nhóm | Nhân vật | Prompt | Cập nhật | Giữ nguyên |
|---|---:|---:|---|---|
| D (7 Cung thủ + 7 Sát thủ) | 14 | 84 | 28 chỉ dẫn khung **3 & 4** thêm tên và ID chiêu rõ ràng, phân biệt chuyển động; 28 đoạn mô tả diện mạo/y phục chuyển thành tiếng Việt | Master/Idle, Basic, Defeat, Personality, **mọi Weapon DNA** |
| E (3 nhân vật lịch sử bổ sung) | 3 | 18 | Đối chiếu và xác nhận skill ID khung 3/4; sửa ghi chú về P4 trong tài liệu kỹ năng | **18 prompt không phải viết lại**; trang phục, tiểu sử, tỷ lệ Weapon DNA giữ nguyên |
| **Tổng** | **17** | **102** | Chuẩn hóa thiết kế và ghi nhận QA | Không sửa code |

## Kiểm tra nhóm D

- [x] Đủ 14 hồ sơ và 84 khung, mỗi prompt tự chứa vũ khí riêng.
- [x] Cung thủ khung 3 là `Khoan Giáp Tiễn` (`role_cungThu_khoanGiap`); Sát thủ khung 3 là `Cắt Mạch` (`role_satThu_catMach`).
- [x] Tuyệt chiêu ở khung 4 có tên riêng + ID `rb_*` từ tài liệu 08, khác góc/ngắm/nhịp di chuyển so với khung 3.
- [x] Tránh tạo thêm nỏ, cung, dây bắn hoặc mũi tên vô hình; dao đôi giữ đúng hai món; các kỹ năng 'Phân Ảnh', 'Hoán Bộ', 'Trói Đường', 'Độc Ảnh' không sinh bản sao, teleport, dây trói thực hoặc trạng thái độc chưa có.
- [x] Hồ sơ mặt và y phục đối chiếu được viết bằng tiếng Việt; prompt tiếng Anh độc lập giữ nguyên phần Character DNA và Weapon ID.
- [ ] Kích thước chuẩn tương quan cơ thể và biến dạng khi sinh ảnh **chưa được nghiệm thu bằng hình**, vì người dùng chỉ yêu cầu tài liệu.
- [ ] 14 bộ skill và hai nghề mở rộng là **design proposal**, không được báo cáo như chức năng engine đã hỗ trợ.

## Kiểm tra nhóm E

- [x] RB-076 Khuông Việt: frame 3 `role_hieuLenh`, frame 4 `rb_kv_hoQuocThienAm`, thủ bản và chuỗi 18 hạt xuyên cả sáu khung.
- [x] RB-077 Đỗ Pháp Thuận: frame 3 `role_lyGian`, frame 4 `rb_dpt_quocToAnDan`, mái chèo cán liền + năm thẻ tre.
- [x] RB-078 Ninh Hữu Hưng: frame 3 `role_tuongKhien`, frame 4 `rb_nhh_congTuongTranLuy`, rìu đẽo ngang + khiên năm tấm, ba nẹp đồng.
- [x] Đủ 3 × 6 = 18 prompt, tất cả có Weapon ID và động tác khớp kỹ năng.
- [x] Nguyễn Minh Không đã loại; không cấp lại vị trí riêng trong campaign.
- [ ] Thiết kế kỹ năng P4 mới chưa triển khai; các câu chuyện chiến đấu giai đoạn 965–968 là **lore hư cấu**, không phải chứng cứ tham chiến lịch sử.
- [ ] Sự kiện sau 971 hoặc thời Tiền Lê phải phân biệt trong lời thoại; tên Khuông Việt là tên roster, còn trong cảnh trước 971 ưu tiên Ngô Chân Lưu.

## Phát hiện chung về bị động

`chasePassives()` hiện trả **3 ID chase mặc định**: một nghề và hai hệ; tài liệu source có comment 'Four-passive loadout' theo cách tính cơ hội chuẩn bị. Do vậy đặc tả **4 bị động/nhân vật** không thể coi P4 cá nhân đã hoạt động. Hai file 08 và 11 đã được cập nhật cảnh báo; cần chốt ánh xạ 4 ô trước khi triển khai, không tự sửa code.

## Lưu ý sản xuất prompt

- Các kiểm tra trên là **text QA**, không bảo đảm image model giữ tuyệt đối 100% chi tiết. Thử ảnh sau này cần so với Master/Weapon Sheet.
- Khung 3 và 4 của nhóm D là một **khoảnh khắc tĩnh trước khi bắn/ra đòn**; VFX hoặc các hiệu ứng trận không nằm trên body asset.
- Khung 6 chỉ dùng cho hồ sơ, bộ sưu tập, cốt truyện; không cần mang logic combat.
- Không ghi đè vũ khí/ảnh đã duyệt của Nguyễn Bặc, Trần Cương hay các nhóm A–C.

## Quyết định tiếp

Ưu tiên duyệt tài liệu thay đổi vũ khí MEDIUM cho các nhân vật còn trùng hình học (nếu người dùng muốn), rồi chuẩn hóa index tài liệu và loại bỏ chỉ dẫn outdated. Không có việc bắt buộc phải tạo ảnh trong giai đoạn này.
