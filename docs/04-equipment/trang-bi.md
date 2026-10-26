# Trang bị

> Cập nhật: 19/10/2026

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
- **Không có chỉ số phụ** (Shan chốt 19/10/2026): trang sức chỉ cộng chỉ số chính, không có năng lượng khởi đầu hay hồi máu.
- **Chỉ số gốc** của một món phẩm Trắng (điểm xuất phát, code ở `src/core/gear/`): ATK +3, Máu +30, DEF +2. Chỉ số món = gốc × hệ số phẩm × hệ số nguyên tố, làm tròn. Ví dụ đủ 3 món Cam cùng nguyên tố cộng ATK +42, Máu +405, DEF +27.

## 2. Nguyên tố của trang bị

- Mỗi trang bị có một nguyên tố. Hệ số chỉ số so với nguyên tố của nhân vật theo [Nguyên tố](../01-gameplay/nguyen-to.md#3-hệ-số-trang-bị-so-với-nguyên-tố-của-nhân-vật).
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

- Chỉ số vào trận = (chỉ số gốc của nhân vật + cộng phẳng của các món) × (1 + tổng tỉ lệ thưởng bộ và cộng hưởng), làm tròn.
- Vũ khí của nghề khác không tính vào số món; nhân vật chính thiếu vũ khí của nghề đang chọn thì chỉ có 8 món.

**Thưởng bộ chốt theo mô phỏng** (Claude chốt theo ủy quyền của Shan, 19/10/2026), chỉ cộng chỉ số:

| Bộ | Mốc 6 món | Mốc 9 món (thêm) |
|---|---|---|
| Cờ Lau | ATK +4%, Máu +3% | ATK +4%, Máu +3% |
| Hoa Lư | DEF +12%, Máu +4% | DEF +12%, Máu +4% |
| Đồng Cổ | ATK +7% | ATK +7% |

| Cộng hưởng | Mốc 6 món | Mốc 9 món (thêm) |
|---|---|---|
| ⚙️ Kim | ATK +5% | ATK +5% |
| 🌳 Mộc | Máu +6% | Máu +6% |
| 💧 Thủy | Máu +3%, DEF +5% | Máu +3%, DEF +5% |
| 🔥 Hỏa | ATK +6% | ATK +6% |
| ⛰️ Thổ | DEF +10% | DEF +10% |
| ⚡ Lôi | ATK +3%, Máu +3% | ATK +3%, Máu +3% |
| 🌪️ Phong | ATK +3%, DEF +5% | ATK +3%, DEF +5% |

### Mô phỏng 19/10/2026

3vs3, AI Thường, 300 trận mỗi hệ nhân vật chính × 7 hệ. Mọi nhân vật mặc đủ 9 món cùng hệ với mình (`pnpm sim -- --gear-tier 3 --set coLau`). Số là tỉ lệ thắng trung bình của phe nhân vật chính.

| Cấu hình | Thắng | Lượt mỗi phe (trung vị) |
|---|---|---|
| Không đồ | 63.5% | 23.6 |
| Hai phe đồ Lam, không bộ (chỉ cộng hưởng) | 60.3% | 27.8 |
| Đồ Cam, không bộ | 59.2% | 31.7 |
| Đồ Lam, phe mình đủ bộ Cờ Lau | 70.0% | 26.7 |
| Đồ Lam, phe mình đủ bộ Hoa Lư | 68.9% | 29.2 |
| Đồ Lam, phe mình đủ bộ Đồng Cổ | 69.5% | 24.4 |

- Đủ bộ 9 món hơn đối thủ không bộ khoảng **+9 điểm** tỉ lệ thắng; ba bộ lệch nhau dưới 1.5 điểm (trước khi chỉnh, Cờ Lau +11.8 và Hoa Lư +9.4).
- Trang bị làm trận dài thêm: đồ Cam khoảng 32 lượt mỗi phe, hơi quá mục tiêu 20–30.
- Bị động Kim **không** mạnh lên khi DEF tăng: Kim từ 58% (không đồ) xuống 55% (đồ Lam), giảm như các hệ khác.

> TODO: có hiệu ứng bộ ngoài chỉ số (ví dụ Khiên đầu trận) hay không; thêm bộ trang bị.

## 4. Phẩm theo màu

Mỗi trang bị có một **phẩm**, hiển thị bằng màu khung và tên. Có 5 bậc:

| Bậc | Màu | Tên | Hệ số chỉ số |
|---|---|---|---|
| 1 | ⚪ Trắng | Phàm phẩm | ×1 |
| 2 | 🟢 Lục | Lương phẩm | ×1.3 |
| 3 | 🔵 Lam | Tinh phẩm | ×1.7 |
| 4 | 🟣 Tím | Bảo phẩm | ×2.2 |
| 5 | 🟠 Cam | Thần phẩm | ×3 |

- Hệ số phẩm nhân với chỉ số gốc của món, trước khi nhân hệ số nguyên tố ([Nguyên tố](../01-gameplay/nguyen-to.md#3-hệ-số-trang-bị-so-với-nguyên-tố-của-nhân-vật)).
- Phẩm chỉ áp cho trang bị. Nhân vật vẫn **không có độ hiếm**.

## 5. Ghép nâng bậc

- Ghép **3 món cùng bậc** thành **1 món bậc kế tiếp**. Bậc Cam là bậc cao nhất, không ghép tiếp.
- Ba món phải **cùng nguyên tố (cùng hệ)**. **Không được ghép trang bị khác hệ.**
- Ba món phải **cùng loại ô** (ví dụ ba Đính mão). Vũ khí còn phải **cùng nghề**.
- Món nhận được giữ loại ô và nguyên tố đó. Bộ trang bị của món mới lấy theo món người chơi chọn làm món chính.
- Trang bị đang mặc được dùng làm nguyên liệu; ô đó trở thành trống sau khi ghép.
- Server thực hiện ghép trong một transaction ([Hạ tầng](../07-architecture/ha-tang.md#3-database)).

- Ghép **luôn thành công**, không có tỉ lệ thất bại.

- **Phí vàng thấp** (Shan chốt 19/10/2026, không làm khó người chơi): 10 vàng khi ghép 3 món Trắng, 20 với Lục, 40 với Lam, 80 với Tím. Điểm xuất phát, chỉnh khi có giá trị ô vàng.

## 6. Nguồn trang bị

- Rơi ngẫu nhiên sau trận (server quyết định); trận càng khó thì tỉ lệ rơi phẩm cao càng lớn.
- Cửa hàng bán món cố định, giá cao.

- **Bảng rơi đồ** (Claude chốt theo ủy quyền của Shan, 19/10/2026; điểm xuất phát): thắng trận chắc chắn rơi 1 món; thua có 30% rơi 1 món, phẩm tối đa Lục. Ô, nguyên tố, bộ và nghề của vũ khí chia đều.

| Độ khó | ⚪ Trắng | 🟢 Lục | 🔵 Lam | 🟣 Tím | 🟠 Cam |
|---|---|---|---|---|---|
| Dễ | 70% | 25% | 5% | 0% | 0% |
| Thường | 55% | 30% | 12% | 3% | 0% |
| Khó | 35% | 35% | 20% | 8% | 2% |
| Trùm | 15% | 30% | 30% | 18% | 7% |
| Ác mộng | 5% | 20% | 35% | 27% | 13% |

- Vì ghép cần 3 món cùng ô **và** cùng hệ, nâng một món lên Cam tốn tới 81 món Trắng cùng loại; tỉ lệ rơi phẩm cao ở trận khó là đường tắt chính.

- **Cửa hàng trang bị** (Claude đặt 19/10/2026, chờ Shan duyệt): thay cho danh sách món cố định, người chơi tự chọn ô, nguyên tố, bộ (và nghề nếu là vũ khí) rồi mua món **Lục giá 400 vàng** hoặc **Lam giá 1 200 vàng**. Một món Lam bằng khoảng 17 trận thắng nhưng thay cho 9 món Trắng cùng ô và cùng hệ, nên là đường tắt đắt mà vẫn đáng. Không bán Tím và Cam: hai bậc này chỉ có từ rơi đồ trận khó và ghép.

## 7. Túi đồ (code: `src/core/progress/inventory.ts`)

- Mọi món nằm trong túi đồ của hồ sơ (tối đa **200 món**, kể cả món đang mặc). Ô trang bị của từng nhân vật lưu id món; mỗi món chỉ một người mặc, mặc cho người khác thì tự tháo khỏi người cũ.
- Món rơi sau trận vào thẳng túi đồ (server quyết định ở `/play`); túi đầy thì món rơi được bán ngay.
- **Bán** món lấy vàng: Trắng 5, Lục 15, Lam 50, Tím 150, Cam 500 (điểm xuất phát).
- Đội Tianwu chưa mặc đồ; đồ của người chơi là lợi thế khi lên cấp.
