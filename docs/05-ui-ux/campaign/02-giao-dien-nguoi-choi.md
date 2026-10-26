# 02 — Người chơi thấy gì? Từng màn, từng lần bấm

> Cập nhật: 26/10/2026

## A. Đi vào Campaign

1. Từ menu chọn **Chiến dịch**.
2. Nhìn thấy **Sử ký Cờ Lau Dựng Nước** gồm **6 chương**, mỗi chương có tên, thời kỳ, 4 dấu nhiệm vụ, trạng thái (đã hoàn thành / đang mở / chưa mở), nút `Xem chương`.
3. Chương hiện tại được gợi ý; không tự chuyển chương khi đang xem chi tiết hoặc chuyển trang.
4. Chọn **Chương II — Cửa Bố kết minh** → mở **bản đồ cổ khu vực** và danh sách M05–M08, nhiệm vụ chưa mở có thể xem tên/loại nếu policy của code cho phép, không được bấm thực hiện.
5. Chọn M06 → hiện panel nhiệm vụ: bối cảnh, người tham gia, nguồn sử, CTA `Xem câu chuyện`.

## B. Ví dụ thoại M06 — Hội kiến Trần Minh Công

> Nội dung bên dưới chỉ minh họa UX; **không thay** nội dung canonical trong `missionCopy(M06)`.

**Trước khi vào:** Không có HP bar, không có nút `Đánh bại Trần Lãm`; đây là một sự kiện ngoại giao.

| Thao tác | Trên màn hình | Kết quả |
|---|---|---|
| Bấm `Xem câu chuyện` | Khung nền hội kiến, chân dung hai nhân vật, 1 câu thoại/đoạn kể | Bắt đầu scene ở beat 1 |
| Bấm `Tiếp` | Chuyển sang beat tiếp theo, đổi người nói/tô sáng chân dung tương ứng | Chưa gửi API |
| Bấm `Trước` | Trở lại beat trước | Chưa gửi API |
| Bấm `Nhật ký` | Panel kéo lên với các câu đã đọc | Không thay lựa chọn/tiến trình |
| Đọc hết phần hội thoại | Hiển thị các lựa chọn **đúng choice IDs hiện hữu** | Chưa hoàn thành |
| Chọn một câu đáp | Hiện phản hồi tương ứng đã có ở `missionCopy` | Chưa thưởng |
| Bấm `Xác nhận` | Gửi sự kiện hợp lệ tới `/api/campaign/events` theo client online có sẵn | Loading, chặn gửi trùng |
| API thành công | Kết quả lịch sử cố định, thưởng từ profile server; nút quay về Sử ký | M06 complete |
| API lỗi/mạng rớt | Thông báo lỗi, cho thử lại | Không cấp thưởng client |
| Xem lại M06 | Replay lời thoại đã duyệt | Không gọi API thưởng mới |

## C. Nhiệm vụ có trận (M15, M21)

1. Từ bản đồ mở nhiệm vụ có trận.
2. **Lời dẫn/intro** hiển thị theo beat trước khi vào chuẩn bị trận.
3. Bấm `Chuẩn bị` mở **BattlePrep** hiện có (đội hình, kỹ năng, lương, độ khó).
4. Bấm `Ra trận` dùng luồng `createOnline` hiện hữu, không khởi tạo battle giả từ client.
5. Thua: xem thoại thất bại hoặc một đoạn kết thúc thất bại nếu content hiện có; `Chơi lại` không cấp thưởng first-clear.
6. Thắng: đọc outcome trước màn thưởng hoặc trong luồng sau trận; không khóa thưởng server vì người chơi bấm skip.
7. Trận nhiều phase (công thành / boss): không phát lặp thoại mở nhiệm vụ ở mỗi phase ngoài chủ ý đã khai báo.

## D. Bản đồ cấp vùng

```text
┌───────────────────────────────────────────────────────┐
│ SỬ KÝ   I Hoa Lư  II Bố Hải  III Nhà Ngô ... VI       │
├───────────────────────────┬───────────────────────────┤
│ BẢN ĐỒ GIẤY DÓ          │ CHƯƠNG II · 1/4           │
│ núi/sông/cờ, thành      │                           │
│      ○ Bố Hải          │ M05 · Đường ra Bố Hải      │
│      □ M05             │ M06 · Hội kiến ...         │
│      ◇ M06 (đang chọn) │ M07 · Hai đội một cờ hiệu  │
│      □ M07             │ M08 · Gánh quân Bố Hải    │
│                          │                           │
│ [ - ] [ + ] [Đặt lại] │ [Xem cốt truyện M06]      │
└───────────────────────────┴───────────────────────────┘
```

- **Desktop:** Bản đồ trái; list nhiệm vụ và chi tiết bên phải.
- **Mobile:** Thanh chọn chương → danh sách 4 nhiệm vụ **hiện trước** → bản đồ có thể mở rộng/thu gọn; tap target >=44px; không phải zoom bản đồ để tìm marker.
- **Chương IV và V:** hai nhánh mở song song sau III; chương VI chỉ mở khi cả hai kết thúc.
- `M12` (Bình Kiều định vị tranh luận) và các nhiệm vụ không có tọa độ chính xác phải có vị trí trừu tượng/ô riêng, không bịa tọa độ.

## E. Điều khiển hội thoại

| Phần | Desktop | Mobile |
|---|---|---|
| Tiếp | Click, Enter/Space khi focus vào viewer | Nút `Tiếp` |
| Trước | Nút, mũi tên trái nếu không ở input | Nút `Trước` |
| Xem lại | `Nhật ký` | Bottom sheet `Nhật ký` |
| Bỏ qua | `Bỏ qua thoại đã xem` (không skip choice chưa xác nhận) | Nút tương tự |
| Sử liệu | `Xem sử liệu` mở panel hiện có | Accordion/bottom sheet |
| Trợ năng | focus/label rõ, hỗ trợ reduced motion | Không phụ thuộc thao tác vuốt |

## F. Bản V1 text-only

Visual Novel **KHÔNG cần** âm thanh, ảnh nền mới, cinematic video hay TTS. Dùng chân dung nhân vật hiện tại (`Portrait`) và nền CSS/SVG; thêm audio/image sau như enhancement.