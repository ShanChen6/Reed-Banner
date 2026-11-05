# Viễn Chinh — Thiết kế chi tiết Cửa Biển

> Cập nhật: 04/11/2026  
> Trạng thái: **APPROVED** — Shan duyệt 04/11/2026 (mục 9); có code ở nhánh `feat/vien-chinh-cua-bien`, chờ merge  
> Phạm vi: kịch bản Cửa Biển (nhiệm vụ, Trinh sát, đường bị phá, con nước, ba loại trận riêng) và phần engine cần
> mở rộng. Năm sa bàn còn lại giữ luật của [GDD](01-vien-chinh-gdd.md).  
> Dựa trên: [đề xuất sa bàn và nhiệm vụ](02-map-va-nhiem-vu-proposal.md) mục 5.3, 9 và các điểm Shan chốt ở mục 11.

## 1. Tóm tắt

Cửa Biển thành **kịch bản cố định** thay cho sa bàn Cửa Biển hiện tại (cùng id `cuaBien`, cùng hệ Thủy). Mục tiêu chính
vẫn là chiếm thành đích (Thủy Trại Tây), nhưng đường tới đó có ba việc phụ đổi kết thúc:

| Việc | Cách làm | Cần đánh? | Được gì |
|---|---|---|---|
| **Rút dân Làng Chài** | Một đạo ghé Làng Chài nhận đoàn dân, đưa về Trại Bến Thuyền | Không, nếu đi đường đã sạch | Lộ lịch con nước; thưởng thêm; mở kết thúc "Toàn thắng" |
| **Cắt thuyền viện** | Giữ Cầu Phao Doi Cát trước ngày 5 | Có: trận **giữ cầu** | Thủy Trại Tây không nhận viện; thưởng thêm |
| **Vào bằng Bãi Cạn** | Đi lối bãi lúc nước rút rồi đánh vào cửa nước | Không cho việc đi | Bỏ qua phase **phá cổng** của trận cuối |

Luật chung giữ nguyên: mỗi ngày một lệnh cho một đạo, mỗi lệnh đi **một cạnh**, giặc tăng viện 5% mỗi ngày, giáp công,
thua trận rút về, sương mù theo [GDD mục 3.8](01-vien-chinh-gdd.md#38-sương-mù-shan-yêu-cầu-04112026), chơi offline.

## 2. Sa bàn

### 2.1 Ô

11 ô. Tọa độ đặt lại khi có tranh nền ([prompt](../../06-art/prompts/vien-chinh-sa-ban.md)).

| id | Tên | Loại | Địch | Vai trò |
|---|---|---|---|---|
| `trai-ben` | Trại Bến Thuyền | Trại | — | Đạo Chính xuất phát. Nơi đưa dân về |
| `trai-bai` | Trại Bãi Sậy | Trại | — | Biệt đạo xuất phát |
| `ben-coi` | Đồn Bến Cói | Đồn | 2 | Chặn đường lên Làng Chài |
| `lang-chai` | Làng Chài | Làng + nhiệm vụ | — | Hồi máu như làng thường; nhận đoàn dân |
| `dai-trieu` | Đài Quan Triều | Chòi canh | 2 | Vén sương 2 bước; lộ lịch con nước |
| `cho-song` | Chợ Cửa Sông | Kho lương | 2 | +20 lương; bị phản công (mục 4.4) |
| `bai-su` | Đồn Bãi Sú | Đồn | 2 | Ngã ba phía nam |
| `doi-cat` | Cầu Phao Doi Cát | **Cầu** (mới) | 3 | Trận giữ cầu; cửa chính vào thủy trại |
| `mui-cat` | Đồn Mũi Cát | Lũy | 3 | Đường đê vào thủy trại |
| `bai-can` | Bãi Cạn | **Bãi** (mới) | — | Không trận. Đứng chờ được; vào cửa nước lúc nước rút |
| `trai-tay` | Thủy Trại Tây | Thành đích | 3 + cổng | Trận **phá cổng** hai phase (mục 5.3) |

Loại mới: `bridge` (cầu, trận riêng giữ cầu) và `shoal` (bãi, không trận, không thưởng, không hồi).

### 2.2 Cạnh

17 cạnh. Code không đặt id riêng: trạng thái "bị phá" và "đã biết" lưu theo khóa `a~b` của hai đầu (`expeditionEdgeKey`); id `e1`–`e17` dưới đây chỉ để đọc tài liệu.

| id | Nối | Loại | Ngày | Ghi chú |
|---|---|---|---|---|
| `e1` | trai-ben — ben-coi | Bộ | 1 | |
| `e2` | trai-ben — cho-song | Thủy (luồng sông) | 2 | Đường tắt của đạo Chính |
| `e3` | ben-coi — lang-chai | Bộ | 1 | |
| `e4` | ben-coi — cho-song | Bộ | 1 | Có thể bị phá |
| `e5` | lang-chai — dai-trieu | Bộ | 1 | |
| `e6` | dai-trieu — doi-cat | Bộ | 1 | |
| `e7` | trai-bai — bai-su | Bộ | 1 | |
| `e8` | trai-bai — bai-can | Đầm sậy | 2 | Lối kín, tránh mọi đồn |
| `e9` | bai-su — cho-song | Bộ | 1 | |
| `e10` | bai-su — doi-cat | Bộ | 1 | Có thể bị phá |
| `e11` | bai-su — mui-cat | Bộ | 1 | Có thể bị phá |
| `e12` | cho-song — doi-cat | Bộ | 1 | |
| `e13` | cho-song — mui-cat | Bộ | 1 | |
| `e14` | doi-cat — trai-tay | Bộ (cửa chính) | 1 | |
| `e15` | mui-cat — trai-tay | Bộ (đường đê) | 1 | |
| `e16` | mui-cat — bai-can | Bộ | 1 | Có thể bị phá |
| `e17` | bai-can — trai-tay | Bãi (cửa nước) | 1 | Chỉ qua được ngày nước rút (mục 3.3) |

Đầm sậy dùng luật vượt nước 2 ngày hiện có (loại cạnh `water`), chỉ khác nét vẽ.

### 2.3 Ba ngả vào thủy trại

- **Cửa chính** qua Cầu Phao Doi Cát (`e14`): tới bằng Bãi Sú, Chợ hoặc Đài Quan Triều. Ngắn nhất, nhưng phải thắng trận
  giữ cầu trước.
- **Đường đê** qua Đồn Mũi Cát (`e15`): lũy 3 địch, tới bằng Bãi Sú hoặc Chợ.
- **Cửa nước** qua Bãi Cạn (`e17`): không trận trên đường nếu đi đầm sậy (`e8`, 2 ngày), nhưng phải canh con nước; vào
  bằng cửa này thì bỏ phase phá cổng.

Phía bắc (Bến Cói, Làng Chài, Đài Quan Triều) là vùng nhiệm vụ rút dân và tình báo. Không cạnh nào trong 4 cạnh có thể
bị phá là đường duy nhất tới một ô, nên mọi tổ hợp đường bị phá đều còn đi được.

### 2.4 Số ngày

- Hạn **12 ngày**, chuẩn **9 ngày** (hiện tại 12/8; tăng chuẩn vì thêm việc phụ và mỗi ngày chỉ một đạo đi).
- Đường ngắn nhất chỉ chiếm thành: Biệt đạo trai-bai → bai-su → doi-cat → trai-tay = 3 ngày, nhưng đánh 3 trận liền không
  nghỉ và trận cuối có phase phá cổng.
- Đường Toàn thắng thường gặp (ước tính tay, chưa mô phỏng): Biệt đạo giữ cầu ở ngày 2; đạo Chính rút dân ngày 3–6
  (đi, ghé làng, về hai bước); hai đạo tới hai cổng rồi đánh, khoảng ngày 9–10.

## 3. Luật mới trên sa bàn

### 3.1 Lệnh Trinh sát

- Lệnh thứ ba cạnh Tiến quân và Đóng quân: **một đạo đứng yên trinh sát**, tốn một ngày; đạo kia nghỉ như thường. Đạo
  trinh sát **không** được hồi máu và lương của ngày đó.
- Kết quả: vén sương mọi ô trong **2 bước** tính từ ô đạo đứng (như chòi canh nhưng chỉ lần này, không giữ mãi khi đạo
  đi chỗ khác; ô đã vén thì không phủ lại vì sương mù chỉ che ô chưa từng thấy). Mọi cạnh **bị phá** có cả hai đầu
  trong vùng vừa vén thì hiện là bị phá.
- Đạo đã gục cả ba vẫn trinh sát được (không cần đánh).
- Cùng một ô trinh sát lần hai không lộ thêm gì; giao diện ghi "Đã trinh sát vùng này".

### 3.2 Đường bị phá

- Mỗi lượt chọn theo seed **2 trong 4 cạnh** có ghi "có thể bị phá" ở mục 2.2 (`e4`, `e10`, `e11`, `e16`). Mọi tổ hợp
  đều còn đường tới thành đích, Làng Chài và Bãi Cạn (đã soát tay; code có test cho cả 6 tổ hợp).
- Cạnh bị phá **vẽ như đường thường** cho tới khi bị lộ. Lộ bằng một trong hai cách:
  1. **Trinh sát** (mục 3.1).
  2. **Chọn đi trúng:** đạo đứng yên, **mất ngày đó** (đạo kia nghỉ như thường), báo "Đường bị phá", từ đó cạnh hiện
     nét đứt đỏ và không chọn được.
- Bản đầu không có lệnh sửa đường.

### 3.3 Con nước

- Cửa nước `e17` chỉ qua được vào **ngày nước rút: 4, 7, 10** (mỗi 3 ngày). Đứng ở Bãi Cạn thì an toàn mọi ngày.
- Lịch con nước **ẩn** lúc đầu; cạnh `e17` ghi "Cửa nước, chưa rõ con nước". Biết lịch khi chiếm **Đài Quan Triều** hoặc
  khi **đưa dân về** (dân chài báo).
- Chưa biết lịch mà đi vào ngày nước lên: như đi trúng đường bị phá, **mất ngày đó**, và lộ lịch con nước luôn (người
  chơi học được từ sai lầm, không mất hai lần).
- Ngày nước rút cũng tính trong hạn: nếu đạo tới Bãi Cạn ở ngày 10 mà lỡ thì hết cơ hội.

### 3.4 Rút dân (nhiệm vụ không cần đánh)

- Đạo nào ghé Làng Chài đầu tiên thì **nhận đoàn dân** (cờ `escort` trên đạo đó). Làng vẫn hồi máu và lương như thường.
- Đạo mang dân đi như thường. Đưa dân tới **Trại Bến Thuyền** (hoặc Chợ Cửa Sông nếu đang giữ chợ) là xong nhiệm vụ;
  không cần trận nào nếu các ô trên đường đã chiếm.
- Đạo mang dân **đánh một ô còn địch** thì trận đó là trận thường; **thua trận khi đang mang dân thì mất dân** (nhiệm vụ
  thất bại, không làm lại được trong lượt). Màn chơi cảnh báo trước khi đánh.
- **Truy binh:** khi đạo mang dân bước ra khỏi Làng Chài mà Đồn Bến Cói **chưa chiếm**, toán truy binh đuổi theo: vào
  trận **hộ tống** (mục 5.2). Đã chiếm Bến Cói thì không có truy binh. Đây là lý do nên dọn đường trước.
- Hai đạo không chuyển dân cho nhau (bản đầu).

### 3.5 Thuyền viện

- Cờ `reinforcements` bắt đầu "còn". Thuyền viện tới Thủy Trại Tây vào **cuối ngày 5** và **cuối ngày 9**; mỗi lần tới
  thì địch ở thành đích mạnh thêm **15%** (cộng vào tăng viện theo ngày) và hồi đủ máu nếu đang đánh dở.
- Thắng trận **giữ cầu** ở Doi Cát thì cờ thành "đã cắt": các lần chưa tới bị hủy. Cắt sau ngày 5 thì chỉ hủy lần ngày 9.
- Giao diện: thanh trên ghi "Thuyền viện tới sau N ngày" khi cờ còn và lần tới đang trong tầm (không phụ thuộc sương).

### 3.6 Phản công Chợ Cửa Sông

- Chiếm Chợ được +20 lương cho cả hai đạo như kho lương thường. **Hai ngày sau** (cuối ngày chiếm + 2), địch phản công:
  - Có đạo đứng ở Chợ: vào trận **giữ cầu** (cùng loại, giữ 4 lượt). Thắng thì thêm +20 lương và Chợ thành nơi đưa dân
    về được. Thua thì đạo rút về ô kề gần nhất (theo id cạnh), Chợ trở lại có địch với 60% máu.
  - Không có đạo ở Chợ: Chợ trở lại có địch với 60% máu, không mất gì khác.
- Phản công chỉ xảy ra một lần mỗi lượt. Nếu cần gọn bản đầu, đây là phần cắt được mà không ảnh hưởng ba việc chính.

## 4. Kết thúc và thưởng

### 4.1 Bốn kết thúc

| Kết thúc | Điều kiện | Sao |
|---|---|---|
| **Toàn thắng** | Chiếm Thủy Trại Tây, đã cắt thuyền viện **và** đã đưa dân về | ★★★ |
| **Chiếm trại** | Chiếm Thủy Trại Tây | ★★ nếu xong trong chuẩn 9 ngày, không thì ★ |
| **Giữ dân** | Hết hạn hoặc rút quân, chưa chiếm trại, nhưng đã đưa dân về **và** đã cắt viện | ★ (thắng phụ) |
| **Thất bại** | Còn lại | — |

- Thay luật sao chung (chiếm thành · trong chuẩn · không thua) **chỉ ở Cửa Biển**, vì ở đây việc phụ mới là thử thách.
  Năm sa bàn khác giữ luật cũ.
- "Giữ dân" **không** tính là qua bậc, không mở bậc kế tiếp (Shan chốt 05/11/2026, thay quyết định cũ). Lý do: làm xong
  hai việc phụ rồi rút quân thì lách được thành đích mà vẫn lên bậc.
- `bestDays` chỉ ghi khi chiếm được trại.

### 4.2 Thưởng

- Mỗi trận: như trận viễn chinh hiện tại (kinh nghiệm, vàng và sách nhặt trên bàn, đồ rơi theo độ khó).
- Kết thúc: vàng theo bậc như hiện tại, nhân hệ số theo kết thúc: Toàn thắng ×1,5, Chiếm trại ×1, Giữ dân ×0,6. Giữ dân
  luôn lấy mức vàng thắng lại (`repeatGold`), không lấy mức thắng lần đầu, vì không ghi qua bậc nên nếu lấy mức lần đầu
  thì mỗi lượt Giữ dân đều được vàng lần đầu.
- Món trang bị lần đầu mỗi bậc: chỉ khi Chiếm trại hoặc Toàn thắng. Toàn thắng lần đầu ở một bậc cho thêm một món phẩm
  cao hơn một nấc (lấy lại `expeditionRewardItem`, phẩm +1, tối đa Cam).
- Không thêm tài nguyên mới ngoài máu, lương và các cờ nhiệm vụ (đề xuất của Claude ở mục 11 bản đề xuất).

## 5. Ba loại trận riêng

Engine đã có ba mục tiêu trận của Bình Loạn V2 trong `src/core/campaign/scenarios.ts`: `surviveTurns` (cầm cự N lượt),
`breakSiege` có phase `escort` (giữ N lượt hoặc hạ hết), `bossPhases` (qua phase khi trùm xuống ngưỡng máu). Viễn Chinh
dùng lại chúng thay vì viết luật mới; chỉ phá cổng cần một thứ engine chưa có (công trình).

### 5.1 Giữ cầu (Cầu Phao Doi Cát, phản công Chợ)

- Mục tiêu: **giữ 5 lượt** của người chơi mà còn ít nhất một người đứng; hạ hết địch sớm cũng thắng. Phản công Chợ giữ
  4 lượt.
- Địch đông và mạnh hơn ô cùng bậc vì không bắt buộc hạ: 3 địch, sức mạnh ×1,2.
- Bàn cờ nghiêng về ô Khiên và ô hồi máu (trọng số `weights` riêng, engine đã kiểm tra hợp lệ).
- Thua: rút về như luật thường; cầu giữ thương vong; đánh lại được nếu còn trước ngày 9.
- Dùng `surviveTurns`; cần bỏ ràng buộc `bossFighterId` (cầm cự không cần trùm) hoặc thêm biến thể không trùm.

### 5.2 Hộ tống (truy binh đoàn dân)

- Mục tiêu: **giữ 4 lượt** hoặc hạ hết toán truy binh (2 địch, sức mạnh ×0,9 vì đạo không chọn được lúc đánh).
- Thua: đạo rút về Làng Chài, **mất dân**; nhiệm vụ rút dân thất bại.
- Thắng: đạo vào ô định đi như thường, vẫn mang dân.
- Dùng `breakSiege` stage `escort` một phase.

### 5.3 Phá cổng (Thủy Trại Tây)

- **Phase 1 — Phá cổng:** phe địch có **Cổng thủy trại** (công trình) đứng vị trí đầu và 2 lính giữ. Qua phase khi cổng
  sụp, dù lính còn đứng. Lính còn sống và máu còn lại **mang sang** phase 2.
- **Phase 2 — Đánh tướng:** tướng giữ thành (máu ×1,5 như hiện tại) cùng lính còn lại từ phase 1. Hạ hết là chiếm trại.
- **Vào bằng cửa nước** (đi `e17` lúc nước rút): bỏ phase 1. Giáp công (mục 3.3 GDD) vẫn áp dụng cho phase còn đánh.
- Thua ở phase 2: lần sau đánh lại từ phase 2 (cổng đã sụp, lưu trong trạng thái ô).
- **Công trình** (engine mới, cờ `structure` trên nhân vật):
  - Không bao giờ là người hành động, không có kỹ năng, không đổi ô, công 0; không nhận khống chế, hồi máu, khiên, Nộ.
  - Bị đánh thường và kỹ năng sát thương như nhân vật; DEF cao để ô Kiếm và kỹ năng xuyên giáp có giá trị.
  - Phe chỉ còn công trình thì lượt phe đó trôi qua ngay (không treo trận).
  - Hiện là "Cổng" với thanh bền, không chân dung; cần một hình cổng (thêm vào bộ prompt đồ họa).

## 6. Dữ liệu (như đã code)

### 6.1 Sa bàn và kịch bản

- `src/core/expedition/maps.ts`: loại ô thêm `bridge`, `shoal`; loại cạnh thêm `marsh` (2 ngày) và `tide` (cửa nước);
  `expeditionEdgeKey`, `expeditionEdgeKind`. Sa bàn `cuaBien` thay bằng bố cục mục 2.
- `src/core/expedition/scenario.ts`: `EXPEDITION_SCENARIOS.cuaBien` giữ mọi số liệu của tài liệu này (đường có thể phá,
  lịch con nước, đoàn dân, thuyền viện, cầu, phản công, cổng, hệ số thưởng). Sa bàn không có kịch bản chạy luật cũ.
- `src/core/expedition/objective.ts`: mục tiêu trận `hold` / `escort` / `gate` và `expeditionObjectiveMet`.

### 6.2 Trạng thái lượt

`ExpeditionRun` thêm (đều tùy chọn để lượt cũ đọc được, `version` giữ 1):

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `broken` | `string[]` | Đường bị phá của lượt (chọn từ seed lúc tạo lượt); server không gửi cho client |
| `knownBroken` | `string[]` | Đường bị phá đã lộ |
| `scouted` | `string[]` | Ô đã vén sương bằng trinh sát |
| `tideKnown` | `boolean` | Đã biết lịch con nước |
| `refugees` | `0 \| 1 \| "saved" \| "lost"` | Đạo đang mang dân, hoặc kết quả |
| `arrivals` | `number` | Số lần thuyền viện đã tới |
| `reinforcementsCut` | `boolean` | Đã giữ được cầu |
| `market` | `{ taken, status }` | Phản công Chợ: `pending`, `due` (đạo giữ chợ phải đánh), `held`, `lost` |
| `log` | `string[]` | 6 dòng nhật ký gần nhất |
| `nodes[id].gateDown` | `boolean` | Cổng thành đã sụp |

`ExpeditionBattleRef` thêm `mode` (`chase`, `counter`, `gate`), `to` (truy binh) và `objective`. `ExpeditionMatchTag`
thêm `objective`; lớp Match (`closeObjective` trong `src/core/match/match.ts`) cho phe người chơi thắng ngay khi đạt mục
tiêu, kể cả giữa lượt (cổng sụp thì AI không đánh tiếp). Sương mù cộng thêm `scouted`.

### 6.3 Hành động

| Hành động | Mới / đổi |
|---|---|
| `POST /api/expedition/march { army, to }` | Trúng đường bị phá hay nước lên mà chưa biết: `{ kind: "blocked", reason }`, tốn ngày. Đường đã biết bị phá: lỗi `roadBroken`; nước lên đã biết: `highTide`. Giặc đang phản công Chợ: chỉ đạo giữ chợ "tiến" vào chính ô mình để đánh, việc khác báo `counterPending` |
| `POST /api/expedition/scout { army }` | Mới |
| `POST /api/expedition/camp` | Bị chặn khi đang phản công Chợ |
| `GET /api/expedition` | Thêm `scenario`: lịch thuyền viện, lịch con nước khi đã biết, trận truy binh và phản công đang chờ |

### 6.4 Công trình trong engine

`FighterConfig.structure` (`src/core/battle/state.ts`): `canAct` luôn sai (không bao giờ là người hành động, phe chỉ còn
công trình thì lượt trôi như bị Đóng băng cả phe), không hồi máu, chỉ nhận Phá giáp, không đói lương. Thủ lĩnh phe địch
là người đứng đầu tiên không phải công trình.

## 7. Giao diện

- Thanh trên: ngày/hạn, ba việc phụ dạng dấu tích (Rút dân, Cắt viện, Cửa nước) kèm trạng thái, "Thuyền viện tới sau N
  ngày".
- Bảng lệnh: Tiến quân, **Trinh sát**, Đóng quân. Trinh sát ghi trước "Vén sương 2 bước quanh <ô>, mất hồi sức hôm nay".
- Cạnh: bộ nét liền, nước và đầm nét đứt xanh, cửa nước nét đứt xanh có biểu tượng sóng (ghi ngày nước rút khi đã biết),
  cạnh bị phá đã lộ nét đứt đỏ có dấu ✕.
- Đạo mang dân có cờ nhỏ hình thuyền nan cạnh cờ đạo. Cảnh báo đỏ trước trận khi mang dân.
- Thông báo khi bị chặn: "Đường bị phá — Biệt đạo mất ngày 6" hoặc "Nước đang lên — cửa nước rút vào ngày 7, 10".
- Trận riêng: khung trên bàn cờ ghi mục tiêu ("Giữ cầu: còn 3 lượt", "Phá cổng: cổng còn 64%") như màn Bình Loạn V2.
- Màn kết thúc: tên kết thúc, việc phụ đã làm, sao, thưởng.
- Nhật ký chiến dịch ngắn (5 dòng gần nhất) dưới sa bàn để biết vì sao sa bàn đổi.

## 8. Chia việc (PR)

1. **Engine:** công trình (`structure`), `surviveTurns` không trùm, tách hàm chốt mục tiêu dùng chung cho Bình Loạn và
   Viễn Chinh. Test engine.
2. **Core Viễn Chinh:** cạnh dạng đối tượng, kịch bản Cửa Biển, Trinh sát, đường bị phá, con nước, rút dân, thuyền
   viện, phản công Chợ, kết thúc và thưởng. Test cho cả 6 tổ hợp đường bị phá và từng kết thúc.
3. **Server + giao diện:** lọc dữ liệu ẩn, trận nhiều phase, thanh nhiệm vụ, lệnh Trinh sát, nét cạnh mới, màn kết thúc.
4. **Mô phỏng:** `scripts/expedition-sim.ts` thêm chiến thuật Toàn thắng; chỉ chạy ngắn để soát lượt chơi được, không
   cân bằng lâu (Shan dừng cân bằng 04/11/2026).

## 9. Shan đã chốt (04/11/2026)

1. **Sao:** Shan không đặt nặng cách tính sao; dùng đúng bảng mục 4.1. ~~"Giữ dân" mở bậc kế tiếp~~: Shan đổi ngày
   05/11/2026 sau bản review, Giữ dân không mở bậc và chỉ có vàng thắng lại × 0,6 (mục 4.1, 4.2).
2. **Thưởng:** giữ hệ số ×1,5 / ×1 / ×0,6 và món thêm khi Toàn thắng lần đầu (mục 4.2), Shan không đổi.
3. **Giữ phản công Chợ** trong bản đầu (mục 3.6).
4. **Không thêm tài nguyên mới** (câu 12.3); việc phụ chỉ đổi thưởng và kết thúc, không khóa bậc (câu 12.4).
