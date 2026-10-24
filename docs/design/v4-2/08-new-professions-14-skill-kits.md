# Reed Banner — 14 bộ chiêu Cung thủ & Sát thủ (Design Freeze Candidate)

> **Ngày:** 24/10/2026 · **Trạng thái:** đặc tả đề xuất, chưa thêm vào `src/core/battle/skills.ts`, `chase.ts`, `roster.ts` hay giao diện.
> **Phạm vi:** 7 Cung thủ + 7 Sát thủ × **6 chủ động + 4 bị động** = 140 mục kỹ năng theo phân bổ nhân vật. Nhiều kỹ năng dùng chung nghề/hành được tái sử dụng; không phải 140 mã kỹ năng độc lập.

## Kiến trúc và ràng buộc tương thích

- **Chủ động:** ô 1/3/5 là chiêu nghề, ô 2/6 là chiêu hệ đã có (tái dùng `ELEMENT_SKILLS`), ô 4 là tuyệt chiêu cá nhân mới. Mỗi tướng đúng sáu ô.
- **Bị động:** 1 chase theo nghề + 2 chase theo hệ có sẵn + **1 chase cá nhân mới**. Runtime hiện tại trả 3 chase mặc định, vì thế **bị động thứ tư là đặc tả cần code mới**, không được xem đã hoạt động.
- **Combo đồng đội:** lớp `comboPassive` hiện có là hệ thống khác; không cộng nhầm thành bị động thứ năm. Hai nghề mới chưa có mapping combo, tile nghề, base stats, AI và UI.
- **Giá trị:** hệ số ATK, hồi và năng lượng trong tài liệu là *điểm xuất phát để mô phỏng*, không phải giá trị đã cân bằng hay đã triển khai. Dùng các loại step có trong `SkillStep` như `damage/effect/heal/energy/destroy/transform/whirl`; tránh trạng thái 'độc', 'tàng hình', 'trói' chưa được định nghĩa.
- **Phản ứng:** chỉ dùng tín hiệu `armorBroken/controlled/dispelled/skillDamage/healed/shieldAbsorbed`; phải áp dụng giới hạn `CHASE_LIMITS.maxReactions=12, maxDepth=4`, có guard chống phản ứng tự lặp.
- **Art:** hiệu ứng lửa, băng, sét, xoáy và ảo ảnh do engine hiển thị; vũ khí chính là asset bất biến. 6 khung: Master/Idle, đánh thường, ra chiêu, tuyệt chiêu, hạ gục, cá tính.

## 3 chiêu nghề dùng chung mỗi nghề (ô 1 / 3 / 5)

### Cung thủ

| Ô | ID đề xuất | Chiêu | Năng lượng | Mục tiêu | Steps đề xuất | Hướng động tác |
|---|---|---|---:|---|---|---|
| 1 | `role_cungThu_xaDiem` | **Xạ Điểm** | 30 | enemy | damage atk 1.6; mark normal | Giương dây, ngắm điểm yếu, bắn một phát chính xác. |
| 3 | `role_cungThu_khoanGiap` | **Khoan Giáp Tiễn** | 45 | enemy | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns | Kéo hết tầm rồi xuyên vào vị trí giáp hở, vẫn đúng một mũi tên. |
| 5 | `role_cungThu_muaTien` | **Mưa Tiễn Kỳ Tập** | 60 | allEnemies | damage atk 0.75 to each enemy; destroy random 3 tiles | Loạt tên được gợi bằng tư thế trước khi bắn; không vẽ nhiều cung mới. |

**Chase nghề** `archerPrepared` — **Tiếp xạ:** trigger `armorBroken`; effect `damage` 0.40× ATK. Khi đồng đội gây phá giáp thành công, Cung thủ bắn truy kích 40% ATK vào đúng mục tiêu, chỉ một lần cho mỗi action. **Combo đồng đội:** Theo hướng pursuit của combo hiện hành; đề xuất `archerPursuit`, chưa thêm runtime.

### Sát thủ

| Ô | ID đề xuất | Chiêu | Năng lượng | Mục tiêu | Steps đề xuất | Hướng động tác |
|---|---|---|---:|---|---|---|
| 1 | `role_satThu_luotSat` | **Lướt Sát** | 30 | enemy | damage atk 1.65; energy self +5 | Một bước chéo ngắn đưa lưỡi vào cự ly gần, không teleport. |
| 3 | `role_satThu_catMach` | **Cắt Mạch** | 45 | enemy | damage atk 2.0 pierce 0.20; energy targets -10 | Đâm hoặc cắt vào kẽ giáp, không tự biến đoản đao thành vũ khí dài. |
| 5 | `role_satThu_truyMenh` | **Truy Mệnh** | 65 | enemy | damage atk 2.35; execute threshold 0.35 multiplier 1.30 | Chặn đường rút bằng một cú kết thúc, không xuyên người hoặc máu me. |

**Chase nghề** `assassinPrepared` — **Thừa hư tập kích:** trigger `controlled`; effect `damage` 0.45× ATK. Khi đồng đội gây khống chế thành công, Sát thủ phản ứng đúng một nhát 45% ATK vào mục tiêu bị khống chế. **Combo đồng đội:** Theo hướng resonance/pursuit; đề xuất `assassinExploit`, chưa thêm runtime.

## 2 kỹ năng hành đã có (ô 2 và 6)

| Hành | Ô 2 — ID | Ô 6 — ID | Bị động hệ dùng lại |
|---|---|---|---|
| Kim | **Luyện Kim Thành Kiếm** (`element_luyenKimThanhKiem`) | **Kim Ý Ngưng Thần** (`element_kimYNgungThan`) | `kim1`, `kim2` |
| Mộc | **Lục Diệp Phong** (`element_lucDiepPhong`) | **Linh Mộc Hồi Sinh** (`element_linhMocHoiSinh`) | `moc1`, `moc2` |
| Thủy | **Thủy Nguyệt Tư Linh** (`element_thuyNguyetTuLinh`) | **Thanh Lưu Tẩy Trần** (`element_thanhLuuTayTran`) | `thuy1`, `thuy2` |
| Hỏa | **Phong Hỏa Thiêu Doanh** (`element_phongHoaThieuDoanh`) | **Nộ Hỏa Thiêu Thân** (`element_noHoaThieuThan`) | `hoa1`, `hoa2` |
| Thổ | **Hậu Thổ Tích Lương** (`element_hauThoTichLuong`) | **Thạch Giáp** (`element_thachGiap`) | `tho1`, `tho2` |
| Lôi | **Lôi Trụ Giáng Thế** (`element_loiTruGiangThe`) | **Tĩnh Điện Hộ Thân** (`element_tinhDienHoThan`) | `loi1`, `loi2` |
| Phong | **Phong Quyển Tàn Vân** (`element_phongQuyenTanVan`) | **Thanh Phong Tụ Khí** (`element_thanhPhongTuKhi`) | `phong1`, `phong2` |

> Những mô tả hiệu ứng hệ đầy đủ phải lấy từ registry khi triển khai; không tự viết lại hành làm thay đổi kỹ năng. Vì mỗi nhân vật đã có 2 chiêu hệ này, chỉ cần thiết kế **tuyệt chiêu riêng** mới tại ô 4.

## 14 bộ kỹ năng theo từng nhân vật

### RB-062 — Bạch Nỏ Lang · Cung thủ / Kim

**Chiến thuật nhận diện:** Đồng đội phá giáp: suy yếu thêm 8% DEF mục tiêu trong 1 lượt.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Luyện Kim Thành Kiếm** | `element_luyenKimThanhKiem` | Biến 4 ô thành Kiếm (theo registry hiện tại) |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Thiết Nỏ Phá Thành** | `rb_bnl_thietNoPhaThanh` | damage 2.70× ATK, pierce 0.45; defDown 0.20 for 2 turns; destroy line 4 tiles |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Kim Ý Ngưng Thần** | `element_kimYNgungThan` | Gây 1,3× ATK, xuyên 50% DEF (bản layout2 đã thay nội dung cũ) |

**Tuyệt chiêu cá nhân:** `rb_bnl_thietNoPhaThanh`, giá **95** năng lượng, target `enemy`. damage 2.70× ATK, pierce 0.45; defDown 0.20 for 2 turns; destroy line 4 tiles. **Hướng nghệ thuật:** Giữ nỏ lớn hai tay, khóa vai và nhả một tên đồng xuyên giáp.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Kim phá / `kim1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Kim truy / `kim2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Nỏ thành bền bỉ** / `rb_bnl_passive` | `armorBroken` → `armor` 0.08 DEF reduction; Đồng đội phá giáp: suy yếu thêm 8% DEF mục tiêu trong 1 lượt. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Thiết Nỏ Phá Thành** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-063 — Thanh Lâm Xạ · Cung thủ / Mộc

**Chiến thuật nhận diện:** Đồng đội nhận hồi thực: dựng Khiên 4% HP tối đa cho người đó.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Lục Diệp Phong** | `element_lucDiepPhong` | Phá ngẫu nhiên 5 ô |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Lục Tiễn Trói Đường** | `rb_tlx_lucTienTroiDuong` | damage 1.95× ATK; effect defDown 0.25 2 turns; heal team ratio 0.06 |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Linh Mộc Hồi Sinh** | `element_linhMocHoiSinh` | Hồi bản thân 11% HP và đổi 3 ô thành Tim |

**Tuyệt chiêu cá nhân:** `rb_tlx_lucTienTroiDuong`, giá **90** năng lượng, target `enemy`. damage 1.95× ATK; effect defDown 0.25 2 turns; heal team ratio 0.06. **Hướng nghệ thuật:** Bắn về rìa bước di chuyển của địch, mô tả dây rừng chỉ bằng hướng bắn; không mọc dây từ cung.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Mộc sinh / `moc1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Mộc hộ / `moc2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Rễ hộ người** / `rb_tlx_passive` | `healed` → `shield` 0.04 max HP; Đồng đội nhận hồi thực: dựng Khiên 4% HP tối đa cho người đó. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Lục Tiễn Trói Đường** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-064 — Lam Giang Nỗ · Cung thủ / Thủy

**Chiến thuật nhận diện:** Khi đồng đội khống chế một địch, bản thân nhận 7 năng lượng.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Thủy Nguyệt Tư Linh** | `element_thuyNguyetTuLinh` | Chiêu hệ theo registry: xem steps chính thức khi triển khai |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Thủy Tiễn Khóa Thuyền** | `rb_lgn_thuyTienKhoaThuyen` | damage 2.05× ATK; effect freeze chance 0.35 for 1 turn; energy targets -15 |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Thanh Lưu Tẩy Trần** | `element_thanhLuuTayTran` | Chiêu hệ theo registry: xem steps chính thức khi triển khai |

**Tuyệt chiêu cá nhân:** `rb_lgn_thuyTienKhoaThuyen`, giá **95** năng lượng, target `enemy`. damage 2.05× ATK; effect freeze chance 0.35 for 1 turn; energy targets -15. **Hướng nghệ thuật:** Dùng nỏ nhỏ của thuyền tuần tra, nhắm thẳng dây neo tưởng tượng ngoài khung.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Thủy tiếp / `thuy1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Thủy dẫn / `thuy2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Thủy hiệu ứng cảnh giới** / `rb_lgn_passive` | `controlled` → `energy` +7 self energy; Khi đồng đội khống chế một địch, bản thân nhận 7 năng lượng. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Thủy Tiễn Khóa Thuyền** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-065 — Xích Diệm Tiễn · Cung thủ / Hỏa

**Chiến thuật nhận diện:** Đồng đội phá giáp: bắn truy kích 35% ATK vào mục tiêu.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Phong Hỏa Thiêu Doanh** | `element_phongHoaThieuDoanh` | Chiêu Hỏa theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Hỏa Vũ Tiễn Trận** | `rb_xdt_hoaVuTienTran` | damage 1.15× ATK to enemies; burn value 0.12 ofAtk 2 turns; destroy square 3 |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Nộ Hỏa Thiêu Thân** | `element_noHoaThieuThan` | Chiêu Hỏa theo registry hiện tại |

**Tuyệt chiêu cá nhân:** `rb_xdt_hoaVuTienTran`, giá **100** năng lượng, target `allEnemies`. damage 1.15× ATK to enemies; burn value 0.12 ofAtk 2 turns; destroy square 3. **Hướng nghệ thuật:** Giương cung lên đường chéo, sắp nhả một mũi tên chỉ huy loạt bắn; lửa tách VFX.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Hỏa truy / `hoa1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Hỏa phá / `hoa2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Hỏa cốt truy kích** / `rb_xdt_passive` | `armorBroken` → `damage` 0.35× ATK; Đồng đội phá giáp: bắn truy kích 35% ATK vào mục tiêu. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Hỏa Vũ Tiễn Trận** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-066 — Trấn Sơn Cung · Cung thủ / Thổ

**Chiến thuật nhận diện:** Khi Khiên đồng minh hấp thụ đòn, phản kích bắn 30% ATK.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Hậu Thổ Tích Lương** | `element_hauThoTichLuong` | Chiêu Thổ theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Sơn Cung Hộ Trận** | `rb_tsc_sonCungHoTran` | damage 1.55× ATK; shield to team 0.10 max HP lasting 2 turns; atkDown targets 0.20 for 2 turns |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Thạch Giáp** | `element_thachGiap` | Chiêu Thổ theo registry hiện tại |

**Tuyệt chiêu cá nhân:** `rb_tsc_sonCungHoTran`, giá **95** năng lượng, target `enemy`. damage 1.55× ATK; shield to team 0.10 max HP lasting 2 turns; atkDown targets 0.20 for 2 turns. **Hướng nghệ thuật:** Hạ cung nặng, bắn một tên cản nhịp địch trong thế chân rộng.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Thổ hộ / `tho1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Thổ chấn / `tho2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Sơn trấn kiên thủ** / `rb_tsc_passive` | `shieldAbsorbed` → `damage` 0.30× ATK; Khi Khiên đồng minh hấp thụ đòn, phản kích bắn 30% ATK. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Sơn Cung Hộ Trận** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-067 — Lôi Minh Xạ · Cung thủ / Lôi

**Chiến thuật nhận diện:** Gây mất HP bằng kỹ năng: trừ 5 năng lượng mục tiêu.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Lôi Trụ Giáng Thế** | `element_loiTruGiangThe` | Chiêu Lôi theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Lôi Minh Tước Khí** | `rb_lmx_loiMinhTuocKhi` | damage 2.10× ATK; energy targets -35; silence chance 0.35 for 1 turn |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Tĩnh Điện Hộ Thân** | `element_tinhDienHoThan` | Trừ địch 20 năng lượng, hoàn bản thân 10 năng lượng (layout2) |

**Tuyệt chiêu cá nhân:** `rb_lmx_loiMinhTuocKhi`, giá **100** năng lượng, target `enemy`. damage 2.10× ATK; energy targets -35; silence chance 0.35 for 1 turn. **Hướng nghệ thuật:** Bắn ngay sau nhịp rung chuông tín hiệu ở tay, giữ một cung và một tên.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Lôi truy / `loi1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Lôi đoạt / `loi2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Lôi khẩu chớp thời cơ** / `rb_lmx_passive` | `skillDamage` → `drain` -5 enemy energy; Gây mất HP bằng kỹ năng: trừ 5 năng lượng mục tiêu. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Lôi Minh Tước Khí** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-068 — Tật Phong Tiễn · Cung thủ / Phong

**Chiến thuật nhận diện:** Khi đồng đội xua tan hiệu ứng địch thành công, bản thân nhận 6 năng lượng.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | damage atk 1.6; mark normal |
| 2 | **Phong Quyển Tàn Vân** | `element_phongQuyenTanVan` | Chiêu Phong theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | damage atk 1.9 pierce 0.25; defDown 0.15 for 2 turns |
| 4 | **Tật Phong Phân Ảnh** | `rb_tpt_tatPhongPhanAnh` | damage 0.85× ATK to all enemies; whirl 2 auto; atkDown enemies 0.15 for 2 turns |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | damage atk 0.75 to each enemy; destroy random 3 tiles |
| 6 | **Thanh Phong Tụ Khí** | `element_thanhPhongTuKhi` | Cả đội +10 năng lượng và +10% DEF trong 2 lượt (layout2) |

**Tuyệt chiêu cá nhân:** `rb_tpt_tatPhongPhanAnh`, giá **95** năng lượng, target `allEnemies`. damage 0.85× ATK to all enemies; whirl 2 auto; atkDown enemies 0.15 for 2 turns. **Hướng nghệ thuật:** Tay rời dây ở cuối nhịp bắn, thân mở đường chạy; không nhân bản người hoặc cung.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P2 | Hành | Phong tiếp / `phong1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Phong dẫn / `phong2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Thuận gió hồi nhịp** / `rb_tpt_passive` | `dispelled` → `energy` +6 self energy; Khi đồng đội xua tan hiệu ứng địch thành công, bản thân nhận 6 năng lượng. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Khoan Giáp Tiễn** (chiêu nghề ô 3). Khung 4 diễn tả **Tật Phong Phân Ảnh** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-069 — Bạch Phong Đao · Sát thủ / Kim

**Chiến thuật nhận diện:** Đồng đội phá giáp: sát thủ đánh nối 30% ATK vào mục tiêu.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Luyện Kim Thành Kiếm** | `element_luyenKimThanhKiem` | Biến 4 ô thành Kiếm (theo registry hiện tại) |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Bạch Nhận Xuyên Giáp** | `rb_bpd_bachNhanXuyenGiap` | damage 2.65× ATK; pierce 0.60; pierceShield true; defDown targets 0.15 for 2 turns |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Kim Ý Ngưng Thần** | `element_kimYNgungThan` | Gây 1,3× ATK, xuyên 50% DEF (bản layout2 đã thay nội dung cũ) |

**Tuyệt chiêu cá nhân:** `rb_bpd_bachNhanXuyenGiap`, giá **95** năng lượng, target `enemy`. damage 2.65× ATK; pierce 0.60; pierceShield true; defDown targets 0.15 for 2 turns. **Hướng nghệ thuật:** Đao găm thẳng đâm dưới kẽ giáp, lưỡi không dài thêm.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Kim phá / `kim1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Kim truy / `kim2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Một nhát chính xác** / `rb_bpd_passive` | `armorBroken` → `damage` 0.30× ATK; Đồng đội phá giáp: sát thủ đánh nối 30% ATK vào mục tiêu. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Bạch Nhận Xuyên Giáp** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-070 — Độc Ảnh · Sát thủ / Mộc

**Chiến thuật nhận diện:** Kỹ năng gây mất HP: hồi 3% HP tối đa cho đồng đội yếu nhất.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Lục Diệp Phong** | `element_lucDiepPhong` | Phá ngẫu nhiên 5 ô |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Mộc Ảnh Đoạn Mạch** | `rb_da_mocAnhDoanMach` | damage 2.25× ATK with lifesteal 0.20; silence targets for 1 turn chance 0.45; regen self 0.04 max HP 2 turns |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Linh Mộc Hồi Sinh** | `element_linhMocHoiSinh` | Hồi bản thân 11% HP và đổi 3 ô thành Tim |

**Tuyệt chiêu cá nhân:** `rb_da_mocAnhDoanMach`, giá **100** năng lượng, target `enemy`. damage 2.25× ATK with lifesteal 0.20; silence targets for 1 turn chance 0.45; regen self 0.04 max HP 2 turns. **Hướng nghệ thuật:** Dùng hai dao làm một thế khóa cổ tay rồi cắt ngắn, không vẽ độc tố.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Mộc sinh / `moc1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Mộc hộ / `moc2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Thảo ảnh dưỡng huyết** / `rb_da_passive` | `skillDamage` → `heal` 0.03 max HP to weakest ally; Kỹ năng gây mất HP: hồi 3% HP tối đa cho đồng đội yếu nhất. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Mộc Ảnh Đoạn Mạch** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-071 — Hàn Giang Khách · Sát thủ / Thủy

**Chiến thuật nhận diện:** Khi địch bị khống chế: hồi 3,5% HP tối đa cho đồng minh yếu nhất.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Thủy Nguyệt Tư Linh** | `element_thuyNguyetTuLinh` | Chiêu hệ theo registry: xem steps chính thức khi triển khai |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Hàn Giang Bế Khí** | `rb_hgk_hanGiangBeKhi` | damage 2.00× ATK; freeze chance 0.40 for 1 turn; energy targets -20 |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Thanh Lưu Tẩy Trần** | `element_thanhLuuTayTran` | Chiêu hệ theo registry: xem steps chính thức khi triển khai |

**Tuyệt chiêu cá nhân:** `rb_hgk_hanGiangBeKhi`, giá **95** năng lượng, target `enemy`. damage 2.00× ATK; freeze chance 0.40 for 1 turn; energy targets -20. **Hướng nghệ thuật:** Đâm một nhát từ tầm ngắn, vai thấp như người quen di chuyển trên thuyền.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Thủy tiếp / `thuy1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Thủy dẫn / `thuy2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Hơi sông lặng** / `rb_hgk_passive` | `controlled` → `heal` 0.035 max HP to weakest ally; Khi địch bị khống chế: hồi 3,5% HP tối đa cho đồng minh yếu nhất. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Hàn Giang Bế Khí** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-072 — Xích Dạ · Sát thủ / Hỏa

**Chiến thuật nhận diện:** Đồng đội phá giáp: sát thủ chém bồi 38% ATK.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Phong Hỏa Thiêu Doanh** | `element_phongHoaThieuDoanh` | Chiêu Hỏa theo registry hiện tại |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Xích Dạ Liên Trảm** | `rb_xd_xichDaLienTram` | damage 2.60× ATK; burn targets 0.16 ofAtk for 2 turns; execute threshold 0.30 multiplier 1.25 |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Nộ Hỏa Thiêu Thân** | `element_noHoaThieuThan` | Chiêu Hỏa theo registry hiện tại |

**Tuyệt chiêu cá nhân:** `rb_xd_xichDaLienTram`, giá **100** năng lượng, target `enemy`. damage 2.60× ATK; burn targets 0.16 ofAtk for 2 turns; execute threshold 0.30 multiplier 1.25. **Hướng nghệ thuật:** Cắt một nhát thấp rồi thu đao cho nhát kết, tuyệt chiêu chỉ chụp một khoảnh khắc.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Hỏa truy / `hoa1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Hỏa phá / `hoa2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Dạ hỏa truy mệnh** / `rb_xd_passive` | `armorBroken` → `damage` 0.38× ATK; Đồng đội phá giáp: sát thủ chém bồi 38% ATK. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Xích Dạ Liên Trảm** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-073 — Địa Ẩn · Sát thủ / Thổ

**Chiến thuật nhận diện:** Khi Khiên đồng đội đỡ đòn: làm mục tiêu đang giao chiến giảm DEF 8% một lượt.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Hậu Thổ Tích Lương** | `element_hauThoTichLuong` | Chiêu Thổ theo registry hiện tại |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Địa Phục Đoạn Lộ** | `rb_di_diaPhucDoanLo` | damage 2.20× ATK; defDown targets 0.25 for 2 turns; shield to self 0.12 max HP lasting 2 turns |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Thạch Giáp** | `element_thachGiap` | Chiêu Thổ theo registry hiện tại |

**Tuyệt chiêu cá nhân:** `rb_di_diaPhucDoanLo`, giá **95** năng lượng, target `enemy`. damage 2.20× ATK; defDown targets 0.25 for 2 turns; shield to self 0.12 max HP lasting 2 turns. **Hướng nghệ thuật:** Hạ thấp trọng tâm, vung rìu tay thấp vào chỗ nối khiên chân đối thủ.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Thổ hộ / `tho1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Thổ chấn / `tho2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Địa ảnh đỡ đòn** / `rb_di_passive` | `shieldAbsorbed` → `armor` defDown 0.08 for 1 turn; Khi Khiên đồng đội đỡ đòn: làm mục tiêu đang giao chiến giảm DEF 8% một lượt. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Địa Phục Đoạn Lộ** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-074 — Lôi Ảnh · Sát thủ / Lôi

**Chiến thuật nhận diện:** Kỹ năng gây mất HP: trừ thêm 8 năng lượng mục tiêu.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Lôi Trụ Giáng Thế** | `element_loiTruGiangThe` | Chiêu Lôi theo registry hiện tại |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Thiểm Ảnh Tước Khí** | `rb_la_thiemAnhTuocKhi` | damage 2.10× ATK; pierce 0.30; energy targets -30; silence chance 0.30 for 1 turn |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Tĩnh Điện Hộ Thân** | `element_tinhDienHoThan` | Trừ địch 20 năng lượng, hoàn bản thân 10 năng lượng (layout2) |

**Tuyệt chiêu cá nhân:** `rb_la_thiemAnhTuocKhi`, giá **100** năng lượng, target `enemy`. damage 2.10× ATK; pierce 0.30; energy targets -30; silence chance 0.30 for 1 turn. **Hướng nghệ thuật:** Hai đoản đao ngắn thực hiện động tác đảo tay, không có đao thứ ba.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Lôi truy / `loi1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Lôi đoạt / `loi2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Lôi ảnh dứt mạch** / `rb_la_passive` | `skillDamage` → `drain` -8 enemy energy; Kỹ năng gây mất HP: trừ thêm 8 năng lượng mục tiêu. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Thiểm Ảnh Tước Khí** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

### RB-075 — Vô Ảnh · Sát thủ / Phong

**Chiến thuật nhận diện:** Khi đồng đội xua tan hiệu ứng địch thành công: nhận 7 năng lượng.

**Sáu chủ động**

| Ô | Chiêu | ID | Chức năng / mục tiêu |
|---|---|---|---|
| 1 | **Lướt Sát** | `role_satThu_luotSat` | damage atk 1.65; energy self +5 |
| 2 | **Phong Quyển Tàn Vân** | `element_phongQuyenTanVan` | Chiêu Phong theo registry hiện tại |
| 3 | **Cắt Mạch** | `role_satThu_catMach` | damage atk 2.0 pierce 0.20; energy targets -10 |
| 4 | **Vô Ảnh Hoán Bộ** | `rb_va_voAnhHoanBo` | damage 2.25× ATK; dispel targets; whirl 2 auto; atkDown targets 0.15 2 turns |
| 5 | **Truy Mệnh** | `role_satThu_truyMenh` | damage atk 2.35; execute threshold 0.35 multiplier 1.30 |
| 6 | **Thanh Phong Tụ Khí** | `element_thanhPhongTuKhi` | Cả đội +10 năng lượng và +10% DEF trong 2 lượt (layout2) |

**Tuyệt chiêu cá nhân:** `rb_va_voAnhHoanBo`, giá **95** năng lượng, target `enemy`. damage 2.25× ATK; dispel targets; whirl 2 auto; atkDown targets 0.15 2 turns. **Hướng nghệ thuật:** Đổi chân dẫn, dao mỏng quét đường ngắn, trông như đổi vị trí không phải hóa thành khói.

**Bốn bị động (chase)**

| Thứ tự | Nguồn | Chiêu / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Nghề | Thừa hư tập kích / `assassinPrepared` | `controlled` → 0.45× ATK |
| P2 | Hành | Phong tiếp / `phong1` | Kế thừa registry hệ hiện tại |
| P3 | Hành | Phong dẫn / `phong2` | Kế thừa registry hệ hiện tại |
| P4 | Riêng | **Vô thanh tiếp vận** / `rb_va_passive` | `dispelled` → `energy` +7 self energy; Khi đồng đội xua tan hiệu ứng địch thành công: nhận 7 năng lượng. |

**Ưu tiên cho ảnh ra chiêu / tuyệt chiêu:** khung 3 diễn tả **Cắt Mạch** (chiêu nghề ô 3). Khung 4 diễn tả **Vô Ảnh Hoán Bộ** (ô 4). Các kỹ năng khác không bắt buộc thêm frame ảnh riêng.

---

## Kiểm định cần thực hiện sau phê duyệt (chưa triển khai)

- [ ] Chạy type-check khi mở rộng `Profession` vào chiến đấu thực tế.
- [ ] Thêm role skill, ultimate ID và chase cá nhân vào registry; xác thực `unique id`, target, recipient và cost.
- [ ] Kiểm tra 4 chase/hero hoạt động không lặp vô hạn; combo nghề riêng phải độc lập với chase.
- [ ] Mô phỏng PvE/PvP thời lượng trận, damage/energy, lượt combo, hồi phục và tương tác nguyên tố; không xác nhận cân bằng theo tài liệu này.
- [ ] Xây tile nghề hoặc luật dùng tile không làm thay đổi semantics ô của sáu nghề cũ.
- [ ] Cung/nỏ có animation nạp tên/tốc độ bắn; sát thủ không được dịch chuyển tức thời khi engine chưa hỗ trợ vị trí.
