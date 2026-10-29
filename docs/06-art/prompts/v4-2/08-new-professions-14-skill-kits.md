# Reed Banner — Hệ nhân vật Xạ thủ và hồ sơ Sát thủ chờ trao đổi

> Cập nhật: 30/10/2026
> Trạng thái: **DRAFT** — đã chốt hướng nghề Xạ thủ và năm loại vũ khí; tên mới, bộ chiêu và thông số bên dưới là thiết kế để review, chưa triển khai. Sát thủ giữ nguyên và chờ trao đổi riêng.

## Phạm vi và nguồn chính

Đây là nguồn chính cho thiết kế nghề Xạ thủ RB-062–068. [Bộ prompt](./09-14-heroes-character-and-frame-prompts-v4-3.md) chỉ diễn giải hình ảnh từ thiết kế này. Bộ kỹ năng đang chạy vẫn theo [nguồn runtime](../../../03-characters/ky-nang/README.md); không coi tài liệu này là thay đổi code.

- Giữ nguyên hai bộ ảnh Kim/Mộc đã hoàn thành: RB-062 Bạch Nỏ Lang và RB-063 Thanh Lâm Xạ. Đổi nhãn nghề thành Xạ thủ; không yêu cầu tạo lại hình.
- Năm hệ Thủy/Hỏa/Thổ/Lôi/Phong thay vũ khí và toàn bộ sáu prompt cũ. Không tạo lại cung/nỏ cho năm người này.
- Giữ ID RB-062–068. Năm vũ khí thay đổi dùng `RB-064-W02`…`RB-068-W02`; mã W01 của năm người này ngừng dùng. Kim/Mộc tiếp tục W01.
- Sát thủ RB-069–075: giữ nguyên nội dung cũ để trao đổi; chưa chốt định hướng, không dùng làm lệnh triển khai, không tự đổi vũ khí hay kỹ năng.
- Không đổi lịch sử, tài sản ảnh, roster hay ID save game. Các nhân vật mới trong bộ này là hư cấu.

## Bản sắc nghề và ranh giới gameplay

Xạ thủ tạo áp lực từ xa qua vật phóng hoặc vật dẫn. Cung, nỏ, phi tiêu, phi luân, đá, phi châm và lụa chiến đều thuộc cùng nghề; không bắt mọi chiêu phải có tên “tiễn”. Đánh thường được dùng tay/chân để mở khoảng cách trên sprite. Game match-3 không tự có tọa độ, tầm bắn, đạn hữu hạn hoặc vật lý đường đạn chỉ vì hình vẽ mô tả như vậy.

Thủy = chuỗi đòn thấp, linh hoạt; Hỏa = xoay rộng và đốt; Thổ = trụ nặng, phá giáp và che tuyến; Lôi = động tác ngắn, tước năng lượng; Phong = đường lụa rộng, giảm ATK và hỗ trợ. Thủy/Lôi không trùng nhau: phi tiêu là lưỡi lá dẹt, phi châm là thanh kim loại thẳng đuôi vuông. Sát thủ chưa được tái thiết kế nên chỉ xác định ranh giới sản xuất: Xạ thủ không đổi thành nhân vật song đao áp sát.

Các ý tưởng làm chậm, đánh dấu, giảm chính xác, ngắt chiêu tức thời và trói chỉ là hình tượng ban đầu, không thêm trạng thái mới trong bản này. Tên chiêu không chứng minh engine hỗ trợ hiệu ứng đó.

## Kiến trúc 6 chủ động + 4 bị động

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

## Sát thủ — giữ bản cũ để trao đổi, chưa duyệt lại

Theo yêu cầu 30/10/2026, chưa tái thiết kế hoặc triển khai Sát thủ trong đợt này. Các hồ sơ dưới đây được giữ nguyên văn để làm đầu vào trao đổi, không có nghĩa đã chốt. Bảng nghề Sát thủ và hệ dùng chung sau đây giữ nguyên từ tài liệu trước.

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
| Thủy | **Thủy Nguyệt Tụ Linh** (`element_thuyNguyetTuLinh`) | **Thanh Lưu Tẩy Trần** (`element_thanhLuuTayTran`) | `thuy1`, `thuy2` |
| Hỏa | **Phóng Hỏa Thiêu Doanh** (`element_phongHoaThieuDoanh`) | **Nộ Hỏa Thiêu Thân** (`element_noHoaThieuThan`) | `hoa1`, `hoa2` |
| Thổ | **Hậu Thổ Tích Lương** (`element_hauThoTichLuong`) | **Thạch Giáp** (`element_thachGiap`) | `tho1`, `tho2` |
| Lôi | **Lôi Trụ Giáng Thế** (`element_loiTruGiangThe`) | **Tĩnh Điện Hộ Thân** (`element_tinhDienHoThan`) | `loi1`, `loi2` |
| Phong | **Phong Quyển Tàn Vân** (`element_phongQuyenTanVan`) | **Thanh Phong Tụ Khí** (`element_thanhPhongTuKhi`) | `phong1`, `phong2` |

> Những mô tả hiệu ứng hệ đầy đủ phải lấy từ registry khi triển khai; không tự viết lại hành làm thay đổi kỹ năng. Vì mỗi nhân vật đã có 2 chiêu hệ này, chỉ cần thiết kế **tuyệt chiêu riêng** mới tại ô 4.

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
| 2 | **Thủy Nguyệt Tụ Linh** | `element_thuyNguyetTuLinh` | Chiêu hệ theo registry: xem steps chính thức khi triển khai |
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
| 2 | **Phóng Hỏa Thiêu Doanh** | `element_phongHoaThieuDoanh` | Chiêu Hỏa theo registry hiện tại |
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

