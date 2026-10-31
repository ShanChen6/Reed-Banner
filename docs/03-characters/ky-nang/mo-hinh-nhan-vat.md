# Nhân vật, nghề & kỹ năng

> Trạng thái: **SUPERSEDED một phần** — mô hình chung và luật dùng kỹ năng còn hiệu lực; bộ chiêu cụ thể xem [Kỹ năng hiện hành](README.md).

> Cập nhật tiếp theo: [kỹ năng phiên bản 2 và combo đồng đội](lich-su/21-combo-dong-doi.md). Layout mới đổi tuyệt chiêu sang ô 4, nghề nâng cao sang ô 5, có chuyển hồ sơ giữ điểm. Các định nghĩa legacy/lịch sử bên dưới cần đọc cùng tài liệu phiên bản 2.

> Cập nhật: 20/10/2026
>
> Các con số là **điểm xuất phát**. Script cân bằng sẽ chỉnh lại.

## 1. Mô hình chung

- **Chỉ số:** Máu tối đa, Công (ATK), Thủ (DEF), Tinh thần (trong trận, xem [Tài nguyên & công thức](../../01-gameplay/tai-nguyen-cong-thuc.md#5-tinh-thần-f-riêng-từng-tướng-hiện-hành)).
- Mỗi nhân vật có **một nghề** và **một nguyên tố**; nhân vật kèm cố định cả hai, riêng nhân vật chính đổi được trước trận. Đối thủ AI cũng có nghề và nguyên tố.
- **Không có độ hiếm.** Mọi nhân vật kèm cân bằng ở cùng một cấp. Nhân vật mua thêm mang giá trị **chiến thuật** (bao phủ nguyên tố, kỹ năng khác), không mạnh hơn.
- Nhân vật lịch sử (nhân vật chính, tướng lịch sử, sứ quân) được ghi rõ là hư cấu hóa. Tướng thường là **hư cấu**.
- Danh sách đầy đủ mọi nhân vật, chỉ số và kỹ năng riêng: [Danh sách nhân vật](../danh-sach-nhan-vat.md).

## 2. Nhân vật chính: Đinh Bộ Lĩnh

- Có ngay từ lúc tạo game, **luôn ra trận** ở cả 1vs1 và 3vs3.
- **Nghề:** chọn 1 trong 6 nghề **trước mỗi trận** (mặc định Tướng sĩ khi tạo game). Nhân vật chính hưởng nội tại của nghề đang chọn (xem mục 4.1). Trong trận không đổi được.
  - Nghề quyết định 3 kỹ năng chủ động, nội tại nghề, loại ô và vũ khí. Hệ quyết định 2 kỹ năng bổ trợ/bàn cờ; ô 5 riêng theo nhân vật.
  - 6 nghề × 7 nguyên tố cho 42 cách dựng nhân vật chính. Từ 31/10/2026 mở thêm Xạ thủ và Sát thủ thành 8 nghề, 56 cách: [thiết kế](../dinh-bo-linh-xa-thu-sat-thu.md).
  - Đội được phép có nhiều người cùng nghề (ví dụ hai Y sư). Nội tại tác động lên cả phe, như lương của Binh lính, không cộng dồn.
- **Nguyên tố:** chọn 1 trong 7 (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Phong) khi tạo game, và được **đổi trước mỗi trận**. Trong trận không đổi được.
- **6 kỹ năng chủ động:** 3 nghề + 2 hệ + 1 tuyệt chiêu; thêm bị động theo hệ của thủ lĩnh. Đổi nghề/hệ giữ cấp nâng theo ô.
- Chiêu nghề mới chỉ Ngũ hành ấn cộng dấu ấn cường hóa; các chiêu khác không tự cộng dấu ấn.

### 2.1 Ba loại kỹ năng chủ động

| Loại | Ví dụ tác dụng |
|---|---|
| **Tác động đối thủ** | Sát thương đơn mục tiêu, sát thương toàn bộ kẻ địch, hiệu ứng bất lợi |
| **Tác động bàn cờ** | Phá hủy ô ngẫu nhiên, phá hủy một vùng ô (xem mục 5) |
| **Hỗ trợ bản thân** | Hồi máu, Khiên, Công+, Thủ+, Hồi phục |

Một kỹ năng có thể thuộc nhiều loại, ví dụ vừa gây sát thương vừa phá một vùng ô.

### 2.2 Bộ kỹ năng hiện hành

Danh sách đầy đủ 18 chiêu nghề, 14 chiêu hệ và ánh xạ hồ sơ ở [Cải tổ kỹ năng](lich-su/20-cai-to-ky-nang.md).

| Ô | Nguồn | Mở khóa |
|---|---|---|
| 1 | Nghề cơ bản | 1 |
| 2 | Hệ bàn cờ | 1 |
| 3 | Nghề vai trò chính | 5 |
| 5 | Tuyệt chiêu riêng; Đinh Bộ Lĩnh mặc định theo hệ | 10 |
| 4 | Nghề chiến thuật | 15 |
| 6 | Hệ bổ trợ | 20 |

Thứ tự hiển thị 1,2,3,5,4,6; ID ô lưu không đổi. Số liệu hệ cũ ở [12](preset-ai-he-cu.md) chỉ áp cho preset thủ lĩnh AI chiến dịch và lịch sử.

## 3. Luật dùng kỹ năng chủ động (mọi nhân vật)

- Dùng kỹ năng là **hành động miễn phí trước khi đổi ô**, mỗi lượt tối đa **1 lần**. Chỉ **người hành động** trong lượt mới được dùng.
- Trừ đúng chi phí năng lượng. Không đủ năng lượng thì kỹ năng bị khóa.
- Kỹ năng gây sát thương chịu DEF, sĩ khí và nguyên tố (xem [Công thức](../../01-gameplay/tai-nguyen-cong-thuc.md#4-công-thức-sát-thương)).
- Câm lặng chặn mọi kỹ năng chủ động, không chặn kỹ năng bị động.
- Kỹ năng bị động chỉ có ở thủ lĩnh (nhân vật chính, hoặc nhân vật vị trí 1 của đội AI) và kích hoạt bằng Nộ ([Tài nguyên](../../01-gameplay/tai-nguyen-cong-thuc.md#3-nộ-và-kỹ-năng-bị-động)). Đội AI dùng bộ bị động theo nguyên tố của thủ lĩnh.

## 4. Nhân vật kèm, nghề & chiêu nghề

- Ở 3vs3, người chơi chọn **2 nhân vật kèm** cùng ra trận với nhân vật chính; hồ sơ lưu đội đã chọn.
- Mỗi nhân vật kèm = **Nghề + Nguyên tố cố định + 1 kỹ năng riêng ở ô 5**. Từ 22/10/2026 mọi nhân vật kèm dùng **3 chiêu nghề + 2 chiêu hệ + 1 tuyệt chiêu riêng như nhân vật chính** (mục 2.2), mở ô theo cấp và nâng theo ô; ô 5 là tuyệt chiêu (tướng thường) hoặc chiêu riêng (tướng lịch sử, sứ quân).
- Ba nhóm: **42 tướng thường** hư cấu (mỗi tổ hợp nghề × hệ một người; 5 khởi đầu, 37 ở cửa hàng), **6 tướng lịch sử** gia nhập qua chiến dịch, **12 sứ quân** mở bán sau khi đánh bại ở chiến dịch. Chi tiết: [Danh sách nhân vật](../danh-sach-nhan-vat.md).
- **Khởi đầu:** nhân vật chính (mặc định Tướng sĩ) và 5 tướng thường, mỗi người một nghề còn lại (Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư). Khi nhân vật chính đổi sang nghề khác, nhân vật kèm cùng nghề vẫn ra trận được.

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

Xem [Danh sách nhân vật, mục 1](../danh-sach-nhan-vat.md#1-khung-chung-của-nhân-vật-kèm). Trước 20/10/2026 tướng thường dùng chiêu nghề nấc 1, chiêu nhánh nấc 2 (mua từ cấp 5, chọn 1 khi vào trận) và tuyệt chiêu nấc 3 (tự mở ở cấp 10); khung này bị bỏ vì yếu hơn rõ so với bộ theo hệ của tướng lịch sử (mô phỏng ở [Danh sách nhân vật, mục 8](../danh-sach-nhan-vat.md#8-cân-bằng-lịch-sử-trước-cải-tổ-22102026)).

### 4.3 Bộ chiêu nghề

**Preset nghề cũ, chỉ tùy tướng AI** ở chiến dịch dùng bộ này (nấc 1 và một chiêu nhánh nấc 2, cộng [dấu ấn nguyên tố](../../01-gameplay/nguyen-to.md#5-dấu-ấn-nguyên-tố-trên-chiêu-nghề)); nhân vật phe người chơi dùng bộ nghề + hệ mới ở [20](lich-su/20-cai-to-ky-nang.md). Các chiêu dưới giữ nguyên để không đổi độ khó chiến dịch.

**⚔️ Tướng sĩ AI cũ: dồn sát thương, cổ vũ cả đội**
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

### 4.4 Tuyệt chiêu, chiêu riêng, cửa hàng và tướng lịch sử

Đã chuyển sang [Danh sách nhân vật](../danh-sach-nhan-vat.md): tuyệt chiêu của 42 tướng thường (mục 4), tướng lịch sử (mục 5), sứ quân và chiêu riêng (mục 6).

- Lịch sử mô phỏng tuyệt chiêu (19/10/2026, khung cũ): AI chấm kỹ năng theo giá trị trên mỗi điểm năng lượng nên hiếm khi để dành tới 100; sau khi AI tính cả lượt dùng kỹ năng ([10-ai](../../01-gameplay/ai.md)) cả 5 tuyệt chiêu khởi đầu đều được dùng, tỉ lệ thắng theo hệ đổi trong mức nhiễu.
- Lịch sử mô phỏng chiêu riêng sứ quân (20/10/2026, 60 trận mỗi màn): 11/12 sứ quân dùng chiêu riêng 0,25–1,6 lần mỗi trận; Nguyễn Siêu gần như không dùng (chiêu thủ). Giá 80 đầu tiên gần như không được AI dùng nên hạ còn 60 (trùm 80); Phong Châu Lôi Kích giảm từ 140% ATK, −30 năng lượng, 6 ô vì màn Phong Châu chỉ còn 35% thắng.

## 5. Kỹ năng tác động lên bàn cờ

Luật chung:

- Ô bị kỹ năng phá hủy **được thu hoạch** như ô bị ô đặc biệt nổ, nhưng giảm: mọi ô thu hoạch khi kỹ năng (hoặc lần xoay miễn phí của Thuận Phong) đổi bàn cờ, kể cả cascade sau đó, chỉ cho **50% sát thương kiếm** và **50% năng lượng âm dương**. Các loại ô khác giữ nguyên.
  - Lý do (mô phỏng 19/10/2026): thu hoạch đủ thì kỹ năng bàn cờ giá rẻ là một nước đi miễn phí, kiếm đánh đủ sát thương còn ô âm dương hoàn lại năng lượng để dùng tiếp. Trước đây chỉ vá bằng cách tăng giá từng kỹ năng ô 1.
- Ô đặc biệt bị phá thì **kích hoạt** hiệu ứng của nó.
- Sau khi phá, bàn lấp đầy và cascade như bình thường (xem [Bàn cờ](../../01-gameplay/ban-co.md#4-sinh-ô--lấp-đầy-bàn)).
- Cascade sinh ra từ kỹ năng **không** cho lượt thêm, vì dùng kỹ năng không phải là nước đi. Người chơi vẫn đổi ô sau đó như thường.
- Ô "ngẫu nhiên" do server chọn bằng luồng ngẫu nhiên của bàn cờ, nên AI không biết trước.
