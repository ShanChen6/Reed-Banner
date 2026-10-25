# Reed Banner — Campaign V2 UI: Thoại và Sử ký/Bản đồ

> Cập nhật: 26/10/2026  
> Tình trạng: **READY FOR IMPLEMENTATION (UI only)**; Audio/Voice: **TODO — DEFERRED**.

## ĐỌC TRANG NÀY TRƯỚC

Bộ này thay thế các prompt UI/audio chưa khớp code cũ. Code `develop` đã triển khai Campaign V2 **6 chương, 24 nhiệm vụ M01–M24**; không xây lại hệ thống Campaign và không khôi phục bản 13 màn. Tham chiếu mã nguồn kiểm tra: `b5867dd6805ec2111f470b31bab723b872e358c6` (26/10/2026, nhánh `develop`, có thể thay đổi khi bạn chạy).

### Việc sẽ làm ngay

1. Dọn các đoạn tài liệu đã lỗi thời về **Campaign 13 màn** và **Leo tháp vô hạn cũ** (không xóa docs các mode đang hoạt động).
2. Hoàn thiện **Visual Novel text-only** bằng cách nâng cấp `StoryBeats`, `DiplomacyScene`, `ChapterOne`, dùng chính `missionCopy` và `StoryBeat` đang có.
3. Nâng cấp **Sử ký sáu chương + bản đồ từng vùng + danh sách bốn nhiệm vụ/chương** trên `CampaignMap` V2 đang có.
4. Tích hợp câu chuyện trước/sau trận, nguồn sử, replay, điện thoại, bàn phím và trạng thái server.

### Việc CHƯA làm

Không tạo MP3/WAV, không tích hợp TTS, không cài audio engine, không tạo SFX/BGM, không thêm voice autoplay, không tạo AI image bắt buộc. Tất cả ở `audio-todo/` để dành.

### Mở docs theo thứ tự

| Bước | File | Mục đích |
|---|---|---|
| 0 | [01-hien-trang.md](01-hien-trang.md) | Hiểu code đã có, tránh làm lại |
| 1 | [02-giao-dien-nguoi-choi.md](02-giao-dien-nguoi-choi.md) | Xem luồng UI đơn giản, ví dụ M06 |
| 2 | [03-contract-va-kien-truc.md](03-contract-va-kien-truc.md) | Cách ghép vào code hiện tại |
| 3 | [04-lo-trinh-tung-buoc.md](04-lo-trinh-tung-buoc.md) | Thứ tự task, mục tiêu, checkpoint |
| 4 | [05-asset-prompts.md](05-asset-prompts.md) | Ảnh **tùy chọn** khi UI cơ bản chạy tốt |
| 5 | [06-nghiem-thu.md](06-nghiem-thu.md) | Kiểm tra đầu ra trước khi chuyển task |
| 6 | [07-don-dep-docs-cu.md](07-don-dep-docs-cu.md) | Danh sách xóa/sửa docs và không được xóa |
| Để sau | [audio-todo/README.md](audio-todo/README.md) | Quy hoạch âm thanh/voice, tất cả đều TODO |

### Cách chạy từng task bằng Codex

1. Checkout nhánh công việc từ `develop` mới nhất; mở một task ở `prompts/`.
2. Dán nguyên prompt cho Codex. Mỗi prompt yêu cầu audit trước, chỉ chỉnh phần thuộc task, không commit/push/deploy.
3. Đọc mục `Nghiệm thu` của task rồi xem UI hoặc chạy kiểm tra mục tiêu đã nêu.
4. Chỉ chuyển task khi checkpoint đạt. Không gộp tất cả vào một prompt vì dễ gây sửa chồng chéo.

**Không đổi:** `STORY_NODES`, M01–M24, progression DAG, historical outcomes, rewards, recruit, Raid, các mode khác, server-authoritative completion.

**Ghi chú:** tài liệu mới không khẳng định ảnh nền đã có. Bản đầu phải chạy với nền SVG/CSS và chân dung hiện hữu (`Portrait`), ngay cả khi chưa tạo một ảnh mới.