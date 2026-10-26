# CAMP-04.01: Ghi chú nguồn ba tuyến quy phục (M11–M13)

> Cập nhật: 24/10/2026. Áp dụng [Design Freeze 1.0](design-freeze.md) mục 2, 3, 5, 6 và invariant 3, 4, 6, 10. Ledger [history-sources.md](history-sources.md) không đổi; file này chỉ ghi locator và câu trích đã dùng trong `src/core/campaign/chapterThree.ts` và `chapterFour.ts`.

## Mã nhiệm vụ

Task CAMP-04.01 gọi ba nhiệm vụ là "M08–M10" của Chương III. Theo quy ước Shan chốt ngày 24/10/2026 (luôn dùng mã freeze), ba nhiệm vụ là:

| Task | Freeze | Tên | Chương theo freeze | Sứ quân | Kết cục (FactionState) |
|---|---|---|---|---|---|
| M08 | **M11** | Đằng Châu quy phục | III | Phạm Bạch Hổ (W02) | `submitted`, `recordedSubmission`, confidence cao |
| M09 | **M12** | Bình Kiều tự định | III | Ngô Xương Xí (W03) | `submitted`, `reconstructedAccord`, confidence vừa |
| M10 | **M13** | Đường Lâm và lời cam kết | IV | Ngô Nhật Khánh (W04) | `submitted`, `politicalAccord`, confidence vừa |

M13 vẫn ở Chương IV như freeze; đổi chương cần amendment nên không làm. Để Chương III chơi tới M11 được, bản này viết thêm lời dẫn ngắn cho hai nhiệm vụ cầu nối M09 "Tin dữ năm 965" và M10 "Bản đồ không có thứ tự" theo đúng mission matrix.

**Tại sao Phạm Bạch Hổ là `submitted` chứ không `allied`**: chính văn Toàn thư mục 967 chép "đem binh về hàng" (E09), warlord-matrix W02 phân loại **quy phục**, confidence cao. Liên minh (`allied`) chỉ dùng cho Trần Lãm (W01).

## Trích Toàn thư (S01)

Nguồn: [Đại Việt sử ký toàn thư, Ngô sứ quân](https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/Ngô_sứ_quân), bản dịch Wikisource, mở lại ngày 24/10/2026.

| Locator | Câu trích ngắn | Dùng ở | Nhãn |
|---|---|---|---|
| Mục 966, danh sách | "Phạm Bạch Hổ, xưng là Phạm Phòng Át, giữ Đằng châu." | M11 intro, ghi chú | `recorded` W02, S01 |
| Mục 967 | "Phạm Phòng Át đem binh về hàng." | M11 outro, ghi chú | `recorded` E09, S01 |
| Lời chua Đằng Châu | Nay xã Đằng Châu, huyện Kim Động, tỉnh Hưng Yên có đền thờ Phạm sứ quân | M11 ghi chú, khoanh bản đồ Chương III | `recorded` (lời chua đời sau) |
| Mục 966 | "Xương Xí giữ Bình Kiều"; mở mục ghi con Thiên Sách Vương | M12 intro | `recorded` W03 |
| Lời chua Bình Kiều | "Bình Kiều, nay không rõ chỗ nào." | M12 intro, khung chương | `disputed` U03 |
| Mục 966 | "Ngô Nhật Khánh, xưng là Ngô Lãm Công, giữ Đường Lâm — có thuyết nói là giữ Giao Thủy" | M13 intro, ghi chú | `recorded` W04 + `disputed` U04 |
| Lời chua Nhật Khánh | "Ngô Nhật Khánh, người trong họ Ngô Quyền." | M13 intro, ghi chú | `recorded` W04 |

Chức Thân vệ tướng quân của Phạm Phòng Át lấy theo tóm tắt E09 trong ledger.

## Tổng thuật và truyền thuyết

- **S06** (Bảo tàng Lịch sử Quốc gia): xếp Ngô Xương Xí và Ngô Nhật Khánh vào nhóm quy phục. Game ghi rõ đây là tổng thuật hiện đại, không phải chính sử.
- **S07** (Báo Ninh Bình): chuyện khao quân trước thành Bình Kiều là `legend`. Lựa chọn "Bày quân ngoài thành" ở M12 chỉ gợi không khí, không tái hiện.

## Hôn phối nhà Đinh với gia đình Ngô Nhật Khánh

Task yêu cầu ghi chi tiết hôn phối **nếu được kiểm chứng**. Kết quả: **chưa kiểm chứng**.

- Bản Toàn thư trên Wikisource dùng làm S01 dừng ở mục Ngô sứ quân ("HẾT TẬP THỨ HAI"); các mục kỷ nhà Đinh không có trong bộ nguồn đã mở.
- Ledger không có claim nào về hôn phối. Một số trang tổng hợp có kể, nhưng ledger cấm dùng wiki/tổng hợp để quyết định.
- Nếu có thì chuyện ấy thuộc giai đoạn sau năm 968, ngoài khung thời gian của Campaign.

Vì vậy M13 chỉ có một ghi chú `disputed` nói rõ là chưa kiểm chứng và game không kể chi tiết. Test `factions.test.ts` chặn việc ghi chú này mang nhãn `recorded`. Muốn kể thì phải bổ sung nguồn vào ledger trước.

## Điều không khẳng định

- Không có trận, quyết đấu, thanh máu hay điều kiện thắng ở M11–M13. Điều khoản, nơi gặp và lời thoại đều `fictional`/`reconstructed`.
- "Quy phục" không có nghĩa trung thành vĩnh viễn (W04). M13 ghi quan hệ về sau để ngỏ.
- Tước "Kiều công" (Ngô Xương Xí) và "Ngô Nam công/Ngô Nam Chỉ" (Ngô Nhật Khánh) không dùng trong lời kể V2. Fighter ở màn cũ và Đánh trùm vẫn giữ tước này (Shan chốt ngày 20/10); đổi sẽ là một task riêng.
- Thứ tự Đằng Châu → Bình Kiều → Đường Lâm là của game (U07).

## Runtime

- `src/core/campaign/factions.ts`: bảng 12 sứ quân → nhiệm vụ → kết cục, tự kiểm khi nạp (mỗi sứ quân một nhiệm vụ, mỗi nhiệm vụ một sứ quân).
- `CampaignProgressV2.factions`: ghi trong `applyCampaignFirstClear`, cùng CAS với vàng và phiếu thưởng. Parser dựng lại từ `completed`, nên không thể trùng hay lệch bảng.
- `/api/campaign/events` trả thêm `outcome.faction {id, status, recorded}`. Đường sự kiện không gọi `recordMatch`, không có XP, rơi đồ, đá hay lương, nên không cộng số trận thắng.
- Đánh trùm: `RAID_STORY_GATE` thêm `dangChau → M11`, `binhKieu → M12`, `duongLam → M13`, nhãn "Thách đấu giả định" (`raidFraming = "whatIf"`). Ba màn cũ đổi tên và lời thoại sang trận giả định; đối thủ, cấp và thưởng giữ nguyên, nên Tower, Survival, Daily và Arena không đổi. (Đã thay ngày 25/10/2026: ba sứ quân quy phục không còn là trùm Đánh trùm, design-freeze bổ sung 1.1; mốc M11–M13 chỉ mở bán ở cửa hàng.)
