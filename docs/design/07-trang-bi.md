# Trang bị

> Cập nhật: 18/10/2026

## 1. Chín ô trang bị

Mỗi nhân vật (nhân vật chính và nhân vật kèm) có **9 ô trang bị**.

| # | Ô | Chỉ số chính | Giới hạn |
|---|---|---|---|
| 1 | **Vũ khí** | +ATK | Theo nghề (đao kiếm, pháp trượng, hồ lô…) |
| 2 | **Đính mão** (mũ) | +Máu | Dùng chung mọi nghề |
| 3 | **Y phục** (áo) | +DEF | Dùng chung mọi nghề |
| 4 | **Hộ thủ** (găng tay) | +ATK | Dùng chung mọi nghề |
| 5 | **Bảo ngoa** (giày) | +DEF | Dùng chung mọi nghề |
| 6 | **Giới chỉ** (nhẫn) | +ATK | Dùng chung mọi nghề |
| 7 | **Hạng liên** (dây chuyền) | +Máu | Dùng chung mọi nghề |
| 8 | **Hộ phù** (bùa hộ mệnh) | +DEF | Dùng chung mọi nghề |
| 9 | **Ngọc bội** | +Máu | Dùng chung mọi nghề |

- Mỗi chỉ số chính có đúng 3 ô.

> TODO: có thêm chỉ số phụ (năng lượng khởi đầu, hồi máu…) cho trang sức hay không.

## 2. Nguyên tố của trang bị

- Mỗi trang bị có một nguyên tố. Hệ số chỉ số so với nguyên tố của nhân vật theo [Nguyên tố](05-nguyen-to.md#3-hệ-số-trang-bị-so-với-nguyên-tố-của-nhân-vật).
- Nhân vật chính đổi nguyên tố trước trận thì hệ số trang bị được tính lại theo nguyên tố mới.
- **Vũ khí của nhân vật chính:** giữ riêng một vũ khí đã trang bị cho mỗi nghề. Đổi nghề trước trận thì vũ khí của nghề đó tự mặc vào; nghề chưa có vũ khí thì ô vũ khí để trống.

## 3. Thưởng bộ & cộng hưởng nguyên tố

Có hai mốc thưởng: **6 món** và **9 món**. Mốc 9 món cộng thêm vào mốc 6 món.

| Loại thưởng | Điều kiện | Mốc 6 món | Mốc 9 món |
|---|---|---|---|
| **Thưởng bộ** | Các món cùng thuộc một bộ | Hiệu ứng bộ cấp 1 | Thêm hiệu ứng bộ cấp 2 |
| **Cộng hưởng nguyên tố** | Các món cùng một nguyên tố | Cộng hưởng cấp 1 | Thêm cộng hưởng cấp 2 |

- Nguyên tố của trang bị **không cần** trùng nguyên tố nhân vật.
- Thưởng bộ và cộng hưởng nguyên tố cộng dồn được nếu cùng thỏa.
- Vì nhân vật chính đổi được nguyên tố, cộng hưởng nguyên tố cho phép giữ một bộ đồ cố định mà vẫn có lợi.

> TODO: danh sách bộ trang bị; giá trị thưởng bộ và cộng hưởng của từng nguyên tố ở mốc 6 và 9 món.

## 4. Phẩm theo màu

Mỗi trang bị có một **phẩm**, hiển thị bằng màu khung và tên. Có 5 bậc:

| Bậc | Màu | Tên | Hệ số chỉ số |
|---|---|---|---|
| 1 | ⚪ Trắng | Phàm phẩm | ×1 |
| 2 | 🟢 Lục | Lương phẩm | ×1.3 |
| 3 | 🔵 Lam | Tinh phẩm | ×1.7 |
| 4 | 🟣 Tím | Bảo phẩm | ×2.2 |
| 5 | 🟠 Cam | Thần phẩm | ×3 |

- Hệ số phẩm nhân với chỉ số gốc của món, trước khi nhân hệ số nguyên tố ([Nguyên tố](05-nguyen-to.md#3-hệ-số-trang-bị-so-với-nguyên-tố-của-nhân-vật)).
- Phẩm chỉ áp cho trang bị. Nhân vật vẫn **không có độ hiếm**.

## 5. Ghép nâng bậc

- Ghép **3 món cùng bậc** thành **1 món bậc kế tiếp**. Bậc Cam là bậc cao nhất, không ghép tiếp.
- Ba món phải **cùng nguyên tố (cùng hệ)**. **Không được ghép trang bị khác hệ.**
- Ba món phải **cùng loại ô** (ví dụ ba Đính mão). Vũ khí còn phải **cùng nghề**.
- Món nhận được giữ loại ô và nguyên tố đó. Bộ trang bị của món mới lấy theo món người chơi chọn làm món chính.
- Trang bị đang mặc được dùng làm nguyên liệu; ô đó trở thành trống sau khi ghép.
- Server thực hiện ghép trong một transaction ([Hạ tầng](../tech/ha-tang.md#3-database)).

- Ghép **luôn thành công**, không có tỉ lệ thất bại.

> TODO: phí vàng cho mỗi lần ghép.

## 6. Nguồn trang bị

- Rơi ngẫu nhiên sau trận (server quyết định); trận càng khó thì tỉ lệ rơi phẩm cao càng lớn.
- Cửa hàng bán món cố định, giá cao.

> TODO: bảng rơi đồ theo phẩm và danh sách trang bị.
