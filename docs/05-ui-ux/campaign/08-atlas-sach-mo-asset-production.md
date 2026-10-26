# 08 — Bản đồ minh họa dạng sách mở (Illustrated Atlas Art Bible)

> Cập nhật: 26/10/2026
> Ưu tiên: MAP-ART-01 sau MAP-01; MAP-ART-02 sau MAP-02. Audio và Voice: TODO / DEFERRED.

## 1. Yêu cầu mới, đối chiếu ảnh người dùng

Ảnh tham chiếu cho thấy một cuốn sách địa chí mở ngang, trang trái là bảng thuyết minh màu đen chữ trắng, trang phải là **BẢN ĐỒ VẼ TAY CÓ NỘI DUNG** gồm sông xanh ngọc, làng, cây rừng, thành, đường và bố cục atlas thu nhỏ. Tài liệu cũ 05-asset-prompts.md mới chỉ có texture giấy dó, chưa đáp ứng yêu cầu.

Mục tiêu mới: mỗi chương Campaign V2 có tranh bản đồ minh họa như cuốn sử ký cổ, được lồng vào khung sách thật đẹp; dữ liệu 24 mission vẫn hoàn toàn tương tác. Ảnh mẫu mô tả Cổ Loa; đó là tham chiếu PHONG CÁCH, không sao chép nội dung địa lý Cổ Loa sang Hoa Lư/Bố Hải.

## 2. Tách lớp asset (bắt buộc)

| Lớp | Asset / code | Ai làm | Chức năng |
|---|---|---|---|
| A | public/art/campaign/atlas/book-shell.webp | AI ảnh | Hai trang sách mở có gáy, bìa cổ, mép giấy. Trang trái đen, trang phải nền giấy sáng, KHÔNG chữ |
| B | public/art/campaign/atlas/map-ch01.webp ... map-ch06.webp | AI ảnh | Sáu tranh bản đồ thực sự: sông, rừng, thành đất, bến, làng, đồi, màu nước |
| C | CampaignMap.tsx + mapLayout.ts | Codex/SVG | Marker M01–M24, đường phụ thuộc, label, vùng tranh chấp, trạng thái, zoom/pan |
| D | CampaignAtlas/ChapterOne và missionCopy | React/HTML | Tiêu đề sử ký, nội dung, 4 nhiệm vụ/chương, nhãn sử liệu, nút bấm |
| E | decor-compass.webp hoặc SVG | AI/code | La bàn và viền trang trí không có chữ; tùy chọn |

**Không đóng băng bản đồ động thành một ảnh duy nhất.** Người chơi phải bấm được mission và text phải cập nhật theo state server. Giữ nguyên luật mapLayout; không sửa tọa độ lịch sử chỉ vì ảnh AI vẽ khác.

## 3. Quy chuẩn art và bố cục

- Desktop: khung sách mở 2560×1440 (16:9), nhìn gần chính diện hơi từ trên xuống, viền sách 5% an toàn.
- Trang trái chiếm khoảng 35–40% phần nội dung: nền than đen nâu, để trống để code in chữ sắc nét. Gáy 3–5%. Trang phải 55–60% có bản đồ.
- Tranh map-chXX riêng: gần vuông 1536×1536, nhìn từ trên cao kiểu atlas tranh vẽ, không có gáy sách. Kẹp vào mặt trang phải bằng CSS clip/mask. Sông và địa hình cần tương phản rõ nhưng không che marker.
- Bảng màu: giấy dó #EADCBF; mực nâu #4B3625; vàng đồng cổ #A8783E; xanh nước ngọc #478F83; xanh rừng #688464; đường đất #B88A50; panel đen #1B1A17.
- Mỗi cảnh dùng cùng kỹ thuật màu nước + khắc gỗ, không chuyển sang 3D hiện đại.
- Mobile 360–390px: không ép nguyên hai trang xuống màn hình. Tách tab Sử ký/Bản đồ, mission list dễ nhấn, khung sách có thể chỉ dùng làm decoration.
- Không tự tạo chữ tiếng Việt bằng AI; tên địa danh, nhãn nguồn sử, số chương, status, marker, tooltip, đường quân, biên giới và ảnh chân dung phải dựng bằng code.

## 4. PROMPT IMAGE 01 — Khung sách hai trang KHÔNG CÓ BẢN ĐỒ (book-shell)

Sử dụng ảnh người dùng làm style reference nếu công cụ hỗ trợ. Không sao chép bố cục Cổ Loa, đường sông, văn bản hay artwork nguyên bản.

    A premium hand-crafted open Vietnamese historical atlas book seen almost straight-on with a gentle elevated angle, complete wide two-page spread, thick aged handmade paper, beautiful antique dark-wood and ochre cover, natural curved center gutter, warm bronze Dong Son-inspired decorative corners, subtle page-edge shadows and mulberry-paper fibers. LEFT page: large deep charcoal-black empty narrative panel occupying about 37 percent of the usable spread, reserved for real HTML text. RIGHT page: spacious empty ivory handmade parchment page, about 60 percent of the usable spread, reserved for a separate painted map layer. Thin restrained bronze rules around the page margins, crisp and refined layout suitable for a sophisticated 2D history strategy web game. Realistic handcrafted open book appearance but clean game UI readability. Whole book fully in frame, wide 16:9 landscape, 2560x1440. ABSOLUTELY NO text, letters, typography, pseudo-text, location names, map graphics, rivers, pins, buttons, portraits, interface content, modern icons, logos or watermark. Do not copy any existing published atlas illustration.

Yêu cầu kiểm duyệt: sách mở đủ rộng, góc nhìn không nghiêng quá mức, trang trái đủ vùng cho nội dung, gáy không che phải, hoàn toàn không có chữ AI. Nếu tạo ra chữ lỗi, tạo lại/xóa sạch.

## 5. PROMPT IMAGE 02 — Tranh bản đồ Hoa Lư VẼ TAY (pilot map-ch01)

Khác texture giấy trống: tranh này **BẮT BUỘC CÓ SÔNG, RỪNG, THÀNH ĐẤT, LÀNG, NÚI**, được thể hiện như bản đồ minh họa.

    Hand-painted miniature pictorial atlas map of the Hoa Lu valley and surrounding northern Vietnamese lowland and limestone-karst landscape, inspired by the appearance of luxurious illustrated historical geography books. Tenth-century Vietnam atmosphere, nearly top-down aerial map view, handmade ivory mulberry paper, thick gently meandering jade-green and turquoise rivers, limestone karst mountain clusters, bamboo groves, tiny rustic thatched timber villages, earthen defensive walls, modest wooden watchtowers, winding ochre paths, rice paddies, bridges and small riverboats. Beautiful layered watercolor pigments with precise woodcut-style brown contour lines, rich yet legible handcrafted tiny details, historically sensitive vernacular architecture, evocative topographic manuscript art. THIS IS A FULL PAINTED MAP ILLUSTRATION, NOT BLANK PARCHMENT. Right-page map content only; no surrounding book, no paper border, no left black page, no UI. Keep clear patches of ground so interactive labels and mission markers can later be added by SVG. Do not attempt to assert exact historical coordinates; decorative illustrated geography only. Near-square 1536x1536. NO letters, NO Chinese characters, NO Vietnamese text, NO pseudo-writing, NO location labels, NO cardinal letters, NO mission pins, NO national/political borders, NO European castles, NO modern objects, NO watermark or logos.

Nếu cần chính xác hóa đường sông, để phần code SVG đảm nhiệm vị trí; ảnh cung cấp chất liệu mỹ thuật và cụm cảnh vật, không phải dữ liệu GIS.

## 6. Các biến thể bắt buộc cho sáu chương

Dùng cùng prompt pilot ở mục 5 và thay phần địa hình theo chương (giữ style/seed nếu công cụ cho phép). KHÔNG thay text mission canonical.

| Asset | Nội dung minh họa | Đoạn prompt thêm |
|---|---|---|
| map-ch01.webp | Hoa Lư, cờ lau, phòng thủ | Limestone karst valley, rivers, reed fields, compact earthen fort |
| map-ch02.webp | Bố Hải, ngoại giao Trần Lãm | Wide northern river harbor, small docks, merchant boats, riverside council pavilion |
| map-ch03.webp | Đồng bằng sau biến động 965, Đằng Châu | Branching delta rivers, modest crossings, scattered stockades, fog, uncertain routes |
| map-ch04.webp | Nhánh tây: Đường Lâm, Tam Đái, Phong Châu, Hồi Hồ | Wooded westward hills, marsh, timber defenses, upland river crossings |
| map-ch05.webp | Nhánh đông: Siêu Loại, Tiên Du, Tế Giang, Tây Phù Liệt | Alluvial fields, canal crossings, eastern plains, local fortified settlements |
| map-ch06.webp | Đỗ Động, Hoa Lư, năm 968 | Wetlands near river fort and dignified Hoa Lu timber ceremonial pavilion |

Không có tên nhân vật/sứ quân hoặc vết chém/đánh trận trên tranh nền. M12 Bình Kiều và M22 không có địa điểm cố định xử lý như hiện tại trong mapLayout.unplaced, không bịa chấm bản đồ.

## 7. PROMPT IMAGE 03 — Hoa văn trang trí (optional)

    Isolated historical Vietnamese Dong Son-inspired bronze compass rosette, stylized Lac-bird curves, engraved antique bronze patina, clean 2D atlas icon drawn perfectly from above, transparent background, restrained ornamental details, no text, no cardinal letters, no numbers, no watermark, no background scene.

## 8. Quy trình thực hiện 2 task

### MAP-ART-01 — Tạo ảnh / duyệt pilot

1. Tạo 2–3 phiên bản book-shell từ Prompt 01. Chọn 1, ghi quyết định.
2. Tạo 2–3 phiên bản map-ch01 từ Prompt 02, duyệt cảnh đúng Hoa Lư và style như ảnh người dùng.
3. Ghép thử khung sách + map-ch01 vào mock UI: chữ bên trái do HTML render; marker từ MAP_LAYOUT bên phải.
4. Kiểm cả desktop 1440×900 lẫn mobile 390×844; bản đồ không được quá tối hoặc quá nhiều chi tiết khiến node chìm.
5. Sau khi duyệt pilot mới tạo map-ch02..06; không sinh tất cả trước khi thống nhất phong cách.
6. Tách source master PNG/lossless lưu riêng; xuất bản WebP đã nén và ảnh 1x/2x nếu cần. Asset chỉ đặt trong public khi thực sự có file.
7. Viết asset manifest key theo chapter. Không ghi file giả/khai đã có khi chưa sản xuất.

### MAP-ART-02 — Ghép vào code

1. Xây AtlasBookFrame để trình bày khung sách.
2. AtlasChapterMapArt tải ảnh theo chapter; dùng object-fit/mask có kiểm soát, tránh vỡ hoặc kéo méo.
3. SVG CampaignMap và toàn bộ marker / route / status / source note vẫn là lớp tương tác trên cùng.
4. Nếu ảnh và marker không khớp, ưu tiên dữ liệu hiện có; chỉnh ảnh/mask chứ không đổi tọa độ lung tung.
5. Khi ảnh chưa có/fail: fallback CSS parchment và SVG hiện có, tránh 404; không chặn chơi.
6. Kiểm zoom/pan/pinch, mouse, keyboard, mobile, chapter IV/V song song, VI cần cả hai nhánh.

## 9. Gate và QA

- [ ] Có **bản đồ có minh họa thật** (núi/sông/thành/làng) giống tinh thần ảnh tham chiếu, không chỉ nền giấy.
- [ ] Book shell và tranh atlas tách riêng; không có chữ AI.
- [ ] Trong code vẫn có chính xác 24 mission và các trạng thái dynamic.
- [ ] Phân loại Recorded / Legend / Reconstructed / Fictional / Disputed không bị xóa hoặc vẽ chết vào pixel.
- [ ] Không sao chép Cổ Loa vào bối cảnh Hoa Lư.
- [ ] Không regress Raid, Trial, Destiny, Survival, quests hoặc reward.
- [ ] Audio, Voice, SFX, TTS giữ TODO — DEFERRED.
