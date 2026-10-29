# CAMP-03.01 — Ghi chú nguồn Chương II (M05–M06)

> Cập nhật: 24/10/2026. Áp dụng [Design Freeze 1.0](design-freeze.md) mục 2, 3, 5 và invariant 2, 3, 6, 10. Không đổi ledger [history-sources.md](history-sources.md); file này chỉ ghi locator và câu trích đã dùng trong `src/core/campaign/chapterTwo.ts`.

Mã nhiệm vụ theo freeze: task CAMP-03.01 gọi hai nhiệm vụ là "M04–M05"; Shan chốt ngày 24/10/2026 giữ mã freeze, nên hành trình là **M05 "Đường ra Bố Hải"** và hội kiến là **M06 "Hội kiến Trần Minh Công"**. M04 vẫn là "Hoa Lư, năm 951".

## Trích Toàn thư (S01)

Nguồn: [Đại Việt sử ký toàn thư — Ngô sứ quân](https://vi.wikisource.org/wiki/Đại_Việt_sử_ký_toàn_thư/Tập_II/Cuốn_thứ_năm/Ngô_sứ_quân), bản dịch tiếng Việt do Wikisource lưu, mở ngày 24/10/2026. Không phải nguyên văn Hán; chưa đối chiếu bản in hay bản scan.

| Locator | Câu trích ngắn | Dùng ở | Nhãn |
|---|---|---|---|
| Mục 966, danh sách sứ quân | “Trần Lãm, xưng là Trần Minh Công, giữ cửa biển Bố-Hải.” | M06 intro (diễn đạt lại) | `recorded` W01, S01 |
| Mục Đinh Mão 967 | “Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa.” | M05 intro, M06 ghi chú nguồn | `recorded` E08, S01 |
| Mục Đinh Mão 967, câu kế | “Minh Công thấy người mặt mũi khôi ngô, lại có độ lượng, bèn nuôi làm con. Nhân giao cho cầm quân…” | M06 outro, ghi chú nguồn | `recorded` E08, S01 |
| Phụ chú số 2 (lời bàn) | Ý: Minh Công dấy binh chắc ở trước khi Xương Văn lấy lại nước; “sử cũ không rõ ngày tháng, nên chép tóm tắt cả vào đoạn này”. | M05 intro, M06 ghi chú | `disputed` U02 |
| Lời chua cửa biển Bố Hải | Xã Kỳ Bố, huyện Vũ Tiên, phủ Kiến Xương (sổ tỉnh Nam Định) là nơi Trần Lãm đóng binh | M05 ghi chú "Vị trí Bố Hải Khẩu", khoanh vùng bản đồ | `recorded` cho việc lời chua có ghi; định vị là chú giải đời sau |

Câu trích giữ ngắn và để trong ngoặc kép kèm mã nguồn. Mọi câu khác ở M05–M06 là diễn đạt lại hoặc lời game.

## Điều không khẳng định

- **Tuyến đường Hoa Lư → Bố Hải**: sử không ghi. Hai lựa chọn đường sông / đường bộ của Trịnh Tú là `reconstructed`, không nêu tên sông, chặng hay số ngày.
- **Năm bắt đầu quan hệ**: chính văn đặt trong mục 967, phụ chú cho rằng sớm hơn (U02). Game không khóa năm khởi hành, năm nhận nuôi hay năm giao quân.
- **Lời thoại** của Trần Minh Công, Đinh Bộ Lĩnh, Đinh Liễn, Trịnh Tú đều `fictional` và UI ghi "không phải trích dẫn sử". Câu mở đầu của Trần Minh Công lấy từ [narrative-bible.md](narrative-bible.md).
- **Không có trận, đấu thử hay điều kiện thắng 1vs1** trước Trần Lãm. Kiểm tra `campaignCopyErrors()` chặn các chữ chinh phục ("đánh bại", "quy phục", "thử tài", "hạ được", "đầu hàng", "chinh phạt") trong lời kể chính của nhiệm vụ không có trận.

## Truyền thuyết địa phương

Truyện kể, thần tích và lễ hội ở các làng có thể kể khác về cuộc gặp và việc giao quân. Ledger mục 1 ghi rõ chưa xác minh thần tích hay văn bia địa phương, nên game chỉ nêu là có khác biệt (`legend`), không kể chi tiết nào như sử chép, cũng không gán tên làng hay di tích cụ thể.

Cảnh "thử tài ở Bố Hải Khẩu" của bản Chiến dịch 13 màn cũ là sáng tác của game, không thuộc truyền thuyết đã kiểm. Màn cũ đổi thành "Luyện binh ở Bố Hải Khẩu", lời kể ghi là tập dượt hư cấu và không còn câu "giao binh quyền".

## Raid Trần Lãm

Theo freeze mục 5: Trần Lãm là liên minh; Raid là sparring/what-if. Từ 25/10/2026 (design-freeze bổ sung 1.1, Shan chốt) Trần Lãm không còn là trùm Raid vì là đồng minh, không bị chinh phạt: `raidBossById("tranLam")` là undefined, server từ chối. M08 chỉ mở bán ông ở cửa hàng (`warlordUnlockMission("tranLam") = "M08"`). `RAID_STAGES` không đổi để Tower, Survival, Daily, Arena giữ nguyên seed.

## M07–M08 (CAMP-03.02)

Task CAMP-03.02 gọi hai nhiệm vụ là "M06–M07"; theo mã freeze đó là **M07 "Hai đội một cờ hiệu"** và **M08 "Gánh quân Bố Hải"**.

- **M07** giữ type `battle` (presentation tag `joint-operation` trong mission matrix) và mục tiêu `defeatEnemies`, kể như một trận cùng giữ cửa biển. Không đổi sang node `defense`, vì đó là node `battle` duy nhất và đổi type sẽ lệch mission matrix đã khóa. Đối thủ là ba nhân vật vô danh (`bo-hai-raider-*`); Trần Lãm không ra trận ở phe nào. Bàn cờ dùng `ESTUARY_WEIGHTS` (`src/core/campaign/scenarios.ts`): âm dương 22, bánh chưng 9, cùng tỉ lệ bàn sông nước của màn Bố Hải cũ và sân nhà Thủy. Đây là địa hình do game dựng (`reconstructed`), không phải sơ đồ trận. Lương: server ghi `supply = clamp(lương còn lại)` sau trận, thắng hay thua đều vậy, theo luật mang lương sẵn có.
- **M08** là `story`, hoàn thành qua `/api/campaign/events`: không trận, không XP, không rơi đồ, không nhiệm vụ ngày, không đổi lương. Thưởng chỉ gồm vàng lần đầu của nhiệm vụ (50) và vàng hoàn thành Chương II (250), cùng mở khóa Nguyễn Bặc theo freeze 4.2.
- **Nguồn nhận quân**: chính văn S01 mục 967 kể việc giao cầm quân khi Minh Công còn sống; phụ chú tóm sử cũ: “Minh-Công mất rồi mới coi thay đám quân ấy.” Không nguồn nào trong ledger cho năm mất, cách mất hay lời trăng trối, nên game không gán (U02). Chưa có chỉ số "uy tín" trong state; uy tín chỉ được kể trong lời dẫn.
