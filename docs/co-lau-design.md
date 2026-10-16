# Cờ Lau (Reed Banner) — Tài liệu thiết kế (bản chốt sau buổi phản biện)

> Game match-3 chiến đấu theo lượt, lấy cảm hứng từ thời kỳ Loạn 12 Sứ Quân (thế kỷ X).
> **Tên game:** Cờ Lau — tiếng Anh: **Reed Banner**. Repo đề xuất: `co-lau`.
> Mini game thuộc ShanVerse. Trạng thái: **thiết kế — chưa triển khai code**.
> Cập nhật: 16/10/2026

---

## 0. Nguồn gốc & pháp lý

- **Nguồn tham khảo:** *Loạn 12 Sứ Quân* — game J2ME (MIDP 2.0) của MicroGame Corp. (2010), phát hành qua nền tảng OLA, thu phí SMS.
- **Nguyên tắc:** Cờ Lau là bản **viết lại sạch (clean-room)**. Chỉ học luật chơi và cảm giác. **Không** dùng code, hình ảnh, âm thanh, lời thoại hay cốt truyện cụ thể của bản gốc.
- Bối cảnh lịch sử và tên nhân vật lịch sử là lịch sử chung. Mọi tính cách, kỹ năng, lời thoại gán cho nhân vật lịch sử được ghi rõ là **hư cấu**.

---

## 1. Bàn cờ & luật ghép

### 1.1 Bàn cờ
- Kích thước **8×8**. Trên điện thoại rộng 360px, mỗi ô khoảng 40px.
- **6 loại ô:**

| Ô | Tên | Tác dụng khi ghép |
|---|---|---|
| ⚔️ | Kiếm | Đánh thường vào đối thủ |
| ☯️ | Âm dương | Năng lượng tuyệt chiêu (cho người hành động) |
| 🍙 | Bánh chưng | Lương thực (chung cả đội) |
| ❤️ | Tim | Hồi máu (cho người hành động) |
| 💰 | Thỏi vàng | Vàng (tài nguyên ngoài trận) |
| 📖 | Sách | Kinh nghiệm (tài nguyên ngoài trận) |

### 1.2 Luật ghép
Tính theo **tổng số ô của một bộ ghép liền nhau**.

| Bộ ghép | Thu hoạch | Thêm lượt | Ô đặc biệt |
|---|---|---|---|
| 3 ô | ✅ | — | — |
| 4 ô | ✅ | ✅ | — |
| Chữ L / T (5 ô) | ✅ | ✅ | Bản **yếu** |
| Thẳng 5 | ✅ | ✅ | Bản **mạnh** |

- **Cascade** (ô tự rơi rồi ghép): vẫn tạo được ô đặc biệt, nhưng **không** cho thêm lượt. Chỉ nước đi chủ động mới được thêm lượt.
- Ô đặc biệt xuất hiện tại ô người chơi vừa kéo. Nếu do cascade thì xuất hiện ở ô giữa bộ ghép.
- Nhiều bộ ghép trong cùng một nước được xét độc lập, nên một nước có thể tạo nhiều ô đặc biệt.
- Ô bị **nổ hoặc xóa** bởi ô đặc biệt đều **được thu hoạch**. Combo không giới hạn.
- Giới hạn kỹ thuật (người chơi không thấy): server dừng xử lý sau tối đa **100 bước cascade** mỗi lượt.
- Bàn hết nước đi hợp lệ thì xáo lại bàn.

### 1.3 Ô đặc biệt (bản mạnh — từ thẳng 5)

| Nguồn | Ô đặc biệt | Hiệu ứng khi được ghép |
|---|---|---|
| 5 ⚔️ | Kiếm lửa | Nổ vùng 3×3 |
| 5 ☯️ | Âm dương thái cực | Xóa 1 hàng hoặc 1 cột (theo hướng bộ ghép) |
| 5 🍙 | Mâm cỗ | Biến 4 ô ngẫu nhiên thành bánh chưng |
| 5 ❤️ | Tim vàng | Hồi máu cho cả đội |
| 5 💰 | Rương vàng | Xóa toàn bộ ô cùng màu với một ô ngẫu nhiên |
| 5 📖 | Binh thư | Xóa cả hàng lẫn cột (hình chữ thập) |

- **Không có kiếm lửa rơi ngẫu nhiên** như bản gốc. Kiếm lửa chỉ sinh ra từ ghép 5 kiếm.
- Kiếm lửa khi được ghép tính **gấp đôi** một ô kiếm thường trong công thức sát thương.
- **Bản yếu (từ chữ L/T):** _TODO — thiết kế trong bước tiếp theo._

### 1.4 Sinh ô & lấp đầy bàn

**Ngẫu nhiên có seed (không có mẫu sẵn)**
- Đầu mỗi trận, server bốc một **seed** mới bằng bộ sinh số ngẫu nhiên an toàn của hệ điều hành.
- Seed đưa vào một PRNG xác định (ví dụ mulberry32), cho ra dãy số 0–1. Mỗi số được đổi thành một loại ô theo bảng trọng số.
- Cùng seed thì cho ra cùng một bàn, nhờ đó server **tái hiện** được trận (khôi phục sau F5, kiểm tra lỗi).
- Hai **luồng ngẫu nhiên riêng:** (1) bàn khởi đầu và ô rơi; (2) lựa chọn ngẫu nhiên của AI.
- Ở chế độ online, seed **chỉ nằm trên server**. Client chỉ nhận bàn hiện tại và các ô vừa rơi.

**Lấp đầy sau mỗi lần ăn ô**
1. **Rơi xuống:** mỗi cột xử lý độc lập; ô còn lại rơi thẳng xuống, giữ thứ tự. Ô đặc biệt rơi như ô thường.
2. **Sinh ô mới** ở đỉnh cột, đủ số ô bị mất. Ô mới luôn là ô thường, sinh **ngẫu nhiên thuần** theo trọng số của màn, và **được phép tạo cascade ngay**.
3. **Kiểm tra lại:** có bộ ghép thì cascade, quay lại bước 1. Lặp tối đa 100 bước.

**Bàn khởi đầu & xáo bàn**
- Bàn khởi đầu: không có bộ ghép sẵn (bốc lại nếu ô vừa sinh tạo bộ 3) và có ít nhất một nước đi hợp lệ.
- Hết nước đi hợp lệ: xáo lại các ô đang có, giữ nguyên ô đặc biệt. Bàn sau khi xáo phải có nước đi hợp lệ và không có bộ ghép sẵn. Xáo bàn không tính lượt.

**Tỉ lệ sinh ô theo màn**
- Bảng chuẩn (màn thường, chế độ thường): ⚔️ 20% · ☯️ 18% · 🍙 18% · ❤️ 18% · 💰 13% · 📖 13%.
- **Màn thường trong chiến dịch:** có thể có bảng tỉ lệ riêng như một đặc tính của màn, ví dụ "Thành Cổ Loa: nhiều kiếm, ít tim". Đây là câu đố chọn đội.
- **Trận trùm ("sân nhà"):** tăng tỉ lệ ô theo nghề của trùm, kèm **lợi thế bất đối xứng** để trùm hưởng nhiều hơn, ví dụ trùm nhận ×1.5 từ ô nghề của nó. _TODO: cân bằng mức lợi thế._
- **Giới hạn bắt buộc:** mỗi loại ô tối thiểu **8%**, tối đa **35%**.
- Tỉ lệ ô của màn được **hiển thị trước trận** (thanh màu nhỏ) để người chơi chọn đội.

### 1.5 Đi sai & giới hạn thời gian
- **Chế độ thường:** không có đi sai. Kéo sai thì ô bật về chỗ cũ, không tính lượt. Không giới hạn thời gian.
- **Chiến dịch:** hai luật dưới đây có thể bật như **"luật màn"** (cùng với bảng tỉ lệ ô của màn, mục 1.4):
  - **Đi sai:** mất 5% máu tối đa của người hành động, kèm mất lượt.
  - **Giới hạn giờ mỗi lượt** (ví dụ 15 giây): hết giờ chỉ mất lượt, không mất máu.
    - Server đếm giờ (ghi `deadline` mỗi lượt), cộng 3 giây ân hạn cho độ trễ mạng.
    - Thời gian chạy animation (cascade, tuyệt chiêu, lượt của AI) không tính vào giờ của người chơi.

---

## 2. Trận đấu

### 2.1 Cấu trúc
- **Đội 3 đấu 3**, cả 3 người cùng có mặt trên sân.
- **Đội hình:** xếp vị trí 1 / 2 / 3 **trước trận**, không đổi giữa trận.
- Vị trí chỉ quyết định **thứ tự đánh mặc định** và **đối thủ đối diện** (vị trí 1 đối diện vị trí 1…).

### 2.2 Người hành động mỗi lượt
- Mặc định là **người kế tiếp sau người vừa ra tay**, theo thứ tự vị trí, và **được làm sáng sẵn**. Người chơi chỉ chạm vào chân dung khi muốn đổi người.
- **Người vừa hành động phải nghỉ 1 lượt** (không được chọn liên tiếp). Luật mặc định tự thỏa mãn điều này.
- Bỏ qua người đã gục và người đang bị Đóng băng.
- **Lượt thêm** (từ ghép 4 trở lên): thuộc về phe, phải chọn người khác; mặc định là người kế tiếp.
- Chỉ còn một người sống thì người đó đánh mọi lượt.

### 2.3 Mục tiêu
- **Đánh thường** (ghép kiếm) nhắm vào **đối thủ đối diện**. Đối diện đã gục thì nhắm vào đối thủ còn sống gần nhất.
- **Khiêu khích** ghi đè luật trên (xem mục 5).
- **Tuyệt chiêu** nhắm vào đồng đội hoặc đối thủ được người chơi chọn, theo loại chiêu.

### 2.4 Bảo vệ & thời lượng
- **Trụ vững:** nhân vật còn **trên 30% máu** thì không thể bị hạ gục trong một lượt; đòn chí mạng chỉ đưa xuống 1 máu. Áp cho **cả hai phe**.
- Máu gốc được đặt cao để một combo không quét sạch cả đội.
- **Thời lượng mục tiêu (chế độ thường):** 6–10 phút, nghiêng về 6–8 phút, tương đương 20–30 lượt mỗi bên.
- **Trận trùm:** dài khoảng gấp rưỡi bình thường.
- Máu, ATK, tốc độ tụt lương và chi phí năng lượng được **tính ngược** từ thời lượng mục tiêu, rồi kiểm chứng bằng script mô phỏng (AI đấu AI hàng nghìn trận).

---

## 3. Tài nguyên trong trận

### 3.1 Lương thực & sĩ khí (chung cả đội)
- Khởi đầu **60**, tối đa 100.
- Đầu mỗi lượt của phe nào thì phe đó bị trừ **−5** (đội có Binh lính: **−3**).
- Mỗi ô bánh chưng ghép được: **+4**.

| Lương | Sĩ khí | Hiệu ứng |
|---|---|---|
| ≥ 70 | Hăng hái | ×1.15 sát thương |
| 30–69 | Bình thường | — |
| 1–29 | Đói | ×0.75 sát thương; năng lượng từ âm dương giảm còn một nửa |
| 0 | Hết lương | ×0.5 sát thương; mất 3% máu tối đa mỗi lượt |

- Sĩ khí chỉ tác động lên **sát thương và năng lượng**, không tác động lên hồi máu hay DEF.
- AI chịu đúng luật như người chơi.
- **Chế độ thường:** lương reset mỗi trận.
- **Chiến dịch:** lương mang sang trận sau (xem mục 8).

### 3.2 Năng lượng (riêng từng người, tối đa 100)
- **Âm dương:** người hành động nhận **10 mỗi ô** (Pháp sư ×1.5; đang Đói thì ×0.5).
- **Tĩnh tâm:** hai đồng đội **không** hành động trong lượt của phe mình, mỗi người nhận **+4**.
- **Phẫn nộ:** nhận **+1 cho mỗi 5% máu tối đa** bị mất.
- Dùng chiêu thì trừ đúng chi phí của chiêu; phần còn lại giữ nguyên.

> Các con số trên là điểm xuất phát. Script cân bằng sẽ chỉnh lại.

---

## 4. Công thức

```
Sát thương kiếm = round( ATK
                         × (ô kiếm thường + 2 × ô kiếm lửa)
                         × Sĩ khí × Ngũ hành × Cascade × Nội tại nghề
                         × 100 / (100 + DEF đối thủ) )

Sát thương tuyệt chiêu = round( Sát thương gốc của chiêu × Sĩ khí × Ngũ hành )
                         // bỏ qua DEF
```

| Hệ số | Giá trị |
|---|---|
| Sĩ khí | 1.15 / 1 / 0.75 / 0.5 |
| Ngũ hành (trong trận) | 1.25 (khắc) / 1 / 0.75 (bị khắc) |
| Cascade | +10% mỗi bước, tối đa +50% |
| DEF | Dạng phần trăm: DEF 50 giảm 33%, DEF 100 giảm 50%; không bao giờ vô hiệu hóa hoàn toàn |

- Tổng hệ số nằm trong khoảng 0.375× đến khoảng 2.16× (chưa tính nội tại nghề).
- **Hiển thị:** con số lớn ở giữa màn hình, kèm biểu tượng nhỏ cho từng hệ số đang có hiệu lực. Chạm giữ hoặc rê chuột để xem bảng chi tiết.

---

## 5. Hiệu ứng trạng thái

### 5.1 Hiệu ứng kéo dài (9)

| Hiệu ứng | Tác dụng |
|---|---|
| 🛡️ Khiên | Hấp thụ N sát thương trước khi trừ máu |
| ❄️ Đóng băng | Bị bỏ qua trong luân phiên, không được chọn hành động |
| 🔥 Thiêu đốt | Mất N máu đầu mỗi lượt của phe mình |
| ⬆️⬇️ Công ± | Tăng hoặc giảm ATK theo % |
| ⬆️⬇️ Thủ ± | Tăng hoặc giảm DEF theo % |
| 💚 Hồi phục | Hồi N máu đầu mỗi lượt của phe mình |
| 🎯 Khiêu khích | Đánh thường và chiêu đơn mục tiêu của đối thủ buộc phải nhắm vào người này |
| ↩️ Phản đòn | Trả lại X% sát thương nhận vào cho kẻ tấn công |
| 🔇 Câm lặng | Không được dùng tuyệt chiêu (vẫn đổi ô bình thường) |

### 5.2 Tác dụng tức thì (2)
- ✨ **Thanh tẩy:** xóa mọi hiệu ứng bất lợi (Đóng băng, Thiêu đốt, Công−, Thủ−, Câm lặng) trên mục tiêu.
- 💨 **Xua tan:** xóa mọi hiệu ứng có lợi (Khiên, Công+, Thủ+, Hồi phục, Phản đòn) của mục tiêu đối phương.

### 5.3 Luật chung
- Thời lượng đếm theo **lượt của phe bị ảnh hưởng**.
- **Cùng loại thì làm mới, không cộng dồn:** giữ giá trị mạnh hơn và thời lượng dài hơn.
- **Đóng băng** tối đa 2 lượt; sau khi tan thì **miễn nhiễm 1 lượt**.
- **Khiêu khích:**
  - Không ảnh hưởng chiêu diện rộng.
  - Tối đa 2 lượt.
  - Mất hiệu lực khi người khiêu khích bị Đóng băng hoặc gục.
- Không có hiệu ứng hạ gục tức thì (giữ luật trụ vững).
- Đây là **mức trần cho bản đầu**: 9 hiệu ứng kéo dài + 2 tác dụng tức thì.

---

## 6. Ngũ hành

### 6.1 Hệ số trang bị (so với hành của nhân vật)

| Quan hệ | Hệ số chỉ số |
|---|---|
| Cùng hành | ×1.5 |
| Tương sinh | ×1.25 |
| Bình thường | ×1 |
| Tương khắc | ×0.75 |

### 6.2 Trong trận
- Hành của bên đánh khắc hành của bên bị đánh: **+25% sát thương**. Bị khắc ngược lại: **−25%**.
- Hành dùng để tính khắc chế là **hành của người tung đòn**.
- **Không** gắn ngũ hành vào ô trên bàn cờ, để bàn cờ dễ đọc.

### 6.3 Dấu ấn ngũ hành trên kỹ năng
**Nguyên tắc: lõi chiêu nghề hoàn toàn trung tính. Mọi hiệu ứng mang màu ngũ hành chỉ đến từ dấu ấn theo hành của người tung chiêu.**

| Hành | Dấu ấn thường (mọi chiêu nghề) | Dấu ấn cường hóa (Ngũ hành ấn) |
|---|---|---|
| 🔥 Hỏa | Thiêu đốt 1 lượt | Thiêu đốt 3 lượt |
| 💧 Thủy | 20% cơ hội Đóng băng 1 lượt | Chắc chắn Đóng băng 1 lượt |
| 🌳 Mộc | Hồi phục nhẹ cho bản thân 1 lượt | Hồi phục cho cả đội 2 lượt |
| ⚙️ Kim | Thủ −15% mục tiêu 1 lượt | Thủ −30% mục tiêu 2 lượt |
| ⛰️ Thổ | Khiên nhỏ cho bản thân | Khiên cho cả đội |

- **Ngoại lệ:** tuyệt chiêu đặc trưng (nấc 3) được phép mang đậm hành của nhân vật.

---

## 7. Nhân vật, nghề & kỹ năng

### 7.1 Mô hình nhân vật
- Mỗi nhân vật = **Nghề + Hành + 1 tuyệt chiêu đặc trưng**.
- **Không có độ hiếm.** Mọi nhân vật cân bằng ở cùng một cấp. Nhân vật mua thêm mang giá trị **chiến thuật** (bao phủ hành, tuyệt chiêu khác, chiêu nhánh khác), không mạnh hơn.
- Nhân vật chính (đội người chơi, trùm đối thủ) là **người lịch sử**, ghi rõ hư cấu hóa. Nhân vật thường là **hư cấu**.
- **Chỉ số:** Máu tối đa, Công (ATK), Thủ (DEF).
- **Nghề cố định** theo nhân vật. **Đối thủ AI cũng có nghề.**

### 7.2 Khởi đầu
- Người chơi khởi đầu với **6 nhân vật, mỗi nghề một người**; chọn 3 người ra trận.
- **Đinh Bộ Lĩnh** là Tướng sĩ. Năm người còn lại là hư cấu.
- Hành của 6 nhân vật khởi đầu nên phủ đủ 5 hành. _TODO: chốt._
- Danh sách nhân vật bán ở cửa hàng: _TODO — chốt sau khi hoàn thiện hệ thống (dự kiến khoảng 12 nhân vật, cộng với nhân vật nhận khi thắng trùm chiến dịch)._

### 7.3 Sáu nghề & nội tại
Mỗi nghề gắn với một loại ô.

| Ô | Nghề | Nội tại trong trận | Phụ ngoài trận |
|---|---|---|---|
| ⚔️ | **Tướng sĩ** | Ghép kiếm từ 4 ô trở lên: +30% sát thương | — |
| ☯️ | **Pháp sư** | Năng lượng từ âm dương ×1.5 | — |
| 🍙 | **Binh lính** | Lương tụt −3/lượt thay vì −5; mỗi bậc sĩ khí trên mức bình thường: +5% DEF | — |
| ❤️ | **Y sư** | Hồi máu từ tim ×1.5; hồi vượt máu tối đa chuyển thành Khiên tạm thời | — |
| 💰 | **Mưu sĩ** | Ghép vàng trừ năng lượng đối thủ (mỗi ô −2) | +10% vàng cuối trận |
| 📖 | **Quân sư** | Ghép sách giảm ATK đối thủ 5% mỗi ô (tối đa −30%, 3 lượt) | +10% kinh nghiệm cuối trận |

### 7.4 Khung kỹ năng

| Nấc | Năng lượng | Kỹ năng | Mở khóa |
|---|---|---|---|
| 1 | 30 | Chiêu nghề (chung theo nghề) | Có sẵn |
| 2 | 60 | Chiêu nhánh: **mua được cả 2, chọn 1 khi vào trận** | Cấp 5 |
| 3 | 100 | Tuyệt chiêu đặc trưng (riêng nhân vật) | Cấp 10 — **làm ở giai đoạn 3** |

- Dùng tuyệt chiêu là **hành động miễn phí trước khi đổi ô**, mỗi lượt tối đa 1 lần. Chỉ **người hành động** trong lượt mới được dùng.
- Điểm kỹ năng dùng để mở nhánh nấc 2 và nâng cấp chiêu (cấp 1 đến 5: tăng sức mạnh hoặc giảm chi phí).

### 7.5 Bộ 18 chiêu nghề (bản nháp — lõi trung tính, cộng dấu ấn ngũ hành)
> Chiêu gây sát thương bỏ qua DEF, vẫn chịu sĩ khí và ngũ hành. Các con số là điểm xuất phát.

**⚔️ Tướng sĩ: dồn sát thương, cổ vũ cả đội**
- Nấc 1, **Trảm kích:** 150% ATK vào 1 đối thủ.
- Nấc 2A, **Hiệu lệnh:** Công +25% cho cả đội, 2 lượt.
- Nấc 2B, **Phá trận:** 220% ATK vào 1 đối thủ, kèm Thủ −30% trong 2 lượt.

**🍙 Binh lính: khiêu khích, chịu đòn**
- Nấc 1, **Thủ thành:** Khiêu khích 2 lượt, kèm Khiên bằng 20% máu tối đa của bản thân.
- Nấc 2A, **Phản kích:** Phản đòn 40% trong 2 lượt, kèm Thủ +30%.
- Nấc 2B, **Tường khiên:** Khiên bằng 15% máu tối đa cho cả đội.

**☯️ Pháp sư: bậc thầy ngũ hành, phá giáp**
- Nấc 1, **Phép công:** 130% ATK vào 1 đối thủ.
- Nấc 2A, **Ngũ hành ấn:** 100% ATK vào 1 đối thủ, kèm dấu ấn **cường hóa**, chắc chắn kích hoạt.
- Nấc 2B, **Phép lan:** 70% ATK vào cả đội đối thủ.

**❤️ Y sư: hồi máu, giải trừ**
- Nấc 1, **Linh dược:** hồi 20% máu cho 1 đồng đội (người chơi chọn), kèm Thanh tẩy người đó.
- Nấc 2A, **Dưỡng sinh:** Hồi phục 8% máu mỗi lượt cho cả đội, 3 lượt.
- Nấc 2B, **Tế độ:** hồi 15% máu cả đội, kèm Thanh tẩy cả đội.

**💰 Mưu sĩ: mua chuộc, phá năng lượng**
- Nấc 1, **Mua chuộc:** trừ 30 năng lượng của 1 đối thủ.
- Nấc 2A, **Ly gián:** Câm lặng 1 đối thủ trong 2 lượt.
- Nấc 2B, **Cắt quân lương:** trừ 15 lương chung của phe đối thủ, kèm trừ 10 năng lượng mỗi đối thủ.

**📖 Quân sư: suy yếu, điều binh**
- Nấc 1, **Nghi binh:** Công −25% cho 1 đối thủ, 2 lượt.
- Nấc 2A, **Phá kế:** Xua tan toàn bộ hiệu ứng có lợi của cả đội đối thủ.
- Nấc 2B, **Bày trận:** Thủ +25% cho cả đội, 2 lượt.

**Khắc chế giữa các nghề (tham khảo):**
- Câm lặng (Mưu sĩ) khắc Pháp sư.
- Xua tan (Quân sư) khắc Binh lính và Y sư.
- Khiêu khích (Binh lính) bảo vệ đồng đội khỏi Tướng sĩ.
- Thanh tẩy (Y sư) giải khống chế.

---

## 8. Tiến trình & kinh tế (giai đoạn 3–4)

### 8.1 Kinh nghiệm & cấp độ
- Kinh nghiệm **tích lũy để lên cấp**, không bao giờ mất.
- Mỗi lần lên cấp nhận **điểm kỹ năng**.
- Kinh nghiệm thu được trong trận được **chia đều cho 3 người** lúc kết thúc trận.

### 8.2 Vàng
- Dùng để mua nhân vật, mua trang bị, và đổi lương (**10 vàng = 10 lương**).
- _TODO: giá trị mỗi ô vàng và ô sách._

### 8.3 Trang bị
- **3 ô trang bị:**
  - **Vũ khí:** +ATK, **giới hạn theo nghề** (đao kiếm, pháp trượng, hồ lô…).
  - **Giáp:** +DEF, dùng chung mọi nghề.
  - **Bảo vật:** +Máu, dùng chung mọi nghề.
- Mỗi trang bị có hành; hệ số theo mục 6.1.
- **Nguồn:** rơi ngẫu nhiên sau trận (server quyết định), cộng với cửa hàng bán món cố định giá cao.

### 8.4 Chiến dịch
- Chuỗi màn thử thách, có trùm là sứ quân lịch sử.
- **Lương mang sang trận sau:**
  - Lương vào trận được giới hạn trong khoảng **20 đến 100**, nên không bao giờ vào trận ở mức hết lương.
  - Giữa các trận có **doanh trại** để đổi vàng lấy lương.
  - Một số màn đặc biệt đặt **lương theo kịch bản** cho phe AI (ví dụ thành bị vây: AI vào trận chỉ có 25 lương).
- **Luật màn** tùy chọn: đi sai, giới hạn giờ.
- **Cốt truyện (đã chốt hướng):**
  - Người chơi đóng vai **Đinh Bộ Lĩnh**.
  - Chiến dịch đi theo **trình tự lịch sử dẹp loạn 12 sứ quân**, mở đầu từ **thuở nhỏ** cho tới khi **lên ngôi**.
  - **Tianwu** không xuất hiện như một nhân vật trong truyện; chỉ đóng vai AI điều khiển các nhân vật đối thủ.
  - _TODO: thiết kế chi tiết ở buổi sau (phe phái, nhân vật lịch sử, cấu trúc các màn, lời thoại)._
- _TODO: cấu trúc các màn, danh sách đối thủ, phần thưởng._

### 8.5 Chế độ chơi

| Chế độ | Mô tả | Giai đoạn |
|---|---|---|
| **Luyện tập / Chơi thử** | Offline, không thưởng, không lưu (gồm trang `/demo`) | 1 |
| **Thường (Normal)** | Trận sinh ngẫu nhiên đấu Tianwu; chọn độ khó; lương reset mỗi trận | 2–3 |
| **Chiến dịch (Campaign)** | Theo cốt truyện; lương mang sang; luật màn; tỉ lệ ô theo màn | 4 |
| **Đánh trùm** | Đánh lại trùm đã gặp trong chiến dịch ở mức khó cao hơn, có luật "sân nhà" và phần thưởng riêng | 4 |
| **Vô hạn = Leo tháp** | Chuỗi trận riêng biệt, độ khó tăng dần | Sau giai đoạn 4 |
| **Sinh tồn** | Một trận không kết thúc, đối thủ theo đợt, báo trước đợt kế tiếp | Sau giai đoạn 4 |

**Leo tháp (Vô hạn)**
- Máu và lương **mang sang** giữa các tầng, không tự hồi.
- Giữa các tầng chọn **1 trong 3 phần thưởng**: hồi máu, thêm lương, hoặc một "phúc" có hiệu lực đến hết lượt leo (ví dụ +10% ATK cả đội).
- Thua thì leo lại từ tầng 1. Mỗi lượt leo được sinh ngẫu nhiên khác nhau.
- Điểm = tầng cao nhất đạt được.

**Sinh tồn**
- Cùng một bàn cờ trong suốt lượt chơi. Đối thủ kéo đến theo **đợt**, mạnh dần.
- **Đợt ≠ lượt.** Một đợt là một nhóm đối thủ kéo vào sân; đợt kết thúc khi toàn bộ đối thủ của đợt bị hạ gục. Mục tiêu tạm thời: 2–3 đối thủ mỗi đợt, khoảng 6–10 lượt mỗi bên (2–3 phút). _Chờ chốt._
- **Báo trước** đợt kế tiếp, ví dụ "3 lượt nữa: 2 Tướng sĩ hệ Hỏa", để người chơi chuẩn bị phòng thủ.
- **Hồi phục cố định giữa các đợt:**
  - Người còn sống: +20% máu tối đa.
  - Lương chung: +25.
- **Hồi sinh người đã gục:**
  - **Tự động** sau **2 đợt** kể từ lúc gục (đếm riêng từng người), với 30% máu và 0 năng lượng.
  - **Hoặc** tiêu **40 lương** ở lần nghỉ giữa đợt để hồi sinh ngay, với 30% máu và 0 năng lượng.
  - Mỗi lần nghỉ giữa đợt chỉ hồi sinh tối đa **1 người**.
- **Lưu điểm theo đợt:** bỏ dở quá 24 giờ thì không xử thua; lượt chơi kết thúc ở đợt cuối cùng đã hoàn thành, và điểm vẫn được ghi.
- Điểm = số đợt đã vượt qua.
- _TODO: số đối thủ mỗi đợt, đường cong sức mạnh, cách đối thủ mới vào sân (lấp chỗ người đã gục)._

**Đề xuất thêm (chờ chốt)**
- 🗓️ **Thử thách hằng ngày:** một seed chung cho mọi người chơi mỗi ngày, mỗi người chơi một lần, xếp hạng theo số lượt hoặc máu còn lại. Seed vẫn chỉ nằm trên server.
- 🧩 **Thế cờ:** bàn cờ dựng sẵn, ô rơi cố định, hạ gục đối thủ trong đúng K nước.
- ⚔️ **Đấu trường bóng ma:** PvP không đồng bộ, đánh với đội hình của người chơi khác do AI điều khiển (để sau).
- **Cơ chế giữ chân:** nhiệm vụ ngày/tuần, thành tựu, bộ sưu tập nhân vật.

---

## 9. AI (Tianwu)
- Đóng vai các sứ quân. Mỗi đội AI có nghề, nên lối đánh khác nhau một cách tự nhiên.
- Duyệt mọi nước đổi ô hợp lệ (khoảng 112), mô phỏng cả cascade rồi chấm điểm.
- **Độ khó** điều chỉnh qua độ "tham" combo và độ ngẫu nhiên; ở mức độ khó thấp, AI không cố tình chọn nước có combo lớn nhất.
- **Hoàn toàn xác định theo seed**: không dùng `Math.random()` trong logic.
- **Ngang bằng thông tin: Tianwu chỉ biết đúng những gì người chơi biết.**
  - Hàm AI chỉ nhận trạng thái nhìn thấy được (bàn cờ, máu, năng lượng, lương, hiệu ứng). **Không có quyền truy cập** luồng ngẫu nhiên của ô rơi.
  - Khi đánh giá nước đi, AI chỉ mô phỏng phần biết chắc (bộ ghép trực tiếp, ô đã có rơi xuống). Ô mới sinh được coi là chưa biết (bỏ qua hoặc ước lượng theo tỉ lệ trung bình).
  - Lựa chọn ngẫu nhiên của AI dùng luồng seed riêng.
  - **Test bắt buộc:** cùng bàn cờ nhìn thấy, đổi seed ô rơi thì quyết định của AI phải không đổi.
- _TODO: các mức độ khó, tính cách AI theo nghề._

---

## 10. Hạ tầng & chống gian lận

### 10.1 Nguyên tắc
**Server là nguồn sự thật duy nhất. Client chỉ gửi *ý định*, không bao giờ gửi *kết quả*.**

### 10.2 Trận đấu (server có thẩm quyền)
- Mỗi nước đi được gửi lên server (`POST /battle/:id/move`). Server kiểm tra hợp lệ, lưu, sinh ô rơi **sau khi** nhận nước đi, rồi trả kết quả.
- Client chạy animation trong lúc chờ server để che độ trễ (khoảng 50–150 ms).
- Lợi ích: client không đọc trước được seed, không thể quay lui; F5 khôi phục đúng nước cuối cùng.
- **Bắt buộc online.** Mất mạng giữa trận thì tạm dừng chờ kết nối lại.
- **Chế độ luyện tập** chạy offline: không nhận thưởng, không lưu tiến độ.
- **Trận dở** được tiếp tục; quá **24 giờ** không hoàn thành thì xử thua.
- Logic game là **TypeScript thuần, xác định theo seed**, dùng chung cho client (dự đoán, hiển thị) và server (thẩm quyền).

### 10.3 Database
- **Postgres** (Neon hoặc Supabase) là nguồn sự thật duy nhất, cho cả tài sản người chơi lẫn trận đang diễn ra. Dùng kèm ORM (Prisma hoặc Drizzle).
- **Chống ghi trùng nước đi:** cột `move_seq`, cập nhật kèm điều kiện `WHERE move_seq = :expected`.
- **Kinh tế:** mọi thao tác trong transaction, kèm ràng buộc `CHECK (gold >= 0)`.
- **Notion** chỉ dùng cho **dữ liệu thiết kế** (nhân vật, kỹ năng, trang bị, màn chơi, lời thoại). Đồng bộ thành file tĩnh trong repo, không gọi Notion lúc đang chơi.

### 10.4 Tài khoản
- Đăng nhập **OAuth Google + GitHub** (Auth.js).
- **Khách:** tài khoản ẩn danh trên server, xác định bằng cookie đã ký. Chơi đúng luồng online như người đăng ký. Liên kết OAuth thì chỉ gắn danh tính vào tài khoản đó, không cần gộp dữ liệu.
- Tài khoản khách **không hoạt động 30 ngày thì bị xóa**. Có cảnh báo mất dữ liệu nếu không đăng ký.

### 10.5 Bảng xếp hạng
- Xếp theo **tiến độ chiến dịch** (không phải trọng tâm của game).
- **Biệt danh:** tự đặt khi lần đầu có mặt trên BXH; 3–16 ký tự, cho phép tiếng Việt có dấu; không trùng (không phân biệt hoa thường và dấu); lọc từ thô tục; đổi tối đa 1 lần mỗi 30 ngày.
- Khách có mặt trên BXH với nhãn **"Khách"**.

### 10.6 Những gì cố ý không chặn
- Bot hoặc solver chơi hộ (giảm bằng giới hạn số trận mỗi giờ nếu cần).
- Nhiều tài khoản (giảm nhờ chỉ dùng OAuth).

---

## 11. Tổ chức dự án & tích hợp ShanVerse

### 11.1 Repo
- Cờ Lau nằm trong **một repo mới hoàn toàn** (đề xuất `co-lau`).
- **Nguyên tắc clean-room:** không copy code hay asset nào của bản gốc vào repo.

### 11.2 Công nghệ

Cờ Lau viết mới hoàn toàn bằng **TypeScript**. Không dùng Java và không chuyển đổi code của game gốc.

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Ngôn ngữ | **TypeScript** (strict) | Một ngôn ngữ cho cả client, server, script và test |
| Framework | **Next.js** (App Router) + **React** | Đồng bộ phiên bản với ShanVerse (Next.js 16, React 19) |
| Giao diện | **Tailwind CSS** | Theo quy ước ShanVerse; animation bằng CSS/Canvas, chọn khi làm giai đoạn 1 |
| Logic trận đấu | **TypeScript thuần** | Không phụ thuộc React, DOM hay trình duyệt; xác định theo seed; dùng chung cho `/demo`, `/play` và API |
| PRNG | Thuật toán xác định có seed (ví dụ mulberry32) | Seed online bốc bằng `crypto` của server |
| API / server | **Next.js Route Handlers** | Server có thẩm quyền xử lý từng nước đi |
| Database | **Postgres** (Neon hoặc Supabase) | Nguồn sự thật duy nhất cho dữ liệu người chơi |
| ORM | **Prisma** hoặc **Drizzle** | Chọn ở giai đoạn 2 |
| Đăng nhập | **Auth.js** — OAuth Google + GitHub | Tài khoản khách bằng cookie đã ký |
| Dữ liệu thiết kế | **Notion** → script đồng bộ ra file JSON tĩnh trong repo | Không gọi Notion lúc đang chơi |
| Test | `node:test` qua **tsx** | Theo quy ước ShanVerse; bắt buộc cho logic và AI |
| Script cân bằng | **tsx** | Mô phỏng AI đấu AI hàng nghìn trận |
| Quản lý gói | **pnpm** | Như ShanVerse |
| Triển khai | **Vercel** | Deploy độc lập với ShanVerse |
| Việc định kỳ | **Vercel Cron** | Xử thua trận dở quá 24 giờ, xóa tài khoản khách sau 30 ngày |

**Nguyên tắc tổ chức code:** thư mục logic (ví dụ `src/core/`) chỉ import TypeScript thuần, **không** import React, Next.js, database hay `Math.random()`. Ranh giới này giúp:
- Chạy cùng một logic ở trình duyệt và server.
- Test nhanh, không cần trình duyệt.
- Thực thi được nguyên tắc ngang bằng thông tin cho AI.

### 11.3 Kiến trúc
```
┌────────────────────── ShanVerse (repo hiện tại) ──────────────────────┐
│  /games/co-lau                                                        │
│  ┌──────────────────────────────────────────────┐                      │
│  │  iframe chạy màn chơi thử                     │   [Chơi bản đầy đủ →] │
│  └──────────────────────────────────────────────┘                      │
└───────────────────────────────│────────────────────────────────────────┘
                                │ nhúng trang /demo
┌───────────────────────────────▼──── Cờ Lau (repo mới) ───────────────┐
│  colau.vercel.app (đổi sang tên miền riêng sau nếu muốn)             │
│   /           trang chủ game: giới thiệu, đăng nhập, chiến dịch, BXH   │
│   /play       game đầy đủ (online, server có thẩm quyền)               │
│   /demo       màn chơi thử: offline, không cần tài khoản, không lưu    │
│   /api/...    server: xử lý nước đi, tài khoản, kinh tế                │
│   Postgres    dữ liệu người chơi                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 11.4 Cờ Lau (repo mới)
- Website Next.js riêng, deploy riêng trên Vercel. Chứa toàn bộ server, database, đăng nhập, chiến dịch, BXH.
- Logic trận đấu là TypeScript thuần, xác định theo seed. Cùng một đoạn code chạy ở `/demo` (offline), `/play` (dự đoán phía client) và `/api` (thẩm quyền phía server).
- Mọi mở rộng sau này (nhân vật, chế độ, PvP…) chỉ sửa ở repo này.

### 11.5 Màn chơi thử (`/demo`)
- Dùng chế độ luyện tập offline: 1 trận cố định, 6 nhân vật khởi đầu, đối đầu Tianwu.
- Không cần đăng nhập, không gọi server, không lưu gì.
- Kết thúc trận: hiện nút **"Lưu tiến độ & chơi chiến dịch"**, mở trang chủ Cờ Lau trong tab mới.
- Nhận tham số `?theme=light|dark` để khớp giao diện ShanVerse.
- Báo chiều cao nội dung cho trang cha qua `postMessage`, hoặc dùng khung có tỉ lệ cố định.
- Nội dung trận demo có thể thay đổi theo mùa mà không cần sửa ShanVerse.

### 11.6 Phía ShanVerse (phần việc nhỏ)
- Thẻ Cờ Lau trong `/games`, danh mục **Puzzle & Logic**.
- Trang `/games/co-lau`: iframe nhúng `/demo` + nút "Chơi bản đầy đủ" mở trang chủ Cờ Lau.
- Địa chỉ game đặt trong biến môi trường (ví dụ `NEXT_PUBLIC_COLAU_URL`). Đổi tên miền chỉ cần đổi biến này.
- ShanVerse **không** chứa database, đăng nhập hay code game.

---

## 12. Giao diện
- Responsive cho desktop và mobile; thao tác vuốt để đổi ô.
- Animation ghép ô, cascade, hiệu ứng chiến đấu, âm thanh.
- Thông báo sát thương rõ ràng (mục 4).
- Mỗi hiệu ứng trạng thái là một biểu tượng trên chân dung, kèm số lượt còn lại.
- Danh mục trên `/games`: **Puzzle & Logic**.

---

## 13. Lộ trình

| Giai đoạn | Nội dung | Mục đích |
|---|---|---|
| **0. Khởi tạo** | Tạo repo Cờ Lau mới; dựng Next.js, cấu trúc thư mục, test; deploy trang trống lên Vercel | Nền móng |
| **1. Lõi trận đấu** (offline, chế độ luyện tập) | Toàn bộ mục 1–7 **trừ tuyệt chiêu nấc 3**. Dùng 6 nhân vật khởi đầu ở cùng một cấp. AI cơ bản. Script mô phỏng cân bằng. Trang `/demo` + nhúng vào ShanVerse. | Kiểm chứng gameplay có vui không, chỉnh số; ShanVerse có màn chơi thử sớm |
| **2. Server + tài khoản** | Mục 10: Postgres, OAuth và khách, xử lý từng nước đi trên server, tiếp tục trận dở | Đưa lõi lên online an toàn |
| **3. Tiến trình** | Cấp và điểm kỹ năng, nhánh nấc 2, **tuyệt chiêu nấc 3**, cửa hàng nhân vật, trang bị | Lý do quay lại chơi |
| **4. Chiến dịch** | Các màn, lương mang sang, luật màn, trùm, BXH | Nội dung dài hạn |
| **5. Đánh bóng** | Art, âm thanh, hiệu ứng (làm song song từ giai đoạn 1) | Hoàn thiện |

---

## 14. Còn để ngỏ (TODO)
- [ ] Giá trị mỗi ô vàng và ô sách (vàng và kinh nghiệm mỗi ô).
- [ ] Bản yếu (từ chữ L/T) của 6 ô đặc biệt.
- [ ] Mức lợi thế "sân nhà" của trùm và bảng tỉ lệ ô cho từng màn.
- [ ] Chốt có đưa Thử thách hằng ngày, Thế cờ, Đấu trường bóng ma vào không.
- [ ] Chi tiết Sinh tồn (số đối thủ mỗi đợt, đường cong sức mạnh) và Leo tháp (danh sách phần thưởng giữa các tầng).
- [ ] Hành và tuyệt chiêu đặc trưng của 6 nhân vật khởi đầu.
- [ ] Danh sách nhân vật trong cửa hàng (khoảng 12) và giá.
- [ ] Chỉ số gốc theo nghề và theo cấp (sau khi chạy mô phỏng).
- [ ] Cấu trúc các màn chiến dịch, danh sách trùm, phần thưởng.
- [ ] Các mức độ khó và tính cách AI.
- [ ] Bảng rơi đồ và danh sách trang bị.
- [ ] Chốt tên miền (đề xuất `colau.vercel.app`) và tạo repo `co-lau`.
