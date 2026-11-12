# Hình ảnh & yêu cầu cho họa sĩ

> Cập nhật: 06/11/2026
> Trạng thái: **APPROVED** — Art Direction thống nhất 03/11/2026; hiện trạng asset/rig cũ không thay đổi cho đến khi nghiệm thu từng nhân vật.
>
> Kế hoạch đồ họa hoàn chỉnh (hoạt ảnh nhân vật, làm nhẹ ảnh, hiệu năng, trang trí) ở [Kế hoạch đồ họa](ke-hoach-do-hoa.md).

File này có ba phần. **Mục 3** là quyết định art direction mới nhất, có quyền ưu tiên khi mâu thuẫn với các hướng sản xuất nhân vật cũ ở mục 2; mục 1 mô tả art đang chạy và không bị coi là đã thay thế.

File này có hai phần tư liệu gốc: Phần 1 ghi phong cách của bộ hình dựng bằng code (SVG) đang dùng trong game. Phần 2 là **bản yêu cầu gửi họa sĩ** (hoặc dùng làm đầu vào cho công cụ AI vẽ ảnh) cho phần code không vẽ được: chân dung nhân vật và hình trang bị.

## 1. Bộ hình dựng bằng code

- Toàn bộ ô cờ, 7 ô đặc biệt mỗi bản, biểu tượng 7 nguyên tố, cờ lau thủ lĩnh, lương thực, khiên và khung giao diện được vẽ bằng SVG trong `src/app/game/art/`.
- Xem toàn bộ tại trang `/demo/art`.
- **Phong cách:** lấy cảm hứng từ tranh khắc gỗ dân gian và hoa văn trống đồng Đông Sơn: nét mực đậm, mảng màu phẳng, gần như không đổ bóng (tối đa một mảng sáng nhẹ ở mép trên).
- **Ô cờ kiểu bàn ngọc** (`tiles.tsx`): mọi ô chung nền ngọc xanh thẫm viền vàng mảnh; loại ô nhận ra nhờ màu và dáng vật phẩm (kiếm thép tua đỏ, âm dương lam tím, bánh chưng xanh, tim hồng ngọc, nén vàng, sách bìa lam hoa sen, trống sơn đỏ). Vật phẩm là ảnh vẽ tay Shan gửi, cắt nền và thu về 256×256 ở `public/art/tiles/<loại>.webp`, bản đặc biệt là `<loại>-weak.webp` (2 món: song kiếm, tim cánh vàng...) và `<loại>-strong.webp` (3 món hoặc bản cấp cao hơn); muốn thay hình chỉ cần thay file cùng tên. Ô bản yếu có hào quang vàng, bản mạnh có lửa ba lớp, cả hai khung mạ vàng. Bàn cờ trong trận có huy hiệu mặt trống giữa mép trên và nút hoa đồng ở giao điểm ô (`.board-knots`). Dải màu dùng chung nằm trong `<TileDefs />` gắn một lần ở `src/app/layout.tsx`; không dùng filter để bàn 96 ô vẫn nhẹ.
- **Biểu tượng nguyên tố và nghề** (`icons.tsx`): ảnh vẽ tay Shan gửi, 128×128 ở `public/art/elements/<hệ>.webp` và `public/art/professions/<nghề>.webp`; `ElementIcon`/`ProfessionIcon` giữ nguyên cách gọi.
- **Biểu tượng kỹ năng nhân vật chính** (`skills.tsx`): 42 ảnh vẽ tay Shan gửi (7 hệ × 6 ô), 128×128 ở `public/art/skills/<mã kỹ năng>.webp`, đặt trên nền sơn mài thẫm viền màu hệ (tuyệt chiêu ô 5 viền vàng có hào quang). Kỹ năng chưa có ảnh (chiêu nghề, tuyệt chiêu nhân vật kèm, chiêu riêng) vẫn dùng huy hiệu SVG.
- **Trang giới thiệu** (`src/app/page.tsx`, `src/app/home/`): tranh nền trời trống đồng và chim lạc (`public/art/hero/troi-trong-dong.webp`), mặt trống khắc vạch xoay rất chậm đè đúng lên trống trong tranh (`DrumFace.tsx`), tâm sao sáng nhịp, đốm lửa bay lên; khung, nút và tiêu đề dùng lớp `fx-*` trong `globals.css`.
- **Đọc được bàn cờ:** mỗi loại ô khác nhau cả màu nền, độ sáng lẫn hình vẽ, để người khó phân biệt màu vẫn chơi được.
- **Ô đặc biệt:** bản yếu có khung vuông bằng đồng với đinh tán bốn góc; bản mạnh có vòng tròn vàng tỏa tia như mặt trời giữa mặt trống đồng và tỏa sáng nhẹ. Hai bản khác nhau về hình dạng chứ không chỉ về màu.
- **Chân dung tạm** (`portraits.tsx`): huy hiệu tròn viền trống đồng, nền và đai áo theo nguyên tố; mỗi nhân vật khác nhau ở mũ/tóc, màu áo và đồ cầm tay theo nghề. Dùng tới khi có chân dung của họa sĩ (phần 2).
- **Biểu tượng kỹ năng** (`skills.tsx`): huy hiệu vuông, nền theo nguyên tố (chiêu nhân vật chính) hoặc theo nghề (chiêu nhân vật kèm, tông tối hơn); hình giữa nói kỹ năng làm gì, dấu tròn ở góc nói tác dụng phụ (tăng, giảm, cả đội, đánh cả đội đối thủ, hồi máu, khiên, gỡ hiệu ứng, năng lượng, thiêu đốt, đóng băng, phản đòn). Tuyệt chiêu ô 5 có vòng tia vàng. Kỹ năng mới chưa vẽ tự lấy hình theo kiểu mục tiêu.
- **Biểu tượng trang bị** (`gear.tsx`): 9 ô và vũ khí riêng 6 nghề, chi tiết nhấn màu theo nguyên tố. Khung phẩm khác nhau cả về hình: Trắng viền trơn, Lục thêm chấm góc, Lam viền đôi, Tím thêm hoa văn răng cưa, Cam tỏa tia. Họa sĩ **không** vẽ khung.
- **Bản đồ chiến dịch** (`src/app/campaign/CampaignMap.tsx`): giấy dó vàng nhạt có thớ chéo, mực nâu đậm, sông xanh chàm, biển xanh rêu với sóng khắc, đường hành quân đỏ son, viền tối dần ở mép. Màu đặt bằng biến `--map-*` trong `globals.css`. Họa sĩ có thể vẽ lại thành tranh nền, giữ vị trí các màn.

### Bảng màu

| Vai trò | Mã màu |
|---|---|
| Mực (nét viền) | `#2b1d14` |
| Giấy (mảng sáng) | `#f6ecd4` |
| Vàng đồng (viền khung, hoa văn) | `#d4a24c` (nền tối), `#b8862f` (nền sáng) |
| Sơn mài (khung bàn cờ) | `#5a1e14` (nền tối), `#7a2c1d` (nền sáng) |
| Nền trang | `#17110e` (tối), `#f3ebdc` (sáng) |

| Nguyên tố | Kim | Mộc | Thủy | Hỏa | Thổ | Lôi | Phong |
|---|---|---|---|---|---|---|---|
| Màu | `#9ea4ad` | `#4f9a4a` | `#2f7fc1` | `#d9502a` | `#a5772f` | `#7d55c7` | `#2e9e90` |

| Ô | Kiếm | Âm dương | Bánh chưng | Tim | Thỏi vàng | Sách | Trống trận |
|---|---|---|---|---|---|---|---|
| Màu nền | `#c0392b` | `#5b4a9e` | `#a7cf74` | `#f3b3c3` | `#5e3b1f` | `#2f5f9f` | `#1f7a6d` |

## 2. Bản yêu cầu cho họa sĩ

### 2.1 Bối cảnh

Cờ Lau là game match-3 chiến đấu theo lượt, lấy bối cảnh Loạn 12 Sứ Quân ở Việt Nam thế kỷ X. Người chơi là Đinh Bộ Lĩnh, từ cậu bé chăn trâu cầm cờ lau tập trận tới khi dẹp loạn và lên ngôi. Game chạy trên trình duyệt, cả máy tính lẫn điện thoại xoay ngang.

### 2.2 Phong cách

- Hợp với bộ hình SVG ở phần 1: **nét viền mực đậm, màu phẳng**, một tông bóng là đủ, gợi tranh khắc gỗ dân gian. Không vẽ kiểu ảnh thật, không 3D, không anime mắt to.
- Dùng bảng màu ở phần 1. Mỗi nhân vật có **một màu chủ đạo theo nguyên tố** của họ (khăn, đai, viền áo), phần còn lại là tông đất, chàm, nâu, đỏ son.
- **Trang phục thế kỷ X:** áo giao lĩnh (cổ chéo), khăn chít đầu hoặc búi tóc, chân quấn xà cạp hoặc đi đất; giáp vảy hoặc giáp da cho tướng. Tránh trang phục triều Nguyễn (áo dài năm thân, khăn xếp), tránh kiểu tóc và giáp nhà Thanh, tránh giáp kiểu Nhật.
- Họa tiết nên lấy từ trống đồng Đông Sơn (chim Lạc, sóng nước, răng cưa, vòng tròn đồng tâm) và mây cuộn.

### 2.3 Nguyên tắc clean-room (bắt buộc)

- Không tham khảo, đồ lại hay phối lại hình của bất kỳ game nào, kể cả các game *Loạn 12 Sứ Quân* cũ và bản mới.
- Dùng công cụ AI thì không ghi tên họa sĩ hay tên game khác trong câu lệnh, và điều khoản của công cụ phải cho dùng thương mại.
- Bên vẽ chuyển **toàn bộ quyền sử dụng thương mại** cho chủ dự án, kèm file gốc nhiều lớp (PSD, Krita hoặc SVG).

### 2.4 Danh sách hình

**Chân dung nhân vật** (ưu tiên theo thứ tự)

| # | Nhân vật | Mô tả |
|---|---|---|
| 1 | Đinh Bộ Lĩnh (thiếu niên) | Cậu bé chăn trâu, cầm cờ lau, ánh mắt cứng cỏi. Dùng cho các màn đầu chiến dịch |
| 2 | Đinh Bộ Lĩnh (tướng quân) | Thanh niên mặc giáp, thần thái thủ lĩnh. Đây là hình chính trong trận |
| 3 | Đinh Bộ Lĩnh (hoàng đế) | Áo bào, mũ miện đơn giản. Dùng cho đoạn kết |
| 4–8 | 5 nhân vật kèm | Hà Vân (Pháp sư, Hỏa), Lê Thạch (Binh lính, Thổ), Mai Thanh (Y sư, Thủy), Tô Kim (Mưu sĩ, Kim), Phùng Phong (Quân sư, Phong). Nhân vật hư cấu; nghề nhìn ra được qua trang phục và đồ cầm tay |
| 9+ | 12 sứ quân (trùm chiến dịch) | Nhân vật lịch sử. Danh sách và thứ tự lấy theo docs chiến dịch khi chốt; mỗi người một nét riêng (tuổi, dáng, vũ khí) |

Mỗi nhân vật cần hai hình:

| Hình | Kích thước gốc | Hiển thị trong game | Ghi chú |
|---|---|---|---|
| Chân dung bán thân | 1024×1024 px | 48–128 px trên thẻ nhân vật | Từ ngực trở lên, mặt nhìn 3/4, đầu chiếm khoảng 45% chiều cao. Phải đọc được ở 48 px |
| Toàn thân đứng trận | 1024×1536 px | khoảng 160–320 px cao, hai bên bàn cờ | Nhân vật bên trái quay mặt sang phải; game tự lật cho phe đối thủ. Đứng trên một đường nền chung cách đáy 5% |

**Hình trang bị**

- 9 loại ô trang bị theo [Trang bị](../04-equipment/trang-bi.md#1-chín-ô-trang-bị): vũ khí, đính mão, y phục, hộ thủ, bảo ngoa, giới chỉ, hạng liên, hộ phù, ngọc bội.
- Vũ khí riêng cho 6 nghề: Tướng sĩ (đao, kiếm), Pháp sư (pháp trượng), Binh lính (giáo, khiên), Y sư (hồ lô thuốc), Mưu sĩ (quạt), Quân sư (thẻ tre, cờ lệnh).
- Mỗi loại cần 7 biến thể theo nguyên tố (đổi màu chủ đạo và một chi tiết hoa văn). Đợt đầu: 1 biến thể Mộc cho mỗi loại, tổng 15 hình.
- Kích thước gốc **512×512 px**, hiển thị 48–96 px. Vật đặt giữa, chừa lề khoảng 8%, chiếu nghiêng 3/4 nhẹ, không nền, không khung (khung phẩm màu do code vẽ).

### 2.5 Định dạng giao hàng

- PNG nền trong suốt, hệ màu sRGB, kèm file gốc nhiều lớp.
- Tên file theo mã nhân vật trong code, ví dụ `dinhBoLinh-thieuNien-chanDung.png`, `haVan-toanThan.png`, `vuKhi-tuongSi-moc.png`.
- Giao trước một bản phác (đen trắng) của Đinh Bộ Lĩnh tướng quân để duyệt phong cách, rồi mới vẽ tiếp.

### 2.6 Đưa hình vào game

- **File gốc không đổi:** file họa sĩ giao (PNG gốc và file nhiều lớp) lưu ngoài repo, ví dụ thư mục Drive của dự án. Mọi bước xử lý chỉ tạo bản sao, không ghi đè và không xóa file gốc.
- **Bản dùng trong game** nằm ở `public/art/` (`portraits/`, `figures/`, `equipment/`), giữ nguyên tên file theo mục 2.5, đổi đuôi sang `.webp` có kênh alpha.
- **Kích thước xuất** (thu nhỏ kiểu `contain`, giữ nguyên khung vẽ và lề trong suốt, không cắt sát viền để các hình thẳng hàng với nhau):

| Loại | 1x | 2x (màn hình nét cao) |
|---|---|---|
| Chân dung | 128×128 | 256×256 |
| Toàn thân | 213×320 | 427×640 |
| Trang bị | 96×96 | 192×192 |

- Không phóng to hình nhỏ hơn kích thước xuất; hình như vậy được trả lại cho bên vẽ.
- Không tự xóa nền: hình phải được giao sẵn nền trong suốt.
- Sau mỗi lần xử lý, kiểm tra lại kích thước, kênh alpha, dung lượng (mục tiêu dưới 60 KB mỗi hình 2x) và xem thử trên cả nền sáng lẫn nền tối.
- Danh sách hình (`public/art/manifest.json`, đường dẫn web tương đối) được tạo khi có lô hình đầu tiên. Ô cờ, biểu tượng và khung vẫn là SVG trong code, không nằm trong danh sách này.

### 2.7 Câu lệnh mẫu cho công cụ AI vẽ ảnh

> Prompt ráp sẵn cho từng nhân vật theo quy trình Copilot → live2dlayer ở [bộ prompt V4.2](prompts/v4-2/00-bao-cao.md); trang bị, ô cờ, nền trận và giao diện ở [Prompt đồ họa game](prompts/do-hoa.md). Khối dưới đây là bản gốc cho phong cách khắc gỗ.

Mỗi lần chỉ tạo **một hình**, luôn dán khối phong cách chung lên đầu để cả bộ đồng nhất. Câu lệnh viết bằng tiếng Anh vì đa số công cụ hiểu tốt hơn. Kết quả vẫn phải qua bước duyệt ở mục 2.5 và 2.6.

**Khối phong cách chung**

```text
Style: Vietnamese folk woodblock print look, heavy dark-brown ink outlines (#2b1d14), flat colors,
at most one shadow tone, subtle paper grain, Dong Son bronze-drum motifs (sawtooth bands,
concentric circles) used sparingly. 10th-century Vietnam: cross-collar robes, head wraps or topknots,
leg wraps, lamellar or leather armor. Light from the upper left, soft.
Palette: ink #2b1d14, paper #f6ecd4, bronze gold #d4a24c, lacquer red #5a1e14, plus the character's
element color as the main accent.
Background: fully transparent (real alpha), no scene. One subject per image. No text, no watermark,
no frame.
Avoid: photorealism, 3D render, anime big eyes, Nguyen-dynasty ao dai or khan xep, Qing queue
hairstyle, Japanese armor, cropped silhouette, checkerboard fake transparency.
```

**Chân dung** (thêm vào sau khối chung)

```text
Asset: bust portrait of Dinh Bo Linh as a young general, determined gaze, reed-flag pennant on his
shoulder. Element accent: wood green #4f9a4a on sash and collar trim.
Camera: three-quarter view, chest up, head about 45% of canvas height, centered.
Canvas: 1024x1024, keep the head and shoulders inside the central 84% (8% margin each side).
Must stay readable at 48 px.
```

**Toàn thân**

```text
Asset: full-body battle stance of Le Thach, a soldier (spear and round shield), earth element
accent #a5772f. Facing right. Feet on a ground line 5% above the bottom edge.
Canvas: 1024x1536, 8% side margin, nothing touching the edges.
```

**Trang bị**

```text
Asset: one equipment icon, a jade pendant (ngoc boi) on a braided cord, wood element accent
#4f9a4a. Slight three-quarter angle, centered, 8% margin, no frame or rarity border.
Canvas: 512x512. Must stay recognizable at 48 px.
```

> TODO: chọn người vẽ hoặc công cụ AI, ngân sách và thời điểm (khi gameplay đã ổn); chốt danh sách 12 sứ quân theo thứ tự chiến dịch.


---

### 2.8 Tên ảnh icon khi gửi và khi lưu (06/11/2026)

Icon (kỹ năng, bị động, yếu tố Tầm Tướng Ký) có **tên file trùng mã trong code**, nên code không cần bảng đổi tên và test kiểm được file có thật. Khi gửi ảnh cho Claude, đặt tên theo cột "Tên khi gửi"; Claude bỏ tiền tố, cắt nền thừa, xuất WebP và lưu theo cột "Lưu ở".

| Loại | Tên khi gửi | Lưu ở | Danh sách mã / nơi khai báo |
|---|---|---|---|
| Kỹ năng (chiêu nghề, chiêu hệ, chiêu ô 4, tuyệt chiêu Đinh Bộ Lĩnh) | `skill_<mã kỹ năng>`, ví dụ `skill_camLoHoiXuan` | `public/art/skills/<mã kỹ năng>.webp`, 128 px | Prompt kèm mã ở [icon-ky-nang.md](prompts/icon-ky-nang.md); khai báo `SKILL_ART` trong `src/app/game/art/skills.tsx` |
| Bị động | `passive_<mã>`, ví dụ `passive_kim1` | `public/art/passives/<mã>.webp` | [icon-bi-dong.md](prompts/icon-bi-dong.md); `PASSIVE_ART` trong `src/app/game/art/passives.tsx` |
| Yếu tố Tầm Tướng Ký (vật liệu, tri thức, vai trò) | `ttk_<loại>_<mã>`, ví dụ `ttk_mat_armor`, `ttk_know_magic`, `ttk_role_hybrid` | `public/art/tam-tuong-ky/yeu-to/<loại>.<mã>.webp`, ví dụ `mat.armor.webp` | Mã yếu tố trong `src/core/tam-tuong-ky/catalog.ts`; khai báo `NODE_ART` trong `src/app/game/tam-tuong-ky/TamTuongKyScreen.tsx` |
| Tri thức nghề Tầm Tướng Ký (dùng chung cho tri thức sơ học và node vai trò) | `ttk_nghe_<mã nghề>`, ví dụ `ttk_nghe_tuongSi` | `public/art/tam-tuong-ky/tri-thuc-nghe/<mã nghề>.webp` | Mã nghề: `tuongSi`, `binhLinh`, `ySu`, `muuSi`, `quanSu`, `phapSu`, `xaThu`, `satThu` |
| Huy hiệu nghề (dùng khắp game) | `nghe_<mã nghề>` | `public/art/professions/<mã nghề>.webp` | Khác thư mục và khác hình với tri thức nghề Tầm Tướng Ký ở dòng trên |
| Nguyên tố | `he_<mã hệ>` | `public/art/elements/<mã hệ>.webp` | `kim`, `moc`, `thuy`, `hoa`, `tho`, `loi`, `phong` |

Quy tắc chung:

- Mã viết đúng như trong code (camelCase, không dấu), không dùng tên tiếng Việt có dấu hay khoảng trắng. Không chắc mã thì gửi kèm tên tiếng Việt; Claude tra mã và báo lại.
- Một ảnh chỉ thuộc một mã. Không dùng một file cho hai kỹ năng khác nhau (người chơi sẽ tưởng là một chiêu); cơ chế mượn ảnh hệ cũ cho chiêu ô 4 đã bỏ ngày 06/11/2026.
- Gửi ảnh mới cho mã đã có ảnh nghĩa là **thay** ảnh cũ; Claude báo lại trước khi ghi đè.
- Mã cũ dạng `rb0xx_…` của 14 Xạ thủ/Sát thủ đã đổi sang tên chiêu/bị động ngày 06/11/2026 (bảng đổi ở `src/core/battle/legacy-ids.ts`); ảnh cũ đặt tên `rb…` cũng đã đổi theo.

## 3. Art direction 03/11/2026 — Historical Grounded Fantasy (APPROVED)

### 3.1 Quyết định chung

**Một Art Bible — Một phong cách — Mỗi nhân vật một câu chuyện.** Tất cả nhân vật lịch sử, tướng thường hư cấu, nghề mở rộng và nhân vật đặc biệt đều đi qua cùng quy trình **Character Identity → Canonical Master → sáu tư thế → QA → rig/asset integration**. Hai ảnh nhân vật **Trần Lãm Master v3** và **Ngô Nhật Khánh Master mới** đã được Shan chọn làm mốc hướng tạo hình; ảnh được duyệt thực tế phải được cung cấp riêng khi dựng, không thay bằng mô tả văn bản hoặc ảnh tìm kiếm tương tự.

**Thay thế định hướng sản xuất ảnh nhân vật mới ở mục 2.2 khi có xung đột:** hình người bán hiện thực, tự nhiên, có tuổi và sinh khí; trang phục Việt Nam thế kỷ X hư cấu hóa một cách có lý do; vật liệu vải dệt, gỗ, da, đồng, sắt; hoa văn hạn chế, tránh lạm dụng biểu tượng Đông Sơn; ít fantasy trên master, vẫn cho phép hệ/nghề và VFX thể hiện mạnh trong gameplay. Không lạm dụng áo dài bay, áo nhiều tầng tiên hiệp, giáp khổng lồ, vũ khí cơ học phi lý, hoàng bào/miện không đúng địa vị. Đây là **historical low-fantasy**, không phải tuyên bố phục dựng chính xác các hiện vật hoặc chân dung lịch sử.

**Sự khác biệt không chỉ là màu:** khuôn mặt, tuổi, hình thể, dáng đứng, cấu tạo trang phục, địa bàn/xuất thân, nghề nghiệp, thói quen, đạo cụ riêng, biểu cảm và silhouette. Không có đồng phục mặc định cho một nghề và không lấy hệ làm lý do sơn toàn bộ người cùng một màu. Với nhân vật hư cấu, mỗi người bắt buộc có một câu chuyện riêng đủ cụ thể để giải thích trang phục và cách chiến đấu, không dùng tiểu sử chung thay tên.

### 3.2 Character Identity: hai nguồn nghiên cứu, một đích thiết kế

| Loại | Nguồn phát triển nhân vật | Điều cần khóa |
|---|---|---|
| Nhân vật lịch sử | Sử liệu có dẫn nguồn; phân biệt recorded / reconstructed / legend / fictional theo [sổ nguồn Campaign](../02-game-modes/campaign/history-sources.md) | Danh xưng đúng thời, địa vị, khí chất, diện mạo **sáng tác** không mạo nhận là chân dung lịch sử |
| Nhân vật hư cấu | Mốc bối cảnh của Reed Banner + nghề/hệ từ roster + tiểu sử game-authored cá nhân | Nơi xuất thân, vai trò trước chiến tranh, động cơ, điểm yếu, thói quen, vật dụng và lý do chiến đấu |

Mọi hồ sơ phải có **Identity DNA** (tên, tuổi tạo hình, khuôn mặt, vóc dáng, khí chất, xuất thân, động cơ), **Costume DNA** (mảng màu và vật liệu cố định), **Equipment DNA** (một hình học và giải phẫu tay), **Pose Language** (Idle, Basic, Skill, Ultimate, Defeated, Personality), **Historical/Fiction boundary** và **QA gate**. Nghề quyết định logic hành động; hệ quyết định nhận diện vừa đủ và VFX ở runtime; không sửa nghề/hệ/skill ID để khớp tranh.

### 3.3 Khóa độ đồng nhất và fantasy

- Đồng nhất độ chi tiết nét vẽ, tỉ lệ người trưởng thành, ánh sáng, độ tương phản và chất liệu trên tất cả nhóm nhân vật. Đánh giá ở cả ảnh lớn và thumbnail 48–160px trong UI thực tế.
- Master là người toàn thân, vũ khí và phụ kiện trọn khung, không VFX bake-in. Xuất PNG có **alpha thật** nếu công cụ hỗ trợ; quy trình chroma cũ vẫn là tài liệu tham chiếu, không thể thay pipeline runtime mà không kiểm tra.
- Không thêm vai trò fantasy bằng hiệu ứng cháy/sét/nước trên cơ thể khi dựng Master. Tuyệt chiêu có thể giàu fantasy ở lớp VFX và chuyển động của game; art tĩnh phải giữ vật liệu/giải phẫu hợp lý.
- Không dùng trang phục cùng một khuôn cho các tướng chung nghề, hoặc chỉ thay mã HEX để tạo 7 hệ. Cấm đổi ngẫu nhiên mặt, dáng, màu mảng áo, số vũ khí và chiều tay giữa các pose.
- **Defeated** phải thực sự mất trọng tâm; **Personality** phải biểu đạt nét riêng không thành một tư thế chiến đấu lặp lại.

### 3.3a Unique Pose Identity — áp dụng cho nhân vật thiết kế tiếp theo (APPROVED 03/11/2026)

- **Giữ nguyên bộ pose của Mã Nhạc và Ninh Hỏa đã chốt; không hồi tố sửa lại.** Quy tắc này áp dụng cho những nhân vật thiết kế tiếp theo.
- Sáu tên **Idle, Basic Attack, Skill, Ultimate, Defeated, Personality** là sáu *vai trò trình diễn*, **không** phải sáu tư thế/động tác mẫu.
- Khi lên kế hoạch pose mới, so sánh trước với các nhân vật cùng nghề đã duyệt. Không lặp theo công thức: giơ quạt, tay kia chỉ hướng; hạ quạt phát lệnh; đứng quan sát; ngã cùng một bên.
- Mỗi người có **Pose Identity Matrix** gồm: trọng tâm/trục thân, động tác tay và chân, hướng chuyển động, mức năng lượng, mục đích hành động, biểu cảm, silhouette. **Basic–Skill–Ultimate của cùng người phải phân biệt rõ**, đồng thời từng pose nên khác có ý nghĩa với nhân vật cùng nghề.
- **Skill ID và gameplay quyết định cơ chế, còn câu chuyện và cá tính quyết định ngôn ngữ cơ thể.** Không tạo động tác chung chỉ vì cùng nghề, cùng đạo cụ hay cùng hệ. Vũ khí và phụ kiện giữ nguyên nếu ảnh đã duyệt.
- **Defeated:** phải thật sự mất khả năng chiến đấu, nhưng cách ngã có thể rất khác nhau; không được mặc định mọi người đều ngồi đổ sang một bên. **Personality:** khai thác một thói quen riêng, không phải biến thể của Idle.
- **Quy trình:** duyệt Character DNA và Master trước; lập ma trận pose/đối chiếu trước khi viết sáu prompt; chỉ generate một frame mỗi lần. Cùng phong cách ảnh không có nghĩa là cùng bộ động tác.

### 3.4 Kế hoạch chuyển đổi theo từng nhân vật — không sản xuất hàng loạt

1. **Baseline bất biến:** asset gốc, ảnh đã dựng, rig, animation và VFX hiện đang chạy được giữ nguyên. Không ghi đè trực tiếp, không xóa, không thay cache/runtime trong bước thiết kế.
2. **Chọn MỘT nhân vật:** đọc roster, skills, hồ sơ cũ và xem ảnh đang chạy; phân loại các chi tiết giữ, điều chỉnh hoặc bỏ có lý do. Nếu chưa thấy ảnh gốc, ghi rõ thiếu reference.
3. **Viết Identity & lore riêng:** nhân vật lịch sử bám sử; nhân vật hư cấu bám bối cảnh game, nghề/hệ. Cấm dựng tiểu sử giống nhau chỉ đổi tên.
4. **Chỉ tạo MỘT Master/Idle** theo prompt độc lập, so với ảnh cũ và hai mốc đã duyệt; sửa đến khi Shan chấp thuận. Không sinh đồng loạt sáu pose.
5. **Khóa ảnh Master mới** và Weapon/Costume DNA, sau đó lần lượt Basic → Skill → Ultimate → Defeated → Personality, kiểm từng khung.
6. **QA & tích hợp từng nhân vật:** alpha, hình học vũ khí, đúng tay/hông, đúng lớp rig, khớp kích thước và VFX, nhận diện thumbnail; chỉ thay asset sau khi có xác nhận.
7. Nếu hình mới không đạt, tiếp tục dùng bản cũ. Không mặc nhiên coi APPROVED của Art Bible là APPROVED từng ảnh hay IMPLEMENTED trong runtime.

**Pilot đầu tiên cho nhân vật hư cấu:** [RB-048 Mã Nhạc](prompts/v4-2/03-tuong-thuong-hoa-tho-loi-phong.md). Chỉ hồ sơ và Master prompt mới là DRAFT cho đến khi Shan duyệt ảnh; không áp dụng lại nguyên xi hình cũ và không buộc đổi thiết kế nhân vật lịch sử đã duyệt.
