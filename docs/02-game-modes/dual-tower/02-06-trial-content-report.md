# T02.06 — Báo cáo nội dung 20 tầng Trial V1

Ngày chạy: 2026-10-23. Nội dung dùng `contentVersion: 1`; mọi tầng là 3v3, mục tiêu `defeatAll`, mở tuần tự và thưởng đá lần đầu đúng một lần.

## Phương pháp

- Validator schema: `createTrialRegistry(data, { requireComplete: true })` và roundtrip snapshot.
- Eligibility: duyệt toàn bộ cặp trong 5 tướng khởi đầu cùng 42 build nghề/hệ của Đinh Bộ Lĩnh; `legal teams` là số cấu hình hợp luật.
- Sample simulation: lấy 12 cấu hình hợp lệ đầu tiên, profile chỉ sở hữu 5 tướng khởi đầu ở cấp đề xuất của tầng. Phe người dùng chạy AI `hard`, phe địch chạy difficulty của tầng, đúng public seed, weights, turn limit và enemy runtime.
- `Success` là số đội mẫu thắng / 12. Đây là evidence tất định trên mẫu đội, không phải dự báo PvP hay chứng minh mọi nước đi đều thắng.

## Kết quả từng tầng

| Tầng | Luật / eligibility | Seed | Enemy (cấp × power) | Đá | Legal | Sample run | Success | Lượt | Lý do thiết kế |
|---:|---|---:|---|---:|---:|---|---:|---:|---|
| 1 | Cấm Hỏa | 1511464687 | leThach, maiThanh, toKim (1 × .42) | 2 | 216 | ĐBL + leThach + maiThanh | 12/12 (100%) | 3 | Dạy một lệnh cấm; còn bốn tướng miễn phí. |
| 2 | Cấm Pháp sư | 1511472606 | haVan, leThach, phungPhong (1 × .46) | 2 | 210 | ĐBL + leThach + maiThanh | 12/12 (100%) | 5 | Dạy cấm nghề và đổi nghề thủ lĩnh. |
| 3 | Cấm Kim | 1511480525 | toKim, maiThanh, phungPhong (2 × .48) | 2 | 216 | ĐBL + haVan + leThach | 12/12 (100%) | 5 | Lặp mẫu cấm hệ và preview thủ lĩnh. |
| 4 | Cấm Y sư | 1511488444 | haVan, leThach, toKim (2 × .52) | 2 | 210 | ĐBL + haVan + leThach | 12/12 (100%) | 5 | Bỏ hồi phục nhưng giữ power thấp. |
| 5 | Cấm Phong | 1511496363 | phungPhong, maiThanh, leThach (3 × .54) | 3 | 216 | ĐBL + haVan + leThach | 12/12 (100%) | 5 | Kết nhóm nhập môn, normal đầu tiên. |
| 6 | Cần ≥1 Binh lính | 1511504282 | leThach, haVan, toKim (3 × .56) | 3 | 210 | ĐBL + haVan + leThach | 11/12 (92%) | 18 | Lê Thạch bảo đảm eligibility. |
| 7 | Cần ≥1 Thủy | 1511512201 | maiThanh, haVan, phungPhong (4 × .58) | 3 | 204 | ĐBL + haVan + leThach | 12/12 (100%) | 6 | Mai Thanh hoặc build thủ lĩnh Thủy. |
| 8 | Ba nghề khác nhau | 1511520120 | toKim, leThach, maiThanh (4 × .60) | 3 | 280 | ĐBL + haVan + leThach | 12/12 (100%) | 7 | Dạy phối vai trò. |
| 9 | Ba hệ khác nhau | 1511528039 | haVan, toKim, phungPhong (5 × .62) | 3 | 300 | ĐBL + haVan + leThach | 12/12 (100%) | 7 | Roster đầu đã phủ năm hệ. |
| 10 | Cần Binh lính + Y sư | 1511535958 | leThach, maiThanh, haVan (5 × .64) | 4 | 84 | ĐBL + haVan + leThach | 12/12 (100%) | 7 | Hai vai trò đều có lời giải miễn phí. |
| 11 | Bàn thiên công, 28 lượt | 1511543877 | haVan, toKim, leThach (6 × .64) | 4 | 420 | ĐBL + haVan + leThach | 12/12 (100%) | 6 | Nhiều kiếm bù áp lực lượt. |
| 12 | Tim 8%, 28 lượt | 1511551796 | maiThanh, phungPhong, toKim (6 × .64) | 4 | 420 | ĐBL + haVan + leThach | 12/12 (100%) | 7 | Dạy quản lý hồi phục. |
| 13 | Bàn chiến thuật, 27 lượt | 1511559715 | phungPhong, haVan, maiThanh (7 × .66) | 4 | 420 | ĐBL + haVan + leThach | 12/12 (100%) | 6 | Tăng năng lượng/trống cho kỹ năng. |
| 14 | Bàn thiên công, 26 lượt | 1511567634 | leThach, toKim, phungPhong (7 × .68) | 4 | 420 | ĐBL + haVan + leThach | 12/12 (100%) | 2 | Kiểm tra tối ưu sát thương. |
| 15 | Tim 8%, 26 lượt | 1511575553 | maiThanh, leThach, haVan (8 × .68) | 5 | 420 | ĐBL + haVan + leThach | 12/12 (100%) | 7 | Ghép thiếu hồi với giới hạn lượt. |
| 16 | Cấm Hỏa + cần Thủy | 1511583472 | haVan, toKim, leThach (8 × .70) | 5 | 126 | ĐBL + leThach + maiThanh | 10/12 (83%) | 17 | Luật kép đầu tiên; Mai Thanh bảo đảm đường vào. |
| 17 | Cấm Y sư + ba hệ | 1511591391 | maiThanh, phungPhong, toKim (9 × .72) | 5 | 150 | ĐBL + haVan + leThach | 12/12 (100%) | 5 | Boss luật kép với nhiều tổ hợp miễn phí. |
| 18 | Cần Binh lính + ba nghề | 1511599310 | leThach, haVan, phungPhong (9 × .74) | 5 | 154 | ĐBL + haVan + leThach | 12/12 (100%) | 9 | Lê Thạch là neo đội hình. |
| 19 | Cấm Phong + cần Thổ | 1511607229 | phungPhong, toKim, maiThanh (10 × .76) | 6 | 126 | ĐBL + haVan + leThach | 7/12 (58%) | 8 | Tăng áp lực trước boss cuối; Lê Thạch bảo đảm eligibility. |
| 20 | Cấm Pháp sư + ba hệ | 1511615148 | haVan, leThach, phungPhong (10 × .78) | 8 | 150 | ĐBL + leThach + maiThanh | 4/12 (33%) | 15 | Boss cuối khó rõ rệt nhưng không cần tướng hiếm. |

## Coverage và quyết định cân bằng

- Positive: đủ 20 tầng, liên tục, mọi tầng có đội hợp lệ từ roster khởi đầu và có sample run thắng.
- Negative: test khóa cấu trúc nhóm, không cho 2v3, không cho win condition chưa hỗ trợ, không chấp nhận nhóm cuối thiếu luật kép.
- Idempotency: parse → snapshot → parse cho cùng snapshot; 20 serialization là duy nhất.
- Evidence giữ số: tầng đầu đạt 100%, nhóm cuối giảm xuống 83% / 58% / 33% ở các mốc 16 / 19 / 20. Không đổi balance engine để ép kết quả.
- Hạn chế: simulator dùng AI tất định và 12 đội mẫu; success rate không đại diện mọi kỹ năng người chơi. Bounded puzzle search độc lập đã xác nhận đường thắng tầng 1 trong 4 nước nhưng quá tốn thời gian để dùng làm CI cho cả 20 tầng; CI dùng simulator nhanh hơn và kiểm tra có ít nhất một sample thắng mỗi tầng.

## Cập nhật 11/11/2026: tầng 21–50

Shan yêu cầu nâng tháp lên 50 tầng. 20 tầng đầu không đổi số liệu (chỉ đổi chữ "active" thành "tướng ra trận" trong lời dẫn, không tăng `contentVersion` vì không ảnh hưởng trận). Bảng kết quả 20 tầng ở trên là bản chạy 23/10/2026; số liệu hiện hành của các tầng đã cân lại nằm ở [06-02-trial-qa.md](./06-02-trial-qa.md).

### Thiết kế

- **Chặng III (21–30), một luật:** dùng các luật đơn chưa xuất hiện ở 20 tầng đầu, đưa Xạ thủ và Sát thủ vào (cấm, rồi bắt buộc). Ải trùm ở tầng 30.
- **Chặng IV (31–40), hai luật:** ghép đôi, xen bàn thiên công, ít tim, chiến thuật. Ải trùm ở tầng 35 và 40.
- **Chặng V (41–50), ba luật:** ghép ba. Ải trùm ở tầng 45, 49; tầng 50 là đỉnh tháp (Ác mộng).
- Đối thủ lấy từ 51 tướng cửa hàng thay vì chỉ 5 tướng khởi đầu; cấp đối thủ tăng từ 11 lên 30 (trần cấp).
- Mọi tầng vẫn có lời giải bằng 5 tướng khởi đầu: luật cần Xạ thủ, Sát thủ, hệ Lôi hay hệ Mộc được đáp ứng bằng cách đổi nghề/hệ của thủ lĩnh.
- Không gian luật còn rất rộng: với 7 hệ, 8 nghề và sáu kiểu luật hiện có, bộ kiểm tra đếm được 32 luật đơn, 471 bộ hai luật và 3.750 bộ ba luật mà đội khởi đầu vẫn có ít nhất 20 đội hình hợp lệ.

### Phương pháp cân

Giống phần trên: 12 đội mẫu hợp luật đầu tiên, hồ sơ chỉ có 5 tướng khởi đầu ở đúng cấp đối thủ, không trang bị, phe người chơi dùng AI `hard`. `power` của từng tầng được dò riêng (quét 0,45–2,0) vì kết quả phụ thuộc mạnh vào cặp đấu và seed bàn cờ: nhiều tầng rơi từ 12/12 xuống dưới 6/12 chỉ sau một nấc 0,15, nên `power` không tăng đều theo số tầng. Ngưỡng CI: tầng 1–30 ≥ 10/12, tầng 31–49 ≥ 8/12 (người chơi tới đó đã có trang bị và tướng cửa hàng), tầng 50 ≥ 6/12.

Chạy lại: `pnpm tsx scripts/trial-content-report.ts 21 50`.

### Kết quả

| Tầng | Tên | Lời dẫn (luật) | Enemy (cấp × power) | Độ khó | Bàn | Lượt tối đa | Đá | Legal | Success | Lượt | Lý do thiết kế |
|---:|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| 21 | Rừng Khép | Hệ Mộc bị cấm; đối thủ lại toàn tướng rừng xanh. | hoangMoc, lucDiep, lamTung (11 × 0.60) | normal | STANDARD | 30 | 6 | 480 | 11/12 (92%) | 12 | Mở chặng III bằng lệnh cấm Mộc; đối thủ đầu tiên lấy từ tướng cửa hàng. |
| 22 | Buông Cung | Xạ thủ không được ra trận; hãy áp sát mà đánh. | bachNoLang, thaiHa, tieuMinh (12 × 0.62) | normal | STANDARD | 30 | 6 | 490 | 10/12 (83%) | 15 | Giới thiệu nghề Xạ thủ qua lệnh cấm. |
| 23 | Tầm Xa | Đội phải có ít nhất một Xạ thủ; thủ lĩnh có thể tự cầm cung. | caoKien, hongDan, quachAn (12 × 0.90) | normal | STANDARD | 30 | 6 | 70 | 12/12 (100%) | 14 | Thủ lĩnh đổi sang Xạ thủ là lời giải miễn phí. |
| 24 | Không Bóng Tối | Sát thủ bị cấm; đối thủ thì vẫn giấu dao trong tay áo. | bachPhongDao, khaSon, bachSuong (13 × 0.85) | normal | STANDARD | 30 | 6 | 490 | 12/12 (100%) | 11 | Giới thiệu nghề Sát thủ qua lệnh cấm. |
| 25 | Lưỡi Dao Thầm | Đội phải có ít nhất một Sát thủ để phá hàng sau của địch. | truongViem, lieuYen, beLien (14 × 0.90) | hard | STANDARD | 29 | 7 | 70 | 10/12 (83%) | 6 | Thủ lĩnh đổi sang Sát thủ là lời giải miễn phí. |
| 26 | Cạn Dòng | Hệ Thủy bị cấm, nghĩa là Mai Thanh phải ở lại hậu doanh. | lyLiet, ninhHoa, tonDiem (14 × 0.85) | hard | STANDARD | 29 | 7 | 288 | 12/12 (100%) | 12 | Cấm Thủy loại Mai Thanh, buộc tìm nguồn hồi khác. |
| 27 | Gọi Sấm | Đội phải có ít nhất một tướng hệ Lôi. | taThach, maNhac, doanNham (15 × 1.10) | hard | STANDARD | 29 | 7 | 80 | 11/12 (92%) | 4 | Roster khởi đầu không có Lôi; thủ lĩnh đổi hệ là lời giải. |
| 28 | Không Khiên | Binh lính bị cấm; không còn ai đứng chắn phía trước. | vuLoi, xichDiemLuan, tongTan (16 × 0.45) | hard | STANDARD | 28 | 7 | 294 | 10/12 (83%) | 13 | Bỏ Lê Thạch để thử đội không tiền quân. |
| 29 | Mưu Trước Trận | Đội phải có ít nhất một Mưu sĩ bày kế. | nghiemThiet, samTue, hanGiangKhach (16 × 0.85) | hard | STANDARD | 28 | 7 | 266 | 12/12 (100%) | 12 | Tô Kim khởi đầu bảo đảm điều kiện Mưu sĩ. |
| 30 | Ải Lôi Đình | Hệ Lôi bị cấm trước ba tướng sấm sét giữ ải. | ongChan, macVan, loiMinhXa (17 × 1.05) | boss | STANDARD | 30 | 10 | 480 | 11/12 (92%) | 6 | Ải trùm chặng III: ba tướng Lôi, cấm dùng Lôi đáp lại. |
| 31 | Kim Mộc Đều Im | Cấm cả hệ Kim lẫn hệ Mộc. | chuNgan, damThao, nhanTruc (18 × 1.20) | hard | STANDARD | 29 | 8 | 240 | 12/12 (100%) | 6 | Luật kép đầu chặng IV; còn Hà Vân, Lê Thạch, Mai Thanh, Phùng Phong. |
| 32 | Lửa Không Thuốc | Cần một tướng hệ Hỏa, cấm Y sư; bàn cờ nhiều kiếm. | hoLang, viTrieu, lamGiangPhiDiep (18 × 1.05) | hard | OFFENSE | 28 | 8 | 168 | 12/12 (100%) | 15 | Hà Vân bảo đảm Hỏa; bàn thiên công bù việc thiếu Y sư. |
| 33 | Văn Võ Đều Vắng | Cấm Tướng sĩ và Pháp sư; phải thắng bằng mưu và nhịp trống. | tuKinh, manhTuong, chauNgoc (19 × 0.85) | hard | TACTICAL | 28 | 8 | 252 | 11/12 (92%) | 10 | Loại Hà Vân và hai nghề công chính, đẩy sang Mưu sĩ/Quân sư. |
| 34 | Gió Chia Ba Ngả | Cần một tướng hệ Phong và ba tướng ra trận phải khác nghề. | tranSonThach, diaAn, khaSon (20 × 1.20) | hard | STANDARD | 28 | 8 | 204 | 10/12 (83%) | 10 | Phùng Phong bảo đảm Phong; starter vốn khác nghề. |
| 35 | Ải Khô Hạn | Cấm hệ Thủy, bắt buộc có Binh lính; ô tim rất hiếm. | lyLiet, xichDa, hongDan (20 × 0.72) | boss | LOW_HEAL | 29 | 9 | 162 | 12/12 (100%) | 8 | Ải trùm: Lê Thạch bắt buộc, không Mai Thanh, ít tim. |
| 36 | Tên Không Lửa | Cần một Xạ thủ, cấm hệ Hỏa; bàn cờ nhiều kiếm. | thanhLamXa, docAnh, hoangMoc (21 × 0.85) | hard | OFFENSE | 27 | 9 | 36 | 10/12 (83%) | 5 | Thủ lĩnh cầm cung; Hà Vân phải nghỉ. |
| 37 | Rời Đất | Cấm hệ Thổ và ba tướng ra trận phải khác hệ. | huaLang, tatPhongLang, buiPhieu (22 × 0.85) | hard | TACTICAL | 27 | 9 | 192 | 10/12 (83%) | 11 | Loại Lê Thạch và buộc ba hệ; starter vốn khác hệ. |
| 38 | Thuốc Và Kế | Cần cả Y sư lẫn Mưu sĩ; ô tim rất hiếm. | tranCuong, bachNoLang, nghiemThiet (22 × 1.50) | hard | LOW_HEAL | 27 | 9 | 98 | 10/12 (83%) | 12 | Mai Thanh và Tô Kim là lời giải miễn phí trên bàn ít tim. |
| 39 | Kim Không Quân Sư | Cần một tướng hệ Kim, cấm Quân sư. | loiAnh, tieuMinh, tongTan (23 × 1.10) | hard | STANDARD | 27 | 9 | 168 | 11/12 (92%) | 7 | Tô Kim bảo đảm Kim; Phùng Phong phải nghỉ. |
| 40 | Ải Ba Hệ Ba Nghề | Ba tướng ra trận phải khác hệ và khác nghề. | caoKien, vuLoi, bachSuong (24 × 0.85) | boss | TACTICAL | 29 | 12 | 300 | 9/12 (75%) | 10 | Ải trùm chặng IV ghép hai luật đa dạng của tầng 8 và 9. |
| 41 | Thủy Hỏa Bất Dung | Cấm hệ Hỏa và hệ Thủy, bắt buộc có Binh lính. | thaiHa, truongViem, quachAn (25 × 0.60) | hard | STANDARD | 27 | 10 | 85 | 9/12 (75%) | 14 | Luật ba đầu tiên; Lê Thạch là neo đội hình. |
| 42 | Rừng Ba Lối | Cần một tướng hệ Mộc, cấm Pháp sư, ba tướng khác nghề. | doanNham, maNhac, tranSonThach (25 × 0.95) | hard | TACTICAL | 27 | 10 | 30 | 10/12 (83%) | 6 | Thủ lĩnh hệ Mộc; loại Hà Vân, buộc ba nghề. |
| 43 | Gươm Vắng Chủ | Cấm hệ Kim, cấm Tướng sĩ, ba tướng ra trận phải khác hệ. | lamTung, samTue, thanhLamXa (26 × 1.10) | hard | OFFENSE | 27 | 10 | 168 | 9/12 (75%) | 11 | Loại Tô Kim và build Tướng sĩ; buộc ba hệ. |
| 44 | Nước Lặng | Cần hệ Thủy, cần Y sư, cấm hệ Phong. | khaSon, taThach, diaAn (26 × 1.20) | hard | STANDARD | 27 | 10 | 147 | 10/12 (83%) | 11 | Mai Thanh thỏa cả hai điều kiện bắt buộc. |
| 45 | Ải Không Mưu | Cấm Mưu sĩ và Quân sư, bắt buộc có một tướng hệ Thổ; ô tim rất hiếm. | huaLang, lieuYen, voAnh (27 × 1.10) | boss | LOW_HEAL | 28 | 12 | 90 | 10/12 (83%) | 6 | Ải trùm: chỉ còn ba starter hợp lệ, Lê Thạch bắt buộc. |
| 46 | Dao Trong Giông | Cần một Sát thủ, cấm hệ Lôi, ba tướng ra trận phải khác hệ. | ongChan, tuKinh, loiAnh (28 × 1.20) | hard | TACTICAL | 26 | 12 | 40 | 9/12 (75%) | 6 | Thủ lĩnh Sát thủ, đội ba hệ không Lôi. |
| 47 | Lửa Trần | Cấm Y sư và Binh lính, bắt buộc có một tướng hệ Hỏa; bàn cờ nhiều kiếm. | hoLang, daoLam, hanGiangKhach (28 × 0.76) | hard | OFFENSE | 26 | 12 | 90 | 12/12 (100%) | 4 | Hà Vân bắt buộc; không khiên, không thuốc. |
| 48 | Cung Sau Khiên | Cần Xạ thủ, cần Binh lính, cấm hệ Mộc. | tranCuong, chuNgan, bachPhongDao (29 × 0.82) | hard | STANDARD | 26 | 12 | 24 | 12/12 (100%) | 5 | Thủ lĩnh Xạ thủ đi cùng Lê Thạch. |
| 49 | Trước Đỉnh Tháp | Cấm hệ Thổ và hệ Phong, ba tướng ra trận phải khác nghề; ô tim rất hiếm. | lyLiet, xichDiemLuan, tonDiem (30 × 0.95) | boss | LOW_HEAL | 27 | 12 | 90 | 9/12 (75%) | 7 | Còn Hà Vân, Mai Thanh, Tô Kim; siết hồi phục trước đỉnh tháp. |
| 50 | Đỉnh Tháp Thí Luyện | Ba tướng ra trận phải khác hệ, khác nghề và không có Y sư. | tranCuong, vuLoi, voAnh (30 × 1.35) | nightmare | TACTICAL | 28 | 20 | 150 | 7/12 (58%) | 4 | Đỉnh tháp ghép ba luật đa dạng; starter vẫn đủ lời giải. |

Hạn chế: mô phỏng tất định trên 12 đội mẫu nên nhạy với seed; tầng 47, 48 đang dễ hơn hàng xóm (12/12) vì nấc `power` kế tiếp tụt hẳn xuống dưới ngưỡng. Nên xem lại sau khi có dữ liệu người chơi thật.
