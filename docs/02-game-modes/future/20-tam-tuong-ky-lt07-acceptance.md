# 20 — Tầm Tướng Ký: nghiệm thu và phát hành LT-07

> Cập nhật: 04/11/2026
> Trạng thái: **DRAFT** — kiểm thử tổng thể đạt trên nhánh `feat/lt-tam-tuong-ky`; chờ Shan chơi thử và ra lệnh bật cờ production. Code chưa merge vào `develop`.

Luật ở [Design Freeze](14-tam-tuong-ky-design-freeze.md); chi tiết từng phần: [Gói 1](18-tam-tuong-ky-lt05-pack-1.md), [server Thường](17-tam-tuong-ky-lt04-server.md), [Hạng tuần](19-tam-tuong-ky-lt06-ranked.md), [giao diện](../../05-ui-ux/screens/tam-tuong-ky.md).

## 1. Kết quả kiểm

| Kiểm | Kết quả |
|---|---|
| `pnpm test` | 1281/1281 qua (gồm Tầm Tướng Ký: catalog, engine, tài khoản, Hạng, Gói 1, server Thường, server Hạng, màn chơi) |
| `pnpm typecheck`, `pnpm lint`, `pnpm docs:check` | Sạch |
| `next build` (production) | Đạt; có đủ 7 API `/api/tam-tuong-ky/*` |
| `validatePack(PACK_1)` | 0 lỗi, 0 cảnh báo |

### Chạy thử trên bản production (`next start`)

| Kịch bản | Cờ tắt | Cờ bật (cả hai) |
|---|---|---|
| Thẻ Home | “Sắp ra mắt”, không có link | “Đã mở”, dẫn vào màn |
| Mở `/game/tam-tuong-ky` | “Chế độ này chưa mở” | Màn chơi; có tab Thường / Hạng tuần |
| API `GET`, `session`, `ranked`, `ranked/buy` | 403 cả bốn | 200, 200, 200, 409 `noGold` (tài khoản mới 0 vàng) |
| Trang Nhiệm vụ | Không có thành tựu Tầm Tướng Ký | 9 thành tựu bộ |
| Thưởng hạng chờ nhận | Không nhắc tới bó | Có bó khi đủ điều kiện |
| Trận Đồ, Bình Loạn, Thao Luyện, Xếp hạng, Cửa hàng, Hồ sơ | 200, không lỗi console | 200, không lỗi console |
| Chế độ Thường | | Mở lượt 3 → 2 phiếu; ghép ra Đinh Ngọc; bấm đúp chỉ trừ 1 lần ghép; tải lại giữ sổ và lượt; gợi ý 2 → 1 |
| Chế độ Hạng | | Ghép ra tướng đặc biệt đề cử +200 điểm, túi 21 → 11; bảng tuần có tên; tải lại giữ; nút mua khóa khi thiếu vàng |
| Điện thoại (iPhone 13), 320–1024px | | Không tràn ngang |

Khách (chưa đăng nhập) thấy màn nhắc đăng nhập; API trả 401 (test server).

### Rà soát an toàn

- Server quyết định mọi lần ghép, mở lượt, gợi ý, mua bó; client chỉ gửi ý định. Không tin điểm hay tướng do client gửi (test).
- Mỗi thao tác có `requestId`; gửi lại hoặc gửi song song không trừ hai lần (test song song cho cả Thường và Hạng). Ghi hồ sơ có điều kiện version.
- POST kiểm cùng Origin; chế độ chỉ cho tài khoản đã đăng nhập (401 cho khách).
- Ô đề cử Hạng không gửi tên hay mã tướng chưa tìm (test); catalog nằm trong bundle nên đây là chống lộ trên màn, không phải bí mật.
- Thưởng bó chỉ cộng cho người đã vào chế độ và chỉ khi cờ bật; số vàng thưởng hạng đã duyệt không đổi.
- Chưa có giới hạn tốc độ riêng cho API Tầm Tướng Ký (giống các chế độ khác hiện nay); số lần ghép bị chặn bởi phiếu (Thường) và túi (Hạng).

## 2. Không ảnh hưởng chế độ khác

- Không đổi Battle Engine, Campaign, roster, shop tướng. Tầm Tướng Ký chỉ ghi `Profile.tamTuongKy` (trường tùy chọn, hồ sơ cũ đọc được như cũ).
- Nhiệm vụ và điểm danh: vàng giữ nguyên; phiếu chỉ cộng cho người đã vào chế độ.
- Thưởng hạng: thêm chế độ `tamTuongKy` vào sổ chung; chế độ theo tuần kèm bó khi cờ bật; kết quả cũ (không có trường `bundles`) giữ nguyên khi không có bó.
- `season_scores` thêm giá trị `mode = "tamTuongKy"`, không cần migration. Trang Xếp hạng không đổi.

## 3. Bật và rút lại

**Bật** (chỉ biến môi trường, không cần sửa code):

1. Merge nhánh vào `develop` sau khi Shan duyệt.
2. Đặt `TAM_TUONG_KY_ENABLED=true`: mở chế độ Thường, thành tựu bộ, phiếu từ nhiệm vụ/điểm danh, bó trong thưởng hạng.
3. Khi muốn mở Hạng tuần, đặt thêm `TAM_TUONG_KY_RANKED_ENABLED=true` (nên bật vào đầu tuần, thứ Hai giờ Việt Nam, để tuần đầu đủ 7 ngày).

**Gói 2:** đặt thêm `TAM_TUONG_KY_PACK2_ENABLED=true` (cần cờ chế độ; nên bật vào thứ Hai). Tắt thì sổ người chơi vẫn giữ khám phá Gói 2. Xem [Gói 2](21-tam-tuong-ky-pack-2.md#2-gộp-sổ).

**Kiểm cờ sau khi deploy:** mở `/api/health`, mục `features.tamTuongKy`:

- `enabled`, `ranked`, `pack2`: server đang đọc cờ chế độ, cờ Hạng, cờ Gói 2 là bật hay tắt; `pack2Ignored` như `rankedIgnored` cho cờ Gói 2.
- `invalid`: tên biến đã đặt nhưng giá trị không phải `true` (ví dụ `1`, `yes`). Hai cờ Tầm Tướng Ký chấp nhận `true` không phân biệt hoa thường, bỏ khoảng trắng và xuống dòng ở hai đầu.
- `rankedIgnored: true`: đã đặt cờ Hạng nhưng cờ chế độ chưa bật, nên Hạng vẫn tắt.
- Biến môi trường chỉ có hiệu lực từ lần deploy **sau** khi đặt; đặt xong phải deploy lại. Trên Vercel, biến phải được chọn cho đúng môi trường (Production hoặc Preview) của bản đang mở.

**Rút lại:** đặt lại cờ về giá trị khác `true` (hoặc xóa). Thẻ Home về “Sắp ra mắt”, API trả 403, thành tựu ẩn, không cộng bó. Dữ liệu người chơi (sổ, phiếu, túi, điểm tuần) giữ nguyên trong hồ sơ và `season_scores`; bật lại thì chơi tiếp. Bảng tuần đang chạy khi rút Hạng không thành nguồn thưởng cho tới khi bật lại.

## 4. Còn chờ Shan

- [ ] Chơi thử cả hai chế độ và góp ý giao diện.
- [ ] Thêm claim tước hiệu tướng Gói 1 vào [sổ nguồn](../campaign/history-sources.md) và đối chiếu `S04`, `S05` (phiên làm việc không mở được Wikisource); tới lúc đó Tướng Lục không hiện mô tả lịch sử.
- [ ] Quyết định merge và ngày bật cờ production.
- Việc làm sau, không chặn phát hành: lời dẫn dạng ảnh; icon riêng cho yếu tố trung gian; Đinh Bộ Lĩnh vào gói 2 (P-27).
