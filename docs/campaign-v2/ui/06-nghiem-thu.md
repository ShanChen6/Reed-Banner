# 06 — Checklist nghiệm thu UI thoại và bản đồ

> Cập nhật: 26/10/2026

## A. Thoại

- [ ] M01 hiển thị câu theo trình tự, nhấn Tiếp/Trước không làm thay đổi progress.
- [ ] M06 hiện ít nhất hai người nói đúng dữ liệu; tên/portrait khớp ID có sẵn hoặc fallback gọn.
- [ ] Chọn một choice M06 gửi API một lần; pending state chặn double click; lỗi mạng có retry.
- [ ] Replay nhiệm vụ đã completed không cấp lại vàng, companion hoặc đánh dấu completion lần hai.
- [ ] Skip chỉ bỏ qua trình diễn; choice quan trọng vẫn phải được chọn/xác nhận; không tự gọi API.
- [ ] Backlog không hiển thị beat chưa xem; không lộ outcome trước khi đọc/đạt sự kiện.
- [ ] Thoại fictional được ghi nhãn rõ; `recorded` chỉ dùng cho lời kể đã có ref.
- [ ] Không có câu thoại nào bị AI rewrite đổi kết cục, nhân vật chết/sống hoặc mốc lịch sử.
- [ ] M15/M21 không lặp intro ở mọi phase; sau thất bại không chiếu lời thoại chiến thắng.

## B. Atlas/Map

- [ ] 6 chapter, 4 nhiệm vụ/chapter, đúng M01–M24 từ registry.
- [ ] Chapters IV/V mở song song sau III; VI khóa đến khi IV/V xong.
- [ ] Nhấp card, chọn map marker và chọn list mission cập nhật cùng một `selected mission`.
- [ ] M01–M04 đều chọn được trên Hoa Lư, M05–M08 trên Bố Hải; không bắt buộc click marker rất nhỏ.
- [ ] Vùng không chắc tọa độ được ghi nhãn, không vẽ lãnh thổ tự bịa.
- [ ] Tất cả state `open`, `completed`, `locked` lấy từ profile/server, không tính bằng số thứ tự riêng.
- [ ] Zoom/pan trên SVG giữ hoạt động; không scroll-lock cả trang trên mobile.
- [ ] Nút `Đặt lại bản đồ`, keyboard focus/Enter/Space và screen reader label hoạt động.

## C. Điều hướng và responsive

- [ ] Mở lại Campaign sau battle giữ chương đang xem hoặc trở về mission liên quan theo UX được duyệt.
- [ ] Sau complete M24 hiển thị ending hiện có và xem lại được.
- [ ] Không phá Raid Hall, doanh trại, đội hình chiến đấu, hồ sơ, các mode khác.
- [ ] Desktop 1366px, tablet 768px, mobile 390px và 320px không overflow ngang.
- [ ] Tap target chính >=44×44 CSS px; focus visible, reduced motion hoạt động.
- [ ] Không có audio hoặc ảnh thì không lỗi; nội dung thoại luôn đọc được.

## D. Kiểm chứng kỹ thuật vừa đủ

- [ ] `pnpm typecheck` và `pnpm lint` trên phạm vi khả dụng.
- [ ] Chạy targeted tests hiện có cho `campaign/events`, `storyNodes`, `mapLayout` nếu đã có; bổ sung unit test component thuần/trạng thái selection nếu cần.
- [ ] Không chạy balance simulations hoặc kiểm thử toàn hệ thống chỉ vì thay UI.
- [ ] Không báo test PASS nếu chưa thực sự chạy.
- [ ] Không tự commit/push/deploy.

## E. Audio TODO — được phép kiểm tra duy nhất

- [ ] `audio-todo/` có thể đọc, có thứ tự task, danh sách asset và quy tắc license.
- [ ] **Không** có audio engine mới, không TTS API, không file giọng AI giả hoặc tự phát, không xuất audio trong phase này.