# Reed Banner — Game Mode UI/UX Design System v1

> 27/10/2026 · **DESIGN SPEC / NOT IMPLEMENTED** · Áp dụng Home và các chế độ ngoài Campaign; Campaign là visual baseline, **không sửa**.
>
> Nguồn kiểm tra: `src/app/game/MenuScene.tsx`, `GameShell.tsx`, `trial/TrialView.tsx`, `destiny/DestinyScreen.tsx`, `survival/SurvivalScreen.tsx`, `daily/DailyScreen.tsx`, `arena/ArenaScreen.tsx`, `docs/design/09-che-do-choi.md`, `docs/game-modes/01-mode-portfolio.md`, `docs/game-modes/06-towers-survival-future.md`; ảnh chụp UI do chủ dự án cung cấp 27/10. Cơ chế thực tế luôn ưu tiên code/server contract hơn hình mockup.

## 1. Product decisions và ranh giới

- Không thiết kế lại Global Game Header hiện hành (breadcrumb/back, banner trung tâm, Hồ sơ, Trận thường, tài khoản); dùng `GameShell` và hệ scene/navigation sẵn có. Không lặp header trong màn.
- Giữ hình ảnh **gỗ tối / đồng cổ / giấy dó / vàng kim / đỏ son**, hoa văn Đông Sơn Việt Nam; không đưa mỹ thuật Á Đông chung chung (cung điện Trung Hoa, torii, giáp samurai) vào key art.
- Campaign hiện có Sử Ký, atlas ba cột và chi tiết nhiệm vụ: **reference về độ hoàn thiện và chất liệu**, không áp 3 cột máy móc lên mọi mode.
- `TRIAL`, `DESTINY` chỉ hiện click được khi server feature flag cho phép; không giả tạo trạng thái tiến độ hoặc phần thưởng ở client.
- Trial **20 tầng live** (có thể mở rộng sau này, không vẽ floor 21 click được); Destiny **10 tầng/chu kỳ 7 ngày live** (20 tầng là đề xuất, không ghi là đã có).
- Survival vẫn tên hiển thị **Sinh tồn** cho đến khi duyệt rename Thủ Thành; concept hình doanh trại/cổng thành không hàm ý HP thành.
- Daily: một đề cố định/ngày, một lượt/người, đội cho sẵn, không trang bị. Arena: PvP **bất đồng bộ** chống đội phòng thủ snapshot do AI điều khiển, không matchmaking real-time.
- Đánh trùm là phần của Campaign, không thiết kế lại. Normal/Practice thuộc luồng trận chiến chung; chỉ cân chỉnh entry/navigation, không đổi luật.
- Binh Pháp và Liệt Truyện là **concept docs-only**, không thêm nút khả dụng khi chưa có route/engine; Viễn Chinh deferred.

## 2. Khung thống nhất

### 2.1 Design tokens dự kiến, cần đối chiếu CSS hiện hành trước khi code

| Token đề xuất | Giá trị tham chiếu | Mục đích |
|---|---|---|
| `--game-ink` | `#1B1411` | nền game tối |
| `--game-wood` | `#35231B` | nền panel tối |
| `--game-bronze` | `#9F7139` | viền đồng |
| `--game-gold` | `#E4B967` | CTA, điểm nhấn |
| `--game-parchment` | `#EED5A4` | nền panel đọc dài |
| `--game-text-dark` | `#3B291B` | chữ trên giấy dó |
| `--game-cinnabar` | `#9A3228` | hành động quan trọng/đối thủ |
| `--game-success` | `#16765F` | đã hoàn thành |
| `--game-disabled` | `#73665A` | chưa mở/không hợp lệ |

Các mã màu trên là **proposal**, không tuyên bố đã khớp token source. Giữ nguyên biến production cho đến lúc migration có screenshot diff.

### 2.2 Typography và layout

- Sử dụng font hiện hành của game, lập mapping `display / title / heading / body / caption / numeric`; **không import font tùy tiện**.
- Kích cỡ gợi ý desktop: display 32–40, page title 26–30, section 18–22, body 14–16, caption 12–13 px; hạn chế chữ quan trọng dưới 14 px.
- Content max width desktop: 1440–1520px cho screen giàu hình; 1180–1320px cho screen thiên thông tin; gutter desktop 20–28px; 16px trên mobile.
- Khung cấp A: 1 khung lớn ornate/page; cấp B: panel gỗ/giấy có viền đồng; cấp C: item/card chỉ 1px. Không lồng 3 khung ornate.
- Mặt thông tin giấy dó cho đọc luật/phần thưởng; mặt gỗ tối cho chọn đội, tương tác và HUD; tránh text vàng trên nền vàng.
- Nền theo mode là artwork thấp tương phản nằm **sau** panel, không thay background bằng phông tối trơn hoặc ảnh tranh che nội dung.
- Tất cả button: primary đỏ son hoặc vàng kim theo semantic; secondary gỗ viền đồng; ghost; destructive; disabled; pending. Min target 44×44 px.

### 2.3 Responsive

| Viewport | Hành vi |
|---|---|
| >=1440 | content rộng; panels cạnh nhau; header giữ nguyên |
| 1024–1439 | rút gọn side panel, ưu tiên vùng hành động |
| 768–1023 | chuyển vùng phụ thành tab/accordion, sticky action bar |
| <768 | một cột, title ngắn, grid tầng co giãn, CTA cuối trang có safe area; danh sách tướng scroll thay vì bóp card |

Không đặt kích thước battle board bằng CSS cố định gây tràn. Scroll riêng ở panel dài phải có affordance, không lồng nhiều vùng scroll khó dùng.

## 3. Inventory & information architecture

| Scene / route | Mục tiêu hành động | Trọng tâm riêng | Ưu tiên |
|---|---|---|---|
| MENU `/game` | chọn mode hoặc tiếp tục trận | cổng vào game, mode cards | P0 |
| TRIAL `/game/trial` | xem tầng/luật, chọn đội hợp lệ, đánh/quét | lộ trình tầng và luật puzzle | P0 |
| DESTINY `/game/destiny` | lập roster rồi giữ tài nguyên xuyên tầng | chu kỳ, trạng thái run, lựa chọn Phúc | P0 |
| SURVIVAL `/game/survival` | chuẩn bị 3 active, tối đa 2 dự bị | đợt liên tiếp và nghỉ thay quân | P1 |
| DAILY `/game/daily` | xem đề, đánh một lần và điểm | đối chiếu đội cố định và BXH | P1 |
| ARENA `/game/arena` | xem rating, snapshot phòng thủ, chọn đối thủ | đối thủ/rank/lượt còn lại | P1 |
| NORMAL/PRACTICE | trận/preview | bộ chọn chế độ trận hiện hữu | P2 |
| Campaign | ngoài phạm vi | baseline tham chiếu | NO-CHANGE |

## 4. Đặc tả màn Home — 'Cổng Đại Việt'

**Khắc phục:** ảnh hiện tại logo giữa, CTA Vào trận và 6 thẻ văn bản chiếm rất ít không gian; thiếu hierarchy và visual thumbnail riêng.

### Desktop wireframe
```text
[GLOBAL HEADER — GIỮ NGUYÊN]
╔══════════════════════════════════════════════════════════════════╗
║ HERO: tranh Hoa Lư + logo Cờ Lau   │  Tiếp tục trận dở (nếu có) ║
║ tagline ngắn                   │  [VÀO TRẬN] / [TRẬN THƯỜNG]  ║
╠══════════════════════════════════════════════════════════════════╣
║ CHẾ ĐỘ CHƠI                                                    ║
║ [Chiến dịch artwork/tiến độ]   [Song Tháp: Trial + Destiny]     ║
║ [Sinh tồn] [Thử thách ngày] [Đấu trường]                        ║
╠══════════════════════════════════════════════════════════════════╣
║ TIỆN ÍCH: Hồ sơ/trang bị · Nhiệm vụ · Xếp hạng · Offline        ║
╚══════════════════════════════════════════════════════════════════╝
```
- Mode cards có thumbnail phong cách mini atlas hoặc tranh lụa, tên, **một câu luật**, **một chỉ số có thật nếu API trả**, trạng thái available/locked, action nhất quán.
- Card Campaign trội thị giác nhưng không tạo màn Campaign mới. Trial và Destiny cùng nhóm 'Song Tháp' **nhưng có thẻ riêng** (feature flags riêng).
- `Vào trận` chỉ đến normal battle setup như hiện tại; `Tiếp tục trận dở` chỉ hiện khi có khả năng resume và phải xử lý lưu local stale; không hiển thị 'tiếp tục' cho mọi mode.
- Không tạo số đá, tiền thưởng hay progress giả từ mockup. Mode chưa release không xuất hiện như nút chơi.

## 5. Tháp Thí Luyện — 'Thư viện thử thách'

**Chế độ:** 3v3, 20 tầng live, Đinh Bộ Lĩnh bắt buộc; đổi nghề/hệ trước tầng, chọn 2 companion hợp luật; full HP/lương mới mỗi lần. Thưởng first-clear và quét ngày do server chốt.

```text
[HEADER]
[BANNER tháp đá / tiêu đề / Đá Cường Hóa server / mốc quét]
╔════ DANH SÁCH TẦNG ════╦════════════ HỒ SƠ TẦNG ══════════════╗
║ 1✓ 2● 3🔒 ...          ║  Tầng 2 • Im Tiếng Pháp Sư         ║
║ nhóm tầng 1–10 / 11–20 ║  mục tiêu · cấm nghề · giới hạn    ║
║ đã qua / mở / khóa     ║  2 đồng đội hợp lệ · leader build ║
║ jump đến tầng hiện tại ║  đối thủ · first-clear · [THỬ]    ║
╚═════════════════════════╩══════════════════════════════════════╝
[THANH QUÉT NGÀY: mốc đã mở | đá được nhận | đã quét? | lịch sử]
```
- Thay 20 ô nhỏ tối đơn điệu bằng 'milestone tiles' theo nhóm 5/10 tầng; mô hình vẫn do `overview.floors` cấp, không hardcode count UI khi về sau mở rộng.
- Phần luật là key visual của màn; cấm nghề/hệ được hiển thị icon + text, không chỉ màu. Invalid fighter ghi **lý do** tại card.
- Đưa sweep thành strip/tile phụ có thời gian reset theo VN, không chiếm ngay vị trí đầu màn; disabled nếu server chưa cho phép; không tự cộng đá.
- Screen states: loading, feature disabled, no owned companions, floor locked, cleared, current, in-progress resume, sweep eligible, already claimed, network/error.
- Keyboard grid giữ semantics/arrow navigation của `TrialView`.

## 6. Tháp Vận Mệnh — 'Hành trình theo chu kỳ'

**Chế độ:** roster có thể gồm tất cả tướng sở hữu, khóa khi bắt đầu run; 3 active vào trận; HP/lương/năng lượng mang qua tầng; cycle 7 ngày; Phúc hoặc phục hồi nhận qua lựa chọn reward. Hiện 10 tầng.

```text
[HEADER]
[BANNER trăng/đỉnh tháp: chu kỳ / thời gian reset / tầng x/10]
[PROGRESS JOURNEY: 1—2—3—...—10  và chặng thưởng]
╔════ ROSTER + TRẠNG THÁI ═╦═════ THỬ THÁCH HIỆN TẠI ═════════╗
║ portrait HP / energy      ║ luật tầng + kẻ địch + mục tiêu ║
║ active 3 / toàn roster    ║ năng lượng/lương mang sang      ║
║ lock / downed / alive     ║ Phúc đang có, nút vào trận      ║
╚═══════════════════════════╩══════════════════════════════════╝
[REWARD OFFER: 3 lựa chọn rõ ràng khi run.phase = reward]
```
- Layout **theo state machine**: PREPARE_ROSTER → FLOOR_PREP → BATTLE/RESUME → REWARD_CHOICE → NEXT/COMPLETE; chỉ render action hợp lệ trong phase.
- 'Khóa roster' có confirm modal liệt kê hậu quả, vì đây là quyết định khó đảo ngược trong chu kỳ.
- Reward cards dùng icon nhóm (cứu viện, quân y, Phúc) kèm hiệu ứng cụ thể lấy catalog; không đồng nhất 'Đá Cường Hóa' với reward sau mỗi tầng.
- Nếu hết cycle hoặc run không còn hợp lệ: trạng thái kết thúc cùng hướng dẫn, không hiển thị đánh khi server không cho.
- Không gọi mode endless hay nâng lên 20 trước khi server trả cấu hình/version tương ứng.

## 7. Sinh tồn — 'Doanh trại giữ trận'

**Chế độ:** liên tiếp các wave trên cùng bàn cờ; 3 active gồm Đinh Bộ Lĩnh + 2 đồng đội; tới 2 dự bị; chỉ swap tại BREAK, có recovery, lương, hồi sinh; kỷ lục là wave đã vượt.

```text
[HEADER]
[BANNER thành lũy Hoa Lư / kỷ lục wave / chú giải 'đợt != lượt']
╔════════ ĐỘI RA TRẬN ═══════╦══════ DOANH TRẠI ═════════════╗
║ [Đinh Bộ Lĩnh • khóa slot] ║ [Dự bị 1] [Dự bị 2]         ║
║ [Active 2] [Active 3]      ║ ghi chú hồi, thay ở BREAK      ║
║ ràng buộc roster            ║ preview đợt đầu (ước tính)    ║
╚═════════════════════════════╩═══════════════════════════════╝
[QUY TẮC GỌN: +25 lương BREAK | hồi / hồi sinh | trùm mỗi 5 đợt]
[CTA BẮT ĐẦU / TIẾP TỤC]
```
- Break state trong trận cần thiết kế như **doanh trại giữa đợt**, gồm HP từng tướng, phần hồi server đã cấp, đội dự bị và rotate, build Đinh Bộ Lĩnh, chi phí hồi sinh 40 lương nếu hợp lệ, nút Đợt tiếp.
- Không bao giờ cho swap giữa wave; không có HP thành. Ảnh 'thủ thành' chỉ mang tính hình tượng.
- Nêu giới hạn một lần hồi sinh trong mỗi break, auto revive ưu tiên, dự bị không tự vào active; giải thích lý do disable nút.
- Kỷ lục/wave reward từ server, không vẽ số tự cộng.

## 8. Thử thách ngày — 'Chiếu thư hôm nay'

**Chế độ:** đề được sinh chung, đội cố định, không trang bị, mỗi người một lần/ngày, xếp hạng theo kết quả/thời gian lượt và HP còn lại.

```text
[BANNER giấy chiếu: ngày Việt Nam, thời điểm đổi đề, trạng thái lượt]
╔════════════ CHIẾU THỬ THÁCH ══════════╦══ BẢNG THÀNH TÍCH ═══╗
║ mô tả map/luật/độ khó (không đổi)       ║ Hạng của tôi          ║
║ PHE TA: 3 portrait  VS  PHE ĐỊCH: 3   ║ Top x, kết quả        ║
║ tiêu chí xếp hạng / thưởng               ║ empty state hôm nay   ║
║ [ĐÁNH MỘT LẦN] hoặc [TIẾP TỤC]/[ĐÃ XONG]║                      ║
╚═════════════════════════════════════════╩══════════════════════╝
```
- CTA đổi theo trạng thái server, đã dùng lượt không phát lại; hiển thị 'thắng/ thua/ số lượt/ % HP/ hạng' khi đã có kết quả.
- Không dùng bộ chọn tướng hoặc trang bị vì đội fixed. Empty ranking phải có minh họa nhỏ, không để panel trống lớn.

## 9. Đấu trường — 'Đài tỷ võ bóng ma'

**Chế độ:** đối thủ là **snapshot đội của người khác, do AI điều khiển**, điểm lên/xuống; snapshot thủ nhà riêng và 3 offers.

```text
[BANNER võ đài: Rating · Hạng · Lượt còn / ngày · W/L]
╔════════ ĐỘI PHÒNG THỦ ════╦════════ CHỌN ĐỐI THỦ ═════════════╗
║ đội snapshot 3 portrait   ║ card 1       card 2       card 3 ║
║ lực chiến + timestamp*    ║ rating/power + 3 portrait        ║
║ [CẬP NHẬT ĐỘI PHÒNG THỦ]  ║ [ĐÁNH] từng offer                ║
╚═══════════════════════════╩═══════════════════════════════════╝
[XẾP HẠNG / LỊCH SỬ nếu API có dữ liệu]
```
* Chỉ hiển thị timestamp nếu thực sự có trong API. Không bịa tỷ lệ thắng hay sức mạnh thực tế.
- Warning 'đổi đội ở Hồ sơ **không** tự cập nhật snapshot' cạnh nút cập nhật.
- Refresh opponent phải phân biệt refresh với đấu; disabled pending; nếu đối thủ không còn hợp lệ phải cập nhật offers từ server.
- Tránh chữ 'real-time PvP', 'người chơi đang online', hoặc đối thủ đang điều khiển thật.

## 10. Shared component contracts (proposal)

| Component | Data/props tối thiểu | Dùng ở |
|---|---|---|
| `GameModePage` | title, subtitle, theme, status, children | all |
| `ModeHeroBanner` | artwork, title, kicker, metadata | Home + modes |
| `OrnateFrame` | prominence A/B/C, surface dark/parchment | all |
| `ModeCard` | scene, art, description, featureEnabled, status | Home |
| `ProgressTrack` | total/from server, current, completed | Trial/Destiny |
| `FighterMiniCard` | portrait, class, element, HP, state, whyDisabled | Trial/Destiny/Survival/Daily/Arena |
| `RuleBadge` | icon + text + tone, accessible label | Trial/Destiny/Daily |
| `GameAction` | intent, loading, disabledReason | all |
| `GameEmptyState` | context, text, optional recovery action | all |

Component chỉ **trình bày dữ liệu server**, không nhập business rules hay gọi mutate ngầm. Dùng `Portrait`, `ElementIcon`, `ProfessionIcon`, `Card`, `Button`, `SceneLink` đã có. Đừng tạo phiên bản thứ hai của `GameShell`.

## 11. Art direction & assets

- Home: Hoa Lư panoramic art 16:9, logo nguyên bản, các scene thumbnail 4:3; ưu tiên ảnh sẵn có và tạo mới khi inventory xác nhận thiếu.
- Trial: tháp đá, trời ban ngày / giấy dó minh họa luật; icon 3 trạng thái tầng; tuyệt đối không text bake vào art.
- Destiny: tháp dưới trăng, sao/đường hành trình, biểu tượng Phúc, tông đồng tím/xanh **phụ** chỉ 10–15% diện tích, giữ nền gỗ vàng.
- Survival: cửa thành, doanh trại, gác canh, cờ son; tránh depiction về HP thành vì gameplay không có.
- Daily: sắc phong/chiếu thư, dấu triện; mỗi ngày giữ cấu trúc, không bắt buộc art mới.
- Arena: sân tỷ võ gỗ, trống đồng, cờ thi đấu, badge rank; không ảnh đấu sĩ Tây Âu.
- Asset đề nghị: hero 2560×720 (có center safe area), thumbnail 800×600, decorative overlay SVG/PNG tách nền, WebP/AVIF cho scene; chú trọng tổng payload/LCP và ảnh mobile.

## 12. Acceptance & QA

- Visual baseline: screenshot Campaign ở desktop là chuẩn về họa tiết, viền, font, CTA; mode screens giữ cùng family nhưng không dùng chung cấu trúc 3 cột.
- Không regression scene links, back/breadcrumb, account header, server action, pending state, keyboard/focus.
- Có skeleton theo layout, lỗi API với retry, không có dữ liệu, hết lượt, đã nhận thưởng, bị khóa, run đang diễn ra và resume.
- Text UI đúng ngôn ngữ Việt; contrast >=4.5:1 nội dung thường và >=3:1 thành phần lớn; không dùng màu duy nhất để phân biệt locked/cleared.
- Screenshot test ở 1920×1080, 1440×900, 1024×768, 390×844; không horizontal overflow; tab/focus visible và hỗ trợ reduced-motion.
- Verify từ API các quyết định ảnh hưởng reward, roster, thời gian, cooldown; UI không tính thưởng, ngày reset hoặc hợp thức hóa lineup độc lập server.

## 13. Non-goals

Không đụng Campaign, battle engine, mode balance, rewards, routing contracts, DB, feature flag defaults; không bật mode mới, không thêm microtransaction, không đổi Sinh tồn thành mode có máu thành. Tài liệu này là spec để review và implement riêng sau.

## 14. Home V2 — Visual direction đã chọn (27/10/2026)

> **APPROVED DESIGN DIRECTION — DOCS ONLY.** Bổ sung và làm rõ mục 4, không thay thế các ràng buộc gameplay/server. Đây là wireframe tham chiếu, **chưa phải UI đã triển khai** hay bộ asset được duyệt.

### 14.1 Quyết định so sánh phương án

- Home hiện tại (logo giữa + `Vào Trận` + 6 thẻ chữ) chưa có sức hút thị giác; vẫn giữ các đường điều hướng hợp lệ của nó.
- Phương án wireframe mới (hero trái, hình Hoa Lư phải, lưới sáu ô giấy dó) cải thiện hierarchy nhưng **chưa đạt chất lượng mỹ thuật tương đương Campaign**: hình quá nhỏ, mode card còn giống dashboard/admin UI.
- **Chọn Home V2**: giữ cấu trúc rõ của phương án mới, biến hero thành cảnh Đại Việt giàu cảm xúc, card mode dựa trên artwork, giảm văn bản, đề cao lựa chọn chơi. **Không chọn** một màn dashboard dày KPI hoặc một bản sao layout ba cột của Campaign.
- “Đại bản doanh / Cổng Đại Việt” là tên gọi concept nội bộ, **không bắt buộc đổi tên sản phẩm hoặc UI text đang dùng**.

### 14.2 Desktop composition (thứ tự nội dung)

```text
[GLOBAL GAME HEADER — REUSE, NO REDESIGN]
┌──────────────────────────────────────────────────────────────────┐
│ FULL-WIDTH ENVIRONMENT HERO: Hoa Lư thế kỷ X                    │
│ Logo gốc Cờ Lau + tagline ngắn + [VÀO TRẬN]                   │
│ Secondary: [CHIẾN DỊCH] khi không trùng affordance mode card    │
│ Optional RESUME only with genuine resumable battle state        │
├──────────────────────────────────────────────────────────────────┤
│ CHẾ ĐỘ CHƠI — CHỌN CHIẾN TRƯỜNG                                 │
│ [CHIẾN DỊCH] [THÁP THÍ LUYỆN] [THÁP VẬN MỆNH]                    │
│ [SINH TỒN]   [THỬ THÁCH NGÀY] [ĐẤU TRƯỜNG BÓNG MA]              │
│ 6 illustration-led mode cards, each with concise progress/state │
├──────────────────────────────────────────────────────────────────┤
│ Hồ sơ & Trang bị · Nhiệm vụ · Xếp hạng · Tài khoản (if live)    │
└──────────────────────────────────────────────────────────────────┘
```

- Hero là **một vùng ảnh pano chính**, không đặt ảnh thành trì trong thẻ nhỏ tách rời. Dùng overlay chuyển sắc để logo/tagline/CTA đọc rõ và dùng lại logo game chính thức, không thay hình tự tạo.
- `VÀO TRẬN` giữ đúng hành vi điều hướng trận thường hiện có; nút `CHIẾN DỊCH` (nếu có) mở scene Campaign đang tồn tại; không đổi semantics của action để chạy tới trận gần nhất. `Tiếp tục` chỉ hiện khi backend/runtime thực sự hỗ trợ resume.
- Sáu card có tên mode, **một câu mô tả**, thumbnail riêng, tối đa một chỉ số tiến trình/trạng thái có nguồn dữ liệu thật, và affordance click/locked/disabled/pending rõ. Campaign có thể nhấn mạnh nhẹ bằng prominence/diện tích nhưng phải giữ khả năng quét đều cả sáu.
- Nhóm Trial/Destiny có thể mang nhãn phụ `Song Tháp`, song vẫn là **hai card độc lập** với feature flags độc lập. Không tự thêm card Liệt Truyện, Binh Pháp, Viễn Chinh vào sáu card live; mode tương lai cần approval và route/feature flag riêng.
- Thanh tiện ích phía dưới chỉ chứa liên kết thực sự khả dụng, tránh lặp lại Hồ sơ hoặc Trận thường nếu đã dễ truy cập ở Header; ưu tiên `Hồ sơ & Trang bị`, `Nhiệm vụ`, `Xếp hạng`, `Tài khoản` theo routing đã kiểm tra.

### 14.3 Art direction cho sáu card

| Mode | Tranh chủ đề | Ý nghĩa gameplay cần nhận ra | Không được ngụ ý sai |
|---|---|---|---|
| Chiến dịch | atlas/thành Hoa Lư, vùng đất Đại Việt | tuyến sử, chiếm cứ, tiến trình chương | không thiết kế lại atlas |
| Tháp Thí Luyện | tháp cổ ban ngày, núi mây, các mốc tầng | thử luật/puzzle và leo tầng | không hardcode hết ở tầng 20 vĩnh viễn |
| Tháp Vận Mệnh | tháp dưới trăng, chi tiết vận mệnh, sắc tím phụ | chu kỳ, khóa roster, tài nguyên xuyên tầng | không tô thành endless hoặc chế độ 20 tầng live |
| Sinh tồn | cổng trại, lũy đất, cờ son, đội phòng thủ | chống các đợt quân tấn công | không vẽ thanh HP thành hoặc đổi gameplay sang thủ thành |
| Thử thách ngày | chiếu thư, dấu triện, thao trường | đề giống nhau, đội cố định, thành tích/ngày | không cho sửa đội hoặc trang bị |
| Đấu trường bóng ma | võ đài, trống đồng, cờ và huy hiệu hạng | cạnh tranh rating với snapshot phòng thủ | không mô tả real-time PvP |

- Mỗi thumbnail dùng **cùng một art bible**, texture đồng cổ, giấy dó, gỗ sẫm và họa tiết Đông Sơn; ảnh **chủ đề khác nhau**, không dùng sáu màu nền trơn hoặc icon generic thay cho cảnh.
- Tranh nên dựa trên kiến trúc bản địa thế kỷ X, không dùng kiến trúc Trung Hoa/Nhật Bản hay hiệp sĩ châu Âu. Artwork mẫu và ảnh tìm kiếm chỉ là **visual reference**, không phải asset đã được duyệt hoặc tự động cấp quyền sử dụng.
- Ưu tiên tái sử dụng asset trong repo; artwork thiếu phải được kiểm kê và duyệt riêng. Không bake chữ/CTA vào ảnh. Dùng gradient overlay ở hero, alt/fallback cho thumbnail và variants mobile.

### 14.4 Quy tắc trình bày và responsive

- Giữ ornamental frame cấp A cho hero/game container, cấp B cho khối mode, cấp C cho item. Không lồng nhiều viền chạm khắc dày trong một card.
- Desktop: pano hero + grid 3×2; tablet grid 2 cột; mobile một cột, tối ưu crop và chiều cao ảnh, CTA rõ. Không để logo đè vào điểm nhấn của ảnh hoặc scroll màn hình quá dài chỉ vì hình minh họa.
- Đảm bảo ảnh không che trạng thái / mô tả; text trên lớp phủ đạt contrast, hover/focus/active/locked rõ bằng cả chữ hoặc biểu tượng.
- Không dùng dashboard KPI dày trên Home: chỉ hiển thị số liệu gắn trực tiếp với quyết định chọn mode. Khi không có dữ liệu/ảnh: fallback có ý nghĩa, không hiển thị progress giả.
- Hiệu ứng ambient (mây, lửa, ánh sáng) chỉ là optional polish, hỗ trợ reduced motion và không cản LCP/interactivity.

### 14.5 Acceptance cho Home V2

- [ ] Hero Hoa Lư chiếm vùng kể chuyện chính, dùng artwork/brand asset đã kiểm kê và duyệt.
- [ ] Sáu mode có thumbnail riêng, nhận diện được khi không đọc mô tả; trạng thái live/locked và navigation đúng nguồn dữ liệu.
- [ ] CTA không đổi chức năng `Vào Trận`; chỉ có resume khi thật sự hỗ trợ.
- [ ] Header và Campaign không có thay đổi hình thức/hành vi.
- [ ] Ở desktop/tablet/mobile: không overflow, crop ảnh đúng trọng tâm, text/CTA có độ tương phản và focus rõ.
- [ ] Screenshot QA đối chiếu độ hoàn thiện (hoa văn, hệ viền, font, vật liệu, tone) với Campaign, không sao chép bố cục atlas.
- [ ] Không thêm route/API/logic/reward hoặc artwork chưa duyệt.
