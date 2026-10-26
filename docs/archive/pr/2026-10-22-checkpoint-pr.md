# Mô tả PR checkpoint kỹ năng và Tinh thần (22/10/2026)

> Trạng thái: **ARCHIVED** — lưu để truy vết, không phải tài liệu hiện hành.

## Thay đổi

Đợt cải tổ chuyển nhân vật chơi được sang 3 chiêu nghề, 2 chiêu hệ và 1 tuyệt chiêu, giữ ánh xạ đầu tư kỹ năng và xử lý hoàn điểm hồ sơ cũ. AI chiến dịch giữ preset legacy tường minh. Đồng thời sửa đánh giá AI và tương tác hồi dư Y sư, bổ sung hiển thị kỹ năng/hệ số hiệu dụng và kiểm tra trình duyệt.

Bổ sung cấu hình Tinh thần thử nghiệm A–F dùng chung cho engine/AI/UI. F giảm 5/lượt từ lượt 25, ATK/DEF không giảm do Tinh thần, hồi/Khiên mới có sàn 20% theo người nhận. Mặc định production vẫn A; API ứng dụng không nhận tùy chọn thử nghiệm. Không thay quân lương hoặc preset/chỉ số trùm để bù cho các thí nghiệm.

## Kết quả kiểm chứng

- 333 test / 83 suite pass, không fail/skip; lint, typecheck và build pass.
- Chromium desktop/mobile xác nhận hệ số, thao tác mục tiêu và hồi thực tế; chưa thay thế đánh giá cảm giác người chơi.
- Báo cáo A–E, sampler đã sửa và dữ liệu/trace đi kèm. Đợt F chạy mới 2.614 trận, dùng lại kết quả tương thích, 512 replay khớp và 14 trace.
- Sàng lọc 1.344 trận/luật: cap A=12, D=7, E=2, F=16. F giữ hỗ trợ muộn nhưng tăng đuôi dài so D/E; chưa chọn luật mặc định mới.
- Build bỏ migration theo thiết kế khi không có DATABASE_URL; không tuyên bố đã kiểm chứng DB production.

## Tài liệu và phạm vi tiếp theo

- `docs/design/20-cai-to-ky-nang.md`
- `docs/reports/2026-10-22-ky-nang.md`
- `docs/reports/2026-10-22-tinh-than-ai.md`
- `docs/reports/2026-10-22-tinh-than-F.md`
- `docs/plans/2026-10-22-combo-handoff.md`

Đây là PR draft lưu mốc trước khi xây lại kỹ năng toàn bộ nhân vật theo combo chủ động–bị động đồng đội. Tài liệu bàn giao ghi hướng đã thống nhất, yêu cầu mở rộng bằng dữ liệu, bảo vệ tiến trình, hai pilot và lộ trình chuyển toàn roster. Cơ chế combo mới chưa được triển khai trong PR này. Không merge hoặc deploy tự động.
