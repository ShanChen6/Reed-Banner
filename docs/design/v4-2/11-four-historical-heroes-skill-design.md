# Reed Banner — Bốn nhân vật lịch sử bổ sung: 4 × (6 chủ động + 4 bị động)

> **24/10/2026 · Design proposal only.** Không sửa code, không kích hoạt roster, không tạo asset. Mã mới **RB-076 → RB-079**, nâng tổng nhân vật thiết kế lên **79**.

## Nguyên tắc nguồn và niên đại

- Khuông Việt (Ngô Chân Lưu): hoạt động thời Đinh/Tiền Lê; tư liệu: https://scov.gov.vn/dat-nuoc-con-nguoi/con-nguoi-viet-nam/quoc-su-khuong-viet.html và https://baotanglichsu.vn/VI/Articles/3096/7883/giai-ma-bi-an-giac-mo-cua-quoc-su-khuong-viet.html.
- Đỗ Pháp Thuận: cố vấn bang giao thời Tiền Lê, gắn với giai thoại chèo đò tiếp sứ; tư liệu: https://tapchinghiencuuphathoc.vn/do-phap-thuan-mot-tang-si-tieu-bieu-thoi-tien-le.html.
- Ninh Hữu Hưng: chức tước, tiểu sử nghề mộc chủ yếu theo **thần tích địa phương**, không mặc định là chi tiết chính sử; tư liệu: https://baonamdinh.vn/channel/5093/201203/Lang-nghe-cham-khac-La-Xuyen-2159351/.
- Nguyễn Minh Không: cao tăng và danh y triều **Lý**, không đồng thời với cuộc dẹp loạn 12 sứ quân; năm sinh còn khác nhau giữa nguồn (1065/1073), năm mất thường ghi 1141; tư liệu: https://nhandan.vn/nghien-cuu-ve-thien-su-nguyen-minh-khong-post370106.html và https://vov2.vov.vn/van-hoa-giai-tri/dau-an-cua-thien-su-nguyen-minh-khong-duoi-trieu-nha-ly-53668.vov2.
- Tất cả tuyệt chiêu và hiện tượng siêu nhiên bên dưới là **diễn giải gameplay giả tưởng**, không được ghi thành sự kiện lịch sử thực tế.

## Chuẩn 10 kỹ năng

- 6 active = nghề ô 1/3/5 + hệ ô 2/6 + riêng ô 4.
- 4 passive = 1 chase nghề + 2 chase nguyên tố + 1 chase riêng **đề xuất mới**. Hệ thống hiện mới mặc định 3 chase, cần mở rộng code sau khi duyệt.
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

## RB-078 — Thần y Nguyễn Minh Không (Y sư / Mộc)

**Xếp tuyến:** Tuyến truyền kỳ mở rộng thời Lý; nhân vật sống vào thế kỷ XI–XII, không tham chiến với các sứ quân của thập niên 960 ở cốt truyện lịch sử.

**Định hướng chiến đấu:** Thiền sư, danh y được dân gian tôn kính; ưu tiên chữa trị, cứu người và dược lý, không biến thành pháp sư chiến đấu.

### Sáu kỹ năng chủ động

| Slot | Chiêu | ID | Cơ sở |
|---|---|---|---|
| 1 | **Linh dược** | `role_linhDuoc` | Kế thừa chiêu nghề hiện có |
| 2 | **Lục Diệp Phong** | `element_lucDiepPhong` | Kế thừa hệ hiện có |
| 3 | **Dưỡng sinh** | `role_duongSinh` | Kế thừa chiêu nghề hiện có |
| 4 | **Linh Dược Tế Sinh** | `rb_nmk_linhDuocTeSinh` | Tuyệt chiêu đề xuất riêng |
| 5 | **Tế độ** | `role_teDo` | Kế thừa chiêu nghề hiện có |
| 6 | **Linh Mộc Hồi Sinh** | `element_linhMocHoiSinh` | Kế thừa hệ hiện có |

**Chi tiết tuyệt chiêu ô 4:** `rb_nmk_linhDuocTeSinh` — **Linh Dược Tế Sinh**, **100** năng lượng, target `team`.

```yaml
heal to targets ratio 0.24
cleanse to targets
effect regen to targets value 0.045 ofMaxHp true turns 2
```

**Ý nghĩa chiến thuật:** Chiêu toàn đội hồi phục và thanh tẩy, không hồi sinh đồng minh đã chết; không phát minh trạng thái hồi sinh.

### Bốn kỹ năng bị động

| Ô | Tên | ID | Trigger / tác động |
|---|---|---|---|
| P1 | **Cứu viện** | `medic` | skillDamage → hồi người yếu nhất theo luật nghề |
| P2 | **Mộc sinh** | `moc1` | skillDamage → hồi theo luật hành |
| P3 | **Mộc hộ** | `moc2` | healed → cấp khiên theo luật hành |
| P4 | **Y Tâm Không Vướng** | `rb_nmk_yTam` | controlled → heal 0.025 max HP cho đồng minh yếu nhất, giới hạn lượt phản ứng |

**Vũ khí/đạo cụ phục vụ kỹ năng:** Một bát thuốc đồng cổ miệng rộng tròn với một quai nhỏ và một chày thuốc gỗ ngắn thon, buộc cùng dải vải trên đai khi không dùng; bát và chày là hai chi tiết không đổi, không sinh trượng hay kiếm.

**Điểm phải đối chiếu:** Các tín hiệu hồi trùng lớp với Mộc/Y sư; cần kiểm thử heal loop, giới hạn phản ứng và tác dụng Tinh thần.

**Hình dùng cho art:** frame 3 biểu đạt nghề ô 3 (Dưỡng sinh); frame 4 biểu đạt tuyệt chiêu riêng ô 4 (Linh Dược Tế Sinh). Không vẽ đồ vật mới xuất hiện riêng ở frame 4.

---

## RB-079 — Hào trưởng Ninh Hữu Hưng (Binh lính / Thổ)

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

## Ghi chú tương thích và QA

- Các ID mới `rb_*` đang là đề xuất cho registry tương lai; trước khi triển khai phải kiểm tra trùng ID, slot 4, target và cost. Kỹ năng nghề & hệ được tham chiếu theo luật layout2; tên chính thức phải kiểm chứng một lần nữa khi lập PR.
- Bị động P4 không có trong code hiện tại, vì vậy không được ghi là tính năng đã hoàn thành.
- Công thức regen/shield/heal, hiệu ứng mất năng lượng, số lần chase cần mô phỏng phương án F và giới hạn phản ứng (maxReactions=12, maxDepth=4).
- Minh Không không được đưa vào campaign lịch sử 960s nếu không có cơ chế chapter truyền kỳ rõ ràng.
- Cả 4 nhóm vũ khí/pháp khí tách biệt: thủ bản, mái chèo, bát thuốc, rìu thợ + khiên gỗ. Không tự phát sinh chung một 'trượng tu sĩ' cho hai nhà sư.
