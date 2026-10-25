# Reed Banner — Ba nhân vật bổ sung cho chiến dịch loạn 12 sứ quân: 3 × (6 chủ động + 4 bị động)

> **24/10/2026 · Design proposal only.** Không sửa code, không kích hoạt roster, không tạo asset. Mã mới **RB-076 → RB-078**, nâng tổng nhân vật thiết kế lên **78**.

## Quyết định roster và mốc truyện

- Danh sách mới gồm **Khuông Việt Đại sư, Thiền sư Đỗ Pháp Thuận và Hào trưởng Ninh Hữu Hưng**. Đây là nhân vật chiến dịch được **hư cấu hóa** trong bối cảnh loạn 12 sứ quân; không có nghĩa mọi hoạt động được ghi nhận của họ đều xảy ra trong giai đoạn 965–968.
- **Nguyễn Minh Không đã bị loại khỏi bộ mở rộng này** vì thuộc thời Lý, không đồng đại với loạn 12 sứ quân. RB-078 được cấp lại cho Ninh Hữu Hưng khi hồ sơ vẫn chỉ ở giai đoạn tài liệu.
- Danh xưng “Khuông Việt” được dùng như tên nhân vật nhận diện trong game; đối với cảnh đặt trước năm 971, tên Ngô Chân Lưu phù hợp niên đại hơn.

## Nguyên tắc nguồn và niên đại

- Khuông Việt (Ngô Chân Lưu): hoạt động thời Đinh/Tiền Lê; tư liệu: https://scov.gov.vn/dat-nuoc-con-nguoi/con-nguoi-viet-nam/quoc-su-khuong-viet.html và https://baotanglichsu.vn/VI/Articles/3096/7883/giai-ma-bi-an-giac-mo-cua-quoc-su-khuong-viet.html.
- Đỗ Pháp Thuận: cố vấn bang giao thời Tiền Lê, gắn với giai thoại chèo đò tiếp sứ; tư liệu: https://tapchinghiencuuphathoc.vn/do-phap-thuan-mot-tang-si-tieu-bieu-thoi-tien-le.html.
- Ninh Hữu Hưng: chức tước, tiểu sử nghề mộc chủ yếu theo **thần tích địa phương**, không mặc định là chi tiết chính sử; tư liệu: https://baonamdinh.vn/channel/5093/201203/Lang-nghe-cham-khac-La-Xuyen-2159351/.
- Tất cả tuyệt chiêu và hiện tượng siêu nhiên bên dưới là **diễn giải gameplay giả tưởng**, không được ghi thành sự kiện lịch sử thực tế.

## Chuẩn 10 kỹ năng

- 6 active = nghề ô 1/3/5 + hệ ô 2/6 + riêng ô 4.
- 4 passive = 1 chase nghề + 2 chase nguyên tố + 1 chase riêng **đề xuất mới**. Hệ thống trả mặc định 3 chase ID; P4 cá nhân cần duyệt và triển khai riêng. Lưu ý kỹ thuật (đối chiếu `src/core/battle/chase.ts` ngày 25/10/2026): `chasePassives()` mặc định trả **3 chase ID** (1 nghề + 2 hệ), nhưng mô tả kiến trúc trong code gọi đây là four-passive loadout do tính riêng một cơ chế cơ hội chuẩn bị. **P4 cá nhân trong tài liệu này chưa có ID/runtime**, không được nhầm với 4 passive đã chạy. Cần duyệt lại cách đếm và mô phỏng stacking trước khi thêm P4.
- Dùng nghề đã có trong `rules.ts`; không đổi chỉ số và không thêm nghề. Mức năng lượng/hệ số của tuyệt chiêu là mốc gợi ý để mô phỏng, không phải số liệu cân bằng.
- VFX (thiền âm, thư tín, dược khí, dựng lũy) tạo bởi engine, **không bake** vào body asset hoặc làm biến hình vũ khí.

## RB-076 — Khuông Việt Đại sư (Quân sư / Kim)

**Xếp tuyến:** Tuyến Đinh–Tiền Lê; danh xưng Khuông Việt nhận năm 971; không dùng danh hiệu này trong cảnh trước năm 971.

**Định hướng chiến đấu:** Thiền sư, cố vấn tinh thần và ngoại giao; điều lệnh bảo vệ đội hình, không xây như pháp sư phá hủy.

### Sáu kỹ năng chủ động

| Slot | Chiêu | ID | Cơ sở |
|---|---|---|---|
| 1 | **Nghi binh** | `role_nghiBinh` | Kế thừa chiêu nghề hiện có |
| 2 | **Luyện Kim Thành Kiếm** | `element_luyenKimThanhKiem` | Kế thừa hệ hiện có |
| 3 | **Hiệu lệnh** | `role_hieuLenh` | Kế thừa chiêu nghề hiện có |
| 4 | **Hộ Quốc Thiền Âm** | `rb_kv_hoQuocThienAm` | Tuyệt chiêu đề xuất riêng |
| 5 | **Phá kế** | `role_phaKe` | Kế thừa chiêu nghề hiện có |
| 6 | **Kim Ý Ngưng Thần** | `element_kimYNgungThan` | Kế thừa hệ hiện có |

**Chi tiết tuyệt chiêu ô 4:** `rb_kv_hoQuocThienAm` — **Hộ Quốc Thiền Âm**, **85** năng lượng, target `team`.

```yaml
effect shield to targets value 0.16 ofMaxHp true turns 2
cleanse to targets
energy to targets amount 10
```

**Ý nghĩa chiến thuật:** Tăng hiệu quả sinh tồn bằng hộ trì và an thần; không thể hiện đòn phép đánh nhau theo mô típ fantasy.

### Bốn kỹ năng bị động

| Ô | Tên | ID | Trigger / tác động |
|---|---|---|---|
| P1 | **Tiếp lệnh** | `commander` | healed → cấp 8 năng lượng theo luật gốc |
| P2 | **Kim phá** | `kim1` | skillDamage → giảm DEF theo luật hành |
| P3 | **Kim truy** | `kim2` | armorBroken → truy kích theo luật hành |
| P4 | **Giới Hộ Quốc** | `rb_kv_gioiHoQuoc` | shieldAbsorbed → heal 0.03 max HP cho đồng minh HP thấp nhất; cần kiểm tra vòng chain |

**Vũ khí/đạo cụ phục vụ kỹ năng:** Một bản thủ bản nghi lễ hình chữ nhật bằng gỗ mun có hai góc bọc đồng già, dây hạt 18 hạt gỗ đen cố định ở cạnh dưới, không phải chuông, không phải kiếm. Chỉ mang một thủ bản; không tự biến thành tấm khiên.

**Điểm phải đối chiếu:** Hỗ trợ cao, không sát thương trực tiếp ô 4; hai passive Kim gây áp lực không bị khuếch đại bởi việc hồi/khiên.

**Hình dùng cho art:** frame 3 biểu đạt nghề ô 3 (Hiệu lệnh); frame 4 biểu đạt tuyệt chiêu riêng ô 4 (Hộ Quốc Thiền Âm). Không vẽ đồ vật mới xuất hiện riêng ở frame 4.

---

## RB-077 — Thiền sư Đỗ Pháp Thuận (Mưu sĩ / Thủy)

**Xếp tuyến:** Tuyến Tiền Lê, phù hợp các sự kiện bang giao khoảng năm 986–987. Không mặc định đã tham gia trận đánh năm 965.

**Định hướng chiến đấu:** Thiền sư giỏi ứng đối, gắn hình ảnh người chèo đò tiếp sứ và tư tưởng lấy hòa bình giữ nước; dùng mái chèo như vật nhận dạng.

### Sáu kỹ năng chủ động

| Slot | Chiêu | ID | Cơ sở |
|---|---|---|---|
| 1 | **Mua chuộc** | `role_muaChuoc` | Kế thừa chiêu nghề hiện có |
| 2 | **Thủy Nguyệt Tụ Linh** | `element_thuyNguyetTuLinh` | Kế thừa hệ hiện có |
| 3 | **Ly gián** | `role_lyGian` | Kế thừa chiêu nghề hiện có |
| 4 | **Quốc Tộ An Dân** | `rb_dpt_quocToAnDan` | Tuyệt chiêu đề xuất riêng |
| 5 | **Cắt quân lương** | `role_catQuanLuong` | Kế thừa chiêu nghề hiện có |
| 6 | **Thanh Lưu Tẩy Trần** | `element_thanhLuuTayTran` | Kế thừa hệ hiện có |

**Chi tiết tuyệt chiêu ô 4:** `rb_dpt_quocToAnDan` — **Quốc Tộ An Dân**, **95** năng lượng, target `allEnemies`.

```yaml
dispel to targets
effect atkDown to targets value 0.22 turns 2
energy to targets amount -20
energy to team amount 8
```

**Ý nghĩa chiến thuật:** Hóa giải ý chí đối đầu, khiến địch giảm công và năng lượng; không dùng lời thơ như sát thương phép vật chất.

### Bốn kỹ năng bị động

| Ô | Tên | ID | Trigger / tác động |
|---|---|---|---|
| P1 | **Thừa hư** | `strategist` | dispelled → trừ năng lượng theo luật nghề |
| P2 | **Thủy tiếp** | `thuy1` | controlled → hồi cho đồng minh theo luật hành |
| P3 | **Thủy dẫn** | `thuy2` | healed → tiếp năng lượng theo luật hành |
| P4 | **Một Chèo Lặng Sóng** | `rb_dpt_motCheo` | dispelled → energy +5 cho người tung; guard không tái kích hoạt theo cùng event |

**Vũ khí/đạo cụ phục vụ kỹ năng:** Một mái chèo gỗ dài cứng đầu bản hẹp, mặt chèo sẫm; nút dây vải chàm gần tay cầm, cạnh dưới mẻ rất nhỏ. Mang thẻ tre cuộn nhỏ buộc bên hông trái như vật dụng phụ, không là vũ khí thứ hai.

**Điểm phải đối chiếu:** Hai hiệu ứng energy swing cùng P1/P4 có nguy cơ khống chế tài nguyên quá mạnh, phải mô phỏng.

**Hình dùng cho art:** frame 3 biểu đạt nghề ô 3 (Ly gián); frame 4 biểu đạt tuyệt chiêu riêng ô 4 (Quốc Tộ An Dân). Không vẽ đồ vật mới xuất hiện riêng ở frame 4.

---

## RB-078 — Hào trưởng Ninh Hữu Hưng (Binh lính / Thổ)

**Xếp tuyến:** Tuyến cuối Đinh–Tiền Lê, dựa trên thần tích tổ nghề mộc La Xuyên; truyền thống nêu năm sinh 936 và mất năm 1020, cần phân biệt thần tích với sự kiện được chính sử xác nhận.

**Định hướng chiến đấu:** Nghệ nhân gỗ và người tổ chức hậu cần/công trình, không phải võ tướng cầm bảo kiếm thông thường; hình tượng hộ quân và thợ dựng lũy.

### Sáu kỹ năng chủ động

| Slot | Chiêu | ID | Cơ sở |
|---|---|---|---|
| 1 | **Thủ thành** | `role_thuThanh` | Kế thừa chiêu nghề hiện có |
| 2 | **Hậu Thổ Tích Lương** | `element_hauThoTichLuong` | Kế thừa hệ hiện có |
| 3 | **Tường khiên** | `role_tuongKhien` | Kế thừa chiêu nghề hiện có |
| 4 | **Công Tượng Trấn Lũy** | `rb_nhh_congTuongTranLuy` | Tuyệt chiêu đề xuất riêng |
| 5 | **Phản kích** | `role_phanKich` | Kế thừa chiêu nghề hiện có |
| 6 | **Thạch Giáp** | `element_thachGiap` | Kế thừa hệ hiện có |

**Chi tiết tuyệt chiêu ô 4:** `rb_nhh_congTuongTranLuy` — **Công Tượng Trấn Lũy**, **95** năng lượng, target `team`.

```yaml
effect shield to targets value 0.14 ofMaxHp true turns 2
effect taunt to self value 0 turns 2
effect reflect to self value 0.25 turns 2
destroy random 3 tiles
```

**Ý nghĩa chiến thuật:** Lấy kết cấu mộng gỗ làm biểu tượng phòng thủ, không bắt buộc triệu hồi tường gỗ bằng phép.

### Bốn kỹ năng bị động

| Ô | Tên | ID | Trigger / tác động |
|---|---|---|---|
| P1 | **Tiếp phòng** | `guardian` | healed → cấp khiên theo luật nghề |
| P2 | **Thổ hộ** | `tho1` | healed → cấp khiên theo luật hành |
| P3 | **Thổ chấn** | `tho2` | shieldAbsorbed → phản kích theo luật hành |
| P4 | **Mộng Gỗ Kết Trận** | `rb_nhh_mongGo` | armorBroken → shield 0.035 max HP cho đồng đội yếu nhất, không chồng vô hạn |

**Vũ khí/đạo cụ phục vụ kỹ năng:** Một rìu đẽo mộc dạng lưỡi ngang (adze), cán gỗ sẫm thẳng không quá khuỷu tay, đầu thép một lưỡi ngang cố định; một mộc khiên hình thang vừa thân từ các thanh gỗ ghép mộng, ba đai đồng cố định trên mặt trước.

**Điểm phải đối chiếu:** Khiên có thể tăng mạnh qua 2 passive nghề/hành khi được hồi; không khóa số liệu trước mô phỏng.

**Hình dùng cho art:** frame 3 biểu đạt nghề ô 3 (Tường khiên); frame 4 biểu đạt tuyệt chiêu riêng ô 4 (Công Tượng Trấn Lũy). Không vẽ đồ vật mới xuất hiện riêng ở frame 4.

---

## Character / Weapon / Skill Identity Lock — đồng bộ V4.4

Tài liệu [hồ sơ và 18 prompt độc lập](./12-four-historical-heroes-character-prompts.md) ghi đầy đủ tuổi, diện mạo, trang phục, màu và tỷ lệ H/L của vũ khí. Khóa kỹ năng cho các frame như sau:

| Nhân vật | Master/Idle | Frame 3 — ô 3 (nghề) | Frame 4 — ô 4 (riêng) | Trang bị cố định |
|---|---|---|---|---|
| Khuông Việt Đại sư | Dáng đứng riêng trong hồ sơ | Hiệu lệnh — `role_hieuLenh` | Hộ Quốc Thiền Âm — `rb_kv_hoQuocThienAm` | `RB-076-W01` |
| Thiền sư Đỗ Pháp Thuận | Dáng đứng riêng trong hồ sơ | Ly gián — `role_lyGian` | Quốc Tộ An Dân — `rb_dpt_quocToAnDan` | `RB-077-W01` |
| Hào trưởng Ninh Hữu Hưng | Dáng đứng riêng trong hồ sơ | Tường khiên — `role_tuongKhien` | Công Tượng Trấn Lũy — `rb_nhh_congTuongTranLuy` | `RB-078-W01` |

**Tình trạng:** thiết kế và prompt hoàn thiện để kiểm duyệt bằng văn bản; tỷ lệ vũ khí mới là đề xuất art, chưa được duyệt bằng ảnh. Với trận loạn sứ quân 965–968, tuổi tạo hình và danh xưng đã được đưa về giai đoạn tương ứng; mọi vai trò chiến đấu của các thiền sư hoặc công tượng trong chiến dịch đều hư cấu hóa.

## Ghi chú tương thích và QA

- Các ID mới `rb_*` đang là đề xuất cho registry tương lai; trước khi triển khai phải kiểm tra trùng ID, slot 4, target và cost. Kỹ năng nghề & hệ được tham chiếu theo luật layout2; tên chính thức phải kiểm chứng một lần nữa khi lập PR.
- Bị động P4 không có trong code hiện tại, vì vậy không được ghi là tính năng đã hoàn thành.
- Công thức regen/shield/heal, hiệu ứng mất năng lượng, số lần chase cần mô phỏng phương án F và giới hạn phản ứng (maxReactions=12, maxDepth=4).
- Cả 3 nhóm vũ khí/pháp khí tách biệt: thủ bản, mái chèo, rìu thợ + khiên gỗ. Không tự phát sinh chung một trượng nghi lễ cho hai thiền sư.
