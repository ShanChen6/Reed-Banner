# Viễn Chinh — Hai đạo quân trên sa bàn

> Cập nhật: 04/11/2026
> Trạng thái: **APPROVED** — Shan chọn cơ chế "Hai đạo quân trên sa bàn" ngày 04/11/2026; Shan chốt mục 8 cùng ngày (thua trận rút về, giới hạn lượt mỗi ngày; sau đó chốt chơi offline, không bảng xếp hạng); số liệu ở mục 5 và số lượt mỗi ngày là điểm xuất phát do Claude đặt, chờ Shan chơi thử. Code nằm sau cờ `EXPEDITION_ENABLED` (mặc định tắt).

File này là **nguồn chính cho luật Viễn Chinh**. Code ở `src/core/expedition/` (luật thuần), `src/server/expedition.ts`
và `src/server/expeditionSettle.ts` (server), `src/app/game/expedition/ExpeditionScreen.tsx` (màn chơi), mô phỏng ở
`src/core/sim/expedition.ts` và `scripts/expedition-sim.ts`.

## 1. Vì sao cần cơ chế riêng

Trước đây Viễn Chinh bị hoãn vì "chưa tìm ra cơ chế đủ riêng". Các chế
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

### 3.10 Trinh sát (mọi sa bàn từ 05/11/2026)

- Lệnh **Trinh sát**: đạo đang chọn đứng yên 1 ngày, không được nghỉ hồi sức (đạo kia nghỉ như thường), vén sương mọi ô
  trong 2 bước quanh nó và phát hiện đường bị phá có hai đầu trong vùng đó (sa bàn có đường bị phá).
- Trước đây chỉ Cửa Biển có lệnh này; Shan cho bật chung sau bản review ngày 05/11/2026.

## 4. Sáu sa bàn

| Sa bàn | Hệ | Ô | Số ngày / chuẩn | Hình dạng |
|---|---|---|---|---|
| **Ải Bắc** | Kim | 11 | 14 / 9 | Đường đan nhau, có làng và kho lương ở giữa; dễ dồn quân giáp công. Hai cổng thành đều là lũy. Sa bàn nhập môn |
| **Thượng Du** | Mộc | 12 | 20 / 14 | Hai thung lũng tách rời, mỗi bên một làng, chỉ nối qua Đèo Ngang Núi (lũy). Đường dài, giáp công chỉ ở cổng thành |
| **Cửa Biển** | Thủy | 11 | 17 / 12 | **Kịch bản đầy đủ** (từ 04/11/2026): rút dân, giữ cầu chặn thuyền viện, con nước, đường bị phá, phản công Chợ, phá cổng. Luật riêng ở [thiết kế Cửa Biển](03-cua-bien-thiet-ke.md) |
| **Ngã Ba Sông** | Thổ | 13 | 12 / 7 | Hai trại ở hai bờ đối diện, thành giữa ngã ba sông. Lội sông vào thẳng thành mất 2 ngày; đi vòng qua Lũy Bến Đò, Lũy Núi Sơn bằng đường bộ thì xa hơn. Có một chòi canh |
| **Kinh Thành** | Hỏa | 14 | 11 / 8 | Kinh thành có ba cổng lũy, chỉ vào thành qua cổng. Hai chòi canh ở hai cánh nhìn thấu đường vây; Chợ Phiên ở giữa hai trại nhưng phải vượt sông |
| **Quần Đảo** | Phong | 12 | 9 / 6 | Thành đảo giữa vịnh, chỉ Lũy Cầu Dài nối vào bằng đường bộ; còn lại đi thuyền giữa các đảo (2 ngày mỗi chặng). Một chòi canh ở đảo bắc |

Tên ô là địa danh hư cấu (không dùng tên nước láng giềng, không gắn với sự kiện lịch sử); đối thủ là tướng kèm của
game, không phải sứ quân. Tọa độ và cạnh ở `src/core/expedition/maps.ts`.

### 4.1 Tranh nền

- Mỗi sa bàn một **tranh riêng** 5:3 (Shan chốt 04/11/2026: tranh mới, không cắt từ bản đồ tổng). Câu lệnh vẽ ở
  [Prompt tranh sa bàn](../../06-art/prompts/vien-chinh-sa-ban.md). Tranh đặt ở `public/art/expedition/<tên>.webp`,
  khai báo trong `EXPEDITION_MAP_IMAGES`; khi có tranh, Claude dời tọa độ từng ô cho khớp thành, làng, bến trên tranh.
- Chưa có tranh thì sa bàn tạm hiện một vùng của bản đồ tổng Bình Loạn (`ExpeditionMap.art`). Không dùng ảnh nền của
  Trận Đồ.

### 4.2 Luật riêng từng sa bàn (Shan yêu cầu 05/11/2026)

Sau bản review, Shan cho mỗi sa bàn ngoài Cửa Biển một hai khối luật nhẹ. Không thêm luật mới: mọi khối đã có từ Cửa
Biển ([thiết kế Cửa Biển](03-cua-bien-thiet-ke.md) mục 3 và 5), số liệu dùng chung (trận giữ 8 lượt ×1,2; phản công
6 lượt, 3 địch ×1,4; cổng thành bền ×1,2 máu tướng giữ, giáp ×2). Khai báo ở `EXPEDITION_SCENARIOS`
(`src/core/expedition/scenario.ts`); không đổi ô hay đường của sa bàn.

| Sa bàn | Khối luật | Ý đồ |
|---|---|---|
| **Ải Bắc** | Đường bị phá: 2 trong 4 lối đèo (Khe Đá–Đèo Mây, Đèo Mây–Gác Bắc, Suối Lạnh–Bãi Lau, Bãi Lau–Gác Nam). Phá cổng ở thành đích | Nhập môn hai khối dễ hiểu nhất: trinh sát trước khi qua đèo, và trận phá cổng |
| **Thượng Du** | Viện binh vào thành cuối ngày 8 và 13 (mỗi lần +15%). Đèo Ngang Núi thành trận giữ (6 lượt, địch không mạnh thêm vì đây là lũy trên đường dài nhất); giữ được thì chặn viện binh | Đèo là lối hội quân duy nhất: ai giữ đèo thì cả hai đạo đỡ đánh thành mạnh lên |
| **Ngã Ba Sông** | Phản công Kho Thóc Bãi Giữa hai ngày sau khi chiếm | Kho ở giữa hai bờ: lấy lương rồi phải để một đạo đứng giữ, hoặc chịu mất kho |
| **Kinh Thành** | Viện binh vào thành cuối ngày 4 và 7. Lũy Cầu Tây thành trận giữ; giữ được thì chặn | Sa bàn dễ nhất trong mô phỏng: thêm áp lực thời gian, thưởng cho đạo đi cánh tây |
| **Quần Đảo** | Phá cổng ở Thành Đảo, trừ khi đổ bộ từ Làng Đảo Rùa | Đường bộ qua Lũy Cầu Dài thì nhanh nhưng gặp cổng; vượt biển qua Đảo Rùa thì chậm mà vào thẳng |

- Năm sa bàn này giữ luật sao chung (mục 3.5) và kết thúc thường (chiếm thành hoặc thua); bốn kết thúc riêng chỉ có ở
  Cửa Biển vì cần cả rút dân và viện binh.
- Viện binh và phản công chỉ ghi vào nhật ký sa bàn và bảng "Nhiệm vụ" bên cạnh (mục 4.3), không thêm tài nguyên mới.

### 4.3 Nhiệm vụ từng sa bàn (Shan yêu cầu 05/11/2026)

Mỗi sa bàn có một hai nhiệm vụ không bắt buộc, ghép từ hai khối sẵn có của Cửa Biển: **hộ tống** (khối rút dân: tới ô
nhận người, đưa về ô an toàn; rời ô nhận khi đồn chặn chưa chiếm thì gặp truy binh 2 địch ×1,0 trong 5 lượt, nhẹ hơn
truy binh Cửa Biển 3 địch ×1,2, 6 lượt; thua trận khi
đang hộ tống thì người bị bắt lại) và **chặn viện binh** (thắng trận giữ ở ô chặn trước đợt viện cuối). Không thêm tài
nguyên hay luật mới.

| Sa bàn | Nhiệm vụ | Ý đồ |
|---|---|---|
| **Ải Bắc** | Giải cứu tù binh: chiếm Kho Ngựa Thồ, đưa tù binh về Bản Na; Lũy Đèo Mây chưa chiếm thì truy binh | Kho ở giữa đường: cứu người tốn hai ngày quay lui, hoặc dọn Đèo Mây trước để đi yên |
| **Thượng Du** | Đưa dân lên đèo: dân Bản Ruộng Bậc (thung lũng đông) lánh lên Đèo Ngang khi ta giữ đèo; Đèo Ngang chưa chiếm thì truy binh. Kèm chặn viện binh ở Đèo Ngang | Cả hai việc cùng xoay quanh đèo |
| **Ngã Ba Sông** | Rút dân Làng Ruộng Chiêm về Trại Bờ Đông, hoặc vào Kho Thóc nếu đã giữ kho qua đợt phản công; Đồn Bến Lau chưa chiếm thì truy binh | Giữ kho vừa có lương vừa là chỗ đưa dân về gần |
| **Kinh Thành** | Chặn viện binh ở Lũy Cầu Tây (luật mục 4.2 nay tính là nhiệm vụ) | Thưởng cho đạo đi cánh tây |
| **Quần Đảo** | Chặn thuyền viện: thuyền viện vào Thành Đảo cuối ngày 4 và 7 (+15%); giữ Lũy Cầu Dài thì chặn | Đường bộ qua Cầu Dài chặn được viện nhưng gặp cổng; vòng Đảo Rùa tránh cổng mà không chặn được |

- Đạo hộ tống đang đứng giữ kho lương mà thắng đợt phản công thì cũng tính là đã đưa người vào kho.
- **Thưởng:** chiếm thành mà đã xong mọi nhiệm vụ của sa bàn thì vàng thưởng ×1,3 (`missionGold`), ghi "xong nhiệm vụ"
  ở màn kết quả. Không đổi sao, không chặn qua bậc. Cửa Biển giữ bốn kết thúc riêng thay cho hệ số này.
- Bảng bên sa bàn đổi tên thành "Nhiệm vụ" ở mọi sa bàn, liệt kê nhiệm vụ cùng các luật riêng.

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

`pnpm exec tsx scripts/expedition-sim.ts --runs 40 [--maps aiBac] [--tiers 1,2,3] [--offset 0]`. Đội khởi đầu (Đinh Bộ Lĩnh
Mộc · Tướng sĩ và 5 tướng khởi đầu) ở đúng cấp gợi ý, không đồ, AI Thường đánh thay người chơi.

Kế hoạch điều quân (`src/core/sim/expedition.ts`, dạy đi theo nhiệm vụ ngày 05/11/2026):

- Chia cổng thành cho hai đạo sao cho đạo về muộn hơn về sớm nhất (không vòng quá một ngày so với cổng gần), chờ đạo kia
  tới cổng để giáp công, đóng quân khi đạo sắp đi còn dưới 55% máu. Mỗi ngày đạo còn đường dài nhất đi trước.
- Việc phụ của kịch bản: đạo gần hơn đi chặn viện binh ở ô giữ (ưu tiên khi đợt viện binh kế tiếp sắp tới); đạo gần
  làng nhận dân, dọn đồn chặn truy binh rồi đưa dân về; đạo chiếm kho lương có phản công thì đứng giữ.
- Trinh sát khi quanh đạo còn ít nhất hai đường có thể bị phá chưa rõ. Tính đường theo những gì đã biết: bỏ đường đã
  biết bị phá và cửa nước đã biết đang lên.

Mô phỏng thấy cả bản đồ (không có sương mù) nhưng chỉ biết đường bị phá khi trinh sát hay đi trúng.

### 5.2 Kết quả bản chốt (05/11/2026)

40 lượt mỗi ô (nhiễu khoảng ±8 điểm). "Sao" là tỉ lệ lượt đạt ít nhất số sao đó. Mục tiêu: Bậc I khoảng 85–95%, Bậc
II 65–85%, Bậc III 30–60% (Thượng Du III khó có chủ ý).

| Sa bàn · bậc | Thắng | Ngày khi thắng | ≥2 sao | 3 sao | Trận thua / lượt | Giáp công |
|---|---|---|---|---|---|---|
| Ải Bắc I / II / III | 85 / 75 / 55% | 10,4 / 11,1 / 11,8 | 53 / 30 / 10% | 35 / 23 / 5% | 1,0 / 1,4 / 2,1 | 58–69% |
| Thượng Du I / II / III | 80 / 60 / 30% | 15,3 / 16,1 / 14,4 | 30 / 15 / 18% | 10 / 3 / 3% | 2,3 / 3,7 / 4,6 | 5–13% |
| Ngã Ba Sông I / II / III | 93 / 98 / 75% | 6,8 / 6,7 / 7,3 | 63 / 68 / 43% | 60 / 63 / 23% | 0,6 / 0,4 / 1,2 | 19–23% |
| Kinh Thành I / II / III | 83 / 70 / 50% | 8,8 / 9,3 / 9,2 | 38 / 23 / 23% | 30 / 15 / 8% | 1,5 / 2,1 / 2,7 | 12–19% |
| Quần Đảo I / II / III | 93 / 88 / 80% | 6,2 / 6,1 / 6,4 | 73 / 65 / 50% | 53 / 50 / 35% | 0,5 / 0,7 / 1,1 | 57–61% |
| Cửa Biển I / II / III | 50 / 28 / 8% | 15,2 / 15,5 / 14,0 | 50 / 28 / 8% | 50 / 28 / 8% | 2,2 / 2,9 / 4,1 | 29–39% |

Cửa Biển: chặn thuyền viện 98 / 88 / 70%, đưa dân về gần 100%, giữ được Chợ 43–57%. Phần lớn lượt không chiếm được
trại kết thúc Giữ dân (19 / 23 / 24 trên 40 lượt): việc phụ ăn hết ngày, rồi phá cổng và tướng giữ thành là hai trận
khó liên tiếp.

Các lần chỉnh trong ngày 05/11/2026 (mọi lượt thua đều do hết ngày):

| Lần | Thay đổi | Kết quả chính |
|---|---|---|
| 1 | Luật riêng năm sa bàn, kế hoạch theo nhiệm vụ | Cửa Biển I 18%, Thượng Du I 58%, Ải Bắc III 60% |
| 2 | Thêm ngày: Cửa Biển 12→15, Thượng Du 17→19, Ải Bắc 12→13, Kinh Thành 10→11 | Cửa Biển I 40%; Thượng Du không đổi |
| 3 | Cửa Biển 15→17; giữ Đèo Ngang 6 lượt ×1,0 | Cửa Biển I 55%; Thượng Du không đổi |
| 4 | Sửa kế hoạch: chia cổng cho hai đạo (trước đây hai đạo dồn một ngả) | Thượng Du I 78%, Quần Đảo I tụt 65% |
| 5 (chốt) | Chỉ chia cổng khi không vòng xa | Bảng trên |
| 6 | Thử Cửa Biển phản công ×1,2, truy binh ×1,0 | Không đổi (53 / 28 / 8%), đã bỏ |
| 7 | Thử Cửa Biển bỏ phá cổng | 60 / 33 / 15%, chỉ hơn 10 điểm, đã bỏ |

### 5.3 Nhiệm vụ và sức địch Cửa Biển (05/11/2026, lần 8)

Shan chọn hạ sức địch Cửa Biển và thêm nhiệm vụ cho năm sa bàn kia (mục 4.3). Cửa Biển có `foePower` 0,87: mọi địch
trên sa bàn (cả truy binh, phản công) nhân hệ số này. Đo 0,85 thì 90 / 85 / 45%, 0,9 thì 70 / 60 / 33%.

Mô phỏng chạy hai kiểu: làm nhiệm vụ hộ tống (mặc định) và bỏ (`--no-escort`). Chặn viện binh vẫn làm ở cả hai kiểu.
40 lượt mỗi ô.

| Sa bàn | Bỏ hộ tống: thắng I / II / III | Làm nhiệm vụ: thắng kèm xong nhiệm vụ I / II / III |
|---|---|---|
| Ải Bắc (hạn 13 → 14 ngày, Bậc III địch ×0,97) | 90 / 80 / 65% | 83 / 58 / 40% |
| Thượng Du (hạn 19 → 20 ngày, Bậc III địch ×0,9) | 80 / 55 / 58% | 60 / 38 / 33% |
| Ngã Ba Sông (hạn 10 → 12 ngày, Bậc III địch ×0,95) | 98 / 98 / 78% | 58 / 53 / 35% |
| Kinh Thành (chỉ chặn viện) | 83 / 70 / 50% | 80 / 65 / 48% |
| Quần Đảo (chỉ chặn thuyền viện) | 88 / 88 / 53% | 88 / 88 / 53% |
| Cửa Biển | | 85 / 68 / 40% (thắng 85 / 70 / 40%) |

- Shan cho giảm nhẹ độ khó nhiệm vụ: truy binh năm sa bàn thường 2 địch ×1,0, 5 lượt; thêm 1 ngày ở ba sa bàn có hộ
  tống; Thượng Du đưa dân lên Đèo Ngang thay vì về Bản Mộc. Trước khi giảm, thắng kèm nhiệm vụ Bậc I: Ải Bắc 60%,
  Thượng Du 55%, Ngã Ba Sông 55%.
- Shan đặt sàn: ô nào dưới 30% thắng là quá khó, ô đã đạt thì giữ nguyên. Chỉ Bậc III của ba sa bàn có hộ tống còn
  dưới 30% khi làm nhiệm vụ (25 / 13 / 28%), nên `foePower` nhận ba số theo bậc và chỉ hạ Bậc III ở ba sa bàn đó.
  Đo thử Ải Bắc ×0,93 và Thượng Du ×0,85 thì Bậc III dễ hơn Bậc II, đã nâng lại.
- Hộ tống vẫn tốn một đến ba ngày, nên thắng kèm nhiệm vụ thấp hơn thắng thường khoảng 10–40 điểm. Đó là cái giá của
  vàng ×1,3.
- Lần đầu đo, kế hoạch quay lui dọn đồn chặn truy binh dù đồn lệch đường (Ải Bắc còn 8%); nay chỉ dọn khi đồn nằm trên
  đường về, còn lại đánh truy binh. Ải Bắc ban đầu giam tù binh ở Lũy Gác Nam, Thượng Du đưa dân về tận Trại Đầu Nguồn:
  cả hai dưới 25%, đã rút ngắn.
- Quần Đảo thêm thuyền viện làm Bậc III tụt 80 → 53%.

Thua gần như toàn bộ là hết ngày. Người chơi tới Bậc III thường đã có đồ Tím/Cam và tướng mua, nên mức thật sẽ cao hơn.

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
