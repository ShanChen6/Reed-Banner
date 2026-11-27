# Điền Trang Ký: làm phú hộ trên đất mười hai sứ quân

> Cập nhật: 27/11/2026 (bản thử đầu tiên)
> Trạng thái: **IMPLEMENTED (bản thử)** — Shan yêu cầu chế độ "phú hộ" theo thể loại cờ tỷ phú và chốt 9 mục thiết kế 27/11/2026. Lối chơi chung của thể loại (đổ xúc xắc, đi vòng, mua đất, xây nhà, thu tô); bàn, ô, quẻ, luật và hình tự làm, không chép trò nào (không đấu giá, không thẻ Cơ hội/Khí vận).

## 1. Định vị

Chế độ đấu trí 2–4 người theo lượt, không dùng bàn match-3. Thẻ ở mục **Giải đố** của Chiến trường (kicker "Đánh cờ"), đường dẫn `/game/tycoon`, scene `DIEN_TRANG_KY`.

Mã: lõi thuần `src/core/dien-trang-ky/` (`board.ts` bàn và số liệu, `game.ts` luật, `omens.ts` 18 quẻ, `bot.ts` máy theo tính cách), server `src/server/dienTrangKy.ts` + `src/server/db/dienTrangKy.ts` (bảng `dtk_matches`, `dtk_rewards`, migration `0020_dtk_matches`), API `src/app/api/tycoon/route.ts`, màn `src/app/game/dien-trang-ky/`. Test ở `tests/core/dien-trang-ky/` và `tests/server/dien-trang-ky.test.ts`. Tắt nhanh phần server bằng `DIEN_TRANG_KY_SERVER_ENABLED=false`.

## 2. Ba cách chơi (Shan chốt mục 5)

| Cách chơi | Chạy ở | Thưởng |
| --- | --- | --- |
| Đấu sứ quân có thưởng: một người với 1–3 sứ quân máy | Server trọng tài, máy đi ngay trong request | Vàng theo hạng |
| Cùng máy: 2–4 ghế, mỗi ghế là người ngồi chung máy hoặc sứ quân máy | Trình duyệt, lưu ván dở ở máy | Không |
| Phòng mã: chủ phòng mở phòng, người khác vào bằng mã 6 ký tự, chủ phòng thêm sứ quân máy vào ghế trống rồi khai cuộc | Server trọng tài, hỏi lại mỗi 1,5 giây | Vàng theo hạng |

Phòng mã: mỗi quyết định 30 giây; quá giờ thì máy đi thay một bước, quá giờ hai lần liền thì máy đi thay luôn tới khi người đó ra lệnh lại. Phòng chờ hết hạn sau 30 phút.

## 3. Bàn 40 ô (mục 2)

Lưới 11×11, Hoa Lư ở góc dưới phải, đi ngược chiều kim đồng hồ.

- **24 ô đất** chia 9 dãy mang tên vùng của 9 sứ quân: dãy đôi Đỗ Động (60 quan), dãy ba Hồi Hồ (80), Đường Lâm (100), Phong Châu (140), Tây Phù Liệt (180), Tiên Du (220), Siêu Loại (260), dãy đôi Đằng Châu (300) và Bố Hải Khẩu (350). Mỗi cạnh: cạnh 1 có 5 ô đất, cạnh 2 và 3 mỗi cạnh 6, cạnh 4 có 7. Ba sứ quân Nguyễn Khoan, Ngô Xương Xí, Lữ Đường không có dãy nhưng vẫn làm máy chơi.
- **4 danh thắng** ở giữa mỗi cạnh (ô 5, 15, 25, 35): Đền Hùng, Núi Tản Viên, Chùa Dâu, Tràng An. Giá 200 quan, không xây nhà; tô theo số danh thắng cùng chủ: 50, 100, 200, 400 quan. Chỉ mua được khi còn trống; đã có chủ thì không ai mua lại được (Shan chốt 27/11). Mở hội được như đất thường.
- **4 góc**: Kinh thành Hoa Lư (xuất phát, đi qua lĩnh 200 quan lương vòng), Lao Ngục (ô 10; dừng thường chỉ là ghé qua), Hội Cờ Lau (ô 20; mở hội trên một ô của mình: tô gấp đôi tới khi mở hội nơi khác), Bến Sông Đáy (ô 30; trả 50 quan tiền đò để tới ô bất kỳ).
- **8 ô riêng**: 4 Quẻ bói, Thuế đinh (một phần mười tiền mặt, ít nhất 20), Cống nạp (50 quan cộng 15 quan mỗi bậc nhà), 2 Chợ phiên (mua một ô đất trống bất kỳ theo giá gốc).
- **Bị giam**: rút quẻ “Bị quan bắt giam” thì về Lao Ngục, không lĩnh lương, hết lượt. Mỗi lượt sau đổ thử một lần: ra đôi thì ra và đi luôn (không được đổ thêm); hỏng 3 lần thì mãn hạn, đi theo lần đổ cuối. Đầu lượt có thể nộp 100 quan chuộc để ra rồi đổ như thường. Trong ngục vẫn thu tô. Phúc miễn tô chỉ còn qua quẻ “Phúc ấm tổ tiên”.

Thứ tự ô và tên ở `TILES` trong `board.ts`.

## 4. Lượt chơi

1. Đổ hai xúc xắc, đi đủ số ô. Đổ ra đôi được đổ thêm một lần, tối đa một lần mỗi lượt.
2. Xử ô dừng:
   - Đất trống: được mua, lúc mua được dựng luôn tới bậc 3.
   - Đất của mình: được xây thêm bậc.
   - Đất người khác: **nộp tô hoặc mua lại** (mục 4). Mua lại tốn gấp đôi giá trị ô (đất và nhà), trả cho chủ đất, nhà giữ nguyên; mua xong còn tiền thì được xây thêm. Trang ấp và danh thắng không mua lại được.
   - Ô riêng và góc như mục 3.
3. Hết lượt.

## 5. Nhà năm bậc (mục 3)

Giá đất khác nhau theo khu (60 tới 350 quan). Giá xây và tô đều tính theo phần trăm (Shan 27/11): giá xây theo giá đất của khu (`BUILD_RATE`), tô theo giá trị ngôi nhà, tức tổng vốn đã bỏ vào ô (`RENT_RATE`).

| Bậc | Tên | Giá xây (% giá đất) | Giá trị ô (lần giá đất) | Tô (% giá trị ô) | Ví dụ ô giá 200: tô |
| --- | --- | --- | --- | --- | --- |
| 0 | Đất (đã có chủ, chưa xây) | 100 (mua đất) | 1 | 15 | 30 |
| 1 | Nhà tranh | 50 | 1,5 | 30 | 90 |
| 2 | Nhà gỗ | 50 | 2 | 45 | 180 |
| 3 | Nhà ngói | 50 | 2,5 | 60 | 300 |
| 4 | Dinh thự | 50 | 3 | 70 | 420 |
| 5 | Trang ấp | 100, chỉ khi hùng cứ | 4 | 75 | 600 |

Nguyên tắc: một lần thu tô (chưa tính hùng cứ, lễ hội) không vượt giá trị ô. Bảng cũ (tô 4,5 lần giá đất ở Trang ấp) làm Dinh thự gỡ vốn sau một lần dừng.

- **Dãy và hùng cứ** (Shan chọn 27/11: 3 dãy đôi, 6 dãy ba): chỉ khi giữ đủ dãy mới nhân tô (Shan 27/11): dãy đôi nhân 1,5, dãy ba nhân 2. Giữ đủ dãy mới xây được Trang ấp.
- **Lễ hội nhỏ**: đầu ván chọn ngẫu nhiên theo seed 3 ô đất có lễ hội suốt ván (đèn lồng trên ô). Giá không đổi, tô nhân 1,5; cộng dồn với hùng cứ và Hội Cờ Lau.
- **Thiên tai** (Shan 27/11): người rút quẻ chọn một ngôi nhà của nhà khác (bậc 1 tới 4). Động đất: nhà đó sập một bậc. Bão lũ: nhà đó giữ nguyên bậc nhưng phải sửa 1 tới 3 lượt của chủ (ngẫu nhiên), trong lúc sửa không thu tô, người dừng chỉ được chọn mua lại hoặc đi tiếp. Hai hiệu ứng không xảy ra cùng lúc. Đất chưa xây và Trang ấp (nhà cao cấp) không bị ảnh hưởng. Không có nhà nào hợp lệ thì quẻ qua.
- **Nguyên tố** chỉ quyết định kiểu nhà (vật trên nóc, chi tiết), không đổi tô hay luật.
- **Màu nhà** (Shan 28/11): mỗi ghế một màu trong 8 màu (`DTK_COLORS`: đỏ son, lam, lục, vàng nghệ, tím, cam, hồng, chàm), tô mái nhà, viền ô đất, quân và khung tên, nên hai nhà cùng hệ vẫn phân biệt được. Người thật tự chọn; màu đã có người chọn bị khóa (cùng máy: khóa giữa các người ngồi chung; phòng mã: chọn lúc mở hoặc vào phòng, đổi được trong phòng chờ, server từ chối màu trùng). Máy lấy màu còn trống.
- **Hoạt ảnh** (Shan 28/11): luật chạy xong ngay trong lõi, màn diễn lại nhật ký mới (`usePlayback.ts`): xúc xắc lăn khoảng nửa giây, quân nhảy từng ô (đi xa thì nhanh hơn, tối đa 1,5 giây), dừng một nhịp ở việc đáng đọc. Trong lúc diễn bàn giữ hình trước nước đi, nút khóa, máy chờ diễn xong mới đi. Máy bật giảm chuyển động thì diễn rút gọn.

## 6. Quẻ bói

18 quẻ thời loạn (`omens.ts`), xếp lại theo seed đầu ván rồi rút vòng: được mùa, giặc đốt kho, Hoa Lư ban thưởng, về Hoa Lư, lũ tràn bờ đê (20 quan mỗi bậc nhà), khao quân (trả mỗi người 30), các làng góp lễ (nhận của mỗi người 30), ngựa trạm gấp (tiến 3), sạt lở (lùi 3), thầy địa lý (tới ô đất trống gần nhất), phúc ấm (miễn tô một lần), bị quan bắt giam (vào Lao Ngục), gọi đò (tới Bến Sông Đáy), thợ làng dựng giúp (ô thấp nhất lên một bậc), thuế muối (một phần mười tiền mặt), thương lái trả nợ, động đất (chọn nhà người khác, sập một bậc), bão lũ (chọn nhà người khác, phải sửa); xem Thiên tai ở mục 5.

## 7. Hết tiền và kết thúc (mục 6, 7)

- Thiếu tiền thì chọn ô đất để bán lại cho triều đình được nửa giá trị. Bán hết vẫn thiếu là **phá sản**: tiền còn lại về chủ nợ, đất về trống, rời ván. Không đổi hay bán đất giữa người chơi.
- Rời ván giữa chừng tính như phá sản.
- **Thắng ngay** (Shan 27/11): giữ hết đất trên một cạnh bàn (không tính danh thắng), hoặc giữ đủ bốn danh thắng. Người thắng xếp hạng nhất, những người còn lại xếp theo tài sản.
- Không ai thắng ngay thì chơi tới khi chỉ còn một người. Ván trên server mà không còn người thật nào thì chốt ngay, xếp các máy còn lại theo tài sản. Chốt an toàn 1.600 lượt (chạy thử chưa ván nào chạm).
- Xếp hạng: người còn lại hạng nhất, rồi ngược thứ tự phá sản.

## 8. Thưởng (mục 8)

Vàng theo thứ hạng trong ván (mức Claude đặt, chờ Shan duyệt; `DTK_GOLD` trong `board.ts`):

| Số người | Hạng 1 | Hạng 2 | Hạng 3 | Hạng 4 |
| --- | --- | --- | --- | --- |
| 2 | 40 | 0 | | |
| 3 | 60 | 25 | 0 | |
| 4 | 80 | 40 | 15 | 0 |

Mỗi tài khoản tối đa 3 ván có vàng mỗi ngày (giờ Việt Nam). Không có xếp hạng mùa. Ván cùng máy không có vàng.

## 9. Máy chơi

Mười hai sứ quân, mỗi người một tính cách (cùng tên bộ tính cách của bot nhân vật): Mãnh công (Phạm Bạch Hổ, Lý Khuê, Nguyễn Siêu) mua hăng, xây cao, giữ ít tiền; Thủ thành (Nguyễn Khoan, Kiều Thuận) giữ tiền chắc; Mưu phá (Ngô Xương Xí, Ngô Nhật Khánh) chuyên mua lại để phá hùng cứ; Tích lực (Kiều Công Hãn, Lữ Đường) gom đất trước, đủ tiền mới xây; Liều lĩnh (Đỗ Cảnh Thạc); Lão luyện (Trần Lãm), cũng là lối máy đi thay người quá giờ; Tùy cơ (Nguyễn Thủ Tiệp) giàu thì giữ, nghèo thì liều. Máy chỉ nhìn bàn như người chơi, không biết trước xúc xắc hay quẻ.

Chạy thử 300 ván mỗi cỡ (máy với máy, có thắng ngay, máy gặp danh thắng là mua khi chưa tới hai nhà giữ danh thắng, sau đó cân theo tiền; mua lại để chặn): trung vị 75 / 112 / 150 lượt cho 2 / 3 / 4 người (khoảng 38 / 37 / 38 vòng), không ván nào chạm chốt an toàn. Cách kết thúc: đủ bốn danh thắng khoảng 47–50%, giữ hết một cạnh khoảng 22–25%, phá sản tới người cuối khoảng 27–31%.

## 10. Hình

Nhà năm bậc × bảy hệ đã có tranh (28/11): `public/art/dien-trang-ky/house/<bậc>-<hệ>.webp` cộng lớp mặt nạ `-mask.webp` tách từ vùng #ff00ff, game tô mặt nạ bằng màu ghế. Prompt nhà ở `/mnt/project-files/art/prompts/dien-trang-ky-nha.md`.

Bàn, ô và xúc xắc vẫn vẽ bằng code. Chờ Shan vẽ: tranh thẻ `public/art/home/dien-trang-ky.webp`, banner, biểu tượng ô riêng. Prompt ở `/mnt/project-files/art/prompts/dien-trang-ky.md`.
