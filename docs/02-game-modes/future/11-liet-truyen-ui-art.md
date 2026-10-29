# 11 — Liệt Truyện: UI/UX and asset plan

> **STYLE DIRECTION — PROPOSED.** Không phát sinh ảnh/code trong PR này.

## Visual identity

**Liệt Truyện — Tầm Tướng Ký** là một cuốn **Tướng Lục** mở trên bàn gỗ cổ ở Hoa Lư: giấy dó, viền đồng lì, mực nâu, son dấu. Không sao chép bố cục hay biểu tượng Doodle God, không dùng vòng tròn giả kim Tây Âu hiện đại. Kết hợp mang nghĩa **chiêu thức tư duy / tra cứu tư liệu**, không phải phép thuật tạo ra người có thật.

- Giao diện 3 nhóm chính: **Vạn Vật Lục** (yếu tố đã tìm) + **Đài Hợp Nguyên** (2 slot + kết quả) + **Tướng Lục** (chân dung khám phá).
- Global Game Header hiện hành dùng chung, không thêm header trang chủ giả.
- Màu: tối `#2B1F15`, giấy `#E4CC99`, đồng `#8F6A32`, điểm nhấn `#8F241D`; dùng tokens chung đã có, không copy nguyên các dòng CSS riêng chỉ cho LT.
- Vùng trung tâm ưu tiên độ dễ đọc và trạng thái chọn rõ ràng, art thấp hơn UI function.

## Desktop / Mobile

### Desktop >=1024

Trái (~26%): tìm kiếm/lọc theo nhóm, thư viện yếu tố dạng các chip/icon card. Giữa (~44%): bàn ghép 2 slot A/B, animation kết quả, hint và lịch sử gần đây. Phải (~30%): danh sách danh tướng silhouette/chân dung đã khám phá, bộ lọc nghề/hệ, % tiến trình pack. Các tỉ lệ là **tham khảo**, dùng CSS minmax để không overflow.

### Tablet 768–1023

Gộp Tướng Lục thành tab hoặc panel dưới bàn ghép; thanh tìm kiếm vẫn nhìn thấy.

### Mobile 320–430

Bàn ghép ở phía trên (sticky vừa phải, tránh chiếm toàn màn); thư viện yếu tố và Tướng Lục qua tab; chọn hai yếu tố bằng **tap** cũng được, không bắt buộc drag & drop. Controls >=44×44, scroll thân thiện, không overlay chặn chọn. Không hiển thị 78 chân dung cùng lúc khi chưa có data; dùng virtualization/lazy images nếu catalog lớn.

## Tương tác

1. Mở mode: 7 biểu tượng hệ mặc định trong thư viện, sách tướng ẩn các chân dung chưa khám phá.
2. Chọn/drag yếu tố A + yếu tố B vào hai slot; hướng dẫn người mới bằng một recipe có sẵn thật.
3. Bấm **Hợp Nguyên** hoặc khi đủ input auto-trigger theo ruleset đã duyệt; cho xóa một slot hoặc swap mà không làm ghép thêm.
4. `new discovery`: highlight viền đồng và trang giấy mở, hiển thị output ở vùng riêng; nút **Mở Tướng Lục** nếu output là nhân vật.
5. `already known`: phản hồi ngắn, không tạo new popup liên tiếp; `no recipe`: phản hồi nhẹ và optional hint; `locked input`: không cấp output.
6. Filter theo hệ/nghề/loại/vừa mở, luôn có tìm kiếm tên tiếng Việt.
7. Khi chọn tướng đã tìm: ảnh portrait thật, nghề, hệ, signature item, mô tả với nhãn `lịch sử/hư cấu` và nguồn nếu có.
8. A11y: `aria-live` thông báo kết quả, alt text `Châu Ngọc — Y sư, hệ Kim`, không spoil tên người chưa mở, support keyboard, focus visible, prefers-reduced-motion.
9. Không ép âm thanh/voice trong MVP (deferred).

## Kế hoạch asset tiết kiệm

| Asset | Hiện tại / chiến lược | Bắt buộc |
|---|---|---|
| 7 nguyên tố | Dùng icon hệ sẵn có (không phát minh hình minh họa mới) | Có |
| Portrait danh tướng | Dùng `src/app/game/art/portrait-data.ts` và `Portrait` | Có |
| Nghề nhân vật | Dùng icon nghề hiện tại và metadata verified | Có |
| Vật liệu/tri thức | Icon SVG đơn giản theo một hệ nét, no 3D/chạm nổi lệch theme | Có nếu node sử dụng |
| Book frame / giấy dó | CSS/SVG texture/layout dùng hệ tokens từ Campaign | Có |
| Hero illustration | Không cần trong vertical slice; có thể sau | Không |
| Animation mở sách | CSS nhỏ, optional | Không |
| Tranh bối cảnh từng hero | **Không cần cho MVP**, tránh chi phí Liệt Truyện cũ | Không |

### Prompt art gợi ý (khi thực sự thiếu)

- “Single iconic tenth-century Vietnamese bamboo military book bundle, painted flat 2D historical game icon, matte patinated bronze accents, hand-inked brown outline, ivory mulberry paper palette, transparent alpha, centered, highly readable at 64 pixels, no text, no letters, no watermark, no background.”
- “Ancient Vietnamese tenth-century Hoa Lu wooden strategy reading desk with silk scroll and parchment notebook, dark lacquered timber, thin antique bronze decoration, historically sensitive handmade illustration, landscape 16:9, clear central tabletop for HTML UI, no text, no logos, no embedded UI.”

**Không tự tạo portrait nhân vật thay người thật**; nếu thiếu xác thực asset, đánh dấu TODO và dùng fallback icon.

## QA giao diện

- Screenshot 1440/1024/768/390/320 width. Portrait không crop lỗi; panel không lệch khung.
- Mouse + touch + keyboard flows; kéo thả có fallback tap.
- Tên hệ và nghề có dấu, font hỗ trợ tiếng Việt; icon khác nhau và tương phản.
- Không hiển thị vị trí/nhân vật chưa biết bằng tên trong aria-label hoặc tooltip.
- Không lộ “nhận tướng” trong CTA; chỉ “Khám phá chân dung”, “Ghi vào Tướng Lục”.
