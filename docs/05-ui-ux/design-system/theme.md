# Theme Cờ Lau

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
| Khung | 3 mức: panel, raised (vạch vàng trong + góc hoa văn), hero (banner có tranh). Không lồng mức 2/3 trong mức 2/3 | `OrnateFrame level`, `FrameInset` |
| Nút chính | Sơn mài đỏ viền vàng; mỗi màn tối đa một | `Button` (mặc định `primary`) |
| Nút phụ | Gỗ sẫm viền đồng; nút chữ màu vàng cho thao tác nhỏ | `Button variant="secondary" \| "ghost"` |
| Áp dụng ở sảnh trận | Sảnh Giao Tranh/Thao Luyện: khung và hàng chọn là gỗ tối; chip đang chọn và khối luật chi tiết (Bộ 6 chủ động, bị động) là giấy dó chữ mực. Màu 7 hệ chỉ ở icon hệ, không viền phát sáng quanh ô chọn | `SetupLobby`, `SkillDetails paper` |
| Bề rộng và lề | Mọi màn chế độ cùng một cột nội dung thích ứng (`MODE_CONTENT_WIDTH`): 1280px dưới 1536px, 1440px từ 1536px (`2xl`), 1680px từ 1800px (`3xl`); màn nào cũng cùng lề ở mọi cỡ màn hình, lề 16px điện thoại / 24px máy tính, nền `.ui-mode-screen`. Không tự đặt `max-w-[…px]`, `px-*` hay nền `#hex`/`demo-bg` ở màn mới; prop `wide` của `ModeScreen` đã bỏ tác dụng (06/11/2026). Bàn cờ trong trận không nở theo (tối đa 46rem, 56rem ở `3xl`) để vừa chiều cao màn hình | `ModeScreen`, `.ui-mode-screen` |
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

Không tự khai màu nút, tab, khung trong component màn; không thêm `bg-amber-*`, `bg-stone-*`, `#hex` mới. Token `--atlas-*` (Bình Loạn) đã gộp vào token chung (07/11/2026); còn `--bk-*` (Doanh Trại) cùng giá trị với token chung và sẽ được thay dần.

## Component dùng chung

```tsx
import {
  Button, Card, CardHeader, CardTitle, CardDescription,
  CardBody, CardFooter, FormField, Input,
} from "@/components/ui";

<Card padding="none" variant="elevated">
  <CardHeader>
    <CardTitle>Thông tin tài khoản</CardTitle>
    <CardDescription>Cập nhật tên hiển thị</CardDescription>
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
| `CardHeader`, `CardBody`, `CardFooter` | Composition với padding và đường ngăn thống nhất; `CardContent` là alias của CardBody |
| `CardTitle`, `CardDescription` | Tiêu đề h2 và mô tả theo token |
| `Button` | `variant`: primary (sơn mài)/secondary (gỗ viền đồng)/outline/ghost/danger/link, `ornate` là tên cũ của primary; `size`: sm/md/lg/icon; `fullWidth` |
| `Tabs`, `ChoiceChip`, `choiceVariants()` | Lựa chọn: `role=tab` + `aria-selected`, chip `aria-pressed`; mũi tên/Home/End chuyển tab |
| `OrnateFrame`, `FrameInset`, `FrameCorners` | `@/components/game-ui`; `level`: panel/raised/hero, `paper` |
| `ModeScreen`, `ModeBanner`, `SectionTitle` | `@/components/game-ui`; khung màn chế độ |
| `buttonVariants()` | Dùng cùng style với Link, SceneLink, a; `buttonClassName()` là alias tương thích |
| `Input`, `Select`, `Textarea` | Thuộc tính native, ref, sự kiện, validation, disabled và aria-invalid |
| `FormField` | Label bao quanh control, hint tùy chọn |
| `Alert` | error/warning/success/info; role alert cho lỗi, status cho thông báo |
| `Badge` | default/muted/success/warning/danger |
| `Divider` | Đường ngăn có chữ ở giữa |
| `Pagination`, `usePagedItems`, `PageControls` | Import riêng từ `@/components/ui/Pagination`. `Pagination` cho API cursor (busy, nhãn, className); `usePagedItems(items, pageSize)` + `PageControls` cắt trang danh sách có sẵn ở client, hiện "Trang x/y", ẩn khi chỉ một trang |

`Button` mặc định `type="button"`; nút gửi form phải đặt `type="submit"`. Dùng link thật khi điều hướng; không bọc link bên trong button. `Pagination` nhận hasPrevious/hasNext/onPrevious/onNext; logic cursor và truy vấn nằm ở màn gọi. Danh sách dài (thẻ bán, túi đồ, lưới tướng) cắt trang bằng `usePagedItems` thay vì bắt người chơi cuộn; đặt `key` theo bộ lọc để về trang đầu khi đổi lọc.

Component không có hook dùng được ở cả server và client. Pagination có client boundary riêng, không đưa toàn bộ UI vào client bundle. ClassName được merge theo nhóm utility: ví dụ `CardBody className="p-6"` thay p-4 mặc định, `Button className="text-sm"` thay cỡ chữ mặc định nhưng giữ màu chữ. Các utility typography riêng của Cờ Lau được khai báo trong cấu hình merge để không bị nhầm với màu chữ.

## Áp dụng

Các màn tài khoản, hồ sơ, chiến dịch, cửa hàng/trang bị, nhiệm vụ, thử thách ngày, sinh tồn, đấu trường, tháp và bảng xếp hạng đã dùng UI chung. AuthCard và bảng xếp hạng dùng card composition. Các màn có nền radial dùng `ui-screen` hoặc `ui-screen ui-screen--cool` để thống nhất bố cục và màu nền.

Khi thêm màn mới, ưu tiên token và component này trước khi tạo style riêng. Chỉ tách component theo nghiệp vụ khi có dữ liệu/hành vi riêng; không đưa logic game vào primitive UI.
