# 09 — Liệt Truyện: Recipe Graph & Content Authoring

> **EXAMPLES ONLY:** mẫu công thức để thảo luận, không đưa vào production cho tới khi đối chiếu metadata/lore từng nhân vật và LT-00 sign-off. Không dùng để suy diễn sử liệu.

## 1. Mô hình content

Một collection có:

- `nodes`: `id`, `nameVi`, `kind` (element/material/knowledge/virtue/character), `portraitRef` optional, `historicalStatus` optional, `description` optional.
- `recipes`: `id`, `ingredients: [nodeIdA,nodeIdB]`, `resultId`, `narrativeReason`, `hintGroup`, `contentVersion`.
- `characters`: `characterId`, `nodeId`, `professionId`, `elementId`, `traitKeywords`, `symbolicItemIds`, `portraitRef`, `historySourceIds` optional.
- `release`: `packId`, `version`, `publishedNodes`, `publishedRecipes`.

**Không** dùng tên tiếng Việt làm ID; không sinh từ file path. Example node IDs tiền tố `elt.`, `mat.`, `know.`, `virt.`, `hero.`. Cặp khóa ổn định là `min(a,b) + "|" + max(a,b)`.

## 2. Ba cây thử nghiệm (chưa khóa)

### A — Châu Ngọc · Y sư — Kim

```text
Mộc + Thủy             → Dược thảo      [mat.herbs]
Kim + Hỏa              → Kim châm       [mat.needles]
Dược thảo + Kim châm   → Y thuật        [know.healing]
Mộc + Thổ              → Bầu thuốc      [mat.gourd]
Y thuật + Bầu thuốc    → Châu Ngọc      [hero.chauNgoc]
```

**Ý nghĩa:** nghề y, kim châm/bầu thuốc (chỉ ở mức biểu trưng). Thông tin chân dung, 4 kim ở hộp kim bên eo và vũ khí/phụ kiện cần đối chiếu canon art v4-2 hiện hành trước content freeze.

### B — Tô Kim · Mưu sĩ — Kim

```text
Mộc + Kim              → Thẻ tre       [mat.bambooSlips]
Mộc + Phong            → Quạt lông     [mat.featherFan]
Thẻ tre + Thủy         → Binh thư      [know.warManual]
Binh thư + Quạt lông   → Mưu lược      [know.stratagem]
Mưu lược + Kim         → Tô Kim        [hero.toKim]
```

**Ý nghĩa:** mưu lược, quạt lông, thẻ tre; không suy diễn chiến tích có thật.

### C — Vi Triều · Quân sư — Thủy

```text
Thủy + Phong           → Sóng triều    [mat.tide]
Thẻ tre + Thổ          → Quân thư      [know.militaryRecord]
Sóng triều + Quân thư  → Thủy trận     [know.waterFormation]
Mộc + Hỏa              → Cờ lệnh      [mat.banner]
Thủy trận + Cờ lệnh    → Vi Triều      [hero.viTrieu]
```

**Ý nghĩa:** thủy thế, tổ chức quân đội, hiệu kỳ. `Thẻ tre` được tái sử dụng từ nhánh Tô Kim. `Vi Triều` chỉ là mục nhân vật game, không gán hành trạng lịch sử không kiểm chứng.

### Quy tắc chất lượng ví dụ

- Nếu 2 recipe có cùng canonical ingredient pair nhưng khác output phải FAIL validator (cả 3 nhánh trên chưa có collision).
- Tập `hero.*` không trở thành input của recipe trong slice đầu.
- Trong data thật, `hero.chauNgoc` cần mapping `chauNgoc` đúng registry; tương tự `toKim`, `viTrieu`. Character ID chỉ là metadata, không phải các nguyên liệu có thể được dùng như người thật.
- Chỉ sử dụng sở thích, vật phẩm **đã duyệt** từ character art; không bịa tiểu sử của nhân vật lịch sử.

## 3. Authoring standards cho danh sách mở rộng

Mỗi nhân vật cần một **signature** có thể kiểm tra:

| Thuộc tính | Yêu cầu |
|---|---|
| Nghề/hệ | Lấy từ roster metadata canonical, không tự suy ra từ màu áo |
| Motif | Phụ kiện/vũ khí/vật biểu trưng không trùng khuôn với tướng sát cạnh |
| Tính cách | Dựa vào art/biography được duyệt; nếu thiếu đánh dấu TODO |
| Recipe cuối | Một cặp duy nhất tạo `hero.characterId` |
| Số bước | 3–6 bước meaningful từ starter (đề xuất, không phải giới hạn engine) |
| Tái sử dụng | 1–2 node trung gian có thể chung giữa vài tuyến để tạo cảm giác khám phá liên kết |
| Độ khó | Không để mọi tướng chỉ cần `Hệ + Nghề` — đây là ghép vật phẩm và tri thức theo truyện biểu trưng |
| Nguồn sử | Có mã nguồn/mức tin cậy khi nói về sự kiện thật; invented trait phải dán nhãn hư cấu |
| Art | Sử dụng portrait sẵn có và alt text; không bắt buộc minh họa từng recipe bằng tranh lớn |

Nên chia nhân vật thành **pack** nhỏ (ví dụ Danh Tướng Hoa Lư, Mưu Sĩ, Y Sư, Các Sứ Quân), nhưng không cứng lại thành công thức mọi nhân vật cùng nghề/hệ. Khai báo dependency theo pack và test `reachable` nếu chỉ publish một pack.

## 4. Kiểm toán tự động dữ liệu

Script audit riêng nên kiểm tra:

1. ID duy nhất / reference tồn tại.
2. Canonical pair unique; cặp đảo chiều không trùng.
3. Không output là starter nếu không có rules đặc biệt.
4. Không recipe `A+B→A` hoặc `A+B→B` trong MVP.
5. Tất cả kết quả được sinh từ starter qua đường hữu hạn, không có dependency cycles.
6. Mỗi hero có **đúng một recipe cuối**, metadata char ID unique, portrait fallback.
7. Không dùng hero là input trong MVP.
8. Ước lượng độ sâu min/max, tỷ lệ reuse, số cặp thất bại so với tổng cặp.
9. Không lộ tên portrait của hero chưa khám phá từ client-rendered tooltip hoặc aria-label (UX), nhưng không coi client bundle là bí mật chống cheat.
10. Mọi recipe minh họa/review được đánh dấu `draft`, không cấp phát production trước content approval.

## 5. Open questions về cơ chế học và khám phá

- Có tiết lộ danh sách kết quả còn lại theo nhóm hay chỉ số đếm?
- Khi ghép sai, có hiển thị yếu tố gần đúng/hint nhóm hay chỉ phản hồi?
- Trình tự khám phá phụ thuộc RNG hay hoàn toàn do lựa chọn? **Đề xuất deterministic**.
- Công thức cho từng nhân vật có thể có bonus giải đố phụ (mỗi pack) hay chỉ collection?
- Local progress có migration thế nào khi thay recipe được công bố?

Đây là các quyết định cần chốt trước khi mở content cho toàn roster, tránh công thức lặp “Nghề + Hệ = nhân vật”.
