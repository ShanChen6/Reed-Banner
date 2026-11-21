# Theme Cờ Lau

> Trạng thái: **IMPLEMENTED**

Tham khảo cách tổ chức của [ShanVerse](https://github.com/ShanChen6/shanverse): bảng màu → token ngữ nghĩa → typography/base → component với variants. Reed Banner dùng **một theme Cờ Lau duy nhất**. Không thêm theme provider, bộ chọn dark/light hay font của ShanVerse.

## Cấu trúc

`src/app/globals.css` import các lớp theo thứ tự:

| File | Trách nhiệm |
| --- | --- |
| `src/styles/color.css` | Bảng màu gốc: mực, gỗ, đồng, vàng, sơn mài, giấy dó |
| `src/styles/theme.css` | Token theo vai trò: background, surface, primary, foreground, border, ring, trạng thái; bo góc và shadow |
| `src/styles/typography.css` | Một font family, cỡ chữ responsive, chiều cao dòng và tracking |
| `src/styles/base.css` | Quy tắc nền, chữ, focus, selection dùng toàn ứng dụng |
| `src/styles/components.css` | Hành vi control, trang trí nút sơn mài, nền màn chơi |
| `src/components/ui/` | Component nhỏ, mỗi loại một file; `index.ts` export API chung |
| `src/components/game-ui/` | Khung game dùng chung: khung 3 mức, góc hoa văn, khung màn và banner chế độ |
| `src/lib/cn.ts` | Ghép class bằng clsx và tailwind-merge; class của nơi gọi được ưu tiên |

Nguồn tham khảo: [semantic tokens](https://github.com/ShanChen6/shanverse/blob/main/src/styles/theme.css), [card composition](https://github.com/ShanChen6/shanverse/blob/main/src/components/ui/card.tsx), [button variants](https://github.com/ShanChen6/shanverse/blob/main/src/components/ui/button.tsx), [cn](https://github.com/ShanChen6/shanverse/blob/main/src/lib/cn.ts).

## Font và token

Dùng **Noto Serif** cho toàn bộ giao diện, phù hợp phong cách sử ký của Cờ Lau. Font variable lưu tại `src/app/fonts/NotoSerif.ttf`, tải qua `next/font/local` một lần ở root layout, hỗ trợ đầy đủ ký tự tiếng Việt và kèm giấy phép OFL. Tiêu đề/nội dung phân biệt bằng cỡ chữ và độ đậm. Các alias `font-sans`, `font-serif`, `font-heading`, `font-mono` đều trỏ tới cùng `--font-game`, giữ tương thích với giao diện cũ; không tải thêm family nào.

- Tiêu đề section: `text-heading`; tiêu đề lớn: `text-display`; chú thích: `text-caption`.
- Nội dung và tiêu đề dùng khoảng cách chữ tự nhiên. Nhãn viết hoa dùng tracking 0.02–0.06em. Tránh tracking tùy ý trên tiêu đề tiếng Việt.
- Nền: `bg-background`, `bg-surface`, `bg-surface-elevated`, `bg-surface-hover`, `bg-surface-selected`.
- Chữ: `text-foreground`, `text-foreground-secondary`, `text-muted`.
- Thao tác: `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`, `border-border`, `outline-ring`.
- Trạng thái: success, warning, danger, info có token chữ và nền riêng.
- Bo góc và bóng: `rounded-control`, `rounded-card`, `shadow-card`, `shadow-card-inset`.

Chỉnh nhận diện chung tại `theme.css`; không khai báo mã màu tại component UI. Màu hệ nguyên tố, độ hiếm, bản đồ và hiệu ứng trận đấu vẫn là bảng màu chuyên biệt. Các biến cũ `--bg`, `--panel`, `--fg`, `--gold`, `--frame`, `--cell` là alias cho phần giao diện cũ. Tùy chọn hiển thị riêng có sẵn của màn chiến đấu được giữ nguyên; hệ thống này không thêm cơ chế đổi theme.

## Quy tắc chung (đồng bộ UI 05/11/2026)

Shan duyệt 05/11/2026 sau đợt kiểm kê 20 màn. Chuẩn lấy từ Chiến trường (Home V2) và Doanh Trại. Màn mới và màn được chuyển đổi dùng đúng các quy tắc này; màn cũ chuyển dần theo [lộ trình](../implementation/roadmap.md#4-đồng-bộ-ui-toàn-game-05112026).

| Phần | Quy tắc | Dùng |
| --- | --- | --- |
| Bề mặt | Gỗ tối là mặc định (chữ sáng). Giấy dó chỉ cho nội dung đọc dài (Bình Loạn, sử ký, luật chi tiết, thoại) và trạng thái đang chọn | `--wood*`, `--paper*`, `--ink*`; lớp Tailwind `bg-wood-panel`, `text-on-wood`, `text-ink` |
| Thư cuộn | Khối liên hệ footer và form tài khoản (đăng nhập, đăng ký, tài khoản, quên/đặt lại mật khẩu) là thư cuộn treo: dây son, trục gỗ đầu đồng, giấy dó mép rách, tua rua, ấn "Cờ Lau" (08/11/2026). Component đặt trên giấy bọc trong `.ui-on-paper` để đổi token sang chữ mực | `ParchmentScroll`, `ScrollSeal`, `.ui-on-paper` |
| Khung | 3 lớp (Shan chốt phương án B, 20/11/2026, thay phương án A cùng ngày): **khung ngoài** (khung màn `ModeScreen card`, banner `hero`, màn đứng riêng) có góc hoa văn và vạch vàng trong; **card lớn** là mọi khung `.ui-frame` đứng ngang hàng trong khung màn, cũng có vạch vàng trong và bốn góc hoa văn (CSS tự vẽ ở `::before`, không cần `level="raised"`); **ô lõm** bên trong card (danh sách, ô số liệu, bộ lọc) nền sẫm, không bóng, không góc. Khung lồng trong khung khác tự phẳng; ghi chú, thông báo một dòng thêm `.ui-frame--plain` để phẳng. Màn thông tin (Nhiệm vụ, Công Trạng, Ban Thưởng, 21/11/2026) cũng dùng `ModeScreen card` kèm `ModeBanner` để card lớn có góc như màn chế độ; khối "Thưởng hạng chờ nhận" là card lớn, mỗi kỳ chờ nhận là một ô lõm | `OrnateFrame level`, `FrameInset`, `FilterBar`, `.ui-frame--plain` |
| Bộ lọc | Tìm tên, lọc hệ, nghề… bọc trong một ô lõm `FilterBar`, đặt trên danh sách nó lọc | `FilterBar` |
| Hai cột | Hai cột cạnh nhau phải bằng đáy: cột ngắn đặt `ColumnFill` cuối cột (tranh/thơ lấp chỗ trống; chỗ trống dưới 5rem thì khung trên giãn tới đáy). Không `self-start` cho khung trong cột | `ColumnFill` |
| Nút chính | Sơn mài đỏ viền vàng; mỗi màn tối đa một | `Button` (mặc định `primary`) |
| Nút phụ | Gỗ sẫm viền đồng; nút chữ màu vàng cho thao tác nhỏ | `Button variant="secondary" \| "ghost"` |
| Áp dụng ở sảnh trận | Sảnh Giao Tranh/Thao Luyện (bố cục 19/11/2026: banner theo hệ, thẻ Thế trận, cột Chủ tướng và thẻ Ra trận dính bên phải): khung và hàng chọn là gỗ tối; chip đang chọn và khối luật chi tiết (Bộ 6 chủ động, bị động) là giấy dó chữ mực. Màu 7 hệ chỉ ở icon hệ, không viền phát sáng quanh ô chọn | `SetupLobby`, `SkillDetails paper` |
| Bề rộng và lề | Mọi màn chế độ cùng một cột nội dung thích ứng (`MODE_CONTENT_WIDTH`): 1280px dưới 1536px, 1440px từ 1536px (`2xl`), 1680px từ 1800px (`3xl`); màn nào cũng cùng lề ở mọi cỡ màn hình, lề 16px điện thoại / 24px máy tính, nền `.ui-mode-screen`. Không tự đặt `max-w-[…px]`, `px-*` hay nền `#hex`/`demo-bg` ở màn mới; prop `wide` của `ModeScreen` đã bỏ tác dụng (06/11/2026). Bàn cờ trong trận không nở theo (tối đa 46rem, 56rem ở `3xl`) để vừa chiều cao màn hình | `ModeScreen`, `.ui-mode-screen` |
| Cột cao bằng nhau | Màn chia cột trên máy tính (Nhật Lệnh, Quần Hùng, Tháp Thiên Mệnh, Trấn Ải, Tháp Thí Luyện, Nhiệm vụ, Khai Lộ từ 1280px; Hợp Kích xếp một cột từ 21/11/2026: chọn tướng trên, liên kết dưới): cột không `self-start`, cột ngắn kết thúc bằng `ColumnFill` giãn hết chỗ trống để hai cột cao bằng nhau (Shan chọn 20/11/2026). Chế độ có tranh lấp cột (`public/art/column-fill/<chế độ>.webp`, khai `art` trong `src/app/game/columnFill.ts`) hiện tranh kèm thơ; chưa có tranh thì hiện mẹo chơi và thơ phiên âm. Chỗ trống dưới 11rem bỏ thơ, dưới 5rem ẩn thẻ. Điện thoại xếp một cột nên không hiện | `ColumnFill` |
| Màu viết tay | Cấm `bg-amber-*`, `text-rose-*`, `bg-[#hex]`… trong `src/app/game` và `src/components` (test `tests/game/ui-tokens.test.ts` chặn). Dùng token: lỗi `danger`/`danger-surface`, thành công `success`, thông tin `info`, cảnh báo `warning`, nền chữ `on-wood`/`title-on-wood`, nút vàng `bg-primary text-primary-foreground`. Chỉ số trong trận có token riêng `stat-hp` (máu), `stat-energy` (năng lượng), `stat-spirit` (tinh thần), `stat-rage` (nộ), `stat-shield` (khiên). Ngoại lệ: nút Google/GitHub theo thương hiệu, màu dữ liệu trên bản đồ/SVG (`WorldMap`, `ExpeditionScreen`) | `theme.css` |
| Mốc màn hình | Nhỏ nhất **360px** (chốt 07/11/2026); kiểm tra ở 360, 390, 768, 1024, 1280, 1536, 1800+. Không tràn ngang ở mọi mốc | Kiểm kê: [báo cáo](../../reports/ui-audit-2026-11-07/README.md) |
| Vùng chạm | Tối thiểu 44×44px trên màn cảm ứng bằng `pointer-coarse:min-h-11` (máy tính giữ gọn, `Button sm` 32px). Dùng `Button`, `ChoiceChip`, `Input` thay vì tự đặt `min-h-*`; liên kết chữ trong câu thêm `ui-link` (mở vùng chạm bằng `::after`); `summary` thêm `pointer-coarse:py-3.5` | `button.tsx`, `choice.tsx`, `input.tsx`, `.ui-link` |
| Cỡ chữ (chốt 07/11/2026) | (1) Chữ đọc và điều khiển ≥ 13px (`text-caption`); nội dung 15–16px. (2) Số liệu trong trận không đủ chỗ ở 360px thì **bớt nhãn hoặc xếp lại**, không giảm cỡ chữ dưới 13px. (3) Ngoại lệ duy nhất: chữ phủ lên biểu tượng (số phím, chi phí NL, cấp trên chân dung, huy hiệu) tối thiểu 11px và không được là nguồn thông tin duy nhất (phải có ở tooltip hoặc `aria-label`). (4) Không thêm mới `text-[9|10|11px]` ngoài ngoại lệ (3) | `text-caption`, `text-kicker` |
| Lựa chọn | Tab, chip, độ khó, ô chọn: chưa chọn gỗ viền đồng, đang chọn giấy dó chữ mực | `Tabs`, `ChoiceChip`, `choiceVariants()` |
| Màu có nghĩa | Vàng = tiền, phần thưởng; đỏ = hành động, máu; ngọc lục `--jade` = xong, đủ điều kiện; tro `--ash` = khóa. Màu 7 hệ chỉ dùng cho hệ | Không dùng xanh lá, tím, cam tùy màn |
| Chữ | Noto Serif; `text-heading` / `text-title` (20px) / nội dung 15–16px / `text-caption` (13px, nhỏ nhất); nhãn viết hoa `text-kicker` | Không dùng chữ 10–12px |
| Khoảng cách | Thang 4/8/12/16/24/32px; lề 16px điện thoại, 24px máy tính; bề rộng nội dung thích ứng 1280 → 1440 → 1680px (xem dòng "Bề rộng và lề") | `ModeScreen` |
| Biểu tượng | Icon vẽ tay cho nội dung game; Lucide chỉ cho tiện ích (tìm, lọc, đóng, mũi tên); không emoji | `src/app/game/art/` |
| Tương tác | Vòng focus vàng 2px, vùng chạm tối thiểu 44px, hover sáng nhẹ, bấm lún 1px | `.ui-mode-screen`, `.ui-button` |

Khung màn chế độ: `ModeScreen` bọc cả màn, `ModeBanner` là banner tranh (nhãn nhỏ, một câu mô tả, số liệu; tên chế độ mặc định chỉ cho trình đọc màn hình vì header đã hiện), `SectionTitle` cho tiêu đề khối, `.ui-action-bar` cho nút chính dính đáy trên điện thoại. Trang `/demo/ui` hiển thị mọi thành phần.

Không tự khai màu nút, tab, khung trong component màn; không thêm `bg-amber-*`, `bg-stone-*`, `#hex` mới. Các token riêng từng màn (`--atlas-*` Bình Loạn, `--bk-*` Doanh Trại, `--hdr-*` header) và các bí danh cũ (`--bg`, `--panel`, `--fg`, `--gold`, `--frame`, `--cell`) đã gộp hết vào token chung (07/11/2026); màn mới không được khai token riêng, chỉ thêm vào `theme.css` khi cần màu mới. CSS không viết mã `#hex` (test `ui-tokens` chặn): màu có độ trong suốt viết `color-mix(in srgb, var(--token) 40%, transparent)`; màu hiệu ứng/minh họa chưa có vai nằm ở nhóm `--tone-*`, `--black`, `--white` trong `theme.css`. **Ngoại lệ có chủ đích: mã màu của tranh vẽ bằng mã (`src/app/game/art/*.tsx` và các SVG minh họa như biểu tượng xu ở header, ornament, quân cờ Trận Đồ, bản đồ viễn chinh, thành và cờ trên bản đồ Bình Loạn) giữ nguyên hex, không gộp vào token** để màu tranh không bị lệch (Shan chốt 07/11/2026); chỉ màu giao diện (chữ, nền, viền, bóng đổ) dùng token.

## Điện thoại (chốt 21/11/2026)

Shan duyệt sau đợt chụp 31 màn ở 390×844, 360×740 và 844×390 (ảnh ở thư mục dự án `demo/mobile-audit/`). Điện thoại là dưới 640px (`sm`); **màn ngang khi chơi** là chiều cao dưới 500px kèm hướng ngang (`@media (orientation: landscape) and (max-height: 499px)`, biến thể Tailwind `landscape-short:`). Phong cách giữ nguyên (card lớn góc hoa văn, ô con phẳng); chỉ đổi bố cục và độ dày khung. Máy tính không đổi. Các dòng ghi "lộ trình" chưa có code, làm theo thứ tự ở cột cuối.

| Quy tắc | Nội dung | Lộ trình |
| --- | --- | --- |
| Một lớp khung có góc | Trên điện thoại khung màn `ModeScreen card` bỏ viền ngoài và đệm, chỉ còn lề trang 12px; card lớn giữ góc hoa văn, đệm 14px; ô lõm đệm 10px. Nội dung rộng từ 340px trên màn 390px | Đã làm (`.ui-mode-card` trong `components.css`, `OrnateFrame` đệm `p-3.5 sm:p-5`) |
| Nút chính trong tầm ngón cái | Nút hành động của màn (Xuất quân, Vào trận, Mở lượt mới, Hợp Nguyên) nằm trong `.ui-action-bar` dính đáy, kèm một dòng tóm tắt lựa chọn. Một màn tối đa một thanh dính đáy | PR nền tảng, áp ở từng màn |
| Chơi trước, đọc sau | Shan chọn 5B: trên điện thoại bỏ tab Hướng dẫn, thay bằng nút "?" trên thanh tab mở `BottomSheet` hướng dẫn; lần đầu vào chế độ tự mở bảng này một lần (nhớ bằng localStorage). Phần "Bàn phím: …" trong Hướng dẫn ẩn khi `pointer: coarse`. Máy tính giữ tab Hướng dẫn | Đã làm ở `ModeGuideTabs`, Trận Đồ và Bình Loạn (`GuideSheetButton` cạnh bốn thẻ Sử ký, chữ thẻ thường thay vì in hoa trên điện thoại) |
| Tab một hàng | Thanh tab chế độ luôn một hàng, thiếu chỗ thì cuộn ngang; không lồng hai hàng tab, tab con đổi thành nút chuyển nhỏ trong card | Một hàng đã làm (`Tabs`); tab con chưa làm |
| Danh sách dài thu gọn | Card lặp (sa bàn, đối thủ, bậc thưởng) có dạng gọn một dòng 56–72px, ảnh nhỏ bên trái; bấm thì mở rộng. Chỉ mục đang chọn hiện ảnh lớn | Đã làm một phần: Ban Thưởng (`TierLadder collapsible`: chỉ bậc đang đứng, bậc chờ nhận và bậc kế, nút "Xem cả 6 bậc"), Viễn Chinh (sa bàn thành dải vuốt ngang, nút Xuất quân dính đáy bằng `.ui-action-bar`), Quần Hùng (thẻ đối thủ chỉ hàng chân dung). Chưa làm: Nhiệm vụ, chọn tướng Sử Lộ |
| Chọn từ danh sách lớn | Chọn tướng, nguyên liệu, đạo cụ mở `BottomSheet` cao 85% màn, lưới ảnh 4 cột, bộ lọc dính trên đầu; chọn xong đóng lại, kết quả hiện ngay cạnh ô vừa chọn | Đã làm ở Hợp Kích (bấm ô tướng mở bảng chọn, phần liên kết nằm ngay dưới ba ô) và Do Thám (chuẩn bị ván). Chưa làm: nguyên liệu Tầm Tướng Ký |
| Bàn cờ lấp ngang | Mọi bàn (trận, Khai Lộ, Do Thám, Sử Lộ, Trận Đồ) rộng bằng màn trừ lề 8px, khung bàn viền mỏng. Shan chọn 1A: bàn trận giữ 12×8 (ô 29px ở 390px, 27px ở 360px; khung ngoài màn trận phẳng bằng `.ui-frame--phone-flat`). Shan chọn 4A: bàn giải đố luôn vừa ngang, bàn dài hơn rộng (30×16) tự xoay khi màn dọc, ô dưới 24px thì cho chụm hai ngón để phóng to | Đã làm. Do Thám trên điện thoại bỏ mức ô tối thiểu 26px, bàn Khó 30×16 đổi hàng thành cột khi màn dọc (ô kề giữ nguyên nên số vẫn đúng; nhãn ô, mũi tên, Sấm báo hàng/cột theo bàn đang hiện), ô dưới 24px thì có nút +/− và chụm hai ngón (tối đa 250%). Khai Lộ, Sử Lộ, Trận Đồ vốn đã vừa ngang |
| Màn chơi vừa một màn hình | Màn trận và màn giải đố dùng `100dvh`, không cuộn trang khi đang chơi; ở 390×844 bàn cờ và hàng kỹ năng nằm trọn trong màn | Màn trận dọc đã làm (thẻ tướng một hàng chân dung + tên, kỹ năng biểu tượng trái tên phải, chữ trạng thái trùng thanh giờ chỉ còn cho trình đọc màn hình); màn giải đố chưa vừa một màn: Do Thám đưa phần chọn bậc và đạo cụ vào bảng trượt (nút "Nhập môn, 2 đạo cụ" trên hàng thao tác) nên sa bàn lên từ y≈970 còn y≈510 ở 390×844, vẫn cần cuộn qua banner |
| Màn trận ngang | Shan chọn 2A: bố cục riêng khi xoay ngang (biến thể Tailwind `landscape-short:`, lớp `.battle-live` trong `components.css`): ẩn header chung và sân khấu tướng (cả lúc hiện kết quả); thanh giờ, Đầu hàng, Đổi đội hình, độ khó chung một hàng trên cùng; bàn cờ giữa cao vừa màn (ô 29px ở 844×390); phe ta cột trái, đối thủ cột phải (thẻ mỏng: máu, NL, Nộ); 6 kỹ năng một dải dưới bàn cờ (biểu tượng trên, tên dưới) | Đã làm |
| Điều hướng | Shan chọn 3C: thanh tab dưới 5 mục (Chiến trường, Nhiệm vụ, Doanh Trại, Cửa Hàng, Thêm) và Chiến trường lưới 2 cột card nhỏ, chỉ Bình Loạn giữ card lớn. Thanh tab dưới ẩn trong màn trận và màn giải đố | Đã làm: `MobileTabBar` (chỉ hiện ở các màn trong `TAB_BAR_SCENES`), mục Thêm mở BottomSheet "Quân vụ" |
| Nút nổi tối đa một | Nút toàn màn hình vào header trên điện thoại; không nút nổi nào đè thanh dính đáy | Đã làm (mục trong `HeaderAccountMenu`) |
| Footer gọn | Thư cuộn và bảng liên kết chỉ ở Chiến trường; màn khác chỉ một dòng liên kết nhỏ | Đã làm (`GameFooter compact`) |
| Kiểm bằng test | `expectNoHorizontalOverflow` so với bề rộng máy (điện thoại tự nới `innerWidth` khi nội dung tràn nên so với `innerWidth` không bắt được); e2e `mobile`: ở 390×844 bàn cờ và hàng kỹ năng nằm trọn trong màn; ở 844×390 bàn cờ nằm trọn trong màn; nút chính mỗi chế độ trong màn đầu | Mỗi PR thêm phần kiểm của mình |

## Component dùng chung

```tsx
import {
  Button, Card, CardHeader, CardTitle,
  CardBody, CardFooter, FormField, Input,
} from "@/components/ui";

<Card padding="none" variant="elevated">
  <CardHeader>
    <CardTitle>Thông tin tài khoản</CardTitle>
  </CardHeader>
  <CardBody>
    <FormField label="Tên hiển thị">
      <Input name="name" required />
    </FormField>
  </CardBody>
  <CardFooter>
    <Button type="submit">Lưu</Button>
    <Button variant="outline">Hủy</Button>
  </CardFooter>
</Card>
```

| Component | API chính |
| --- | --- |
| `Card` | `as`: section/article/div; `variant`: default/elevated/inset; `padding`: default/none |
| `CardHeader`, `CardBody`, `CardFooter` | Composition với padding và đường ngăn thống nhất |
| `CardTitle` | Tiêu đề h2 theo token |
| `Button` | `variant`: primary (sơn mài)/secondary (gỗ viền đồng)/outline/ghost/danger/link, `ornate` là tên cũ của primary; `size`: sm/md/lg/icon; `fullWidth` |
| `Tabs`, `ChoiceChip`, `choiceVariants()` | Lựa chọn: `role=tab` + `aria-selected`, chip `aria-pressed`; mũi tên/Home/End chuyển tab |
| `OrnateFrame`, `FrameInset`, `FilterBar`, `FrameCorners` | `@/components/game-ui`; `level`: panel/raised/hero (trong khung màn, panel tự có góc như raised), `paper` |
| `ModeScreen`, `ModeBanner`, `SectionTitle` | `@/components/game-ui`; khung màn chế độ |
| `Skeleton`, `SkeletonText`, `ModeSkeleton`, `ModeLoading` | `@/components/game-ui`; khung xương khi tải (20/11/2026): không dùng dòng chữ "Đang tải…". Màn chế độ dùng `ModeSkeleton` (banner, dãy thẻ, khung); màn có footer dùng `ModeLoading` (cao ít nhất một màn hình để footer không nhảy, nhận `error`); bảng xếp hạng dùng `BoardLoading`. Luôn kèm nhãn cho trình đọc màn hình; giảm chuyển động thì đứng yên (`.ui-skeleton`) |
| `buttonVariants()` | Dùng cùng style với Link, SceneLink, a |
| `Input`, `Select` | Thuộc tính native, ref, sự kiện, validation, disabled và aria-invalid. `Select` là ô chọn duy nhất của game (20/11/2026): gỗ lõm viền đồng, mũi tên vàng; `uiSize="sm"` cho hàng lọc, `active` khi đang lọc khác mặc định (viền vàng). Chrome/Edge (`appearance: base-select`) vẽ cả bảng xổ xuống cùng kiểu gỗ, mục đang chọn là giấy dó chữ mực; trình duyệt khác giữ bảng của hệ điều hành. Không viết `<select>` thô |
| `FormField` | Label bao quanh control, hint tùy chọn |
| `Alert` | error/warning/success/info; role alert cho lỗi, status cho thông báo |
| `Badge` | default/muted/success/warning/danger |
| `Divider` | Đường ngăn có chữ ở giữa |
| `Pagination`, `usePagedItems`, `PageControls` | Import riêng từ `@/components/ui/Pagination`. `Pagination` cho API cursor (busy, nhãn, className); `usePagedItems(items, pageSize)` + `PageControls` cắt trang danh sách có sẵn ở client, hiện "Trang x/y", ẩn khi chỉ một trang. Trải `{...paged.listProps}` lên phần tử bọc danh sách để trang ít mục (trang cuối) giữ chiều cao trang đầy, nút phân trang và khối bên dưới không nhảy |

`Button` mặc định `type="button"`; nút gửi form phải đặt `type="submit"`. Dùng link thật khi điều hướng; không bọc link bên trong button. `Pagination` nhận hasPrevious/hasNext/onPrevious/onNext; logic cursor và truy vấn nằm ở màn gọi. Danh sách dài (thẻ bán, túi đồ, lưới tướng) cắt trang bằng `usePagedItems` thay vì bắt người chơi cuộn; đặt `key` theo bộ lọc để về trang đầu khi đổi lọc.

Component không có hook dùng được ở cả server và client. Pagination có client boundary riêng, không đưa toàn bộ UI vào client bundle. ClassName được merge theo nhóm utility: ví dụ `CardBody className="p-6"` thay p-4 mặc định, `Button className="text-sm"` thay cỡ chữ mặc định nhưng giữ màu chữ. Các utility typography riêng của Cờ Lau được khai báo trong cấu hình merge để không bị nhầm với màu chữ.

## Áp dụng

Các màn tài khoản, hồ sơ, chiến dịch, cửa hàng/trang bị, nhiệm vụ, thử thách ngày, sinh tồn, đấu trường, tháp và bảng xếp hạng đã dùng UI chung. AuthCard và bảng xếp hạng dùng card composition. Các màn có nền radial dùng `ui-screen` hoặc `ui-screen ui-screen--cool` để thống nhất bố cục và màu nền.

Khi thêm màn mới, ưu tiên token và component này trước khi tạo style riêng. Chỉ tách component theo nghiệp vụ khi có dữ liệu/hành vi riêng; không đưa logic game vào primitive UI.
