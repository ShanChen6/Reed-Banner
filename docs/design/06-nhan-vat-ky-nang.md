# Nhân vật, nghề & kỹ năng

> Cập nhật: 18/10/2026
>
> Các con số là **điểm xuất phát**. Script cân bằng sẽ chỉnh lại.

## 1. Mô hình chung

- **Chỉ số:** Máu tối đa, Công (ATK), Thủ (DEF), Tinh thần (trong trận, xem [Tài nguyên & công thức](03-tai-nguyen-cong-thuc.md#5-tinh-thần-riêng-từng-tướng)).
- Mỗi nhân vật có **một nghề** và **một nguyên tố**; nhân vật kèm cố định cả hai, riêng nhân vật chính đổi được trước trận. Đối thủ AI cũng có nghề và nguyên tố.
- **Không có độ hiếm.** Mọi nhân vật kèm cân bằng ở cùng một cấp. Nhân vật mua thêm mang giá trị **chiến thuật** (bao phủ nguyên tố, kỹ năng khác), không mạnh hơn.
- Nhân vật lịch sử (nhân vật chính, trùm đối thủ) được ghi rõ là hư cấu hóa. Nhân vật kèm thường là **hư cấu**.

## 2. Nhân vật chính: Đinh Bộ Lĩnh

- Có ngay từ lúc tạo game, **luôn ra trận** ở cả 1vs1 và 3vs3.
- **Nghề:** chọn 1 trong 6 nghề **trước mỗi trận** (mặc định Tướng sĩ khi tạo game). Nhân vật chính hưởng nội tại của nghề đang chọn (xem mục 4.1). Trong trận không đổi được.
  - Nghề **không** đổi bộ kỹ năng: 6 kỹ năng chủ động và kỹ năng bị động đi theo nguyên tố. Nghề chỉ quyết định nội tại nghề, loại ô gắn với nghề và loại vũ khí.
  - 6 nghề × 7 nguyên tố cho 42 cách dựng nhân vật chính.
  - Đội được phép có nhiều người cùng nghề (ví dụ hai Y sư). Nội tại tác động lên cả phe, như lương của Binh lính, không cộng dồn.
- **Nguyên tố:** chọn 1 trong 7 (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong) khi tạo game, và được **đổi trước mỗi trận**. Trong trận không đổi được.
- **7 kỹ năng theo nguyên tố:** 1 bị động + 6 chủ động. Đổi nguyên tố thì đổi cả bộ kỹ năng. Mỗi nguyên tố có bộ kỹ năng riêng, tổng cộng 7 bộ.
- Kỹ năng của nhân vật chính đã mang sẵn màu nguyên tố, nên không cộng dấu ấn nguyên tố như chiêu nghề.

### 2.1 Ba loại kỹ năng chủ động

| Loại | Ví dụ tác dụng |
|---|---|
| **Tác động đối thủ** | Sát thương đơn mục tiêu, sát thương toàn bộ kẻ địch, hiệu ứng bất lợi |
| **Tác động bàn cờ** | Phá hủy ô ngẫu nhiên, phá hủy một vùng ô (xem mục 5) |
| **Hỗ trợ bản thân** | Hồi máu, Khiên, Công+, Thủ+, Hồi phục |

Một kỹ năng có thể thuộc nhiều loại, ví dụ vừa gây sát thương vừa phá một vùng ô.

### 2.2 Bộ kỹ năng theo nguyên tố

Chi tiết 7 bộ (49 kỹ năng), chi phí năng lượng, mốc mở khóa, nâng cấp và vùng phá ô: xem [Bộ kỹ năng nhân vật chính](12-ky-nang-nhan-vat-chinh.md).

Tóm tắt khung chung, áp cho cả 7 nguyên tố:

| Ô | Vai trò | Năng lượng | Mở khóa |
|---|---|---|---|
| Bị động | Tự kích hoạt khi đầy Nộ | 100 nộ | Cấp 1 |
| 1 | Bàn cờ: phá hoặc biến ô | 20 | Cấp 1 |
| 2 | Hỗ trợ nhỏ | 30 | Cấp 1 |
| 3 | Đơn mục tiêu + phá vùng nhỏ | 40 | Cấp 5 |
| 4 | Toàn bộ kẻ địch + phá vùng | 60 | Cấp 10 |
| 5 | Tuyệt kỹ đơn mục tiêu + phá vùng rộng | 100 | Cấp 20 |
| 6 | Hỗ trợ lớn | 50 | Cấp 15 |

> Tên kỹ năng phải tự đặt, không trùng tên chiêu của game khác (nguyên tắc clean-room). "Cổ Thụ Trấn Thiên" thay cho tên cũ vì tên cũ trùng một game đang phát hành.

## 3. Luật dùng kỹ năng chủ động (mọi nhân vật)

- Dùng kỹ năng là **hành động miễn phí trước khi đổi ô**, mỗi lượt tối đa **1 lần**. Chỉ **người hành động** trong lượt mới được dùng.
- Trừ đúng chi phí năng lượng. Không đủ năng lượng thì kỹ năng bị khóa.
- Kỹ năng gây sát thương chịu DEF, sĩ khí và nguyên tố (xem [Công thức](03-tai-nguyen-cong-thuc.md#4-công-thức-sát-thương)).
- Câm lặng chặn mọi kỹ năng chủ động, không chặn kỹ năng bị động.
- Kỹ năng bị động chỉ có ở thủ lĩnh (nhân vật chính, hoặc nhân vật vị trí 1 của đội AI) và kích hoạt bằng Nộ ([Tài nguyên](03-tai-nguyen-cong-thuc.md#3-nộ-và-kỹ-năng-bị-động)). Đội AI dùng bộ bị động theo nguyên tố của thủ lĩnh.

## 4. Nhân vật kèm, nghề & chiêu nghề

- Ở 3vs3, người chơi chọn **2 nhân vật kèm** cùng ra trận với nhân vật chính.
- Mỗi nhân vật kèm = **Nghề + Nguyên tố + 1 tuyệt chiêu đặc trưng**. Nguyên tố của nhân vật kèm cố định.
- **Khởi đầu:** người chơi có nhân vật chính (mặc định Tướng sĩ) và **5 nhân vật kèm hư cấu**, mỗi người một nghề còn lại (Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư). Khi nhân vật chính đổi sang nghề khác, nhân vật kèm cùng nghề vẫn ra trận được.
  Nguyên tố và tuyệt chiêu đặc trưng của 5 nhân vật kèm khởi đầu: xem [mục 4.4](#44-tuyệt-chiêu-nấc-3).
- Nhân vật kèm bán ở cửa hàng: 12 người, xem [mục 4.5](#45-nhân-vật-kèm-ở-cửa-hàng). Tướng lịch sử gia nhập qua chiến dịch, xem [mục 4.6](#46-tướng-lịch-sử).
- Đội 3vs3 chọn 2 trong số nhân vật kèm đã có; hồ sơ lưu đội đã chọn.

### 4.1 Sáu nghề & nội tại

Mỗi nghề gắn với một loại ô. Ô 🥁 Trống trận không gắn với nghề nào; nó nuôi thanh Nộ của thủ lĩnh.

| Ô | Nghề | Nội tại trong trận | Phụ ngoài trận |
|---|---|---|---|
| ⚔️ | **Tướng sĩ** | Ghép kiếm từ 4 ô trở lên: +30% sát thương | — |
| ☯️ | **Pháp sư** | Năng lượng từ âm dương ×1.5 | — |
| 🍙 | **Binh lính** | Lương tụt −3/lượt thay vì −5; mỗi bậc sĩ khí trên mức bình thường: +5% DEF | — |
| ❤️ | **Y sư** | Hồi máu từ tim ×1.5; hồi vượt máu tối đa chuyển thành Khiên tạm thời | — |
| 💰 | **Mưu sĩ** | Ghép vàng trừ năng lượng đối thủ (mỗi ô −2) | +10% vàng cuối trận |
| 📖 | **Quân sư** | Ghép sách giảm ATK đối thủ 5% mỗi ô (tối đa −30%, 3 lượt) | +10% kinh nghiệm cuối trận |

### 4.2 Khung kỹ năng nhân vật kèm

| Nấc | Năng lượng | Kỹ năng | Mở khóa |
|---|---|---|---|
| 1 | 30 | Chiêu nghề (chung theo nghề) | Có sẵn |
| 2 | 45 | Chiêu nhánh: **mua được cả 2, chọn 1 khi vào trận** | Cấp 5 |
| 3 | 100 | Tuyệt chiêu đặc trưng (riêng nhân vật) | **Tự mở ở cấp 10**, không tốn điểm |

- Điểm kỹ năng dùng để mở nhánh nấc 2 và nâng cấp chiêu (cấp 1 đến 5: tăng sức mạnh hoặc giảm chi phí).
- Chiêu nghề có lõi trung tính, cộng [dấu ấn nguyên tố](05-nguyen-to.md#5-dấu-ấn-nguyên-tố-trên-chiêu-nghề) của người tung chiêu. Riêng tuyệt chiêu nấc 3 được mang đậm nguyên tố của nhân vật.

### 4.3 Bộ chiêu nghề

**⚔️ Tướng sĩ: dồn sát thương, cổ vũ cả đội**
- Nấc 1, **Trảm kích:** 210% ATK vào 1 đối thủ.
- Nấc 2A, **Hiệu lệnh:** Công +25% cho cả đội, 2 lượt.
- Nấc 2B, **Phá trận:** 300% ATK vào 1 đối thủ, kèm Thủ −30% trong 2 lượt.

**🍙 Binh lính: khiêu khích, chịu đòn**
- Nấc 1, **Thủ thành:** Khiêu khích 2 lượt, kèm Khiên bằng 20% máu tối đa của bản thân.
- Nấc 2A, **Phản kích:** Phản đòn 40% trong 2 lượt, kèm Thủ +30%.
- Nấc 2B, **Tường khiên:** Khiên bằng 15% máu tối đa cho cả đội.

**☯️ Pháp sư: bậc thầy nguyên tố, phá giáp**
- Nấc 1, **Phép công:** 180% ATK vào 1 đối thủ.
- Nấc 2A, **Ngũ hành ấn:** 140% ATK vào 1 đối thủ, kèm dấu ấn **cường hóa**, chắc chắn kích hoạt.
- Nấc 2B, **Phép lan:** 100% ATK vào cả đội đối thủ.

**❤️ Y sư: hồi máu, giải trừ**
- Nấc 1, **Linh dược:** hồi 22% máu cho 1 đồng đội (người chơi chọn), kèm Thanh tẩy người đó.
- Nấc 2A, **Dưỡng sinh:** Hồi phục 7% máu mỗi lượt cho cả đội, 3 lượt.
- Nấc 2B, **Tế độ:** hồi 15% máu cả đội, kèm Thanh tẩy cả đội.

**💰 Mưu sĩ: mua chuộc, phá năng lượng**
- Nấc 1, **Mua chuộc:** trừ 40 năng lượng của 1 đối thủ.
- Nấc 2A, **Ly gián:** Câm lặng 1 đối thủ trong 2 lượt.
- Nấc 2B, **Cắt quân lương:** trừ 15 lương chung của phe đối thủ, kèm trừ 10 năng lượng mỗi đối thủ.

**📖 Quân sư: suy yếu, điều binh**
- Nấc 1, **Nghi binh:** Công −30% cho 1 đối thủ, 2 lượt.
- Nấc 2A, **Phá kế:** Xua tan toàn bộ hiệu ứng có lợi của cả đội đối thủ.
- Nấc 2B, **Bày trận:** Thủ +30% cho cả đội, 2 lượt.

**Khắc chế giữa các nghề (tham khảo):**
- Câm lặng (Mưu sĩ) khắc Pháp sư.
- Xua tan (Quân sư) khắc Binh lính và Y sư.
- Khiêu khích (Binh lính) bảo vệ đồng đội khỏi Tướng sĩ.
- Thanh tẩy (Y sư) giải khống chế.

### 4.4 Tuyệt chiêu nấc 3

Claude đặt ngày 19/10/2026, điểm xuất phát chờ Shan duyệt và mô phỏng. Mỗi tuyệt chiêu tốn **100 năng lượng**, tự có trong trận khi nhân vật kèm đạt **cấp 10**, nâng cấp bằng điểm kỹ năng như chiêu khác (cấp 5 còn 90 năng lượng). Tuyệt chiêu không mang dấu ấn nguyên tố vì nguyên tố đã nằm trong chính chiêu.

| Nhân vật | Nghề | Hệ | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|
| Hà Vân | Pháp sư | 🔥 Hỏa | **Hỏa Vũ Liệu Nguyên** | 150% ATK vào cả đội đối thủ, Thiêu đốt 15% ATK trong 2 lượt; phá vùng 3×3 |
| Lê Thạch | Binh lính | ⛰️ Thổ | **Trấn Sơn Hộ Quân** | Khiên 25% máu tối đa cho cả đội; bản thân Khiêu khích và Phản đòn 35% trong 2 lượt |
| Mai Thanh | Y sư | 💧 Thủy | **Cam Lộ Hồi Xuân** | Hồi 25% máu và Thanh tẩy cả đội; mỗi đối thủ 30% bị Đóng băng 1 lượt |
| Tô Kim | Mưu sĩ | ⚙️ Kim | **Kim Ngân Ly Tán** | 180% ATK vào 1 đối thủ, bỏ qua 50% DEF và Khiên; trừ 50 năng lượng, Câm lặng 1 lượt |
| Phùng Phong | Quân sư | 🌪️ Phong | **Phong Vân Biến Trận** | Xua tan và giảm Công 30% cả đội đối thủ trong 2 lượt; cả đội +20 năng lượng; trượt 1 hàng hoặc cột tối đa 2 ô |

- Nhân vật kèm bán ở cửa hàng sau này cũng có tuyệt chiêu riêng theo khung này.
- Mô phỏng 19/10/2026 (300 trận, AI Thường, cả hai phe cùng cấp): tỉ lệ thắng gần như không đổi (3vs3 cấp 10: 64% so với 65% trước khi có tuyệt chiêu; cấp 20: 60% so với 59%) vì AI chấm kỹ năng theo giá trị trên mỗi điểm năng lượng nên hiếm khi để dành tới 100 (Phong Vân Biến Trận 0,6 lần mỗi trận, Hỏa Vũ Liệu Nguyên 0,2, ba chiêu còn lại gần 0; ô 5 của nhân vật chính cũng vậy). Cần dạy AI để dành cho kỹ năng lớn trước khi cân số liệu tuyệt chiêu.
- Mô phỏng lại 19/10/2026 sau khi AI tính cả lượt dùng kỹ năng ([10-ai](10-ai.md)), 300 trận mỗi hệ, 3vs3 cấp 10: cả 5 tuyệt chiêu đều được dùng (Phong Vân Biến Trận 0,7–0,8 lần mỗi trận, Hỏa Vũ Liệu Nguyên 0,6–0,7, ba chiêu còn lại 0,1). Tỉ lệ thắng phe chính theo hệ trước → sau: Kim 56→57%, Mộc 64→66%, Thủy 60→63%, Hỏa 60→61%, Thổ 62→62%, Lôi 65→66%, Phong 68→67%, đều trong mức nhiễu ±3 điểm. Chưa cần đổi số liệu tuyệt chiêu; ba chiêu ít dùng là chiêu phòng thủ/hồi máu, AI chỉ dùng khi đội đã mất máu.

### 4.5 Nhân vật kèm ở cửa hàng

Claude đặt ngày 19/10/2026, điểm xuất phát chờ Shan duyệt. Hai người mỗi nghề (có cả Tướng sĩ), nguyên tố rải đủ 7 hệ, tên hư cấu (không dùng tên 12 sứ quân). Giá 2 mức: **1 500 vàng** (khoảng 20 trận thắng) và **3 000 vàng** (khoảng 40 trận); mua cả 12 tốn 27 000 vàng, đủ dài cho người cày nhiều nhất. Mua về bắt đầu ở cấp 1.

| Nhân vật | Nghề | Hệ | Giá | Tuyệt chiêu | Tác dụng |
|---|---|---|---|---|---|
| Trần Cương | Tướng sĩ | ⚙️ Kim | 1 500 | **Kim Qua Thiết Mã** | 280% ATK 1 đối thủ, bỏ qua 40% DEF, Thủ −30% 2 lượt |
| Lý Liệt | Tướng sĩ | 🔥 Hỏa | 3 000 | **Xích Hỏa Đoạt Kỳ** | 300% ATK 1 đối thủ, Thiêu đốt 15% ATK 3 lượt; phá chữ thập nhỏ |
| Đào Lam | Pháp sư | 💧 Thủy | 1 500 | **Băng Hà Phong Tỏa** | 120% ATK cả đội đối thủ, mỗi người 35% Đóng băng 1 lượt; phá 8 ô ngẫu nhiên |
| Vũ Lôi | Pháp sư | ⚡ Lôi | 3 000 | **Thiên Lôi Giáng Thế** | 250% ATK 1 đối thủ, −30 năng lượng; phá 1 cột |
| Hoàng Mộc | Binh lính | 🌿 Mộc | 1 500 | **Rễ Già Giữ Thành** | Hồi phục 6% máu/lượt cả đội 3 lượt; bản thân Khiên 25% và Khiêu khích 2 lượt |
| Cao Kiên | Binh lính | ⚙️ Kim | 3 000 | **Thiết Bích Đồng Thành** | Thủ +50% 3 lượt, Phản đòn 50% và Khiêu khích 2 lượt |
| Lục Diệp | Y sư | 🌿 Mộc | 1 500 | **Xuân Mộc Vạn Sinh** | Hồi 20% máu cả đội, kèm Hồi phục 6%/lượt 2 lượt |
| Bạch Sương | Y sư | 🌪️ Phong | 3 000 | **Gió Lành Tẩy Uế** | Thanh tẩy và hồi 18% máu cả đội, +15 năng lượng mỗi người |
| Ninh Hỏa | Mưu sĩ | 🔥 Hỏa | 1 500 | **Hỏa Thiêu Kho Lương** | Đối thủ −25 lương, mỗi người −25 năng lượng và Thiêu đốt 10% ATK 2 lượt |
| Quách Ẩn | Mưu sĩ | 💧 Thủy | 3 000 | **Thủy Độn Ly Gián** | Mỗi đối thủ 50% bị Câm lặng 1 lượt, −20 năng lượng |
| Tạ Thạch | Quân sư | ⛰️ Thổ | 1 500 | **Bát Trận Thạch Lũy** | Cả đội Thủ +30% 2 lượt và Khiên 12% máu |
| Mạc Vân | Quân sư | ⚡ Lôi | 3 000 | **Lôi Trận Kinh Hồn** | Cả đội đối thủ Công −25% 2 lượt, −20 năng lượng; phá 6 ô ngẫu nhiên |

### 4.6 Tướng lịch sử

Claude đặt ngày 20/10/2026, điểm xuất phát chờ Shan duyệt. Sáu tướng lịch sử theo Đinh Bộ Lĩnh dẹp loạn, **không bán ở cửa hàng**, gia nhập khi qua màn chiến dịch lần đầu ([Chế độ chơi](09-che-do-choi.md#21-chương-1-cờ-lau-dẹp-loạn-claude-đặt-19102026-chờ-shan-duyệt)). Mỗi người mang **bộ 6 kỹ năng theo nguyên tố như nhân vật chính** (mục 2.2), mở ô theo cấp và nâng theo ô như Đinh Bộ Lĩnh, riêng ô 5 là chiêu riêng (mục 4.7); không có chiêu nhánh nấc 2. Chỉ số theo nghề như mọi nhân vật; bị động ô 1 chỉ có tác dụng khi làm thủ lĩnh, mà thủ lĩnh phe người chơi luôn là Đinh Bộ Lĩnh.

| Tướng | Nghề | Hệ | Gia nhập |
|---|---|---|---|
| Nguyễn Bặc | Tướng sĩ | 🔥 Hỏa | Cờ lau tập trận |
| Đinh Điền | Binh lính | ⛰️ Thổ | Thử tài ở Bố Hải Khẩu |
| Lưu Cơ | Mưu sĩ | ⚙️ Kim | Thu phục Đằng Châu |
| Trịnh Tú | Y sư | 🌿 Mộc | Đánh Bình Kiều |
| Lê Hoàn | Quân sư | ⚡ Lôi | Vây thành Tam Đái |
| Đinh Liễn | Pháp sư | 💧 Thủy | Lên Phong Châu |

### 4.7 Chiêu riêng của nhân vật lịch sử

Claude đặt ngày 20/10/2026, tên tự đặt (không lấy từ game khác), số liệu là điểm xuất phát chờ Shan duyệt. Chiêu riêng **thay kỹ năng ô 5** trong bộ theo nguyên tố, nâng cấp bằng khóa ô 5 như cũ.

- **Tướng lịch sử phe người chơi**: giá 100 như ô 5, mở ở cấp 20.
- **12 sứ quân** (đối thủ chiến dịch): luôn có chiêu riêng dù cấp chưa tới 20, cấp kỹ năng bằng kỹ năng cao nhất trong bộ. Giá 60 (trùm Đỗ Cảnh Thạc 80): bản giá 80 đầu tiên gần như không được AI dùng vì AI tiêu năng lượng vào chiêu rẻ ô 3 trước.

| Nhân vật | Chiêu riêng | Giá | Tác dụng |
|---|---|---|---|
| Nguyễn Bặc | **Định Quốc Hỏa Kỳ** | 100 | 240% ATK vào 1 đối thủ, Thiêu đốt 15% ATK 2 lượt; cả đội +15% Công 2 lượt |
| Đinh Điền | **Ngoại Giáp Hộ Quân** | 100 | Khiên 20% máu tối đa cả đội; bản thân Khiêu khích và Phản đòn 35% 2 lượt |
| Lưu Cơ | **Đô Hộ Phủ Lệnh** | 100 | Cả đội đối thủ −30 năng lượng, 50% bị Câm lặng 1 lượt, −15% Thủ 2 lượt |
| Trịnh Tú | **Hoa Lư Thảo Dược** | 100 | Hồi 22% máu, Thanh tẩy và Hồi phục 5%/lượt 2 lượt cho cả đội |
| Lê Hoàn | **Thập Đạo Lôi Binh** | 100 | 100% ATK cả đội đối thủ, −25% Công 2 lượt; cả đội mình +20 năng lượng |
| Đinh Liễn | **Nam Việt Vương Ấn** | 100 | 130% ATK cả đội đối thủ, 30% Đóng băng 1 lượt; phá 6 ô ngẫu nhiên |
| Trần Lãm | **Bố Hải Trấn Giang** | 60 | 80% ATK cả đội đối thủ, −30% Công 2 lượt, 35% Đóng băng; phá 4 ô |
| Phạm Bạch Hổ | **Bạch Hổ Xuất Sơn** | 60 | 320% ATK vào 1 đối thủ, Thiêu đốt 20% ATK 2 lượt; bản thân +20% Công |
| Ngô Xương Xí | **Ngô Gia Di Mưu** | 60 | 240% ATK bỏ qua 40% Thủ, −50 năng lượng, Câm lặng 1 lượt; phá 6 ô |
| Ngô Nhật Khánh | **Đường Lâm Phong Khởi** | 60 | 60% ATK cả đội đối thủ, Xua tan, −25% Công 2 lượt; trượt 1 hàng/cột tối đa 2 ô |
| Nguyễn Khoan | **Tam Đái Kiên Thành** | 60 | Khiên 25% máu cả đội; bản thân Khiêu khích, Phản đòn 35% 2 lượt |
| Kiều Công Hãn | **Phong Châu Lôi Kích** | 60 | 100% ATK cả đội đối thủ, −15 năng lượng; phá 4 ô (giảm 20/10/2026: bản cũ 140%, −30, 6 ô làm màn Phong Châu chỉ còn 35% thắng) |
| Kiều Thuận | **Hồi Hồ Sinh Khí** | 60 | Hồi 25% máu và Hồi phục 6%/lượt 2 lượt cho cả đội |
| Lý Khuê | **Siêu Loại Phá Giáp** | 60 | 340% ATK bỏ qua 50% Thủ, −30% Thủ 2 lượt; phá 6 ô |
| Nguyễn Thủ Tiệp | **Tiên Du Đoạt Lương** | 60 | 60% ATK cả đội đối thủ, −25 lương, −30 năng lượng, 25% Đóng băng |
| Lữ Đường | **Tế Giang Thủy Trận** | 60 | 150% ATK cả đội đối thủ, 35% Đóng băng; biến 4 ô thành âm dương |
| Nguyễn Siêu | **Phù Liệt Hỏa Lũy** | 60 | Khiên 30% máu và Khiêu khích cho bản thân; Thiêu đốt 15% ATK cả đội đối thủ |
| Đỗ Cảnh Thạc | **Đỗ Động Kiên Tâm** | 80 | 360% ATK vào 1 đối thủ; cả đội +30% Thủ 2 lượt; phá 8 ô |

- Mô phỏng 20/10/2026 (60 trận mỗi màn, người chơi hơn 3 cấp, AI Thường): 11/12 sứ quân dùng chiêu riêng 0,25–1,6 lần mỗi trận; Nguyễn Siêu gần như không dùng (chiêu thủ, AI chỉ dùng khi bị đánh mạnh). Tỉ lệ thắng của người chơi đổi trong mức nhiễu (Bố Hải Khẩu 87→75%, Tiên Du 32→37%, Tế Giang 60→52%, các màn khác lệch ≤5 điểm).

## 5. Kỹ năng tác động lên bàn cờ

Luật chung:

- Ô bị kỹ năng phá hủy **được thu hoạch** như ô bị ô đặc biệt nổ, nhưng giảm: mọi ô thu hoạch khi kỹ năng (hoặc lần trượt miễn phí của Thuận Phong) đổi bàn cờ, kể cả cascade sau đó, chỉ cho **50% sát thương kiếm** và **50% năng lượng âm dương**. Các loại ô khác giữ nguyên.
  - Lý do (mô phỏng 19/10/2026): thu hoạch đủ thì kỹ năng bàn cờ giá rẻ là một nước đi miễn phí, kiếm đánh đủ sát thương còn ô âm dương hoàn lại năng lượng để dùng tiếp. Trước đây chỉ vá bằng cách tăng giá từng kỹ năng ô 1.
- Ô đặc biệt bị phá thì **kích hoạt** hiệu ứng của nó.
- Sau khi phá, bàn lấp đầy và cascade như bình thường (xem [Bàn cờ](01-ban-co.md#4-sinh-ô--lấp-đầy-bàn)).
- Cascade sinh ra từ kỹ năng **không** cho lượt thêm, vì dùng kỹ năng không phải là nước đi. Người chơi vẫn đổi ô sau đó như thường.
- Ô "ngẫu nhiên" do server chọn bằng luồng ngẫu nhiên của bàn cờ, nên AI không biết trước.
