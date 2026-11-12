# Lộ trình

> Cập nhật: 12/11/2026
> Trạng thái: **REFERENCE** — bức tranh tổng: cái đã có và việc còn lại. Luật từng phần ở nguồn chính; việc chưa chốt ở [câu hỏi còn mở](cau-hoi-mo.md).

## 1. Đã có trong code (`develop`)

| Nhóm | Nội dung | Nguồn chính |
|---|---|---|
| Lõi trận đấu | Bàn cờ 12×8, 1vs1 và 3vs3, tài nguyên, công thức, hiệu ứng, 7 nguyên tố, AI Tianwu, đồng hồ 30 giây | [01-gameplay](../01-gameplay/tran-dau.md) |
| Server và tài khoản | Trận do server xử lý, Neon + Drizzle, tài khoản (mật khẩu, Google, GitHub, khách), chống gian lận | [Hạ tầng](../07-architecture/ha-tang.md) |
| Tiến trình | Cấp, điểm kỹ năng theo ô, cửa hàng tướng, 9 ô trang bị, nhiệm vụ, thành tựu, điểm danh | [Tiến trình & kinh tế](../01-gameplay/tien-trinh-kinh-te.md) |
| Nhân vật | 77 nhân vật có rig và tranh; Đinh Bộ Lĩnh 8 nghề × 7 hệ; bộ 6 chủ động + 4 bị động | [Danh sách nhân vật](../03-characters/danh-sach-nhan-vat.md), [Kỹ năng](../03-characters/ky-nang/README.md) |
| Chế độ mở mặc định | Thao Luyện, Giao Tranh, Bình Loạn (Campaign V2) và Tái đấu sứ quân, Nhật Lệnh, Trấn Ải, Quần Hùng (bóng ma), Trận Đồ chơi thường, Khai Lộ | [Chế độ chơi](../02-game-modes/README.md) |
| Chế độ sau cờ (tắt mặc định) | Tháp Thí Luyện (50 tầng từ 11/11/2026), Tháp Thiên Mệnh (20 tầng từ chu kỳ 16/11/2026), Trận Đồ xếp hạng, Tầm Tướng Ký, Viễn Chinh | [Chế độ chơi](../02-game-modes/README.md), [cờ Song Tháp](../02-game-modes/dual-tower/06-05-feature-flags.md) |
| Đồ họa | Sân khấu PixiJS, đạo diễn trận, hiệu ứng theo hệ, tranh chế độ và bản đồ | [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#9-lộ-trình-triển-khai) |
| Quy trình | CI (lint, typecheck, docs, test, build, smoke test trình duyệt), checklist phát hành | [Quy trình test](../07-architecture/quy-trinh-test.md) |

## 2. Việc còn lại

Chưa xếp thứ tự; Shan chọn việc làm tiếp. Mỗi việc là một hoặc vài PR nhỏ vào `develop`.

| Nhóm | Việc | Đang ở đâu |
|---|---|---|
| Phát hành | Bật bảo vệ nhánh `develop`/`main`; cổng trước public launch Song Tháp (Neon staging, restore drill, kiểm tra trên thiết bị); quyết định bật từng cờ chế độ trên production | [Câu hỏi còn mở](cau-hoi-mo.md), [nghiệm thu Song Tháp](../02-game-modes/dual-tower/06-04-final-acceptance.md) |
| Cân bằng | Đo lại Tháp Thiên Mệnh 20 tầng bằng dữ liệu thật sau 1–2 chu kỳ đầu; cân lại bậc Thường của Trận Đồ | [Câu hỏi còn mở](cau-hoi-mo.md) |
| Mã nguồn | Phần điều khiển trận còn chung trong `DemoGame.tsx` (1 476 dòng; phần hiển thị đã tách 12/11/2026): tách tiếp thành hook trạng thái trận khi làm Đ3 | [Kế hoạch đồ họa Đ3](../06-art/ke-hoach-do-hoa.md#9-lộ-trình-triển-khai) |
| Đồ họa | Pipeline ảnh có ngân sách dung lượng trong CI (Đ2); đo hiệu năng cuối trên thiết bị (Đ9); tranh còn ở dạng prompt DRAFT | [Kế hoạch đồ họa](../06-art/ke-hoach-do-hoa.md#9-lộ-trình-triển-khai), [prompt](../06-art/prompts/v4-2/00-bao-cao.md) |
| Âm thanh | Phần còn thiếu của nhạc và âm thanh theo chế độ | [Âm thanh](../05-ui-ux/campaign/audio-todo/README.md) |
| Giao diện | Các việc Bản 2 UI còn mở | [Lộ trình UI](../05-ui-ux/implementation/roadmap.md) |
| Chế độ mới | Quần Hùng đấu trực tiếp hai người chơi (thiết kế DRAFT, chưa có code) | [Đề xuất](../02-game-modes/future/quan-hung-pvp-truc-tiep.md) |
| Hệ thống | Cường hóa trang bị bằng Đá Cường Hóa (đá hiện chưa có chỗ tiêu) | [Cường hóa](../04-equipment/cuong-hoa-todo.md) |
| Nội dung | Hậu truyện 970–971 của Bình Loạn (cần nguồn sử và freeze riêng); hướng dẫn chơi lần đầu | [Campaign design freeze](../02-game-modes/campaign/design-freeze.md) |

## 3. Cách làm để không mất việc

- Mỗi PR nhỏ, đẩy commit sớm; phần đang làm dở luôn nằm trên nhánh, không chỉ trên máy.
- Chạy `pnpm check` trước khi commit ([quy trình test](../07-architecture/quy-trinh-test.md)).
- Mô phỏng dài chạy nền và ghi bản tóm tắt vào `docs/reports/`, không commit dữ liệu thô.
- Việc xong thì xóa kế hoạch, prompt giao việc và QA của việc đó; kết quả ghi vào nguồn chính ([quy định tài liệu](../00-overview/quy-dinh-tai-lieu.md#5-thêm-chuyển-gộp-xóa-file)).
