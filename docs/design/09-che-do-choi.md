# Chế độ chơi

> Cập nhật: 18/10/2026

## 1. Tổng quan

| Chế độ | Mô tả | Thể thức | Giai đoạn |
|---|---|---|---|
| **Luyện tập / Chơi thử** | Offline, không thưởng, không lưu (gồm trang `/demo`); có thể tắt đồng hồ 30 giây | 1vs1 hoặc 3vs3 | 1 |
| **Thường (Normal)** | Trận sinh ngẫu nhiên đấu Tianwu; chọn độ khó; lương reset mỗi trận | Người chơi chọn 1vs1 hoặc 3vs3 | 2–3 |
| **Chiến dịch (Campaign)** | Theo cốt truyện; lương mang sang; luật màn; tỉ lệ ô theo màn | Mỗi màn quy định | 4 |
| **Đánh trùm** | Đánh lại trùm đã gặp trong chiến dịch ở mức khó cao hơn, có luật "sân nhà" và phần thưởng riêng | Mỗi trùm quy định | 4 |
| **Vô hạn = Leo tháp** | Chuỗi trận riêng biệt, độ khó tăng dần | 3vs3 | Sau giai đoạn 4 |
| **Sinh tồn** | Một trận không kết thúc, đối thủ theo đợt, báo trước đợt kế tiếp | 3vs3 | Sau giai đoạn 4 |

> TODO: cột "Thể thức" là đề xuất, chờ chốt.

## 2. Chiến dịch

- Chuỗi màn thử thách, có trùm là sứ quân lịch sử.
- **Cốt truyện (đã chốt hướng):**
  - Người chơi đóng vai **Đinh Bộ Lĩnh** (nhân vật chính).
  - Chiến dịch đi theo **trình tự lịch sử dẹp loạn 12 sứ quân**, mở đầu từ **thuở nhỏ** cho tới khi **lên ngôi**.
  - **Tianwu** không xuất hiện như một nhân vật trong truyện; chỉ đóng vai AI điều khiển các nhân vật đối thủ.
- **Lương mang sang trận sau:**
  - Lương vào trận được giới hạn trong khoảng **20 đến 100**, nên không bao giờ vào trận ở mức hết lương.
  - Giữa các trận có **doanh trại** để đổi vàng lấy lương.
  - Một số màn đặc biệt đặt **lương theo kịch bản** cho phe AI (ví dụ thành bị vây: AI vào trận chỉ có 25 lương).
- **Luật màn** tùy chọn: bảng tỉ lệ ô riêng, lương theo kịch bản. (Đồng hồ 30 giây mỗi lượt luôn bật, không phải luật màn.)

> TODO: phe phái, nhân vật lịch sử, cấu trúc các màn, danh sách trùm, phần thưởng, lời thoại.

## 3. Leo tháp (Vô hạn)

- Máu và lương **mang sang** giữa các tầng, không tự hồi.
- Giữa các tầng chọn **1 trong 3 phần thưởng**: hồi máu, thêm lương, hoặc một "phúc" có hiệu lực đến hết lượt leo (ví dụ +10% ATK cả đội).
- Thua thì leo lại từ tầng 1. Mỗi lượt leo được sinh ngẫu nhiên khác nhau.
- Điểm = tầng cao nhất đạt được.

> TODO: danh sách phần thưởng giữa các tầng.

## 4. Sinh tồn

- Cùng một bàn cờ trong suốt lượt chơi. Đối thủ kéo đến theo **đợt**, mạnh dần.
- **Đợt ≠ lượt.** Một đợt là một nhóm đối thủ kéo vào sân; đợt kết thúc khi toàn bộ đối thủ của đợt bị hạ gục. Mục tiêu tạm thời: 2–3 đối thủ mỗi đợt, khoảng 6–10 lượt mỗi bên (2–3 phút).
- **Báo trước** đợt kế tiếp, ví dụ "3 lượt nữa: 2 Tướng sĩ hệ Hỏa", để người chơi chuẩn bị phòng thủ.
- **Hồi phục cố định giữa các đợt:**
  - Người còn sống: +20% máu tối đa.
  - Lương chung: +25.
- **Hồi sinh người đã gục:**
  - **Tự động** sau **2 đợt** kể từ lúc gục (đếm riêng từng người), với 30% máu và 0 năng lượng.
  - **Hoặc** tiêu **40 lương** ở lần nghỉ giữa đợt để hồi sinh ngay, với 30% máu và 0 năng lượng.
  - Mỗi lần nghỉ giữa đợt chỉ hồi sinh tối đa **1 người**.
  - Nhân vật chính gục thì vẫn chơi tiếp bằng hai nhân vật kèm và chờ hồi sinh như trên.
- **Lưu điểm theo đợt:** bỏ dở quá 24 giờ thì không xử thua; lượt chơi kết thúc ở đợt cuối cùng đã hoàn thành, và điểm vẫn được ghi.
- Điểm = số đợt đã vượt qua.

> TODO: số đối thủ mỗi đợt, đường cong sức mạnh, cách đối thủ mới vào sân (lấp chỗ người đã gục).

## 5. Đề xuất thêm (chờ chốt)

- 🗓️ **Thử thách hằng ngày:** một seed chung cho mọi người chơi mỗi ngày, mỗi người chơi một lần, xếp hạng theo số lượt hoặc máu còn lại. Seed vẫn chỉ nằm trên server.
- 🧩 **Thế cờ:** bàn cờ dựng sẵn, ô rơi cố định, hạ gục đối thủ trong đúng K nước.
- ⚔️ **Đấu trường bóng ma:** PvP không đồng bộ, đánh với đội hình của người chơi khác do AI điều khiển (để sau).
- **Cơ chế giữ chân:** nhiệm vụ ngày/tuần, thành tựu, bộ sưu tập nhân vật.
