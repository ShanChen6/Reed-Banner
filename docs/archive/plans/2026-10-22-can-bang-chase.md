# Kế hoạch cân bằng kỹ năng và combo chase

> Trạng thái: **ARCHIVED** — lưu để truy vết, không phải tài liệu hiện hành.

**Trạng thái:** chuẩn bị triển khai; chưa chạy thử nghiệm, mô phỏng hoặc chỉnh hệ số trong phạm vi tài liệu này.

**Mục tiêu đã chốt:** người chơi có thể chủ động tạo lợi thế và kết thúc ván bằng phối hợp kỹ năng.

Tài liệu triển khai cho [bộ 6 chủ động + 4 bị động và Tinh thần F](../../03-characters/ky-nang/README.md), [dữ liệu nghề/hệ và ĐBL](../../03-characters/ky-nang/data/skill-chase-v3.json), [kỹ năng60 đồng hành](../../03-characters/ky-nang/data/ky-nang-dong-hanh.md). Mốc code hiện tại: `95c069c` trên nhánh `feat/team-skill-combos`. Khi bắt đầu mỗi vòng phải ghi lại commit thực tế và mọi thay đổi tiếp theo.

## 1. Trải nghiệm cần đạt

Người chơi nhìn thấy điều kiện phối hợp, chọn người hành động, kỹ năng, mục tiêu và thời điểm để mở chuỗi; chuyển lợi thế đó thành mất người hoặc khả năng kết thúc ván. Đối thủ có công cụ nhận biết và phá kế hoạch. Người hỗ trợ góp phần chuẩn bị đợt tấn công, bảo toàn người kết liễu hoặc tạo thêm lựa chọn có ý nghĩa.

Không dùng việc rút ngắn mọi trận hoặc tăng số truy kích làm mục tiêu thay thế. Một trận dài vẫn có giá trị nếu hai bên đang chủ động giành lợi thế. Dấu hiệu thất bại là lựa chọn kỹ năng ít ảnh hưởng, chuỗi chạy tự động gần như giống nhau bất kể quyết định, đối thủ không có cơ hội đáp trả, hoặc thắng chủ yếu đến từ chờ hết lương.

Cần phân biệt:

- **Lợi thế chủ động:** một quyết định tạo cửa hạ mục tiêu, ngắt kế hoạch địch, cứu người để họ tiếp tục hành động, hoặc mở cast hữu ích nhờ tài nguyên.
- **Kết liễu có chuẩn bị:** người chơi tổ chức một hoặc nhiều hành động để đưa mục tiêu vào cửa hạ gục và tận dụng được cửa đó. Không giới hạn ở KO ngay trong một cast.
- **Lợi thế danh nghĩa:** damage bị hồi lại ngay, Khiên không hấp thụ, cấp năng lượng không tạo cast hữu ích hoặc truy kích chỉ tăng số hiệu ứng.

## 2. Phạm vi cố định

Tất cả nhóm chính dùng Tinh thần **F**: bắt đầu100; giảm5 từ lượt thường25 của từng phe; về0 tại44; ATK/DEF không bị Tinh thần giảm; hồi/Khiên mới có hệ số `0.2 + 0.8 × Tinh thần người nhận/100`. Lượt thêm không đẩy nhanh suy giảm, Khiên cũ không giảm hồi tố và chuyển hồi dư không bị giảm hai lần.

Giữ nguyên quân lương, chỉ số cơ bản, chỉ số trùm, preset chiến dịch, tiến trình và trang bị giữa các phương án. Không dùng chúng để bù cho một chuỗi quá yếu hoặc quá mạnh trong đợt này. Thay đổi ngoài phạm vi phải được ghi thành đề xuất riêng trước khi thực hiện.

Bộ hiện tại:6 chủ động,4 bị động (2 nghề +2 hệ). Nghề1 là cơ hội chuẩn bị; nghề2 và hai bị động hệ là phản ứng tức thời. Mỗi bị động phản ứng tối đa một lần/hành động gốc, toàn chuỗi tối đa12 phản ứng và sâu4. Một cast và nước bàn cờ sau đó là hai hành động gốc riêng, không gộp chúng khi kiểm tra giới hạn.

## 3. Các phương án đối chứng

Đặt nhãn riêng cho thử nghiệm kỹ năng; không dùng A/D/E/F vì đó là tên cấu hình Tinh thần.

| Nhãn | Bị động phối hợp | Câu hỏi |
|---|---|---|
| K0 | Tắt cả4 | Bộ chủ động tự tạo lợi thế đến đâu? |
| K1 | Chỉ nghề1 | Cơ hội do người chơi chọn tận dụng đem lại gì? |
| K4 | Bật cả4 | Chase bổ sung giá trị và rủi ro gì? |
| K4-minus-X | Tắt riêng một bị động/nhóm đã chỉ định | Nguồn gốc bất thường là cơ chế nào? |

Chỉ mở K4-minus-X khi cần điều tra. Định nghĩa cờ phải nằm ở cấu hình harness thống nhất, áp dụng trước khi tạo trận; không rải điều kiện riêng trong battle/AI/UI. Lưu danh sách ID bật/tắt thực tế, không chỉ lưu nhãn.

Mọi cặp so sánh dùng cùng commit, phiên bản AI, đội hình/thứ tự, người dẫn đội, cấp, đồ, phân điểm, seed bàn, seed AI và giới hạn lượt. Ghép hai thứ tự đi trước. Sau khi khác biệt gameplay xuất hiện, chuỗi RNG có thể phân kỳ; cùng seed không có nghĩa mọi ô rơi sau đó phải trùng.

Dữ liệu357 test và3.120 quan sát của phiên trước chỉ là lịch sử, không xác nhận F + chase hiện tại. Chỉ tái sử dụng quan sát khi có bằng chứng cùng cấu hình và nhánh code thay đổi không ảnh hưởng; lưu lý do theo case.

## 4. Kịch bản trọng tâm

| ID | Đội/điều kiện | Quyết định cần thử | Rủi ro và đối phó |
|---|---|---|---|
| C01 | Tướng sĩ + Kim/Hỏa | Phá giáp đúng mục tiêu rồi tập trung kết liễu | Damage miễn phí quá lớn; địch bảo vệ hoặc hạ người nối |
| C02 | Pháp sư + Lôi | Giữ khống chế cho cửa dồn sát thương | Khóa dài không thể đáp trả; đổi mục tiêu/câm lặng người nối |
| C03 | Y sư + Mộc + Binh lính | Dùng hồi để giữ người kết liễu sống đến lượt | Hồi→Khiên chỉ kéo dài vòng phòng thủ; địch chia áp lực hoặc xua tan |
| C04 | Binh lính + Thổ | Cấp Khiên trước đợt đánh, chuyển hấp thụ thành phản công | Khiên không bị đánh vẫn sinh lợi; địch né người có Khiên |
| C05 | Mưu sĩ + Kim/Phong | Xua tan hoặc phá năng lượng ngay trước cast quan trọng | Địch bị khóa năng lượng liên tục; kiểm tra đổi nguồn tấn công |
| C06 | Quân sư + Thủy/Phong | Tiếp năng lượng để đồng đội tung chiêu hữu ích | Vòng hồi→năng lượng→hồi; phá người cấp hoặc dồn mục tiêu khác |
| C07 | Ba tướng tấn công | Chọn người/mục tiêu mở chuỗi, so nhiều thứ tự | Một cast xóa đội dù quyết định nào cũng tương tự |
| C08 | Hai đội nhiều hồi/Khiên | Tạo cửa tấn công ở trước/sau25/34/44 | Bế tắc tại sàn20%, chờ hết lương |
| C09 | Đội ít điều kiện phối hợp | Tìm đường thắng bằng bộ độc lập | Chỉ vài cặp bắt buộc mới chơi được |
| C10 | Solo đủ nghề/hệ | Tận dụng bị động hệ, không có nguồn đồng đội giả | Buff solo ngoài ý muốn hoặc nghề mất vai trò |
| C11 | Người nối bị đóng băng/câm lặng/gục | Chuyển kế hoạch sang người khác hoặc chờ cửa mới | Phản ứng vẫn chạy sai hoặc không có phương án thay thế |
| C12 | AoE, nhiều đòn, chuỗi bàn cờ | Chọn một đích ưu tiên khi nhiều nguồn đồng thời | Thứ tự xử lý, cap chuỗi và nguồn sát thương tạo lợi thế khó hiểu |

Đội hình cụ thể phải ghi bằng ID tướng và snapshot đầu tư. Bao gồm các tướng thường lẫn lịch sử; không coi một mẫu nghề là đại diện đầy đủ cho mọi tuyệt chiêu cùng nghề.

## 5. Các vòng triển khai

### Vòng0 — Cơ chế và đo lường

Trước khi đánh giá sức mạnh, cập nhật những kiểm tra cũ còn giả định mặc định A hoặc bộ ĐBL cũ. Kiểm chứng giới hạn kích hoạt, độ sâu, nguồn thật, hiệu ứng không hữu ích, mục tiêu gục, thứ tự hàng đợi, phản đòn/Nộ, hồi dư và người nhận Tinh thần. Kiểm tra dữ liệu đầy đủ42 bộ ĐBL và60 đồng hành.

Bổ sung ledger nguồn xuyên hành động: hành động gốc → tín hiệu → bị động → tác dụng thật. Tách nguồn chase khỏi chủ động trong telemetry, dù primitive battle cùng dùng damage/heal. Phải đếm được tín hiệu bị bỏ vì giới hạn, mỗi lý do không kích hoạt, và tác dụng vô ích. Audit tắt/bật không làm đổi gameplay.

**Điều kiện qua vòng:** không còn lỗi cơ chế hoặc thiếu phép đo làm sai kết luận. Nếu chưa đạt, sửa cơ chế trước; không chỉnh hệ số để che lỗi.

### Vòng1 — Pilot

Chọn12 cặp đội hình tương ứng các câu hỏi ưu tiên trong bảng; ở cấp10/20,3 seed, hai thứ tự, K0/K1/K4: `12 ×2 ×3 ×2 ×3 =432 trận`. Solo C10 được phủ sâu ở vòng2; chỉ đưa vào pilot nếu cần kiểm tra lỗi solo cụ thể.

Pilot dùng để ước lượng ngân sách, mức biến động, kịch bản kéo dài và khả năng AI tận dụng. Không dùng432 trận để tuyên bố cân bằng toàn bể tướng. Chỉ thêm seed hoặc phương án tách cơ chế ở case có tín hiệu cần giải thích.

**Điều kiện qua vòng:** biết nhóm nào cần mở rộng, có trace minh họa cả thành công và thất bại, và chốt trước ngưỡng đánh giá cho vòng tiếp theo. Nếu AI bỏ lỡ nhiều cơ hội, chưa suy ra kỹ năng yếu.

### Vòng2 — Sàng lọc độ phủ

Đủ6 nghề ×7 hệ, cấp9/10/15/20,1vs1 và3vs3, đổi bên/đi trước. ĐBL luôn có mặt trong nhóm đo nghề/hệ; thêm đội tấn công, cân bằng, phòng thủ và phá tài nguyên.

Bắt đầu bằng các phương án có ích sau pilot, không nhân cả ma trận với mọi biến thể tắt từng bị động. Xác định độ phủ bằng bảng nghề/hệ/cấp/mode thực tế, tránh chỉ tăng tổng n nhưng bỏ sót nhóm.

### Vòng3 — Từng nhân vật và cặp phối hợp

Mỗi60 đồng hành có ít nhất một kịch bản tận dụng và một kịch bản bị khắc chế, ở cấp đủ mở tuyệt chiêu. Cấp20 dùng đánh giá trọn bộ; cấp10 dùng tách tác động tuyệt chiêu khi cần. Theo dõi riêng tuyệt chiêu, không gộp hết vào nghề/hệ.

Chỉ mở rộng nhiều seed cho tướng/chuỗi có dấu hiệu bất thường hoặc kết luận còn thiếu chắc chắn. Không vét cạn mọi tổ hợp ba tướng. Ghi bảng cặp được thử, chưa thử và lý do chọn.

### Vòng4 — Chiến dịch và người chơi

Phong Châu, Tam Đái và một màn áp lực cuối trận được chọn bằng dữ liệu vòng trước; giữ chỉ số/preset. Tách kết quả PvE khỏi PvP.

Chơi thử các chuỗi C01/C03/C04 và một chuỗi phá tài nguyên. Có đội dễ đọc và đội nhiều tương tác. Cho người chơi thử cùng tình huống với/không có chase, đổi thứ tự thử để giảm tác động học bài. Ghi phiên bản UI và cho cơ hội làm quen trước khi đo.

Yêu cầu người chơi chỉ ra: họ đang tạo lợi thế gì; ai sẽ nối; vì sao chọn mục tiêu; đối thủ có thể ngắt ở đâu; hành động nào dẫn đến cửa kết thúc. Quan sát khả năng thực hiện, không chỉ hỏi có thích hiệu ứng không. Không quy lượt mô phỏng thành phút chơi.

## 6. Chỉ số và cách diễn giải

| Nhóm | Đo lường bắt buộc | Giới hạn diễn giải |
|---|---|---|
| Kết quả | n; thắng/thua/hòa tự nhiên/chạm cap riêng; kết quả ghép cặp | Không kết luận vai trò từ tỷ lệ thắng tổng hợp |
| Nhịp | Trung vị/P90 lượt thường mỗi phe; tỷ lệ vượt25/34/44 | Trận cap là censored, không phải kết thúc tự nhiên |
| Quyền chủ động | Quyết định mở/tận dụng/bỏ cơ hội; thay người/đích/chiêu; cửa hạ mục tiêu được tạo và tận dụng | Damage cao không tự chứng minh lựa chọn có ý nghĩa |
| Kết thúc | Nguồn đòn cuối: chủ động/chase/DOT/khác/hết lương; diễn tiến trước đòn cuối | Đòn cuối chỉ là nhãn nguồn, không phải toàn bộ công lao |
| Chase | Tín hiệu đủ điều kiện; số kích hoạt/cơ hội; độ sâu; phản ứng mỗi root; số chạm giới hạn | Tỷ lệ dùng cao có thể chỉ là tự động hóa mạnh |
| Giá trị thật | HP damage sau Khiên; hồi HP hữu hiệu; Khiên cấp/hấp thụ/hết hạn/bị thay thế; năng lượng dùng được | Không cộng lượng Khiên cấp vào lượng hấp thụ |
| Hỗ trợ | Người được cứu sống tới lượt; cast chỉ đủ giá nhờ hỗ trợ; tác dụng của cast đó | Cứu sống mà không tạo thêm lựa chọn có thể chỉ kéo trận |
| Đáp trả | Lượt bị khống chế, hành động khả dụng, năng lượng, lần ngắt được chuỗi | Ghi tần suất không thể đáp trả và tình huống dẫn đến nó |
| Tiến triển | HP ròng từng cửa sổ5 lượt thường/phe; KO; tài nguyên; mất máu do hết lương | Không gắn nhãn bế tắc chỉ vì HP ròng thấp trong một cửa sổ |

Định nghĩa **cửa hạ mục tiêu** trên trace kiểm soát: từ cùng trạng thái thông tin hợp lệ, có hành động/chuỗi kế hoạch hữu hạn hạ được mục tiêu; so với phương án hợp lệ khác. Ghi rõ chân trời và tập hành động được xét, không tuyên bố đã tìm mọi nước đi. Bản replay xác định phục vụ phân tích sau quyết định, không đưa RNG ẩn cho AI/người chơi.

Dấu hiệu vòng phòng thủ cần xem trace: nhiều cửa sổ liên tiếp không mất người, HP hồi lại gần mức đầu, lương tiếp tục giảm và các hành động lặp lại không mở cửa tấn công. Ngưỡng cảnh báo cụ thể chốt sau pilot; chưa dùng như tiêu chuẩn loại mọi trận dài.

## 7. Trace và phản thực quyết định

Chọn theo tiêu chí ghi trước, không chỉ lấy trận đẹp:

1. Một trận thắng nhờ chuẩn bị và tận dụng combo rõ ràng.
2. Một trận mở nhiều phản ứng nhưng ít giá trị.
3. Một trận phối hợp bị đối thủ ngắt thành công.
4. Một trận K4 đổi kết quả so K1/K0.
5. Một trận K4 dài hơn đối chứng đáng kể.
6. Một trận chạm cap hoặc vòng hồi/Khiên kéo dài, nếu có.
7. Một trận hỗ trợ cứu được người rồi người đó tạo đóng góp hữu ích.

Với hành động then chốt, replay cùng trạng thái và cùng hành động nhưng bỏ một nguồn bị động để đo phần đóng góp tức thời. Đây là phản thực tác dụng, không chứng minh quyết định tốt.

Để đánh giá **quyết định**, thử thêm các lựa chọn hợp lệ về người hành động/đích/chiêu và nhánh bỏ qua kỹ năng khi hợp lệ. Giữ chính sách tiếp diễn và chân trời cố định, ghi rõ ngẫu nhiên/ẩn thông tin; không xem replay biết tương lai như chiến thuật mà người chơi đã biết. Tách lợi ích do quyết định với lợi ích tự động từ đội hình.

## 8. AI, thống kê và ngân sách

Đóng băng một phiên bản AI cho mỗi so sánh cân bằng. AI hiện chỉ ước lượng chase nhịp đầu, chưa tối ưu cả chuỗi hoặc đổi người nhiều lượt; do đó cần trace/chơi thử có điều khiển. Thử AI mới ở nhóm riêng, sau đó mới quyết định chạy lại các nhóm chịu ảnh hưởng. Không ép quota dùng combo hoặc tăng hệ số để bù AI chưa hiểu cơ chế.

Báo cáo chênh lệch theo cặp và khoảng bất định. Bootstrap theo seed gốc/cụm kịch bản thực tế, giữ hai thứ tự cùng cụm; không coi hàng nghìn trận cùng ít seed là hàng nghìn mẫu độc lập. Nếu nhóm chỉ có ít cụm, nêu rõ chưa đủ khái quát. Ghi cách xử lý cap, thời lượng bị chặn và mẫu bị lỗi.

Giữ cap hiện có120 lượt thường tổng, xấp xỉ60/phe khi luân phiên; lưu cả số lượt từng phe, không chỉ giá trị chia đôi. Có giới hạn thời gian/tài nguyên chạy harness; dừng kỹ thuật phải ghi lỗi/timeout riêng với chạm cap gameplay. Không mở rộng ngân sách toàn bộ trước khi đọc kết quả pilot.

## 9. Quy tắc chỉnh và cổng quyết định

Thứ tự xử lý: lỗi cơ chế/đo lường → điều kiện và mục tiêu → tần suất/giới hạn chuỗi → hệ số bị động → hệ số/chi phí chủ động nếu còn cần. Mỗi vòng chỉ thay một nhóm nguyên nhân và chạy lại đúng đối chứng bị ảnh hưởng.

| Quyết định | Bằng chứng cần có |
|---|---|
| Giữ | Có quyết định tạo lợi thế/kết thúc rõ, đối phó khả thi, không có lỗi hoặc rủi ro lặp chưa giải thích |
| Chỉnh | Mạnh/yếu truy được đến cơ chế cụ thể; chuỗi làm mất đáp trả hoặc nuôi vòng phòng thủ |
| Thu thập thêm | Ít seed, kết quả trái chiều, AI chưa tận dụng hoặc thiếu đo lường |
| Chưa phát hành | Lỗi hợp đồng, chuỗi vô hạn, telemetry sai, hoặc rủi ro trải nghiệm quan trọng chưa được kiểm chứng |

Sau pilot phải ghi **trước vòng xác nhận** các ngưỡng chấp nhận: chạm cap/đuôi dài, tỷ lệ không thể đáp trả, đóng góp hết lương và mức tập trung đội hình. Ngưỡng dựa mục tiêu trải nghiệm và dữ liệu, không điều chỉnh sau khi xem kết quả để hợp thức hóa phương án ưa thích. Không lấy tỷ lệ thắng50% cho mọi cặp hoặc mọi trận ngắn làm điều kiện bắt buộc.

## 10. Bàn giao mỗi vòng

- Manifest: commit, cấu hình luật, bị động bật/tắt, AI, scenario ID, tướng/thứ tự, đầu tư, seed, cap và phiên bản schema đo lường.
- Dữ liệu thô + checksum, bảng tổng hợp, trace được chọn, lệnh tái lập, danh sách lỗi/mẫu loại và lý do dùng lại dữ liệu.
- Báo cáo trả lời: lựa chọn nào tạo lợi thế; hỗ trợ giúp kết thúc thế nào; đối thủ đáp trả bằng gì; bế tắc còn ở đâu; tướng/đội nào chưa đủ dữ liệu.
- Danh sách giữ/chỉnh/cần thêm dữ liệu; mỗi đề xuất chỉnh ghi giả thuyết, biến thay đổi và nhóm cần chạy lại.

**Hành động đầu tiên khi được yêu cầu triển khai:** làm vòng0, hoàn thiện ledger và manifest pilot; sau đó chạy432 trận pilot, đọc kết quả rồi chọn phạm vi tiếp theo. Không tự merge, push hoặc deploy theo tài liệu kế hoạch này.
