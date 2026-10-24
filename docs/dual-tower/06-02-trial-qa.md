# T06.02 — Trial Puzzle QA

Ngày chạy: 2026-10-24 (Asia/Ho_Chi_Minh)  
Nhánh kiểm thử: `update/tower`  
Nội dung: Trial V1, 20 tầng cố định, 3v3, `defeatAll`

> Task ghi nhánh nền `develop`; QA chạy trên `update/tower` vì đây là nhánh tích hợp đang chứa nội dung
> Song Tháp cần kiểm tra. Cần chạy lại CI sau khi merge.

## Phương pháp và ngưỡng

Lệnh tái lập ma trận:

```text
pnpm exec tsx scripts/trial-puzzle-qa.ts
```

Với mỗi tầng, script:

1. parse registry đủ 20 tầng và roundtrip snapshot để kiểm tra determinism;
2. duyệt 10 cặp có thể chọn từ 5 starter, cho Đinh Bộ Lĩnh tự do đổi 7 hệ × 6 nghề;
3. mô phỏng 12 đội hợp lệ đầu tiên tại cấp đề xuất −2, đúng cấp và +2;
4. giữ nguyên public seed, board weights, AI difficulty, enemy config và turn limit của tầng;
5. chạy người chơi bằng AI `hard`, phe địch bằng difficulty của tầng;
6. yêu cầu mỗi tầng đạt tối thiểu 10/12 ở cấp chuẩn và 8/12 ở cấp −2.

Starter miễn phí đã phủ các điều kiện thiết kế:

- Hà Vân — Hỏa / Pháp sư;
- Lê Thạch — Thổ / Binh lính;
- Mai Thanh — Thủy / Y sư;
- Tô Kim — Kim / Mưu sĩ;
- Phùng Phong — Phong / Quân sư.

Không tầng nào cần tướng shop/hiếm. `Cặp starter hợp luật` tính với roster tối thiểu chỉ có đúng hai đồng
hành đó; Đinh Bộ Lĩnh vẫn là active slot 0 và được đổi build trước trận.

## Ma trận 20 tầng sau QA

| Tầng | Luật | Seed | Địch (level × power) | Limit | Cặp starter | −2 | Chuẩn | +2 | Nhanh nhất | Chiến thuật mẫu |
|---:|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Cấm Hỏa | 1511464687 | Lê Thạch, Mai Thanh, Tô Kim (1×.42) | 36 | 6/10 | 12/12 | 12/12 | 12/12 | 3 | Đổi hệ ĐBL, dùng đội không Hỏa. |
| 2 | Cấm Pháp sư | 1511472606 | Hà Vân, Lê Thạch, Phùng Phong (1×.46) | 35 | 6/10 | 12/12 | 12/12 | 12/12 | 5 | Đổi nghề ĐBL; tránh Hà Vân. |
| 3 | Cấm Kim | 1511480525 | Tô Kim, Mai Thanh, Phùng Phong (2×.48) | 34 | 6/10 | 12/12 | 12/12 | 12/12 | 5 | Bỏ Tô Kim, đổi hệ ĐBL nếu cần. |
| 4 | Cấm Y sư | 1511488444 | Hà Vân, Lê Thạch, Tô Kim (2×.52) | 33 | 6/10 | 12/12 | 12/12 | 12/12 | 5 | Không dựa hồi phục; ưu tiên kiếm/kỹ năng. |
| 5 | Cấm Phong | 1511496363 | Phùng Phong, Mai Thanh, Lê Thạch (3×.54) | 32 | 6/10 | 12/12 | 12/12 | 12/12 | 5 | Bỏ Phùng Phong, giữ core công–thủ. |
| 6 | ≥1 Binh lính | 1511504282 | Lê Thạch, Hà Vân, Tô Kim (3×.56) | 32 | 10/10 | 11/12 | 11/12 | 12/12 | 18 | Dùng Lê Thạch hoặc đổi ĐBL sang Binh lính. |
| 7 | ≥1 Thủy | 1511512201 | Mai Thanh, Hà Vân, Phùng Phong (4×.58) | 31 | 10/10 | 12/12 | 12/12 | 12/12 | 6 | Dùng Mai Thanh hoặc ĐBL hệ Thủy. |
| 8 | Ba nghề khác nhau | 1511520120 | Tô Kim, Lê Thạch, Mai Thanh (4×.60) | 31 | 10/10 | 10/12 | 12/12 | 12/12 | 7 | Chọn hai starter khác nghề, ĐBL nhận nghề thứ ba. |
| 9 | Ba hệ khác nhau | 1511528039 | Hà Vân, Tô Kim, Phùng Phong (5×.62) | 30 | 10/10 | 11/12 | 12/12 | 12/12 | 7 | Hai starter khác hệ, ĐBL chọn hệ thứ ba. |
| 10 | Binh lính + Y sư | 1511535958 | Lê Thạch, Mai Thanh, Hà Vân (5×.64) | 30 | 7/10 | 12/12 | 12/12 | 12/12 | 7 | Lê Thạch + Mai Thanh, hoặc ĐBL bù một nghề. |
| 11 | Board thiên công | 1511543877 | Hà Vân, Tô Kim, Lê Thạch (6×.64) | 28 | 10/10 | 12/12 | 12/12 | 12/12 | 6 | Tận dụng mật độ kiếm để kết thúc sớm. |
| 12 | Tim 8% | 1511551796 | Mai Thanh, Phùng Phong, Tô Kim (6×.64) | 28 | 10/10 | 12/12 | 12/12 | 12/12 | 7 | Giữ Mai Thanh hoặc build hồi phục; không chờ tim. |
| 13 | Board chiến thuật | 1511559715 | Phùng Phong, Hà Vân, Mai Thanh (7×.66) | 27 | 10/10 | 12/12 | 12/12 | 12/12 | 6 | Ưu tiên âm dương/trống và kỹ năng chủ động. |
| 14 | Board thiên công | 1511567634 | Lê Thạch, Tô Kim, Phùng Phong (7×.68) | 26 | 10/10 | 12/12 | 12/12 | 12/12 | 2 | Dồn kiếm và sát thương diện rộng. |
| 15 | Tim 8% | 1511575553 | Mai Thanh, Lê Thạch, Hà Vân (8×.68) | 26 | 10/10 | 10/12 | 12/12 | 11/12 | 7 | Đánh nhanh, dùng hồi chủ động thay vì phụ thuộc board. |
| 16 | Cấm Hỏa + ≥1 Thủy | 1511583472 | Hà Vân, Tô Kim, Lê Thạch (8×.62) | 28 | 6/10 | 12/12 | 11/12 | 12/12 | 14 | Mai Thanh bảo đảm Thủy; ĐBL tránh Hỏa. |
| 17 | Cấm Y sư + ba hệ | 1511591391 | Mai Thanh, Phùng Phong, Tô Kim (9×.72) | 28 | 6/10 | 11/12 | 12/12 | 12/12 | 5 | Hai starter khác hệ/nghề không Y sư, ĐBL hệ thứ ba. |
| 18 | Binh lính + ba nghề | 1511599310 | Lê Thạch, Hà Vân, Phùng Phong (9×.74) | 27 | 10/10 | 12/12 | 12/12 | 12/12 | 9 | Lê Thạch làm neo, hai slot còn lại khác nghề. |
| 19 | Cấm Phong + ≥1 Thổ | 1511607229 | Phùng Phong, Tô Kim, Mai Thanh (10×.70) | 27 | 6/10 | 10/12 | 12/12 | 12/12 | 5 | Lê Thạch bảo đảm Thổ, ĐBL tránh Phong. |
| 20 | Cấm Pháp sư + ba hệ | 1511615148 | Hà Vân, Lê Thạch, Phùng Phong (10×.60) | 28 | 6/10 | 11/12 | 10/12 | 9/12 | 9 | Hai starter khác hệ, ĐBL hệ thứ ba và nghề không Pháp sư. |

## Điều chỉnh có bằng chứng

Probe trước khi sửa cho thấy:

| Tầng | Power cũ | −2 cũ | Chuẩn cũ | Power mới | −2 mới | Chuẩn mới |
|---:|---:|---:|---:|---:|---:|---:|
| 16 | .70 | 6/12 | 10/12 | .62 | 12/12 | 11/12 |
| 19 | .76 | 8/12 | 7/12 | .70 | 10/12 | 12/12 |
| 20 | .78 | 5/12 | 4/12 | .60 | 11/12 | 10/12 |

Ba tầng đổi sang `contentVersion: 2`. Luật, public seed, turn limit, enemy IDs, board weights và đá first-clear
không đổi. Không thêm reward đầu vào/replay để làm dễ bài đố và không thay balance engine.

## Determinism và công bằng

- Registry snapshot roundtrip cho cùng JSON canonical.
- Mỗi tầng chạy lặp đúng cấp cho cùng kết quả report.
- Public seed của 20 tầng là duy nhất và cố định trong bảng trên.
- Mỗi trận là 3v3; không có luật 2v3 và không đổi tướng trong combat.
- Mỗi tầng có ít nhất 6/10 cặp starter tối thiểu hợp luật; không khóa bằng tướng hiếm.
- Turn nhanh nhất đều thấp hơn limit; tầng 16 còn biên 14 lượt (14/28), tầng 20 còn biên 19 lượt (9/28).
- Đá chỉ là first-clear settlement một lần; thay đổi content không tạo entitlement lặp.

## Giới hạn heuristic

- Tỷ lệ là 12 lineup mẫu tất định, không phải xác suất của toàn bộ người chơi.
- AI `hard` là heuristic; cấp cao hơn không luôn đơn điệu. Ví dụ tầng 20 đạt 10/12 ở cấp chuẩn nhưng 9/12
  ở +2 vì build/skill choice của AI thay đổi, không phải chỉ số cao hơn làm đội yếu đi.
- Search puzzle đầy đủ có branching rất lớn (actor × swap × skill/target/cell). Bounded search chỉ có thể nói
  `win_found` hoặc `unresolved`, không được dùng `unresolved` như bằng chứng vô nghiệm.
- Ma trận chứng minh có sample run tái lập trong mô hình đã nêu; chưa thay thế playtest thủ công trên touch/mobile.

## Kết luận

Sau cân bằng, cả 20 tầng đạt ngưỡng QA: cấp chuẩn ≥10/12, cấp −2 ≥8/12, có đội 3v3 hợp luật từ starter
và seed tái lập. Không còn tầng vô nghiệm hoặc điểm nghẽn khách quan trong phạm vi validator/simulator.

**Status: PASS**
