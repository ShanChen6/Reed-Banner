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
| `Button` | `variant`: primary/secondary/outline/ghost/danger/ornate/link; `size`: sm/md/lg/icon; `fullWidth` |
| `buttonVariants()` | Dùng cùng style với Link, SceneLink, a; `buttonClassName()` là alias tương thích |
| `Input`, `Select`, `Textarea` | Thuộc tính native, ref, sự kiện, validation, disabled và aria-invalid |
| `FormField` | Label bao quanh control, hint tùy chọn |
| `Alert` | error/warning/success/info; role alert cho lỗi, status cho thông báo |
| `Badge` | default/muted/success/warning/danger |
| `Divider` | Đường ngăn có chữ ở giữa |
| `Pagination` | Import riêng từ `@/components/ui/Pagination`; hỗ trợ API cursor, busy, nhãn và className |

`Button` mặc định `type="button"`; nút gửi form phải đặt `type="submit"`. Dùng link thật khi điều hướng; không bọc link bên trong button. `Pagination` nhận hasPrevious/hasNext/onPrevious/onNext; logic cursor và truy vấn nằm ở màn gọi.

Component không có hook dùng được ở cả server và client. Pagination có client boundary riêng, không đưa toàn bộ UI vào client bundle. ClassName được merge theo nhóm utility: ví dụ `CardBody className="p-6"` thay p-4 mặc định, `Button className="text-sm"` thay cỡ chữ mặc định nhưng giữ màu chữ. Các utility typography riêng của Cờ Lau được khai báo trong cấu hình merge để không bị nhầm với màu chữ.

## Áp dụng

Các màn tài khoản, hồ sơ, chiến dịch, cửa hàng/trang bị, nhiệm vụ, thử thách ngày, sinh tồn, đấu trường, tháp và bảng xếp hạng đã dùng UI chung. AuthCard và bảng xếp hạng dùng card composition. Các màn có nền radial dùng `ui-screen` hoặc `ui-screen ui-screen--cool` để thống nhất bố cục và màu nền.

Khi thêm màn mới, ưu tiên token và component này trước khi tạo style riêng. Chỉ tách component theo nghiệp vụ khi có dữ liệu/hành vi riêng; không đưa logic game vào primitive UI.
