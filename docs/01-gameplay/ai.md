# AI (Tianwu)

> Cập nhật: 18/10/2026

- Đóng vai các sứ quân. Mỗi đối thủ AI có nghề và nguyên tố, nên lối đánh khác nhau một cách tự nhiên.
- Duyệt mọi nước đổi ô hợp lệ trên bàn 12×8 (tối đa 172 cặp ô kề nhau: 88 cặp ngang + 84 cặp dọc), mô phỏng phần cascade biết chắc rồi chấm điểm (xem [Chấm điểm theo độ khó](#chấm-điểm-theo-độ-khó)).
- Cân nhắc dùng kỹ năng trước khi đổi ô, theo đúng luật như người chơi (tối đa 1 kỹ năng mỗi lượt).
  - Để dành năng lượng (19/10/2026): không dùng kỹ năng kém hơn 80% so với kỹ năng đáng nhất trong bộ (tính theo giá trị trên mỗi điểm năng lượng), kể cả khi kỹ năng đáng nhất chưa đủ năng lượng. Trước đó AI tiêu hết vào kỹ năng rẻ nhất.
  - Tính cả lượt dùng (19/10/2026): mỗi lượt chỉ dùng được 1 kỹ năng, nên khi so độ đáng, giá kỹ năng được cộng thêm 40 năng lượng. Nhờ vậy kỹ năng 100 (tuyệt chiêu) được để dành và dùng; trước đó AI gần như không bao giờ dùng (xem 06 §4.4).
  - Khiên chấm theo lượng chặn được (60% lượng khiên, tính như máu), không còn giá phẳng như hiệu ứng khác.
  - Chấm lần xoay lốc xoáy (kỹ năng Phong và xoay miễn phí; thử mọi tâm, 2 chiều, đủ số nấc) theo mức thu hoạch giảm của kỹ năng bàn cờ: 50% sát thương kiếm, 50% năng lượng, không tính lượt thêm.
- Chịu đúng đồng hồ 30 giây; thời gian AI "suy nghĩ" và animation lượt của AI không tính vào giờ của người chơi.
- **Độ khó** điều chỉnh qua độ "tham" combo và độ ngẫu nhiên; ở mức độ khó thấp, AI không cố tình chọn nước có combo lớn nhất.
- **Hoàn toàn xác định theo seed**: không dùng `Math.random()` trong logic.

## Ngang bằng thông tin

**Tianwu chỉ biết đúng những gì người chơi biết.**

- Hàm AI chỉ nhận trạng thái nhìn thấy được (bàn cờ, máu, năng lượng, lương, hiệu ứng). **Không có quyền truy cập** luồng ngẫu nhiên của ô rơi.
- Khi đánh giá nước đi, AI chỉ mô phỏng phần biết chắc (bộ ghép trực tiếp, ô đã có rơi xuống). Ô mới sinh được coi là chưa biết (bỏ qua hoặc ước lượng theo tỉ lệ trung bình). Tương tự với ô bị kỹ năng phá ngẫu nhiên.
- Lựa chọn ngẫu nhiên của AI dùng luồng seed riêng.
- **Test bắt buộc:** cùng bàn cờ nhìn thấy, đổi seed ô rơi thì quyết định của AI phải không đổi.

## Chấm điểm theo độ khó

> Shan chốt ngày 18/10/2026.

| Độ khó | Cách chấm nước đi |
|---|---|
| Dễ, Thường | **Bỏ qua ô mới:** chỉ chấm bộ ghép trực tiếp và cascade do ô cũ rơi xuống; cộng thêm độ ngẫu nhiên |
| Khó | Như trên, **cộng điểm kỳ vọng** theo tỉ lệ sinh ô của màn |
| Trùm, Ác mộng | Như trên, rồi **giả lập ô rơi** cho 10 nước tốt nhất, mỗi nước 16 lần bằng luồng ngẫu nhiên riêng của AI, lấy trung bình |

- Cả ba cách đều qua bài test ngang bằng thông tin: không cách nào đọc seed ô rơi thật.
- **Chạy bù cho người vắng mặt** (xem [Hạ tầng](../07-architecture/ha-tang.md#2-trận-đấu-server-có-thẩm-quyền)): AI luôn dùng cách "bỏ qua ô mới", để một request chạy bù nhiều lượt không vượt giới hạn thời gian của hàm serverless.

> TODO: tính cách AI theo nghề; con số độ ngẫu nhiên từng mức.

## Cải tổ 22/10/2026

Bộ người chơi dùng [khung nghề + hệ](../03-characters/ky-nang/lich-su/20-cai-to-ky-nang.md). AI xét mọi mục tiêu còn sống, bị Khiêu khích thì chọn đúng người buộc phải đánh. Hồi máu chấm theo máu thiếu, Hồi phục theo lượng hồi hữu ích; Thanh tẩy chỉ đếm bất lợi, Xua tan chỉ đếm có lợi. Câm lặng ưu tiên đối thủ có kỹ năng và năng lượng; hiệu ứng tự hại trừ điểm. Khiêu khích vô ích trong 1vs1, giá trị tăng khi người đỡ đòn còn khỏe và còn đồng đội. Phá vùng chấm nhanh mọi vùng khác nhau trên bàn nhìn thấy, chọn 6 vùng triển vọng để chấm cascade biết chắc với thu hoạch giảm; ô ngẫu nhiên chỉ dùng kỳ vọng, không đọc RNG.

Đây vẫn là heuristic: không tối ưu phối hợp nhiều lượt, thời điểm tích năng lượng hoặc chọn người hành động. Không đồng nhất tỉ lệ thắng AI với cân bằng khi người thật chơi.

## Kiểm chứng AI/Tinh thần sau cải tổ

Scorer dùng chỉ số hiệu dụng theo Tinh thần/buff/sĩ khí/bị động, trừ Khiên/Hồi phục đã có và dùng sàn hồi/Khiên20% tại Tinh thần0 theo F hiện hành. Câm lặng chỉ có giá trị nếu mục tiêu kịp hành động trong thời hạn; Phản kích xét hướng đòn/Khiêu khích; kỹ năng có thưởng kết liễu như nước đổi ô. `inspectSkillChoices` dùng cùng scorer/selector để ghi score, đối thủ cạnh tranh và lý do bỏ qua; không áp quota dùng chiêu. Baseline AI cũ đóng băng trong scripts/fixtures. [Báo cáo mới](../reports/2026-10-22-tinh-than-ai.md) tách so AI với thử luật Tinh thần, cùng các giới hạn heuristic.

## Baseline F cho cân bằng (task2)

[Chẩn đoán task2](../reports/2026-10-22-ai-f/README.md) sửa bug điểm phối hợp hồi: chỉ người nhận thực của từng bước, còn thiếu HP và nhận hồi sau làm tròn/F, mới tạo tín hiệu chấm điểm. Không đổi trọng số, hệ số chiến đấu hoặc ép dùng chiêu. AI trước/sau được đóng băng; dùng SHA trong `ai-version.json` của báo cáo cho task3. Audit nguồn Nộ/truy kích không tham gia quyết định gameplay.
