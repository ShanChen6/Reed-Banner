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
| V2-01 | Khai Lộ | Gói vùng chơi vào khung thẻ | Đã làm (PR #340) |
| V2-02 | Trận Đồ | Thẻ bậc dùng ảnh thumbnail cố định (cả Xếp hạng và Chơi thường) | Đã làm (06/11) |
| V2-03 | Trận Đồ | Thẻ bậc cao bằng nhau | Đã làm (06/11) |
| V2-04 | Trận Đồ | Thêm tab Bảng xếp hạng và tab Ban thưởng | Đã làm (06/11) |
| V2-05 | Trận Đồ, Nhiệm vụ | Đưa Bộ sưu tập địa danh vào Thành tựu | Đổi dữ liệu |
| V2-06 | Trang chủ, chế độ có xếp hạng | Tách: trang Công Trạng (thành tích theo mùa) và bảng xếp hạng mùa hiện tại trong từng chế độ | UI + API đọc |
| V2-07 | Tháp Thiên Mệnh | Thêm chân dung tướng khi khóa đội | Đã làm (06/11) |

Thứ tự đề xuất: V2-07, V2-01, V2-03 (nhỏ, chỉ UI) → V2-04 → V2-06 → V2-02 (khi có ảnh) → V2-05 (đụng dữ liệu hồ sơ, cần Shan duyệt số thưởng).

### V2-01 — Khai Lộ: khung thẻ cho vùng chơi

- **Hiện tại** (`src/app/game/khai-lo/KhaiLoScreen.tsx`): dòng "Giải đố · Thường · Màn 1", hai nút chọn Thường/Cấp tốc, bốn ô chỉ số và bàn cờ nằm thẳng trên nền màn; chỉ bàn cờ có viền mỏng (`ui-frame w-fit p-2`). Cột phải (Đạo cụ, Luật chơi) đã có khung, nên hai cột lệch nhau.
- **Đề xuất**: thêm `ModeBanner` như các chế độ khác (tranh tạm tới khi có `public/art/home/khai-lo.webp`); gói chọn chế độ + chỉ số + bàn cờ + dòng gợi ý vào một `OrnateFrame`; nút "Ván mới" đưa vào góc khung đó.
- **Nghiệm thu**: hai cột cùng kiểu khung, mép trên thẳng hàng; điện thoại không phải cuộn ngang; không đổi luật chơi hay lưu trữ.

### V2-02 — Trận Đồ: ảnh thumbnail cố định cho từng bậc

- **Hiện tại**: thẻ bậc ở cả hai tab dùng `MapCard`: ô che gỗ phủ kín ("Bản đồ chưa lộ") và lộ dần theo tiến độ, thắng thì lộ hết kèm tên địa danh.
- **Shan chốt (06/11)**: mọi thẻ bậc, cả tab Xếp hạng lẫn Chơi thường, dùng ảnh thumbnail cố định của bậc đó; bỏ ô che lộ dần trên thẻ. Đã nối ảnh (06/11). Tiến độ và địa danh của kỳ vẫn xem trong ván và ở Bộ sưu tập.
- **Ảnh**: 7 tệp (4 bậc Chơi thường + 3 bậc Xếp hạng, bản Xếp hạng thêm hậu tố `-ranked`) ở `public/art/formation/levels/`, 2:1, 1280×640 WebP; prompt ở [prompt hình ảnh Trận Đồ mục 5](../../06-art/prompts/tran-do-hinh-anh.md#5-thumbnail-thẻ-bậc-bản-2-06112026). Thiếu bản `-ranked` thì dùng ảnh Chơi thường cùng bậc; chưa có ảnh nào thì giữ thẻ như bây giờ.
- `MapCard` chỉ còn dùng cho khung kết quả cuối ván (hiện cả bản đồ).

### V2-03 — Trận Đồ: thẻ cao bằng nhau

- **Hiện tại**: thẻ cùng hàng cao thấp khác nhau theo độ dài mô tả (Chơi thường); ở Xếp hạng, thẻ đã thắng có thêm ô "Hạng 1/1" nên thang thưởng và nút "Chơi tính hạng" của ba thẻ không thẳng hàng.
- **Đề xuất**: mỗi thẻ giãn đủ chiều cao hàng lưới (dàn cột, nút ở đáy thẻ); vùng trạng thái (chưa chơi / hạng dự kiến) giữ chỗ cố định để thang thưởng nằm cùng một vạch.

### V2-04 — Trận Đồ: tab Bảng xếp hạng và tab Ban thưởng

- **Hiện tại**: hai tab "Xếp hạng · có thưởng" và "Chơi thường". Dưới mỗi thẻ xếp hạng là "Bảng xếp hạng (n)" gập lại; bảng thưởng theo hạng và thưởng chờ nhận nằm chung trong tab Xếp hạng.
- **Shan chốt**: thêm tab Bảng xếp hạng cạnh Chơi thường; phần thưởng hạng tách thành tab riêng (Shan chọn phương án 2, không gộp vào bảng xếp hạng).
- **Bốn tab**: Xếp hạng (chỉ ba thẻ bậc và nút chơi) · Chơi thường · Bảng xếp hạng (chọn bậc Thường/Khó/Đại trận, top của kỳ kèm hạng của mình) · **Ban thưởng** (thưởng chờ nhận và nút Nhận, thang thưởng, bảng thưởng theo hạng). Tên tab thưởng: **Ban thưởng** (Shan chốt 06/11).
- Khách: tab Bảng xếp hạng và Ban thưởng hiện lời nhắc đăng nhập như tab Xếp hạng hiện nay.
- Số trên tab: Ban thưởng có chấm đỏ khi còn thưởng chưa nhận.

### V2-05 — Bộ sưu tập địa danh vào Thành tựu

- **Hiện tại**: bộ sưu tập `n/30` lưu ở trình duyệt (`src/app/game/formation/storage.ts`), mất khi đổi máy; Thành tựu đọc từ hồ sơ trên máy chủ (`src/core/progress/achievements.ts`).
- **Đề xuất**: lưu bộ sưu tập vào hồ sơ (gộp một lần từ trình duyệt khi đăng nhập), lưới địa danh hiển thị trong màn Nhiệm vụ mục Thành tựu; ở Trận Đồ chỉ còn một dòng "Bộ sưu tập: n/30" dẫn sang đó.
- **Xem lại tranh** (Shan yêu cầu 06/11): bấm một địa danh đã có thì mở tranh bản đồ cỡ lớn kèm tên và chú thích; địa danh chưa có vẫn là "? ? ?" và không bấm được.
- **Mốc thành tựu** (Shan giao Claude đặt, 06/11), cùng thang với thành tựu hiện có trong `achievements.ts` (50–1000 vàng):

  | Mốc | Tên đề xuất | Vàng |
  | --- | --- | --- |
  | 5 địa danh | Du khảo sơn hà | 200 |
  | 15 địa danh | Thông tỏ địa đồ | 500 |
  | 30 địa danh | Thu trọn giang sơn | 1000 |

- Đụng dữ liệu hồ sơ nên làm PR riêng, kèm test.

### V2-06 — Tách trang Công Trạng và bảng xếp hạng trong chế độ

- **Hiện tại**: Trang chủ có tiện ích "Xếp hạng" mở `/game/leaderboard` (bảng mùa tuần và mọi thời đại của Trấn Ải, Quần Hùng, Tháp Thiên Mệnh, Tầm Tướng Ký). Trấn Ải, Quần Hùng, Tháp Thiên Mệnh có nút dẫn sang trang đó; trang không có nút quay về chế độ.
- **Shan chốt 06/11**: tách làm hai, không còn liên kết giữa hai bên.
  1. **Trang Công Trạng** (thay "Xếp hạng" ở Trang chủ): thành tích theo mùa của người chơi, gom mọi chế độ có xếp hạng (mùa này, các mùa trước, hạng và thưởng đã nhận). Tên **Công Trạng** (Shan chốt 06/11). Route giữ `/game/leaderboard` hoặc đổi `/game/honors` kèm chuyển hướng 308.
  2. **Bảng xếp hạng trong chế độ**: mỗi chế độ hiện bảng **mùa hiện tại** ngay trong màn (top và hạng của mình), không có nút dẫn sang Công Trạng. Bỏ các nút "Bảng xếp hạng" đang dẫn sang trang riêng ở Trấn Ải, Quần Hùng, Tháp Thiên Mệnh. Phần hiển thị bảng tách từ `LeaderboardScreen.tsx` thành component dùng chung.
- Chế độ có bảng trong màn: Trấn Ải, Quần Hùng, Tháp Thiên Mệnh, Trận Đồ (tab ở V2-04), Tầm Tướng Ký xếp hạng. **Nhật Lệnh và Bình Loạn không làm bảng xếp hạng** (Shan chốt 06/11); bảng điểm trong ngày của Nhật Lệnh đang có giữ nguyên.

### V2-07 — Tháp Thiên Mệnh: chân dung khi khóa đội

- **Hiện tại** (`src/app/game/destiny/DestinyScreen.tsx`): thẻ chọn tướng chỉ có tên và "Hệ · Nghề" trên nền giấy dó; Tháp Thí Luyện đã dùng `Portrait` (`TrialView.tsx`).
- **Đề xuất (Claude khuyên làm)**: thêm `Portrait` cỡ 48px bên trái tên, giữ kiểu đang chọn giấy dó; lưới 3 cột trên máy tính, 2 cột trên điện thoại. Không đổi luật khóa đội.

### Shan chốt (06/11/2026)

1. Tách bảng xếp hạng: trang Công Trạng (thành tích theo mùa, thay "Xếp hạng" ở Trang chủ) và bảng mùa hiện tại trong từng chế độ, không liên kết sang nhau (V2-06).
2. Tab thưởng Trận Đồ tên **Ban thưởng** (V2-04).
3. Bộ sưu tập địa danh: Claude đặt mốc 5/15/30 = 200/500/1000 vàng; bấm địa danh đã có để xem lại tranh (V2-05).
4. Nhật Lệnh và Bình Loạn không làm bảng xếp hạng.

5. Tên trang thành tích theo mùa: **Công Trạng**.
6. Thẻ bậc Trận Đồ ở cả hai tab dùng ảnh thumbnail cố định, bỏ ô che lộ dần (V2-02).

Đã có đủ 7 ảnh thumbnail bậc Trận Đồ và đã nối vào thẻ bậc (V2-02).
