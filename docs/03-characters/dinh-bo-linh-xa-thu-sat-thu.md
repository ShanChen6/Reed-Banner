# Đinh Bộ Lĩnh — thêm nghề Xạ thủ và Sát thủ

> Cập nhật: 31/10/2026
> Trạng thái: **IMPLEMENTED** — Shan yêu cầu ngày 31/10/2026 và duyệt số liệu cùng ngày; code đã có trên `develop`. Số liệu vẫn là điểm xuất phát chờ mô phỏng. Biến thể hình ảnh là DRAFT, xem [art](../06-art/prompts/dinh-bo-linh-xa-thu-sat-thu.md).

Nguồn chính của việc mở **Xạ thủ** và **Sát thủ** cho Đinh Bộ Lĩnh. Luật nhân vật chính (chọn nghề trước trận, đổi hệ trước trận, 6 chủ động + bị động) nằm ở [mô hình nhân vật](ky-nang/mo-hinh-nhan-vat.md#2-nhân-vật-chính-đinh-bộ-lĩnh) và không đổi: 8 nghề × 7 hệ = **56** cách dựng thay cho 42. Bộ chiêu nghề, chỉ số nền và bốn bị động của hai nghề dùng lại từ [thiết kế Xạ thủ/Sát thủ](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md); không chép lại ở đây.

## Dùng lại, không tạo mới

| Thành phần | Nguồn cho Đinh Bộ Lĩnh |
|---|---|
| Ô 1/3/5 (chiêu nghề) | Giống nhân vật kèm: Xạ thủ Định Điểm / Phá Giáp / Tập Kích; Sát thủ Thừa Hư / Đoạt Khí / Truy Mệnh |
| Ô 2/6 (chiêu hệ) | Chiêu hệ chung hiện có, không đổi |
| Chỉ số nền | Xạ thủ 475/55/9, Sát thủ 450/58/8 (`BASE_STATS` đã có); cùng tăng trưởng và hệ số HP solo như nghề cũ |
| Bị động | Mẫu mặc định của nhân vật chính: một cơ hội nghề (`pursuit` cho Xạ thủ, `resonance` cho Sát thủ) + bị động nghề (`marksmanPrepared` / `assassinPrepared`) + hai bị động hệ (`<hệ>1`, `<hệ>2`). Không có P4 cá nhân vì Đinh Bộ Lĩnh không có chiêu riêng theo nhân vật |
| Vũ khí, bộ trang bị | Vũ khí Xạ thủ/Sát thủ đã có trong kho đồ; Đinh Bộ Lĩnh dùng như đồng hành, theo luật "mỗi nghề dùng vũ khí riêng" |
| Mở khóa theo cấp | Giữ nguyên: ô 1/2 cấp 1, ô 3 cấp 5, ô 4 cấp 10, ô 5 cấp 15, ô 6 cấp 20 |

## Việc cần thiết kế mới: 14 tuyệt chiêu ô 4

Ô 4 của Đinh Bộ Lĩnh là tuyệt chiêu theo **nghề × hệ** (`dbl_<nghề>_<hệ>`), ghép từ một "chiêu kết nghề" và một "vị hệ", chi phí 80 năng lượng (xem `DBL_ULTIMATES`). Hai nghề mới cần thêm hai chiêu kết nghề; bảy vị hệ giữ nguyên, cho ra 14 ID mới.

| Nghề | Chiêu kết / hiển thị | Target | Bước (điểm xuất phát) |
|---|---|---|---|
| Xạ thủ | Vạn tiễn · `<Hệ>` | allEnemies | 1.1× ATK mỗi địch → DEF địch −15% trong 2 lượt → phá ngẫu nhiên 3 ô, đúng một lần/action → vị hệ |
| Sát thủ | Tuyệt mệnh · `<Hệ>` | enemy | 2.7× ATK, HP trước đòn ≤35% thì ×1.30, không tự kết liễu → bản thân +5 năng lượng nếu gây mất HP thật → vị hệ |

Vị hệ dùng nguyên bảng hiện có (Kim: Công+ đội, Mộc: hồi đội, Thủy: xua tan + Khiên, Hỏa: DEF địch −, Thổ: Khiên đội, Lôi: trừ năng lượng địch, Phong: cộng năng lượng đội); xem [danh sách chiêu hệ](ky-nang/README.md).

Lý do chọn số:
- Vạn tiễn là tuyệt chiêu diện rộng thấp damage từng mục tiêu (so Pháp sư "Thiên uy" 2.2×) để không vượt nghề diện rộng cũ; giá trị nằm ở phá giáp và phá ô.
- Tuyệt mệnh đánh đơn mục tiêu thấp hơn Tướng sĩ "Bình định" (3.2× xuyên giáp) nhưng có ngưỡng kết liễu; không thêm trừ năng lượng riêng vì vị hệ Lôi đã trừ 15, tránh cộng dồn khống chế năng lượng.
- Các hiệu ứng cùng loại không cộng thẳng (DEF − của Vạn tiễn + Hỏa lấy giá trị mạnh hơn); theo [quy ước trùng hiệu ứng](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md#quy-ước-dùng-chiêu-và-tăng-cấp).

> TODO: Số liệu 1.1×/15%/2.7×/ngưỡng 35%/+5 năng lượng là điểm xuất phát; cần mô phỏng cân bằng so với 6 nghề hiện có trước khi triển khai. Tên chiêu kết "Vạn tiễn" và "Tuyệt mệnh" là đề xuất.

## Tác động lên hồ sơ và giao diện (đã làm)

1. **Danh sách nghề của nhân vật chính:** `LEADER_PROFESSIONS` (= mọi nghề đã mở) thay cho `LEGACY_PROFESSIONS` ở `isLeaderProfession`, `mainCharacter`, `DBL_ULTIMATES`, bộ chọn nghề (SetupLobby, ChapterOne, Sinh tồn, ElementPicker), thử thách hằng ngày, Đấu trường, Tháp/Destiny và các harness mô phỏng.
2. **Hồ sơ cũ:** nghề Xạ thủ lưu từ trước (`cungThu`) được khôi phục thành nghề đang chọn khi đọc hồ sơ; trường `unavailableLeaderProfession` đã bỏ. Không đổi XP, điểm, vàng, đồ.
3. **Cấp kỹ năng:** nâng theo ô (`o1`…`o6`) nên đổi nghề giữ nguyên cấp nâng; không cần migration điểm.
4. **Mode và luật tầng:** Campaign/Sinh tồn/Tháp chấp nhận nghề mới cho thủ lĩnh, kể cả `bannedProfessions` và `minProfessions`. Các harness mô phỏng (audit, task2/3/4) quét 56 tổ hợp thay cho 42.
5. **Test:** các test từng khẳng định 42 tổ hợp của Đinh Bộ Lĩnh nay khẳng định 56.

## Hình ảnh

Shan đồng ý thiết kế lại hình (31/10/2026): chỉ hai nghề mới có biến thể vũ khí (Xạ thủ cầm cung tre, Sát thủ cầm dao găm cầm ngược), sáu nghề cũ giữ kiếm. Đặc tả và prompt: [Đinh Bộ Lĩnh — biến thể hình ảnh](../06-art/prompts/dinh-bo-linh-xa-thu-sat-thu.md). Ảnh chưa được tạo nên hiện hai nghề này vẫn hiển thị bằng bản kiếm.

> TODO: Tạo và duyệt Master, tách lớp, và thêm hỗ trợ biến thể trong rig (đang chưa có code); xem mục nghiệm thu ở file art.
