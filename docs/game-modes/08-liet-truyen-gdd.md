# 08 — Liệt Truyện: Tầm Tướng Ký — Game Design Document v0.1

> **CONCEPT APPROVED / RULES PROPOSED** · 27/10/2026. Đây là thiết kế mode mới lấy cảm hứng từ cơ chế khám phá kết hợp của Doodle God; chưa phải đặc tả luật được sign-off, chưa có engine, route, UI hay thưởng. Không đổi luật Campaign/Binh Pháp.

## 1. Định vị và mục tiêu

- **Tên đề xuất:** Liệt Truyện — Tầm Tướng Ký (LT).
- **Core loop:** Từ **7 hệ xuất phát** (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong) → kết hợp hai yếu tố đã khám phá → tạo một yếu tố trung gian (dược thuật, binh thư, vật biểu trưng, phẩm chất...) → kết hợp các yếu tố nhiều tầng → **mở mục chân dung danh tướng** trong Tướng Lục.
- **Thắng theo nội dung:** hoàn thiện tập danh tướng đang phát hành, chứ không có một kết thúc bắt buộc trước khi game ra nội dung mới.
- Đây là puzzle khám phá công thức, **không** có trận đánh, lượt AI, ghép ba, hoán đổi ô, kỹ năng, trang bị, HP hay tính toán quan hệ tương khắc.

### Phân biệt với Binh Pháp

| | Binh Pháp | Liệt Truyện |
|---|---|---|
| Mục tiêu | Khai thông bàn cờ | Khám phá yếu tố và chân dung |
| Input | Đặt quân vào lưới | Ghép **hai yếu tố đã mở** |
| Chất lượng chiến thuật | Khớp nghề/hệ với ô kề | Suy luận chuỗi công thức, gợi ý |
| Nhân vật | Ảnh quân cờ | **Kết quả cuối** của chuỗi khám phá |
| Chơi lại | Seed/board mới | Sưu tầm, bổ sung công thức mới |
| Economy | Tách reward | Khám phá **không tự sở hữu tướng** |

## 2. Taxonomy

- `element` (starter): 7 hệ có sẵn ở `src/core/battle/elements.ts`, chỉ tái sử dụng định danh/icon. **Không** dùng damage counters/GENERATES để quyết định recipe.
- `material`: vật liệu/địa hình/dụng cụ: Thẻ tre, Bầu thuốc, Kim châm, Quạt lông, Cờ lệnh...
- `knowledge`: Y thuật, Binh thư, Quân thư, Mưu lược, Thủy trận...
- `virtue`: phẩm chất/khí chất được biểu tượng hóa: Kiên định, Nhân nghĩa... Chỉ áp vào lore **hư cấu/diễn giải**, không gán chắc chắn cho nhân vật lịch sử nếu thiếu tư liệu.
- `character`: nhân vật kết quả, mang `characterId` ổn định từ catalog. Một mục lịch sử có thêm nhãn `recorded/reconstructed/disputed/fictional` khi có mô tả về lịch sử (theo Campaign V2); **công thức chỉ là biểu tượng gameplay**, không phải nguồn sử.

**Quy tắc:** mọi yếu tố có `id` ổn định, `nameVi`, `category`, `iconOrImage`, `discoveryOrder`, `lore` tùy chọn. Không đồng nhất `element ID` với `character ID`.

## 3. Đề xuất luật kết hợp mặc định

1. Người chơi có sẵn 7 starter vĩnh viễn (không tiêu hao).
2. Mỗi lượt **chọn hai yếu tố đã khám phá**, có thể bằng nhau nếu content có recipe `A + A` (quyết định BP không chi phối LT).
3. Công thức là **cặp không thứ tự**: `A+B == B+A`. Engine canonicalize cặp trước khi lookup. Không tự xem hệ Ngũ hành tương sinh/tương khắc là recipe.
4. **Đề xuất MVP:** mỗi cặp canonical có **tối đa một kết quả mới**. Nếu game cần nhiều kết quả, phải nâng `recipeVersion` có kiểm thử (không âm thầm random).
5. Nếu recipe có kết quả: kết quả được thêm vào bộ sưu tập; **nguồn liệu không bị tiêu hao**. Công thức đã khám phá được lưu; ghép lại không cấp phần thưởng/đếm thêm tiến độ.
6. Nếu cặp không có recipe: không thay state, hiện phản hồi nhỏ `Chưa tìm được mối liên hệ` hoặc hint mức nhẹ; không phạt vàng/lượt ở MVP.
7. Với recipe tạo `character`: unlock **bản ghi Liệt Truyện** (portrait, nghề/hệ, biểu trưng, mô tả); **không** unlock sở hữu tướng hoặc skill trong Profile/roster.
8. Đồ thị recipe phải acyclic về **quan hệ phụ thuộc tạo kết quả**: hai input phải đạt được từ starter trước output; một kết quả đã có có thể tiếp tục dùng làm input cho nhiều nhánh, nhưng `character` là terminal trong MVP.
9. Có thể có nhiều con đường đến một vật liệu trung gian **chỉ khi** data có nhiều recipe đầu ra cùng `resultId`; điều này không phá tính một kết quả / cặp. **Công thức kết thúc dành cho mỗi nhân vật phải duy nhất** (một cặp tạo nhân vật đó) trong MVP.
10. Không giới hạn số lần thử tại MVP; để tránh brute-force, cân bằng thông qua hints/cấp độ công thức, không dùng năng lượng tiền tệ.

### Trạng thái khám phá

- `undiscovered`: mục chưa có trong sổ (bóng mờ / dấu hỏi).
- `discovered`: mở tên, icon và trở thành nguyên liệu khả dụng.
- `characterDiscovered`: hiện chân dung/tiểu sử; vẫn phải có state là đã khám phá trong sổ.
- Không reset khi người chơi đổi chương Campaign.
- Nội dung cập nhật sau phải giữ recipe IDs/receipts từ trước; thay recipe đã phát hành cần migration/contentVersion, không làm mất progress.

## 4. Đồ thị tiến trình và chống kẹt

- Tất cả output phải reachable từ đúng 7 nguyên tố starter trong graph trừ content bị tắt theo release. Validator báo: missing reference, duplicate ID, conflicting pair, cycle, unreachable, recipe ra bản thân, duplicate character identity, recipe final không độc nhất.
- Không ép người chơi ghép hết mọi cặp vật liệu (độ phức tạp O(n²)); cần phân loại theo nhóm và có lịch sử/khám phá gần đây.
- Gợi ý ba mức **đề xuất**: (1) chỉ một nhóm còn hữu ích; (2) lộ một input; (3) lộ recipe đầy đủ. Mức 3 không được tự cộng thành tích cho tới khi người chơi thực hiện thao tác (cần chốt).
- UI không hiển thị công thức lịch sử như sự thật; có dòng `Công thức biểu trưng của trò chơi, không phải diễn giải sử học`.

## 5. MVP theo nấc

- **Content thử nghiệm:** 10–12 nhân vật + khoảng 30–50 yếu tố trung gian, tăng trưởng 3–6 bước meaningful trên mỗi nhánh (số liệu đề xuất, chưa cố định).
- **Vertical slice trước:** 3 nhân vật có chân dung đã kiểm tra trong repo: `chauNgoc`, `toKim`, `viTrieu`; không biến ba ví dụ này thành canonical recipe trước LT-00 và kiểm tra lore/weapon của đúng bản character.
- Tận dụng ảnh portrait trong `src/app/game/art/portrait-data.ts`. Nếu chưa có ảnh, có placeholder đồng bộ nhưng không tự tạo chân dung lịch sử sai nhân vật.
- **MVP UX:** thư viện các yếu tố, hai slot ghép/drag-click, kết quả khám phá, Tướng Lục, bộ lọc, hint, save/resume.
- **Backlog:** event recipe, công thức có điều kiện, animation mở sách cao cấp, phần thưởng kinh tế, achievement, bảng xếp hạng; không ép MVP phát thưởng.
- Sound/TTS/SFX: **TODO — DEFERRED**.

## 6. Điều kiện release / chống tác động tới hệ game

- Discovery không phải recruit: không gọi `addCompanion`/shop/roster grant, không tăng EXP, vàng hoặc Đá Cường Hóa nếu chưa có design economy/backend.
- Không liên kết luật Battle, Career skill, profile gear; metadata Nghề/Hệ chỉ để trình bày.
- Feature flag mặc định OFF, chỉ có route khi UI/data/QA đã nghiệm thu (giai đoạn coding sau).
- Nội dung nhân vật lịch sử có nguồn và nhãn fiction phù hợp; bản thân chuỗi nguyên tố là **phép ẩn dụ**, không nhằm tuyên bố con người được tạo bởi thuật giả kim.

## 7. Những điều Shan cần chốt trước LT-01

1. Chốt tên `Liệt Truyện — Tầm Tướng Ký` hay tên khác.
2. Một kết quả/cặp và cặp không phân biệt thứ tự?
3. Có cho `A+A` nếu data khai báo?
4. Chính sách công thức alternate (nhiều con đường dẫn đến cùng output) và đổi recipe về sau?
5. Cho người chơi dùng kết quả `character` để ghép tiếp hay giữ terminal (đề xuất terminal)?
6. Hint tier có giới hạn/chi phí hay miễn phí? (đề xuất không tốn currency ở MVP).
7. Phạm vi 3 nhân vật slice → 10–12 nhân vật MVP, tên/nội dung được duyệt từng gói.
8. Save local để thử nghiệm, hay trực tiếp server-authoritative cho production?
9. Có thưởng hay chỉ sưu tầm lúc ra mắt?
10. Không tự chuyển mode Liệt Truyện từ DEFERRED sang phát hành chỉ nhờ tài liệu.

**Trạng thái:** concept hướng đi mới đã thống nhất; tất cả đề xuất chi tiết cần LT-00 design freeze.
