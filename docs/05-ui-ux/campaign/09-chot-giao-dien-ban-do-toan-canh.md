# 09 — DESIGN FREEZE UI: Sử ký + bản đồ toàn cảnh 12 cứ điểm + panel chi tiết

> Cập nhật: 26/10/2026  
> Trạng thái: **APPROVED** — phương án giao diện đã được Shan duyệt qua ảnh concept trong hội thoại. **Chưa đồng nghĩa source code hoặc asset bản đồ đã hoàn thành.**  
> Đây là đặc tả hình thức/điều hướng UI, KHÔNG ghi đè `docs/02-game-modes/campaign/design-freeze.md` và ma trận sử liệu.

## A. Mục tiêu cuối cùng người chơi phải thấy

**Một màn hình World Atlas duy nhất**, bố cục desktop ba phần như ảnh concept cuối:

1. **Trái — Sử ký sáu chương (20–23% bề rộng)**: 6 chương, thumbnail nhỏ, tiến độ 0–4/4, trạng thái khóa/đang mở/đã xong. Chọn chương không thay thế bản đồ; chỉ thay vùng và nhiệm vụ được tô sáng.
2. **Giữa — bản đồ toàn cảnh (53–60%)**: nền phong cách tranh địa chí Việt thế kỷ X, màu nước/giấy dó, núi/rừng/sông/thành; hiện Hoa Lư + các cứ điểm của 12 sứ quân; pan/zoom, cờ theo trạng thái chính trị. Đây là **bản đồ thế cục**, KHÔNG phải 6 màn bản đồ tách rời.
3. **Phải — panel ngữ cảnh (23–27%)**: khi chọn cứ điểm/vùng, hiển thị tên vùng, tên sứ quân, mức chắc chắn sử liệu, kết cục/quan hệ nếu server đã ghi nhận, ảnh minh họa (optional), các mission liên quan và CTA mở mission hợp lệ. Khi chưa chọn gì, hiển thị chương đang chọn và gợi ý điểm tiếp theo.
4. **Header**: title Sử ký Đại Việt; nếu tái sử dụng navigation game thì không đổi routes/resources đang chạy. Kiểu khung đồng cổ/nâu đậm/giấy dó, không giả giao diện triều đại khác.

Ảnh concept chỉ đóng vai trò **UI visual target**, KHÔNG là nguồn lịch sử, nguồn địa điểm, tên mission, tình trạng sứ quân, phần thưởng hoặc chữ chính thức. Ảnh AI có tên/địa vực/cờ/mốc thời gian sai: phải được loại bỏ khi làm UI thật.

## B. Bản đồ thế cục (world) khác nhiệm vụ (missions)

- **13 điểm thuộc World Atlas** = **Hoa Lư** (đầu não của Đinh Bộ Lĩnh, KHÔNG là sứ quân) + **12 cứ điểm sứ quân**. Không nhầm 13 điểm với chiến dịch 13 màn cũ đã xóa.
- **24 missions M01–M24** vẫn từ `STORY_NODES`, giữ nhiệm vụ theo 6 chương x 4; không tạo 12 trận chinh phục cho 12 sứ quân.
- **World point** là nút vùng/cứ điểm để đọc lore và xem missions gắn vùng; **Mission CTA** là nút bắt đầu/đọc tiếp mission. Một vùng có thể chứa nhiều missions.
- Cờ kết cục **không được lấy từ màu ngẫu nhiên trong ảnh**. Trước khi hoàn thành mission liên quan: hiển thị trung tính/chưa rõ; sau khi server ghi nhận: liên minh, quy phục, đánh dẹp hoặc còn chưa chắc. Bản đồ KHÔNG tự thay đổi cốt truyện theo click.
- Các đường nối đã có trong `CampaignMap.tsx` là DAG điều kiện mở khóa, **không khẳng định đường quân tiến/đường giao thông lịch sử**.
- Không có `M01–M24` in dưới tên địa danh trong ảnh nền. ID nhiệm vụ chỉ thuộc panel bên phải hoặc nhãn tương tác theo lựa chọn UI.

## C. Danh mục vùng chính xác từ code

| Điểm | Nhân vật / quan hệ | Mission tiêu biểu | Cách trình bày |
|---|---|---|---|
| Hoa Lư | Đinh Bộ Lĩnh (đầu não) | M01–M04, M09–M10, M23–M24 | Căn cứ chính, không tính là 1 trong 12 sứ quân |
| Bố Hải Khẩu | Trần Lãm | M05–M08; M06 liên minh | Liên minh, KHÔNG cảnh Đinh Bộ Lĩnh đánh bại ông |
| Đằng Châu | Phạm Bạch Hổ | M11 | Quy phục |
| Bình Kiều | Ngô Xương Xí | M12 | **Vị trí còn tranh luận; hiển thị trong danh mục điểm chưa định vị, không cắm cờ GPS tùy tiện** |
| Đường Lâm | Ngô Nhật Khánh | M13 | Địa vực còn tranh luận; gắn nhãn sử liệu |
| Tam Đái | Nguyễn Khoan | M14 | Kết cục tan rã/chưa chắc, KHÔNG tạo nhiệm vụ công phá Tam Đái |
| Phong Châu | Kiều Công Hãn | M15 | Đánh dẹp |
| Hồi Hồ | Kiều Thuận | M16 | Đánh dẹp |
| Siêu Loại | Lý Khuê | M17 | Đánh dẹp |
| Tiên Du | Nguyễn Thủ Tiệp | M18 | Đánh dẹp |
| Tế Giang | Lữ Đường | M19 | Quan hệ theo về với độ chắc chắn thấp; không biến thành thủy chiến |
| Tây Phù Liệt | Nguyễn Siêu | M20 | Đánh dẹp, mission công thành |
| Đỗ Động Giang | Đỗ Cảnh Thạc | M21 | Đánh dẹp trong cốt truyện; không khẳng định thứ tự trận đánh là sử thực |

Các tên/nhóm/trạng thái hiện hành phải đọc lại ở `factions.ts`, `storyNodes.ts`, `warlord-matrix.md` trước khi implement. Nếu danh mục mission thay đổi sau freeze, data mới trong repo là nguồn sự thật.

## D. Hành vi từng lần click

### D1. Mở Campaign lần đầu
- Màn tổng quan chứa **6 chapter tabs bên trái + World Atlas giữa + contextual panel phải**.
- Chapter active suy từ `campaignFocusChapter` (nếu còn), mission unlock/complete suy từ profile server. Không phát thưởng/move mission khi chỉ click map/chapter.
- Nút `Xem toàn cảnh` về zoom 1; `+`/`−` giữ cơ chế keyboard và pointer hiện có.

### D2. Click Chương II
- Chương II highlight; world map vẫn hiển thị tất cả địa bàn; focus camera tới Bố Hải, vùng liên quan nổi bật và vùng ngoài bị giảm sáng nhẹ.
- Right panel chuyển sang thông tin Chương II, các nhiệm vụ M05–M08 từ data hiện hữu.
- Không tự mở M05 và không tự hoàn thành mission khi click chương.

### D3. Click Bố Hải Khẩu
- Vị trí/cờ Bố Hải có viền vàng; right panel hiển thị **Trần Lãm**, thông tin lịch sử và mission liên quan đúng chapter/region.
- Nếu M06 đang mở: CTA `Xem hội kiến` → flow Visual Novel M06 hiện có; nếu M06 đã xong: CTA `Xem lại`; nếu locked: thông tin khóa, không gọi API.
- Right panel có tab `Nhiệm vụ`, `Thế lực`, `Sử liệu` nếu cần, nhưng chỉ bổ sung UI wrapper không viết lại lịch sử.

### D4. Click Tam Đái
- Right panel hiển thị Nguyễn Khoan, **M14 là chuẩn bị/tổng thuật sự tan rã**, không mô tả nhiệm vụ "công phá Tam Đái" như ảnh AI.
- Banner/status do `campaignWorldLedger` cung cấp; user chưa hoàn thành M14 không được thấy kết cục như đã nhận từ server (giữ giới hạn spoiler).

### D5. Click Bình Kiều
- Trong khu `Địa điểm chưa định vị chính xác` / danh mục bên cạnh map (hoặc nút icon dấu ?), mở chi tiết Ngô Xương Xí / M12; **không gán tọa độ tưởng tượng**.

### D6. Click mission trong panel
- `MissionDetail` hiện có trong `ChapterOne.tsx` mở đúng node; `DialoguePlayer` và `DiplomacyScene` giữ nguyên.
- Battle vẫn server-authoritative qua `createOnline`/settlement; không thưởng client và không tạo route mới.
- Quay lại Atlas trả về cùng chương + cứ điểm đã chọn (chỉ client UI state).

## E. Phân lớp artwork và UI code

**Không dùng nguyên tấm screenshot AI có chữ/cờ/nhiệm vụ làm giao diện production.** Nó gây chữ giả, sai lịch sử, zoom bị nhoè và không thể phản ánh trạng thái động.

- `world-map-art.webp`: tranh địa hình, cây, sông, làng, thành, không chứa chữ địa danh, cờ nhân vật, marker/nhiệm vụ hay status. Đây là **một map toàn cảnh** được ưu tiên trước ảnh riêng sáu chương.
- `atlas-frame.webp` (tùy chọn): khung đồng cổ, viền; panel trái/phải dựng CSS/HTML có thể co giãn.
- Lớp SVG/code: vùng bấm cứ điểm + Hoa Lư; tên đất + sứ quân + badge + trạng thái faction; zoom/pan/keyboard. Vùng kiểm soát lấy world ledger, không tô bừa đường biên cổ.
- Lớp HTML: chapter sidebar, mission/faction panel, chữ, icon, CTA, labels từ dữ liệu.
- Không dùng `bg/atlas.webp` như bản đồ đã duyệt nếu chưa review đúng bản đồ 13 điểm. File ấy là asset tồn tại trong repo nhưng chỉ là một ảnh nền chưa được xác minh nội dung ở đây.
- Cần một hệ tọa độ duy nhất: chuyển vị trí `mapLayout.ts` sang normalized SVG/world-space và neo ảnh vào cùng viewBox. Nếu asset bị vẽ lệch điểm, sửa/crop ảnh hoặc layout minh họa, **không đổi historical-region assumptions**.
- `MAP_LAYOUT.unplaced` vẫn được hiển thị tách biệt.

## F. Typography cố định theo hình (không trích xuất font từ ảnh)

Chữ trong ảnh AI là hình raster, **không thể xem đó là file font**. Dùng kiểu **serif cổ điển hỗ trợ dấu tiếng Việt**, đề xuất:
- Title / chapter / stronghold: `Noto Serif` weight 700–900, uppercase vừa phải, chữ mực sẫm trên giấy.
- Nội dung panel: `Noto Serif` regular 400–500, line-height 1.55–1.7, tối thiểu 15–16px.
- Dữ liệu số, status nhỏ hoặc battle interface khác: giữ font UI hiện hữu nếu cần để dễ đọc.
- Có thể dùng `next/font/google` Noto Serif hoặc nguồn font có giấy phép phù hợp; fallback `Georgia, serif`. Kiểm hỗ trợ đầy đủ ă â đ ê ô ơ ư, dấu sắc/huyền/hỏi/ngã/nặng.
- **Chỉ áp dụng trong container `.campaign-atlas`**, không thay font combat/shop/overlay toàn game trong vòng này. Nếu muốn thống nhất cả game, tách task typography toàn cục và kiểm regression riêng.
- Không sao chép/cấp lại file font chưa có quyền, không dùng text được vẽ sẵn trong ảnh để thay chữ thật.

## G. Layout breakpoints và accessibility

- >=1280px: 3 cột như concept, world map chiếm vùng trung tâm lớn nhất; panel phải cuộn riêng, map vẫn cố định.
- 768–1279px: trái thu gọn chapter rail, map và right-panel chuyển thành drawer khi cần.
- <=767px: chapter chips + map full-width + bottom sheet chi tiết; vẫn có nút `Danh sách cứ điểm` để chọn không cần chạm cờ nhỏ.
- Touch targets ít nhất 44px; hotspot có keyboard-focus/aria-label; `prefers-reduced-motion`; focus return sau đóng panel; tooltip không chỉ xuất hiện khi hover.
- Theme có độ tương phản cao, chữ không đặt trực tiếp trên tranh núi/sông.

## H. Thứ tự triển khai cập nhật

1. **MAP-FREEZE** (docs/QA): duyệt bản thiết kế này, khóa semantic sự khác nhau giữa cứ điểm và mission; snapshot trạng thái develop.
2. **MAP-ART-00** (Shan): tạo 1 tranh map nền toàn cảnh KHÔNG chữ/cờ/status, review đối chiếu `mapLayout.ts`; khung atlas optional. Nếu asset chưa có, Claude vẫn dựng UI với SVG fallback.
3. **MAP-01** (Claude): layout desktop/mobile 3 vùng + chapter rail + font; map hiện tại là fallback.
4. **MAP-02** (Claude): toàn cảnh 12 cứ điểm + Hoa Lư và panel thông tin vùng, liên kết missions; Bình Kiều unplaced; trạng thái thế cục server.
5. **MAP-03** (Claude): nối chọn chapter, chọn cứ điểm, chọn mission, Visual Novel/Battle, back/replay, restore selection.
6. **MAP-ART-02** (Claude): ghép `world-map-art.webp` vào đúng SVG coordinate space, lazy image, no-asset fallback.
7. **UI-05/QA-01**: kiểm desktop/tablet/mobile, lịch sử, gameplay/raid regression, CI.

**Không còn yêu cầu tạo ngay 6 bản đồ riêng trong đợt đầu; bản đồ toàn cảnh là ưu tiên số 1.** Sáu tranh chi tiết từng chương là lựa chọn hậu kỳ, không là phụ thuộc bắt buộc của MAP-01..03.

## I. Acceptance không được bỏ qua

- [ ] Thấy **một bản đồ toàn cảnh** với Hoa Lư + các cứ điểm 12 sứ quân; Bình Kiều ở nhóm vị trí tranh luận.
- [ ] Chọn 1 trong 6 chương: map không biến mất, chỉ focus/highlight đúng miền nhiệm vụ.
- [ ] Click cứ điểm → panel chi tiết; click mission → mission hiện có; back trả lại đúng state.
- [ ] Status liên minh/quy phục/đánh dẹp/tan rã đúng **server profile**, không theo màu trong tranh tĩnh.
- [ ] Chữ Việt serif đọc đúng dấu; không crop, overflow hoặc font lỗi trên mobile.
- [ ] Không thêm mốc Đinh–Tiền Lê–Lý sai niên đại, không bịa trận đánh Tam Đái hoặc đánh Trần Lãm.
- [ ] Không đổi `STORY_NODES`, `CAMPAIGN_FACTION_RESOLUTIONS`, rewards, battle, raid, progression, Song Tháp.
- [ ] Ảnh hỏng/không tồn tại vẫn chơi bình thường với SVG/CSS fallback.
- [ ] Audio/SFX/BGM/Voice vẫn **TODO — DEFERRED**.
