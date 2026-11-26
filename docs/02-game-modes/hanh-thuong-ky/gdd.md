# Hành Thương Ký: buôn bán khắp mười ba bến chợ

> Cập nhật: 26/11/2026
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

| Nhóm | Món | Ghi chú |
|---|---|---|
| Phổ thông | Lúa gạo, muối hạt, vải gai, cá khô, củi than | Có ở mọi chợ, giá theo loại điểm |
| Đặc sản | Mỗi điểm (trừ Cửa Đại Ác) một món: gỗ lim (Hoa Lư), nước mắm (Bố Hải), nhãn khô (Đằng Châu), tơ tằm (Tế Giang), cá sông khô (Tam Đái), chiếu cói (Đỗ Động), giấy dó (Tây Phù Liệt), gốm (Siêu Loại), chè (Tiên Du), quế (Phong Châu), mật ong rừng (Hồi Hồ), đá ong (Đường Lâm) | Rẻ ở quê nhà; nơi khác gắn nhãn **Hiếm**, càng xa càng đắt (tối đa ×1,5). Đặc sản là game dựng, không phải sử chép |
| Kỳ trân | Ngà voi, trầm hương, ngọc trai, đồi mồi, san hô | Chỉ thỉnh thoảng có hàng ở vài nơi; 5 món chiếm một chỗ khoang; chở kỳ trân dễ gặp nạn hơn |

## 4. Giá và kho chung

- Khung giá 2 giờ, đổi vào giờ chẵn giờ Việt Nam. Server tính, ai cũng thấy như nhau. Xem được giá và tồn của mọi chợ trong khung hiện tại, không xem khung sau.
- Giá = giá gốc × hệ số vùng × xu hướng (nhiễu trơn theo mùa, điểm, món) × sức ép kho (tồn lúc mở khung so với mức bình thường, từ ×0,7 tới ×1,4).
- Giá thu mua = 90% giá bán ra cùng khung, nên mua rồi bán tại chỗ luôn lỗ.
- **Kho chung cho mọi người** (cạnh tranh): ai mua thì tồn giảm, ai bán thì hàng vào kho. Chợ không nạp mặc định; mỗi khung chỉ tự sinh hoặc tiêu thụ 8% phần chênh với mức bình thường. Kỳ trân hao 10% mỗi khung và thỉnh thoảng có thuyền mang tới ở nơi có nguồn. Chợ ứ quá mức thì tạm không thu mua món đó.

## 5. Đi đường và gặp nạn

- Mỗi chặng tốn **1 lộ phiếu**; **5 lộ phiếu mỗi ngày**, không cộng dồn, không mua thêm. Đi theo giờ thật, không cần mở game.
- Gặp nạn bốc lúc xuất hành, hiện khi tới nơi: giặc sông (đường sông), sóng dữ (chặng vượt biển), thảo khấu (đường bộ). Tỉ lệ 10–15%, +10% khi chở kỳ trân, tối đa 2 nạn mỗi ngày.
- Xử lý: nộp mãi lộ mất 10% giá trị hàng, hoặc đánh một trận ghép ô rất dễ (bàn giao tranh của Sử Lộ, Thành lực 120, 8 nước; đánh bừa thắng khoảng 99%). Thắng giữ trọn hàng; thua hoặc bỏ chạy mất 30% giá trị hàng, kỳ trân mất trước. Không bao giờ mất đoàn. Server dựng lại trận từ hạt giống và chuỗi nước gửi lên.

## 6. Giao thương giữa đường

- Hai đoàn đi cùng một chặng (chiều nào cũng được), trùng giờ ít nhất 5 phút là gặp nhau; không cần cùng online.
- Tới nơi, một bên ngỏ lời: đưa hàng và/hoặc kim tiền, xin hàng và/hoặc kim tiền. Phần đưa ra bị khóa tới khi bên kia trả lời. Xem được khoang của bên kia trước khi quyết; **kim tiền của người khác không hiện ở đâu**, trừ lãi mùa trên bảng Công trạng.
- Hai bên đồng ý mới đổi. Mỗi chuyến chỉ giao thương một lần. Lời ngỏ tự hủy (trả hàng khóa) khi một bên xuất hành chặng mới hoặc khi mùa khép. Không giới hạn số lần giữa một cặp, không chặn chênh giá trị (chênh giá mua bán đã đủ, Shan 26/11/2026). Không có trò chuyện.

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
