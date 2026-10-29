# Reed Banner — 14 bộ chiêu Cung thủ & Sát thủ (Design Freeze Candidate)

> **Ngày:** 24/10/2026 · **Trạng thái:** đặc tả đề xuất, chưa thêm vào `src/core/battle/skills.ts`, `chase.ts`, `roster.ts` hay giao diện.
> **Phạm vi:** 7 Cung thủ + 7 Sát thủ × **6 chủ động + 4 bị động** = 140 mục kỹ năng theo phân bổ nhân vật. Nhiều kỹ năng dùng chung nghề/hành được tái sử dụng; không phải 140 mã kỹ năng độc lập.

## Kiến trúc và ràng buộc tương thích

- **Chủ động:** ô 1/3/5 là chiêu nghề, ô 2/6 là chiêu hệ đã có (tái dùng `ELEMENT_SKILLS`), ô 4 là tuyệt chiêu cá nhân mới. Mỗi tướng đúng sáu ô.
- **Bị động (V4.5 riêng Cung thủ):** Giữ tổng cộng **4 ô** = 1 cơ hội nghề + 3 chase (1 chase nghề, 1 chase hệ, 1 chase cá nhân). Đề xuất **thay chase hệ thứ hai bằng chase cá nhân**, không tạo ô thứ năm. Engine hiện tại có 1 cơ hội nghề + 3 chase (nghề + 2 hệ), chưa có role `cungThu`; khi triển khai phải đăng ký nghề và ánh xạ thay thế. **Sát thủ:** giữ nguyên đặc tả trước đây, chưa thay cơ chế, cần QA riêng trước build.
- **Combo đồng đội:** lớp `comboPassive` hiện có là hệ thống khác; không cộng nhầm thành bị động thứ năm. Hai nghề mới chưa có mapping combo, tile nghề, base stats, AI và UI.
- **Giá trị:** hệ số ATK, hồi và năng lượng trong tài liệu là *điểm xuất phát để mô phỏng*, không phải giá trị đã cân bằng hay đã triển khai. Dùng các loại step có trong `SkillStep` như `damage/effect/heal/energy/destroy/transform/whirl`; tránh trạng thái 'độc', 'tàng hình', 'trói' chưa được định nghĩa.
- **Phản ứng:** chỉ dùng tín hiệu `armorBroken/controlled/dispelled/skillDamage/healed/shieldAbsorbed`; phải áp dụng giới hạn `CHASE_LIMITS.maxReactions=12, maxDepth=4`, có guard chống phản ứng tự lặp.
- **Art:** hiệu ứng lửa, băng, sét, xoáy và ảo ảnh do engine hiển thị; vũ khí chính là asset bất biến. 6 khung: Master/Idle, đánh thường, ra chiêu, tuyệt chiêu, hạ gục, cá tính.

## 3 chiêu nghề dùng chung mỗi nghề (ô 1 / 3 / 5)

### Cung thủ

> Chiêu nghề Cung thủ được mô tả chuẩn tại phần **Cung thủ V4.5** bên dưới. Slot 1/3/5 dùng chung, nhưng tư thế diễn xuất riêng cho từng nhân vật. Không tạo trạng thái `mark normal` nếu engine chưa có bước tương ứng.


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

## 14 bộ kỹ năng theo từng nhân vật

## Cung thủ V4.5 — chiến đấu cận/viễn và ngôn ngữ hành động

> **Thay đổi thiết kế 29/10/2026:** Chỉ cập nhật **7 Cung thủ RB-062–068**, giữ nguyên mã/định danh nghề, kỹ năng hệ và 7 Sát thủ. Mọi thông số dưới đây là **proposal cân bằng**, không đồng nghĩa đã triển khai trong runtime.

**Gameplay vs. hình ảnh:** Đòn đánh thường có thể được *minh họa* bằng đá tống, thúc gối, gạt cẳng tay, đẩy tay, quét chân hoặc thân nỏ che chắn. Đây là **biến thể animation/sprite của một đòn đánh thường**, không có nghĩa engine đang có tầm đánh cận chiến, hệ vật lý hoặc phân loại sát thương mới. Nếu sau này lập trình cơ chế cận/viễn, phải bổ sung luật riêng; không suy ra từ prompt ảnh.

**Quy tắc ba nhịp bắt buộc:** Frame 2 — đánh thường **phản xạ/giữ khoảng cách** (được phép không bắn); Frame 3 — **Khoan Giáp Tiễn, nghề ô 3** (một phát bắn chính xác); Frame 4 — **tuyệt chiêu cá nhân ô 4** (thế tổng thể khác biệt: quỳ ghì, chặn lối, khóa điểm neo, hiệu lệnh loạt tên, trấn tuyến, cắt tín hiệu, hoặc lùi đổi góc).

**Giữ vũ khí nguyên vẹn:** Chỉ một cung/nỏ canonical và bộ tên hoặc hộp tên đã mô tả; khi đánh thường không bắn, vũ khí được ôm, giữ sát người hoặc giữ ở tay, **không tự mọc dây đeo mới**. Chốt tư thế cầm thuận tự nhiên theo Master được duyệt; không bắt model đảo tay hay gò bàn tay quanh cán. Không tì toàn bộ trọng lượng vào cánh cung, không dùng dây cung làm roi, không đập vỡ cơ cấu nỏ. Phần thân dưới và góc ngắm khác nhau phải dễ đọc thành 3 silhouette khi thu nhỏ còn ~128px.

**Bảy hướng khác biệt:** Kim = sức nặng/kỷ luật; Mộc = săn và khóa đường; Thủy = boong hẹp/góc thấp; Hỏa = mở thế/đánh diện; Thổ = trấn tuyến/bảo vệ; Lôi = cắt tín hiệu/phản xạ; Phong = đổi trụ/thoát vị trí.

**Mục tiêu cân bằng:** Cung thủ đánh tầm xa có nhịp mạnh nhưng không thay thế Tướng sĩ cận chiến hoặc Quân sư buff. Các hiệu ứng `freeze`, `shield`, `burn`, `pierce`, `energy`, `destroy`, `whirl` vẫn phụ thuộc engine; chưa có debuff trói, teleport hay nhân bản. P4 cá nhân cần kiểm tra stacking và giới hạn `CHASE_LIMITS`.

### Ba kỹ năng nghề dùng chung — đề xuất V4.5

| Ô | Tên / ID | Cost | Mục tiêu | Hiệu ứng đề xuất | Ý nghĩa và animation |
|---|---|---:|---|---|---|
| 1 | **Xạ Điểm** `role_cungThu_xaDiem` | 30 | enemy | 1.60× ATK, xuyên 10% DEF | Phát bắn định mục tiêu, không thêm trạng thái `mark` chưa hỗ trợ |
| 3 | **Khoan Giáp Tiễn** `role_cungThu_khoanGiap` | 45 | enemy | 1.90× ATK, xuyên 25% DEF, giảm DEF 15% trong 2 lượt | Một tên duy nhất nhắm khe giáp, **tư thế tùy nhân vật** |
| 5 | **Mưa Tiễn Kỳ Tập** `role_cungThu_muaTien` | 60 | allEnemies | 0.75× ATK mỗi địch, phá ngẫu nhiên 3 ô | Kỹ năng diện chung, VFX nhiều tên tách khỏi sprite; không tạo thêm cung |

Lưu ý số liệu nấc 1 khác bản cũ ở chỗ bỏ nhãn `mark normal` chưa có cơ chế xác định; thay bằng xuyên 10% DEF làm phương án kiểm thử, **không phải đã thay đổi code**.

### Quy ước bị động của nghề

`archerPrepared` (*Tiếp xạ*): khi đồng đội phá giáp, Cung thủ có cơ hội truy kích mục tiêu bằng 0.40× ATK (đề xuất), **không quá một lần trên mỗi action nguồn**. Theo cấu trúc hiệu lực `chase.ts`, bốn ô là **1 cơ hội nghề (P1) + 3 chase (P2 nghề + P3 hành thứ nhất + P4 cá nhân)**. Chase hành thứ hai bị thay thế, không trang bị, dù vẫn tồn tại trong registry để dùng cho các tướng khác. Cả `archerPreparedOpportunity`, `archerPrepared` và bảy P4 đều là đề xuất, **chưa có runtime**; cần audit lại tương tác trước triển khai. Không coi đây là thay đổi code.

### Ma trận tư thế bất trùng giữa 7 người

| Mã | Đánh thường | Ra chiêu ô 3 | Tuyệt chiêu ô 4 |
|---|---|---|---|
| RB-062 | Đá tống ngắn ở tầm bụng, cả hai tay kẹp nỏ nặng ngang ngực để tránh va đập cơ cấu cò. Không bắn. | Đứng trụ hai chân, nỏ ngang ngực, áp má sát ray, lấy điểm ngắm chính xác một khe giáp. | Quỳ một gối, thân người gập sau báng nỏ, ghì nỏ nặng thành một trục ổn định, chuẩn bị phóng đúng một tên phá thành. |
| RB-063 | Lách sang trái, quét chân thấp để tách người áp sát; cung tre giữ dọc ở tay trái, dây không kéo. | Đứng tĩnh, kéo một tên tre ngang vai, nhắm đúng một khe giáp ở tầm trung; trục cánh cung trên dài hơn vẫn nhìn rõ. | Chân sau xoay rộng, người nghiêng gần mặt đất, cung tre nghiêng chéo thấp và mũi tên chỉ lối thoát giả định; dáng khóa đường từ phía sườn. |
| RB-064 | Thúc gối ngắn, nỏ gọn ép sát sườn bằng cánh tay, không chạm cơ cấu cò. Không nạp thêm tên. | Đứng trụ hẹp, đưa nỏ ngắn sát vai phải và ngắm một khe giáp ngang thân; khuỷu không bị che bởi cánh nỏ. | Hạ thế nghiêng gần quỳ ở một chân, nỏ ngang mạn tưởng tượng và chỉ lệch sang góc thấp bên phải nhằm chặn điểm neo; một tên sẵn trên ray. |
| RB-065 | Bật vai và thúc khuỷu tay phải ngang ngực khi cung dài giữ thẳng ở tay trái, dây không giương; không đánh bằng đầu cung. | Hạ chân trụ rồi kéo cung ngang vai, ngắm một điểm yếu đơn mục tiêu, không có lửa trên mũi tên. | Chân mở cực rộng, xoay hông mạnh, cung lớn dựng một đường chéo đi lên, tên duy nhất chĩa lên hướng tuyến quân; mô tả hiệu lệnh mưa tên mà không vẽ nhiều xạ thủ. |
| RB-066 | Đẩy bằng lòng bàn tay phải để giữ khoảng cách trong khi tay trái dựng nguyên trường cung nặng sát thân, không dùng cánh cung làm gậy. | Chân trụ chắc, kéo một tên nặng ngang vai, nhắm khe giáp đơn mục tiêu; không thay đổi phiến sừng gốc. | Xoay vai chắn tuyến đồng đội tưởng tượng, cung nằm chéo thấp trước người, một tên nhắm xuống lối xung phong, chân mở rộng như mỏ neo. |
| RB-067 | Bước nghiêng tránh sát người, dùng lòng bàn tay phải gạt nhanh cẳng tay đối thủ tưởng tượng; cung phản cong giữ ở tay trái dưới hông, không giương. | Hai chân tạm đứng yên, kéo một mũi tên hẹp với cung phản cong ở góc vai nông; nhắm một điểm giáp rất nhỏ. | Sau khi chuông bên hông đã được ra tín hiệu (không chạm chuông trong cùng ảnh), xoay chân sau rộng, nâng cung lên một đường chéo cao và thả một tên vào mục tiêu chỉ huy; dáng chớp thời cơ, không giương hai tên. |
| RB-068 | Đá quét ngang thấp khi chuyển trụ, cung ngắn bất đối xứng thu gọn trong tay trái ở hông; tay phải mở để giữ thăng bằng; không bắn. | Ngừng đúng một nhịp, chân trước trụ cố định, kéo tên lông xám và ngắm chính xác ngang ngực; cung ngắn vẫn có cánh trên dài hơn. | Bước lùi chéo rộng với thân người xoay gần ngang, vừa mở cung và hoàn tất một phát bắn theo góc sườn; tà áo tự bay theo quán tính, không vẽ dư ảnh nhân vật. |

## Hồ sơ gameplay và 10 kỹ năng từng Cung thủ (V4.5)

### RB-062 — Bạch Nỏ Lang · Cung thủ / Kim

**Chức năng gameplay:** Nỏ thủ phá giáp hạng nặng. **Nhịp chiến đấu:** Đầm, chắc, kiểm soát cửa hẹp; cận chiến chỉ để tạo khoảng cách rồi trở lại nỏ.

**Ngôn ngữ hình khối:** **ĐÁ NGẮN → NGẮM NGANG → QUỲ GHÌ NỎ**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Luyện Kim Thành Kiếm** | `element_luyenKimThanhKiem` | theo registry | Biến 4 ô thành Kiếm (theo registry hiện tại) |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Thiết Nỏ Phá Thành** | `rb_bnl_thietNoPhaThanh` | 95 | 2.70× ATK; xuyên 45% DEF; giảm DEF 20% trong 2 lượt; phá một hàng 4 ô (đề xuất); target=`enemy` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Kim Ý Ngưng Thần** | `element_kimYNgungThan` | theo registry | Gây 1,3× ATK, xuyên 50% DEF (bản layout2 đã thay nội dung cũ) |

**Bốn ô bị động đề xuất V4.5** (bản triển khai chưa có; thiết kế **thay thế**, không cộng thêm bị động thứ năm):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Kim phá / `kim1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Nỏ thành bền bỉ** / `rb_bnl_passive` | `armorBroken`: Giảm thêm DEF mục tiêu 8% trong 1 lượt, tối đa 1 lần mỗi action (không tự kích hoạt từ lần trừ DEF bổ sung). |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Kim truy / `kim2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Đá tống ngắn ở tầm bụng, cả hai tay kẹp nỏ nặng ngang ngực để tránh va đập cơ cấu cò. Không bắn.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Đứng trụ hai chân, nỏ ngang ngực, áp má sát ray, lấy điểm ngắm chính xác một khe giáp.
- **Ultimate / Frame 4 — Thiết Nỏ Phá Thành:** Quỳ một gối, thân người gập sau báng nỏ, ghì nỏ nặng thành một trục ổn định, chuẩn bị phóng đúng một tên phá thành.

**Chống trùng:** ĐÁ NGẮN → NGẮM NGANG → QUỲ GHÌ NỎ. **Rủi ro cân bằng cần mô phỏng:** Burst mạnh + giảm giáp chồng nghề; kiểm tra boss armor và chống double proc.

---

### RB-063 — Thanh Lâm Xạ · Cung thủ / Mộc

**Chức năng gameplay:** Thợ săn khóa lối / bảo hộ người rút. **Nhịp chiến đấu:** Lấy góc lệch và địa hình tưởng tượng làm ngôn ngữ chiến thuật; không tạo status 'trói' vật lý.

**Ngôn ngữ hình khối:** **QUÉT CHÂN → NGẮM THẲNG → ÉP LỐI CHÉO THẤP**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Lục Diệp Phong** | `element_lucDiepPhong` | theo registry | Phá ngẫu nhiên 5 ô |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Lục Tiễn Trói Đường** | `rb_tlx_lucTienTroiDuong` | 90 | 1.95× ATK; giảm DEF 25% trong 2 lượt; hồi đội 6% HP tối đa (đề xuất); target=`enemy` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Linh Mộc Hồi Sinh** | `element_linhMocHoiSinh` | theo registry | Hồi bản thân 11% HP và đổi 3 ô thành Tim |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Mộc sinh / `moc1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Rễ hộ người** / `rb_tlx_passive` | `healed`: Khi một đồng minh được hồi HP thực, cấp Khiên bằng 4% HP tối đa người ấy; tối đa một lần cho mỗi action nguồn. |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Mộc hộ / `moc2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Lách sang trái, quét chân thấp để tách người áp sát; cung tre giữ dọc ở tay trái, dây không kéo.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Đứng tĩnh, kéo một tên tre ngang vai, nhắm đúng một khe giáp ở tầm trung; trục cánh cung trên dài hơn vẫn nhìn rõ.
- **Ultimate / Frame 4 — Lục Tiễn Trói Đường:** Chân sau xoay rộng, người nghiêng gần mặt đất, cung tre nghiêng chéo thấp và mũi tên chỉ lối thoát giả định; dáng khóa đường từ phía sườn.

**Chống trùng:** QUÉT CHÂN → NGẮM THẲNG → ÉP LỐI CHÉO THẤP. **Rủi ro cân bằng cần mô phỏng:** Định nghĩa healed theo hồi thực để không lặp chain với Mộc hộ; tên 'trói' không phải immobilize.

---

### RB-064 — Lam Giang Nỗ · Cung thủ / Thủy

**Chức năng gameplay:** Trinh sát nỏ nhẹ khống chế tuyến sông. **Nhịp chiến đấu:** Nhỏ, nhanh, thấp; đánh trong không gian hẹp và cắt nhịp di chuyển.

**Ngôn ngữ hình khối:** **THÚC GỐI → NGẮM HẸP → QUỲ THẤP KHÓA NEO**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Thủy Nguyệt Tụ Linh** | `element_thuyNguyetTuLinh` | theo registry | Chiêu hệ theo registry: xem steps chính thức khi triển khai |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Thủy Tiễn Khóa Thuyền** | `rb_lgn_thuyTienKhoaThuyen` | 95 | 2.05× ATK; 35% gây đóng băng 1 lượt; trừ 15 năng lượng địch (đề xuất); target=`enemy` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Thanh Lưu Tẩy Trần** | `element_thanhLuuTayTran` | theo registry | Chiêu hệ theo registry: xem steps chính thức khi triển khai |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Thủy tiếp / `thuy1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Thủy hiệu ứng cảnh giới** / `rb_lgn_passive` | `controlled`: Nhận 7 năng lượng khi đồng đội khống chế thành công mục tiêu, giới hạn một lần mỗi action. |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Thủy dẫn / `thuy2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Thúc gối ngắn, nỏ gọn ép sát sườn bằng cánh tay, không chạm cơ cấu cò. Không nạp thêm tên.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Đứng trụ hẹp, đưa nỏ ngắn sát vai phải và ngắm một khe giáp ngang thân; khuỷu không bị che bởi cánh nỏ.
- **Ultimate / Frame 4 — Thủy Tiễn Khóa Thuyền:** Hạ thế nghiêng gần quỳ ở một chân, nỏ ngang mạn tưởng tượng và chỉ lệch sang góc thấp bên phải nhằm chặn điểm neo; một tên sẵn trên ray.

**Chống trùng:** THÚC GỐI → NGẮM HẸP → QUỲ THẤP KHÓA NEO. **Rủi ro cân bằng cần mô phỏng:** Không có mô hình tàu/thuyền trên bàn cờ; khóa thuyền là hình tượng, hiệu ứng thật là freeze/energy.

---

### RB-065 — Xích Diệm Tiễn · Cung thủ / Hỏa

**Chức năng gameplay:** Khai hỏa diện rộng / áp lực đội hình. **Nhịp chiến đấu:** Mở thế, áp lực nhịp cao; đòn lớn dùng tên hiệu lệnh để đại diện vùng ảnh hưởng.

**Ngôn ngữ hình khối:** **THÚC CHỎ → NGẮM NGANG → MỞ RỘNG TÊN HIỆU LỆNH**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Phóng Hỏa Thiêu Doanh** | `element_phongHoaThieuDoanh` | theo registry | Chiêu Hỏa theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Hỏa Vũ Tiễn Trận** | `rb_xdt_hoaVuTienTran` | 100 | 1.15× ATK cho tất cả địch; đốt 12% ATK trong 2 lượt; phá cụm vuông 3×3 ô (đề xuất); target=`allEnemies` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Nộ Hỏa Thiêu Thân** | `element_noHoaThieuThan` | theo registry | Chiêu Hỏa theo registry hiện tại |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Hỏa truy / `hoa1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Hỏa cốt truy kích** / `rb_xdt_passive` | `armorBroken`: Khi đồng đội phá giáp, truy kích mục tiêu thêm 35% ATK; giới hạn một lần mỗi action và chống vòng phản ứng. |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Hỏa phá / `hoa2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Bật vai và thúc khuỷu tay phải ngang ngực khi cung dài giữ thẳng ở tay trái, dây không giương; không đánh bằng đầu cung.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Hạ chân trụ rồi kéo cung ngang vai, ngắm một điểm yếu đơn mục tiêu, không có lửa trên mũi tên.
- **Ultimate / Frame 4 — Hỏa Vũ Tiễn Trận:** Chân mở cực rộng, xoay hông mạnh, cung lớn dựng một đường chéo đi lên, tên duy nhất chĩa lên hướng tuyến quân; mô tả hiệu lệnh mưa tên mà không vẽ nhiều xạ thủ.

**Chống trùng:** THÚC CHỎ → NGẮM NGANG → MỞ RỘNG TÊN HIỆU LỆNH. **Rủi ro cân bằng cần mô phỏng:** P1 Tiếp xạ cùng trigger, bắt buộc mô phỏng stacking và giới hạn tổng số phản ứng.

---

### RB-066 — Trấn Sơn Cung · Cung thủ / Thổ

**Chức năng gameplay:** Xạ thủ trấn giữ / che tuyến. **Nhịp chiến đấu:** Khả năng phòng vệ đọc qua thân người trụ thấp, không tự mọc khiên vật lý.

**Ngôn ngữ hình khối:** **ĐẨY TAY → NGẮM TRỤ → CHẮN TUYẾN BẰNG CUNG HẠ THẤP**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Hậu Thổ Tích Lương** | `element_hauThoTichLuong` | theo registry | Chiêu Thổ theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Sơn Cung Hộ Trận** | `rb_tsc_sonCungHoTran` | 95 | 1.55× ATK vào một địch; cấp Khiên đội 10% HP tối đa trong 2 lượt; giảm ATK địch 20% trong 2 lượt (đề xuất); target=`enemy` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Thạch Giáp** | `element_thachGiap` | theo registry | Chiêu Thổ theo registry hiện tại |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Thổ hộ / `tho1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Sơn trấn kiên thủ** / `rb_tsc_passive` | `shieldAbsorbed`: Khi Khiên đồng minh thực sự hấp thụ sát thương, phản kích một mục tiêu bằng 30% ATK; tối đa một lần mỗi action. |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Thổ chấn / `tho2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Đẩy bằng lòng bàn tay phải để giữ khoảng cách trong khi tay trái dựng nguyên trường cung nặng sát thân, không dùng cánh cung làm gậy.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Chân trụ chắc, kéo một tên nặng ngang vai, nhắm khe giáp đơn mục tiêu; không thay đổi phiến sừng gốc.
- **Ultimate / Frame 4 — Sơn Cung Hộ Trận:** Xoay vai chắn tuyến đồng đội tưởng tượng, cung nằm chéo thấp trước người, một tên nhắm xuống lối xung phong, chân mở rộng như mỏ neo.

**Chống trùng:** ĐẨY TAY → NGẮM TRỤ → CHẮN TUYẾN BẰNG CUNG HẠ THẤP. **Rủi ro cân bằng cần mô phỏng:** Khiên trong skill là hiệu ứng gameplay tách asset, không biến thành tấm khiên cầm tay.

---

### RB-067 — Lôi Minh Xạ · Cung thủ / Lôi

**Chức năng gameplay:** Xạ thủ cắt năng lượng / ngắt hiệu lệnh. **Nhịp chiến đấu:** Phản xạ đột ngột như tín hiệu trạm, tước khí bằng một phát bắn đúng thời điểm.

**Ngôn ngữ hình khối:** **GẠT TAY → NGẮM CHÍNH XÁC → XOAY LỆCH BẮN CẮT LỆNH**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Lôi Trụ Giáng Thế** | `element_loiTruGiangThe` | theo registry | Chiêu Lôi theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Lôi Minh Tước Khí** | `rb_lmx_loiMinhTuocKhi` | 100 | 2.10× ATK; trừ 35 năng lượng địch; 35% câm lặng 1 lượt (đề xuất); target=`enemy` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Tĩnh Điện Hộ Thân** | `element_tinhDienHoThan` | theo registry | Trừ địch 20 năng lượng, hoàn bản thân 10 năng lượng (layout2) |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Lôi truy / `loi1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Lôi khẩu chớp thời cơ** / `rb_lmx_passive` | `skillDamage`: Nếu kỹ năng gây mất HP thật, mục tiêu mất thêm 5 năng lượng một lần mỗi action (không tính DoT tự kích lại). |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Lôi đoạt / `loi2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Bước nghiêng tránh sát người, dùng lòng bàn tay phải gạt nhanh cẳng tay đối thủ tưởng tượng; cung phản cong giữ ở tay trái dưới hông, không giương.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Hai chân tạm đứng yên, kéo một mũi tên hẹp với cung phản cong ở góc vai nông; nhắm một điểm giáp rất nhỏ.
- **Ultimate / Frame 4 — Lôi Minh Tước Khí:** Sau khi chuông bên hông đã được ra tín hiệu (không chạm chuông trong cùng ảnh), xoay chân sau rộng, nâng cung lên một đường chéo cao và thả một tên vào mục tiêu chỉ huy; dáng chớp thời cơ, không giương hai tên.

**Chống trùng:** GẠT TAY → NGẮM CHÍNH XÁC → XOAY LỆCH BẮN CẮT LỆNH. **Rủi ro cân bằng cần mô phỏng:** Đánh giá khả năng khóa năng lượng liên tiếp, đặt cooldown nội bộ nếu combo quá mạnh.

---

### RB-068 — Tật Phong Tiễn · Cung thủ / Phong

**Chức năng gameplay:** Xạ thủ cơ động / chuyển vị nghi binh. **Nhịp chiến đấu:** Hit-and-run theo hướng chuyển chân, không teleport, không có bản sao cơ thể.

**Ngôn ngữ hình khối:** **QUÉT CHÂN → DỪNG NGẮM → LÙI CHÉO BẮN NGHI BINH**. Cả ba khung cần khác nhau về hướng thân, chân trụ và mức sử dụng cung/nỏ.

**Sáu kỹ năng chủ động**

| Ô | Kỹ năng | Skill ID | Cost | Hiệu ứng và vai trò (đề xuất) |
|---|---|---|---:|---|
| 1 | **Xạ Điểm** | `role_cungThu_xaDiem` | 30 | 1.60× ATK, xuyên 10% DEF; chọn mục tiêu đơn |
| 2 | **Phong Quyển Tàn Vân** | `element_phongQuyenTanVan` | theo registry | Chiêu Phong theo registry hiện tại |
| 3 | **Khoan Giáp Tiễn** | `role_cungThu_khoanGiap` | 45 | 1.90× ATK, xuyên 25% DEF, DEF mục tiêu -15% trong 2 lượt |
| 4 | **Tật Phong Phân Ảnh** | `rb_tpt_tatPhongPhanAnh` | 95 | 0.85× ATK cho tất cả địch; whirl 2 ô tự động; giảm ATK địch 15% trong 2 lượt (đề xuất); target=`allEnemies` |
| 5 | **Mưa Tiễn Kỳ Tập** | `role_cungThu_muaTien` | 60 | 0.75× ATK tới toàn địch, phá ngẫu nhiên 3 ô |
| 6 | **Thanh Phong Tụ Khí** | `element_thanhPhongTuKhi` | theo registry | Cả đội +10 năng lượng và +10% DEF trong 2 lượt (layout2) |

**Bốn nguồn bị động trong bản proposal** (P4 chưa đăng ký runtime):

| Ô | Nguồn | Tên / ID | Trigger / hiệu ứng |
|---|---|---|---|
| P1 | Cơ hội nghề | **Chuẩn bị xạ kích** / `archerPreparedOpportunity` *(đề xuất)* | Cơ hội chuẩn bị theo luật nghề, không phải một chase phản ứng độc lập |
| P2 | Chase nghề | Tiếp xạ / `archerPrepared` | `armorBroken` → 0.40× ATK |
| P3 | Chase hành thứ nhất | Phong tiếp / `phong1` | Kế thừa registry hệ hiện tại |
| P4 | Chase cá nhân | **Thuận gió hồi nhịp** / `rb_tpt_passive` | `dispelled`: Khi đồng đội xua tan hiệu ứng của địch thành công, bản thân +6 năng lượng, tối đa một lần mỗi action. |

**Bị động hành thứ hai chưa trang bị trong phương án 4 ô này:** Phong dẫn / `phong2` | Kế thừa registry hệ hiện tại |. Đây là **đánh đổi có chủ đích** để dành ô cho cá tính riêng; nếu giữ cả hai chase hành theo engine hiện tại thì phải bỏ P4 cá nhân hoặc mở rộng thành 5 ô, không được tự thêm cả hai.


**Mô tả chiến đấu để dựng ảnh**

- **Basic / Frame 2:** Đá quét ngang thấp khi chuyển trụ, cung ngắn bất đối xứng thu gọn trong tay trái ở hông; tay phải mở để giữ thăng bằng; không bắn.
- **Skill / Frame 3 — Khoan Giáp Tiễn:** Ngừng đúng một nhịp, chân trước trụ cố định, kéo tên lông xám và ngắm chính xác ngang ngực; cung ngắn vẫn có cánh trên dài hơn.
- **Ultimate / Frame 4 — Tật Phong Phân Ảnh:** Bước lùi chéo rộng với thân người xoay gần ngang, vừa mở cung và hoàn tất một phát bắn theo góc sườn; tà áo tự bay theo quán tính, không vẽ dư ảnh nhân vật.

**Chống trùng:** QUÉT CHÂN → DỪNG NGẮM → LÙI CHÉO BẮN NGHI BINH. **Rủi ro cân bằng cần mô phỏng:** Whirl cần phân biệt tạo lượt/cascade trong thiết kế trận; không tự thêm extra turn vào ultimate.

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
