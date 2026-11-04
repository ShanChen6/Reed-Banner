# Viễn Chinh — Hai đạo quân trên sa bàn

> Cập nhật: 04/11/2026
> Trạng thái: **APPROVED** — Shan chọn cơ chế "Hai đạo quân trên sa bàn" ngày 04/11/2026; Shan chốt mục 8 cùng ngày (thua trận rút về, giới hạn lượt mỗi ngày; sau đó chốt chơi offline, không bảng xếp hạng); số liệu ở mục 5 và số lượt mỗi ngày là điểm xuất phát do Claude đặt, chờ Shan chơi thử. Code nằm sau cờ `EXPEDITION_ENABLED` (mặc định tắt).

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

1. **Chọn sa bàn và bậc.** Sáu sa bàn (mục 4), mỗi sa bàn ba bậc. Bậc I luôn mở; bậc sau mở khi đã thắng bậc trước của
   cùng sa bàn.
2. **Chia hai đạo.** Đạo Chính: Đinh Bộ Lĩnh (nghề và hệ đang chọn ở Doanh Trại) và 2 tướng. Biệt đạo: 3 tướng, người đầu
   là thống lĩnh. Sáu người khác nhau, đều đã chiêu mộ. Người mới có đúng 5 tướng khởi đầu nên vào được ngay.
   Chỉ số và trang bị được **chụp lúc xuất quân**; đổi đồ trong lúc viễn chinh không ảnh hưởng.
3. **Hành quân theo ngày.** Mỗi ngày chọn **một** việc:
   - **Tiến quân:** một đạo đi sang ô kề. Ô có địch thì đánh; ô đã chiếm hoặc làng thì đi luôn.
   - **Đóng quân:** cả hai đạo nghỉ.
   Việc nào cũng tốn một ngày; riêng đường **vượt nước** tốn 2 ngày (mục 3.9). Đạo không tiến quân trong ngày thì **nghỉ**: mọi người hồi 15% máu tối đa (kể cả người
   gục, họ đứng dậy) và thêm 10 lương.
4. **Thắng** khi chiếm được thành đích. **Thua** khi hết số ngày của sa bàn mà chưa chiếm, hoặc khi rút quân.

## 3. Luật

### 3.1 Ô trên sa bàn

| Loại | Địch | Ghi chú |
|---|---|---|
| Trại | — | Điểm xuất phát của mỗi đạo |
| Đồn | 2 | AI Dễ ở Bậc I |
| Chòi canh | 2 | AI Dễ ở Bậc I. Chiếm được: vén sương mù mọi ô trong 2 bước (mục 3.8) |
| Kho lương | 2 | Chiếm được: cả hai đạo +20 lương |
| Lũy | 3 | AI Thường ở Bậc I |
| Làng | — | Lần đầu ghé: cả đạo hồi 35% máu (kể cả người gục), +20 lương |
| Thành đích | 3 | Tướng giữ thành máu ×1,5, AI Khó ở Bậc I. Chiếm được là thắng |

- Đường đi hai chiều. Hai đạo được đứng chung một ô.
- Đối thủ của mỗi ô sinh theo seed của lượt (cố định suốt lượt) từ 42 nhân vật kèm; khoảng nửa số địch cùng hệ với
  chiến địa. Màn chơi **báo trước** đối thủ của các ô còn địch **đang thấy** (tên, hệ, nghề, cấp, máu, độ khó AI); ô
  trong sương mù không báo.
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

### 3.6 Giới hạn mỗi ngày (Shan chốt 04/11/2026)

- Mỗi ngày (giờ Việt Nam, đổi lúc 0 giờ) được **xuất quân 3 lượt** (`EXPEDITION_RUNS_PER_DAY`). Lượt tính lúc xuất
  quân, kể cả lượt rút quân sớm hay thua. Hết lượt thì `POST /api/expedition/run` báo `dailyLimit`.
- Lượt đang đi dở qua 0 giờ vẫn đi tiếp, đánh tiếp được; giới hạn chỉ chặn xuất quân mới.
- Con số 3 do Claude đặt: một lượt khoảng 6–10 trận, thắng lần đầu mỗi bậc chỉ có một lần, nên giới hạn chủ yếu chặn
  cày vàng thắng lại. Đổi số chỉ cần sửa hằng số.

### 3.7 Chơi offline, không bảng xếp hạng (Shan chốt 04/11/2026)

- Viễn Chinh là chế độ **offline** như Bình Loạn: **khách chơi được**, không cần đăng nhập, **không có bảng xếp
  hạng**. Thưởng vẫn do server chốt và vẫn giới hạn lượt mỗi ngày (mục 3.6).
- Lý do: hướng tiếp theo là nhiệm vụ kịch bản cố định, nhiều kết thúc
  ([đề xuất](02-map-va-nhiem-vu-proposal.md)); bảng xếp hạng trên đề cố định dễ bị chép đường đi tốt nhất.
- Cùng ngày Shan từng chốt có bảng xếp hạng (bản đó cần đăng nhập); quyết định offline thay cho quyết định đó. Hồ sơ vẫn
  lưu `bestDays` (số ngày nhanh nhất từng bậc) để hiện "Nhanh nhất N ngày" ở màn chọn bậc.

### 3.8 Sương mù (Shan yêu cầu 04/11/2026)

- Sa bàn phủ sương mù. Chỉ thấy: ô hai đạo đang đứng và **các ô kề** (ô đi được), hai trại, ô đã chiếm hay đã đánh,
  và mọi ô trong **2 bước** quanh một chòi canh đã chiếm. Ô đã thấy vẫn thấy khi đạo quân đi xa nếu đã chiếm hay đã
  đánh; ô chỉ đi ngang qua tầm nhìn thì lại chìm vào sương.
- Thành đích luôn hiện vị trí (dấu "?" và tên) để người chơi biết hướng đi, nhưng không báo địch tới khi thấy.
- Đường đi chỉ vẽ khi có ít nhất một đầu đang thấy; đoạn chạy vào sương bị sương phủ.
- Server chỉ gửi báo trước địch của ô đang thấy (`expeditionVisible`). Định nghĩa sa bàn nằm trong code chung nên
  người đọc mã nguồn vẫn biết bố cục; sương mù là luật chơi, không phải bảo mật.
- Mô phỏng (mục 5.1) vẫn đi theo cả bản đồ, nên số liệu mô phỏng là trần trên của người chơi thật.

### 3.9 Vượt nước

- Một số đường là **vượt sông hay biển** (đường xanh đứt nét). Đi qua mất **2 ngày**: đạo kia nghỉ cả 2 ngày, giặc
  tăng viện theo 2 ngày. Đánh một ô qua đường vượt nước cũng mất 2 ngày, thắng hay thua.
- Màn chơi báo "Vượt nước: đi mất 2 ngày" trước khi tiến. Quá hạn giữa chừng thì lượt thua như hết ngày.

## 4. Sáu sa bàn

| Sa bàn | Hệ | Ô | Số ngày / chuẩn | Hình dạng |
|---|---|---|---|---|
| **Ải Bắc** | Kim | 11 | 12 / 8 | Đường đan nhau, có làng và kho lương ở giữa; dễ dồn quân giáp công. Hai cổng thành đều là lũy. Sa bàn nhập môn |
| **Thượng Du** | Mộc | 12 | 17 / 12 | Hai thung lũng tách rời, mỗi bên một làng, chỉ nối qua Đèo Ngang Núi (lũy). Đường dài, giáp công chỉ ở cổng thành |
| **Cửa Biển** | Thủy | 11 | 12 / 9 | **Kịch bản cố định** (từ 04/11/2026): rút dân, giữ cầu chặn thuyền viện, con nước, đường bị phá, phản công Chợ, phá cổng. Luật riêng ở [thiết kế Cửa Biển](03-cua-bien-thiet-ke.md) |
| **Ngã Ba Sông** | Thổ | 13 | 15 / 11 | Hai trại ở hai bờ đối diện, thành giữa ngã ba sông. Lội sông vào thẳng thành mất 2 ngày; đi vòng qua Lũy Bến Đò, Lũy Núi Sơn bằng đường bộ thì xa hơn. Có một chòi canh |
| **Kinh Thành** | Hỏa | 14 | 16 / 11 | Kinh thành có ba cổng lũy, chỉ vào thành qua cổng. Hai chòi canh ở hai cánh nhìn thấu đường vây; Chợ Phiên ở giữa hai trại nhưng phải vượt sông |
| **Quần Đảo** | Phong | 12 | 15 / 10 | Thành đảo giữa vịnh, chỉ Lũy Cầu Dài nối vào bằng đường bộ; còn lại đi thuyền giữa các đảo (2 ngày mỗi chặng). Một chòi canh ở đảo bắc |

Tên ô là địa danh hư cấu (không dùng tên nước láng giềng, không gắn với sự kiện lịch sử); đối thủ là tướng kèm của
game, không phải sứ quân. Tọa độ và cạnh ở `src/core/expedition/maps.ts`.

### 4.1 Tranh nền

- Mỗi sa bàn một **tranh riêng** 5:3 (Shan chốt 04/11/2026: tranh mới, không cắt từ bản đồ tổng). Câu lệnh vẽ ở
  [Prompt tranh sa bàn](../../06-art/prompts/vien-chinh-sa-ban.md). Tranh đặt ở `public/art/expedition/<tên>.webp`,
  khai báo trong `EXPEDITION_MAP_IMAGES`; khi có tranh, Claude dời tọa độ từng ô cho khớp thành, làng, bến trên tranh.
- Chưa có tranh thì sa bàn tạm hiện một vùng của bản đồ tổng Bình Loạn (`ExpeditionMap.art`). Không dùng ảnh nền của
  Trận Đồ.

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
| Ngã Ba Sông I | 87% | 6,5 | 70% | 70% | 0,5 | 25% |
| Ngã Ba Sông II | 90% | 7,0 | 50% | 50% | 0,7 | 22% |
| Ngã Ba Sông III | 67% | 7,8 | 20% | 17% | 1,4 | 19% |
| Kinh Thành I | 93% | 6,1 | 70% | 50% | 0,9 | 15% |
| Kinh Thành II | 87% | 7,1 | 47% | 13% | 1,6 | 11% |
| Kinh Thành III | 83% | 8,0 | 23% | 13% | 2,0 | 11% |
| Quần Đảo I | 97% | 5,3 | 77% | 60% | 0,6 | 53% |
| Quần Đảo II | 97% | 5,4 | 77% | 53% | 0,8 | 52% |
| Quần Đảo III | 87% | 5,5 | 67% | 40% | 1,1 | 51% |

Ba sa bàn mới đo sau lần chỉnh thứ 3 (giảm số ngày, tăng độ sâu cổng Kinh Thành và Lũy Cầu Dài); Shan cho dừng
cân bằng ở đây nên Bậc III của ba sa bàn này còn dễ hơn ba sa bàn cũ (67–87%). Mô phỏng thấy cả bản đồ (không có
sương mù), nên người chơi thật sẽ khó hơn một chút.

Thua gần như toàn bộ là hết ngày. Trận trung bình 13–22 lượt (hai phe cộng lại), tức khoảng 3–6 phút. Đánh hết một
lượt viễn chinh là 5–11 trận. Thượng Du III để khó có chủ ý (đội khởi đầu, không đồ); người chơi tới Bậc III thường đã có
đồ Tím/Cam và tướng mua, nên mức thật sẽ cao hơn.

## 6. Dữ liệu và server

- Hồ sơ có `expedition?: { cleared, stars, bestDays?, daily?, run }` (chưa vào chế độ thì không có; `daily` là
  `{ day, runs }` để giới hạn mỗi ngày). `run` chụp 6 người
  (`FighterConfig` đã gồm đồ) và máu, lương, vị trí từng đạo; ô đã chiếm và máu địch đánh dở; ngày; pha
  (`march` | `battle` | `won` | `lost`); trận đang đánh. Đọc bằng `parseExpedition` (bỏ dữ liệu hỏng).
- Trận Viễn Chinh là `Match` thường có thẻ `expedition: { runId, map, tier, node, army, day }`. Cộng thưởng trận chạy
  như trận thường rồi gọi `settleExpeditionMatch`, chỉ chốt khi `run.battle.matchId` đúng id trận (gửi lại không chốt
  hai lần).
- API (đều sau cờ `EXPEDITION_ENABLED`, tắt thì `featureDisabled`):

| Route | Việc |
|---|---|
| `GET /api/expedition` | Sáu sa bàn, bậc đã mở, sao, ngày nhanh nhất, lượt xuất quân còn trong ngày, lượt đang đi (không có seed), `visible` (ô ngoài sương mù), đối thủ báo trước của các ô còn địch đang thấy, theo từng đạo. Trận đã xong mà chưa chốt thì chốt luôn |
| `POST /api/expedition/run` `{ map, tier, main: [2], second: [3] }` | Xuất quân. Khách chưa có cookie thì được cấp; hết lượt trong ngày báo `dailyLimit` |
| `POST /api/expedition/march` `{ army, to }` | Tiến quân; gặp địch thì mở trận và trả id (đang có trận thì trả lại trận đó) |
| `POST /api/expedition/camp` | Đóng quân |
| `POST /api/expedition/abandon` | Rút quân; trận đang dở tính thua trước |

- Màn chơi `/game/expedition` (`EXPEDITION`). Home: thẻ ở hàng "Đang dựng" bấm được khi cờ bật. Sau trận có nút "Về sa
  bàn Viễn Chinh".

## 7. Ngoài phạm vi bản đầu

- Mùa cho bảng xếp hạng và thưởng theo hạng.
- Sự kiện ngẫu nhiên trên đường, địch phản công ô đã chiếm. Hướng mở rộng tiếp theo (nhiệm vụ, lệnh Trinh sát, sa bàn đổi theo kết quả) ở [Đề xuất sa bàn và nhiệm vụ](02-map-va-nhiem-vu-proposal.md) (DRAFT; Shan đã chốt sương mù và đường bị phá ở mục 11, còn câu hỏi mục 12).
- Tranh thumbnail Home riêng (`public/art/home/vien-chinh.webp`); banner tạm dùng tranh Bình Loạn.
- Thêm sa bàn: chỉ cần thêm một mục trong `EXPEDITION_MAPS`; test kiểm đồ thị tự chạy cho mọi sa bàn.

## 8. Shan đã quyết (04/11/2026)

- **Thua trận chỉ rút về** như mục 3.4 (không làm đạo tan hẳn).
- **Giới hạn lượt mỗi ngày như các chế độ khác:** 3 lượt xuất quân mỗi ngày, mục 3.6.
- ~~Có bảng xếp hạng, cần đăng nhập.~~ Thay bằng: **chơi offline, khách chơi được, không bảng xếp hạng** (mục 3.7).
