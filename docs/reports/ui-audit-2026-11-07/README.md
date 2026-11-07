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

Khách chưa đăng nhập chỉ thấy **màn khóa đăng nhập** ở Nhật Lệnh, Trấn Ải, Quần Hùng, Xếp hạng, Tháp Thiên Mệnh, Tầm Tướng Ký, và Doanh Trại chỉ có danh sách 6 tướng khởi đầu. Trang của các màn này cao đúng bằng cửa sổ (844px) vì chỉ có khung khóa. **Trạng thái bên trong sau khi đăng nhập chưa được đo.** Cần một tài khoản kiểm thử có dữ liệu (hoặc hồ sơ giả) để đo tiếp trước khi nghiệm thu các màn này.

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
| 6 | Chưa làm (đo lại sau đăng nhập, kiểm tra tự động tràn ngang và vùng chạm) |
