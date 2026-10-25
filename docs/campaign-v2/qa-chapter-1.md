# CAMP-02.03 — QA Chương I (M01–M03)

> Cập nhật: 24/10/2026. Áp dụng cùng [Design Freeze](design-freeze.md) mục 3, 4.1, 8 và [Historical Source Ledger](history-sources.md).

Phạm vi: M01 (story, `legend`), M02 (story, `recorded` + `disputed`), M03 (defense, `fictional`, cầm cự 4 lượt). M04 hiện “Sắp có” vì chưa có encounter; server từ chối tạo trận M04.

## Test tự động

| File | Kiểm tra |
|---|---|
| `tests/core/campaign/chapterOne.test.ts` | Lựa chọn khớp allowlist; thoại nhân vật luôn `fictional`; claim `recorded` luôn có mã nguồn thuộc node; M01 là truyền thuyết, M02 có sử chép; M03 không nêu triều Ngô hay năm; encounter M03 có đúng thủ lĩnh mục tiêu; lời khuyên cấp/lương/hệ |
| `tests/server/campaignChapterOne.test.ts` | Parse nhiệm vụ V2 và chặn payload trộn (`stage`, `raid`, `tower`), lựa chọn lạ; M03 khóa khi chưa qua M02; M04 bị từ chối; hồ sơ mới đi M01 → M02 → M03 qua nhiều lần tải lại, thưởng 50 + 50 + 250 đúng một lần, `inProgress` xóa khi xong, lựa chọn giữ nguyên khi đánh lại, Đá Cường Hóa không đổi |
| `tests/server/campaignEvents.test.ts` | Route sự kiện cấp khách mới khi chưa có cookie (như `/api/profile`), hồ sơ mới gửi M05 nhận `locked` |

## Checklist thủ công

Chạy `pnpm dev`, mở cửa sổ ẩn danh (hồ sơ mới) tại `/game/campaign`.

- [ ] Chương I hiện ở đầu màn Chiến dịch; bản 13 màn cũ và Đánh trùm nằm trong mục thu gọn “tạm giữ”.
- [ ] Bản đồ khoanh vùng Hoa Lư (Ninh Bình ngày nay), có ghi chú định vị truyền thống.
- [ ] Ô so sánh “Truyền thuyết” và “Sử chép” hiện cạnh nhau.
- [ ] M01: mọi đoạn có nhãn; đoạn cờ lau mang nhãn Truyền thuyết và mã E12/S04/S07; thoại ghi “không phải trích dẫn sử”.
- [ ] M01: chọn một trong hai lựa chọn, “Hoàn thành nhiệm vụ”, màn thưởng +50 vàng.
- [ ] Tải lại trang trước khi đóng màn thưởng: màn thưởng vẫn hiện (dựng từ phiếu thưởng server).
- [ ] “Tiếp: Sau triều Ngô Quyền” mở M02; đoạn 939/944 mang nhãn Sử chép, đoạn chuyển quyền mang nhãn Còn tranh luận.
- [ ] M02 hoàn thành: +50 vàng; gửi lại không cộng thêm.
- [ ] M03: intro ghi rõ trận do game sáng tác; chọn người lo việc trong động; “Chuẩn bị xuất quân”.
- [ ] Bước chuẩn bị: mục tiêu cầm cự 4 lượt, thể thức 1vs1 Dễ, cấp gợi ý 1 (hồ sơ mới không bị cảnh báo), gợi ý hệ khắc Thổ (Mộc, Phong), lương gợi ý 50.
- [ ] Hạ lương dưới 50 (đánh vài trận): hiện cảnh báo và nút mua đúng phần thiếu; vẫn xuất quân được.
- [ ] Xuất quân: thanh mục tiêu “cầm cự x/4 lượt” trên màn trận.
- [ ] Tải lại giữa trận: trận tiếp tục, bàn cờ và máu giữ nguyên.
- [ ] Về Chiến dịch giữa trận: M03 “Đang xuất quân”, nút “Tiếp tục trận”.
- [ ] Đủ 4 lượt: màn “Hoàn thành mục tiêu!”, không cho đi tiếp; “Về Chương I” mở màn thưởng +250 vàng.
- [ ] Thua (hoặc để cả đội gục): “Phòng tuyến chưa giữ được”, không thưởng lần đầu, đánh lại được.
- [ ] Sau M03: danh sách 3/4, M04 mở; đánh lại M03 không nhận thêm thưởng lần đầu.
- [ ] Điện thoại dọc 390px: không cuộn ngang, nút đủ lớn.

## Đã chạy (24/10/2026)

Playwright trên `pnpm dev` (kho bộ nhớ, không Neon): hồ sơ mới đi hết M01 → M03 trong một luồng, có tải lại ở màn thưởng M01 và giữa trận M03; trận M03 bỏ mặc cho hết giờ vẫn hoàn thành sau 4 lượt (khoảng 2 phút); không có lỗi console.

## Bổ sung M04 (24/10/2026)

M04 “Hoa Lư, năm 951”: 3vs3 Thường, cầm cự 6 lượt hoặc hạ hết đối thủ; đối thủ là tướng tiên phong, lính và mưu sĩ quân Ngô (vô danh, game tái dựng). Lời dẫn: 951 và con tin Đinh Liễn mang nhãn Sử chép (E04/E04a, S02/S04), chỉ kể gián tiếp; outro “Hoa Lư đứng vững”, không nói nhà Ngô bị tiêu diệt.

- [ ] Sau M03, M04 mở; bước chuẩn bị hiện đội 3 người theo Hồ sơ, cấp gợi ý 2 (cấp 1 chỉ cảnh báo), lương gợi ý 60.
- [ ] Đủ 6 lượt: “Hoàn thành mục tiêu!”; màn thưởng +250 vàng nhiệm vụ, +250 vàng hoàn thành chương, “Mở khóa đồng hành: Đinh Liễn”.
- [ ] Tải lại khi màn thưởng chương đang mở: vẫn hiện; đóng xong hiện “Hoàn thành Chương I”.
- [ ] Đánh lại M04: không nhận lại thưởng nhiệm vụ, chương hay đồng hành; Đinh Liễn giữ nguyên cấp.

Test: `tests/server/campaignChapterOneM04.test.ts`, mục M04 trong `tests/core/campaign/chapterOne.test.ts`. Đã chạy Playwright hết M01 → M04 trên hồ sơ mới; kiểm tra cục bộ M04 bỏ mặc không thao tác qua 27/30 seed.
