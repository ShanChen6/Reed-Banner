# Kế hoạch đồ họa & hoạt ảnh

> Cập nhật: 20/10/2026 · Trạng thái: **đề xuất**, chưa triển khai code. Các mục ghi "chờ chốt" cần Shan duyệt trước khi làm.

Kế hoạch đưa Cờ Lau từ bộ hình SVG tạm sang đồ họa hoàn chỉnh theo phong cách **fantasy lịch sử Việt Nam cách điệu**, nhân vật có hoạt ảnh hành động, mà game vẫn nhẹ và mượt trên điện thoại. Phong cách SVG hiện có, bảng màu và bản yêu cầu họa sĩ ở [Hình ảnh](art-bible.md); file này không chép lại mà mở rộng từ đó. Danh sách nhân vật ở [Danh sách nhân vật](../03-characters/danh-sach-nhan-vat.md).

Hình do họa sĩ hoặc Shan tự tạo bằng công cụ AI (môi trường làm việc của Claude không có API tạo ảnh). Claude lo phần pipeline xử lý, code hiển thị, hoạt ảnh bằng code, hiệu ứng và đo hiệu năng.

## 1. Mục tiêu

| Mục tiêu | Đo bằng |
|---|---|
| Một phong cách thống nhất từ landing tới trận đấu | Bản art bible (mục 2) được duyệt; mọi hình mới so với bảng mẫu trước khi nhận |
| Nhân vật "sống": đứng thở, ra đòn, trúng đòn, dùng chiêu, thắng, thua | Đủ bộ hoạt ảnh ở mục 4.2 cho mọi nhân vật ra trận |
| Game nhẹ | Ngân sách dung lượng ở mục 6.1 (ví dụ trận đấu tải dưới 3 MB lần đầu trên điện thoại) |
| Không giật lag | 60 khung/giây trên máy tính, từ 50 khung/giây trên điện thoại Android tầm trung, không khung nào quá 50 ms khi đang chạy hoạt ảnh (mục 7.1) |
| Lối chơi không chậm đi | Một lượt có hoạt ảnh không dài hơn bản hiện tại quá 1 giây; có nút tăng tốc ×2 và bỏ qua |

## 2. Định hướng phong cách (art bible)

### 2.1 Ba trụ cột

1. **Gốc lịch sử:** dáng người, trang phục, vũ khí thế kỷ X như [Hình ảnh mục 2.2](art-bible.md#22-phong-cách) (áo giao lĩnh, khăn chít đầu, búi tóc, xà cạp, giáp vảy, giáp da). Kiến trúc nhà sàn, thành đất, cọc gỗ, thuyền độc mộc.
2. **Chất fantasy:** phép thuật 7 nguyên tố và linh vật lấy từ truyền thuyết Việt (bảng 2.2), nhưng **phóng đại vừa phải**: vũ khí to hơn thật một chút, khăn và cờ bay theo gió, hiệu ứng chiêu rực rỡ. Không giáp sắt phát sáng kiểu fantasy phương Tây, không tóc nhọn kiểu anime.
3. **Cách điệu:** giữ ngôn ngữ khắc gỗ dân gian + trống đồng Đông Sơn của bộ SVG hiện có. Nét mực đậm, màu phẳng, tối đa một tông bóng, thớ giấy dó. Hoạt ảnh chuyển động kiểu **rối cắt mảnh** (gợi múa rối nước và tranh khắc ghép lớp): các mảng cơ thể xoay quanh khớp, không vẽ lại từng khung. Lựa chọn này vừa hợp phong cách vừa nhẹ (mục 3).

### 2.2 Ngôn ngữ hình ảnh của 7 nguyên tố

Mỗi hệ có một màu ([bảng màu](art-bible.md#bảng-màu)), một họa tiết và một linh vật xuất hiện trong hiệu ứng chiêu. Linh vật lấy từ truyền thuyết dân gian chung, không lấy từ game nào (clean-room).

| Hệ | Họa tiết | Linh vật / hình tượng gợi ý | Hiệu ứng chủ đạo |
|---|---|---|---|
| Kim | Răng cưa trống đồng, vảy rùa | Rùa vàng, nỏ thần | Tia sáng kim loại, mảnh đồng văng |
| Mộc | Lá tre, đốt tre | Bụi tre đằng ngà | Lá xoáy, mầm mọc lên |
| Thủy | Sóng nước khắc | Thuồng luồng | Sóng cuộn, giọt nước |
| Hỏa | Lửa cuộn kiểu mây | Chim Lạc lửa | Lưỡi lửa, tàn tro bay lên |
| Thổ | Núi tầng, vân đá | Thần núi (Sơn Tinh) | Đá nứt, bụi đất |
| Lôi | Tia chớp gãy khúc | Thần sấm | Chớp lóe, tia lửa điện |
| Phong | Mây cuộn, đuôi chim | Chim Lạc bay, diều sáo | Vệt gió, lá bay ngang |

> TODO (chờ chốt): duyệt bảng linh vật; quyết định linh vật có xuất hiện thành hình (tốn công vẽ) hay chỉ là họa tiết trong hiệu ứng.

### 2.3 Quy tắc đọc được (bắt buộc)

- **Bàn cờ là ưu tiên số 1.** Nền và trang trí quanh bàn cờ phải tối hơn hoặc nhạt hơn ô cờ rõ ràng; không có chuyển động nền nào sau bàn cờ.
- Ô cờ giữ nguyên hình dạng hiện tại (khác nhau cả màu, độ sáng lẫn hình). Vẽ đẹp hơn được, đổi hình thì không.
- Nhân vật đọc được ở chiều cao 160 px (điện thoại xoay ngang): bóng dáng (silhouette) mỗi nghề khác nhau, vũ khí nhìn ra ngay.
- Hiệu ứng chiêu không che bàn cờ quá 0,6 giây và không che đồng hồ lượt.

### 2.4 Hai tầng chi tiết (Shan chốt 20/10/2026)

Hình mẫu Shan gửi ngày 20/10/2026 (Đinh Bộ Lĩnh tướng quân trên mỏm đá, rồng vàng, ba lá cờ) là tranh tô màu chi tiết, nửa tả thực nửa anime, khác nét khắc gỗ màu phẳng ở mục 2.1. Shan chọn hướng lai, dùng **hai tầng chi tiết**:

| Tầng | Dùng ở | Mức chi tiết | Kích thước hiển thị |
|---|---|---|---|
| **Tranh lớn (splash)** | Landing, menu, màn chọn nhân vật, cận cảnh tuyệt chiêu, bảng thắng | Chi tiết như hình mẫu: hoa văn, ánh kim, nền có linh vật | 400–1000 px |
| **Nhân vật trong trận** | Sân khấu 3vs3, có hoạt ảnh | Cùng màu, cùng trang phục nhưng **gọn**: bớt hoa văn nhỏ, viền rõ, bóng 1–2 tông, không vật trang trí rời | 160–320 px |

- Tầng trận vẽ lại từ tranh lớn chứ không thu nhỏ: ở 160 px, hoa văn nhỏ thành nhiễu và bóng dáng phải đọc được.
- Áo choàng, dải lụa và cờ bay trong tầng trận cần **biến dạng lưới** (mesh), nên Spine Pro (hoặc Rive) gần như bắt buộc; cách tự viết ở mục 3.1 không đủ.
- Ngân sách mục 6.1 tăng cho tầng tranh lớn (≤ 250 KB mỗi tranh ở 1x, chỉ tải ở màn cần); tầng trận giữ nguyên.

**Bài học từ hình mẫu (áp dụng cho mọi hình tạo bằng AI):**

- Nền ô vuông xám trắng là **nền trong suốt vẽ giả**: file là RGB, không có kênh alpha. Tóc, lửa, lông cờ gần như không tách nền được bằng tay. Tạo lại trên **nền trơn một màu** (xanh lá hoặc hồng tươi, không có trong nhân vật) hoặc dùng công cụ xuất được alpha thật.
- Một hình chỉ một chủ thể: nhân vật, linh vật, cờ và mỏm đá tách thành hình riêng để làm lớp nền và parallax.
- **Đúng thời đại:** cờ thời Đinh ghi 大瞿越 (Đại Cồ Việt) hoặc chữ 丁 (Đinh), không ghi 大越 (quốc hiệu từ năm 1054 thời Lý). Cờ chủ đạo của Đinh Bộ Lĩnh nên là **cờ lau** (bông lau trắng), đúng tên game.
- Tránh motif đọc thành cổ trang Trung Quốc: rồng vàng có sừng kiểu triều đình, giáp vai đầu rồng, mũ quan nhiều tầng. Linh vật lấy theo bảng 2.2; nếu dùng rồng thì dùng dáng rồng Việt thân rắn uốn khúc mềm, và bàn trước với Shan vì rồng Việt định hình rõ từ thời Lý.
- Giữ lại từ hình mẫu: góc máy thấp tạo vẻ uy nghi, bảng màu đỏ son, xanh rêu, vàng đồng, vũ khí phát sáng theo nguyên tố.

### 2.5 Bảng mẫu (style frame) trước khi vẽ hàng loạt

Trước khi đặt vẽ cả bộ, làm **3 bảng mẫu** dựng sẵn để duyệt:

1. Màn trận đấu 3vs3 hoàn chỉnh trên khung 1280×720 (nền, khung bàn cờ, 6 nhân vật, thanh máu, một chiêu đang nổ).
2. Màn menu / bản đồ chiến dịch.
3. Một trang tính nhân vật (character sheet) Đinh Bộ Lĩnh tướng quân: mặt trước, 3/4, nghiêng, các mảnh cắt rời.

Bảng mẫu được duyệt thì ghi vào [Hình ảnh](art-bible.md) làm chuẩn, hình về sau so với nó.

## 3. Chọn kỹ thuật hoạt ảnh nhân vật

### 3.1 So sánh

| Cách | Ưu | Nhược | Dung lượng ước tính / nhân vật |
|---|---|---|---|
| **A. Vẽ từng khung (sprite sheet)** | Tự do nhất, ai cũng hiểu | Rất tốn công vẽ (6 hoạt ảnh × 8–16 khung × 61 nhân vật); AI tạo khung không đồng nhất giữa các khung; nặng | 1–4 MB |
| **B. Xương 2D, ảnh cắt mảnh (Spine)** | Chuẩn ngành, mượt, dùng lại hoạt ảnh giữa các nhân vật cùng dáng, có công cụ đóng gói atlas, runtime chính thức cho PixiJS | Phần mềm trả phí (bản Essential đủ dùng nếu không cần biến dạng lưới), runtime cần giấy phép Spine | 150–400 KB |
| **C. Xương 2D (Rive)** | Runtime mã nguồn mở, file rất nhỏ, có máy trạng thái (state machine) khớp với trạng thái trận | Ít tài liệu cho game hơn Spine; gói miễn phí giới hạn tính năng; thêm một runtime WASM riêng | 100–300 KB |
| **D. Tự viết hoạt ảnh cắt mảnh bằng code** | Không phí, không phụ thuộc; Claude viết được toàn bộ | Không có trình chỉnh sửa trực quan, chỉnh động tác bằng số; không có biến dạng lưới | 100–300 KB |

Giá và điều khoản Spine, Rive kiểm tra lại lúc mua.

### 3.2 Đã chốt sau bước thử Đ0 (Shan chốt 20/10/2026)

- **Hoạt ảnh nhân vật: cắt mảnh có xương (B hoặc D)**, không vẽ từng khung. Lý do: hợp phong cách khắc gỗ ghép lớp, nhẹ gấp 5–10 lần, dùng chung động tác cho nhiều nhân vật (mục 4.3).
- **Tự viết bằng code (cách D), không mua Spine.** Bản thử Đ0 dựng pháp sư hệ Thủy từ PSD tách lớp: 15 lớp WebP, 282 KB, PixiJS `MeshPlane` uốn lưới cho tóc, vạt áo và dải lụa, xoay khớp cho đầu và tay, chớp mắt, hạt nước, động tác thi triển và trúng đòn. Shan duyệt chuyển động. Trang thử ở `public/prototypes/water-mage.html`.
- Spine Professional chỉ cân nhắc lại khi cần động tác lớn mà chỉnh bằng số quá chậm.
- **Hiệu ứng chiêu, hạt, chữ số bay:** vẽ bằng code (hạt, vệt, chớp) trên cùng lớp với nhân vật, cộng vài ảnh nhỏ (đốm lửa, lá, giọt nước) trong atlas hiệu ứng. Không dùng video.
- **Hoạt ảnh giao diện** (nút, chuyển phân cảnh, bảng thưởng): CSS như hiện nay.

## 4. Danh mục tài sản

### 4.1 Tổng quan

| Nhóm | Số lượng | Ai làm | Định dạng trong game |
|---|---|---|---|
| Nhân vật ra trận (cắt mảnh + hoạt ảnh) | 1 + 6 tướng lịch sử + 12 sứ quân + 42 tướng thường + tùy tướng AI | Họa sĩ / Shan vẽ mảnh; dựng xương theo mục 3 | Atlas WebP + file xương JSON |
| Chân dung bán thân | như trên | Họa sĩ / Shan | WebP 128 và 256 px ([Hình ảnh 2.6](art-bible.md#26-đưa-hình-vào-game)) |
| Ô cờ, ô đặc biệt | 7 loại × 3 bản | Giữ SVG, đánh bóng lại | SVG trong code, raster hóa lúc tải (mục 7.3) |
| Biểu tượng kỹ năng, trang bị | ~60 kỹ năng, 15 loại trang bị × 7 hệ | Giữ SVG hiện có; trang bị vẽ thật theo [Hình ảnh 2.4](art-bible.md#24-danh-sách-hình) | SVG / WebP |
| Nền trận | 1 nền chung + 12 vùng đất sứ quân + tháp, sinh tồn, đấu trường | Họa sĩ / Shan | WebP 3 lớp parallax (xa, giữa, gần) |
| Khung giao diện | Khung bàn cờ sơn mài, khung thẻ, nút, thanh máu, bảng thưởng | Vẽ bằng SVG/CSS (Claude) theo bảng mẫu | SVG / CSS |
| Hiệu ứng | 7 bộ theo hệ + đòn thường + khiên, hồi máu, hiệu ứng trạng thái | Claude bằng code + ảnh hạt nhỏ | Atlas hiệu ứng ≤ 512×512 |
| Màn chính, bản đồ chiến dịch, landing | Tranh nền | Họa sĩ / Shan | WebP / AVIF |

### 4.2 Bộ hoạt ảnh của một nhân vật

Mỗi hoạt ảnh gắn với **sự kiện core** (`BattleEvent`) đang có, nên core không phải biết gì về đồ họa, giống cách `animation.ts` dựng hoạt ảnh bàn cờ hiện nay.

| Hoạt ảnh | Khi nào | Độ dài gợi ý | Lặp |
|---|---|---|---|
| `idle` đứng thở | Mặc định | 1,6–2,4 s | Có |
| `ready` sẵn sàng | Đến lượt nhân vật hành động | 0,3 s rồi về idle | Không |
| `attack` ra đòn | Phe ăn ô Kiếm / đánh thường | 0,5–0,7 s | Không |
| `cast` dùng chiêu | Dùng kỹ năng ô 1–4, 6 | 0,6–0,9 s | Không |
| `ultimate` tuyệt chiêu / chiêu riêng | Kỹ năng ô 5 | 1,2–1,8 s, có cận cảnh | Không |
| `hit` trúng đòn | Nhận sát thương | 0,3 s | Không |
| `guard` đỡ / có khiên | Nhận khiên, chặn đòn | 0,4 s | Không |
| `buff` / `debuff` | Nhận hiệu ứng tăng / giảm | 0,4 s | Không |
| `ko` gục | Hết máu | 0,8 s, giữ khung cuối | Không |
| `victory` thắng | Hết trận | 1,2 s rồi lặp đoạn cuối | Có |

Đã làm đủ 10 hoạt ảnh trên cả hai bộ xương (21/10/2026), mọi nhân vật có hình động dùng chung: `src/app/game/stage/director.ts` dịch sự kiện core sang động tác (khiên hút trọn đòn là `guard`, hiệu ứng `shield` là `guard`, hiệu ứng tốt/xấu là `buff`/`debuff`, `end` cho người còn đứng của phe thắng ăn mừng, `wave` ở Sinh tồn cho phe mình vào thế); `ready` phát khi đổi người hành động (`BattleStage.tsx`), không cắt ngang động tác đang chạy; tuyệt chiêu phóng to sân 1,3 lần quanh người tung chiêu kèm viền tối trong 1,5 s; phản ứng và ăn mừng dùng chung ở `kit.ts` (`reaction`, `victory`, `cueFx`). Nhân vật chưa có hình động (chân dung) cũng có đủ các động tác bằng CSS. Xem thử từng động tác ở `/demo/characters`.

Tổng mỗi lượt có hoạt ảnh nằm trong mục tiêu ở mục 1: đòn đánh và hoạt ảnh bàn cờ chạy **song song**, không nối đuôi; chỉ tuyệt chiêu được dừng bàn cờ.

### 4.3 Dùng chung để giảm công và dung lượng

- **6 bộ xương theo nghề** (Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư): cùng nghề thì cùng xương và cùng bộ động tác. 42 tướng thường chỉ khác **mảnh đầu, mảnh áo, màu nguyên tố và vũ khí** (thay mảnh, đổi màu).
- **Nhân vật riêng** (Đinh Bộ Lĩnh 3 thời kỳ, 6 tướng lịch sử, 12 sứ quân): mảnh riêng, có thể thêm 1–2 động tác riêng cho chiêu riêng; phần còn lại dùng bộ của nghề.
- **Đổi màu bằng code:** mảnh vẽ theo tông trung tính, vùng màu nguyên tố tách thành mảnh riêng để tô màu khi hiển thị. 7 biến thể nguyên tố của trang bị và trang phục không cần vẽ 7 lần.
- **Tùy tướng AI** dùng bộ tướng thường theo nghề, không vẽ riêng.

Ước tính: thay vì 61 bộ hoạt ảnh vẽ riêng, cần khoảng **6 bộ động tác + 19 bộ mảnh riêng + 42 bộ mảnh thay đầu/áo**.

### 4.4 Quy cách mảnh cắt cho họa sĩ / công cụ AI

Bổ sung vào [Hình ảnh mục 2.4](art-bible.md#24-danh-sách-hình) khi chốt mục 3:

- Mỗi nhân vật giao một file nhiều lớp, **mỗi mảnh một lớp có tên**: `head`, `hair`, `torso`, `pelvis`, `arm-upper-l/r`, `arm-lower-l/r`, `hand-l/r`, `leg-upper-l/r`, `leg-lower-l/r`, `foot-l/r`, `weapon`, `cape`/`sash`, `accent` (vùng màu nguyên tố).
- Mảnh vẽ **đầy đủ ở chỗ khuất** (vai, khuỷu, hông kéo dài thêm) để khi xoay không lộ khe hở.
- Tư thế chuẩn chữ A nhẹ, quay sang phải, chân trên đường nền như [Hình ảnh 2.4](art-bible.md#24-danh-sách-hình).
- **Quy trình đã kiểm chứng (20/10/2026):** Shan tạo **toàn thân một hình** bằng Copilot trên nền trơn → tách lớp bằng [live2dlayer](https://live2dlayer.com/) (tự tách khoảng 25 lớp và vá chỗ bị che, xuất PSD) → sửa thêm trong Photopea nếu cần → gửi PSD; Claude gộp lớp, xuất WebP và dựng động tác. Hướng dẫn tách tay ở `/mnt/project-files/guides/tach-lop-photopea.md`.
- Ba điểm cần kiểm tra trên PSD của live2dlayer: ảnh bị thu về 1024×1024 (đủ cho trong trận, tranh lớn dùng ảnh gốc); **bắp tay** dính vào lớp áo (cần tách thêm nếu nhân vật vung tay rộng, ví dụ tướng cầm đao); **vũ khí hoặc đồ cầm tay** nằm chung lớp `objects` với hiệu ứng (tách riêng trong Photopea).

## 5. Kiến trúc hiển thị

### 5.1 Hiện trạng

- Bàn cờ 12×8 là DOM, mỗi ô một SVG (`src/app/game/art/tiles.tsx`); hoạt ảnh bàn cờ là chuỗi khung dựng từ sự kiện core (`src/app/game/battle/animation.ts`) chạy bằng CSS `@keyframes` với `transform`/`opacity` và `setTimeout`.
- Toàn bộ màn trận nằm trong `DemoGame.tsx` (~2 200 dòng), state React đổi theo từng khung hoạt ảnh.
- Nhân vật là chân dung SVG tĩnh trên thẻ.

Cách này đủ cho bàn cờ, nhưng **không đủ** khi thêm 6 nhân vật có xương, hạt hiệu ứng và rung màn hình: DOM với hàng trăm phần tử chuyển động và React render lại mỗi khung sẽ giật trên điện thoại.

### 5.2 Đề xuất: ba lớp chồng nhau (chờ chốt)

```
┌─────────────────────────────────────────────┐
│ Lớp 3 – Giao diện (DOM + React)             │  nút kỹ năng, thanh máu, đồng hồ, bảng thưởng
├─────────────────────────────────────────────┤
│ Lớp 2 – Sân khấu (Canvas WebGL, PixiJS)     │  nền parallax, nhân vật, hiệu ứng, chữ số bay
├─────────────────────────────────────────────┤
│ Lớp 1 – Bàn cờ (DOM như hiện nay → có thể   │  chuyển vào lớp 2 nếu đo thấy chậm
│          chuyển sang Canvas sau)            │
└─────────────────────────────────────────────┘
```

- **PixiJS v8** cho lớp sân khấu: WebGL (WebGPU khi có), có runtime Spine chính thức, gom nhiều hình vào một lần vẽ (batching), có sẵn hệ hạt. Chỉ tải ở phân cảnh trận (`import()` động), landing và menu không phải tải.
- **Một vòng lặp hoạt ảnh duy nhất** (`requestAnimationFrame` qua ticker của Pixi) chạy ngoài React. React chỉ nhận sự kiện "xong hoạt ảnh" để commit state, như cách `/demo` đã commit state sau khi hoạt ảnh xong.
- **Đạo diễn trận (battle director):** module mới, nhận danh sách `BattleEvent` của một nước đi, dựng **dòng thời gian** (ai làm gì, lúc nào, song song hay nối tiếp), rồi phát cho lớp bàn cờ, lớp sân khấu và (sau này) âm thanh. `animation.ts` trở thành một phần của đạo diễn. Core không đổi.
- **Bàn cờ giữ DOM ở bước đầu**, chỉ chuyển vào Canvas nếu đo trên điện thoại thấy dưới mục tiêu (mục 7.1). Giữ DOM thì điều khiển vuốt/bàn phím và trợ năng hiện có giữ nguyên.
- **Tốc độ:** đạo diễn có hệ số tốc độ (×1, ×2) và lệnh bỏ qua (nhảy thẳng tới cuối dòng thời gian). Trận online vẫn lấy kết quả từ server, hoạt ảnh chỉ là phần trình diễn.

### 5.3 Tách `DemoGame.tsx`

Trước khi gắn sân khấu, tách `DemoGame.tsx` thành: điều khiển trận (state, gọi core/server), bàn cờ, HUD, đạo diễn. Việc này là refactor không đổi hành vi, làm thành một PR riêng có test hiện có bảo vệ.

## 6. Làm nhẹ game (nhiều ảnh nặng)

### 6.1 Ngân sách dung lượng (điểm xuất phát)

| Hạng mục | Ngân sách | Ghi chú |
|---|---|---|
| JS lần đầu vào landing | ≤ 200 KB gzip | Không chứa PixiJS, không chứa ảnh nhân vật |
| JS phân cảnh trận (thêm) | ≤ 350 KB gzip | PixiJS + runtime hoạt ảnh + đạo diễn |
| Ảnh để vào trận lần đầu (điện thoại) | ≤ 3 MB | 6 nhân vật + 1 nền + atlas hiệu ứng + giao diện |
| Một nhân vật (atlas 2x + xương) | ≤ 350 KB | Bộ mảnh thay đầu/áo của tướng thường ≤ 120 KB |
| Một nền trận (3 lớp) | ≤ 400 KB | 1x cho điện thoại, 2x cho màn hình lớn |
| Atlas hiệu ứng | ≤ 250 KB | Dùng chung mọi hệ |
| Chân dung | ≤ 60 KB mỗi hình 2x | Như [Hình ảnh 2.6](art-bible.md#26-đưa-hình-vào-game) |
| Bộ nhớ GPU khi trận đang chạy | ≤ 150 MB | Điện thoại cũ bị trình duyệt đóng tab khi quá giới hạn |

Script kiểm tra ngân sách chạy trong CI (mục 6.4); vượt ngân sách thì CI đỏ.

### 6.2 Định dạng & kích thước

- **WebP có alpha** cho mảnh nhân vật, atlas, nền; **AVIF** cho tranh nền lớn không cần trong suốt (landing, bản đồ) kèm WebP dự phòng.
- **Nhiều mức nét:** xuất 1x và 2x; chọn theo `devicePixelRatio` và **giới hạn tỉ lệ hiển thị tối đa 2** (điện thoại DPR 3 vẫn dùng 2x, mắt gần như không thấy khác mà tiết kiệm 2,25 lần điểm ảnh).
- **Atlas:** gom mảnh của một nhân vật vào 1 tấm ≤ 1024×1024 (2x) hoặc 512×512 (1x), cạnh là lũy thừa của 2, cắt sát phần trong suốt khi đóng gói. Nhân vật cùng trận không ghép chung atlas để tải/xả riêng được.
- **Nén texture GPU (bước sau, nếu bộ nhớ GPU vượt ngân sách):** KTX2/Basis Universal, PixiJS đọc được; ảnh WebP 300 KB khi giải nén thành texture 1024² vẫn chiếm 4 MB GPU, KTX2 giảm còn khoảng 1 MB.
- **Ô cờ và biểu tượng giữ SVG** (vài KB), không đổi sang ảnh.

### 6.3 Tải theo nhu cầu

- **Theo phân cảnh:** landing chỉ tải tranh landing; menu tải chân dung; vào trận mới tải atlas nhân vật của đúng 6 người trong trận + nền của vùng đất màn đó.
- **Tải trước khi rảnh:** ở màn chờ (`SetupLobby`) và màn chiến dịch, khi người chơi chọn màn thì bắt đầu tải nhân vật của màn đó; trận kế của Leo tháp / Sinh tồn tải trong lúc nghỉ.
- **Màn tải** dùng hình chim Lạc bay đã có, hiện phần trăm theo danh sách tài sản (manifest).
- **Thứ tự ưu tiên:** bàn cờ và giao diện hiện trước (chơi được ngay), nhân vật hiện bằng chân dung tạm cho tới khi atlas tải xong rồi mờ dần sang bản có hoạt ảnh. Mạng chậm không chặn người chơi.
- **Xả bộ nhớ:** rời trận thì hủy texture nhân vật không còn dùng; giữ lại nhân vật chính và đội người chơi.

### 6.4 Pipeline xử lý ảnh

Mở rộng quy ước ở [Hình ảnh 2.6](art-bible.md#26-đưa-hình-vào-game):

1. File gốc của họa sĩ / Shan lưu ngoài repo (không đổi, không xóa).
2. Script `pnpm art:build` (Node + `sharp`, chạy trên máy hoặc CI): đọc thư mục bản sao đầu vào, kiểm tra kích thước gốc, kênh alpha, tên lớp; thu nhỏ 1x/2x; đóng gói atlas; xuất WebP/AVIF; ghi `public/art/manifest.json` gồm đường dẫn, kích thước, dung lượng và **mã băm nội dung trong tên file** (ví dụ `dinhBoLinh.3f9a1c.webp`).
3. Script `pnpm art:check` trong CI: so dung lượng với ngân sách 6.1, báo hình thiếu trong manifest, hình trong manifest mà không dùng.
4. Trang `/demo/art` hiện mọi tài sản trong manifest trên nền sáng và tối, kèm dung lượng, để duyệt bằng mắt.

### 6.5 Phân phối

- Ảnh trò chơi đặt trong `public/art/` có mã băm trong tên, đặt `Cache-Control: public, max-age=31536000, immutable` (qua `headers()` trong `next.config.ts`). Lần chơi thứ hai gần như không tải lại ảnh.
- **Không dùng `next/image`** cho atlas và mảnh nhân vật: ảnh đã tối ưu sẵn, và tối ưu ảnh trên Vercel tính vào hạn mức. Chỉ cân nhắc `next/image` cho tranh landing.
- Repo: ảnh xuất tổng dưới khoảng 50 MB thì để thẳng trong git; lớn hơn thì cân nhắc Git LFS hoặc lưu trữ ngoài (Vercel Blob). Tính lại khi có lô hình đầu.
- Tùy chọn sau: service worker lưu sẵn tài sản để chơi khi mạng chập chờn (chỉ phần Chơi thử chạy offline được).

## 7. Tối ưu chống giật lag

### 7.1 Mục tiêu đo được

| Chỉ số | Mục tiêu |
|---|---|
| Khung hình khi hoạt ảnh | 60 fps máy tính; ≥ 50 fps Android tầm trung (RAM 4 GB, Chrome); không khung > 50 ms |
| Độ trễ thao tác (INP) | < 200 ms từ lúc vuốt/click tới khi ô bắt đầu di chuyển |
| Tác vụ dài trên luồng chính | Không tác vụ > 50 ms trong lúc trận đang chạy |
| Vào trận | < 3 s trên 4G lần đầu, < 1 s khi đã có cache |
| Bộ nhớ | Không tăng dần qua 10 trận liên tiếp (không rò rỉ texture) |

### 7.2 Quy tắc viết code hoạt ảnh

- **Chỉ một vòng `requestAnimationFrame`**; bỏ dần chuỗi `setTimeout` dựng khung (dễ lệch nhịp, dồn việc). Thời gian tính theo đồng hồ khung, không theo số lần gọi.
- **React không render lại mỗi khung.** Vị trí, độ mờ, khung hoạt ảnh nằm trong đối tượng Pixi hoặc `ref`; React chỉ đổi khi số liệu trận đổi (máu, năng lượng, lượt).
- DOM chỉ hoạt ảnh **`transform` và `opacity`**. Không hoạt ảnh `filter: blur/drop-shadow`, `box-shadow`, `width/height/top/left`. Bóng và phát sáng vẽ sẵn vào ảnh.
- **Dùng lại đối tượng (pool)** cho hạt hiệu ứng và chữ số bay, không tạo mới rồi bỏ mỗi lần.
- Giới hạn hạt: tối đa ~300 hạt cùng lúc ở mức cao, ~80 ở mức thấp.
- Văn bản trên canvas (số sát thương) dùng font bitmap hoặc cache sẵn chữ số, không vẽ chữ mới mỗi khung.

### 7.3 Ô cờ SVG

96 ô SVG có nhiều nét là chi phí lớn nhất của bàn cờ hiện tại khi chúng cùng chuyển động. Hai bước:

1. Đo trước: nếu đạt mục tiêu 7.1 thì giữ nguyên.
2. Nếu không: **raster hóa SVG một lần lúc tải** (vẽ mỗi loại ô vào một canvas nhỏ theo DPR, dùng làm ảnh), bàn cờ hiển thị ảnh thay vì SVG sống. Hình vẫn sinh từ code, không cần họa sĩ, không tăng dung lượng tải.

### 7.4 Việc nặng ra khỏi luồng chính

- **AI chạy trong Web Worker** ở Chơi thử: AI mức Trùm giả lập nhiều nước đi, có thể mất hàng trăm ms và làm khựng hoạt ảnh. Core là TypeScript thuần nên chạy được trong worker không cần sửa. Online thì AI đã chạy trên server.
- Giải mã ảnh bằng `createImageBitmap` / `img.decode()` trước khi đưa lên GPU, tránh khựng lúc ảnh hiện lần đầu.
- Tải trước và "làm nóng" texture ở màn chờ để khung đầu tiên của trận không bị khựng.

### 7.5 Mức chất lượng tự điều chỉnh

| Mức | Tỉ lệ hiển thị | Hạt | Nền parallax | Rung màn hình, cận cảnh tuyệt chiêu |
|---|---|---|---|---|
| Cao | DPR, tối đa 2 | Đầy đủ | 3 lớp, chuyển động | Có |
| Vừa | tối đa 1,5 | 50% | 3 lớp, đứng yên | Có |
| Thấp | 1 | 20% | 1 lớp | Tắt |

- Mặc định chọn theo máy (`navigator.hardwareConcurrency`, `deviceMemory` nếu có, kích thước màn hình); trong trận đo thời gian khung trung bình, thấp hơn mục tiêu liên tục vài giây thì tự hạ một mức.
- Người chơi chọn tay được trong cài đặt; lưu `localStorage`.
- Tôn trọng `prefers-reduced-motion`: tắt rung màn hình, cận cảnh, giảm hạt.
- Tab ẩn (`visibilitychange`) thì dừng vòng hoạt ảnh. Đồng hồ lượt vẫn theo server như hiện tại.

### 7.6 Đo và kiểm tra

- **Bảng đo trong bản dev:** góc màn hiện fps, thời gian khung, số lần vẽ (draw call), bộ nhớ texture.
- **Thiết bị thử:** một Android tầm trung, một iPhone đời cũ (Safari), máy tính; khi không có máy thật thì Chrome DevTools giảm CPU ×4.
- **Kịch bản cố định:** một trận 3vs3 phát lại theo seed có tuyệt chiêu, chuỗi cascade dài, 3 hiệu ứng cùng lúc; chạy bằng Playwright, ghi thời gian khung. So kết quả trước và sau mỗi PR đồ họa lớn.
- Lighthouse cho landing (LCP < 2,5 s trên điện thoại).

## 8. Trang trí đồ họa

### 8.1 Màn trận

- **Nền theo vùng đất:** mỗi sứ quân một nền gợi đất của họ (`CampaignStage.region`), ví dụ Hoa Lư núi đá vôi, vùng ven biển có sóng, vùng đồng bằng có ruộng và lũy tre. Leo tháp, Sinh tồn, Đấu trường, Thử thách ngày mỗi chế độ một nền riêng. 3 lớp parallax lệch nhẹ khi nhân vật ra đòn.
- **Khung bàn cờ:** sơn mài đỏ son, viền đồng có hoa văn răng cưa trống đồng, bốn góc là mặt trống nhỏ. Ô đặc biệt bản mạnh dùng lại họa tiết mặt trời trống đồng như hiện nay.
- **Thẻ nhân vật:** khung gỗ khắc, viền theo màu nguyên tố, thanh máu dạng cuộn giấy, thanh Nộ dạng ngọn cờ lau (đã có hình cờ lau thủ lĩnh).
- **Phản hồi cú đánh:** dừng hình 60–80 ms khi trúng đòn mạnh, rung màn nhẹ (tối đa 6 px), nháy trắng nhân vật trúng đòn, chữ số bay như hiện có.
- **Cận cảnh tuyệt chiêu:** nền tối đi, dải mực ngang có chân dung lớn và tên chiêu viết kiểu thư pháp, 1 giây, bỏ qua được.
- **Kết trận:** chiến thắng có cờ lau phất và chim Lạc bay ngang; thua có màn sương mực.

### 8.2 Ngoài trận

- **Landing và menu:** tranh lớn Đinh Bộ Lĩnh cầm cờ lau trên lưng trâu trước đồi Hoa Lư; chim Lạc bay đã có giữ lại.
- **Bản đồ chiến dịch:** họa sĩ vẽ lại bản đồ giấy dó hiện có ([Hình ảnh mục 1](art-bible.md#1-bộ-hình-dựng-bằng-code)), giữ vị trí các màn; mỗi màn là một dấu son, qua màn thì đóng ấn.
- **Chuyển phân cảnh:** quét mực ngang (dải mực tràn qua màn) 300–400 ms, CSS thuần.
- **Hoa văn dùng chung:** bộ viền SVG (răng cưa, sóng, mây cuộn, vòng tròn đồng tâm) làm thành thành phần dùng lại cho mọi bảng, nút, tiêu đề.

### 8.3 Chữ

- Cần font **hỗ trợ đủ dấu tiếng Việt** (kiểm tra cả chữ hoa có dấu như "Ặ", "Ữ"). Hai loại: một font tiêu đề mang nét bút lông / khắc cho tên chiêu, tên màn; một font không chân dễ đọc cho số liệu và nút.
- Tự lưu font trong repo bằng `next/font`, chỉ lấy bộ ký tự Latin + tiếng Việt, ≤ 2 font, ≤ 4 kiểu chữ.

> TODO (chờ chốt): chọn 2 font cụ thể sau khi có bảng mẫu 2.4.

## 9. Lộ trình triển khai

Mỗi bước là một hoặc vài PR vào develop. Cột "Ai" là phần việc chính; "Claude" là code, "Shan / họa sĩ" là vẽ.

| Bước | Việc | Ai | Xong khi |
|---|---|---|---|
| **Đ0. Thử nghiệm** | 1 nhân vật Đinh Bộ Lĩnh (hình tạm cắt mảnh) với `idle` + `attack`, dựng bằng Spine và bằng cách tự viết; một sân khấu PixiJS trên màn trận hiện tại; đo dung lượng và fps trên điện thoại | Claude, Shan tạo 1 hình | Đã xong 20/10/2026: chốt tự viết bằng code (mục 3.2) |
| **Đ1. Art bible + bảng mẫu** | 3 bảng mẫu mục 2.5, bảng linh vật 2.2, quy cách mảnh 4.4; cập nhật [Hình ảnh](art-bible.md) | Shan / họa sĩ, Claude viết docs | Shan duyệt bảng mẫu theo hai tầng chi tiết (2.4) |
| **Đ2. Pipeline ảnh** | `pnpm art:build`, `art:check`, manifest có mã băm, cache immutable, `/demo/art` đọc manifest, ngân sách trong CI | Claude | CI đỏ khi vượt ngân sách |
| **Đ3. Tách màn trận + đạo diễn** | Tách `DemoGame.tsx` (5.3), một vòng rAF, đạo diễn dòng thời gian, tốc độ ×1/×2/bỏ qua; AI Chơi thử chạy trong worker | Claude | Hành vi trận không đổi, test cũ xanh, không còn tác vụ > 50 ms khi AI nghĩ |
| **Đ4. Sân khấu nhân vật** | Lớp PixiJS, nhân vật chính có đủ bộ hoạt ảnh 4.2, các nhân vật khác tạm dùng chân dung có hiệu ứng nhún; tải theo nhu cầu 6.3; mức chất lượng 7.5 | Claude, Shan / họa sĩ: mảnh Đinh Bộ Lĩnh | Đạt mục tiêu 7.1 trên điện thoại thử |
| **Đ5. 6 bộ xương theo nghề** | 6 bộ động tác + mảnh 5 tướng khởi đầu; đổi màu nguyên tố bằng code | Shan / họa sĩ mảnh, Claude hoặc người dựng xương | Trận 3vs3 với đội khởi đầu đều có hoạt ảnh |
| **Đ6. Hiệu ứng 7 hệ** | Bộ hiệu ứng đòn thường, 7 hệ, khiên/hồi máu/hiệu ứng trạng thái, phản hồi cú đánh, cận cảnh tuyệt chiêu | Claude | Mỗi kỹ năng có hiệu ứng theo hệ, dưới ngân sách hạt |
| **Đ7. Trang trí** | Khung bàn cờ, thẻ nhân vật, nền theo vùng đất, chuyển phân cảnh, font, landing, bản đồ chiến dịch | Shan / họa sĩ nền và tranh, Claude khung và CSS | Mọi phân cảnh dùng bộ giao diện mới |
| **Đ8. Nhân vật còn lại theo lô** | Lô 1: 6 tướng lịch sử; lô 2: 12 sứ quân (theo thứ tự chiến dịch); lô 3–5: 37 tướng thường (thay mảnh đầu/áo) | Shan / họa sĩ, Claude đưa vào manifest | Mọi nhân vật có hoạt ảnh; nhân vật chưa có vẫn hiện bằng chân dung tạm |
| **Đ9. Kiểm tra hiệu năng cuối** | Chạy kịch bản 7.6 trên đủ thiết bị, sửa điểm nghẽn, chốt ngân sách | Claude | Đạt bảng 7.1; ghi kết quả vào docs |

- Đ2 và Đ3 không cần hình, làm được ngay sau khi chốt Đ0.
- Đ5–Đ8 đi theo tốc độ có hình; code luôn có **đường dự phòng** (chân dung SVG tạm) nên không chặn phát hành.
- Âm thanh ([lộ trình 6.2](../09-roadmap/lo-trinh.md#giai-đoạn-6-đánh-bóng-và-phát-hành)) cắm vào đạo diễn trận ở Đ3, cùng dòng thời gian với hoạt ảnh.

## 10. Rủi ro

| Rủi ro | Cách giảm |
|---|---|
| Hình AI không đồng nhất giữa các nhân vật | Khối phong cách chung ([Hình ảnh 2.7](art-bible.md#27-câu-lệnh-mẫu-cho-công-cụ-ai-vẽ-ảnh)), so với bảng mẫu, tô màu nguyên tố bằng code thay vì để AI chọn màu |
| Tách mảnh tốn công hơn dự tính | Dùng chung 6 bộ xương nghề; tướng thường chỉ thay đầu/áo; đo thời gian thật ở Đ0 |
| Hoạt ảnh làm trận chậm, chán | Chạy song song với bàn cờ, ×2 và bỏ qua, chỉ tuyệt chiêu dừng bàn cờ |
| Điện thoại cũ giật hoặc đóng tab vì hết bộ nhớ | Ngân sách GPU 150 MB, mức chất lượng tự hạ, xả texture khi rời trận, KTX2 nếu cần |
| Bản quyền hình và công cụ | Nguyên tắc clean-room ([Hình ảnh 2.3](art-bible.md#23-nguyên-tắc-clean-room-bắt-buộc)); kiểm tra điều khoản thương mại của Spine/Rive và công cụ AI |
| Repo phình vì ảnh | Chỉ commit bản xuất đã tối ưu, file gốc ngoài repo, xem lại LFS/Blob khi vượt ~50 MB |

## 11. Việc cần Shan chốt

> TODO (chờ chốt): dùng PixiJS cho lớp sân khấu, bàn cờ giữ DOM tới khi đo thấy cần chuyển. → mục 5.2
> TODO (chờ chốt): ngân sách dung lượng và hiệu năng ở mục 6.1 và 7.1. → mục 6.1
> TODO (chờ chốt): bảng linh vật 7 hệ và mức xuất hiện của linh vật. → mục 2.2
> TODO (chờ chốt): 2 font tiêu đề và nội dung. → mục 8.3
