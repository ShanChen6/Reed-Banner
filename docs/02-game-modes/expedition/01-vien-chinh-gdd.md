# Viễn Chinh — Hai đạo quân trên sa bàn

> Cập nhật: 04/11/2026
> Trạng thái: **APPROVED** — Shan chọn cơ chế "Hai đạo quân trên sa bàn" ngày 04/11/2026; số liệu ở mục 5 là điểm xuất phát do Claude đặt theo mô phỏng, chờ Shan chơi thử. Code nằm sau cờ `EXPEDITION_ENABLED` (mặc định tắt).

File này là **nguồn chính cho luật Viễn Chinh**. Code ở `src/core/expedition/` (luật thuần), `src/server/expedition.ts`
và `src/server/expeditionSettle.ts` (server), `src/app/game/expedition/ExpeditionScreen.tsx` (màn chơi), mô phỏng ở
`src/core/sim/expedition.ts` và `scripts/expedition-sim.ts`.

## 1. Vì sao cần cơ chế riêng

Trước đây Viễn Chinh bị hoãn vì "chưa tìm ra cơ chế đủ riêng" ([danh mục chế độ](../future/01-mode-portfolio.md)). Các chế
độ đang có đều điều **một đội 3 người**:

| Chế độ | Điều gì người chơi quyết định |
|---|---|
| Bình Loạn | Đi tuyến truyện, chuẩn bị từng trận |
| Tháp Thí Luyện | Đội hợp luật tầng |
| Tháp Thiên Mệnh | Chọn 3 trong roster khóa cho từng tầng, chọn Phúc sau tầng (một đường thẳng) |
| Trấn Ải | Xoay người giữa các đợt trong một trận dài |
| Nhật Lệnh, Quần Hùng | Đánh một trận cho sẵn hoặc một đội phòng thủ |
| Trận Đồ, Tầm Tướng Ký | Không đánh nhau |

Viễn Chinh là chế độ duy nhất điều **hai đạo quân cùng lúc trên một bản đồ**. Quyết định chính không nằm trong trận mà
nằm ở **thứ tự và vị trí**: hôm nay đạo nào tiến, đạo nào nghỉ; đi đường nào; khi nào chờ đạo kia tới để giáp công; khi
nào đóng quân dù giặc đang tăng viện. Trận vẫn là trận match-3 3vs3 đánh tay như mọi chế độ.

## 2. Vòng chơi

1. **Chọn sa bàn và bậc.** Ba sa bàn (mục 4), mỗi sa bàn ba bậc. Bậc I luôn mở; bậc sau mở khi đã thắng bậc trước của
   cùng sa bàn.
2. **Chia hai đạo.** Đạo Chính: Đinh Bộ Lĩnh (nghề và hệ đang chọn ở Doanh Trại) và 2 tướng. Biệt đạo: 3 tướng, người đầu
   là thống lĩnh. Sáu người khác nhau, đều đã chiêu mộ. Người mới có đúng 5 tướng khởi đầu nên vào được ngay.
   Chỉ số và trang bị được **chụp lúc xuất quân**; đổi đồ trong lúc viễn chinh không ảnh hưởng.
3. **Hành quân theo ngày.** Mỗi ngày chọn **một** việc:
   - **Tiến quân:** một đạo đi sang ô kề. Ô có địch thì đánh; ô đã chiếm hoặc làng thì đi luôn.
   - **Đóng quân:** cả hai đạo nghỉ.
   Việc nào cũng tốn một ngày. Đạo không tiến quân trong ngày thì **nghỉ**: mọi người hồi 15% máu tối đa (kể cả người
   gục, họ đứng dậy) và thêm 10 lương.
4. **Thắng** khi chiếm được thành đích. **Thua** khi hết số ngày của sa bàn mà chưa chiếm, hoặc khi rút quân.

## 3. Luật

### 3.1 Ô trên sa bàn

| Loại | Địch | Ghi chú |
|---|---|---|
| Trại | — | Điểm xuất phát của mỗi đạo |
| Đồn | 2 | AI Dễ ở Bậc I |
| Kho lương | 2 | Chiếm được: cả hai đạo +20 lương |
| Lũy | 3 | AI Thường ở Bậc I |
| Làng | — | Lần đầu ghé: cả đạo hồi 35% máu (kể cả người gục), +20 lương |
| Thành đích | 3 | Tướng giữ thành máu ×1,5, AI Khó ở Bậc I. Chiếm được là thắng |

- Đường đi hai chiều. Hai đạo được đứng chung một ô.
- Đối thủ của mỗi ô sinh theo seed của lượt (cố định suốt lượt) từ 42 nhân vật kèm; khoảng nửa số địch cùng hệ với
  chiến địa. Màn chơi **báo trước** đối thủ của mọi ô còn địch (tên, hệ, nghề, cấp, máu, độ khó AI).
- Bàn cờ mọi trận nghiêng về loại ô hợp hệ chiến địa (cùng bảng `HOME_TERRAIN` với sân nhà của Tái đấu sứ quân).
- Người chơi luôn đi trước.

### 3.2 Giặc tăng viện

Sức mạnh của địch (công và máu) nhân thêm **5% cho mỗi ngày đã qua**: đánh một đồn ở ngày 9 khó hơn ở ngày 1 khoảng 40%.
Đóng quân để hồi sức luôn có giá.

### 3.3 Giáp công

Khi một đạo đánh một ô mà **đạo kia đang đứng ở ô kề ô đó** (và còn người đứng), máu tối đa của địch chỉ còn **75%**. Màn
chơi ghi rõ "Giáp công" trước khi đánh. Thành đích có 2–3 ngả vào, nên cách thắng thường là đưa hai đạo tới hai cổng
rồi một đạo đánh.

### 3.4 Thắng và thua một trận

- **Thắng:** đạo vào ô đó, mang theo máu và lương còn lại. Năng lượng và Nộ không mang sang.
- **Thua (hoặc bỏ trận):** đạo rút về ô cũ, **cả ba người gục**; địch ở ô đó giữ nguyên thương vong (lần đánh sau vào
  trận với máu còn lại). Đạo gục cả ba không tiến được cho tới khi nghỉ ít nhất một ngày. Lượt viễn chinh **không** kết
  thúc vì thua trận; cái giá là số ngày.
- Người đầu đạo đã gục thì người còn đứng kế tiếp cầm quân trong trận đó (thủ lĩnh trận phải còn máu).
- Lương mỗi đạo giữ trong khoảng 20–100, bắt đầu 60.

### 3.5 Sao và thưởng

- **Sao:** ★ chiếm thành · ★ xong trong số ngày chuẩn · ★ không thua trận nào. Lưu sao tốt nhất của từng sa bàn × bậc.
- **Mỗi trận:** thưởng như trận thường (kinh nghiệm cho 3 người của đạo, vàng và sách nhặt trên bàn, đồ rơi theo độ khó
  AI của ô), tính cả trận thua. Ghi nhiệm vụ như trận thường.
- **Thắng viễn chinh lần đầu ở một bậc:** vàng và một món trang bị theo hệ chiến địa (vũ khí theo nghề Đinh Bộ Lĩnh).
- **Thắng lại:** vàng nhỏ, không món.
- Thua viễn chinh không có thưởng thêm. Mọi thưởng do server chốt đúng một lần (`rewarded` trong lượt).
- Không có bảng xếp hạng ở bản đầu; khách chơi được (giống Bình Loạn).

## 4. Ba sa bàn

| Sa bàn | Hệ | Ô | Số ngày / chuẩn | Hình dạng |
|---|---|---|---|---|
| **Ải Bắc** | Kim | 11 | 12 / 8 | Đường đan nhau, có làng và kho lương ở giữa; dễ dồn quân giáp công. Hai cổng thành đều là lũy. Sa bàn nhập môn |
| **Thượng Du** | Mộc | 12 | 17 / 12 | Hai thung lũng tách rời, mỗi bên một làng, chỉ nối qua Đèo Ngang Núi (lũy). Đường dài, giáp công chỉ ở cổng thành. Sa bàn khó nhất |
| **Cửa Biển** | Thủy | 11 | 12 / 8 | Chợ Cửa Sông (kho lương) là nút giao giữa bãi; thành đích có ba ngả vào, cả ba là lũy hoặc đồn |

Tên ô là địa danh hư cấu ở vùng biên (không dùng tên nước láng giềng, không gắn với sự kiện lịch sử); đối thủ là tướng
kèm của game, không phải sứ quân. Tọa độ và cạnh ở `src/core/expedition/maps.ts`.

## 5. Số liệu (điểm xuất phát)

| Bậc | Cấp gợi ý | Sức mạnh địch ngày 1 | AI | Lần đầu | Thắng lại |
|---|---|---|---|---|---|
| I | 10 | ×0,80 | gốc | 300 vàng + món Lam | 80 vàng |
| II | 18 | ×0,88 | +1 nấc | 600 vàng + món Tím | 160 vàng |
| III | 26 | ×0,96 | +2 nấc | 1 000 vàng + món Cam | 300 vàng |

- Cấp địch = cấp gợi ý + độ sâu của ô − 3 (ô sát trại thấp hơn 2 cấp, thành đích cao hơn 1 cấp).
- Máu địch nhân thêm ×0,8 (trận trên sa bàn ngắn hơn trận thường, như Trấn Ải nhân ×0,6).
- Nghỉ: +15% máu, +10 lương. Làng: +35% máu, +20 lương. Kho lương: +20 lương cho cả hai đạo. Tăng viện 5%/ngày.
  Giáp công: máu địch ×0,75.
- Tổng thưởng lần đầu cả 9 bậc: 5 700 vàng và 9 món (3 Lam, 3 Tím, 3 Cam).

### 5.1 Mô phỏng

`pnpm exec tsx scripts/expedition-sim.ts --runs 30 [--maps aiBac] [--tiers 1,2,3] [--offset 0]`. Đội khởi đầu (Đinh Bộ Lĩnh
Mộc · Tướng sĩ và 5 tướng khởi đầu) ở đúng cấp gợi ý, không đồ, AI Thường đánh thay người chơi. Kế hoạch điều quân là
một luật tham lam: đi đường ngắn nhất tới hai cổng thành khác nhau, chờ đạo kia tới cổng để giáp công, đóng quân khi
đạo sắp đi còn dưới 55% máu. Người chơi thật chọn đội theo khắc hệ và điều quân khéo hơn, nên số dưới đây là cận dưới.

| Lần | Thay đổi | Ải Bắc I/II/III | Thượng Du I/II/III | Cửa Biển I/II/III |
|---|---|---|---|---|
| 1 | Thua trận là đạo tan, người gục không hồi | 70% (I) | 0% (I) | 60% (I) |
| 2 | Thua trận chỉ rút về, nghỉ hồi cả người gục; máu địch ×0,75 | 100 / 100 / 100% | 93 / 87 / 57% | 100 / 97 / 87% |
| 3 | Máu địch ×0,85, sức mạnh 0,85–1,05, tăng viện 5%, bớt ngày | 97 / 83 / –% | 60 / – / –% | 87 / 57 / –% |
| 4 | Máu ×0,8, sức mạnh 0,80–0,96, Thượng Du 17 ngày | 100 / 97 / 90% | 83 / 67 / 17% | 90 / 93 / 53% |
| 5 (chốt) | Ải Bắc: Chòi Gác Nam thành lũy; Thượng Du: kho lương phía nam thành làng | 97 / – / 77% | 87 / 77 / 27% | như lần 4 |

### 5.2 Kết quả bản chốt

30 lượt mỗi ô, 04/11/2026. "Sao" là tỉ lệ lượt đạt ít nhất số sao đó.

| Sa bàn · bậc | Thắng | Ngày khi thắng | ≥2 sao | 3 sao | Trận thua / lượt | Lượt đánh có giáp công |
|---|---|---|---|---|---|---|
| Ải Bắc I | 97% | 7,8 | 77% | 60% | 0,7 | 37% |
| Ải Bắc III | 77% | 9,8 | 23% | 13% | 2,2 | 32% |
| Thượng Du I | 87% | 12,2 | 47% | 27% | 1,6 | 14% |
| Thượng Du II | 77% | 11,7 | 47% | 20% | 2,5 | 9% |
| Thượng Du III | 27% | 13,3 | 13% | 3% | 4,8 | 5% |
| Cửa Biển I (lần 4) | 90% | 8,0 | 73% | 50% | 0,8 | 49% |
| Cửa Biển II (lần 4) | 93% | 8,5 | 63% | 20% | 1,3 | 39% |
| Cửa Biển III (lần 4) | 53% | 9,9 | 13% | 7% | 2,9 | 33% |

Thua gần như toàn bộ là hết ngày. Trận trung bình 13–22 lượt (hai phe cộng lại), tức khoảng 3–6 phút. Đánh hết một
lượt viễn chinh là 5–11 trận. Thượng Du III để khó có chủ ý (đội khởi đầu, không đồ); người chơi tới Bậc III thường đã có
đồ Tím/Cam và tướng mua, nên mức thật sẽ cao hơn.

## 6. Dữ liệu và server

- Hồ sơ có `expedition?: { cleared, stars, run }` (chưa vào chế độ thì không có). `run` chụp 6 người
  (`FighterConfig` đã gồm đồ) và máu, lương, vị trí từng đạo; ô đã chiếm và máu địch đánh dở; ngày; pha
  (`march` | `battle` | `won` | `lost`); trận đang đánh. Đọc bằng `parseExpedition` (bỏ dữ liệu hỏng).
- Trận Viễn Chinh là `Match` thường có thẻ `expedition: { runId, map, tier, node, army, day }`. Cộng thưởng trận chạy
  như trận thường rồi gọi `settleExpeditionMatch`, chỉ chốt khi `run.battle.matchId` đúng id trận (gửi lại không chốt
  hai lần).
- API (đều sau cờ `EXPEDITION_ENABLED`, tắt thì `featureDisabled`):

| Route | Việc |
|---|---|
| `GET /api/expedition` | Ba sa bàn, bậc đã mở, sao, lượt đang đi (không có seed), đối thủ báo trước của mọi ô còn địch theo từng đạo. Trận đã xong mà chưa chốt thì chốt luôn |
| `POST /api/expedition/run` `{ map, tier, main: [2], second: [3] }` | Xuất quân. Khách chưa có cookie thì được cấp |
| `POST /api/expedition/march` `{ army, to }` | Tiến quân; gặp địch thì mở trận và trả id (đang có trận thì trả lại trận đó) |
| `POST /api/expedition/camp` | Đóng quân |
| `POST /api/expedition/abandon` | Rút quân; trận đang dở tính thua trước |

- Màn chơi `/game/expedition` (`EXPEDITION`). Home: thẻ ở hàng "Đang dựng" bấm được khi cờ bật. Sau trận có nút "Về sa
  bàn Viễn Chinh".

## 7. Ngoài phạm vi bản đầu

- Bảng xếp hạng (ví dụ ít ngày nhất ở Bậc III) và mùa.
- Sự kiện ngẫu nhiên trên đường, sương mù che ô chưa tới, địch phản công ô đã chiếm.
- Tranh thumbnail Home riêng (`public/art/home/vien-chinh.webp`); banner tạm dùng tranh Bình Loạn.
- Thêm sa bàn: chỉ cần thêm một mục trong `EXPEDITION_MAPS`; test kiểm đồ thị tự chạy cho mọi sa bàn.

## 8. Cần Shan quyết

- Thua trận chỉ rút về và tốn ngày (bản này) hay đạo tan hẳn (khó hơn nhiều, mô phỏng lần 1)?
- Có nên giới hạn số lượt viễn chinh có thưởng mỗi ngày không (bản này: không giới hạn, vì thưởng trận như trận thường,
  thưởng lớn chỉ có một lần mỗi bậc).
- Có cần bảng xếp hạng và bắt đăng nhập không.
