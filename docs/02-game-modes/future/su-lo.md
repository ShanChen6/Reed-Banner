# Sử Lộ (Mê cung lịch sử): đổ xúc xắc, trả lời sử, tìm đường thoát

> Cập nhật: 14/11/2026 (Shan chốt: tên Sử Lộ, không giới hạn số lượt, ô giao tranh mọi người như nhau)
> Trạng thái: **DRAFT** — ý tưởng gốc của Shan (14/11/2026), Claude viết thiết kế chi tiết; chưa có code. Ba điểm đã chốt ghi ở [mục 13](#13-điểm-cần-shan-quyết). Mọi con số là **điểm xuất phát**, cần chơi thử và mô phỏng. Các điểm chờ Shan quyết gom ở [mục 13](#13-điểm-cần-shan-quyết).

## 1. Định vị

Chế độ một người, không đánh nhau theo lượt hai phe. Người chơi đưa **tướng quân** của mình đi qua một **mê cung** trên sa bàn để tới cổng thoát. Mỗi lượt đổ xúc xắc, chọn đường, dừng ở ô nào thì **trả lời một câu hỏi lịch sử** ở ô đó: đúng thì đứng vững, sai thì quay về chỗ cũ. Trong mê cung có bẫy, ô may mắn và **ô giao tranh**: một trận match-3 **một chiều**, người chơi đánh boss, boss không đánh lại.

- **Mục tiêu học:** người chơi đi hết các mê cung là đã đọc qua mạch sử từ Ngô Quyền dựng nước, loạn sứ quân, nhà Đinh tới nhà Tiền Lê. Sau mỗi câu luôn hiện 1–2 dòng **sử chép** giải thích đáp án, có ghi nguồn.
- **Khác các chế độ không đánh nhau đang có:** [Khai Lộ](../khai-lo/gdd.md) và [Do Thám](../do-tham/gdd.md) là giải đố thuần, [Trận Đồ](../tran-do/gdd.md) là xếp quân, [Tầm Tướng Ký](../tam-tuong-ky/design-freeze.md) là ghép công thức. Mê cung lịch sử là chế độ duy nhất lấy **kiến thức sử** làm cơ chế chính.
- **Gắn với game chính:** dùng lại bàn cờ match-3 (ô giao tranh), vàng, tướng lịch sử và Sử ký của [Bình Loạn](../campaign/design-freeze.md). Quy tắc nguồn sử theo [sổ nguồn Campaign](../campaign/history-sources.md).
- **Tên và đường dẫn:** tên chế độ là **Sử Lộ** ("con đường sử"; Shan chốt 14/11/2026, chọn trong các phương án Mê Lộ, Vấn Sử, Sử Lộ). Dòng phụ trên thẻ là "Mê cung lịch sử". Tên chế độ hoa mọi chữ theo [Văn phong giao diện](../../00-overview/thuat-ngu.md#văn-phong-giao-diện). Route tiếng Anh theo quy ước: `/game/maze`, scene `MAZE`, cờ bật `MAZE_ENABLED` (tắt mặc định như các chế độ mới khác).

## 2. Vòng chơi một màn

1. Chọn mê cung (theo giai đoạn) và bậc **Dễ / Thường / Khó**.
2. Chọn **tướng cầm quân** (quân cờ trên sa bàn) và **ban tham mưu** 2 tướng (dùng cho trợ giúp "Hỏi tướng", [mục 6](#6-trợ-giúp-mưu-kế)).
3. Lời dẫn mở màn: 2–3 câu sử chép về giai đoạn của mê cung.
4. Lặp lượt: **đổ xúc xắc → đi → dừng → trả lời → hiệu ứng ô** ([mục 3](#3-luật-di-chuyển-và-trả-lời)). Bộ đếm **lượt** tăng 1 mỗi lần đổ xúc xắc.
5. Muốn qua **cổng thoát** phải hạ **boss trấn cổng** ở ô giao tranh cuối.
6. Kết màn: chấm sao, thưởng, các thẻ Sử ký mới mở ([mục 8](#8-chấm-sao-thưởng-và-sử-ký-sưu-tầm)).

**Không giới hạn số lượt** (Shan chốt 14/11/2026: đây là giải đố học sử). Màn không thua vì hết lượt; người chơi đi tới khi thoát hoặc tự bỏ màn. Số lượt chỉ dùng để chấm sao ([mục 8.1](#81-sao)) và xếp hạng mê cung ngày. Chơi lại thì mê cung tạo lại theo seed mới (chế độ thường) nên không học thuộc đường được.

Một màn Thường nhắm **8–12 phút**, khoảng 15–20 câu hỏi và 1–2 trận giao tranh.

## 3. Luật di chuyển và trả lời

### 3.1 Sa bàn

- Mê cung là một **đồ thị ô** vẽ trên lưới (các ô nối nhau bằng lối đi). Có **ngã rẽ**, **ngõ cụt**, **vòng lặp** và **lối tắt** bị khóa.
- Một ô xuất phát, một cổng thoát. Quãng ngắn nhất từ xuất phát tới cổng (điểm xuất phát): Dễ 14 bước, Thường 20, Khó 26.
- Kích thước: Dễ khoảng 35 ô, Thường 50, Khó 70.
- **Sương mù** (từ bậc Thường): chỉ thấy **loại ô** trong bán kính 2 bước đường đi quanh tướng và các ô đã đi qua; xa hơn chỉ thấy có lối. Dễ không có sương; Khó bán kính 1.

Ví dụ một góc mê cung Dễ (`X` xuất phát, `C` cổng, `G` giao tranh, `B` bẫy đã lộ, `M` may mắn, `▣` cửa ải, `·` ô câu hỏi):

```
X · · ┬ · · B · ┐
      │         ·
      · M ─ · ─ ▣ · · G · C
      │
      · · (ngõ cụt)
```

### 3.2 Đổ xúc xắc và đi

- Xúc xắc 1–6 theo seed (`src/core/rng.ts`), mặt xúc xắc vẽ như mặt trống đồng.
- Đi **tối đa** số bước đã đổ; được **dừng sớm** ở bất kỳ ô nào trên đường (để né bẫy hoặc dừng trước cửa ải). Phải đi ít nhất 1 bước.
- Gặp ngã rẽ thì người chơi tự chọn hướng. Trong một lượt **không đi ngược** lại cạnh vừa đi.
- **Chỉ ô dừng chân mới kích hoạt.** Đi ngang qua ô câu hỏi, bẫy hay may mắn không có gì xảy ra, trừ **cửa ải** (bắt buộc dừng, [mục 4](#4-các-loại-ô)).
- Điều khiển: chạm ô đích trong các ô đi tới được (được tô sáng), máy tự vẽ đường; có đường khác cùng độ dài thì chạm thêm để đổi. Bàn phím: mũi tên chọn hướng ở ngã rẽ, Enter dừng.

### 3.3 Trả lời

- Dừng ở ô **chưa thông** thì hiện câu hỏi theo màu ô (độ khó).
- **Đúng:** tướng đứng lại ô đó, ô thành **đã thông** (cắm cờ lau). Ô đã thông không hỏi lại, đi qua hay dừng đều an toàn.
- **Sai hoặc hết giờ:** tướng **quay về ô bắt đầu lượt** (đúng ý "trả lời sai phải quay trở lại", cũng là lùi đúng số bước vừa đi). Lần sau dừng ở ô đó sẽ gặp **câu khác** cùng độ khó, không lặp câu vừa sai.
- Sai hay đúng đều hiện **sử chép** 1–2 dòng kèm mã nguồn. Câu sai vào **Sổ ôn** của lượt chơi để xem lại cuối màn.
- Đồng hồ mỗi câu: Dễ không giới hạn, Thường 30 giây (như đồng hồ lượt trận), Khó 20 giây. Rời tab thì đồng hồ dừng (như Khai Lộ).

### 3.4 Thưởng theo độ khó

| Màu ô | Độ khó câu | Đúng | Sai |
|---|---|---|---|
| Lục | 1 (dễ) | Đứng lại | Về ô bắt đầu lượt |
| Vàng | 2 (vừa) | Đứng lại, **+1 Ấn sử** | Về ô bắt đầu lượt |
| Đỏ | 3 (khó) | Đứng lại, **+2 Ấn sử** | Về ô bắt đầu lượt |

Tỉ lệ màu theo bậc: Dễ 60/30/10, Thường 40/40/20, Khó 25/45/30 (phần trăm Lục/Vàng/Đỏ). Ô đỏ hay nằm trên **lối tắt**: đường ngắn hơn nhưng khó hơn, đường vòng dài nhưng dễ.

## 4. Các loại ô

**Mọi ô (trừ xuất phát, cổng và ô đã thông) đều hỏi một câu.** Loại ô chỉ quyết định điều gì xảy ra khi đúng hoặc sai. Nhờ vậy bẫy không phải xui xẻo thuần túy: **biết sử thì gỡ được bẫy**.

### 4.1 Ô câu hỏi

Ô thường, màu Lục/Vàng/Đỏ theo [mục 3.4](#34-thưởng-theo-độ-khó).

### 4.2 Bẫy

Bẫy **lộ** (thấy biểu tượng, né được bằng cách dừng sớm hoặc rẽ) và bẫy **ẩn** (trông như ô câu hỏi cho tới khi dừng vào, lộ bằng Trinh sát hoặc Mật thư). Dừng vào bẫy: hỏi một câu **Vàng**.

- **Đúng:** gỡ bẫy, ô thành đã thông, nhận +1 Ấn sử.
- **Sai:** về ô bắt đầu lượt **và** chịu hiệu ứng bẫy.

Tên bẫy mang không khí sử nhưng là **cơ chế game** (`fictional`), không khẳng định trận nào trong sử có bẫy ấy. Mỗi mê cung dùng bộ bẫy hợp giai đoạn:

| Bẫy | Hiệu ứng khi sai | Gợi ý dùng ở |
|---|---|---|
| Phục binh | Mất lượt kế (bộ đếm lượt vẫn tăng) | Mọi mê cung |
| Cọc ngầm | Mắc kẹt: mất 2 lượt kế | Mê cung Ngô (gợi trận Bạch Đằng) |
| Nước lũ | Trôi lùi thêm 2 ô theo đường đã đi | Mê cung có sông |
| Lạc lối | Dịch tới một ô đã thông ngẫu nhiên | Mê cung có rừng, núi |
| Thích khách | Mất 1 trợ giúp ngẫu nhiên đang có | Mê cung nhà Đinh |
| Đốt cầu | Một lối kề bị chặn 3 lượt | Mê cung có cầu |

Số bẫy: Dễ 3–4, Thường 6–8 (một nửa ẩn), Khó 10–12 (hai phần ba ẩn).

### 4.3 Ô may mắn

Dừng vào: hỏi một câu **Lục**. Đúng thì nhận lợi và ô thành đã thông; sai thì về như thường, ô may mắn vẫn còn cho lần sau.

| Ô | Lợi ích |
|---|---|
| Ngựa chiến | Đi tiếp ngay 2 bước (không hỏi ở ô dừng nếu là ô đã thông) |
| Trạm ngựa | Lượt kế đổ hai xúc xắc, chọn số lớn hơn |
| Mật thư | Lộ một lối tắt bị khóa và mở nó; lộ mọi bẫy ẩn trên lối đó |
| Đồn trinh sát | Lộ mọi ô (kể cả bẫy ẩn) trong bán kính 3 |
| Sử quan | +1 trợ giúp tùy chọn |

Số ô may mắn: Dễ 5, Thường 5, Khó 4.

### 4.4 Bia đá (ô đọc sử)

Một tấm bia khắc một **câu trích ngắn có nguồn** (ví dụ "Phạm Phòng Át đem binh về hàng", Toàn thư mục 967). Dừng vào: đọc trích, rồi hỏi một câu **dạng đọc hiểu** về chính đoạn đó (dễ nếu đọc kỹ). Đúng: mở một thẻ Sử ký hiếm. Mỗi mê cung 2–3 bia.

### 4.5 Cửa ải

Chắn ngang lối chính, **đi tới là phải dừng** dù còn bước. Hỏi **chuỗi 2 câu** (một Vàng, một Đỏ, hoặc một câu xếp thứ tự). Đúng cả hai: ải mở vĩnh viễn trong màn. Sai câu nào: về ô bắt đầu lượt, lần sau hỏi chuỗi khác. Mỗi mê cung 1–2 ải, thường đặt ngay trước vùng boss.

### 4.6 Lối tắt khóa

Cạnh nối bị khóa (vẽ bằng hàng rào tre). Mở bằng Mật thư, bằng thắng một ô giao tranh phụ, hoặc trả lời đúng câu **Đỏ** ở ô kề lối tắt (ô "Người dẫn đường").

### 4.7 Ô giao tranh

Trận match-3 một chiều với boss lịch sử, chi tiết ở [mục 5](#5-ô-giao-tranh-match-3-một-chiều). Mỗi mê cung có **1 boss trấn cổng** (bắt buộc) và **0–2 boss phụ** trên nhánh (tùy chọn, thưởng thêm hoặc mở lối tắt).

### 4.8 Xuất phát và cổng thoát

Cổng thoát mở sau khi hạ boss trấn cổng. Đi tới cổng không cần đúng số bước: chạm tới là thoát.

## 5. Ô giao tranh: match-3 một chiều

Shan (14/11/2026): người chơi di chuyển các ô để đánh boss, **boss không đánh lại**, tập trung vào lịch sử. Vì vậy trận ở đây là một **câu đố có số nước giới hạn**, không phải trận hai phe.

### 5.1 Luật

- Dùng lõi bàn cờ có sẵn (`src/core/board`: đổi ô, ghép, rơi, ô đặc biệt bản yếu/mạnh theo [Bàn cờ](../../01-gameplay/ban-co.md)). Không dùng `battle` (không có lượt địch, không máu người chơi).
- Boss có **Thành lực** (thanh máu). Người chơi có **số nước** giới hạn: Dễ 15, Thường 12, Khó 10. Ghép 4 ô trở lên cho thêm 1 nước (theo luật thêm lượt hiện có, tối đa 1 lần mỗi nước).
- Hết nước mà Thành lực còn: thua trận giao tranh. Hạ Thành lực về 0: thắng.
- **Mọi người chơi như nhau** (Shan chốt 14/11/2026). Không lấy cấp, chỉ số, kỹ năng, trang bị hay nghề/hệ từ hồ sơ. Sát thương chỉ do loại ô quyết định; tướng cầm quân chỉ đổi hình trên sa bàn. Chế độ tập trung vào kiến thức sử, không phải cày cấp, và mê cung ngày công bằng.

### 5.2 Ý nghĩa ô trong giao tranh

Bàn dùng 6 loại ô; bỏ Tim vì không ai mất máu.

| Ô | Tác dụng trong giao tranh |
|---|---|
| ⚔️ Kiếm | Sát thương thẳng vào Thành lực |
| 🥁 Trống trận | Tích **Sĩ khí**: đủ 10 thì nước kế tiếp sát thương ×1.5 |
| 📖 Sách | Tích **Mưu**: đủ 9 thì mở câu **Quân sư hiến kế** (câu Vàng). Đúng: phá giáp boss, Thành lực −15% ngay |
| ☯️ Âm dương | Nạp **Kế sách**: đủ 100 năng lượng thì được một đòn lớn, như nhau với mọi tướng (phá một hàng và gây sát thương theo số ô phá) |
| 🍙 Bánh chưng | +1 nước (tối đa 3 lần mỗi trận) |
| 💰 Thỏi vàng | Vàng thưởng nhặt được, cộng khi thắng màn |

Ô đặc biệt (Kiếm lửa, Binh thư, Thẻ tre…) giữ hiệu ứng phá ô như trận thường, mọi ô bị phá đều tính thu hoạch.

### 5.3 Boss có pha, không có đòn

Boss **không tấn công**. Thay vào đó Thành lực chia **3 pha** (100–67%, 67–34%, 34–0%). Mỗi lần sang pha:

1. Hiện một đoạn **sử chép** (có nguồn) và một câu **thoại** (ghi rõ là lời game, không phải trích dẫn sử, theo quy tắc của Bình Loạn).
2. Bàn cờ đổi thế **bị động**, ví dụ cọc gỗ (ô chướng ngại không ghép được, phá bằng ghép kề hoặc ô nổ), nước dâng (hàng dưới cùng trôi sang một bên mỗi nước), sương (một vùng 3×3 che mặt ô). Đây là thử thách giải đố, không phải đòn đánh.

### 5.4 Thắng, thua

- **Thắng:** ô giao tranh thành đã thông, nhận thẻ Sử ký riêng của boss, vàng nhặt được, +2 Ấn sử. Boss phụ mở lối tắt gần đó.
- **Thua:** tướng lùi về ô bắt đầu lượt. Boss **giữ nguyên Thành lực đã mất** cho lần sau, nên luôn có tiến triển và không bị kẹt.
- Muốn bỏ qua boss phụ thì cứ đi đường khác; boss trấn cổng thì bắt buộc.

### 5.5 Boss theo giai đoạn (đề xuất)

Boss lấy từ sự kiện **có nguồn**. Khi nguồn chưa đủ thì chưa dùng.

| Mê cung | Boss trấn cổng | Căn cứ | Trạng thái nguồn |
|---|---|---|---|
| I. Ngô Quyền dựng nước | Thủy quân Nam Hán của Lưu Hoằng Tháo | S03, lời bàn Lê Văn Hưu: Tiền Ngô vương "phá trăm vạn binh của Lưu Hoằng Tháo" | Đã đọc (14/11/2026); chi tiết cọc gỗ, năm 938 **chưa** có trong nguồn đã mở |
| II. Loạn sứ quân | Vòng vây Hoa Lư năm 951 (quân hai vua Ngô) | E04, S02 mục Tân Hợi 951: đánh không hạ được, rút quân | Đã có trong sổ nguồn |
| III. Nhà Đinh | Chưa chốt (ứng viên: truy bắt Đỗ Thích năm 979) | Kỷ nhà Đinh trong Toàn thư | **Chưa mở được nguồn** |
| IV. Nhà Tiền Lê | Quân Tống năm 981 (Hầu Nhân Bảo) | Kỷ nhà Lê trong Toàn thư | **Chưa mở được nguồn** |

Không biến người không có ghi chép giao tranh (ví dụ các sứ quân quy phục hay liên minh) thành boss; quy tắc này giữ đúng [sổ nguồn mục 2](../campaign/history-sources.md#2-nhãn-confidence-và-quy-tắc-freeze).

## 6. Trợ giúp (Mưu kế)

Mỗi màn được cấp sẵn một bộ; chế độ thường cho mua thêm bằng vàng trước màn (tối đa +1 mỗi loại), mê cung ngày thì không.

| Trợ giúp | Cấp sẵn | Mua thêm | Tác dụng |
|---|---|---|---|
| **Lọc lời** | 2 | 40 vàng | Bỏ 2 đáp án sai (chỉ câu 4 lựa chọn) |
| **Đổi câu** | 1 | 60 vàng | Thay bằng câu khác cùng độ khó |
| **Hỏi tướng** | 1 | 60 vàng | Một tướng trong ban tham mưu cho gợi ý. Nếu câu hỏi gắn tên người hay vùng đất của chính tướng đó (ví dụ hỏi về Hoa Lư mà hỏi Nguyễn Bặc) thì gợi ý **chắc**: loại thêm một đáp án sai; nếu không thì chỉ hiện gợi ý chữ |
| **Hỏa tốc** | 1 | 40 vàng | Lượt này tự chọn số bước 1–6 thay vì đổ xúc xắc |

Ban tham mưu và tướng cầm quân chọn trong **mọi tướng lịch sử** (Đinh Bộ Lĩnh, Nguyễn Bặc, Đinh Điền, Lê Hoàn, Trịnh Tú, Lưu Cơ, Đinh Liễn, 12 sứ quân), **không cần đã sở hữu**, để ai cũng có như nhau. Dùng chân dung có sẵn. Lời gợi ý là lời game.

## 7. Bậc và số liệu một màn

| | Dễ | Thường | Khó |
|---|---|---|---|
| Mốc lượt cho ★★ | 12 | 16 | 20 |
| Quãng ngắn nhất tới cổng | 14 | 20 | 26 |
| Sương mù | không | bán kính 2 | bán kính 1 |
| Đồng hồ câu | không | 30 giây | 20 giây |
| Bẫy (ẩn) | 3–4 (0) | 6–8 (một nửa) | 10–12 (hai phần ba) |
| Nước giao tranh | 15 | 12 | 10 |
| Tỉ lệ Lục/Vàng/Đỏ | 60/30/10 | 40/40/20 | 25/45/30 |

Mốc lượt cho ★★ ([mục 8.1](#81-sao)) đặt sao cho người trả lời đúng khoảng 70% đạt được ở bậc Thường. Cần mô phỏng (`pnpm sim -- --maze`, người chơi giả với tỉ lệ đúng 50/70/90%) trước khi chốt.

## 8. Chấm sao, thưởng và Sử ký sưu tầm

### 8.1 Sao

- ★ Thoát được.
- ★★ Thoát trong mốc lượt của bậc: Dễ 12, Thường 16, Khó 20 lượt (điểm xuất phát).
- ★★★ Thêm điều kiện sai không quá 2 câu trong cả màn.

### 8.2 Thưởng (điểm xuất phát)

- **Lần đầu thoát** mỗi bậc của mỗi mê cung: Dễ 100, Thường 200, Khó 400 vàng; mỗi sao mới đạt thêm 50 vàng.
- **Chơi lại:** 20 vàng + vàng nhặt trong giao tranh. Không giới hạn số lần (theo nguyên tắc không chặn cày ở [Tiến trình & kinh tế](../../01-gameplay/tien-trinh-kinh-te.md#2-vàng)), nhưng mức thấp vì câu hỏi có thể thuộc lòng.
- Không kinh nghiệm, không trang bị, không đá: đội hình không ra trận.

### 8.3 Sử ký sưu tầm

- Mỗi câu trả lời đúng lần đầu mở một **thẻ Sử ký** theo mã claim (một claim nhiều câu hỏi vẫn là một thẻ). Bia đá và boss cho thẻ hiếm.
- Thẻ gom theo 4 giai đoạn, xem trong màn Sử ký có sẵn của Bình Loạn (thêm tab "Mê cung"). Mỗi thẻ có lời tóm tắt, nhãn (`recorded`/`legend`/`disputed`) và nguồn.
- Đủ bộ một giai đoạn: thưởng một lần 300 vàng (khung hồ sơ hoặc danh hiệu để sau, theo quyết định chỉ thưởng vàng ngày 01/11/2026).

### 8.4 Mở khóa và ai chơi được

- Mê cung I mở sẵn; mê cung kế mở khi thoát mê cung trước ở bậc Dễ. Bậc Thường mở khi thoát Dễ, Khó mở khi thoát Thường.
- Chế độ thường **chơi offline, khách chơi được**, không bảng xếp hạng (như Viễn Chinh). Tiến độ lưu trên hồ sơ khi đăng nhập (`profile.maze`), khách lưu máy.

### 8.5 Mê cung ngày (bước sau)

- Một bản đồ và một chuỗi câu hỏi chung mỗi ngày, seed HMAC theo ngày như [Nhật Lệnh](../README.md#51-nhật-lệnh-tên-cũ-thử-thách-hằng-ngày-claude-đặt-20102026-chờ-shan-duyệt), mỗi người một lượt.
- Xếp hạng: thoát đứng trên không thoát; rồi ít lượt hơn, ít câu sai hơn, thời gian ngắn hơn.
- Cần đăng nhập, server chấm đáp án (client không nhận đáp án trước khi nộp). Thưởng hạng theo bảng chung ở [mục 6 Chế độ chơi](../README.md#6-thưởng-vàng-theo-hạng-cuối-kỳ-claude-đặt-01112026-chờ-shan-duyệt), đề xuất bằng Nhật Lệnh.

## 9. Bốn mê cung theo thời gian

Mỗi mê cung lấy câu hỏi chủ yếu từ giai đoạn của nó (khoảng 70%), phần còn lại ôn giai đoạn trước. Bối cảnh sa bàn, bộ bẫy và boss theo giai đoạn.

| # | Mê cung | Khung năm | Chủ đề câu hỏi | Sa bàn gợi ý |
|---|---|---|---|---|
| I | Ngô Quyền dựng nước | trước 939 – 944 | Ngô Quyền phá quân Nam Hán, xưng vương, Dương Tam Kha | Cửa sông, bãi cọc, Cổ Loa |
| II | Loạn sứ quân | 944 – 967 | Hậu Ngô, 12 sứ quân và vùng đất, vây Hoa Lư 951, Trần Lãm, quy phục và liên minh | Đồng lau, đồn lũy, cửa biển Bố Hải |
| III | Nhà Đinh | 968 – 979 | Lên ngôi, quốc hiệu, kinh đô Hoa Lư, niên hiệu Thái Bình, triều thần, biến cố 979 | Núi đá Hoa Lư, cung điện, bến thuyền |
| IV | Nhà Tiền Lê | 980 – 1009 | Lê Hoàn lên ngôi, chống Tống, các đời vua Tiền Lê | Sông nước, ải núi |

Truyền thuyết (cờ lau, chăn trâu) dùng được nhưng câu hỏi phải nói "tương truyền" ([mục 10.3](#103-quy-tắc-soạn-câu)).

## 10. Kho câu hỏi

### 10.1 Dạng câu

| Dạng | Mô tả | Dùng ở |
|---|---|---|
| `choice` | Trắc nghiệm 4 đáp án, 1 đúng | Mọi màu ô (dạng chính) |
| `trueFalse` | Đúng/Sai | Chỉ ô Lục (đoán trúng 50%) |
| `year` | Chọn năm trong 4 năm | Vàng, Đỏ; **cấm** với mốc `disputed` |
| `order` | Xếp 3–4 sự kiện theo thời gian | Vàng, Đỏ, cửa ải |
| `match` | Nối 3 cặp (người ↔ vùng đất, người ↔ danh hiệu) | Vàng, Đỏ |
| `reading` | Đọc câu trích có nguồn rồi trả lời | Bia đá |

### 10.2 Lược đồ dữ liệu

Kho câu là dữ liệu TypeScript trong repo (đổi qua PR, có lịch sử), ví dụ `src/core/maze/questions/<giai-đoạn>.ts`. Đề xuất:

```ts
export type MazeEra = "ngo" | "loanSuQuan" | "dinh" | "tienLe";
export type QuestionKind = "choice" | "trueFalse" | "year" | "order" | "match" | "reading";
export type QuestionStatus = "draft" | "verified" | "approved" | "retired";

export interface QuestionSource {
  /** Mã trong sổ nguồn (S01…), nguồn mới phải được thêm vào sổ trước. */
  readonly id: string;
  /** Mục, năm can chi, đoạn: tìm được trong bản đã đọc. */
  readonly locator: string;
  /** Câu trích ngắn (≤ 25 chữ) nếu câu hỏi dựa trên lời văn cụ thể. */
  readonly quote?: string;
}

export interface MazeQuestion {
  readonly id: string;                 // "mz-loan-0007"
  readonly era: MazeEra;
  readonly years?: readonly [number, number];
  readonly difficulty: 1 | 2 | 3;
  readonly kind: QuestionKind;
  readonly prompt: string;
  /** choice/year/trueFalse: các đáp án; order/match: các mục cần xếp hoặc nối. */
  readonly options: readonly string[];
  readonly matchWith?: readonly string[];     // cột phải của dạng match
  /** choice/year: chỉ số đúng; trueFalse: 0 = Đúng, 1 = Sai; order: thứ tự đúng; match: cặp đúng. */
  readonly answer: number | readonly number[];
  readonly explanation: string;               // sử chép 1–2 câu, hiện sau khi trả lời
  readonly hint?: string;                     // cho Hỏi tướng
  readonly tags: {
    readonly people?: readonly string[];      // id roster nếu có (nguyenBac…), không thì tên
    readonly places?: readonly string[];
    readonly topics?: readonly string[];
  };
  readonly claims: readonly string[];         // E01, W02… theo sổ nguồn; câu mới thêm claim mới
  readonly basis: "recorded" | "legend" | "disputed";
  readonly confidence: "high" | "medium" | "low";
  readonly sources: readonly QuestionSource[];
  readonly status: QuestionStatus;
  readonly review?: { readonly by: string; readonly at: string; readonly note?: string };
  readonly rev: number;                       // tăng khi sửa nội dung; câu đổi nghĩa thì làm id mới
}
```

Chỉ câu `approved` được chọn vào màn. Thẻ Sử ký lấy theo `claims`, nên cần thêm các claim mới (sau 968) vào sổ nguồn cùng định dạng E…/W….

### 10.3 Quy tắc soạn câu

1. **Mỗi câu có nguồn và locator** đã mở và đọc, không dùng snippet tìm kiếm, wiki tổng hợp hay trả lời AI làm căn cứ (đúng [sổ nguồn mục 1](../campaign/history-sources.md#1-source-ledger-lập-trước-hồ-sơ)).
2. **Không hỏi điều đang tranh cãi như thể đã chắc.** Mốc `disputed` (ví dụ Hậu Ngô khôi phục 950 hay 951, vị trí Bình Kiều) chỉ được hỏi dưới dạng "sử chép thế nào" hoặc "theo lời chua", không dùng dạng `year` hay `trueFalse`.
3. **Truyền thuyết** phải có chữ "tương truyền" hoặc "theo truyền thuyết" trong câu hỏi, nhãn `legend`.
4. **Không hỏi lớp game** (nghề, hệ, kỹ năng, tình tiết hư cấu của Bình Loạn) như sử.
5. **Đáp án nhiễu hợp lý nhưng không bịa sự kiện:** dùng tên, năm, nơi có thật ở cùng giai đoạn; không chế danh hiệu hay trận đánh không tồn tại.
6. Viết theo [Văn phong giao diện](../../00-overview/thuat-ngu.md#văn-phong-giao-diện): gọi bạn, câu ngắn, tiếng Việt phổ thông, tên riêng viết như sổ nguồn (Lữ Đường, Ngô Nhật Khánh…).
7. Không dùng danh hiệu hoàng đế cho Ngô Quyền; tách mốc 968 (lên ngôi) và 970 (niên hiệu Thái Bình) như sổ nguồn E01, E10, E11.

### 10.4 Số lượng

Một màn Thường dùng khoảng 20 câu, không lặp trong một lượt chơi; chơi lại nên gặp câu mới. Mục tiêu bản đầu: **80 câu `approved` mỗi giai đoạn** (khoảng 30 Lục, 30 Vàng, 20 Đỏ), tổng 320. Bản chơi thử có thể bắt đầu với 1 mê cung và 60 câu.

### 10.5 Quy trình duyệt

1. **Mở rộng sổ nguồn.** Sổ hiện có (S01–S11) phủ tới năm 968. Kỷ nhà Đinh và nhà Tiền Lê của Toàn thư, chương Đinh và Tiền Lê của Việt Nam sử lược **chưa có trong sổ** (ngày 14/11/2026 chưa mở được các trang này trên Wikisource). Cần thêm nguồn S12 trở đi, đọc thật và ghi locator, trước khi soạn câu cho mê cung III và IV.
2. **Soạn theo lô** 20 câu một giai đoạn, trạng thái `draft`, đủ nguồn và locator.
3. **Kiểm tự động** (`pnpm maze:check`, thêm vào `pnpm check`): đủ trường; mã nguồn và claim có trong sổ; không trùng câu; đáp án nằm trong options; `disputed` không dùng dạng `year`/`trueFalse`; `legend` có chữ "tương truyền"/"theo truyền thuyết".
4. **Đối chiếu chéo:** một người (hoặc phiên Claude khác) mở lại nguồn, xác nhận locator và đáp án → `verified`. Người soạn không tự đối chiếu.
5. **Shan duyệt** trên trang xem kho (chỉ bản dev, kiểu `/demo/art`) hoặc bảng trong PR → `approved`, ghi `review.by/at`.
6. **Người chơi báo sai:** nút "Báo câu này" sau mỗi câu, ghi vào hàng chờ trên server. Câu bị báo nhiều tạm rút khỏi lượt chơi tới khi xem lại; sửa nội dung thì tăng `rev`.

## 11. Câu hỏi mẫu

Các câu dưới đây dựa trên claim và câu trích đã có trong [sổ nguồn Campaign](../campaign/history-sources.md) (mục 3, 6, 7), trừ khi ghi khác. Trạng thái đề xuất là `draft` cho tới khi qua quy trình ở [mục 10.5](#105-quy-trình-duyệt). Đáp án đúng **in đậm**.

### 11.1 Mê cung I: Ngô Quyền dựng nước

**Q1** · `choice` · Lục · E01 · S03 mục Kỷ Hợi 939
Mùa xuân năm 939, Ngô Quyền làm gì?
A. Xưng hoàng đế · **B. Xưng vương** · C. Nhận chức Tiết độ sứ · D. Nhường ngôi cho con
*Sử chép:* Toàn thư chép: "mùa Xuân, Vương mới xưng vương, lập Dương thị làm vương hậu". Ngô Quyền xưng vương, không xưng đế.

**Q2** · `choice` · Vàng · E02 · S03 mục Ất Tỵ 945 · `recorded` + `disputed` (cách gắn năm)
Sau khi Ngô Quyền mất, ai cướp ngôi?
A. Ngô Xương Văn · B. Kiều Công Hãn · **C. Dương Tam Kha** · D. Đỗ Cảnh Thạc
*Sử chép:* Toàn thư chép Ngô Quyền mất năm 944 và "Tam Kha cướp ngôi" ở mục năm 945. Câu không hỏi năm vì cách gắn năm còn khác nhau.

**Q3** · `reading` · Vàng · S03, lời bàn của Lê Văn Hưu ở đời Tiền Ngô vương (đọc ngày 14/11/2026, cần thêm claim mới vào sổ)
Bia đá: *"…phá trăm vạn binh của Lưu Hoằng Tháo…"* (Lê Văn Hưu bàn về Tiền Ngô vương). Lời bàn này khen ai?
A. Dương Đình Nghệ · **B. Ngô Quyền** · C. Đinh Bộ Lĩnh · D. Ngô Xương Văn
*Sử chép:* Lê Văn Hưu, sử gia đời Trần, khen Tiền Ngô vương Ngô Quyền đã phá quân của Lưu Hoằng Tháo nước Nam Hán.

### 11.2 Mê cung II: Loạn sứ quân

**Q4** · `trueFalse` · Lục · E04 · S02 mục Tân Hợi 951
Năm 951, hai vua Ngô đem quân vây Hoa Lư và hạ được thành.
Đúng · **Sai**
*Sử chép:* Hai vua Ngô đánh Hoa Lư không hạ được, rút quân về.

**Q5** · `choice` · Vàng · W01 · S01 mục 966
Trần Lãm xưng là gì và giữ nơi nào?
**A. Trần Minh Công, giữ cửa biển Bố Hải** · B. Trần Lãm Công, giữ Đường Lâm · C. Trần Minh Công, giữ Đằng Châu · D. Trần Lãm Công, giữ Tế Giang
*Sử chép:* "Trần Lãm, xưng là Trần Minh Công, giữ cửa biển Bố Hải."

**Q6** · `match` · Vàng · W01, W02, W03 · S01 mục 966
Nối sứ quân với nơi giữ: Trần Lãm · Phạm Bạch Hổ · Ngô Xương Xí ↔ Bình Kiều · Bố Hải · Đằng Châu
**Đáp án:** Trần Lãm–Bố Hải; Phạm Bạch Hổ–Đằng Châu; Ngô Xương Xí–Bình Kiều.
*Sử chép:* Toàn thư liệt kê các sứ quân cùng nơi họ giữ ở mục năm 966; danh sách không phải thứ tự giao chiến.

**Q7** · `choice` · Lục · E08 · S01 mục Đinh Mão 967
Đinh Bộ Lĩnh cùng người con nào sang nương tựa Trần Minh Công?
A. Đinh Toàn · **B. Đinh Liễn** · C. Đinh Điền · D. Hạng Lang
*Sử chép:* "Đinh Bộ Lĩnh nghe Trần Minh Công có đức mà không con, bèn cùng với con là Liễn sang nương tựa."

**Q8** · `choice` · Đỏ · E09 · S01 mục 967
Theo Toàn thư, Phạm Phòng Át (Phạm Bạch Hổ) đã làm gì trước Đinh Bộ Lĩnh?
A. Tử trận ở Đằng Châu · **B. Đem binh về hàng** · C. Rút ra biển · D. Liên minh rồi phản lại
*Sử chép:* "Phạm Phòng Át đem binh về hàng", về sau giữ chức Thân vệ tướng quân.

**Q9** · `choice` · Đỏ · W03, U03 · S01 lời chua Bình Kiều · `disputed`
Theo lời chua trong Toàn thư, Bình Kiều (nơi Ngô Xương Xí giữ) ở đâu?
A. Hưng Yên · B. Thanh Hóa · **C. "Nay không rõ chỗ nào"** · D. Hoa Lư
*Sử chép:* Lời chua ghi "Bình Kiều, nay không rõ chỗ nào"; sách đời sau định vị khác nhau. Câu này là ví dụ cách hỏi một điểm còn tranh cãi.

**Q10** · `order` · Cửa ải · E01, E04, E06 · S03, S02
Xếp theo thời gian: Hai vua Ngô vây Hoa Lư · Ngô Quyền xưng vương · Ngô Xương Văn mất trận · Ngô Quyền mất
**Đáp án:** Ngô Quyền xưng vương (939) → Ngô Quyền mất (944) → Hai vua Ngô vây Hoa Lư (951) → Ngô Xương Văn mất trận (965).

**Q11** · `choice` · Lục · E12 · S04 đoạn đầu mục Đinh Tiên Hoàng, S07 · `legend`
Tương truyền thuở nhỏ chăn trâu, Đinh Bộ Lĩnh cùng bạn bè lấy gì làm cờ khi bày trận?
A. Lá chuối · **B. Bông lau** · C. Cành tre · D. Vải đỏ
*Sử chép:* Đây là truyền thuyết sách sử có kể, không phải chuyện xác định được ngày tháng.

### 11.3 Mê cung III: Nhà Đinh

**Q12** · `choice` · Lục · E10 · S04 đoạn Mậu Thìn, S08 đoạn 968
Năm 968, Đinh Bộ Lĩnh lên ngôi hoàng đế và đặt quốc hiệu là gì?
A. Đại Việt · **B. Đại Cồ Việt** · C. Vạn Xuân · D. Đại Nam
*Sử chép:* Năm 968 Đinh Bộ Lĩnh lên ngôi, đặt quốc hiệu Đại Cồ Việt, đóng đô ở Hoa Lư.

**Q13** · `year` · Vàng · E11 · S04 đoạn Canh Ngọ, S08
Niên hiệu Thái Bình của nhà Đinh bắt đầu năm nào?
A. 966 · B. 968 · **C. 970** · D. 979
*Sử chép:* Đinh Bộ Lĩnh lên ngôi năm 968, tới năm 970 mới đặt niên hiệu Thái Bình. Hai mốc này hay bị nhầm.

### 11.4 Mê cung IV: Nhà Tiền Lê (chưa có nguồn trong sổ)

Các câu mê cung IV và phần sau năm 970 của mê cung III **chưa soạn mẫu**, vì kỷ nhà Đinh và nhà Lê chưa có trong sổ nguồn. Chủ đề dự kiến (cần nguồn trước khi viết): Lê Hoàn lên ngôi, niên hiệu Thiên Phúc; chống quân Tống; Đinh Toàn; biến cố năm 979; các đời vua cuối Tiền Lê. Không viết câu từ trí nhớ.

## 12. Giao diện, kỹ thuật và các bước làm

### 12.1 Giao diện (phác)

- Sa bàn kiểu bản đồ cổ như [bản đồ Bình Loạn](../../05-ui-ux/campaign/README.md): lối đi là đường đất, ô là phiến đá có màu viền theo độ khó, cờ lau cắm trên ô đã thông.
- Thanh trên: số lượt, Ấn sử, trợ giúp, nút Sổ ôn. Xúc xắc trống đồng ở góc dưới.
- Câu hỏi hiện trên thẻ tre trượt lên; sau khi trả lời lật mặt sau là sử chép kèm mã nguồn.
- Ô giao tranh mở bàn cờ match-3 cỡ nhỏ (8×8 nếu lõi bàn cờ hỗ trợ kích thước khác, không thì 12×8), boss là chân dung lớn bên trên với thanh Thành lực ba pha.
- Điện thoại: sa bàn kéo và phóng to được, tự cuộn theo tướng.

### 12.2 Kỹ thuật

- `src/core/maze/`: sinh mê cung theo seed (đảm bảo luôn có đường tới cổng, quãng ngắn nhất đúng bậc), state machine màn (`mazeAct`: roll, move, answer, useAid), chọn câu không lặp, `skirmish.ts` (giao tranh một chiều trên lõi `board`). Logic thuần, theo luật ESLint của `src/core/`.
- `src/core/maze/questions/`: kho câu và `pnpm maze:check`.
- Hồ sơ thêm `maze` (sao từng bậc, thẻ Sử ký đã mở, đã nhận thưởng lần đầu), thao tác qua `applyProfileAction` như các chế độ khác.
- Scene `MAZE`, route `/game/maze`, cờ `MAZE_ENABLED`.
- Mê cung ngày: bảng mới trên server, đáp án chỉ trả sau khi nộp.

### 12.3 Các bước

1. **Kho câu bước 1:** mở rộng sổ nguồn, soạn và duyệt 60 câu mê cung II (giai đoạn có nguồn tốt nhất).
2. **Bản chơi thử offline:** lõi mê cung + mê cung II bậc Dễ/Thường, chưa có giao tranh, chưa thưởng.
3. **Giao tranh một chiều** và boss mê cung II; mô phỏng mốc lượt, số nước.
4. Đủ 4 mê cung, thưởng hồ sơ, Sử ký sưu tầm.
5. Mê cung ngày và bảng xếp hạng.

## 13. Điểm cần Shan quyết

**Đã chốt (Shan, 14/11/2026):**

- Tên chế độ là **Sử Lộ** ([mục 1](#1-định-vị)), dòng phụ "Mê cung lịch sử".
- **Không giới hạn số lượt** vì đây là giải đố học sử: bỏ lương làm giới hạn, không thua vì hết lượt; số lượt chỉ để chấm sao và xếp hạng.
- **Ô giao tranh mọi người như nhau:** không lấy chỉ số hồ sơ; tướng chọn được mọi tướng lịch sử không cần sở hữu.

**Còn mở:**

1. **Sai thì về đâu:** về ô bắt đầu lượt (đề xuất, nhẹ nhàng) hay về xuất phát (rất khó)?
2. **Mua trợ giúp bằng vàng** ở chế độ thường: có hay không? (Nếu muốn mọi người như nhau tuyệt đối thì bỏ.)
3. **Mê cung ngày có bảng xếp hạng** (cần đăng nhập) ngay từ đầu hay để sau?
4. **Sổ nguồn cho sau năm 968:** mở rộng thẳng [sổ nguồn Campaign](../campaign/history-sources.md) (đang `FROZEN`, cần sửa đổi có ghi lý do) hay làm sổ riêng cho chế độ này?
5. **Boss mê cung III và IV:** Đỗ Thích (979) và quân Tống (981) có hợp không, sau khi có nguồn?
6. **Ai duyệt câu:** chỉ Shan, hay Shan duyệt mẫu rồi giao người đối chiếu nguồn?
