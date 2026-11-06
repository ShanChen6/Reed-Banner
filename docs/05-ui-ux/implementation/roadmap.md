# Reed Banner — UI Migration Roadmap: Home & Modes

> 27/10/2026 · DESIGN ONLY. Companion: [game-mode-ui-spec.md](../design-system/game-mode-ui-spec.md). Không có UI/code implementation trong PR docs này.

## 1. Workstreams

| Task | Scope / source | Output | Acceptance |
|---|---|---|---|
| UI-00 | `MenuScene`, `GameShell`, `src/components/ui`, global CSS, available art | Inventory runtime asset / current tokens | Không duplicate header; xác nhận CSS thực tế |
| UI-01 | tokens + UI primitives | `ModeHeroBanner`, `OrnateFrame`, `RuleBadge`, `FighterMiniCard` | Story states; contrast/responsive; giữ semantic |
| UI-02 | `MenuScene.tsx` | Home/Mode card composition | 6 live modes, flags, resume, link đúng |
| UI-03 | `trial/TrialView.tsx`, `TrialScreen.tsx` | Trial journey + rule + party + sweep | Không đụng API/20 floor hard limits; keyboard |
| UI-04 | `destiny/DestinyScreen.tsx` | Cycle journey + roster + phase-specific reward UI | Run phases/10 floors/server immutable |
| UI-05 | `survival/SurvivalScreen.tsx` + BREAK component | Camp setup + between-wave command | 3 active/2 reserve, build only BREAK, server settlement |
| UI-06 | `daily/DailyScreen.tsx` | Daily decree + matchup + ranking | Fixed lineup, once/day, reset server |
| UI-07 | `arena/ArenaScreen.tsx` | Rating board + defense snapshot + three offers | Async PvP; update snapshot explicit |
| UI-08 | Normal/Practice entry | unify button and shell styling only | offline unaffected; gameplay unchanged |
| UI-09 | all affected scenes | Visual regression, responsive and keyboard test | no routes/behavior regression |

## 2. Task details and review gates

### UI-00 — audit-only (required)
- Fetch assets and component references from **current develop SHA**, not screenshots alone.
- Inventory scene components and actual assets, identify current logo/Header/assets used for Campaign. Avoid asset regeneration unless missing.
- Record source locations, CSS variables and screenshots by viewport.
- Acceptance: a table of reusable primitives, truly missing components, and risk register.

### UI-01 — design foundation
- Add semantic design tokens as aliases/variants of existing tokens where possible.
- OrnateFrame must have only 3 prominence levels; avoid nested lavish frames.
- Establish light parchment (dark readable text) and dark timber (light readable text) content surfaces.
- Build reusable loading/error/locked/resume/button patterns; ensure full keyboard semantics.
- Acceptance: tested components on desktop/mobile with focus, contrast, disabled and loading.

### UI-02 — Home
- Reuse header. Hero area includes logo, environment key art and appropriate CTA.
- Reuse scene navigation and feature flags. Two tower cards respect independent feature flags.
- Mode tiles display truthful state only. Highlight main storyline visually; no hardcoded pseudo-progress.
- Include footer utility actions and game access without redundant controls.
- Acceptance: every current navigation target accessible; no clicks on disabled mode.

### UI-03 — Trial
- Preserve `overview.floors` as source, accessibility of floor navigator, active/locked/cleared status.
- Include floor details, prohibited class/element badges, selectable eligible companions, leader build and clear UX for invalid constraints.
- Move sweep to distinct secondary action with actual server-state eligibility.
- Acceptance: exactly existing authoritative actions start/resume/abandon/sweep and accessible keyboard selection; no spurious first clear rewards.

### UI-04 — Destiny
- Separate pre-run (roster confirmation) from active-run (journey, active 3, persistent resources), reward selection and completed states.
- Resource/Phúc detail must show rules from current runtime, not generic new boons.
- Acceptance: server-defined run states only, no simulated resource recovery; cycle expiry handled.

### UI-05 — Survival
- Set stage for active 3 and reserves <=2; preview exact server-approved roster constraints.
- Emphasize wave/round difference, break-only rotation/build and revive rules.
- If BREAK currently belongs to battle UI, change its presentation only, never battle transition.
- Acceptance: rotation unavailable mid-wave, no invented fort HP or automatic reserve swap.

### UI-06 — Daily
- Banner with server-provided day; fixed heroes/team and opponents side-by-side; results/ranking after settlement.
- Explicit action state: first attack, resume unfinished, already completed, next-day reset.
- Acceptance: no edit lineup, no extra attempt, no duplicate CTA.

### UI-07 — Arena
- Header score/rank/attacks; defense snapshot + update CTA; three offer cards.
- Show each offered opponent team/score from server; differentiate matchmaking snapshot from synchronous multiplayer.
- Acceptance: refresh produces refreshed offers; stale opponent error handled; no manual score change.

### UI-08 — Normal/Practice
- Only theme/navigation consistency (existing battle setup can be reused).
- Acceptance: 1v1/3v3 and offline rules unchanged.

### UI-09 — validation
- Screenshots: `1920x1080`, `1440x900`, `1024x768`, `390x844` across ready/locked/empty/error/progress.
- Check header unchanged; no horizontal scroll; missing portrait/asset fallback; loading race; action button focus and hover.
- Run existing unit/integration/E2E/regression suites; explicitly list checks not performed.
- Do not merge unless all server-action contracts remain untouched or separately reviewed.

## 3. Component map (proposed placement, confirm repo conventions in UI-00)

```text
src/components/game-ui/                (suggestion, not existing)
  ModeHeroBanner.tsx
  OrnateFrame.tsx
  GameModePage.tsx
  GameAction.tsx
  RuleBadge.tsx
  FighterMiniCard.tsx
  ProgressTrack.tsx
  ModeCard.tsx
```

Keep ownership separation:
- global Header/scene router => existing `GameShell/SceneContext`.
- server fetch/actions/state machines => existing mode screen modules.
- visual components => presentational only, no hidden POST.
- asset mapping => existing `art/` first.

## 4. Visual art deliverable checklist

| Mode | Mandatory | Optional polish |
|---|---|---|
| Home | 1 panoramic hero, 5 mode illustrations + campaign reuse, 1 ornate trim system | subtle animated clouds/torch |
| Trial | Trial banner + floor states/icons + rule panel patterns | distinct milestone-floor art |
| Destiny | cycle banner + journey path + boon/recovery icon mapping | moon transition based on cycle |
| Survival | camp/fort banner + active/reserve frames | between-wave scene |
| Daily | decree banner + seal motif + comparison header | date-sensitive illustration |
| Arena | arena banner + rank emblem + offense/defense frames | victory flourishes |

Asset requirement: Vietnamese 10th-century low-fantasy visual references, no embedded text, separate overlays, optimized responsive variants, all state legible without art.

## 5. Risks and explicit decisions before coding

1. Confirm existing asset IDs and component reuse (don't recreate expensive concept art).
2. Header appearance must remain exactly aligned across scenes — coordinate with campaign layout.
3. Trial and Destiny flags may be OFF by default; test enabled/disabled without bypassing server.
4. Distinguish approved future product directions from live behavior (Trial >20, Destiny 20, Survival rename).
5. A shared decorative design **must not** force identical grids: choose a layout suited to player decision for each mode.
6. Confirm priority of replacing Home first, then Trial, Destiny, Survival, Daily, Arena. Never combine all into a single large PR.

## 6. Definition of Done for documentation

- [x] Identify implemented mode source files and rule constraints.
- [x] Create visual language and mode-specific wireframes.
- [x] Explicit state/CTA/reward constraints, mobile and accessibility.
- [x] Migration sequence and acceptance criteria.
- [ ] Artwork/mockups approved by owner.
- [ ] UI coding and screenshot testing (separate PRs).

## 7. UI-02 — Home V2 refined design gate (27/10/2026)

Sau khi kiểm tra baseline, chủ dự án chọn **Home V2 illustration-led** thay vì bản Home card chữ hoặc wireframe hero + sáu ô giấy dó đơn giản. Tham chiếu chi tiết: [Home V2 trong game-mode-ui-spec.md](../design-system/game-mode-ui-spec.md#14-home-v2--visual-direction-đã-chọn-27102026).

### Triển khai theo các bước riêng

1. **UI-02A — Asset inventory:** định vị logo, ảnh pano Hoa Lư, thumbnail Campaign và các artwork/overlay liên quan; lập danh sách thiếu, chưa tự sinh/thay asset.
2. **UI-02B — Hero:** giữ Global Header; dùng pano môi trường làm nền hero, gradient và branded CTA; không biến `Vào Trận` thành `Tiếp tục` giả.
3. **UI-02C — Six mode cards:** grid 3×2 desktop, 2 cột tablet, 1 cột mobile; icon chỉ phụ trợ artwork; đọc live availability, progress, labels và links từ nguồn chuẩn.
4. **UI-02D — Secondary actions:** tổ chức tiện ích hiện có; không nhân đôi navigation từ Header và không thêm mode docs-only.
5. **UI-02E — Verification:** visual diff với Campaign, QA states và test điều hướng/flags tại 1920×1080, 1440×900, 1024×768, 390×844.

### Review/acceptance gate

- Wireframe hiện có chỉ minh họa tỉ lệ và hierarchy, **không phải screenshot UI cuối**; artwork ví dụ không được xem là asset production.
- Phải cho người duyệt thấy screenshot Home mới cạnh màn Campaign reference trước khi chuyển mode khác.
- Không sửa header, campaign scene, battle logic, API contract hoặc feature flag.
- Ưu tiên Home trong task UI-02, sau đó Trial → Destiny → Survival → Daily → Arena như roadmap hiện tại; không gộp hết vào một PR.

## 4. Đồng bộ UI toàn game (05/11/2026)

Shan duyệt đề xuất đồng bộ sau đợt kiểm kê 20 màn ngày 05/11/2026 và yêu cầu chia nhỏ: mỗi bước một PR nhỏ vào `develop`, có ảnh trước/sau, không đổi luật chơi, API hay dữ liệu. Quy tắc ở [theme.md](../design-system/theme.md#quy-tắc-chung-đồng-bộ-ui-05112026).

| Bước | Phạm vi |
| --- | --- |
| UI-S1 | (PR #295, đã merge) Nền tảng: token, nút chính/phụ, `Tabs`, `ChoiceChip`, `OrnateFrame`, `ModeScreen`, `ModeBanner`, trang `/demo/ui` |
| UI-S2 | Màn cần đăng nhập dùng chung (`LoginGate` + `src/app/game/modeInfo.ts`): banner, luật và phần thưởng chính, nút "Đăng nhập để chơi" |
| UI-S3 | Nhiệm vụ, Xếp hạng, Đăng nhập/Đăng ký/Tài khoản |
| UI-S4 | Khai Lộ, Tháp Thí Luyện, Tháp Thiên Mệnh |
| UI-S5 | Cửa Hàng thành trang thường; thẻ tướng chung với Doanh Trại; tách cửa hàng khỏi sảnh trận |
| UI-S6 | Trận Đồ, Tầm Tướng Ký, Trấn Ải, Nhật Lệnh, Quần Hùng (mỗi màn một PR) |
| UI-S7 | Bình Loạn: thay màu thô bằng token, đưa Tái đấu sứ quân vào khung atlas |
| UI-S8 | Màn trận trên điện thoại: bàn cờ lên trước, hai phe gọn trên/dưới |

Header (luồng riêng) và lõi Viễn Chinh không nằm trong đợt này; Viễn Chinh chỉ đổi mã màu sang token khi luồng của nó xong.

## 9. Bản 2: sửa lỗi và chỉnh UI/UX (06/11/2026)

Trạng thái mục này: **DRAFT**. Shan đưa danh sách ngày 06/11/2026 và dặn chỉ ghi lại, **chưa triển khai**. Làm theo cách của đợt đồng bộ: mỗi bước một PR nhỏ vào `develop`, có ảnh trước/sau.

| Bước | Màn | Việc | Kiểu |
| --- | --- | --- | --- |
| V2-01 | Khai Lộ | Gói vùng chơi vào khung thẻ | Chỉ UI |
| V2-02 | Trận Đồ | Tab Chơi thường dùng banner riêng cho từng bậc | Chờ ảnh |
| V2-03 | Trận Đồ | Thẻ bậc cao bằng nhau | Chỉ UI |
| V2-04 | Trận Đồ | Thêm tab Bảng xếp hạng và tab Ban thưởng | Chỉ UI |
| V2-05 | Trận Đồ, Nhiệm vụ | Đưa Bộ sưu tập địa danh vào Thành tựu | Đổi dữ liệu |
| V2-06 | Mọi chế độ có xếp hạng | Bảng xếp hạng trong chế độ + trang thành tích theo mùa | UI + API đọc |
| V2-07 | Tháp Thiên Mệnh | Thêm chân dung tướng khi khóa đội | Chỉ UI |

Thứ tự đề xuất: V2-07, V2-01, V2-03 (nhỏ, chỉ UI) → V2-04 → V2-06 → V2-02 (khi có ảnh) → V2-05 (đụng dữ liệu hồ sơ, cần Shan duyệt số thưởng).

### V2-01 — Khai Lộ: khung thẻ cho vùng chơi

- **Hiện tại** (`src/app/game/khai-lo/KhaiLoScreen.tsx`): dòng "Giải đố · Thường · Màn 1", hai nút chọn Thường/Cấp tốc, bốn ô chỉ số và bàn cờ nằm thẳng trên nền màn; chỉ bàn cờ có viền mỏng (`ui-frame w-fit p-2`). Cột phải (Đạo cụ, Luật chơi) đã có khung, nên hai cột lệch nhau.
- **Đề xuất**: thêm `ModeBanner` như các chế độ khác (tranh tạm tới khi có `public/art/home/khai-lo.webp`); gói chọn chế độ + chỉ số + bàn cờ + dòng gợi ý vào một `OrnateFrame`; nút "Ván mới" đưa vào góc khung đó.
- **Nghiệm thu**: hai cột cùng kiểu khung, mép trên thẳng hàng; điện thoại không phải cuộn ngang; không đổi luật chơi hay lưu trữ.

### V2-02 — Trận Đồ: banner cho từng bậc ở Chơi thường

- **Hiện tại**: thẻ Hướng dẫn/Thường/Khó/Đại trận dùng `MapCard` với ô che gỗ kín 2/3 thẻ ("Bản đồ chưa lộ"), vì ván thật chọn bản đồ ngẫu nhiên.
- **Shan chốt**: thay bằng banner riêng cho từng bậc. Shan sẽ gửi 4 ảnh.
- **Quy ước ảnh** (đề xuất): `public/art/formation/levels/<id>.webp` với id `huong-dan`, `thuong`, `kho`, `dai-tran`; tỉ lệ 2:1 như khung hiện tại, xuất 1280×640 WebP. Chưa có ảnh thì giữ bản đồ mẫu như bây giờ.
- **Tab Xếp hạng giữ ô che lộ dần**, vì ở đó ô che là tiến độ của kỳ, không chỉ để trang trí (chờ Shan xác nhận).

### V2-03 — Trận Đồ: thẻ cao bằng nhau

- **Hiện tại**: thẻ cùng hàng cao thấp khác nhau theo độ dài mô tả (Chơi thường); ở Xếp hạng, thẻ đã thắng có thêm ô "Hạng 1/1" nên thang thưởng và nút "Chơi tính hạng" của ba thẻ không thẳng hàng.
- **Đề xuất**: mỗi thẻ giãn đủ chiều cao hàng lưới (dàn cột, nút ở đáy thẻ); vùng trạng thái (chưa chơi / hạng dự kiến) giữ chỗ cố định để thang thưởng nằm cùng một vạch.

### V2-04 — Trận Đồ: tab Bảng xếp hạng và tab Ban thưởng

- **Hiện tại**: hai tab "Xếp hạng · có thưởng" và "Chơi thường". Dưới mỗi thẻ xếp hạng là "Bảng xếp hạng (n)" gập lại; bảng thưởng theo hạng và thưởng chờ nhận nằm chung trong tab Xếp hạng.
- **Shan chốt**: thêm tab Bảng xếp hạng cạnh Chơi thường; phần thưởng hạng tách thành tab riêng (Shan chọn phương án 2, không gộp vào bảng xếp hạng).
- **Bốn tab**: Xếp hạng (chỉ ba thẻ bậc và nút chơi) · Chơi thường · Bảng xếp hạng (chọn bậc Thường/Khó/Đại trận, top của kỳ kèm hạng của mình) · **Ban thưởng** (thưởng chờ nhận và nút Nhận, thang thưởng, bảng thưởng theo hạng). Tên tab thưởng đề xuất "Ban thưởng" (hợp giọng lịch sử); phương án khác: "Phần thưởng", "Quà kỳ".
- Khách: tab Bảng xếp hạng và Ban thưởng hiện lời nhắc đăng nhập như tab Xếp hạng hiện nay.
- Số trên tab: Ban thưởng có chấm đỏ khi còn thưởng chưa nhận.

### V2-05 — Bộ sưu tập địa danh vào Thành tựu

- **Hiện tại**: bộ sưu tập `n/30` lưu ở trình duyệt (`src/app/game/formation/storage.ts`), mất khi đổi máy; Thành tựu đọc từ hồ sơ trên máy chủ (`src/core/progress/achievements.ts`).
- **Đề xuất**: lưu bộ sưu tập vào hồ sơ (gộp một lần từ trình duyệt khi đăng nhập), thêm mốc thành tựu (ví dụ 5/15/30 địa danh), lưới địa danh hiển thị trong màn Nhiệm vụ mục Thành tựu; ở Trận Đồ chỉ còn một dòng "Bộ sưu tập: n/30" dẫn sang đó.
- Đụng dữ liệu hồ sơ nên làm PR riêng, kèm test; mốc và vàng thưởng chờ Shan duyệt.

### V2-06 — Bảng xếp hạng: trong chế độ và trang theo mùa

- **Hiện tại**: Trấn Ải, Quần Hùng, Tháp Thiên Mệnh có nút dẫn sang `/game/leaderboard?board=…`; trang đó không có nút quay về chế độ (chỉ có "Chiến trường" trên header hoặc nút Back của trình duyệt).
- **Shan chốt**: làm cả hai.
  1. **Trong chế độ**: mỗi chế độ có xếp hạng hiện bảng hiện tại ngay trong màn (tab hoặc khối gập): top 10–20 và hạng của mình. Tách phần hiển thị bảng của `LeaderboardScreen.tsx` thành component dùng chung.
  2. **Trang Xếp hạng** thành **bảng thành tích theo mùa**: mùa này, mùa trước, mọi thời đại, gom mọi chế độ.
  3. Mở trang Xếp hạng từ một chế độ thì có nút "← Về <tên chế độ>" (truyền chế độ nguồn qua tham số URL); header giữ nguyên.
- Chế độ áp dụng: Trấn Ải, Quần Hùng, Tháp Thiên Mệnh, Trận Đồ (V2-04), Tầm Tướng Ký xếp hạng; Nhật Lệnh và Bình Loạn chờ Shan chọn.

### V2-07 — Tháp Thiên Mệnh: chân dung khi khóa đội

- **Hiện tại** (`src/app/game/destiny/DestinyScreen.tsx`): thẻ chọn tướng chỉ có tên và "Hệ · Nghề" trên nền giấy dó; Tháp Thí Luyện đã dùng `Portrait` (`TrialView.tsx`).
- **Đề xuất (Claude khuyên làm)**: thêm `Portrait` cỡ 48px bên trái tên, giữ kiểu đang chọn giấy dó; lưới 3 cột trên máy tính, 2 cột trên điện thoại. Không đổi luật khóa đội.

### Câu hỏi cho Shan

1. Tên tab thưởng ở Trận Đồ: "Ban thưởng", "Phần thưởng" hay "Quà kỳ"?
2. Tab Xếp hạng của Trận Đồ giữ ô che lộ dần theo tiến độ, chỉ Chơi thường đổi sang banner, đúng ý anh không?
3. Mốc thành tựu bộ sưu tập địa danh (đề xuất 5/15/30) và vàng mỗi mốc?
4. Nhật Lệnh và Bình Loạn có cần bảng xếp hạng trong màn không?

