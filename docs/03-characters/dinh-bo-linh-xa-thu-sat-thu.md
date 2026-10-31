# Đinh Bộ Lĩnh — thêm nghề Xạ thủ và Sát thủ

> Cập nhật: 31/10/2026
> Trạng thái: **DRAFT** — Shan yêu cầu thêm hai nghề mới cho nhân vật chính ngày 31/10/2026; số liệu dưới đây là điểm xuất phát để review/mô phỏng. Chưa có code: hiện `mainCharacter` và `isLeaderProfession` vẫn chỉ nhận sáu nghề cũ.

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

## Tác động lên hồ sơ và giao diện

1. **Danh sách nghề của nhân vật chính:** thêm hằng số riêng cho nhân vật chính (đề xuất `LEADER_PROFESSIONS` = 8 nghề) và đổi `isLeaderProfession`, `mainCharacter`, `DBL_ULTIMATES`. Hiện nhiều nơi tách nghề nhân vật chính bằng `LEGACY_PROFESSIONS` (thử thách hằng ngày, Tháp/Destiny, Sinh tồn, Đấu trường, bộ chọn trong SetupLobby/ChapterOne/Sinh tồn/ElementPicker): từng nơi phải được duyệt khi đổi.
2. **Hồ sơ cũ:** trường `unavailableLeaderProfession` đã giữ nghề Xạ thủ của hồ sơ cũ (`cungThu`). Khi mở nghề thì khôi phục thành nghề đang chọn rồi xóa trường; không đổi XP, điểm, vàng, đồ.
3. **Cấp kỹ năng:** nâng theo ô (`o1`…`o6`) nên đổi nghề giữ nguyên cấp nâng; không cần migration điểm.
4. **Mode và luật tầng:** Campaign/Sinh tồn/Tháp phải chấp nhận nghề mới cho thủ lĩnh, kể cả `bannedProfessions` và `minProfessions` của luật tầng. Mô phỏng 56 tổ hợp thay cho 42 trong các harness (audit, task2/3/4).
5. **Test:** các test đang khẳng định 42 tổ hợp của Đinh Bộ Lĩnh (progress, loadout, combos, chase-baseline, spirit-audit) đổi thành 56.

## Hình ảnh

Rig Đinh Bộ Lĩnh hiện dùng một thanh kiếm cho mọi nghề (`public/art/characters/dinh-bo-linh/`). Bản đầu **không** thêm art mới: Xạ thủ/Sát thủ hiển thị bằng hình hiện có và icon nghề đã vẽ tay. Biến thể vũ khí theo nghề cho nhân vật chính (nỏ/dao găm) nếu cần sẽ là task art riêng, cần duyệt Master.

> TODO: Chốt có làm biến thể vũ khí theo nghề cho Đinh Bộ Lĩnh hay không; nếu không, kiểm tra nhìn bằng mắt rằng cầm kiếm khi chọn Xạ thủ/Sát thủ không gây hiểu nhầm trong tooltip và hồ sơ.
