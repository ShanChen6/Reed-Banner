# Reed Banner — Thiết kế nhân vật Xạ thủ và Sát thủ

> Cập nhật: 30/10/2026
> Trạng thái: **DRAFT** — đã chốt hướng nghề Xạ thủ và năm loại vũ khí; tên mới, bộ chiêu và thông số bên dưới là thiết kế để review, chưa triển khai. Sát thủ đã chốt bộ vũ khí; phân bổ hệ, bộ chiêu và thông số mới là thiết kế đề xuất, chưa triển khai.

## Phạm vi và nguồn chính

Đây là nguồn chính cho thiết kế nghề Xạ thủ RB-062–068 và Sát thủ RB-069–075. [Bộ prompt](./09-14-heroes-character-and-frame-prompts-v4-3.md) chỉ diễn giải hình ảnh từ thiết kế này. Bộ kỹ năng đang chạy vẫn theo [nguồn runtime](../../../03-characters/ky-nang/README.md); không coi tài liệu này là thay đổi code.

- Giữ nguyên hai bộ ảnh Kim/Mộc đã hoàn thành: RB-062 Bạch Nỏ Lang và RB-063 Thanh Lâm Xạ. Đổi nhãn nghề thành Xạ thủ; không yêu cầu tạo lại hình.
- Năm hệ Thủy/Hỏa/Thổ/Lôi/Phong thay vũ khí và toàn bộ sáu prompt cũ. Không tạo lại cung/nỏ cho năm người này.
- Giữ ID RB-062–068. Năm vũ khí thay đổi dùng `RB-064-W02`…`RB-068-W02`; mã W01 của năm người này ngừng dùng. Kim/Mộc tiếp tục W01.
- Sát thủ RB-069–075: thay toàn bộ thiết kế và prompt vũ khí cũ bằng bộ W02 ở phần Sát thủ bên dưới; giữ tên, ID, ngoại hình nhận diện và màu hệ. Bỏ nỏ mini; Phong dùng sáo âm công. Chưa cập nhật runtime.
- Không đổi lịch sử, tài sản ảnh, roster hay ID save game. Các nhân vật mới trong bộ này là hư cấu.

## Bản sắc nghề và ranh giới gameplay

Xạ thủ tạo áp lực từ xa qua vật phóng hoặc vật dẫn. Cung, nỏ, phi tiêu, phi luân, đá, phi châm và lụa chiến đều thuộc cùng nghề; không bắt mọi chiêu phải có tên “tiễn”. Đánh thường được dùng tay/chân để mở khoảng cách trên sprite. Game match-3 không tự có tọa độ, tầm bắn, đạn hữu hạn hoặc vật lý đường đạn chỉ vì hình vẽ mô tả như vậy.

Thủy = chuỗi đòn thấp, linh hoạt; Hỏa = xoay rộng và đốt; Thổ = trụ nặng, phá giáp và che tuyến; Lôi = động tác ngắn, tước năng lượng; Phong = đường lụa rộng, giảm ATK và hỗ trợ. Thủy/Lôi không trùng nhau: phi tiêu là lưỡi lá dẹt, phi châm là thanh kim loại thẳng đuôi vuông. Sát thủ được phân biệt bằng đòn tập kích đơn mục tiêu và cơ hội từ đồng đội; riêng Mộc phóng kim chọn lọc, Lôi dùng hộp phóng bộc phát, Phong dùng âm công nội lực. Có giao thoa vũ khí tầm xa nhưng vai trò và động tác không sao chép Xạ thủ.

Các ý tưởng làm chậm, đánh dấu, giảm chính xác, ngắt chiêu tức thời và trói chỉ là hình tượng ban đầu, không thêm trạng thái mới trong bản này. Tên chiêu không chứng minh engine hỗ trợ hiệu ứng đó.

## Kiến trúc Xạ thủ: 6 chủ động + 4 bị động

Sáu chủ động: ô 1/3/5 nghề, ô 2/6 hệ, ô 4 cá nhân. Bốn bị động: P1 cơ hội chuẩn bị nghề + P2 chase nghề + P3 chase hệ thứ nhất + P4 cá nhân. P4 thay chase hệ thứ hai, không thêm ô thứ năm. `comboPassive` là hệ thống khác.

### Ba kỹ năng nghề dùng chung

Thông số sau là **điểm xuất phát để mô phỏng**, không phải cân bằng cuối. Đổi tên và namespace sang `xaThu` cho thiết kế mới; không đăng ký song song `cungThu` và `xaThu` như hai nghề.

| Ô | Tên | ID đề xuất | Cost | Target | Hiệu ứng đề xuất |
|---|---|---|---:|---|---|
| 1 | Định Điểm | `role_xaThu_dinhDiem` | 30 | enemy | 1.60× ATK; xuyên 10% DEF |
| 3 | Phá Giáp | `role_xaThu_phaGiap` | 45 | enemy | 1.90× ATK; xuyên 25% DEF; DEF -15% trong 2 lượt |
| 5 | Tập Kích | `role_xaThu_tapKich` | 60 | allEnemies | 0.75× ATK mỗi địch; phá ngẫu nhiên 3 ô đúng một lần cho toàn action |

P1 `marksmanPreparedOpportunity` — Chuẩn bị xạ kích: ô cơ hội chuẩn bị của nghề, dùng contract chuẩn bị hiện hành khi bổ sung role; không tự phát sinh chase hay một lần sát thương riêng. P2 `marksmanPrepared` — Tiếp xạ: tín hiệu `armorBroken` hợp lệ do đồng đội gây ra → 0.40× ATK vào đúng mục tiêu, tối đa một lần mỗi action nguồn. Không dùng tên `archerPrepared` cho đăng ký mới.

### Hai kỹ năng hệ

Ô 2/6 và P3 lấy từ registry hiện hành, không sao chép lại công thức. P4 cá nhân không trang bị đồng thời chase hệ thứ hai.

| Hệ | Ô 2 | Ô 6 | P3 | Chase hệ không trang bị |
|---|---|---|---|---|
| Kim | `element_luyenKimThanhKiem` | `element_kimYNgungThan` | `kim1` | `kim2` |
| Mộc | `element_lucDiepPhong` | `element_linhMocHoiSinh` | `moc1` | `moc2` |
| Thủy | `element_thuyNguyetTuLinh` | `element_thanhLuuTayTran` | `thuy1` | `thuy2` |
| Hỏa | `element_phongHoaThieuDoanh` | `element_noHoaThieuThan` | `hoa1` | `hoa2` |
| Thổ | `element_hauThoTichLuong` | `element_thachGiap` | `tho1` | `tho2` |
| Lôi | `element_loiTruGiangThe` | `element_tinhDienHoThan` | `loi1` | `loi2` |
| Phong | `element_phongQuyenTanVan` | `element_thanhPhongTuKhi` | `phong1` | `phong2` |

## Danh sách Xạ thủ

| ID | Tên dùng cho thiết kế mới | Hệ | Vũ khí | Tình trạng |
|---|---|---|---|---|
| RB-062 | Bạch Nỏ Lang | Kim | Nỏ nặng W01 | Giữ bộ ảnh đã làm |
| RB-063 | Thanh Lâm Xạ | Mộc | Cung tre W01 | Giữ bộ ảnh đã làm |
| RB-064 | Lam Giang Phi Diệp | Thủy | phi tiêu lá liễu W02 | Thay toàn bộ mô tả cung/nỏ cũ |
| RB-065 | Xích Diệm Luân | Hỏa | phi luân vành kín W02 | Thay toàn bộ mô tả cung/nỏ cũ |
| RB-066 | Trấn Sơn Thạch | Thổ | phi hoàng thạch ném tay W02 | Thay toàn bộ mô tả cung/nỏ cũ |
| RB-067 | Lôi Minh Xạ | Lôi | phi châm bản lớn W02 | Thay toàn bộ mô tả cung/nỏ cũ |
| RB-068 | Tật Phong Lăng | Phong | một dải lụa chiến W02 | Thay toàn bộ mô tả cung/nỏ cũ |

## Kim và Mộc — bảo toàn thiết kế hình ảnh

Chỉ cập nhật thuật ngữ chiêu nghề; pose, khuôn mặt, bảng màu, trang phục và Weapon W01 giữ nguyên. Dưới đây là bộ gameplay đã có được chuyển sang nguồn mới; không yêu cầu sinh lại ảnh.

### RB-062 — Bạch Nỏ Lang · Xạ thủ / Kim

**Chức năng gameplay:** Nỏ thủ phá giáp hạng nặng. **Nhịp chiến đấu:** Đầm, chắc, kiểm soát cửa hẹp; cận chiến chỉ để tạo khoảng cách rồi trở lại nỏ.

**Ngôn ngữ hình khối:** **ĐÁ NGẮN → NGẮM NGANG → QUỲ GHÌ NỎ**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Định Điểm** | `role_xaThu_dinhDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Luyện Kim Thành Kiếm** | `element_luyenKimThanhKiem` | theo registry | Biến 4 ô thành Kiếm (theo registry hiện tại) |
| 3 | **Phá Giáp** | `role_xaThu_phaGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Thiết Nỏ Phá Thành** | `rb_bnl_thietNoPhaThanh` | 95 | 2.70× ATK; xuyên 45% DEF; giảm DEF 20% trong 2 lượt; phá một hàng 4 ô (đề xuất); target=`enemy` |
| 5 | **Tập Kích** | `role_xaThu_tapKich` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Kim Ý Ngưng Thần** | `element_kimYNgungThan` | theo registry | Gây 1,3× ATK, xuyên 50% DEF (bản layout2 đã thay nội dung cũ) |

**Bốn ô bị động đề xuất Xạ thủ** (bản triển khai chưa có; thiết kế **thay thế**, không cộng thêm bị động thứ năm):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `marksmanPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Kim phá / `kim1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Nỏ thành bền bỉ** / `rb_bnl_passive` | `armorBroken`: Giảm thêm DEF mục tiêu 8% trong 1 lượt, tối đa 1 lần mỗi action (không tự kích hoạt từ lần trừ DEF bổ sung). |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Kim truy / `kim2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.



### RB-063 — Thanh Lâm Xạ · Xạ thủ / Mộc

**Chức năng gameplay:** Thợ săn khóa lối / bảo hộ người rút. **Nhịp chiến đấu:** Lấy góc lệch và địa hình tưởng tượng làm ngôn ngữ chiến thuật; không tạo status 'trói' vật lý.

**Ngôn ngữ hình khối:** **QUÉT CHÂN → NGẮM THẲNG → ÉP LỐI CHÉO THẤP**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Định Điểm** | `role_xaThu_dinhDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Lục Diệp Phong** | `element_lucDiepPhong` | theo registry | Phá ngẫu nhiên 5 ô |
| 3 | **Phá Giáp** | `role_xaThu_phaGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Lục Tiễn Trói Đường** | `rb_tlx_lucTienTroiDuong` | 90 | 1.95× ATK; giảm DEF 25% trong 2 lượt; hồi đội 6% HP tối đa (đề xuất); target=`enemy` |
| 5 | **Tập Kích** | `role_xaThu_tapKich` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Linh Mộc Hồi Sinh** | `element_linhMocHoiSinh` | theo registry | Hồi bản thân 11% HP và đổi 3 ô thành Tim |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `marksmanPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Mộc sinh / `moc1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Rễ hộ người** / `rb_tlx_passive` | `healed`: Khi một đồng minh được hồi HP thực, cấp Khiên bằng 4% HP tối đa người ấy; tối đa một lần cho mỗi action nguồn. |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Mộc hộ / `moc2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.



## Năm Xạ thủ thay thiết kế

### RB-064 — Lam Giang Phi Diệp · Xạ thủ / Thủy

**Tiểu sử hư cấu:** Trinh sát bến sông quen đọc dòng chảy và dấu thuyền. Mang phi tiêu gọn thay nỏ để di chuyển qua lối hẹp.

**Vai trò:** Trinh sát đường sông; đánh nối tiếp và cắt nhịp. Dùng vũ khí ném vật lý, không triệu hồi thủy kiếm.

**Sáu chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | Định Điểm | `role_xaThu_dinhDiem` | 30 | Theo bảng nghề ở trên |
| 2 | **Thủy Nguyệt Tụ Linh** | `element_thuyNguyetTuLinh` | theo registry | Chiêu hệ theo registry: xem steps chính thức khi triển khai |
| 3 | Phá Giáp | `role_xaThu_phaGiap` | 45 | Theo bảng nghề ở trên; diễn xuất bằng phi tiêu lá liễu |
| 4 | Liễu Diệp Tỏa Giang | `rb064_lieuDiepToaGiang` | 95 | enemy: 2.05× ATK; 35% freeze 1 lượt; trừ 15 năng lượng địch |
| 5 | Tập Kích | `role_xaThu_tapKich` | 60 | Theo bảng nghề ở trên; VFX tùy vũ khí, không biến thành mưa tên |
| 6 | **Thanh Lưu Tẩy Trần** | `element_thanhLuuTayTran` | theo registry | Chiêu hệ theo registry: xem steps chính thức khi triển khai |

**Bốn bị động**

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị xạ kích / `marksmanPreparedOpportunity` | Theo contract chuẩn bị nghề ở trên |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | armorBroken từ đồng đội → 0.40× ATK |
| P3 | Chase hành thứ nhất | Thủy tiếp / `thuy1` | Kế thừa registry hệ hiện tại |
| P4 | Cá nhân | Cảnh giới bến sông / `rb064_canhGioi` | controlled từ đồng đội → bản thân +7 năng lượng; tối đa một lần mỗi action nguồn |

**Ngôn ngữ hình ảnh:** Bước ngang, thúc gối phải thấp; tay phải thu tiêu sát hông, chân trái trụ. → Chùng hai gối, nghiêng thân, tay phải kéo ngang thấp để chuẩn bị ném lướt. → Xoay hông từ thế đứng cao, tay phải đưa lên chéo ngang vai; khác thế ném thấp.

### RB-065 — Xích Diệm Luân · Xạ thủ / Hỏa

**Tiểu sử hư cấu:** Nữ hộ vệ từng giữ kho lương qua một đêm hỏa hoạn. Tính quyết liệt được thể hiện qua vòng phóng và bước xoay chắc.

**Vai trò:** Áp lực diện rộng và đốt; chuyển động xoay tròn, mạnh và rộng.

**Sáu chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | Định Điểm | `role_xaThu_dinhDiem` | 30 | Theo bảng nghề ở trên |
| 2 | **Phóng Hỏa Thiêu Doanh** | `element_phongHoaThieuDoanh` | theo registry | Chiêu Hỏa theo registry hiện tại |
| 3 | Phá Giáp | `role_xaThu_phaGiap` | 45 | Theo bảng nghề ở trên; diễn xuất bằng phi luân vành kín |
| 4 | Xích Luân Liệt Trận | `rb065_xichLuanLietTran` | 100 | allEnemies: 1.15× ATK mỗi địch; burn 12% ATK trong 2 lượt; phá cụm 3×3 ô |
| 5 | Tập Kích | `role_xaThu_tapKich` | 60 | Theo bảng nghề ở trên; VFX tùy vũ khí, không biến thành mưa tên |
| 6 | **Nộ Hỏa Thiêu Thân** | `element_noHoaThieuThan` | theo registry | Chiêu Hỏa theo registry hiện tại |

**Bốn bị động**

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị xạ kích / `marksmanPreparedOpportunity` | Theo contract chuẩn bị nghề ở trên |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | armorBroken từ đồng đội → 0.40× ATK |
| P3 | Chase hành thứ nhất | Hỏa truy / `hoa1` | Kế thừa registry hệ hiện tại |
| P4 | Cá nhân | Hỏa cốt truy kích / `rb065_hoaCot` | armorBroken từ đồng đội → truy kích 0.35× ATK vào đúng mục tiêu; tối đa một lần mỗi action nguồn |

**Ngôn ngữ hình ảnh:** Tung cước trái thấp, vòng thu sát phía sau hông phải. → Thế chân hẹp, vòng ngang hông, tay phải đưa ra sau để chuẩn bị phóng ngang. → Chân mở rộng, thân xoay mạnh, vòng dựng trên vai phải chuẩn bị phóng chéo.

### RB-066 — Trấn Sơn Thạch · Xạ thủ / Thổ

**Tiểu sử hư cấu:** Người giữ lối đèo từng nhặt đá bảo vệ đường rút cho dân làng. Dùng phi hoàng thạch nhỏ thuôn dẹt, hai đầu vát nhọn, mang trong túi đan mây bọc da thay cho trường cung.

**Vũ khí hình ảnh:** `RB-066-W02` — một phi hoàng thạch bằng đá vàng đất mờ, dài cỡ ngón tay ngắn, thuôn dẹt, hai đầu vát nhọn, sống giữa rõ và các mặt phẳng sắc cạnh. Cầm phần giữa bằng ngón cái và ngón trỏ/giữa tay phải; lúc hạ gục đặt cạnh bàn tay phải mở. Không dùng đá tròn hoặc khối đá to. Đây là tinh chỉnh hình ảnh, không đổi kỹ năng/chỉ số.

**Vai trò:** Đòn nặng phá giáp và che tuyến; dáng trụ chắc. Không có cơ chế chậm tốc hay đẩy vị trí tự phát.

**Sáu chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | Định Điểm | `role_xaThu_dinhDiem` | 30 | Theo bảng nghề ở trên |
| 2 | **Hậu Thổ Tích Lương** | `element_hauThoTichLuong` | theo registry | Chiêu Thổ theo registry hiện tại |
| 3 | Phá Giáp | `role_xaThu_phaGiap` | 45 | Theo bảng nghề ở trên; diễn xuất bằng đá ném trực tiếp |
| 4 | Trấn Sơn Hộ Trận | `rb066_tranSonHoTran` | 95 | enemy: 1.55× ATK và ATK -20% trong 2 lượt; allies: Khiên 10% HP tối đa của từng người trong 2 lượt; tách hai nhóm mục tiêu khi triển khai |
| 5 | Tập Kích | `role_xaThu_tapKich` | 60 | Theo bảng nghề ở trên; VFX tùy vũ khí, không biến thành mưa tên |
| 6 | **Thạch Giáp** | `element_thachGiap` | theo registry | Chiêu Thổ theo registry hiện tại |

**Bốn bị động**

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị xạ kích / `marksmanPreparedOpportunity` | Theo contract chuẩn bị nghề ở trên |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | armorBroken từ đồng đội → 0.40× ATK |
| P3 | Chase hành thứ nhất | Thổ hộ / `tho1` | Kế thừa registry hệ hiện tại |
| P4 | Cá nhân | Sơn trấn kiên thủ / `rb066_kienThu` | shieldAbsorbed của đồng minh → phản kích 0.30× ATK vào kẻ gây sát thương nếu còn hợp lệ; tối đa một lần mỗi action nguồn |

**Ngôn ngữ hình ảnh:** Bước chân trái tới, đấm tay trái trống; tay phải giữ đá thu về. → Chùng gối, tay phải vung về sau ngang thấp chuẩn bị ném. → Đứng lên hết tầm, chân trái bước trụ sâu, đá ở tay phải trên vai chuẩn bị ném mạnh.

### RB-067 — Lôi Minh Xạ · Xạ thủ / Lôi

**Tiểu sử hư cấu:** Người truyền tin miền núi chọn châm phóng gọn để bảo vệ quân lệnh; chiếc chuông cũ vẫn là dấu nhận diện.

**Vai trò:** Chính xác, ngắt nhịp qua tước năng lượng và câm lặng; không khẳng định có interrupt tức thời.

**Sáu chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | Định Điểm | `role_xaThu_dinhDiem` | 30 | Theo bảng nghề ở trên |
| 2 | **Lôi Trụ Giáng Thế** | `element_loiTruGiangThe` | theo registry | Chiêu Lôi theo registry hiện tại |
| 3 | Phá Giáp | `role_xaThu_phaGiap` | 45 | Theo bảng nghề ở trên; diễn xuất bằng phi châm bản lớn |
| 4 | Lôi Châm Tước Khí | `rb067_loiChamTuocKhi` | 100 | enemy: 2.10× ATK; trừ 35 năng lượng; 35% silence 1 lượt |
| 5 | Tập Kích | `role_xaThu_tapKich` | 60 | Theo bảng nghề ở trên; VFX tùy vũ khí, không biến thành mưa tên |
| 6 | **Tĩnh Điện Hộ Thân** | `element_tinhDienHoThan` | theo registry | Trừ địch 20 năng lượng, hoàn bản thân 10 năng lượng (layout2) |

**Bốn bị động**

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị xạ kích / `marksmanPreparedOpportunity` | Theo contract chuẩn bị nghề ở trên |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | armorBroken từ đồng đội → 0.40× ATK |
| P3 | Chase hành thứ nhất | Lôi truy / `loi1` | Kế thừa registry hệ hiện tại |
| P4 | Cá nhân | Chớp thời cơ / `rb067_chopThoiCo` | skillDamage của kỹ năng chủ động bản thân gây mất HP thật → địch mất thêm 5 năng lượng; loại DoT và phản ứng; tối đa một lần mỗi action nguồn |

**Ngôn ngữ hình ảnh:** Bước chéo gạt tay trái, châm thu thấp ở tay phải. → Hai chân đứng chắc, châm đưa ngang cạnh má phải, chuẩn bị phóng chính xác. → Chùng người bước chéo sâu, tay phải kéo châm cao qua vai sau, tay trái mở thấp.

### RB-068 — Tật Phong Lăng · Xạ thủ / Phong

**Tiểu sử hư cấu:** Nữ kỵ trạm dùng lụa hiệu để truyền tín hiệu qua đèo gió; trong chất low fantasy, lụa chiến có thể vươn ra nhờ thuật Phong hạn chế. Đây là hư cấu, không phải trang bị lịch sử đã xác nhận.

**Vai trò:** Quấy nhiễu và hỗ trợ bằng giảm ATK, xoay ô. Không thêm trói, né, kéo vị trí hay giảm chính xác khi chưa có contract.

**Sáu chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | Định Điểm | `role_xaThu_dinhDiem` | 30 | Theo bảng nghề ở trên |
| 2 | **Phong Quyển Tàn Vân** | `element_phongQuyenTanVan` | theo registry | Chiêu Phong theo registry hiện tại |
| 3 | Phá Giáp | `role_xaThu_phaGiap` | 45 | Theo bảng nghề ở trên; diễn xuất bằng một dải lụa chiến |
| 4 | Phong Lăng Nhiễu Trận | `rb068_phongLangNhieuTran` | 95 | allEnemies: 0.85× ATK mỗi địch và ATK -15% trong 2 lượt; whirl 2 ô tự động; không cấp thêm lượt ngoài luật cascade hiện hành |
| 5 | Tập Kích | `role_xaThu_tapKich` | 60 | Theo bảng nghề ở trên; VFX tùy vũ khí, không biến thành mưa tên |
| 6 | **Thanh Phong Tụ Khí** | `element_thanhPhongTuKhi` | theo registry | Cả đội +10 năng lượng và +10% DEF trong 2 lượt (layout2) |

**Bốn bị động**

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị xạ kích / `marksmanPreparedOpportunity` | Theo contract chuẩn bị nghề ở trên |
| P2 | Chase nghề | Tiếp xạ / `marksmanPrepared` | armorBroken từ đồng đội → 0.40× ATK |
| P3 | Chase hành thứ nhất | Phong tiếp / `phong1` | Kế thừa registry hệ hiện tại |
| P4 | Cá nhân | Thuận gió hồi nhịp / `rb068_hoiNhip` | dispelled khi đồng đội xua tan buff của địch thành công → bản thân +6 năng lượng; tối đa một lần mỗi action nguồn |

**Ngôn ngữ hình ảnh:** Đá quét thấp, tay phải gom lụa thành nếp gọn cạnh hông; tay trái cân bằng. → Bước chân phải tới, tay phải quét ngang hông; lụa tạo một đường cong mở bên phải. → Bước xoay rộng, tay phải nâng cao; lụa tạo một cung lớn phía trên và bên phải.

## Giới hạn và bàn giao triển khai

- Mọi phản ứng xác định đúng nguồn/đích, không kích từ chính phản ứng của mình. Giữ `CHASE_LIMITS.maxReactions=12`, `maxDepth=4`; P2/P4 cùng trigger phải kiểm tra cộng dồn, không tự coi mỗi hit là action mới.
- Chặn hoàn năng lượng lặp; không bù năng lượng cho action không tạo hiệu ứng thật. Không tăng stun, né hoặc tốc độ khi chưa thiết kế và mô phỏng.
- Phá ô/cascade theo luật hiện hành; mỗi vùng phá chỉ chạy một lần, không nhân theo số địch. Khiên của Thổ đặt mục tiêu đồng minh riêng, không truyền nhầm target enemy vào mọi step.
- Tài liệu này chưa đổi runtime. Trước build cần kiểm tra `rules.ts`, `roster.ts`, `skills.ts`, `chase.ts`, AI, combo, tile nghề, UI và dữ liệu lưu. Giữ RB ID; nếu phát hiện `cungThu` trong dữ liệu đã lưu phải có mapping sang `xaThu`, không đổi ngầm.
- Mô phỏng 1v1/3v3, boss và tháp: chuỗi phá giáp, hoàn năng lượng, khóa năng lượng/câm lặng, Khiên, phá ô và giới hạn phản ứng. Chưa có kết quả mô phỏng cho bộ này.
- QA hình: sáu khung/nhân vật, ba silhouette Basic/Skill/Ultimate khác nhau ở 128px; đúng tay, số vật thể, trang phục, màu. Prompt không bảo đảm ảnh sinh đúng; duyệt ảnh thực tế trước nhân rộng. Không lấy lỗi hoặc từ chối tạo ảnh làm bằng chứng nội dung bị cấm.

## Sát thủ — bộ đa vũ khí

> Cập nhật: 30/10/2026
> Trạng thái: **DRAFT** — người dùng chốt bảy loại vũ khí và Phong dùng sáo âm công; phân bổ sáu hệ còn lại, tên chiêu và hệ số là đề xuất sản xuất cần review/mô phỏng. Thay toàn bộ hồ sơ Sát thủ cũ tại chính file này, không giữ bản song song.

### Bản sắc và phạm vi

Sát thủ khai thác sơ hở để gây áp lực đơn mục tiêu, mạnh khi đồng đội tạo khống chế hoặc phá giáp; ít đánh diện, không thay vai trò duy trì sát thương của Xạ thủ. Không đồng nhất nghề với dao ngắn, che mặt hoặc đồ đen. Giữ đủ 6 chủ động + 4 bị động. Cận/viễn, lách người, đổi vị trí là ngôn ngữ hình ảnh; chưa tự thêm tàng hình, teleport, né, hàng sau, vật lý đường đạn hoặc mục tiêu theo vị trí.

Bảy nhân vật là hư cấu. Bạo Vũ Lê Hoa Châm, lưỡi dao ẩn và âm công là diễn giải mỹ thuật kỳ ảo cho game, không khẳng định là vũ khí Việt Nam thế kỷ X. Hộp phóng chỉ mô tả vỏ ngoài kín; không có sơ đồ cấu tạo hoặc thao tác vận hành. Kim châm độc không có mô tả chất độc, pha chế hoặc tẩm kim. Độc và nội lực là cơ chế hư cấu.

Giữ RB-069–075; đổi Weapon ID sang W02 để phân biệt prompt W01 ngừng dùng. Không sửa ảnh có sẵn hoặc mã save. Tên nhân vật giữ nguyên kể cả Bạch Phong Đao dùng dao găm; tên riêng không bắt buộc nhân vật cầm trường đao. Sáo là nhạc cụ duy nhất của Phong, không thêm đàn.

| ID | Nhân vật | Hệ | Vũ khí W02 | Nhịp hình ảnh |
|---|---|---|---|---|
| RB-069 | Bạch Phong Đao | Kim | Dao găm | Kỷ luật, một nhịp chính xác; khai thác phá giáp. |
| RB-070 | Độc Ảnh | Mộc | Kim châm độc | Kín đáo, chính xác; bào mòn theo thời gian thay vì đợt phóng dồn dập. |
| RB-071 | Hàn Giang Khách | Thủy | Lưỡi dao ẩn | Lách người, phản ứng bất ngờ bằng cẳng tay; khác rõ dao cầm tay và phi tiêu. |
| RB-072 | Xích Dạ | Hỏa | Song đao | Mở thế bằng hai đường đao, bộc phát rồi kết liễu; không sao chép kiểu đâm kín. |
| RB-073 | Địa Ẩn | Thổ | Móng vuốt | Trụ thấp, vồ ngắn, ghìm nhịp; trọng lượng cơ thể tạo sức nặng thay vì nhào lộn. |
| RB-074 | Lôi Ảnh | Lôi | Bạo Vũ Lê Hoa Châm | Đợt bộc phát đơn mục tiêu; hộp phóng kín khác kim châm dùng tay của Mộc và Lôi Xạ thủ. |
| RB-075 | Vô Ảnh | Phong | Sáo trúc âm công | Bình thản, sát thương nội lực tập trung; tước năng lượng và câm lặng, không là nhạc công buff diện rộng. |

### Ba kỹ năng nghề dùng chung

Đổi hai tên chiêu nghề để phù hợp cả dao, trảo, hộp châm và âm công. Các mã dưới đây là đề xuất thay thế cho bộ cũ; không đăng ký hai bộ đồng thời.

| Ô | Chiêu / ID đề xuất | Cost | Target | Hiệu ứng điểm xuất phát |
|---|---|---:|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | 30 | enemy | 1.65× ATK; bản thân +5 năng lượng một lần khi đòn gây mất HP thật |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | 45 | enemy | 1.90× ATK, xuyên 20% DEF; địch -10 năng lượng một lần |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | 65 | enemy | 2.35× ATK; nếu HP mục tiêu trước hit ≤35% HP tối đa, hệ số ×1.30; không tự kết liễu |

Ô 2/6 dùng đúng hai kỹ năng hệ trong bảng hệ phía trên. Không dùng “Lướt Sát” hoặc “Cắt Mạch” làm nguồn hiện hành; ngừng dùng `role_satThu_luotSat`/`role_satThu_catMach` trong proposal này. Khung 3 minh họa Đoạt Khí; khung 4 là tuyệt chiêu cá nhân. Đòn thường có thể là tay/chân, không bắt ảnh nào cũng dùng vũ khí.

### Đúng bốn bị động

P1 `assassinPreparedOpportunity`: ô cơ hội chuẩn bị theo contract nghề khi triển khai, không phải một chase độc lập. P2 `assassinPrepared`: khi đồng đội gây `controlled` thành công, phản ứng 0.45× ATK vào đúng mục tiêu; tối đa một lần/action nguồn. P3 là chase hệ thứ nhất; P4 cá nhân **thay** chase hệ thứ hai. Không trang bị cả hai chase hệ rồi cộng P4 thành ô thứ năm; `comboPassive` là hệ thống khác.

Tất cả P4 tối đa một lần/action nguồn. Không kích lại từ chính P2/P4, DoT hoặc phản ứng thứ cấp của bản thân; giữ tổng `CHASE_LIMITS.maxReactions=12`, `maxDepth=4`. Guard phải khóa theo nguồn/action, không theo từng hit của Bạo Vũ hoặc Song Sát. Tín hiệu không tạo hiệu ứng thật không được hồi năng lượng.

### Độc của Mộc — contract đề xuất, chưa có runtime

Đề xuất status `poison` riêng; không đổi nhãn `burn` để giả làm độc. Nấc đầu: mỗi nguồn tối đa một stack trên một mục tiêu, toàn mục tiêu tối đa hai nguồn độc khác nhau; áp lại từ cùng nguồn chỉ làm mới thời hạn, không tick ngay. Lưu ATK nguồn lúc áp; tick 0.12× ATK đó, bỏ qua DEF, không crit/chase/hồi năng lượng. Mỗi stack có hai tick, ở cuối lượt phe của mục tiêu (bao gồm lượt thêm nếu engine xác định là lượt phe hoàn chỉnh), sau khi xử lý action/cascade; không tick cho từng lần cast trong một lượt. Đồng minh giải debuff có thể gỡ độc, buff dispel địch không gỡ. Tick xảy ra trước khi giảm số tick còn lại; xóa khi hết hoặc khi mục tiêu chết. Không có giảm hồi máu hay lan độc trong bản đầu.

> TODO: Kiểm tra hook cuối lượt, Khiên và giải debuff trong engine; chốt việc độc tương tác Khiên theo contract hiệu ứng hiện hành trước khi implement. Thông số/cap phải mô phỏng, tuyệt đối không suy ra là đã hoạt động. Xem [câu hỏi còn mở](../../../09-roadmap/cau-hoi-mo.md).

### Hồ sơ và mười kỹ năng từng người

#### RB-069 — Bạch Phong Đao · Sát thủ / Kim

**Tiểu sử hư cấu:** Nữ cận vệ giữ nửa ấn đồng làm kỷ vật; kiệm động tác, quan sát trước khi hành động.

**Vai trò:** Kỷ luật, một nhịp chính xác; khai thác phá giáp.

**Vũ khí:** `RB-069-W02` — Dao găm. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Nửa ấn đồng ở hông trái; bao dao hông phải.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Luyện Kim Thành Kiếm | `element_luyenKimThanhKiem` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Thiết Ấn Đoạt Mệnh | `rb069_ultimate` | 95 | enemy; 2.55× ATK, xuyên 35% DEF, DEF -15% trong 2 lượt |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Kim Ý Ngưng Thần | `element_kimYNgungThan` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `kim1` | Theo registry hệ |
| P4 | Cá nhân | Ấn khuyết quyết tâm / `rb069_passive` | armorBroken do đồng đội → truy kích đúng mục tiêu 0.25× ATK; tuân thủ guard chung |

Chase hệ thứ hai `kim2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Bước nửa nhịp, thúc chỏ trái, tay phải thu dao sát sườn. → Chùng gối bước chéo, đưa dao ngang thấp trước người. → Đứng cao xoay vai, dao găm kéo về cạnh vai phải chuẩn bị đòn dứt khoát.

#### RB-070 — Độc Ảnh · Sát thủ / Mộc

**Tiểu sử hư cấu:** Trinh sát rừng trầm lặng mang một lọ thảo mộc; hộp kim nhỏ là dấu nghề, không biến thành bộ phóng cơ khí.

**Vai trò:** Kín đáo, chính xác; bào mòn theo thời gian thay vì đợt phóng dồn dập.

**Vũ khí:** `RB-070-W02` — Kim châm độc. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Một hộp kim tre kín ở hông trái; lọ thảo mộc đóng kín sau đai.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Lục Diệp Phong | `element_lucDiepPhong` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Độc Ảnh Tiềm Châm | `rb070_ultimate` | 90 | enemy; 1.65× ATK, áp dụng poison theo contract đề xuất bên dưới |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Linh Mộc Hồi Sinh | `element_linhMocHoiSinh` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `moc1` | Theo registry hệ |
| P4 | Cá nhân | Lâm ảnh tiếp nhịp / `rb070_passive` | controlled do đồng đội → bản thân +6 năng lượng; tuân thủ guard chung |

Chase hệ thứ hai `moc2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Lách vai, đá gạt chân phải thấp, kim thu sát hông. → Hạ thấp người, đưa kim ngang eo, chuẩn bị động tác tay ngắn. → Bước ngang rộng, tay phải đưa kim lên cạnh vai, thân xoay nhìn mục tiêu ngoài ảnh.

#### RB-071 — Hàn Giang Khách · Sát thủ / Thủy

**Tiểu sử hư cấu:** Khách giang hồ ven sông giấu thân phận sau vẻ mệt mỏi; một lưỡi ẩn cố định trên cẳng tay phải, không đổi tay giữa các khung.

**Vai trò:** Lách người, phản ứng bất ngờ bằng cẳng tay; khác rõ dao cầm tay và phi tiêu.

**Vũ khí:** `RB-071-W02` — Lưỡi dao ẩn. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Một vỏ sò bên tai trái, mặt dây vỏ sò phẳng giữa ngực; sẹo cổ tay trái.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Thủy Nguyệt Tụ Linh | `element_thuyNguyetTuLinh` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Hàn Giang Tàng Nhận | `rb071_ultimate` | 95 | enemy; 2.10× ATK, trừ 20 năng lượng, ATK -15% trong 2 lượt |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Thanh Lưu Tẩy Trần | `element_thanhLuuTayTran` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `thuy1` | Theo registry hệ |
| P4 | Cá nhân | Tĩnh thủy hồi tức / `rb071_passive` | controlled do đồng đội → bản thân +5 năng lượng; tuân thủ guard chung |

Chase hệ thứ hai `thuy2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Bước né, gạt lòng bàn tay trái, lưỡi ẩn vẫn thu. → Chân trụ hẹp, cẳng tay phải đưa ngang trước thân, một lưỡi ẩn đã mở thẳng. → Nửa quỳ thấp xoay vai, cẳng tay phải kéo chéo cao rồi hướng ra trước.

#### RB-072 — Xích Dạ · Sát thủ / Hỏa

**Tiểu sử hư cấu:** Kẻ đột kích đêm mang dấu vải cháy xém; hai đao đối xứng về thiết kế nhưng động tác hai tay không đối xứng.

**Vai trò:** Mở thế bằng hai đường đao, bộc phát rồi kết liễu; không sao chép kiểu đâm kín.

**Vũ khí:** `RB-072-W02` — Song đao. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Dấu vải cháy xém cố định trên vai trái; hai bao đao sau đai.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Phóng Hỏa Thiêu Doanh | `element_phongHoaThieuDoanh` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Xích Dạ Song Sát | `rb072_ultimate` | 100 | enemy; hai hit 1.15× ATK; chỉ hit cuối có execute khi HP trước hit cuối ≤35%, multiplier 1.30 |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Nộ Hỏa Thiêu Thân | `element_noHoaThieuThan` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `hoa1` | Theo registry hệ |
| P4 | Cá nhân | Dạ tập thừa hư / `rb072_passive` | controlled do đồng đội → truy kích 0.30× ATK vào đúng mục tiêu; tuân thủ guard chung |

Chase hệ thứ hai `hoa2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Thúc gối trái thấp, hai đao thu ra ngoài thân. → Bước chéo ngắn, đao phải ngang eo, đao trái dựng cạnh vai. → Chân mở rộng, thân xoay mạnh, hai đao tách cao–thấp thành hai hướng.

#### RB-073 — Địa Ẩn · Sát thủ / Thổ

**Tiểu sử hư cấu:** Trinh sát công sự quen bám đường đá; bộ trảo trên mu tay gợi hình thú săn phục kích, vẫn là người bình thường.

**Vai trò:** Trụ thấp, vồ ngắn, ghìm nhịp; trọng lượng cơ thể tạo sức nặng thay vì nhào lộn.

**Vũ khí:** `RB-073-W02` — Móng vuốt. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Thẻ đất nung nhỏ ở giữa đai, không thêm đá ném hoặc rìu.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Hậu Thổ Tích Lương | `element_hauThoTichLuong` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Địa Phục Liệt Trảo | `rb073_ultimate` | 95 | enemy; 2.05× ATK, DEF -20% trong 2 lượt, bản thân DEF +15% trong 2 lượt; tách target self và enemy |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Thạch Giáp | `element_thachGiap` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `tho1` | Theo registry hệ |
| P4 | Cá nhân | Phục địa phản kích / `rb073_passive` | shieldAbsorbed thực sự của bản thân → phản kích kẻ gây sát thương 0.30× ATK nếu còn hợp lệ; tuân thủ guard chung |

Chase hệ thứ hai `tho2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Bước chân trái và thúc chỏ phải; tay trái mở làm đối trọng. → Chùng sâu, tay trái thấp, tay phải trảo ngang trước người. → Vươn người từ chân trụ rộng, hai tay trảo mở chéo cao–thấp.

#### RB-074 — Lôi Ảnh · Sát thủ / Lôi

**Tiểu sử hư cấu:** Nữ truyền tin đột kích giữ phù hiệu đồng nứt trước ngực; mang một hộp ám khí hư cấu đóng kín, không mang nỏ.

**Vai trò:** Đợt bộc phát đơn mục tiêu; hộp phóng kín khác kim châm dùng tay của Mộc và Lôi Xạ thủ.

**Vũ khí:** `RB-074-W02` — Bạo Vũ Lê Hoa Châm. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Phù hiệu đồng nứt cố định trước ngực; bao hộp kín ở hông phải.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Lôi Trụ Giáng Thế | `element_loiTruGiangThe` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Bạo Vũ Lê Hoa | `rb074_ultimate` | 100 | enemy; ba hit 0.75× ATK, trừ 20 năng lượng đúng một lần sau chuỗi, không gọi chase/hoàn năng lượng ba lần |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Tĩnh Điện Hộ Thân | `element_tinhDienHoThan` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `loi1` | Theo registry hệ |
| P4 | Cá nhân | Tàn vũ hồi nhịp / `rb074_passive` | skillDamage của kỹ năng chủ động bản thân mất HP thật → bản thân +4 năng lượng; loại phản ứng và DoT; tuân thủ guard chung |

Chase hệ thứ hai `loi2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Bước lùi ngắn và gạt tay trái, hộp giữ sát hông phải. → Chân trụ hẹp, tay phải đưa hộp ngang ngực, tay trái đỡ cẳng tay phải. → Hạ một gối, thân nghiêng, tay phải nâng hộp chéo cao, tay trái cân bằng.

#### RB-075 — Vô Ảnh · Sát thủ / Phong

**Tiểu sử hư cấu:** Nữ nhạc công lang bạt từng làm liên lạc, giữ chiếc vòng sợi lau ở đai; vẻ thư thái che giấu âm công sắc và ngắn.

**Vai trò:** Bình thản, sát thương nội lực tập trung; tước năng lượng và câm lặng, không là nhạc công buff diện rộng.

**Vũ khí:** `RB-075-W02` — Sáo trúc âm công. Khóa hình học và sáu prompt ở [nguồn hình ảnh](./09-14-heroes-character-and-frame-prompts-v4-3.md). **Phụ kiện:** Vòng sợi lau cố định bên đai; không thêm đàn, dao hoặc sáo thứ hai.

| Ô | Chiêu | ID đề xuất | Cost | Target / hiệu ứng |
|---|---|---|---:|---|
| 1 | Thừa Hư | `role_satThu_thuaHu` | 30 | Theo bảng nghề |
| 2 | Phong Quyển Tàn Vân | `element_phongQuyenTanVan` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |
| 3 | Đoạt Khí | `role_satThu_doatKhi` | 45 | Theo bảng nghề |
| 4 | Vô Thanh Đoạt Phách | `rb075_ultimate` | 100 | enemy; 2.10× ATK, trừ 25 năng lượng, 35% silence 1 lượt; âm công nội lực là hư cấu |
| 5 | Truy Mệnh | `role_satThu_truyMenh` | 65 | Theo bảng nghề |
| 6 | Thanh Phong Tụ Khí | `element_thanhPhongTuKhi` | theo registry | Giữ nội dung kỹ năng hệ hiện hành |

| Ô | Nguồn | Tên / ID | Trigger / tác dụng đề xuất |
|---|---|---|---|
| P1 | Cơ hội nghề | Chuẩn bị tập kích / `assassinPreparedOpportunity` | Contract chuẩn bị nghề, không phải chase riêng |
| P2 | Chase nghề | Thừa hư tập kích / `assassinPrepared` | controlled từ đồng đội → 0.45× ATK |
| P3 | Chase hệ thứ nhất | `phong1` | Theo registry hệ |
| P4 | Cá nhân | Dư âm tiếp vận / `rb075_passive` | dispelled khi đồng đội xua tan buff địch thành công → bản thân +6 năng lượng; tuân thủ guard chung |

Chase hệ thứ hai `phong2` không trang bị trong phương án này. **Ba nhịp diễn xuất:** Bước nghiêng thúc chỏ trái, tay phải giữ sáo thấp cách thân. → Đứng nghiêng trụ hẹp, hai tay nâng sáo ngang môi, ánh mắt tập trung. → Hạ trọng tâm bước xoay rộng, thân nghiêng, hai tay vẫn giữ sáo ngang môi.

### Bàn giao và kiểm định

- Chưa thêm nghề vào trận: registry mở rộng đang có `satThu`, nhưng cần đối chiếu rules, roster, skills, chase, AI, combo, tile, UI và save. Không báo thiết kế như chức năng đã code.
- Giữ bảy Xạ thủ, Kim/Mộc đã làm, phi hoàng thạch và khung tung hứng Trấn Sơn Thạch. Không sửa các nhóm nhân vật khác.
- Phong gây sát thương bằng âm công nội lực hư cấu, không đập sáo hoặc biến sáo thành dao. Câm lặng/tước năng lượng là hướng cơ chế; sóng âm dựng riêng bằng VFX. Chưa có interrupt giữa một action đang giải quyết.
- Mô phỏng đối chiếu 1v1/3v3 và PvE: độc/cap/tick/giải debuff, nhiều hit và giới hạn phản ứng, execute, tước năng lượng/câm lặng, phòng thủ Thổ. Không chốt chỉ số trước kết quả.
- Duyệt Master từng người trước tạo năm khung tiếp; đặc biệt lưỡi ẩn không xuyên tay, hai đao không hợp nhất, trảo đúng ba móng mỗi bên, hộp châm không biến thành súng/nỏ, sáo không biến thành kiếm. Chưa tạo hoặc nghiệm thu ảnh cho bộ này.
