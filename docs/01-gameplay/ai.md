# AI (Tianwu)

> Cập nhật: 27/11/2026
> Trạng thái: **IMPLEMENTED**

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

> TODO: con số độ ngẫu nhiên từng mức. Tính cách máy: xem [mục dưới](#tính-cách-máy).

## Tính cách máy

> Shan chốt 27/11/2026 (luồng bot chơi cùng khi vắng người): 8 tính cách, mỗi nhân vật thêm một nét riêng. Code: `src/core/ai/personality.ts`. Chưa gắn vào chế độ nào; các PR sau gắn vào Thư Hùng (ghép máy khi chờ lâu), Phá Doanh và thương đoàn Hành Thương Ký. Máy luôn ghi rõ là máy, không tính điểm hạng.

Tính cách chỉ nhân trọng số khi chấm nước đổi ô và kỹ năng, không đổi luật và không cho AI nhìn thêm gì (vẫn qua bài test ngang bằng thông tin). Độ mạnh vẫn theo độ khó. Không truyền tính cách thì AI chấm y như trước; `"auto"` lấy tính cách theo nhân vật đang hành động.

| Tính cách | Lối đánh | Trọng số chính |
|---|---|---|
| Mãnh công | Săn ô kiếm, ưu tiên kết liễu, có chiêu sát thương là tung | sát thương ×1,25, kết liễu ×1,5, giữ thân ×0,8, ít để dành (0,65) |
| Thủ thành | Giữ máu, giữ lương, dựng khiên rồi mới đánh | giữ thân ×1,6, sát thương ×0,85 |
| Mưu phá | Phá buff, rút năng lượng, cắt lương, khống chế | phá đối thủ ×1,7 |
| Tích lực | Gom âm dương, để dành tuyệt chiêu | năng lượng ×1,8, để dành 0,95 |
| Liều lĩnh | Săn chuỗi rơi, ô đặc biệt, thêm lượt | nhịp bàn cờ ×1,8, ngẫu nhiên ×1,6 |
| Lão luyện | Cân bằng, tính trước ô sắp rơi | ngẫu nhiên ×0,5, cộng kỳ vọng ô mới ở mọi độ khó |
| Hộ chủ | Che chở đồng đội yếu | giữ thân ×1,3, phần dành cho đồng đội ×1,6 |
| Tùy cơ | Dẫn máu hơn 15% thì như Thủ thành, kém hơn 15% thì như Liều lĩnh, còn lại như Lão luyện | theo thế trận nhìn thấy |

Gán cho 20 nhân vật (nét riêng và thoại vào trận, thắng, thua nằm trong `BOT_CHARACTERS`, chờ Shan duyệt chữ):

- Sứ quân: Trần Lãm lão luyện; Phạm Bạch Hổ, Lý Khuê, Nguyễn Siêu mãnh công; Nguyễn Khoan, Kiều Thuận thủ thành; Ngô Xương Xí, Ngô Nhật Khánh mưu phá; Kiều Công Hãn, Lữ Đường tích lực; Đỗ Cảnh Thạc liều lĩnh; Nguyễn Thủ Tiệp tùy cơ.
- Tướng lịch sử: Nguyễn Bặc mãnh công; Đinh Điền, Trịnh Tú hộ chủ; Lưu Cơ mưu phá; Lê Hoàn lão luyện; Đinh Liễn tích lực.
- Nhân vật đặc biệt: Minh Nguyệt lão luyện; Vũ Phong tùy cơ.

Cân bằng: `pnpm sim -- --personality --mode all --battles 300` cho phe mang tính cách đấu gương với AI gốc cùng đội hình. Mục tiêu mỗi tính cách thắng trong khoảng 40–60% (khác lối, không hơn kém rõ rệt). Kết quả 27/11/2026, 300 trận mỗi ô, AI Thường (dưới 300 trận nhiễu ±3 điểm):

| Tính cách | 1vs1 | 3vs3 |
|---|---|---|
| Mãnh công | 48,3% (sau khi nới giữ thân; bản đầu 40,0%) | 49,0% (bản đầu) |
| Thủ thành | 56,7% | 49,0% |
| Mưu phá | 53,3% | 53,0% |
| Tích lực | 47,7% | 49,7% |
| Liều lĩnh | 55,3% | 49,7% |
| Lão luyện | 50,3% | 55,0% |
| Hộ chủ | 58,7% | 56,7% |
| Tùy cơ | 54,3% | 56,0% |

## Cải tổ 22/10/2026

Bộ người chơi dùng [bộ kỹ năng hiện hành](../03-characters/ky-nang/README.md#bộ-kỹ-năng-được-chốt). AI xét mọi mục tiêu còn sống, bị Khiêu khích thì chọn đúng người buộc phải đánh. Hồi máu chấm theo máu thiếu, Hồi phục theo lượng hồi hữu ích; Thanh tẩy chỉ đếm bất lợi, Xua tan chỉ đếm có lợi. Câm lặng ưu tiên đối thủ có kỹ năng và năng lượng; hiệu ứng tự hại trừ điểm. Khiêu khích vô ích trong 1vs1, giá trị tăng khi người đỡ đòn còn khỏe và còn đồng đội. Phá vùng chấm nhanh mọi vùng khác nhau trên bàn nhìn thấy, chọn 6 vùng triển vọng để chấm cascade biết chắc với thu hoạch giảm; ô ngẫu nhiên chỉ dùng kỳ vọng, không đọc RNG.

Đây vẫn là heuristic: không tối ưu phối hợp nhiều lượt, thời điểm tích năng lượng hoặc chọn người hành động. Không đồng nhất tỉ lệ thắng AI với cân bằng khi người thật chơi.

## Kiểm chứng AI/Tinh thần sau cải tổ

Scorer dùng chỉ số hiệu dụng theo Tinh thần/buff/sĩ khí/bị động, trừ Khiên/Hồi phục đã có và dùng sàn hồi/Khiên20% tại Tinh thần0 theo F hiện hành. Câm lặng chỉ có giá trị nếu mục tiêu kịp hành động trong thời hạn; Phản kích xét hướng đòn/Khiêu khích; kỹ năng có thưởng kết liễu như nước đổi ô. `inspectSkillChoices` dùng cùng scorer/selector để ghi score, đối thủ cạnh tranh và lý do bỏ qua; không áp quota dùng chiêu. Baseline AI cũ đóng băng trong scripts/fixtures. Báo cáo mới tách so AI với thử luật Tinh thần, cùng các giới hạn heuristic.

## Baseline F cho cân bằng (task2)

Chẩn đoán task2 sửa bug điểm phối hợp hồi: chỉ người nhận thực của từng bước, còn thiếu HP và nhận hồi sau làm tròn/F, mới tạo tín hiệu chấm điểm. Không đổi trọng số, hệ số chiến đấu hoặc ép dùng chiêu. AI trước/sau được đóng băng; dùng SHA trong `ai-version.json` của báo cáo cho task3. Audit nguồn Nộ/truy kích không tham gia quyết định gameplay.
