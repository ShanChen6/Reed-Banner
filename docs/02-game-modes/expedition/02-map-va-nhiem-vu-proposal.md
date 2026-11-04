# Viễn Chinh — Đề xuất sa bàn và nhiệm vụ

> Cập nhật: 04/11/2026  
> Trạng thái: **PROPOSAL — CHỜ SHAN DUYỆT**  
> Phạm vi: đề xuất mở rộng gameplay và nội dung map. Không thay thế GDD luật hiện hành, không phải đặc tả runtime.  
> Tài liệu luật gốc: [01-vien-chinh-gdd.md](./01-vien-chinh-gdd.md)

## 1. Mục tiêu thiết kế

Viễn Chinh cần tạo quyết định chiến dịch khác với việc chọn một trận Bình Loạn. Mỗi map đặt ra tình thế để giải quyết bằng điều quân, trinh sát, tiếp tế và lựa chọn mục tiêu. Trận match-3 là công cụ giải quyết tình huống; không phải nhiệm vụ nào cũng kết thúc bằng đánh bại toàn bộ địch.

1. **Nhiều đường đi có đánh đổi:** tuyến nhanh, tuyến an toàn, tuyến tiếp tế, tuyến có mục tiêu phụ.
2. **Hai đạo có vai trò:** một đạo giữ/chặn/đánh lạc hướng, đạo kia khai thác thời cơ; không chỉ thay nhau đánh.
3. **Nhiệm vụ có điều kiện cụ thể:** chiếm, giữ, hộ tống, phá hoại, giải cứu, đột phá hoặc rút lui.
4. **Kết quả đổi map:** mở/khóa cạnh, làm suy yếu cứ điểm, đổi viện binh, tạo lòng tin hoặc cắt tiếp tế.

## 2. Vòng chiến dịch

Một lượt gồm nhiều ngày. Mỗi ngày người chơi ban một mệnh lệnh cho một đạo; cuối ngày cập nhật địch, hạn và hậu cần.

### 2.1 Mệnh lệnh

| Lệnh | Tác dụng | Chi phí / điều kiện |
|---|---|---|
| **Hành quân** | Đi theo cạnh đã mở tới nút hợp lệ. Địch có thể chặn bước và khởi tạo giao tranh. | Một ngày; đường dài có thể tốn thêm lương. |
| **Trinh sát** | Khám phá quân địch, tuần tra, lối tắt, bẫy hoặc mục tiêu phụ trong một vùng. | Một ngày; không chiếm nút. |
| **Nghỉ và củng cố** | Hồi phục đạo tại chỗ, cứu quân gục theo luật map, bổ sung lương nếu có tiếp tế. | Một ngày; địch vẫn hành động. |
| **Phục kích** | Chặn một đường hoặc đội tuần tra đã được trinh sát. | Một ngày chuẩn bị; đoán sai thì mất ngày. |
| **Tiếp tế** | Chuyển lương/vật tư giữa hai đạo hoặc từ kho đang giữ. | Cần liên lạc qua tuyến; tuyến có thể bị cắt. |
| **Nghi binh** | Kéo quân canh khỏi tuyến hoặc giữ chân đội tuần tra. | Tốn lương; hiệu quả tùy nhiệm vụ. |

**MVP:** Hành quân, Trinh sát, Nghỉ. Phục kích, Tiếp tế, Nghi binh là mở rộng sau.

### 2.2 Nhịp một ngày

1. Chọn đạo, lệnh và đích.
2. Xem cảnh báo đã biết: địch, địa hình nguy hiểm, hạn nhiệm vụ, nguy cơ đứt tiếp tế.
3. Resolve hành động: di chuyển, lựa chọn tình huống hoặc trận có mục tiêu.
4. Cập nhật trạng thái nút, đường, mục tiêu và tài nguyên.
5. Địch phản ứng theo kịch bản: tuần tra, tăng viện, bao vây, rút lui hoặc gia cố.

Bất định đến từ thông tin tình báo chưa biết, không phải xúc xắc ẩn quyết định thắng thua.

## 3. Ngữ pháp sa bàn

### 3.1 Lớp map

- **Địa hình:** sông, nhánh sông, bãi bồi, rừng, núi, đèo, ruộng, đầm lầy, đường làng.
- **Đồ thị di chuyển:** cạnh đường bộ, thủy lộ, đường mòn, cầu/bến, lối tắt mở sau trinh sát hoặc chiếm nút.
- **Nút chiến dịch:** trại, làng, kho, cầu, trạm, đồn, lũy, thành, bến thuyền.
- **Đơn vị:** hai đạo, toán tuần tra, quân tiếp viện, đoàn dân/thuyền.
- **Mục tiêu:** chính, phụ, tùy chọn; có thể có thời hạn/kích hoạt.
- **Liên lạc:** tuyến giữa đạo với trại/kho. Cắt tuyến làm giảm hồi lương hoặc ngăn chuyển tiếp tế.

Địa hình nhìn thấy từ đầu. Địch, bẫy, lối bí mật và một số sự kiện chỉ lộ sau trinh sát.

### 3.2 Loại nút

| Nút | Vai trò | Tương tác / kết quả |
|---|---|---|
| **Trại** | Điểm xuất phát và rút lui | Chia đội; mất trại có thể gây thua nhiệm vụ |
| **Ngã ba / đường mòn** | Tạo lựa chọn tuyến | Nhanh, kín hoặc dễ phục kích |
| **Làng** | Dân cư và nguồn tin | Hộ tống, bảo vệ, thuyết phục; nhận lương, người dẫn đường hoặc tin |
| **Kho lương** | Nút hậu cần | Chiếm để tiếp tế; phá làm giảm viện binh nhưng mất nguồn lương |
| **Cầu / bến cạn** | Vượt chướng ngại, cổ chai | Chiếm/giữ mở tuyến; phá trì hoãn truy binh nhưng khóa đường ta |
| **Bến thuyền** | Kết nối thủy lộ và bờ | Đổ bộ, đưa dân qua sông, chặn đoàn thuyền |
| **Trạm hiệu** | Tình báo và gọi viện | Chiếm để lộ chuyển động; phá để ngắt tăng viện |
| **Đồn** | Canh đường | Vượt qua, đánh chiếm, nghi binh hoặc vòng tuyến |
| **Lũy** | Phòng tuyến mạnh | Phá cổng, cắt tiếp tế hoặc tìm lối vòng |
| **Thành** | Mục tiêu hoặc điểm giữ | Công thành, mở cổng, buộc hàng hoặc bảo vệ |
| **Vùng nguy hiểm** | Tạo chi phí/điều kiện di chuyển | Đầm lầy làm chậm; rừng che phục kích; đèo giới hạn đội |
| **Điểm tập kết** | Nơi hai đạo phối hợp | Tiếp tế, cứu người gục hoặc lập kế hoạch chung |

Nút có thể kết hợp thuộc tính: làng cạnh bến, kho trong lũy, đèo có trạm hiệu. Không cần tạo loại riêng cho mọi tổ hợp.

### 3.3 Cạnh và tuyến

- **Đường chính:** nhanh, dễ bị phát hiện, địch phản ứng được.
- **Đường mòn:** kín, cần trinh sát; một đạo có thể vượt đồn.
- **Đường thủy:** nhanh dọc sông, phụ thuộc bến và thuyền.
- **Cầu / bến cạn:** điểm vượt bắt buộc; bên giữ kiểm soát di chuyển.
- **Lối bí mật:** mở bằng thông tin từ làng, trạm hoặc sự kiện.
- **Đường bị phá:** đóng đến khi sửa hoặc tìm tuyến khác.

Mỗi cạnh có hướng, độ dài, địa hình, trạng thái (mở, chặn, phá) và nguy hiểm. Đường ngắn có thể nguy hiểm; đường dài có thể an toàn và có tiếp tế.

## 4. Map thay đổi trận đấu

Mỗi trận có một mục tiêu chiến thuật trên bàn match-3. Dùng tối đa 1–2 cơ chế đặc biệt trong một trận.

| Bối cảnh | Thay đổi trận | Điều kiện | Tác động map |
|---|---|---|---|
| **Cổng lũy** | Thanh bền công trình; ghép/chiêu phù hợp gây tiến độ phá | Phá cổng hoặc đánh bại quân giữ | Mở cạnh vào khu trong |
| **Cầu hẹp** | Điểm nghẽn giới hạn quân tiến; có đơn vị chắn | Giữ N lượt, đẩy lùi địch hoặc mở cầu | Đạo kia được qua; thất bại làm trễ lịch |
| **Kho lương** | Kho là mục tiêu tương tác, quân canh bảo vệ | Chiếm nguyên vẹn hoặc phá trước hạn | Chiếm nhận tiếp tế; phá giảm viện nhưng mất lương |
| **Đoàn dân** | Thanh tiến độ hộ tống; địch tìm cách áp sát | Đưa dân tới vùng an toàn hoặc đánh bật truy binh | Mở tuyến/dân hỗ trợ |
| **Phục kích** | Địch định rút lui hoặc gọi viện | Hạ thủ lĩnh, giữ đường hoặc thoát vòng vây | Ngăn viện hoặc lộ tuyến địch |
| **Thành** | Cổng, tường, tướng giữ thành là mục tiêu | Phá cổng, leo tường hoặc mở từ trong | Mở khu thành/thắng chiến dịch |
| **Phòng thủ** | Địch tới theo đợt, có mục tiêu cần bảo vệ | Sống đến hết hạn hoặc giữ mục tiêu | Bảo toàn điểm nghẽn |
| **Rút lui** | Có vùng thoát, địch ép từ phía sau | Đưa đủ người tới lối rút | Giữ được đạo dù bỏ nút |

Mục tiêu phụ phải hiện điều kiện rõ trước và trong trận. Có thể biểu diễn bằng thanh tiến độ hoặc 1–2 đối tượng tương tác.

## 5. Ba sa bàn đề xuất

Đây là đề xuất mở rộng trên nền ba map hiện có; không yêu cầu làm tất cả trong MVP.

### 5.1 Ải Bắc — Hành lang đèo và đài hiệu

**Hệ:** Kim. **Vai trò:** map nhập môn, dạy tuyến, trinh sát, phá trạm hiệu và phối hợp hai đạo.  
**Mục tiêu chính:** mở cửa ải trước ngày 10.  
**Mục tiêu phụ:** chiếm Kho Ngựa Thồ; phá Đài Lửa Bắc trước khi địch gọi viện.

#### Sơ đồ nút

    [Đài Lửa Bắc]
       /       \
[Trại Tả]—[Đồn Khe Đá]—[Bản Na]—[Lũy Đèo Mây]—[Lũy Gác Bắc]—[Cửa Ải]
   \       \       |          \          /
    \    [Đường Mòn]—[Kho Ngựa Thồ]—[Trạm Suối]
     \                    |                /
[Trại Hữu]—[Đồn Suối Lạnh]—[Bãi Lau]—[Lũy Gác Nam]—[Cửa Ải]
                           \          /
                         [Hang Cạn]—[Lối Sau]

**Tuyến lựa chọn**

- **Bắc:** nhanh nhất tới cửa; Đài Lửa gọi viện nếu chưa phá.
- **Giữa:** qua Bản Na và Kho; có tiếp tế/giáp công nhưng kho có quân giữ.
- **Nam:** dài hơn; Hang Cạn mở Lối Sau nếu trinh sát.
- **Đường mòn:** mở sau khi hỏi Bản Na; một đạo đi vòng nhưng không mang nhiều lương.

**Chuỗi nhiệm vụ**

1. Tìm người dẫn đường: trinh sát Bản Na hoặc đánh Đồn Khe Đá lấy bản đồ.
2. Ngăn đài hiệu: phá Đài Lửa hoặc chiếm Trạm Suối.
3. Chọn mũi đột phá: Lũy Gác Bắc, Lũy Gác Nam hoặc Lối Sau.
4. Mở cửa ải: một đạo công, đạo kia chặn viện hoặc mở cổng từ phía sau.

**Hệ quả**

- Phá đài: không có viện binh ở trận cuối.
- Chiếm kho: tiếp tế cho hai đạo, nhưng cần giữ kho trước phản công.
- Mở Lối Sau: bỏ qua một lũy; đạo đi vòng tốn ngày và lương.

### 5.2 Thượng Du — Thung lũng, rừng và đèo độc đạo

**Hệ:** Mộc. **Vai trò:** phối hợp hai đạo, liên lạc và hậu cần.  
**Mục tiêu chính:** giải vây trại đồng minh rồi chọn đánh thành hay rút dân.  
**Mục tiêu phụ:** giữ Đèo Ngang Núi; tìm đường vận chuyển qua rừng.

#### Sơ đồ nút

    [Trại Nguồn]—[Rừng Tre]—[Bản Mộc]—[Lũy Đá Chồng]—[Đài Mây]—[Thành]
                       \       \          /                         /
                        \    [Đường Rễ]—[Đèo Ngang Núi]───────────/
                         \                 /
                          [Bến Gỗ]—[Trại Đồng Minh]—[Bản Ruộng Bậc]
                                                    /             \
    [Trại Suối]—[Đồn Dốc Lau]—[Đồn Thác Bạc]—[Bãi Sạt]—[Chòi Khe Hẹp]
                                          \                       /
                                           [Lối Voi Rừng]────────

**Tuyến lựa chọn**

- **Bắc:** qua rừng, Bản Mộc, Lũy Đá; có tin/thảo dược nhưng dễ phục kích.
- **Nam:** qua Dốc Lau và Thác Bạc; Bản Ruộng Bậc là điểm hồi phục.
- **Đèo Ngang:** tuyến tiếp tế giữa hai thung lũng; địch giữ thì hai đạo khó hỗ trợ nhau.
- **Lối Voi Rừng:** kín, một đạo đi được, không chở tiếp tế; mở sau khi cứu người dẫn đường.
- **Bến Gỗ:** tuyến rút và vận chuyển dân; cần giữ để hoàn thành cứu viện.

**Chuỗi nhiệm vụ**

1. Tìm trại đồng minh: trinh sát rừng hoặc chiếm Đồn Dốc Lau.
2. Giải vây: một đạo giữ Bến Gỗ cho dân rút, đạo kia đánh quân vây.
3. Khôi phục liên lạc: chiếm Đèo Ngang hoặc mở Lối Voi Rừng.
4. Chọn kết thúc: đánh thành hoặc đưa dân/thương binh về bến, không bắt buộc công thành.

**Hệ quả**

- Giữ đèo: tiếp tế giữa hai đạo và phối hợp ở thành.
- Mất đèo nhưng giữ Bến Gỗ: còn đường rút, không tạo giáp công ở thành.
- Mở lối rừng: bỏ một lớp phòng thủ nhưng chỉ đi một chiều.
- Đánh thành sớm: nhanh nhưng mất đồng minh/hỗ trợ cứu dân.

### 5.3 Cửa Biển — Cửa sông, bãi bồi và thủy trại

**Hệ:** Thủy. **Vai trò:** nhiều ngả, thời hạn, kiểm soát bến và đoàn thuyền.  
**Mục tiêu chính:** chiếm Thủy Trại Tây hoặc cắt thuyền tiếp viện trước ngày 9.  
**Mục tiêu phụ:** cứu làng chài; giữ Chợ Cửa Sông làm kho.

#### Sơ đồ nút

                         [Lạch Cạn]——[Bãi Lau]——[Đài Quan Triều]
                        /        \                    /
    [Trại Bến Thuyền]—[Đồn Bến Cói]—[Làng Chài]—[Bến Gỗ]
             |                  \       |             \
       [Luồng Sông]——[Chợ Cửa Sông]—[Doi Cát]——[Thủy Trại Đông]
             |                     |          \             |
    [Trại Bãi Sậy]—[Đồn Bãi Sú]—[Bến Cạn]—[Thủy Trại Tây]—[Cổng Thành]
                          \          /             \             /
                            [Đầm Sậy]—[Mũi Cát]—[Đường Đê]─────

**Tuyến lựa chọn**

- **Luồng sông:** nhanh nếu giữ Bến Gỗ; có thể bị thuyền địch chặn.
- **Bãi bồi:** nhanh tới Thủy Trại Tây; thủy triều đổi trạng thái theo lịch được báo trước.
- **Đường đê:** an toàn cho tiếp tế nhưng dễ bị phát hiện; Đài Quan Triều cho biết lịch nước.
- **Đầm Sậy:** kín cho một đạo, chậm và hao lương, tránh được đồn.
- **Chợ:** nút trung tâm; cấp lương nhưng địch sẽ tập trung phản công.

**Chuỗi nhiệm vụ**

1. Trinh sát thủy triều: chiếm Đài Quan Triều hoặc hỏi dân Làng Chài.
2. Chọn ưu tiên: hộ tống dân, phá trạm hiệu hoặc chiếm Chợ.
3. Chặn thuyền viện: phục kích ở Luồng Sông hoặc chiếm Doi Cát.
4. Đột nhập Thủy Trại Tây: đánh cổng, qua bãi cạn lúc nước rút hoặc mở cổng từ trong.
5. Kết thúc: chiếm thủy trại; hoặc rút dân và phá đoàn thuyền để đạt kết thúc phụ.

**Hệ quả**

- Chiếm Chợ: tăng lương, mở tiếp tế; địch phản công vào nút.
- Cứu dân: nhận tin lối bãi cạn và dự báo thủy triều.
- Phá trạm hiệu: giảm viện binh nhưng mất thông tin về lịch thuyền.
- Dùng bãi cạn: tránh đồn, nhưng trận cuối có hạn trước khi nước lên.

## 6. Thư viện mục tiêu nhiệm vụ

Mỗi lượt nên có một mục tiêu chính và tối đa hai phụ.

| Mẫu | Điều kiện thành công | Cách giải quyết | Hậu quả thất bại |
|---|---|---|---|
| **Chiếm nút** | Quân ta kiểm soát nút | Trận, phục kích hoặc vòng đường | Địch giữ nút, thời gian trôi |
| **Giữ vị trí** | Giữ nút đến ngày/lượt N | Phòng thủ hoặc điều quân chặn | Địch chiếm và mở tuyến |
| **Hộ tống** | Đưa dân/vật tư qua điểm an toàn | Hộ tống trên map, có thể đánh chặn | Mất một phần đoàn, chiến dịch còn tiếp tục |
| **Giải cứu** | Đưa người bị giữ ra khỏi vùng nguy hiểm | Đột nhập, nghi binh, trận rút lui | Người bị chuyển đi, mở đường truy đuổi |
| **Phá hoại** | Phá kho, cầu hoặc đài hiệu | Trận có mục tiêu công trình hoặc lệnh phá | Địch giữ nguồn lực/nhận viện |
| **Chặn viện** | Ngăn đoàn địch tới trước hạn | Phục kích hoặc chiếm cổ chai | Địch tới, trận sau khó hơn |
| **Cắt liên lạc** | Chiếm/đánh sập trạm | Trinh sát và chiếm nút | Địch phản ứng nhanh |
| **Mở đường** | Tạo cạnh đi qua cầu/cổng/chướng ngại | Sửa, phá chướng ngại, tìm đường | Tuyến dài hơn hoặc đánh trực diện |
| **Nghi binh** | Kéo địch khỏi khu vực | Mệnh lệnh tại nút khác | Địch giữ vị trí, mất ngày |
| **Rút lui** | Đưa đạo/đoàn tới tập kết | Trận có vùng thoát và điều quân | Mất cứ điểm/vật tư, không nhất thiết thua |
| **Công thành** | Mở cổng, chiếm trung tâm hoặc bắt tướng | Một/nhiều mục tiêu chiến thuật | Địch gia cố |
| **Đánh lạc hướng** | Làm địch tin tuyến giả | Mệnh lệnh và tình báo | Địch đoán đúng, phản công |

### Quy tắc phân nhánh

- Thất bại phụ không kết thúc lượt tự động.
- Hậu quả thất bại phải đọc được: thêm quân, đóng cạnh, giảm lương, đổi vị trí hoặc khóa kết thúc tốt.
- Mục tiêu chính có ít nhất hai cách giải quyết: chiến đấu và điều quân/tình huống.
- Không yêu cầu tướng hiếm để mở tuyến bắt buộc.
- Hạn hiện rõ; cảnh báo trước khi mất cơ hội.
- Không giữ lựa chọn giả luôn kém hơn mọi trường hợp.

## 7. Vai trò hai đạo

Vai trò phát sinh từ đội hình và vị trí, không khóa cứng theo nghề:

- **Giữ tuyến:** bảo vệ cầu, kho hoặc đoàn dân.
- **Đột kích:** đi đường mòn, phá đài hiệu hoặc đánh mục tiêu ưu tiên.
- **Tiếp tế:** giữ tuyến giữa các kho và chuyển lương.
- **Nghi binh:** tạo áp lực để kéo quân địch.
- **Hội quân:** đổi lương, cứu người gục hoặc lập kế hoạch phối hợp.

Trong trận, đạo được chọn là mũi chính; đạo kia tạo tác động theo vị trí: chặn viện, mở cổng, cung cấp tình báo hoặc bảo vệ đoàn. Tránh chỉ cho hiệu ứng giảm máu địch.

## 8. Giao diện map

- Desktop: map khoảng 65% chiều rộng; mobile pan/zoom và nút tập trung đạo đang chọn.
- Hai đạo có cờ riêng; cạnh dùng nét/biểu tượng khác nhau cho bộ, thủy, mòn, bị chặn.
- Nút thể hiện trạng thái: địch, ta, chưa rõ, bị vây, nhiệm vụ, hoàn thành.
- Thanh trên: ngày/tối đa, mục tiêu chính, hạn gần nhất, lương từng đạo.
- Bảng lệnh: Hành quân, Trinh sát, Nghỉ; hành động không hợp lệ ghi lý do.
- Chọn nút: đối thủ đã biết, điều kiện trận, hậu quả dự kiến, tuyến tiếp tế.
- Nhật ký chiến dịch ghi các thay đổi để người chơi hiểu vì sao map đổi.
- Không phân biệt phe chỉ bằng màu; biểu tượng và nhãn đi kèm.
- Khoảng cách vẽ không quyết định luật nếu không ghi rõ.

## 9. MVP khuyến nghị

Làm một chiến dịch dọc hoàn chỉnh trên **Cửa Biển** trước:

- 10–12 nút, 14–18 cạnh, ba tuyến tiếp cận.
- Hai đạo; ba lệnh: Hành quân, Trinh sát, Nghỉ.
- Một mục tiêu chính: chiếm Thủy Trại Tây.
- Hai mục tiêu phụ: cứu dân, cắt viện.
- Ba cờ trạng thái: viện còn hoạt động, dân được cứu, Chợ do phe nào giữ.
- Ba loại trận riêng: hộ tống, giữ vị trí, phá công trình; nút thường dùng trận 3v3.
- Ít nhất hai kết thúc thành công và một thất bại có thể rút lui/tiếp tục.
- Kịch bản cố định, không random; chơi lại bằng chiến lược khác.
- Sau khi map chứng minh lối chơi, mở rộng Ải Bắc và Thượng Du.

### Ngoài MVP

- Sinh map ngẫu nhiên hoàn toàn.
- Mùa/bảng hạng theo kết quả nhiệm vụ.
- Hơn hai đạo.
- Xây công trình tự do.
- Tài nguyên mới ngoài máu/lương và vật tư nhiệm vụ.
- AI tự mô phỏng giao tranh ngoài màn.
- Sương mù phủ toàn map.

## 10. Tiêu chí đánh giá

1. Có ít nhất ba tuyến đánh đổi rõ.
2. Hai mục tiêu phụ đổi trạng thái map hoặc kết thúc.
3. Có nhiệm vụ không cần thắng trận match-3.
4. Hai đạo phối hợp ít nhất một lần ngoài giảm máu địch.
5. Người chơi đọc được mục tiêu, hạn và nguy hiểm.
6. Chơi lại chọn chiến lược khác, không chỉ đổi thứ tự đánh.
7. Thua trận gây hậu quả cụ thể nhưng còn quyết định tiếp theo.
8. Không có một tuyến tối ưu mọi tình huống.

## 11. Câu hỏi cần chốt trước khi thay GDD

1. Có cho đi nhiều cạnh trong một ngày hay mỗi lệnh chỉ qua một cạnh?
2. Trinh sát và nhiệm vụ không chiến đấu có vào MVP?
3. Tài nguyên nào ngoài máu/lương: vật tư, lòng dân, tình báo?
4. Nhiệm vụ phụ mở bậc hay chỉ ảnh hưởng thưởng/kết thúc?
5. Trận hộ tống/công trình/giữ cầu cần mở rộng engine ở mức nào?
6. GDD hiện tại tiếp tục làm nền thử nghiệm hay được thay sau khi Shan duyệt thiết kế này?

---
