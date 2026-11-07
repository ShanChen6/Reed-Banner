# Kiểm kê UI/responsive các màn game

> Cập nhật: 07/11/2026
> Trạng thái: **AUDIT** — số liệu đo tự động và ảnh chụp ở máy dev; chưa thay đổi mã nguồn trong đợt này, chưa thử trên thiết bị thật.

Bước đầu của [lộ trình đồng bộ UI](../../05-ui-ux/implementation/roadmap.md#4-đồng-bộ-ui-toàn-game-05112026) sau khi gom bề rộng nội dung về một chuẩn thích ứng ([theme.md](../../05-ui-ux/design-system/theme.md)). Mục đích: có danh sách lỗi cụ thể để sắp thứ tự sửa, không phải để sửa ngay.

## Phạm vi và cách đo

- 19 trạng thái màn × 4 cỡ cửa sổ = 76 lần đo bằng Chromium (Playwright) trên bản dev, bật đủ cờ `TRIAL_ENABLED`, `DESTINY_ENABLED`, `TAM_TUONG_KY_ENABLED`, `EXPEDITION_ENABLED`, chơi với tư cách **khách**.
- Cỡ cửa sổ: 390×844 (điện thoại, cảm ứng), 768×1024 (máy tính bảng), 1280×800, 1920×1080.
- Mỗi lần đo: ảnh chụp cả trang, tràn ngang (phần tử nằm ngoài khung nhìn mà không có cha cuộn/cắt), vùng chạm nhỏ hơn 44px, chữ nhỏ hơn 12px và 13px, ảnh vỡ, lỗi JS.
- Ngoài ra quét mã nguồn `src/app/game` và `src/components` tìm màu và cỡ viết tay.
- Ảnh chụp nằm ở thư mục tạm của phiên, không đưa vào repo.

Màn đã đo: Chiến trường, Thao Luyện (đang đánh và sảnh), Bình Loạn, Doanh Trại, Cửa Hàng, Nhiệm vụ, Xếp hạng, Nhật Lệnh, Trấn Ải, Quần Hùng, Tháp Thí Luyện, Tháp Thiên Mệnh, Trận Đồ, Tầm Tướng Ký, Viễn Chinh, Khai Lộ, Đăng nhập, Đăng ký.

## Kết quả tổng quát

| Chỉ số | Kết quả |
| --- | --- |
| Tràn ngang ở cả 4 cỡ | **0/76** |
| Lỗi JS (`pageerror`) | **0** |
| Ảnh vỡ | **0** |
| Màn dùng `ModeScreen` / `.ui-mode-screen` | Tất cả màn chính; ngoại lệ hợp lý là hộp thoại `SurvivalBreakScreen` |

Bố cục co giãn tốt, không có lỗi vỡ nghiêm trọng. Vấn đề nằm ở **kích thước vùng chạm, cỡ chữ, độ dài trang trên điện thoại** và **màu viết tay còn sót**.

## Giới hạn của lần đo này

Khách chưa đăng nhập chỉ thấy **màn khóa đăng nhập** ở Nhật Lệnh, Trấn Ải, Quần Hùng, Xếp hạng, Tháp Thiên Mệnh, Tầm Tướng Ký, và Doanh Trại chỉ có danh sách 6 tướng khởi đầu. Trang của các màn này cao đúng bằng cửa sổ (844px) vì chỉ có khung khóa. Phần này đã được đo bổ sung ở bước 6 (hồ sơ mới trống, bản dev).

## Phát hiện, xếp theo mức ưu tiên

### P1 — Vùng chạm nhỏ, sửa được ở component chung

Nguyên nhân gốc: kích thước `sm` của component chung dưới 44px. Sửa một chỗ phủ nhiều màn.

| Phần tử | Kích thước đo | Gặp ở | Nguồn |
| --- | --- | --- | --- |
| Nút `Button size="sm"` | 34–36px cao | Thao Luyện ("Đổi đội hình"), Nhiệm vụ (49 nút "N vàng"), Cửa Hàng | `src/components/ui/button.tsx` (`sm: min-h-8`) |
| `ChoiceChip` / tab nhỏ | 32px cao | Sảnh trận, Cửa Hàng (tab nhóm tướng), phẩm/bộ trang bị | `src/components/ui/choice.tsx` (`sm: min-h-8`) |
| Ô chọn Độ khó | 36px cao | Mọi màn trận | `DemoGame.tsx` (`min-h-9`) |
| Nút Chiến trường ở header | 44×40 | **Mọi màn** | `.game-header-chip` |
| Liên kết chữ | 18–19px cao | "Doanh Trại" (Cửa Hàng), "Quên mật khẩu?" | từng màn |
| `summary` "Bộ 6 chủ động · 4 bị động" | 16px cao | Sảnh trận, trong trận | `SkillDetails.tsx` |

Hướng sửa: nâng `min-h` lên 44px khi con trỏ thô (`@media (pointer: coarse)`), giữ gọn trên máy tính; thêm vùng chạm đệm cho liên kết chữ.

### P1 — Khai Lộ trên điện thoại

- 81 ô bàn cờ rộng **29×29px** ở 390px (cần thêm 15px nữa để đạt 44, không khả thi với 10 cột).
- Đã giảm nhẹ nhờ cơ chế "chạm một lần để xem trước khối" của chính chế độ này.
- Hướng sửa: bỏ đệm khung bàn cờ trên điện thoại để ô lên ~33px, hoặc chọn kích thước bàn nhỏ hơn cho màn hẹp; tài liệu GDD cần cho phép.

### P1 — Trang Nhiệm vụ quá dài trên điện thoại

- Cao **6597px** ở 390px (gấp 7–8 lần màn hình), 4264px ở 1920px.
- Danh sách Thành tựu gần 40 dòng trong một cột, không gập.
- Hướng sửa: gập theo nhóm (Tầm Tướng Ký, Chiến dịch, Trấn Ải…), mặc định chỉ mở nhóm chưa nhận thưởng; thêm tab.

### P2 — Màn trận trên điện thoại (UI-S8)

- Thẻ tướng cắt tên ("Trầ…", "Đin…", "Ngô X…") và ẩn thanh NL/TT ở 390px.
- Số máu 11px, nhãn phím kỹ năng 10px.
- Thanh kỹ năng xếp 2 hàng, phần lớn bị làm mờ khi chưa đến lượt (đúng luật, nhưng chiếm nhiều chỗ).
- Phe đối thủ nằm trên bàn cờ, phe mình nằm dưới: đúng ý "bàn cờ ở giữa", cần kiểm tra khi có đủ trận thật.

### P2 — Chữ dưới 12px

| Nơi | Cỡ | Ví dụ |
| --- | --- | --- |
| Thẻ chế độ (nhãn kicker) | 11px | "Song Tháp", "Binh pháp" |
| Bình Loạn | 10px | nhãn "Truyền thuyết", "Sử chép" |
| Tháp Thí Luyện | 11px | "Hệ Hỏa bị cấm ở tầng này" |
| Trận | 10–11px | số máu, nhãn phím |

Quét mã: 38 chỗ `text-[9|10|11px]` ở 8 file (`TamTuongKyScreen` 8, `DemoGame` 8, `ProgressPanel` 3, còn lại 1–2). Quy tắc chuẩn: chữ nhỏ nhất 13px (`text-caption`). Số "chữ dưới 12px" ở Thao Luyện (111–117) có lẫn nội dung `sr-only` và ẩn bằng CSS, nên con số này **thổi phồng**, chỉ dùng để tìm vị trí, không phải số lỗi thật.

### P2 — Màu và cỡ viết tay còn sót

Theo `docs/05-ui-ux/design-system/theme.md` không được thêm `bg-amber-*`, `bg-stone-*`, `#hex` mới.

| Mẫu | Số lần |
| --- | --- |
| `bg-[#…]` / `text-[#…]` / `border-[#…]` | 7 / 4 / 3 |
| Lớp màu bảng Tailwind (`bg-amber-500`, `text-rose-*`…) cho nền | 41 |
| Lớp màu bảng Tailwind cho chữ | 59 |
| `var(--panel)` cũ | 0 (đã dọn ở lượt Giao Tranh) |

File nhiều nhất: `battle/DemoGame.tsx` (21), `profile/HeroDetail.tsx` (12), `profile/HeroList.tsx` (8), `profile/Armory.tsx` (8), `rankRewards/RankRewardsPanel.tsx` (6).

### P3 — Nhẹ

- Màn hẹp 390px: phép đo trang rất khác nhau, Chiến trường cao 3550px (10 thẻ một cột); cân nhắc thẻ ngang gọn hơn trên điện thoại.
- Viễn Chinh: 56 phần tử chữ nhỏ hơn 13px (nhiều nhất trong các màn đo), cần xem lại thang chữ.
- Bình Loạn: ô cứ điểm trên bản đồ 39–45px cao, gần ngưỡng; chấp nhận được.

## Thứ tự sửa đề xuất

1. **Component chung (P1 vùng chạm):** `Button sm`, `ChoiceChip sm`, ô Độ khó, nút header, `summary`. Một lượt, tác động cả game.
2. **Nhiệm vụ trên điện thoại:** gập nhóm, thêm tab.
3. **Màn trận trên điện thoại (UI-S8):** thẻ tướng gọn, chữ ≥13px.
4. **Khai Lộ trên điện thoại:** đệm bàn cờ, cân kích thước.
5. **Dọn màu và cỡ viết tay** theo danh sách file ở trên, bắt đầu từ `DemoGame.tsx`.
6. **Đo lại sau đăng nhập** các màn đang bị khóa, rồi thêm kiểm tra tự động (đo tràn ngang, vùng chạm, cấm màu mới) để khóa chất lượng.

## Quyết định đã chốt (07/11/2026)

- Mốc nhỏ nhất: **360px**.
- Vùng chạm 44px chỉ áp cho màn cảm ứng (`pointer: coarse`); máy tính giữ gọn.
- Cỡ chữ: chữ đọc và điều khiển ≥ 13px; số liệu trong trận bớt nhãn thay vì giảm chữ; ngoại lệ duy nhất là chữ phủ lên biểu tượng (≥ 11px, không phải nguồn thông tin duy nhất). Chi tiết ở [theme.md](../../05-ui-ux/design-system/theme.md).

## Tiến độ sửa

| Bước | Trạng thái |
| --- | --- |
| 1. Component chung: vùng chạm (`Button sm`, `ChoiceChip sm`, `Input`, nút header, `summary`, `ui-link`, ô Độ khó, thanh trượt) | Đã làm 07/11/2026; đo lại ở giả lập cảm ứng 390px: Nhiệm vụ 49 → 0 nút nhỏ, Chiến trường, sảnh trận 0 |
| 2. Nhiệm vụ trên điện thoại | Đã làm 07/11/2026: thành tựu chia 6 nhóm gập được (nhóm có thưởng chờ nhận tự mở, món nhận được lên đầu), bộ sưu tập địa danh gập mặc định. Chiều cao trang 6597 → 2411px ở 360px, 4879 → 1194px ở 1280px; không tràn ngang |
| 3. Màn trận trên điện thoại | Đã làm 07/11/2026: thẻ tướng xếp chân dung trên, tên đọc đủ 2 dòng; chữ trong trận 13px (`text-caption`), riêng số phím và chi phí NL phủ trên icon 11px theo ngoại lệ; thanh kỹ năng thành lưới 3 cột trên điện thoại. Đo ở 360/768/1280px: không tràn ngang, không còn chữ dưới 13px ngoài ngoại lệ (và một dòng 12px ở menu tài khoản chưa sửa) |
| 3b. Bỏ sân khấu hình tướng trên điện thoại nhỏ | Đã làm 07/11/2026: `BattleStage` chỉ dựng từ 640px (`useStageVisible`), dưới đó bàn cờ lên đầu màn; không lỗi JS khi thao tác |
| 4. Khai Lộ trên điện thoại | Đã làm 07/11/2026: ô bàn cờ 26–29px → 30px ở 360px, 33px ở 390px (bỏ đệm khung và bàn trên điện thoại, `--kl-gutter`); banner không tranh bỏ chiều cao tối thiểu và ẩn câu mô tả dưới 640px nên bàn cờ lên đầu màn. **Ô vẫn dưới 44px** vì 10 cột không thể đạt 44 ở 360px; giảm thiểu bằng cơ chế chạm một lần để xem trước khối rồi chạm lại để xóa. Muốn đạt 44px cần đổi số cột (ngoài phạm vi UI, phải theo GDD) |
| 5. Dọn màu viết tay | Đã làm 07/11/2026: 25 file chuyển sang token (thêm `stat-*`, `frame-gold-hi`, `paper-deep`); không còn `bg-amber-*`, `text-rose-*` hay `#hex` trong className ở `src/app/game` và `src/components` (trừ nút Google/GitHub). Thêm test `tests/game/ui-tokens.test.ts` chặn màu thô mới. Còn lại ngoài phạm vi: màu dữ liệu trong SVG bản đồ, `var(--bk-*)` của Doanh Trại và `var(--atlas-*)` của Bình Loạn (cùng giá trị token chung, thay dần) |
| 6. Đo sau đăng nhập và kiểm tra tự động | Đã làm 07/11/2026. Script `scripts/ui-audit.mjs` (`--register` tự đăng ký tài khoản tạm trên bản dev) đo 17 màn × 4 cỡ gồm các màn trước đó bị khóa: **0 tràn ngang, 0 lỗi JS ở mọi màn**. Sửa tiếp: `text-xs` (12px) và `text-[9\|10\|12px]` → `text-caption` ở 41 file (chữ dưới 13px từ 25–76 điểm mỗi màn xuống 0–7, phần còn lại là huy hiệu phủ lên biểu tượng theo ngoại lệ); thanh trượt Trận Đồ và ô gập "Đổi mật khẩu" ở Tài khoản đạt 44px trên cảm ứng. Thêm test chặn chữ nhỏ vào `tests/game/ui-tokens.test.ts` |

## Đo với dữ liệu giả nhiều (07/11/2026)

`scripts/ui-audit.mjs --mock <file.json>` chặn các lời gọi API ở trình duyệt và trả hồ sơ đầy đủ (74 tướng, kho 200 món, thành tựu, chiến dịch xong), bảng xếp hạng 50 dòng, đấu trường, nhật lệnh, công trạng 40 dòng; không đụng tới server hay cơ sở dữ liệu. Kết quả ở 360px, trước và sau khi sửa:

| Màn | Cao trước | Cao sau | Cách sửa |
| --- | --- | --- | --- |
| Doanh Trại (Tướng sĩ) | 7802px | 2809px | Hiện dần 24 tướng mỗi đợt, nút "Hiện thêm tướng"; tướng đang chọn luôn nằm trong phần đã hiện |
| Tháp Thí Luyện | 6596px | 2613px | Chọn 2 tướng kèm cắt trang 12 (`usePagedItems`) |
| Tháp Thiên Mệnh | 7383px | 1908px | Chọn đội cắt trang 12; bảng xếp hạng hiện 10 dòng đầu |
| Công Trạng | 4024px | 1552px | Danh sách các mùa trước hiện 10 dòng đầu, nút "Xem thêm"; dòng lịch sử không còn vỡ chữ |
| Trấn Ải, Quần Hùng | 3042 / 3852px | 2688 / 3498px | Bảng xếp hạng mùa hiện 10 dòng đầu |

Cả bốn cỡ: 0 tràn ngang, 0 lỗi JS. Nhãn `text-kicker` lên 13px (trước 12px) và bỏ `text-[0.65rem]` ở bảng kỹ năng; test `ui-tokens` chặn thêm cỡ chữ `rem` nhỏ. Dữ liệu giả cho bảng Nhật Lệnh dùng 50 dòng trong khi server chỉ trả 20, nên số đo Nhật Lệnh (3399px) cao hơn thực tế.

### Luồng thao tác thật trên dữ liệu giả (07/11/2026)

Dựng dữ liệu bằng `pnpm tsx scripts/ui-mock-data.ts mock.json`, rồi nhấp chuột như người chơi ở 390px (cảm ứng) bằng Playwright; các lời gọi ghi (bắt đầu tầng, bắt đầu lượt leo) bị chặn để xem đúng nội dung gửi đi. 20/20 bước đạt, 0 lỗi JS:

- **Tháp Thiên Mệnh:** bỏ chọn 2 tướng ở trang 1, sang trang 3 rồi quay lại: lựa chọn và bộ đếm "Bắt đầu với N tướng" giữ nguyên; payload `rosterIds` gửi đi đúng 73 tướng (cả các trang không đang hiển thị).
- **Tháp Thí Luyện:** đội mặc định đã đủ 2 tướng nên các tướng khác bị khóa (đúng luật); bỏ chọn ở mọi trang rồi chọn 2 tướng ở 2 trang khác nhau: tiêu đề báo "đã chọn 2/2", payload `companions` có đúng 2 tướng.
- **Doanh Trại:** mặc định 24 thẻ, "Hiện thêm tướng" lên 48; chọn tướng ở đợt sau mở đúng chi tiết; quay lại danh sách vẫn giữ 48 thẻ; bộ lọc theo hệ giảm xuống 11.
- **Công Trạng:** "Xem thêm" mở từ 10 lên 40 dòng, nút đổi thành "Thu gọn" (`aria-expanded`), bấm lại về 10 dòng.

Giới hạn: chưa chạy luồng tới hết trận (server thật cần dữ liệu hợp lệ) và chưa thử bàn phím/trình đọc màn hình ở các danh sách mới.

## Còn lại sau đợt này

- **Cứ điểm trên bản đồ Bình Loạn** (10 điểm ở 360px, rộng 31–63px × cao 36–49px): đã có danh sách cứ điểm dưới bản đồ cho màn dưới 1024px (nút cao 44px). Ngày 07/11/2026 hoàn thiện: mở sẵn, tên hiện đủ dòng, cứ điểm của chương đang xem lên đầu, chấm đỏ cho cứ điểm có nhiệm vụ đang mở. Lá cờ trên bản đồ vẫn nhỏ nhưng không còn là cách chọn duy nhất.
- **Ô bàn cờ Khai Lộ** 30–33px (xem mục 4).
- Số đo "chữ dưới 13px" ở Thao Luyện (12 điểm) là số phím và chi phí NL phủ trên icon kỹ năng, thuộc ngoại lệ.
- Các màn sau đăng nhập mới được đo với **hồ sơ mới trống**; trạng thái có nhiều dữ liệu (bảng xếp hạng dài, nhiều thành tựu đã nhận) chưa đo.

### Doanh Trại vào khung card chung (07/11/2026)

| Việc | Trạng thái |
| --- | --- |
| Thanh tab và nội dung ba tab (Tướng sĩ, Đội hình, Kho đồ) trước đây nằm rời, không có khung bao. Nay gói trong một `OrnateFrame level="raised"` như Cửa hàng và Nhiệm vụ; các khung con (`barracks-panel`) đổi sang kiểu ô lõm của `.ui-frame-inset` để không lồng hai lớp khung. Chiều cao danh sách tướng trừ thêm phần đệm của khung. Chụp 1440, 1024, 360px ba tab: không tràn ngang, không lỗi | Đã làm |
| Doanh Trại trên điện thoại: nút "Đăng nhập", "Cửa hàng" và số vàng nằm trên ba dòng (hai dòng khi đã đăng nhập). Nay gom một dòng: nhãn đăng nhập rút còn "Đăng nhập" ở màn nhỏ (đủ nhãn từ 640px, `aria-label` vẫn đủ), đệm nút và khung bao giảm ở màn nhỏ; Cửa hàng và số vàng đi liền một nhóm nên không tách dòng. Đo 360, 390, 412, 600px: một dòng; 320px (dưới mức tối thiểu) nút đăng nhập xuống dòng riêng | Đã làm |
| Doanh Trại: ẩn viên vàng ở màn nhỏ (dưới 640px) vì header chung đã hiện số vàng; từ 640px trở lên vẫn hiện cạnh nút Cửa hàng. Ở màn nhỏ còn nút "Đăng nhập" và "Cửa hàng" cùng một dòng, không tràn ngang | Đã làm |
