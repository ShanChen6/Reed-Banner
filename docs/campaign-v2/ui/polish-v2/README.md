# Reed Banner — Campaign Atlas UI Polish V2

**Kiểm tra code:** `develop` commit `5926ad1eed1c` (26/10/2026, UTC+7). PR #158–#161 đã merge. Phạm vi này **chỉ polish giao diện**, không xây lại MAP-00–MAP-03.

**Tiến độ (26/10/2026):** P00–P10 xong, PR #163–#171 đã merge `develop`. Kết quả nghiệm thu và lệnh đã chạy ở [`QA-P10.md`](QA-P10.md).

## Mục tiêu
Đưa màn Sử Ký Đại Việt hiện tại sát mockup được duyệt: toàn bộ gameplay trong một đại card; khung đồng cổ mảnh với hoa văn góc; 6 thẻ chương bằng chiều cao với màu đỏ khi active; map và nhãn đồng màu; cờ có cá tính từng thế lực; header có avatar và IGN thật; tab cùng chiều cao; panel phải có **card phần thưởng đúng contract server**; responsive, accessibility và QA.

## Hiện trạng đã xác nhận
- `AtlasShell.tsx`: `ChapterRail`, `ChapterPanel`, `StrongholdPanel`, `AtlasHeader`; các card/chương hiện dùng border và phần tử trực tiếp.
- `WorldMap.tsx`, `worldAtlas.ts`, `useMapView.ts`: 13 địa bàn (Hoa Lư + 12 sứ quân), 1536×1024, SVG flag/label, ảnh `public/art/campaign/world-map.webp`, zoom/pan; Bình Kiều chưa có vị trí chính xác.
- `ChapterOne.tsx`: màn Campaign, điều hướng atlas/mission/codex, `RewardModal`, profile từ `CampaignScreen.tsx`.
- `src/app/globals.css`: theme `.campaign-atlas`; `atlasFont.ts` dùng Noto Serif hỗ trợ tiếng Việt.
- `public/art/campaign/rail-ink.webp`, thumbnail chương và ảnh nền đã có.
- `storyNodes.ts` chỉ khai báo `rewards.firstClearGold` tại mission; `rewards.ts` có `CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD = 250`, mở khóa tướng theo receipt. **Không bịa EXP/ngọc/trang bị/vật phẩm hoặc biểu tượng thưởng nếu không có contract.**
- `CampaignScreen.tsx` tải profile; phải audit luồng session/account để lấy avatar/IGN đúng thực tế, không dùng ví dụ trong ảnh làm dữ liệu thật.

## Thứ tự triển khai, không chạy tất cả cùng lúc

| Bước | ID | Tên | Cần hoàn thành trước | Gate nghiệm thu |
|---|---|---|---|---|
| 0 | P00 | Audit và baseline | — | Mapping mockup → code, screenshot desktop/mobile, account+reward contracts |
| 1 | P01 | Tokens + frame/ornament reusable | P00 | Palette, border, corner motifs SVG dùng lại |
| 2 | P02 | Đại card, grid/chiều cao | P01 | 1 wrapper, 3 panel cùng chiều cao, bottom route nằm trong |
| 3 | P03 | Header / IGN / avatar / tabs | P02 | user thực hoặc fallback có căn cứ, không login dư, tabs bằng nhau |
| 4 | P04 | Thẻ chương + hoa văn 4 góc | P01,P02 | 6 thẻ đều nhau; active đỏ; thumbnails đúng |
| 5 | P05 | Map label, map-frame palette, ẩn Mxx | P01 | nhãn đồng màu; SVG zoom/pan; mission codes không lọt trên map |
| 6 | P06 | Cờ 12 sứ quân + Hoa Lư | P05 | glyph riêng theo faction ID, state/status vẫn đúng server |
| 7 | P07 | Panel phải + card phần thưởng | P01,P03 | reward lấy từ node/server, replay/first-clear rõ ràng |
| 8 | P08 | Bottom route và hành vi | P02,P07 | 2 nhánh song song, không thêm reward hoặc route giả |
| 9 | P09 | Responsive + accessibility | P03–P08 | 390/768/1440, keyboard, reduced motion |
| 10 | P10 | QA / docs / regressions | P09 | lint, typecheck, targeted tests, build (nếu khả thi) |

**Cách giao Claude:** mở mỗi file `prompts/Pxx.md`, dán toàn bộ; review diff + screenshot + gate trước khi chuyển task. Giữ commit theo mỗi task hoặc PR nhóm nhỏ **nếu được bạn yêu cầu**, Claude không tự push/merge/deploy.

## Chi tiết UX bắt buộc

**Desktop >=1280:** outer shell chứa top internal atlas header, 6-chapter rail, world map và contextual panel, cùng bottom route, border <=1–2px; grid `minmax(220px, 0.23fr) minmax(0,1fr) minmax(280px,0.28fr)` theo container thực tế. Không fix 100vh làm cắt footer; trong cùng row 3 panel phải stretch chiều cao; scroll riêng bên trong rail và panel khi cần. Header game toàn cục ở ngoài nếu đang có, tránh lồng hai navigation giống nhau.

**Cards:** CSS/SVG reusable ornament bốn góc, chỉ là decoration `pointer-events:none` và `aria-hidden`, vàng đồng sẫm độ tương phản nhẹ. Card chương thống nhất chiều cao/min-height hợp typography; active nền đỏ son/đỏ nâu, hover không đổi kích thước. Thiết kế tokens `--atlas-*` scoped `.campaign-atlas`, tránh ảnh hưởng board/combat.

**Map:** nền nhãn giấy dó cùng panel, chữ nâu mực; selected viền vàng nổi vừa phải; không ghi `M01..M24` trực tiếp trên map, giữ aria-label hữu ích; vẫn phân biệt Hoa Lư là HQ, Bình Kiều unplaced. `WorldMap.tsx` sử dụng SVG overlays trên ảnh 1536×1024 cùng viewBox. Ban đầu cờ theo strongholdIdentity (emblem/shape) tách `strongholdState` (tình trạng đã giải quyết) — **không gán phe lịch sử bằng màu random hoặc emoji**.

**Header:** nav Bản đồ/Nhiệm vụ/Sử ký/Binh lực đồng chiều cao; avatar/IGN từ session/account hiện có; nếu game có guest mode, dùng nhãn khách/fallback đúng, không giả định đăng nhập tuyệt đối. Chỉ ẩn nút Đăng nhập khi session đã authenticated. Nút profile/logout đúng route có sẵn, không tạo auth mới.

**Rewards:** khi chọn một mission trong panel mới hiển thị `storyNodeById(id)?.rewards.firstClearGold` (đúng thứ tự đơn vị vàng), chapter completion bonus `250` chỉ nếu điều kiện áp dụng và được receipt server chấp nhận; `unlockedContent` hiển thị tướng nếu là companion, không claim người chơi chắc chắn nhận trong mission cụ thể nếu chưa đủ điều kiện. Replay hiển thị 'Đã nhận ở lần đầu' (nếu receipt) và nút 'Xem lại', không cấp lại. Không có reward selection thì hiện placeholder có ý nghĩa, không lấy dummy from concept.

## Asset do Shan tạo?
**Không bắt buộc trong vòng này.** Sẵn có: world-map.webp, rail-ink.webp, thumbs, các backgrounds. Claude dùng CSS/inline SVG cho corner ornament, frame và emblem. Chỉ yêu cầu khi CSS/SVG không đạt kết quả mỹ thuật:
- `public/art/campaign/ui/corner-ornament.svg` — trong suốt, viewBox 96×96, một góc, dùng CSS rotate/mirror, không chữ.
- `public/art/campaign/ui/header-wood.webp` — nền gỗ không chữ, 2048×256 hoặc tỷ lệ linh hoạt, tile/cover.
- `public/art/campaign/ui/stronghold-emblems/*.svg` — emblem từng faction, file trong suốt 128×128, nếu SVG code không đủ. Quyền sử dụng rõ ràng.
Cần báo cáo asset `NOT_REQUIRED` hoặc `NEEDS_ASSET`, không tự bịa.

## Không được thay đổi
- 24 nhiệm vụ M01–M24, 6 chương, unlock graph, CampaignFaction outcomes, source notes.
- Battle engine, AI, balances, server settlement, loot, reward receipts, Boss Raid, Trial/Destiny, Survival, Arena.
- Audio/BGM/SFX/Voice/TTS: **TODO — DEFERRED**.

## Tiêu chí QA
- Desktop: đại card bao trọn, 3 panel đồng chiều cao, sidebar thẻ bằng nhau, selected đỏ, 4 góc rõ mà không rối, nav đồng bộ.
- World map đủ 13 strongholds, chọn chapter không đổi ảnh nền; cờ nhận diện riêng, state đúng profile server; Bình Kiều ở 'unplaced'.
- Panel: state Tam Đái/M14 phù hợp lịch sử, Bố Hải/M06 liên minh, chapter IV/V song song, VI sau cả M16/M20.
- Mission preview: gold chính xác, chapter bonus có điều kiện, recruit theo contract, replay không trả thưởng.
- Header: authenticated session hiển thị avatar/IGN; guest UX không sai.
- Mobile: 390px không overflow, panel thành sheet/tabs, touch >=44px; keyboard, focus, contrast, prefers-reduced-motion.
- Tên địa danh có dấu chuẩn, font `Noto Serif`; không dùng text AI từ art; avatar/account không hardcode.
- Chạy `pnpm lint`, `pnpm typecheck`, targeted `pnpm test`, `pnpm build` **tùy môi trường DB/CI**, báo PASS chỉ với lệnh đã thực sự chạy.