# Sổ nguồn Sử Lộ

> Cập nhật: 14/11/2026
> Trạng thái: **APPROVED** — Shan chốt lập sổ nguồn riêng cho Sử Lộ (14/11/2026). Dùng chung quy tắc nhãn với sổ nguồn Campaign.

Sổ này ghi nguồn và claim dùng riêng cho kho câu hỏi [Sử Lộ](gdd.md). Nguồn S01–S11, claim E00–E13, W01–W12, U01–U08 đã có ở [sổ nguồn Campaign](../campaign/history-sources.md) và [warlord matrix](../campaign/warlord-matrix.md); không chép lại ở đây. Nhãn (`recorded`, `legend`, `reconstructed`, `fictional`, `disputed`) và mức tin cậy theo [sổ nguồn Campaign mục 2](../campaign/history-sources.md#2-nhãn-confidence-và-quy-tắc-freeze).

Test `tests/core/su-lo/su-lo.test.ts` kiểm mọi câu trích (`quote`) trong kho câu hỏi có nguyên văn ở sổ Campaign hoặc sổ này, và mọi mã nguồn, mã claim đều có trong sổ.

## 1. Nguồn mới

Chưa có nguồn mới (S12 trở đi). Kỷ nhà Đinh (sau năm 970) và nhà Tiền Lê của Toàn thư, chương Đinh và Tiền Lê của Việt Nam sử lược phải được đọc thật và ghi vào đây (URL, đơn vị lưu trữ, locator, giới hạn) trước khi soạn câu cho mê cung III và IV. Ngày 14/11/2026 công cụ đọc web chưa mở được các trang này trên Wikisource.

## 2. Claim mới

| Claim | Nội dung | Nguồn, locator | Câu trích ngắn | Nhãn, tin cậy |
|---|---|---|---|---|
| SL01 | Lê Văn Hưu khen Tiền Ngô vương Ngô Quyền đã phá quân của Lưu Hoằng Tháo (Nam Hán) | S03, đời Tiền Ngô vương, lời bàn của Lê Văn Hưu; đọc ngày 14/11/2026 | "phá trăm vạn binh của Lưu Hoằng Tháo" | `recorded` (lời bàn của sử gia, không phải tường thuật trận), cao về việc sách có chép. Năm 938 và chi tiết cọc gỗ **không** có trong trang đã đọc |
| SL02 | Ngô Quyền đóng đô ở Loa thành (Cổ Loa) | S03, đoạn mở đầu đời Tiền Ngô vương; đọc ngày 14/11/2026 | "đóng đô ở Loa thành" | `recorded`, cao |

## 3. Câu trích bổ sung cho claim đã có

| Claim | Nguồn, locator | Câu trích ngắn |
|---|---|---|
| E01 | S03, đời Ngô, mục Kỷ Hợi 939; đọc ngày 14/11/2026 | "mùa Xuân, Vương mới xưng vương, lập Dương thị làm vương hậu" |

## 4. Duyệt câu hỏi

- **Lần 1 (Claude):** đối chiếu từng câu với sổ: nguồn, locator, đáp án, đáp án nhiễu, nhãn. Đạt thì đặt `status: "verified"`.
- **Lần 2 (Shan):** duyệt trên bản chơi thử hoặc bảng trong PR, đạt thì đặt `status: "approved"`.

Bản chơi thử dùng cả câu `verified` và `approved`; câu `draft` và `retired` không vào lượt chơi.
