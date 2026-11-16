# Giao diện Bình Loạn (Campaign V2)

> Cập nhật: 16/11/2026
> Trạng thái: **IMPLEMENTED** — thoại từng câu, Sử ký sáu chương và bản đồ toàn cảnh đã có trong code; âm thanh còn để sau.

Giao diện riêng của chế độ Bình Loạn. Luật, nhiệm vụ và nguồn sử ở [Campaign V2 design freeze](../../02-game-modes/campaign/design-freeze.md); file này chỉ nói về màn hình.

| File | Nội dung |
|---|---|
| [09-chot-giao-dien-ban-do-toan-canh.md](09-chot-giao-dien-ban-do-toan-canh.md) | Đặc tả giao diện đã duyệt: Sử ký, bản đồ toàn cảnh 12 cứ điểm, panel chi tiết nhiệm vụ |
| [audio-todo/](audio-todo/README.md) | Âm thanh và lời thoại đọc: kiến trúc, bảng cue theo chế độ, prompt tạo âm thanh (một phần đã có code) |

## Màn nhiệm vụ có trận (Shan chọn 16/11/2026)

Bố cục hai cột từ `lg` (1024px):

- **Cột trái, cốt truyện:** địa danh; tên nhiệm vụ cùng các nhãn sử liệu trên một dòng; lời dẫn, câu hỏi và lời kế, thoại theo lời kế. "Ghi chú nguồn" gộp vào một khung "Sử liệu" ở cuối cột.
- **Cột phải, "Bày trận", dính khi cuộn:** mục tiêu (luật riêng của trận gập trong "Luật trận này"); một dòng chip thể thức, độ khó, cấp đối thủ, cấp gợi ý; ba chân dung đối thủ; ba ô đội (chủ tướng, hai phó tướng). Bấm ô chủ tướng mới mở chọn nghề/hệ, bấm ô phó tướng mới mở bộ chọn người. Lương là một chip, thiếu thì hiện nút mua. Nút Xuất quân ở cuối cột.
- Cột Bày trận có ngay từ đầu nhiệm vụ; chưa chọn lời kế thì nút ghi "Chọn lời kế trước". Không còn bước "Chuẩn bị xuất quân" riêng.
- **Điện thoại:** cốt truyện trước, Bày trận bên dưới, nút Xuất quân dính đáy màn.
- **Bộ chọn phó tướng** trong cột Bày trận: hai cột, 6 người mỗi trang (phân trang dùng chung `usePagedItems`/`PageControls`).
- **Bộ chọn phó tướng** chỉ hiện tên, icon hệ và icon nghề (tên hệ/nghề ở tooltip) để thẻ không vỡ dòng.
- **Xong nhiệm vụ** (mọi loại): nút sang nhiệm vụ kế ("Tiếp: …", hoặc "Sang Chương …: …" khi qua chương) nằm ở câu cuối của thoại kết, nên phải đọc hết thoại mới đi tiếp được; không còn nhiệm vụ mở (như lúc chờ Hội quân) thì là "Về bản đồ Sử ký". Màn thưởng lần đầu cũng vậy: có thoại kết thì nút "Tiếp" ở câu cuối, chỉ "Đóng" luôn có.

Code: `BattlePrep.tsx` (cột Bày trận), `ChapterOne.tsx` (khung hai cột).

Code: `src/app/game/campaign/` (`CampaignScreen.tsx`, `ChapterOne.tsx`, `CampaignMap.tsx`, thoại ở `StoryBeats` và `DiplomacyScene`).

Bộ hướng dẫn từng bước, prompt giao việc và báo cáo nghiệm thu của các đợt làm giao diện Campaign (26/10/2026) đã xóa ngày 12/11/2026; xem [MOVED.md](../../MOVED.md#đã-xóa).
