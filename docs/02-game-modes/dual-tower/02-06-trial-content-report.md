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
