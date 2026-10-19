# Bộ kỹ năng nhân vật chính

> Cập nhật: 19/10/2026 · Trạng thái: **Shan đã duyệt** (18/10/2026). Đã có trong code đủ 7 hệ (19/10/2026).
>
> Mọi con số là **điểm xuất phát**. Script mô phỏng cân bằng sẽ chỉnh lại.

Đinh Bộ Lĩnh có **7 kỹ năng theo nguyên tố**: 1 bị động và 6 chủ động. Đổi nguyên tố trước trận thì đổi cả bộ. Mô hình chung xem [Nhân vật & kỹ năng](06-nhan-vat-ky-nang.md#2-nhân-vật-chính-đinh-bộ-lĩnh); tính cách từng nguyên tố xem [Nguyên tố](05-nguyen-to.md#2-tính-cách-nguyên-tố).

Tên kỹ năng hệ Mộc (trừ kỹ năng bị động) do Shan đặt. Tên các hệ còn lại là tên tự đặt, chờ Shan duyệt; không dùng tên chiêu của game khác.

## 1. Khung chung

Bảy bộ dùng cùng một khung để cân bằng với nhau. Thứ tự theo bộ hệ Mộc của Shan.

| Ô | Vai trò | Năng lượng | Mở khóa | Mức sức mạnh chuẩn |
|---|---|---|---|---|
| Bị động | Tự kích hoạt khi đầy **Nộ**, hiệu lực 3 lượt | 100 nộ | Cấp 1 | Một đợt bùng nổ đáng kể nhưng không quyết định trận |
| 1 | **Bàn cờ**: phá hoặc biến ô | 20 | Cấp 1 | Khoảng 8 ô bị tác động |
| 2 | **Hỗ trợ nhỏ** cho bản thân | 30 | Cấp 1 | Hồi 15% máu, hoặc Khiên 20%, hoặc Công +25% 2 lượt |
| 3 | **Đơn mục tiêu** + phá vùng nhỏ | 40 | Cấp 5 | 180% ATK, phá khoảng 4 ô |
| 4 | **Toàn bộ kẻ địch** + phá vùng | 60 | Cấp 10 | 90% ATK mỗi mục tiêu, phá khoảng 9 ô |
| 5 | **Tuyệt kỹ** đơn mục tiêu + phá vùng rộng | 100 | Cấp 20 | 320% ATK, phá khoảng 16 ô |
| 6 | **Hỗ trợ lớn** | 50 | Cấp 15 | Hai hiệu ứng có lợi, hoặc một hiệu ứng cho cả đội |

- **Lệch theo nguyên tố:** Phong ở mức gần chuẩn nhưng mạnh về điều khiển bàn cờ; Hỏa gây sát thương cao hơn chuẩn khoảng 10–15% nhưng tự làm yếu thủ; Thổ thấp hơn khoảng 20% nhưng kèm Khiên; Thủy và Mộc thấp hơn khoảng 5–10% nhưng kèm khống chế hoặc hồi máu; Kim và Lôi ở mức chuẩn kèm hiệu ứng phụ.
- Ở giai đoạn 1 (Luyện tập, cùng một cấp), cả 7 kỹ năng mở sẵn; mốc mở khóa chỉ áp dụng từ giai đoạn 3.
- Sát thương kỹ năng chịu DEF, sĩ khí và nguyên tố ([Công thức](03-tai-nguyen-cong-thuc.md#4-công-thức-sát-thương)).

### 1.1 Nâng cấp

- Mỗi kỹ năng chủ động có **cấp 1 đến 5**, nâng bằng điểm kỹ năng.
- Mỗi cấp trên 1: **+10%** hệ số chính (sát thương, lượng hồi, Khiên, % Công/Thủ). Thời lượng và số ô không đổi.
- Cấp 5: chi phí năng lượng giảm **10%** (làm tròn xuống bội số của 5).
- Kỹ năng bị động không nâng cấp. Cách tích nộ xem [Tài nguyên](03-tai-nguyen-cong-thuc.md#3-nộ-và-kỹ-năng-bị-động).

> TODO: số điểm kỹ năng cần cho mỗi cấp.

### 1.2 Vùng phá ô

- Kỹ năng có vùng **do người chơi chọn**: chạm vào một ô làm tâm. Vùng tự dịch vào trong nếu tràn ra ngoài bàn 12×8. Vùng có kích thước chẵn (2×2, 4×4) lấy ô được chạm làm góc trên trái.
- Kỹ năng có ô **ngẫu nhiên**: server chọn bằng luồng ngẫu nhiên của bàn cờ, không trùng ô. AI không biết trước.
- Ô bị phá được thu hoạch, ô đặc biệt bị phá thì kích hoạt, cascade sau kỹ năng không cho lượt thêm (luật ở [Nhân vật & kỹ năng](06-nhan-vat-ky-nang.md#5-kỹ-năng-tác-động-lên-bàn-cờ)).
- Kỹ năng **trượt** (chỉ hệ Phong): dịch toàn bộ một hàng hoặc một cột do người chơi chọn đi 1 hoặc 2 ô theo hướng chọn; ô tràn khỏi một đầu quay vào đầu kia. Trượt không phá ô và không thu hoạch; nếu tạo bộ ghép thì cascade như bình thường (không cho lượt thêm; ô đặc biệt sinh ra ở ô giữa bộ ghép như luật cascade). Ô đặc biệt trượt theo như ô thường.
- Kỹ năng **biến ô** đổi loại ô thường; không biến ô đặc biệt. Ô vừa biến có thể tạo bộ ghép và cascade ngay.

| Ký hiệu | Hình | Số ô |
|---|---|---|
| 2×2 | Vuông 2 ô | 4 |
| 3×3 | Vuông quanh tâm | 9 |
| 4×4 | Vuông 4 ô | 16 |
| 5×3 | 5 cột × 3 hàng quanh tâm | 15 |
| Chữ thập nhỏ | Tâm + 4 ô kề | 5 |
| Chữ thập lớn | Cả hàng + cả cột qua tâm | 19 |
| Chữ X lớn | Tâm + 2 ô mỗi hướng chéo | 9 |
| Đoạn 4 | 4 ô thẳng hàng, ngang hoặc dọc (người chơi chọn hướng; code hiện chỉ có ngang, bắt đầu từ ô chạm) | 4 |
| Cột | Cả một cột | 8 |

### 1.3 Ở thể thức 1vs1

- Kỹ năng "toàn bộ kẻ địch" chỉ trúng một đối thủ nhưng gây **×1.5** sát thương, để ô 4 không quá yếu.
- Kỹ năng "cả đội" chỉ tác động lên bản thân.
- Khiêu khích không có tác dụng.

## 2. 🌳 Mộc: đánh dai, hồi máu

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Sinh Sôi Bất Tận** | Nộ | Hồi phục 3% máu tối đa mỗi lượt cho cả đội, 3 lượt. |
| 1 | **Lục Diệp Phong** | 35 | Phá **5 ô ngẫu nhiên**. |
| 2 | **Linh Mộc Hồi Sinh** | 30 | Hồi 11% máu tối đa, biến 3 ô ngẫu nhiên thành ❤️. |
| 3 | **Thanh Mộc Hộ Pháp** | 40 | 130% ATK vào 1 đối thủ, hồi cho bản thân 30% sát thương gây ra. Phá vùng **2×2**. |
| 4 | **Cuồng Vũ Thiên Diệp** | 60 | 65% ATK vào toàn bộ kẻ địch. Phá vùng **3×3**. |
| 5 | **Cổ Thụ Trấn Thiên** | 100 | 225% ATK vào 1 đối thủ, Hồi phục 5% máu cho bản thân 2 lượt. Phá vùng **4×4**. |
| 6 | **Thanh Trúc Bảo Phù** | 50 | Hồi phục 6% máu mỗi lượt trong 3 lượt, Thanh tẩy bản thân, Thủ +15% 2 lượt. |

## 3. ⚙️ Kim: đánh chắc, xuyên giáp

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Kim Cốt Thiết Thân** | Nộ | 3 lượt: đánh thường và kỹ năng bỏ qua 40% DEF, kỹ năng xuyên Khiên. |
| 1 | **Luyện Kim Thành Kiếm** | 20 | Biến **4 ô ngẫu nhiên** thành ⚔️. |
| 2 | **Kim Ý Ngưng Thần** | 30 | Công +25% cho bản thân, 2 lượt. |
| 3 | **Đoạn Kim Nhất Tuyến** | 40 | 180% ATK vào 1 đối thủ, bỏ qua 30% DEF, Thủ −20% mục tiêu 2 lượt. Phá **đoạn 4**. |
| 4 | **Thiết Kỵ Tung Hoành** | 60 | 90% ATK vào toàn bộ kẻ địch. Phá **1 cột**. |
| 5 | **Kim Ấn Phá Thiên** | 100 | 320% ATK vào 1 đối thủ, bỏ qua 50% DEF và xuyên Khiên (bỏ qua Khiên của mục tiêu). Phá **chữ thập lớn**. |
| 6 | **Giáp Đồng Hộ Thể** | 50 | Thủ +30% và Công +15% cho bản thân, 3 lượt. |

## 4. 💧 Thủy: khống chế

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Hàn Tuyền** | Nộ | Đóng băng ngay 1 đối thủ (người chơi chọn) 1 lượt; 3 lượt sau đó kỹ năng gây sát thương có thêm 25% cơ hội Đóng băng. |
| 1 | **Thủy Nguyệt Tụ Linh** | 20 | Biến **5 ô ngẫu nhiên** thành ☯️. |
| 2 | **Thanh Lưu Tẩy Trần** | 30 | Thanh tẩy bản thân, hồi 10% máu tối đa. |
| 3 | **Hàn Băng Tiễn** | 40 | 165% ATK vào 1 đối thủ, 30% cơ hội Đóng băng 1 lượt. Phá vùng **2×2**. |
| 4 | **Bạch Đằng Triều Dâng** | 60 | 80% ATK vào toàn bộ kẻ địch, mỗi mục tiêu 20% cơ hội Đóng băng 1 lượt. Phá **9 ô ngẫu nhiên**. |
| 5 | **Thủy Kiếp Vạn Trùng** | 100 | 290% ATK vào 1 đối thủ, chắc chắn Đóng băng 1 lượt. Phá **2 cột liền nhau** (16 ô). |
| 6 | **Linh Thủy Hộ Mệnh** | 50 | Hồi 12% máu tối đa và Thanh tẩy cho cả đội. |

- Đóng băng vẫn theo luật chung: tối đa 2 lượt, miễn nhiễm 1 lượt sau khi tan ([Hiệu ứng](04-hieu-ung.md#3-luật-chung)).
- Bị động tự kích hoạt giữa lượt nên trong code chưa cho người chơi chọn: Đóng băng đối thủ đối diện thủ lĩnh (đã gục thì người gần nhất). Kích hoạt trong lượt đối thủ thì Đóng băng kéo sang lượt kế của họ.

## 5. 🔥 Hỏa: sát thương lớn, thủ yếu

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Liệt Hỏa Tâm** | Nộ | 3 lượt: mọi sát thương của bản thân +30%, DEF bản thân −15%. |
| 1 | **Phóng Hỏa Thiêu Doanh** | 35 | Phá vùng **3×3** do người chơi chọn. |
| 2 | **Nộ Hỏa Thiêu Thân** | 30 | Công +35% cho bản thân 2 lượt, kèm Thủ −15% bản thân 2 lượt. |
| 3 | **Xích Diễm Tiễn** | 40 | 200% ATK vào 1 đối thủ, Thiêu đốt 2 lượt. Phá **chữ thập nhỏ**. |
| 4 | **Hỏa Thiêu Liên Trại** | 60 | 100% ATK vào toàn bộ kẻ địch, Thiêu đốt 1 lượt. Phá vùng **3×3**. |
| 5 | **Liệt Diễm Phần Thành** | 100 | 360% ATK vào 1 đối thủ, Thiêu đốt 3 lượt. Phá vùng **5×3**. |
| 6 | **Dục Hỏa Trùng Sinh** | 50 | Hồi 20% máu tối đa, Công +20% cho bản thân 2 lượt. |

- Lượng Thiêu đốt mỗi lượt: 10% ATK của người tung.

## 6. ⛰️ Thổ: trụ lâu, chịu đòn

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Bàn Thạch** | Nộ | Khiên bằng 25% máu tối đa cho bản thân, Phản đòn 25% trong 3 lượt. |
| 1 | **Hậu Thổ Tích Lương** | 20 | Biến **5 ô ngẫu nhiên** thành 🍙. |
| 2 | **Thạch Giáp** | 30 | Khiên bằng 20% máu tối đa cho bản thân. |
| 3 | **Sơn Băng Địa Liệt** | 40 | 150% ATK vào 1 đối thủ, Khiên 10% máu tối đa cho bản thân. Phá vùng **2×2**. |
| 4 | **Địa Chấn Tam Quân** | 60 | 75% ATK vào toàn bộ kẻ địch, Thủ −15% mỗi mục tiêu 2 lượt. Phá vùng **3×3**. |
| 5 | **Thái Sơn Áp Đỉnh** | 100 | 260% ATK vào 1 đối thủ, Khiên 20% máu tối đa cho bản thân. Phá vùng **4×4**. |
| 6 | **Kiên Thành Bất Động** | 50 | Khiên 15% máu tối đa cho cả đội, Phản đòn 30% cho bản thân 2 lượt, Khiêu khích 2 lượt (chỉ 3vs3). |

## 7. ⚡ Lôi: đánh nhanh, phá nhịp

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Điện Quang Tốc Kích** | Nộ | Trừ ngay 20 năng lượng của mọi đối thủ; 3 lượt sau đó mỗi ô ☯️ ghép được cho thêm 5 năng lượng. |
| 1 | **Lôi Trụ Giáng Thế** | 40 | Phá **1 cột** do người chơi chọn. |
| 2 | **Tĩnh Điện Hộ Thân** | 30 | Thanh tẩy bản thân, Thủ +20% 2 lượt. |
| 3 | **Lôi Tiễn Xuyên Vân** | 40 | 180% ATK vào 1 đối thủ, trừ 15 năng lượng của mục tiêu. Phá **4 ô ngẫu nhiên**. |
| 4 | **Lôi Võng Thiên La** | 60 | 90% ATK vào toàn bộ kẻ địch, trừ 10 năng lượng mỗi mục tiêu. Phá **9 ô ngẫu nhiên**. |
| 5 | **Cửu Tiêu Lôi Phạt** | 100 | 320% ATK vào 1 đối thủ, Câm lặng 1 lượt. Phá **1 cột + 8 ô ngẫu nhiên**. |
| 6 | **Lôi Đình Hiệu Lệnh** | 50 | Công +25% cho cả đội 2 lượt, trừ 15 năng lượng của mọi đối thủ. |

## 8. 🌪️ Phong: linh hoạt, điều khiển bàn cờ

| Ô | Kỹ năng | Chi phí | Tác dụng |
|---|---|---|---|
| Bị động | **Thuận Phong** | Nộ | Nhận ngay 15 năng lượng; trong 3 lượt kế tiếp của phe, người ra tay được **trượt** miễn phí 1 hàng hoặc 1 cột đi 1 ô, làm trước kỹ năng và đổi ô (không tốn năng lượng, không tính là dùng kỹ năng, không đặt lại đồng hồ). **Tối đa 1 lần mỗi lần kích hoạt** (chờ Shan chốt, xem dưới). |
| 1 | **Phong Quyển Tàn Vân** | 40 | **Trượt** 1 hàng hoặc 1 cột đi 1–2 ô. |
| 2 | **Thanh Phong Tụ Khí** | 30 | Công +20% cho bản thân 2 lượt, nhận ngay 10 năng lượng. |
| 3 | **Phong Nhận Liệt Không** | 40 | 175% ATK vào 1 đối thủ, Xua tan mục tiêu. Phá vùng **2×2**. |
| 4 | **Cuồng Phong Quét Trận** | 60 | 85% ATK vào toàn bộ kẻ địch, Công −15% mỗi mục tiêu 2 lượt. Phá **chữ X lớn**. |
| 5 | **Bão Táp Càn Khôn** | 100 | 300% ATK vào 1 đối thủ, Xua tan và Công −25% mục tiêu 2 lượt. **Trượt** 1 hàng 2 ô rồi phá vùng **4×4**. |
| 6 | **Phong Hành Vạn Lý** | 50 | Thủ +15% cho cả đội 2 lượt, cả đội nhận 15 năng lượng. |

- Phong là hệ duy nhất có kỹ năng trượt, nên mạnh nhất ở việc chủ động tạo combo và ô đặc biệt.
- Mô phỏng 19/10/2026 (3vs3, 180 trận): một lần trượt chọn khéo gần như là một nước đi miễn phí kèm combo. Cho trượt miễn phí ở mọi lần ra tay trong 3 lượt thì phe Phong thắng khoảng 80%; chỉ 1 lần mỗi lần kích hoạt thì khoảng 73%; bỏ hẳn thì 68%. Phong Quyển Tàn Vân tăng giá 20 → 40 vì cùng lý do.
- Thao tác: kéo dọc một hàng hoặc một cột từ ô đầu tới ô đích (hoặc chạm ô đầu rồi ô đích).

## 9. So sánh nhanh

| Nguyên tố | Sát thương ô 3 / 4 / 5 | Điểm mạnh | Điểm yếu |
|---|---|---|---|
| 🌳 Mộc | 170 / 85 / 300 | Hồi máu liên tục, phá ô nhiều nhất | Sát thương thấp hơn chuẩn |
| ⚙️ Kim | 180 / 90 / 320 | Xuyên DEF và Khiên, tạo ô kiếm | Ít hồi máu |
| 💧 Thủy | 165 / 80 / 290 | Đóng băng, tạo ô âm dương | Sát thương thấp nhất sau Thổ |
| 🔥 Hỏa | 200 / 100 / 360 (+15% bị động) | Sát thương cao nhất | DEF bản thân thấp |
| ⛰️ Thổ | 150 / 75 / 260 | Khiên nhiều, tạo lương | Sát thương thấp nhất |
| ⚡ Lôi | 180 / 90 / 320 | Phá năng lượng, Câm lặng | Ít hồi máu, phụ thuộc ô âm dương |
| 🌪️ Phong | 175 / 85 / 300 | Trượt hàng/cột tạo combo, Xua tan, hồi năng lượng | Không hồi máu, ít Khiên |

### Mô phỏng 19/10/2026

AI Thường, seed 7. 3vs3: 90 trận, nhân vật chính và 2 nhân vật kèm đấu 3 nhân vật kèm. 1vs1: 60 trận, nhân vật chính đấu từng nhân vật kèm.

| Hệ nhân vật chính | 3vs3 thắng | 3vs3 trung vị lượt | 1vs1 thắng | 1vs1 trung vị lượt |
|---|---|---|---|---|
| 🌳 Mộc | 66% | 24.5 | 67% | 13.5 |
| ⚙️ Kim | 61% | 20 | 65% | 8 |
| 💧 Thủy | 68% | 22 | 77% | 9 |
| 🔥 Hỏa | 68% | 20 | 77% | 6.5 |
| ⛰️ Thổ | 68% | 22.5 | 73% | 12.5 |
| ⚡ Lôi | 70% | 20.5 | 67% | 8 |
| 🌪️ Phong (180 trận 3vs3) | 73% | 17.5 | 82% | 7.5 |

- Ô 1 phá ô giá 20 (Hỏa 3×3, Lôi 1 cột) quá mạnh, vì ô bị phá được thu hoạch như một nước đi, kể cả kiếm. Đã nâng giá Hỏa lên 35 (bằng Mộc), Lôi lên 40. Trước khi nâng giá, phe Hỏa thắng 79–82% ở 3vs3.
- Các số còn lại giữ đúng bảng trên.
- Tỉ lệ thắng còn phụ thuộc khắc chế với 5 nhân vật kèm khởi đầu (ví dụ Mộc bị Tô Kim hệ Kim khắc), nên chỉ nên so sánh tương đối.

> TODO: chạy lại khi có thêm nhân vật kèm, để giảm ảnh hưởng của khắc chế với 5 nhân vật kèm khởi đầu.
