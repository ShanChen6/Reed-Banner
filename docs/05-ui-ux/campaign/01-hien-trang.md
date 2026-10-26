# 01 — Hiện trạng code, cái đã làm và cái phải chỉnh

> Cập nhật: 26/10/2026

## 1. Tóm tắt tình trạng

Campaign V2 **đã tồn tại và chạy được**, không còn là đề xuất. `src/app/game/campaign/CampaignScreen.tsx` dùng `ChapterOne.tsx` để tổ chức sáu chương, `CampaignMap.tsx` đã vẽ 24 nhiệm vụ bằng SVG, zoom/pan và mốc vùng từ `mapLayout.ts`.

`src/app/game/campaign/DiplomacyScene.tsx` đã trình bày hội kiến, chân dung, lựa chọn, gửi API và lưu kết quả; `StoryBeats.tsx` đang hiển thị lời thoại thành **danh sách thẻ** (mỗi beat là một `<li>`). Đây là chỗ cần nâng cấp trình diễn, **không phải viết lại lời thoại từ đầu**.

`src/core/campaign/chapterOne.ts` đến `chapterSix.ts` chứa nội dung theo chương. `missionCopy` là đường đọc content; `StoryBeat` có `speaker`, `text`, `basis`, `refs`. `src/core/campaign/events.ts` quản lý lựa chọn/kết cục. `src/server/campaignEvents.ts` là luồng xác nhận phần thưởng và quyết định.

**Cần kiểm tra lại hiện trạng mới nhất trước mỗi task**, vì repo đang thay đổi nhanh.

## 2. Bảng giữ / sửa / không chạm

| Thành phần | Có sẵn | Việc làm |
|---|---|---|
| `STORY_NODES` / M01–M24 | Có | **Giữ nguyên**: ID, chapter, node type, prereq, historical basis |
| `missionCopy` / `StoryBeat` | Có | Dùng làm dữ liệu text; chỉ bổ sung key/presentation metadata nếu cần |
| `StoryBeats.tsx` | Danh sách lời thoại | Tạo trình phát **từng beat** và log xem lại; giữ thành phần tĩnh cho nguồn sử |
| `DiplomacyScene.tsx` | Có lựa chọn, API | Thay phần đọc lời kể/đối thoại bằng trình phát; **không đổi settlement** |
| `ChapterOne.tsx` | Điều phối 6 chương | Ghép trình thoại, giữ local step là presentation-only |
| `CampaignMap.tsx` | SVG V2, 24 markers, zoom/pan, bàn phím | Nâng UX theo vùng, không vẽ lại từ đầu |
| `mapLayout.ts` | Tọa độ vùng và giải va chạm | Dùng làm chuẩn; điều chỉnh layout sau nghiệm thu trực quan |
| `HistoricalCodex.tsx` | Nhãn sử liệu, nguồn | Giữ và kết nối truy cập từ hội thoại/bản đồ |
| `CampaignEnding.tsx` | M24 kết thúc | Giữ logic, chỉ polish trình diễn nếu thuộc scope |
| `RaidPanel.tsx` | Boss Raid | Không sửa logic/điều kiện Raid |
| Server events/rewards | Hoạt động | Không sửa trừ lỗi trực tiếp chứng minh được; cần tách task |

## 3. Ba vấn đề UX hiện tại

1. **Thoại nằm thành khối đọc:** nhiều beat xếp dọc khiến cảm giác xem tài liệu, ít cảm giác nhân vật đang trò chuyện. Chưa có trải nghiệm câu-trước/câu-sau, speaker focus, backlog chuyên biệt.
2. **Bản đồ và chapters nhiều thông tin:** 24 marker trên bản đồ đã được giải va chạm, nhưng người chơi cần một điểm vào **Sử ký 6 chương** để dễ hiểu đang ở đâu, vừa hoàn thành gì, chương nào mở.
3. **Nhiệm vụ trùng địa điểm:** Hoa Lư, Bố Hải có nhiều đoạn truyện; bản đồ nên chọn vùng/hub rồi hiển thị bốn mission của chương trong panel, không phụ thuộc vào 24 marker nhỏ để thao tác.

## 4. Những gì tuyệt đối KHÔNG được giả định

- Không được nói Campaign hiện vẫn có 13 màn cũ.
- Không được tạo `DialogueRegistry` song song với nội dung đã có rồi hardcode lại toàn bộ 24 nhiệm vụ.
- Không được tự đổi M05/M06 hoặc timeline đã khóa; chỉ đối chiếu narrative-bible khi phát hiện mismatch.
- Không được gọi click 'Tiếp tục thoại' là completion API; completion chỉ do sự kiện hợp lệ do server chốt.
- Không được dùng audio hoặc background image làm điều kiện để chơi Campaign.

## 5. Tài liệu chuẩn bắt buộc

- `docs/02-game-modes/campaign/design-freeze.md`
- `docs/02-game-modes/campaign/mission-matrix.md`
- `docs/02-game-modes/campaign/narrative-bible.md`
- `docs/02-game-modes/campaign/history-sources.md`
- `docs/02-game-modes/campaign/contracts.md`

Nếu thấy mâu thuẫn giữa docs này và các tài liệu trên thì **ưu tiên Design Freeze**, ghi vấn đề, không tự đổi lịch sử hoặc economy.