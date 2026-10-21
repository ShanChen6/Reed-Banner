# Hình ảnh & yêu cầu cho họa sĩ

> Cập nhật: 20/10/2026
>
> Kế hoạch đồ họa hoàn chỉnh (hoạt ảnh nhân vật, làm nhẹ ảnh, hiệu năng, trang trí) ở [Kế hoạch đồ họa](15-ke-hoach-do-hoa.md).

File này có hai phần. Phần 1 ghi phong cách của bộ hình dựng bằng code (SVG) đang dùng trong game. Phần 2 là **bản yêu cầu gửi họa sĩ** (hoặc dùng làm đầu vào cho công cụ AI vẽ ảnh) cho phần code không vẽ được: chân dung nhân vật và hình trang bị.

## 1. Bộ hình dựng bằng code

- Toàn bộ ô cờ, 7 ô đặc biệt mỗi bản, biểu tượng 7 nguyên tố, cờ lau thủ lĩnh, lương thực, khiên và khung giao diện được vẽ bằng SVG trong `src/app/game/art/`.
- Xem toàn bộ tại trang `/demo/art`.
- **Phong cách:** lấy cảm hứng từ tranh khắc gỗ dân gian và hoa văn trống đồng Đông Sơn: nét mực đậm, mảng màu phẳng, gần như không đổ bóng (tối đa một mảng sáng nhẹ ở mép trên).
- **Ô cờ kiểu fantasy** (`tiles.tsx`, theo logo đã duyệt): viền đồng mạ vàng, mặt ô như viên ngọc sáng ở giữa tối dần ra mép, vòng răng cưa mờ như vành trống đồng; vật phẩm tô dải màu kim loại (lưỡi thép, đốc đồng, hồng ngọc, vàng thỏi, mặt trống 14 cánh) kèm ánh sao. Dải màu dùng chung nằm trong `<TileDefs />` gắn một lần ở `src/app/layout.tsx`; không dùng filter để bàn 96 ô vẫn nhẹ.
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

- 9 loại ô trang bị theo [Trang bị](07-trang-bi.md#1-chín-ô-trang-bị): vũ khí, đính mão, y phục, hộ thủ, bảo ngoa, giới chỉ, hạng liên, hộ phù, ngọc bội.
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

> Prompt ráp sẵn cho từng nhân vật theo quy trình Copilot → live2dlayer đã kiểm chứng ở [Prompt nhân vật](16-prompt-nhan-vat.md); trang bị, ô cờ, nền trận và giao diện ở [Prompt đồ họa game](17-prompt-do-hoa.md). Khối dưới đây là bản gốc cho phong cách khắc gỗ.

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
