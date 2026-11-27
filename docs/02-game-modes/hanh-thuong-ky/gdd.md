# Hành Thương Ký: buôn bán khắp mười ba bến chợ

> Cập nhật: 27/11/2026
> Trạng thái: **IMPLEMENTED (sau cờ `TRADE_ENABLED`, mặc định tắt)** — Shan duyệt thiết kế 25–26/11/2026 ("Đồng ý và triển khai"). Ý tưởng tham khảo cách chơi buôn bán đường biển của một game khác, luật, tên, bản đồ và mã tự làm (clean-room).

## 1. Định vị

Chế độ buôn bán theo mùa tuần: mua hàng nơi rẻ, chở tới nơi đắt mà bán. Buôn là chính; trận ghép ô chỉ xuất hiện khi gặp nạn trên đường và rất dễ. Thẻ ở mục **Giải đố** của Chiến trường, đường dẫn `/game/trade`, scene `TRADE`. Bắt buộc đăng nhập (server giữ mọi số liệu).

Mã: lõi thuần `src/core/trade/` (bản đồ, hàng, chợ, đoàn hàng, giao thương), server `src/server/trade.ts` + `src/server/db/trade.ts` (bảng `trade_players`, `trade_markets`, `trade_legs`, `trade_offers`, migration `0019_trade`), API `src/app/api/trade/route.ts`, màn `src/app/game/trade/`. Test ở `tests/core/trade/` và `tests/server/trade.test.ts`.

## 2. Bản đồ

- Tranh nền bản đồ Bình Loạn (`public/art/campaign/world-map.webp`). 12 điểm lấy tọa độ cứ điểm của Bình Loạn; thêm **Cửa Đại Ác** chỉ khai báo trong `src/core/trade/map.ts`, Bình Loạn không đổi gì. Bình Kiều không có (chưa có tọa độ).
- Bốn loại điểm: cửa biển, bến sông, chợ đồng bằng, núi và trung du. 20 chặng nối các điểm; mỗi chặng là đường thủy, đường bộ hoặc cả hai, xa gần ba mức (20, 45, 90 phút ở cấp 1).
- Mỗi người bắt đầu mùa ở một điểm ngẫu nhiên.
- Thuyền (đường thủy) và xe ngựa (đường bộ) chỉ là hoạt ảnh; sức chở như nhau.

## 3. Hàng hóa

Shan chốt 27/11/2026: **40 món**, chia năm nhóm (nông sản, hải sản, lâm sản, thủ công, khoáng sản) và ba phẩm cấp. Danh sách trong `src/core/trade/goods.ts` là nguồn chính.

| Phẩm cấp | Số món | Giá gốc | Ghi chú |
|---|---|---|---|
| Thường dụng | 14 | 15–45 | Gạo tẻ, gạo nếp, khoai môn, đậu, vừng, mật mía, cau khô, muối, cá khô, tre nứa, than củi, vải gai, mây tre đan, đá ong |
| Thượng phẩm | 20 | 70–300 | Chè, hạt sen long nhãn, rượu nếp, nước mắm, mực khô, hải sâm, gỗ lim, gỗ quý, quế, hồi, dược liệu, mật ong, gốm, lụa, gấm, chiếu cói, giấy dó, sơn mài, sắt thỏi, đồ đồng |
| Kỳ trân | 6 | 600–900 | Ngọc trai, đồi mồi, san hô, trầm hương, sâm, ngà voi. 5 món chiếm một ô khoang; chở kỳ trân dễ gặp nạn hơn |

- **Đặc sản** là nhãn cố định gắn món với quê nhà, ở phẩm cấp nào cũng được. Mỗi điểm có đúng 2 đặc sản (ví dụ Tế Giang: mật mía, lụa; Bố Hải: nước mắm, ngọc trai). Đặc sản rẻ ở quê (×0,65, kỳ trân ×0,8), xa một chặng ×1,05, mỗi chặng thêm 0,1, tối đa ×1,45. Đặc sản là game dựng, không phải sử chép.
- **Hiếm** là món chợ vốn không bày nhưng phiên này có ít hàng về: giá ×1,15 trên sức ép kho (kho gần cạn nên thường đắt). Mỗi chợ mỗi phiên 1–2 món Hiếm, không bao giờ là đặc sản của chợ đó, không phải kỳ trân. Hai nhãn không đứng chung một món.

### Chợ bày gì

- Mỗi chợ xếp 40 món theo độ hợp: đặc sản, hàng hợp loại đất (cửa biển, bến sông, đồng bằng, núi), hàng của quê gần, hàng thường dụng. 16 món đầu **bày cố định**, 8 món kế **bày theo phiên** (mỗi phiên mỗi món có nửa phần có mặt), số còn lại chợ không bày, chỉ có khi thành món Hiếm. Trung bình mỗi chợ khoảng 20 món mỗi phiên.
- Chợ không bày món nào thì không mua, không bán món đó ở đó trong phiên (`notSold`).

## 4. Giá và kho chung

- Phiên giá 2 giờ, đổi vào giờ chẵn giờ Việt Nam. Server tính, ai cũng thấy như nhau. Xem được giá và tồn của mọi chợ trong phiên hiện tại, không xem phiên sau.
- Giá = giá gốc × hệ số vùng × xu hướng (nhiễu trơn theo mùa, điểm, món; biên ±10% thường dụng, ±20% thượng phẩm, ±40% kỳ trân) × sức ép kho (tồn lúc mở phiên so với mức bình thường, từ ×0,7 tới ×1,4) × 1,15 nếu là món Hiếm.
- Giá thu mua = 90% giá bán ra cùng phiên, nên mua rồi bán tại chỗ luôn lỗ.
- **Kho chung cho mọi người** (cạnh tranh): ai mua thì tồn giảm, ai bán thì hàng vào kho. Mỗi phiên chợ tự sinh hoặc tiêu thụ 15% phần chênh với mức bình thường. Món Hiếm có 10–30 đơn vị về khi kho dưới 30. Chợ ứ quá 3 lần mức bình thường thì tạm không thu mua món đó.
- **Mức tồn bình thường** cân cho máy chủ khoảng 1 000 người (Shan 27/11/2026). Ước chừng 300 người vào mỗi ngày, mỗi người 5 lộ phiếu, rải 12 chợ, giờ đông 15–25 đoàn ghé một chợ mỗi phiên, mỗi đoàn chở 100–200 ô:

| Phẩm cấp | Ở quê (đặc sản) | Nơi khác có bày |
|---|---|---|
| Thường dụng | 1 200 | 600 |
| Thượng phẩm | 800 | 250 |
| Kỳ trân | 150 | 40 |

- Màn chợ dạng thẻ (Shan 27/11/2026, theo ảnh mẫu): lưới thẻ 2 cột trên điện thoại, 3–4 cột trên máy lớn. Mỗi thẻ có ô hình (viền theo phẩm cấp: nâu thường dụng, ngọc thượng phẩm, vàng kỳ trân; không ghi chữ phẩm cấp, Shan 27/11), số tồn ở góc, tên, giá, % đổi so với phiên trước, dải góc **Đặc sản** hoặc **Hiếm**. Chạm thẻ mở ô mua bán ngay dưới thẻ. Xếp theo mặc định, giá cao, giá thấp, tăng giá. Tab Bán hiện mọi món trong khoang, món chợ không thu thì thẻ mờ. Tranh 40 món Shan vẽ ở `public/art/trade/goods/<id>.webp` (160 px nền trong; test kiểm đủ tranh cho mọi món).

### Chạy thử nhanh

`TRADE_SPEED` (số nguyên 2–120, để trống là giờ thật): phiên giá ngắn đi chừng đó lần, đường đi nhanh chừng đó lần, lộ phiếu mỗi ngày nhân theo. Ví dụ 10: phiên 12 phút, chặng gần 2 phút, 50 lộ phiếu. Chạy thử dùng kho riêng (khóa mùa thêm `~x10`) nên tắt đi kho thật không bị đụng; đoàn hàng và điểm mùa vẫn chung. Màn hiện "chạy thử nhanh ×N" ở đầu trang. Thử xong thì xóa biến để về giờ thật.

## 5. Đi đường và gặp nạn

- Mỗi chặng tốn **1 lộ phiếu**; **5 lộ phiếu mỗi ngày**, không cộng dồn, không mua thêm. Đi theo giờ thật, không cần mở game.
- Gặp nạn bốc lúc xuất hành, hiện khi tới nơi: giặc sông (đường sông), sóng dữ (chặng vượt biển), thảo khấu (đường bộ). Tỉ lệ 10–15%, +10% khi chở kỳ trân, tối đa 2 nạn mỗi ngày.
- Xử lý: nộp mãi lộ mất 10% giá trị hàng, hoặc đánh một trận ghép ô rất dễ (bàn giao tranh của Sử Lộ, Thành lực 120, 8 nước; đánh bừa thắng khoảng 99%). Thắng giữ trọn hàng; thua hoặc bỏ chạy mất 30% giá trị hàng, kỳ trân mất trước. Không bao giờ mất đoàn. Server dựng lại trận từ hạt giống và chuỗi nước gửi lên.

## 6. Giao thương giữa đường

- Hai đoàn đi cùng một chặng (chiều nào cũng được), trùng giờ ít nhất 5 phút là gặp nhau; không cần cùng online.
- Tới nơi, một bên ngỏ lời: đưa hàng và/hoặc kim tiền, xin hàng và/hoặc kim tiền. Phần đưa ra bị khóa tới khi bên kia trả lời. Xem được khoang của bên kia trước khi quyết; **kim tiền của người khác không hiện ở đâu**, trừ lãi mùa trên bảng Công trạng.
- Hai bên đồng ý mới đổi. Mỗi chuyến chỉ giao thương một lần. Lời ngỏ tự hủy (trả hàng khóa) khi một bên xuất hành chặng mới hoặc khi mùa khép. Không giới hạn số lần giữa một cặp, không chặn chênh giá trị (chênh giá mua bán đã đủ, Shan 26/11/2026). Không có trò chuyện.

### 6.1 Thương đoàn của các nhân vật (Shan chốt 27/11/2026)

- **Là người chơi thật trong mùa.** 20 nhân vật (12 sứ quân, 6 tướng lịch sử, Minh Nguyệt, Vũ Phong) mỗi người một đoàn hàng lưu chung bảng `trade_players` (mã `bot:<id>`): vốn 10.000, cấp 1, 5 lộ phiếu mỗi ngày, gặp nạn thì nộp mãi lộ. Mua bán qua **kho chung** như mọi người nên làm giá và tồn kho đổi thật.
- **Tên:** sứ quân ghi "Sứ quân <tên>" (ví dụ Sứ quân Trần Lãm), còn lại ghi tên nhân vật. Không ghi "máy" (Shan 27/11/2026). Khi gặp giữa đường có thêm dòng tính cách và lối buôn.
- **Chạy lười, không cần tiến trình nền:** mỗi lần có người mở Hành Thương Ký, server cho các đoàn tới việc đi tiếp (mỗi kho tối đa một lần mỗi 20 giây): tới chợ nghỉ 30 phút (để người tới sau còn kịp gặp), bán sạch hàng chợ thu mua, chọn chuyến kế theo giá đang niêm yết ở các điểm kề, mua rồi xuất hành. Không có lãi thì đi không sang điểm kề.
- **Đệm dân số:** vắng người thì đủ 20 đoàn; cứ 5 người thật có ghi trong 24 giờ qua thì bớt một đoàn, ít nhất 6 đoàn. Thứ tự nghỉ xáo theo mùa.
- **Trần tài:** lãi mùa của mỗi đoàn không vượt quá trần mỗi ngày nhân số ngày đã qua của mùa. Trần chung 3.000/ngày, xê dịch 60–120% theo nhân vật (`TRADE_BOT_DAILY_CAP`, `tradeBotDailyCap`). Chạm trần thì chỉ bán hàng đang chở. Mô phỏng một tuần (mở chế độ mỗi 10 phút, chỉ có đoàn nhân vật): lãi 13.000–25.000, 12–27 chặng mỗi đoàn.
- **Bảng Công trạng:** đoàn nhân vật có lãi đứng trên bảng như người. **Thưởng mùa chỉ xếp giữa người thật**: hạng thưởng và số người tính lại sau khi bỏ các đoàn nhân vật (`seasonSource(..., TRADE_BOT_OWNERS)`), đoàn nhân vật không nhận thưởng.
- **Đoàn nhân vật ngỏ trước:** mỗi đoàn đã gặp (chưa giao thương chuyến đó) ngỏ một lần, bán một phần món đắt nhất trong khoang lấy kim tiền theo giá chợ nơi tới nhân hệ số lối buôn. Đồng ý thì đổi ngay bằng hàng và tiền thật của cả hai bên; từ chối thì không hiện lại và vẫn còn lượt giao thương.
- **Người chơi ngỏ:** đoàn nhân vật trả lời ngay. Nhận khi có đủ hàng và kim tiền bị xin, và giá trị nhận về (hàng người chơi đưa tính 90% như chợ thu mua) ít nhất bằng mức chịu của lối buôn nhân giá trị phải đưa. Chê giá thì người chơi ngỏ lại được. Đổi xong thì đoàn đó cũng hết lượt giao thương chuyến đó.
- Lối buôn theo tính cách (`TRADE_STYLES`, `src/core/trade/bots.ts`):

| Tính cách | Bỏ vốn mỗi chuyến | Chọn trong | Lãi tối thiểu | Ưu tiên | Giá bán cho người gặp | Mức chịu khi được ngỏ | Phần hàng đem bán |
|---|---|---|---|---|---|---|---|
| Mãnh công | 90% | 1 phương án tốt nhất | 3% | | ×1,00 | 0,95 | 50% |
| Thủ thành | 50% | 2 | 8% | ít kỳ trân | ×1,00 | 1,00 | 30% |
| Mưu phá | 70% | 2 | 6% | chở tới nơi đang Hiếm | ×1,15 | 1,12 | 30% |
| Tích lực | 60% | 2 | 12% | | ×1,10 | 0,92 | 20% |
| Liều lĩnh | 100% | 3 | 2% | kỳ trân | ×0,90 | 1,05 | 60% |
| Lão luyện | 75% | 1 | 6% | nơi Hiếm | ×1,03 | 1,00 | 35% |
| Hộ chủ | 60% | 2 | 5% | | ×0,95 | 0,92 | 40% |
| Tùy cơ | 70% | 3 | 5% | kỳ trân, nơi Hiếm | ×1,05 | 1,00 | 40% |

## 7. Đoàn hàng

Khoang 100 ở cấp 1. Một đường nâng cấp chung (Shan chọn), trả bằng kim tiền, làm lại mỗi mùa:

| Cấp | Khoang | Thời gian đi | Giá |
|---|---|---|---|
| 1 | 100 | 100% | – |
| 2 | 125 | 90% | 1.500 |
| 3 | 150 | 80% | 3.000 |
| 4 | 175 | 70% | 6.000 |
| 5 | 200 | 60% | 12.000 |

## 8. Mùa, điểm và thưởng

- **Kim tiền** riêng của chế độ, khác vàng chung. Ai cũng bắt đầu 10.000. Mùa một tuần, đổi vào thứ Hai 0 giờ giờ Việt Nam; kim tiền, khoang, cấp đoàn hàng làm lại từ đầu.
- Điểm mùa = kim tiền − 10.000 (hàng còn trong khoang và tiền nâng cấp không tính). Chỉ người có lãi lên bảng (`SeasonMode` `trade`, bảng ở thẻ Công trạng của chế độ và trang Công Trạng).
- Hết mùa thưởng theo hạng ở Ban Thưởng hạng (`RankRewardMode` `trade`): vàng như Quần Hùng – Thư Hùng (600/400/240/100/40) kèm **Đá Cường Hóa** 4/3/2/1/0.
- Không có nhiệm vụ ngày cho chế độ này.

## 9. Chưa làm

- Tranh thẻ chế độ (`public/art/home/`) và biểu tượng (`public/art/modes/trade.webp`): thẻ đang dùng tranh mực tạm, trang chủ dùng bản đồ.
- Bật cờ `TRADE_ENABLED=true` trên Vercel khi Shan muốn mở.
