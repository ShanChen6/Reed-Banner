# Reed Banner — Thiết kế nhân vật Xạ thủ và Sát thủ

> Cập nhật: 30/10/2026
> Trạng thái: **DRAFT** — hướng vũ khí đã chốt; bảng thông số này là điểm xuất phát hoàn chỉnh để review/mô phỏng, chưa phải cân bằng cuối hoặc chức năng runtime. Chỉ cập nhật docs theo lựa chọn của người dùng, không mở hai nghề trong trận.

## Phạm vi và nguồn chính

Nguồn chính cho chiêu thức, chỉ số và phân bổ sáu chủ động + bốn bị động của RB-062–075. [Bộ prompt](./09-14-heroes-character-and-frame-prompts-v4-3.md) là nguồn hình ảnh; [kỹ năng đang chạy](../../../03-characters/ky-nang/README.md) vẫn quyết định hành vi runtime. Bản này thay các bảng đề xuất sơ bộ cũ ngay tại đây, không tạo bảng “final/v2” song song.

- Giữ tên, ID, vũ khí và toàn bộ prompt hiện có. Kim/Mộc Xạ thủ giữ W01; các nhân vật khác dùng W02. Không yêu cầu tạo lại ảnh, không đổi dáng tung hứng phi hoàng thạch của Trấn Sơn Thạch.
- Xạ thủ: nỏ nặng, cung tre, phi tiêu, phi luân, phi hoàng thạch, phi châm, lụa chiến. Sát thủ: dao găm, kim châm độc, lưỡi dao ẩn, song đao, móng vuốt, hộp Bạo Vũ Lê Hoa Châm, sáo âm công Phong. Không có nỏ mini hoặc thiết phiến trong bộ chốt.
- `xaThu` là namespace thiết kế; code danh mục còn `cungThu`. Khi triển khai cần migration/alias có kiểm thử, không tự thêm hai nghề tương đương. `satThu` vẫn là nghề mở rộng, chưa mở gameplay.
- Không giả định có tầm bắn, hàng sau, teleport, né, tốc độ hoặc crit riêng. Đổi vị trí, nội lực và vũ khí là ngôn ngữ mỹ thuật; damage vẫn chịu luật trận hiện hành. Các nhân vật và công cụ kỳ ảo là hư cấu.

## Quy ước dùng chiêu và tăng cấp

| Mục | Đặc tả |
|---|---|
| Sáu ô chủ động | 1/3/5 nghề; 2/6 hệ; 4 tuyệt chiêu cá nhân |
| Mở theo cấp nhân vật | ô 1/2: cấp 1; ô 3: cấp 5; ô 4: cấp 10; ô 5: cấp 15; ô 6: cấp 20 |
| Chi phí | Tất cả cost dưới đây là **năng lượng** riêng nhân vật (0–100), kể cả tuyệt chiêu ô 4; không dùng Nộ thay thế |
| Số lần dùng | Người hành động dùng tối đa một chủ động/lượt theo luật hiện hành; không thêm cooldown riêng |
| Cấp kỹ năng | 1–5, độc lập với cấp nhân vật; không tự nâng mọi chiêu lên 5 khi nhân vật cấp 5 |
| Hệ số nâng | `m(k)=1+0.10×(k−1)`: 1 / 1.1 / 1.2 / 1.3 / 1.4 |
| Thuộc tính tăng | hệ số damage, heal, shield, atkUp/Down, defUp/Down, burn; làm tròn hệ số tới 0.001 theo scaleSkill |
| Không tăng | thời lượng, xác suất, số hit, số ô, số nấc whirl, pierce, ngưỡng/multiplier execute, lượng năng lượng cộng/trừ |
| Cost cấp 1–4 / 5 | cấp 1–4 giữ nguyên; cấp 5 `floor(cost×0.9/5)×5` |
| Bị động | P1/P2/P3/P4 không dùng điểm nâng chủ động; giữ nguyên hệ số khi chiêu lên cấp |
| Hiệu ứng trùng | cùng kind lấy giá trị mạnh hơn và thời hạn dài hơn, không cộng thẳng %; poison có cap riêng bên dưới |
| Khiên/hồi | theo HP tối đa người nhận và Tinh thần F của người nhận, áp F một lần; Khiên đã tạo không co hồi tố |

Quy tắc cấp được đối chiếu [scaleSkill](../../../../src/core/battle/skills.ts) tại snapshot `4a23d12cbfb470cf7995b3b80733843ca289071c`. Poison chưa có trong registry: chính sách tăng hệ số poison theo m(k) bên dưới là **đề xuất cần code riêng**, không phải scaleSkill hiện đã hỗ trợ. DEF, Sĩ khí, nguyên tố, Khiên, miễn nhiễm freeze và thứ tự giải quyết theo [luật trận](../../../01-gameplay/tai-nguyen-cong-thuc.md), không viết lại ở đây.

## Chỉ số nền hai nghề

Đề xuất cấp nhân vật 1, chưa trang bị, chưa buff, trước hệ số HP solo. Bảy người cùng nghề dùng cùng chỉ số nền; khác biệt nằm ở hệ, bộ chiêu và vũ khí, không có nhân vật hiếm mạnh hơn. Không thêm cấp sao, crit, tốc độ, né hoặc tầm đánh.

| Nghề | HP | ATK | DEF | Vai trò chỉ số |
|---|---:|---:|---:|---|
| Xạ thủ | 475 | 55 | 9 | Sát thương ổn định, phá giáp và linh hoạt; thấp độ bền hơn Tướng sĩ |
| Sát thủ | 450 | 58 | 8 | Sát thương đơn cao hơn, đánh đổi độ bền |
| Tướng sĩ hiện có — đối chiếu | 500 | 55 | 10 | Nguồn BASE_STATS hiện hành, không sửa |

Dùng cùng `STAT_GROWTH=0.03`, cấp tối đa 30 như [progress.ts](../../../../src/core/progress/progress.ts): từng chỉ số = `Math.round(base×(1+0.03×(L−1)))`; áp tăng trưởng **một lần**, sau đó trang bị và luật chế độ theo pipeline hiện hành. Bảng này không tự cập nhật roster.

| Nghề | Cấp | HP | ATK | DEF |
|---|---:|---:|---:|---:|
| Xạ thủ | 1 | 475 | 55 | 9 |
| Xạ thủ | 10 | 603 | 70 | 11 |
| Xạ thủ | 20 | 746 | 86 | 14 |
| Xạ thủ | 30 | 888 | 103 | 17 |
| Sát thủ | 1 | 450 | 58 | 8 |
| Sát thủ | 10 | 572 | 74 | 10 |
| Sát thủ | 20 | 706 | 91 | 13 |
| Sát thủ | 30 | 842 | 108 | 15 |

## Xạ thủ — bộ kỹ năng nghề

Định Điểm/Phá Giáp là đòn đơn; Tập Kích dùng vũ khí của từng người bằng VFX, không bắt phi luân/lụa/đá biến thành mưa tên. Khung ra chiêu minh họa ô 3, tên/ID giữ nguyên bộ prompt.

| Ô | Chiêu / ID | Target | NL cấp 1 / 5 | Damage cấp 1 / 5 | Hiệu ứng cấp 1 / 5 |
|---|---|---|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | enemy | 30 / 25 | 1.6× ATK / 2.24× ATK | xuyên 10% DEF; cấp 5: xuyên 10% DEF |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | enemy | 45 / 40 | 1.9× ATK / 2.66× ATK | xuyên 25% DEF; sau sát thương DEF -15%, 2 lượt; cấp 5: xuyên 25% DEF; sau sát thương DEF -21%, 2 lượt |
| 5 | Tập Kích / `role_xaThu_tapKich` | allEnemies | 60 / 50 | 0.75× ATK / 1.05× ATK | phá ngẫu nhiên 3 ô, đúng một lần/action; cấp 5: phá ngẫu nhiên 3 ô, đúng một lần/action |

## Sát thủ — bộ đa vũ khí

Thừa Hư/Đoạt Khí dùng chung cho đao, trảo, kim, hộp phóng và âm công. Truy Mệnh khai thác HP thấp nhưng không tự giết mục tiêu. Không dùng bộ Lướt Sát/Cắt Mạch cũ.

| Ô | Chiêu / ID | Target | NL cấp 1 / 5 | Damage cấp 1 / 5 | Hiệu ứng cấp 1 / 5 |
|---|---|---|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | enemy | 30 / 25 | 1.65× ATK / 2.31× ATK | bản thân +5 năng lượng nếu gây mất HP thật; một lần/action; cấp 5: bản thân +5 năng lượng nếu gây mất HP thật; một lần/action |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | enemy | 45 / 40 | 1.9× ATK / 2.66× ATK | xuyên 20% DEF; địch -10 năng lượng sau sát thương; cấp 5: xuyên 20% DEF; địch -10 năng lượng sau sát thương |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | enemy | 65 / 55 | 2.35× ATK / 3.29× ATK | HP trước đòn ≤35%: ×1.30 hệ số đòn; không tự kết liễu; cấp 5: HP trước đòn ≤35%: ×1.30 hệ số đòn; không tự kết liễu |

**Thứ tự dùng chiêu:** trừ cost → các hit damage → hiệu ứng debuff → năng lượng/hồi/Khiên theo recipient → tác động bàn cờ đúng một lần → giải hàng đợi phản ứng. Nếu bước damage làm mục tiêu chết, bỏ bước enemy trên người đó, không đổi sang địch khác; bước self/team còn hợp lệ chạy theo luật kết thúc action/trận hiện hành. Execute kiểm HP ngay trước hit mang execute, sau hit trước; không kiểm từ lúc bấm nút rồi dùng lại cho mọi hit.

## Hai kỹ năng hệ ở ô 2 và 6

Bảng đối chiếu registry `ELEMENT_SKILLS` tại cùng snapshot để hoàn thiện loadout; **không đổi số liệu hệ cho hai nghề mới**. Nếu code hệ thay đổi về sau, registry thắng và phải cập nhật bảng đối chiếu này. Giá trị HP là trước F; cost cấp 5 theo công thức chung. Các chiêu hệ không có vũ khí vật lý mới.

| Hệ / ô | Kỹ năng / ID | Target | NL cấp 1 / 5 | Hiệu ứng cấp 1 | Cấp 5 |
|---|---|---|---|---|---|
| Kim / 2 | Luyện Kim Thành Kiếm / `element_luyenKimThanhKiem` | self | 20 / 15 | biến 4 ô thành Kiếm | không đổi số ô |
| Kim / 6 | Kim Ý Ngưng Thần / `element_kimYNgungThan` | enemy | 35 / 30 | 1.30× ATK, xuyên 50% DEF | 1.82× ATK, xuyên 50% DEF |
| Mộc / 2 | Lục Diệp Phong / `element_lucDiepPhong` | self | 35 / 30 | phá random:5 | không đổi số ô |
| Mộc / 6 | Linh Mộc Hồi Sinh / `element_linhMocHoiSinh` | self | 30 / 25 | hồi 11% HP tối đa self; biến 3 ô Tim | hồi 15.4%; vẫn 3 ô Tim |
| Thủy / 2 | Thủy Nguyệt Tụ Linh / `element_thuyNguyetTuLinh` | self | 20 / 15 | biến 5 ô Âm dương | không đổi số ô |
| Thủy / 6 | Thanh Lưu Tẩy Trần / `element_thanhLuuTayTran` | self | 30 / 25 | cleanse self; hồi 10% HP tối đa self | hồi 14%; cleanse giữ nguyên |
| Hỏa / 2 | Phóng Hỏa Thiêu Doanh / `element_phongHoaThieuDoanh` | self | 35 / 30 | phá square:3 | không đổi vùng |
| Hỏa / 6 | Nộ Hỏa Thiêu Thân / `element_noHoaThieuThan` | self | 30 / 25 | ATK +35%, DEF -15%, 2 lượt | ATK +49%, DEF -21%, vẫn 2 lượt |
| Thổ / 2 | Hậu Thổ Tích Lương / `element_hauThoTichLuong` | self | 20 / 15 | biến 5 ô Bánh chưng | không đổi số ô |
| Thổ / 6 | Thạch Giáp / `element_thachGiap` | self | 30 / 25 | Khiên 20% HP tối đa; turns:null | Khiên 28%; turns:null |
| Lôi / 2 | Lôi Trụ Giáng Thế / `element_loiTruGiangThe` | self | 40 / 35 | phá columns:1 | không đổi vùng |
| Lôi / 6 | Tĩnh Điện Hộ Thân / `element_tinhDienHoThan` | enemy | 30 / 25 | địch -20 năng lượng; self +10 | lượng năng lượng không đổi |
| Phong / 2 | Phong Quyển Tàn Vân / `element_phongQuyenTanVan` | self | 40 / 35 | whirl tối đa 2 nấc, người chơi chọn | không tăng nấc |
| Phong / 6 | Thanh Phong Tụ Khí / `element_thanhPhongTuKhi` | team | 30 / 25 | team +10 năng lượng; DEF +10%/2 lượt | vẫn +10 năng lượng; DEF +14%/2 lượt |

“Phá square:3” là vùng 3×3 hợp lệ; “line:4” là vùng bốn ô theo contract AreaShape, không mặc định xóa cả hàng bàn cờ. “columns:1” là một cột theo kích thước bàn hiện hành, không hardcode số ô. Cascade/lượt thêm sau phá/biến/xoay theo luật chung; không thưởng thêm lượt chỉ vì tên chiêu.

## Tuyệt chiêu cá nhân ô 4

Tất cả là proposal. Damage dưới đây liệt kê **từng hit**, không phải một hệ số rồi nhân lần nữa với số hit. Với allEnemies, hệ số áp lên từng địch còn sống; phá ô/whirl chỉ một lần cho toàn action. Những dòng hỗ trợ team/self phải dùng recipient tách khỏi target enemy. Hệ số cấp 2–4 lấy m(k), không cần bảng nhân bản.

| Nhân vật | Chiêu / ID | Target | NL cấp 1 / 5 | Damage cấp 1 / 5 | Hiệu ứng cấp 1 | Hiệu ứng cấp 5 |
|---|---|---|---|---|---|---|
| RB-062 Bạch Nỏ Lang | Thiết Nỏ Phá Thành / `rb_bnl_thietNoPhaThanh` | enemy | 95 / 85 | 2.7× ATK / 3.78× ATK | xuyên 45% DEF; DEF -20%/2 lượt; phá vùng line:4 một lần | xuyên 45% DEF; DEF -28%/2 lượt; phá line:4 một lần |
| RB-063 Thanh Lâm Xạ | Lục Tiễn Trói Đường / `rb_tlx_lucTienTroiDuong` | enemy | 90 / 80 | 1.95× ATK / 2.73× ATK | DEF -25%/2 lượt; sau đó team hồi 6% HP tối đa từng người | DEF -35%/2 lượt; team hồi 8.4% HP tối đa từng người |
| RB-064 Lam Giang Phi Diệp | Liễu Diệp Tỏa Giang / `rb064_lieuDiepToaGiang` | enemy | 95 / 85 | 2.05× ATK / 2.87× ATK | 35% freeze 1 lượt; địch -15 năng lượng một lần | 35% freeze 1 lượt; địch -15 năng lượng một lần |
| RB-065 Xích Diệm Luân | Xích Luân Liệt Trận / `rb065_xichLuanLietTran` | allEnemies | 100 / 90 | 1.15× ATK / 1.61× ATK | burn 0.12× ATK nguồn/tick ×2; phá square:3 một lần/action | burn 0.168× ATK nguồn/tick ×2; phá square:3 một lần/action |
| RB-066 Trấn Sơn Thạch | Trấn Sơn Hộ Trận / `rb066_tranSonHoTran` | enemy | 95 / 85 | 1.55× ATK / 2.17× ATK | địch ATK -20%/2 lượt; team Khiên 10% HP tối đa từng người/2 lượt | địch ATK -28%/2 lượt; team Khiên 14% HP tối đa từng người/2 lượt |
| RB-067 Lôi Minh Xạ | Lôi Châm Tước Khí / `rb067_loiChamTuocKhi` | enemy | 100 / 90 | 2.1× ATK / 2.94× ATK | địch -35 năng lượng; 35% silence 1 lượt | địch -35 năng lượng; 35% silence 1 lượt |
| RB-068 Tật Phong Lăng | Phong Lăng Nhiễu Trận / `rb068_phongLangNhieuTran` | allEnemies | 95 / 85 | 0.85× ATK / 1.19× ATK | địch ATK -15%/2 lượt; whirl:auto tối đa 2 nấc một lần/action | địch ATK -21%/2 lượt; whirl:auto tối đa 2 nấc một lần/action |
| RB-069 Bạch Phong Đao | Thiết Ấn Đoạt Mệnh / `rb069_ultimate` | enemy | 95 / 85 | 2.55× ATK / 3.57× ATK | xuyên 35% DEF; DEF -15%/2 lượt | xuyên 35% DEF; DEF -21%/2 lượt |
| RB-070 Độc Ảnh | Độc Ảnh Tiềm Châm / `rb070_ultimate` | enemy | 90 / 80 | 1.65× ATK / 2.31× ATK | poison 0.12× ATK nguồn/tick ×2; xác suất áp 100% nếu mục tiêu hợp lệ | poison 0.168× ATK nguồn/tick ×2; xác suất áp 100% |
| RB-071 Hàn Giang Khách | Hàn Giang Tàng Nhận / `rb071_ultimate` | enemy | 95 / 85 | 2.1× ATK / 2.94× ATK | địch -20 năng lượng; ATK -15%/2 lượt | địch -20 năng lượng; ATK -21%/2 lượt |
| RB-072 Xích Dạ | Xích Dạ Song Sát / `rb072_ultimate` | enemy | 100 / 90 | 1.15 + 1.15× ATK / 1.61 + 1.61× ATK | chỉ hit cuối kiểm HP ngay trước hit đó ≤35% để nhân ×1.30 | chỉ hit cuối kiểm HP ngay trước hit đó ≤35% để nhân ×1.30 |
| RB-073 Địa Ẩn | Địa Phục Liệt Trảo / `rb073_ultimate` | enemy | 95 / 85 | 2.05× ATK / 2.87× ATK | địch DEF -20%/2 lượt; self DEF +15%/2 lượt | địch DEF -28%/2 lượt; self DEF +21%/2 lượt |
| RB-074 Lôi Ảnh | Bạo Vũ Lê Hoa / `rb074_ultimate` | enemy | 100 / 90 | 0.75 + 0.75 + 0.75× ATK / 1.05 + 1.05 + 1.05× ATK | địch -20 năng lượng sau chuỗi một lần; không kích bị động ba lần | địch -20 năng lượng sau chuỗi một lần; không kích bị động ba lần |
| RB-075 Vô Ảnh | Vô Thanh Đoạt Phách / `rb075_ultimate` | enemy | 100 / 90 | 2.1× ATK / 2.94× ATK | địch -25 năng lượng; 35% silence 1 lượt; nội lực là mỹ thuật hư cấu | địch -25 năng lượng; 35% silence 1 lượt; không thêm xuyên Khiên |

- **Lục Tiễn Trói Đường:** “trói” là hình tượng, không áp status trói; thứ tự damage enemy → defDown enemy → heal team. Hồi dựa HP tối đa từng đồng minh, không dựa HP của địch/người dùng.
- **Trấn Sơn Hộ Trận:** damage/atkDown lên enemy; shield lên team, tính HP và F riêng từng người. Khiên đề xuất có hạn hai lượt của phe nhận; không nhầm với Thạch Giáp turns:null.
- **Xích Dạ Song Sát:** L1 tổng thường 2.30× ATK; khi chỉ hit cuối đạt execute, tổng hệ số tối đa 2.645× ATK, trước DEF/rounding. L5 tương ứng 3.22 / 3.703× ATK. Không áp execute cho hit đầu.
- **Bạo Vũ Lê Hoa:** 3 hit cùng mục tiêu, tổng L1 2.25× ATK, L5 3.15× ATK, trừ năng lượng một lần. Mục tiêu chết giữa chuỗi thì dừng hit còn lại, không phân phát hit cho địch khác. Mỗi P2/P4 chỉ một lần/action, không hoàn NL ba lần.
- **Âm công Phong:** nội lực chỉ đổi cách thể hiện; không tự bỏ qua DEF/Khiên, không là hỗ trợ team, không interrupt action đang giải quyết. Giữ sáo, tên và ID khớp prompt.

## Bốn bị động và hợp đồng phản ứng

P1 là cơ hội chuẩn bị lưu qua `comboPassive/comboReady`; P2/P3/P4 là ba phản ứng tức thời. Đó là tổng bốn ô, không phải bốn chase cộng combo thành năm. Các ID P1 dài bên dưới là alias thiết kế, chưa có trong registry; dự kiến ánh xạ reuse mẫu hiện hành để không viết thêm một hệ cơ hội độc lập.

### P1 và P2 dùng chung theo nghề

| Nghề / ô | Alias/ID thiết kế | Điều kiện | Tác dụng cố định |
|---|---|---|---|
| Xạ thủ P1 | `marksmanPreparedOpportunity` → mẫu `pursuit` | đồng đội phá giáp hoặc xua tan buff địch thật | chuẩn bị +20% sát thương trực tiếp cho action hợp lệ tiếp theo vào đúng địch đó |
| Xạ thủ P2 | `marksmanPrepared` | armorBroken hữu hiệu do đồng đội | truy kích 0.40× ATK vào đúng địch đó |
| Sát thủ P1 | `assassinPreparedOpportunity` → mẫu `resonance` | đồng đội gây freeze/silence thành công | chuẩn bị +20% sát thương trực tiếp cho action hợp lệ tiếp theo vào đúng địch đó |
| Sát thủ P2 | `assassinPrepared` | controlled hữu hiệu do đồng đội | truy kích 0.45× ATK vào đúng địch đó |

P1 chỉ một cơ hội đang giữ/người, không cộng dồn phần trăm; cơ hội mới hợp lệ thay mục tiêu và làm mới hạn. Mở ở bộ đếm lượt thường t thì hết trước đầu lượt thường t+3 theo contract hiện hành; lượt thêm không tăng bộ đếm. Chỉ action chủ động/bàn cờ hợp lệ tiêu cơ hội, không nhân lên chase/DoT, không nhân thêm cost/energy hoặc buff/debuff. Với nhiều hit, +20% áp trên các hit trực tiếp của cùng action vào đúng mục tiêu, không cộng 20% vào hệ số mỗi hit rồi nhân lần nữa. Cơ hội đồng đội không tự mở cho chính mình trong solo. Mục tiêu chết thì cơ hội không tự đổi địch. Cơ chế Nộ/thủ lĩnh có sẵn không tính thành ô thứ năm.

### P3 dùng lại hệ

| Hệ / ID | Trigger | Recipient / hệ số cố định |
|---|---|---|
| Kim / `kim1` | skillDamage mất HP thật | địch DEF -10%, 1 lượt |
| Mộc / `moc1` | skillDamage mất HP thật | hồi đồng minh có tỷ lệ HP thấp nhất 4% HP tối đa; theo F |
| Thủy / `thuy1` | controlled thật | hồi đồng minh thấp HP nhất 5% HP tối đa; theo F |
| Hỏa / `hoa1` | armorBroken thật | truy kích 0.40× ATK |
| Thổ / `tho1` | healed có HP thực | Khiên 5% HP tối đa người vừa được hồi; theo F |
| Lôi / `loi1` | controlled thật | truy kích 0.45× ATK |
| Phong / `phong1` | dispelled xóa buff địch thật | truy kích 0.40× ATK |

P3 là bảng đối chiếu [chase.ts](../../../../src/core/battle/chase.ts), theo eligibility/recipient của engine; có thể nhận tín hiệu hợp lệ của bản thân nếu registry cho phép. Không trang bị thêm `kim2/moc2/thuy2/hoa2/tho2/loi2/phong2` cùng P4 cá nhân.

### P4 riêng từng nhân vật

| Nhân vật | P4 / ID | Trigger | Recipient | Tác dụng không tăng theo cấp chủ động |
|---|---|---|---|---|
| RB-062 Bạch Nỏ Lang | Nỏ thành bền bỉ / `rb_bnl_passive` | armorBroken do đồng đội | địch bị phá giáp | DEF -8%, 1 lượt; không cộng thêm khi defDown mạnh hơn đang tồn tại |
| RB-063 Thanh Lâm Xạ | Rễ hộ người / `rb_tlx_passive` | healed do đồng đội, hồi HP thật | đúng đồng minh vừa được hồi | Khiên 4% HP tối đa người nhận, turns:null; theo F |
| RB-064 Lam Giang Phi Diệp | Cảnh giới bến sông / `rb064_canhGioi` | controlled do đồng đội | self | năng lượng +7 |
| RB-065 Xích Diệm Luân | Hỏa cốt truy kích / `rb065_hoaCot` | armorBroken do đồng đội | địch bị phá giáp | 0.35× ATK |
| RB-066 Trấn Sơn Thạch | Sơn trấn kiên thủ / `rb066_kienThu` | shieldAbsorbed hữu hiệu trên đồng minh từ đòn chủ động | địch gây sát thương nếu có provenance | 0.30× ATK; không xác định được nguồn thì bỏ qua, không đoán mục tiêu |
| RB-067 Lôi Minh Xạ | Chớp thời cơ / `rb067_chopThoiCo` | skillDamage do kỹ năng chủ động bản thân gây mất HP thật | địch nhận sát thương | năng lượng -5; mỗi action một lần |
| RB-068 Tật Phong Lăng | Thuận gió hồi nhịp / `rb068_hoiNhip` | dispelled do đồng đội xóa buff địch hữu hiệu | self | năng lượng +6 |
| RB-069 Bạch Phong Đao | Ấn khuyết quyết tâm / `rb069_passive` | armorBroken do đồng đội | địch bị phá giáp | 0.25× ATK |
| RB-070 Độc Ảnh | Lâm ảnh tiếp nhịp / `rb070_passive` | controlled do đồng đội | self | năng lượng +6 |
| RB-071 Hàn Giang Khách | Tĩnh thủy hồi tức / `rb071_passive` | controlled do đồng đội | self | năng lượng +5 |
| RB-072 Xích Dạ | Dạ tập thừa hư / `rb072_passive` | controlled do đồng đội | địch bị khống chế | 0.30× ATK |
| RB-073 Địa Ẩn | Phục địa phản kích / `rb073_passive` | shieldAbsorbed hữu hiệu trên self từ đòn chủ động | địch gây sát thương nếu có provenance | 0.30× ATK; không có provenance thì bỏ qua |
| RB-074 Lôi Ảnh | Tàn vũ hồi nhịp / `rb074_passive` | skillDamage do kỹ năng chủ động bản thân gây mất HP thật | self | năng lượng +4; toàn chuỗi ba hit chỉ một lần |
| RB-075 Vô Ảnh | Dư âm tiếp vận / `rb075_passive` | dispelled do đồng đội xóa buff địch hữu hiệu | self | năng lượng +6 |

### Guard bắt buộc

- Mỗi P2/P3/P4 của mỗi fighter tối đa một lần/action gốc; toàn chuỗi tối đa 12 phản ứng, sâu tối đa 4. Cast và act bàn cờ là hai action gốc riêng. Một action ba hit hoặc AoE ba người không reset guard theo hit/target.
- Theo thứ tự P2 → P3 → P4 khi cùng fighter đủ điều kiện, giữ thứ tự fighter/signal của engine. Không tự mở lại P1 từ chase; P2/P4 không tự kích từ hiệu ứng của chính phản ứng đó. P3 nối tiếp theo provenance và guard hiện hành.
- Loại DoT, regen, phản đòn, hút máu, hết lương và nguồn không phải action chủ động/bàn cờ khỏi các trigger yêu cầu chủ động. Người gục/freeze/silence không phản ứng theo luật hiện hành.
- Không hồi năng lượng khi đã đầy, không trừ dưới 0, không tính hồi HP dư là hồi hữu hiệu; năng lượng clamp 0–100. Hồi/Khiên theo F một lần; không cộng thêm hệ số nâng chủ động vào passive.
- Phản kích cần attacker provenance mới đã ghi rõ trong P4 RB-066/073; nếu dữ liệu không xác định được địch nguồn thì bỏ qua. Đây là yêu cầu mở rộng dữ liệu cần kiểm tra khi implement, không khẳng định engine đã trả attacker.

## Poison của kim châm độc — proposal hoàn chỉnh cho mô phỏng

Không tráo tên burn thành độc. `poison` chưa có trong EffectKind/scaleSkill/cleanse registry; mọi quy tắc sau là **đề xuất mới**, không sửa runtime ở PR này.

| Thuộc tính | Quy tắc |
|---|---|
| Nguồn | một fighter instance (side,index), không chỉ character ID; lưu nguồn khi áp |
| Áp lần đầu | sau hit trực tiếp của rb070_ultimate nếu địch còn sống; 100% nếu đích hợp lệ |
| Lượng mỗi tick | snapshot ATK gốc trong trận của nguồn sau cấp/gear, trước buff/debuff, lúc áp ×0.12×m(cấp kỹ năng); không cộng lại hệ số m ở tick; tối đa cấp 5 là 0.168× ATK snapshot |
| Thời hạn | đúng 2 tick ở cuối **lượt thường của phe mục tiêu**; lượt thêm không tick và không trừ thời hạn; không tick cho mỗi cast/hit |
| Stack | tối đa một stack/nguồn/mục tiêu, tối đa hai nguồn khác nhau/mục tiêu |
| Cùng nguồn áp lại | giữ tick damage mạnh hơn, làm mới còn 2 tick; không tick ngay, không cộng damage |
| Nguồn mới khi đủ cap | từ chối stack mới; không đẩy stack cũ ngầm; damage trực tiếp vẫn có tác dụng |
| DEF và Khiên | tick bỏ DEF nhưng **Khiên hấp thụ trước HP**; không xuyên Khiên mặc định; không tạo shieldAbsorbed/chase từ tick |
| Các hệ số khác | tick không crit, không nguyên tố/Sĩ khí/P1 hay hút máu thêm lần nữa; F không giảm damage độc; giống quy ước nguồn gián tiếp |
| Giải độc | cleanse loại debuff xóa tất cả stack độc trước tick; dispel buff địch không phải cleanse |
| Làm tròn tick | Math.round lượng tick trước khi Khiên hấp thụ; không round lại phần sát thương sau Khiên |
| Thứ tự | hoàn tất action/cascade/chase → ở mốc cuối lượt thường, tick theo thứ tự fighter/nguồn ổn định → giảm số tick → xóa stack hết hạn; dừng khi chết/trận kết thúc |
| Nguồn chết | độc đã áp vẫn tồn tại, dùng snapshot ATK; không hồi sinh nguồn; mục tiêu chết thì xóa stack của người đó |
| Phản ứng | không tạo skillDamage/controlled/armorBroken/chase/P1 hoặc hồi/trừ năng lượng; không lan độc/giảm hồi máu |

Quy tắc không tick ở lượt thêm thay câu proposal sơ bộ “bao gồm lượt thêm” để nhất quán bộ đếm thời hạn chung. Nếu engine chưa biểu diễn được stack/provenance thì trì hoãn riêng poison; không âm thầm đổi sang burn hoặc công bố nghề đã hoàn chỉnh runtime.

## Loadout và chỉ số 14 nhân vật

Mỗi dòng bên dưới có đúng sáu chủ động và P1–P4; chỉ tham chiếu ID vào bảng nguồn chính ở trên, không chép lại số liệu. Tất cả số liệu nền chưa gear. Giá mua RB-062–075: **1.500 vàng/người**, mức basic hiện có; Shan chốt khi triển khai PROF ngày 30/10/2026. Không tự cấp cho hồ sơ cũ. Mở bán phụ thuộc feature flag và nghiệm thu PROF-06. Độ hiếm, trang bị và Đinh Bộ Lĩnh biến thể mới không bổ sung trong thiết kế này.

### RB-062 — Bạch Nỏ Lang · Xạ thủ / Kim

**Vũ khí:** Nỏ nặng W01. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Luyện Kim Thành Kiếm / `element_luyenKimThanhKiem` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Thiết Nỏ Phá Thành / `rb_bnl_thietNoPhaThanh` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Kim Ý Ngưng Thần / `element_kimYNgungThan` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `kim1` | Chase hệ thứ nhất |
| P4 | Nỏ thành bền bỉ / `rb_bnl_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `kim2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-063 — Thanh Lâm Xạ · Xạ thủ / Mộc

**Vũ khí:** Cung tre W01. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Lục Diệp Phong / `element_lucDiepPhong` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Lục Tiễn Trói Đường / `rb_tlx_lucTienTroiDuong` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Linh Mộc Hồi Sinh / `element_linhMocHoiSinh` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `moc1` | Chase hệ thứ nhất |
| P4 | Rễ hộ người / `rb_tlx_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `moc2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-064 — Lam Giang Phi Diệp · Xạ thủ / Thủy

**Vũ khí:** Phi tiêu lá liễu W02. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Thủy Nguyệt Tụ Linh / `element_thuyNguyetTuLinh` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Liễu Diệp Tỏa Giang / `rb064_lieuDiepToaGiang` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Thanh Lưu Tẩy Trần / `element_thanhLuuTayTran` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `thuy1` | Chase hệ thứ nhất |
| P4 | Cảnh giới bến sông / `rb064_canhGioi` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `thuy2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-065 — Xích Diệm Luân · Xạ thủ / Hỏa

**Vũ khí:** Phi luân W02. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Phóng Hỏa Thiêu Doanh / `element_phongHoaThieuDoanh` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Xích Luân Liệt Trận / `rb065_xichLuanLietTran` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Nộ Hỏa Thiêu Thân / `element_noHoaThieuThan` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `hoa1` | Chase hệ thứ nhất |
| P4 | Hỏa cốt truy kích / `rb065_hoaCot` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `hoa2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-066 — Trấn Sơn Thạch · Xạ thủ / Thổ

**Vũ khí:** Phi hoàng thạch W02. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Hậu Thổ Tích Lương / `element_hauThoTichLuong` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Trấn Sơn Hộ Trận / `rb066_tranSonHoTran` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Thạch Giáp / `element_thachGiap` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `tho1` | Chase hệ thứ nhất |
| P4 | Sơn trấn kiên thủ / `rb066_kienThu` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `tho2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-067 — Lôi Minh Xạ · Xạ thủ / Lôi

**Vũ khí:** Phi châm bản lớn W02. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Lôi Trụ Giáng Thế / `element_loiTruGiangThe` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Lôi Châm Tước Khí / `rb067_loiChamTuocKhi` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Tĩnh Điện Hộ Thân / `element_tinhDienHoThan` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `loi1` | Chase hệ thứ nhất |
| P4 | Chớp thời cơ / `rb067_chopThoiCo` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `loi2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-068 — Tật Phong Lăng · Xạ thủ / Phong

**Vũ khí:** Lụa chiến W02. **Chỉ số cấp 1:** HP 475, ATK 55, DEF 9. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Định Điểm / `role_xaThu_dinhDiem` | Bảng nghề |
| 2 | Phong Quyển Tàn Vân / `element_phongQuyenTanVan` | Bảng hệ |
| 3 | Phá Giáp / `role_xaThu_phaGiap` | Bảng nghề |
| 4 | Phong Lăng Nhiễu Trận / `rb068_phongLangNhieuTran` | Bảng tuyệt chiêu |
| 5 | Tập Kích / `role_xaThu_tapKich` | Bảng nghề |
| 6 | Thanh Phong Tụ Khí / `element_thanhPhongTuKhi` | Bảng hệ |
| P1 | `marksmanPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `marksmanPrepared` | Chase nghề |
| P3 | `phong1` | Chase hệ thứ nhất |
| P4 | Thuận gió hồi nhịp / `rb068_hoiNhip` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `phong2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-069 — Bạch Phong Đao · Sát thủ / Kim

**Vũ khí:** Dao găm W02. **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Luyện Kim Thành Kiếm / `element_luyenKimThanhKiem` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Thiết Ấn Đoạt Mệnh / `rb069_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Kim Ý Ngưng Thần / `element_kimYNgungThan` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `kim1` | Chase hệ thứ nhất |
| P4 | Ấn khuyết quyết tâm / `rb069_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `kim2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-070 — Độc Ảnh · Sát thủ / Mộc

**Vũ khí:** Kim châm độc W02. **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Lục Diệp Phong / `element_lucDiepPhong` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Độc Ảnh Tiềm Châm / `rb070_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Linh Mộc Hồi Sinh / `element_linhMocHoiSinh` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `moc1` | Chase hệ thứ nhất |
| P4 | Lâm ảnh tiếp nhịp / `rb070_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `moc2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-071 — Hàn Giang Khách · Sát thủ / Thủy

**Vũ khí:** Lưỡi dao ẩn W02. **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Thủy Nguyệt Tụ Linh / `element_thuyNguyetTuLinh` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Hàn Giang Tàng Nhận / `rb071_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Thanh Lưu Tẩy Trần / `element_thanhLuuTayTran` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `thuy1` | Chase hệ thứ nhất |
| P4 | Tĩnh thủy hồi tức / `rb071_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `thuy2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-072 — Xích Dạ · Sát thủ / Hỏa

**Vũ khí:** Song đao W02. **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Phóng Hỏa Thiêu Doanh / `element_phongHoaThieuDoanh` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Xích Dạ Song Sát / `rb072_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Nộ Hỏa Thiêu Thân / `element_noHoaThieuThan` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `hoa1` | Chase hệ thứ nhất |
| P4 | Dạ tập thừa hư / `rb072_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `hoa2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-073 — Địa Ẩn · Sát thủ / Thổ

**Vũ khí:** Móng vuốt W02. **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Hậu Thổ Tích Lương / `element_hauThoTichLuong` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Địa Phục Liệt Trảo / `rb073_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Thạch Giáp / `element_thachGiap` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `tho1` | Chase hệ thứ nhất |
| P4 | Phục địa phản kích / `rb073_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `tho2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-074 — Lôi Ảnh · Sát thủ / Lôi

**Vũ khí:** Bạo Vũ Lê Hoa Châm `RB-074-W03`: một hộp tròn dẹt cỡ lòng bàn tay, vỏ đồng cũ, mặt sắt sẫm, hai vòng đồng tâm và hoa lê giữa mặt; tay phải cầm, tay trái không cầm vũ khí. Thay hộp chữ nhật ba khe W02; hộp luôn đóng, châm/sét là VFX riêng. Sáu tư thế và hình học chi tiết ở [nguồn prompt](./09-14-heroes-character-and-frame-prompts-v4-3.md#rb-074--lôi-ảnh--sát-thủ--lôi). **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Lôi Trụ Giáng Thế / `element_loiTruGiangThe` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Bạo Vũ Lê Hoa / `rb074_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Tĩnh Điện Hộ Thân / `element_tinhDienHoThan` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `loi1` | Chase hệ thứ nhất |
| P4 | Tàn vũ hồi nhịp / `rb074_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `loi2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

### RB-075 — Vô Ảnh · Sát thủ / Phong

**Vũ khí:** Sáo trúc âm công W02. **Chỉ số cấp 1:** HP 450, ATK 58, DEF 8. Giữ nguyên nhân dạng và sáu khung tại nguồn prompt.

| Ô | Kỹ năng / ID | Nguồn thông số |
|---|---|---|
| 1 | Thừa Hư / `role_satThu_thuaHu` | Bảng nghề |
| 2 | Phong Quyển Tàn Vân / `element_phongQuyenTanVan` | Bảng hệ |
| 3 | Đoạt Khí / `role_satThu_doatKhi` | Bảng nghề |
| 4 | Vô Thanh Đoạt Phách / `rb075_ultimate` | Bảng tuyệt chiêu |
| 5 | Truy Mệnh / `role_satThu_truyMenh` | Bảng nghề |
| 6 | Thanh Phong Tụ Khí / `element_thanhPhongTuKhi` | Bảng hệ |
| P1 | `assassinPreparedOpportunity` | Cơ hội chuẩn bị nghề |
| P2 | `assassinPrepared` | Chase nghề |
| P3 | `phong1` | Chase hệ thứ nhất |
| P4 | Dư âm tiếp vận / `rb075_passive` | Bảng bị động cá nhân |

Không trang bị chase hệ thứ hai `phong2`. Khung 3 minh họa ô 3, khung 4 minh họa ô 4; các giá trị chỉ áp khi triển khai và kiểm chứng sau.

## Kiểm tra số học và điều kiện nghiệm thu

Các ví dụ kiểm số học dưới đây **không phải mô phỏng trận** hoặc bằng chứng cân bằng. Quy ước ATK=100, DEF địch=20, Sĩ khí/nguyên tố=1, không Khiên/P1/buff, làm tròn ở cuối mỗi hit:

| Trường hợp | Kết quả kỳ vọng |
|---|---|
| Định Điểm cấp 1 | round(160×100/118) = 136 HP; cost 30 |
| Định Điểm cấp 5 | round(224×100/118) = 190 HP; cost 25; pierce vẫn 10% |
| Truy Mệnh cấp 1, ngoài execute | round(235×100/120) = 196 HP |
| Truy Mệnh cấp 5, đủ execute | round(329×1.30×100/120) = 356 HP; cost 55 |
| Bạo Vũ Lê Hoa cấp 1 | mỗi hit round(75×100/120)=63; ba hit =189 HP nếu địch sống đủ chuỗi, không round tổng thành188; trừ NL chỉ20 |
| Độc cấp 1 / 5, không Khiên | mỗi tick 12 / 17 HP với round(16.8)=17; hai tick24 /34 HP, không tick lượt thêm |

Trước mở hai nghề: mô phỏng đối xứng ghế/seed 1v1, 3v3; so vai trò với sáu nghề đang chạy, không chỉ mirror. Phủ cấp nhân vật1/10/20/30, chiêu1/3/5, gear0 và gear đại diện; báo HP/ATK/DEF, tỷ lệ thắng kèm CI95%, thời lượng/censored, P1/P2/P3/P4 đóng góp, năng lượng thực, DoT và giới hạn phản ứng. Mục tiêu review: không gây vòng hoàn NL vô hạn, không vượt12 phản ứng/sâu4, không nhân vùng phá theo số địch/hit, không làm mất vai trò nghề cũ. Chưa đặt ngưỡng tỷ lệ thắng như tiêu chuẩn đã đạt khi chưa có mô phỏng.

> TODO: Triển khai/harness ở task riêng sau khi review bảng này; đối chiếu tile nghề, alias cungThu→xaThu, comboReady, provenance attacker, poison, tooltip/AI/server-authoritative và snapshot/save. Không chạm runtime trong lần cập nhật docs này.
