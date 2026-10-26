# CAMP-03.03 — Tướng đồng hành và mốc tuyển quân

> Cập nhật: 24/10/2026. Theo [Design Freeze 1.0](design-freeze.md) mục 4.2 (recruit milestones) và mục 5 (Raid/sứ quân), [narrative-bible.md](narrative-bible.md) mục cameo, [history-sources.md](history-sources.md). Runtime: `src/core/campaign/recruits.ts`.

Mở khóa đồng hành là **phần thưởng gameplay**, không phải mốc lịch sử về việc ai gia nhập lúc nào. UI ghi "Mở khóa đồng hành", không ghi "gia nhập".

## 1. Audit trước khi sửa

| Nơi | Trước task | Vấn đề |
|---|---|---|
| `campaign.ts` (13 màn cũ) `joins` + `applyCampaignResult` | Qua màn cũ lần đầu là tướng vào đội: coLau → Nguyễn Bặc, boHai → Đinh Điền, dangChau → Lưu Cơ, binhKieu → Trịnh Tú, tamDai → Lê Hoàn, **phongChau → Đinh Liễn** | Hai đường tuyển song song với V2; Đinh Liễn "gia nhập" sau khi hạ Kiều Công Hãn như một bại tướng mới; Lê Hoàn gia nhập ở Tam Đái trước 968 không có nguồn |
| `CampaignScreen.tsx` màn cũ | Khung "Qua màn để chiêu mộ … · {joinStory}" | Câu kể gia nhập không có nguồn |
| `ShopPanel.tsx` | Tướng lịch sử: "Mở sau màn …" theo màn cũ | Chỉ tới màn cũ |
| `profile.ts` `shopUnlocked` | Sứ quân mở bán khi `legacy.cleared` có màn cũ | Freeze mục 7 yêu cầu map sang M08–M21 |
| `rewards.ts` `applyCampaignFirstClear` | Đã cấp tướng theo mốc V2, phiếu `hero:<id>`, giữ nguyên tướng đã có | Không cần sửa (duplicate guard đã đúng) |
| Quest/achievement | `w.campaign5` đếm trận thắng campaign/raid; thành tựu đếm `campaign.completed` | Không khóa theo stageId cũ, không cần sửa |
| `src/core/campaign/recruits.ts` | Chưa tồn tại | Tạo mới |

## 2. Bảng mốc tuyển (đã khóa trong code, tự kiểm khi nạp module)

| Tướng | Mốc mở khóa | Vai trò lịch sử (trong giới hạn nguồn) | Basis | Confidence | Nguồn | Không được khẳng định |
|---|---|---|---|---|---|---|
| Đinh Liễn | M04, hết Chương I | Con trưởng Đinh Bộ Lĩnh; con tin năm 951; cùng cha nương Trần Minh Công; về Hoa Lư sau 965 | `recorded` | vừa | E04a, S02, E08, S01, E06 | Không gia nhập ở Phong Châu hay sau khi hạ sứ quân; không là bại tướng; không định tuổi |
| Nguyễn Bặc | M08, hết Chương II | Người cùng quê Hoa Lư trong truyện cờ lau | `legend` | thấp | E12, S07 | Không tuyển ở M01 hay Bố Hải |
| Đinh Điền | M12, hết Chương III | Nhóm bạn thuở nhỏ trong truyện cờ lau | `legend`, `fictional` | thấp | E12, S07 | Không có nhiệm vụ quân sự cụ thể nào là sử chép |
| Lưu Cơ | M16, hết Chương IV | Liên hệ sớm theo lớp truyền thuyết Hoa Lư | `legend`, `fictional` | thấp | E12, S07 | Vai trò quân sư là game; không gán hạ Lý Khuê hay sứ quân nào |
| Trịnh Tú | M20, hết Chương V | Liên hệ sớm theo lớp truyền thuyết Hoa Lư | `legend`, `fictional` | thấp | E12, S07 | Y tế/hậu cần là game |
| Lê Hoàn | M24, hết Chương VI | S04 ghi chức vụ dưới triều Đinh sau 968; không cho biết theo từ lúc nào | `recorded`, `reconstructed` | vừa | S04, E10 | Không gia nhập ở Tam Đái hay trước 968 |

Tên khớp `HERO_COMPANIONS`. Field trong code là `historicalConfidence` (`high`/`medium`/`low`), là trường `historical_confidence` mà task yêu cầu, viết theo kiểu camelCase của repo. Không tướng nào được `high`, vì ledger chưa có nguồn chính sử riêng cho thời điểm gia nhập. `recruitTableErrors()` chặn: lệch mốc so với `STORY_NODES`, sai tên, mã nguồn ngoài allowlist, `high` khi không có `recorded`.

Nghề và nguyên tố (`gameRole`) là lớp game, không dùng để chứng minh lịch sử.

## 3. Thay đổi cơ chế

- Màn cũ **không còn chiêu mộ**. `joins` chỉ còn cho mô phỏng `pnpm sim -- --team heroes`, đánh dấu `@deprecated`; `joinStory` không còn hiển thị. Tướng lịch sử chỉ đến từ mốc V2 qua `applyCampaignFirstClear`, cấp trong cùng một lần ghi CAS với hoàn thành chương, có phiếu `hero:<id>`.
- Duplicate guard giữ nguyên: đã có tướng thì giữ cấp, XP, điểm kỹ năng và trang bị, không tạo bản sao, không bồi thường; mở lại mốc thì thưởng 0.
- Cửa hàng sứ quân: `shopUnlocked` dùng `warlordUnlockMission(id)` (cùng mốc mở Đánh trùm trong freeze mục 5: Trần Lãm M08, Phạm Bạch Hổ M11, … Đỗ Cảnh Thạc M21) thay cho `legacy.cleared`. Giá không đổi. Server dùng chung `applyProfileAction`, nên kiểm tra phía server.
- `ShopPanel`: tướng lịch sử hiện "Mở khóa đồng hành sau Mxx …", sứ quân hiện "Mở bán sau Mxx …".
- Dữ liệu dev: hồ sơ nào đã có tướng nhờ màn cũ thì **giữ nguyên** (không xóa companion theo reset-policy); mốc V2 về sau chỉ ghi phiếu. Sứ quân đã mua vẫn giữ; sứ quân chưa mua thì phải qua nhiệm vụ V2 mới mua được.

## 4. Đề xuất chia nhân vật theo chương và ranh giới thời đại

Phạm vi thời gian của Campaign: **939–968**. Mốc 970 (niên hiệu Thái Bình, E11) chỉ dùng để loại trừ, không thuộc câu chuyện.

| Chương | Mốc chương | Đồng hành sở hữu được (cộng dồn) | Cameo trong lời kể (không phải tuyển) | Ghi chú thời đại |
|---|---|---|---|---|
| I Hoa Lư dựng cờ | M04 | Đinh Liễn | Nguyễn Bặc, Đinh Điền (M01, M03) | 944–951; Đinh Liễn là nhân vật có sử chép sớm nhất |
| II Nghĩa tình Bố Hải | M08 | + Nguyễn Bặc | Trịnh Tú (M05), Đinh Điền (M07), Trần Minh Công (đồng minh, không sở hữu được trong story) | Bố Hải, thời điểm còn tranh luận (U02) |
| III Nhà Ngô rạn vỡ | M12 | + Đinh Điền | Lưu Cơ (M10), Đinh Liễn (M09) | Sau 965 |
| IV Miền tây tự giữ | M16 | + Lưu Cơ | Lưu Cơ (M14) | Tuyến địa lý, không chronology |
| V Vòng cung phía đông | M20 | + Trịnh Tú | Lưu Cơ, Đinh Điền (M17), Trịnh Tú (M18), Lê Hoàn (M19, chỉ dự thính) | Song song chương IV |
| VI Về một mối | M24 | + Lê Hoàn | Lê Hoàn (M22–M24), cả sáu (M23) | 968; Lê Hoàn mở sau 968 vì S04 chỉ ghi chức vụ thời Đinh |

Ranh giới:
- **Không có nhân vật lịch sử thế kỷ XI–XII** (thời Lý, Trần) trong tuyến 965–968. Đã rà `ALL_COMPANIONS`: 42 tướng thường đều là tên hư cấu, 6 tướng lịch sử và 12 sứ quân đều thuộc thế kỷ X. Nếu sau này thêm nhân vật đời sau, nên đặt ở chế độ ngoài Campaign (Tháp, Đấu trường) và ghi rõ là "khách mời ngoài thời đại".
- Với M11 (Đằng Châu, hội kiến không trận), đội 3 người là: Đinh Bộ Lĩnh + Đinh Liễn + Nguyễn Bặc, hoặc hai tướng khởi đầu Hà Vân, Mai Thanh. Trận 3vs3 kế tiếp có tướng lịch sử là M15.
- Trần Minh Công và 11 sứ quân khác chỉ mua được ở cửa hàng sau mốc của họ, như lựa chọn gameplay; lời kể không gọi đó là "quy phục" hay "gia nhập".
