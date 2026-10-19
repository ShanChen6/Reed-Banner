# Hạ tầng & chống gian lận

> Cập nhật: 19/10/2026

## 1. Nguyên tắc

**Server là nguồn sự thật duy nhất. Client chỉ gửi *ý định*, không bao giờ gửi *kết quả*.**

## 2. Trận đấu (server có thẩm quyền)

- Mỗi nước đi và mỗi lần dùng kỹ năng được gửi lên server (ví dụ `POST /battle/:id/move`). Server kiểm tra hợp lệ, lưu, sinh ô rơi **sau khi** nhận hành động, rồi trả kết quả.
- Server đếm đồng hồ 30 giây mỗi lượt (ghi `deadline`), cộng 3 giây ân hạn.
- **Hết giờ được xử lý kiểu "tính lười"** (Shan chốt 18/10/2026), vì Route Handlers trên Vercel không có tiến trình chạy nền và không dùng dịch vụ hẹn giờ ngoài:
  - Người chơi còn mở tab: tới `deadline`, client tự gửi request báo hết giờ. Server tự kiểm tra `now > deadline`, ghi mất lượt, chạy lượt AI và trả kết quả trong cùng response. Gửi sớm thì bị từ chối.
  - Không có request nào: không ai chuyển lượt. Request kế tiếp (nước đi, F5) sẽ chạy bù mọi lượt đã quá hạn trước khi xử lý.
  - **Người chơi bỏ đi:** AI đánh tiếp tới khi trận kết thúc (phe người chơi mất lượt liên tục). Khi chạy bù, AI dùng cách chấm điểm nhẹ nhất (xem [AI](../design/10-ai.md#chấm-điểm-theo-độ-khó)).
  - Không bao giờ quay lại: việc định kỳ 24 giờ chốt trận.
  - Chỉ PvP đồng bộ mới cần server chạy liên tục; hiện chưa có chế độ đó.
- Client chạy animation trong lúc chờ server để che độ trễ (khoảng 50–150 ms), nhưng **chỉ chạy phần biết chắc**: đổi ô, nổ bộ ghép đầu, ô cũ rơi xuống lấp chỗ. Ô mới và mọi bộ ghép tiếp theo chỉ hiện khi server trả về, kể cả khi ô cũ rơi xuống đã thẳng hàng (ô mới có thể nối dài bộ ghép đó). Nhờ vậy không bao giờ phải rút lại hình ảnh.
- Lợi ích: client không đọc trước được seed, không thể quay lui; F5 khôi phục đúng nước cuối cùng.
- **Bắt buộc online.** Mất mạng giữa trận thì **đồng hồ không dừng**: server không phân biệt được rớt mạng với bỏ đi, và dừng đồng hồ thì ai cũng có thể tắt wifi để có thời gian vô hạn. Rớt mạng ngắn có thể mất lượt; rớt lâu thì xử như bỏ đi.
- **Chế độ Luyện tập** chạy offline: không nhận thưởng, không lưu tiến độ.
- **Trận dở** được tiếp tục; quá **24 giờ** không hoàn thành thì xử thua.
- Logic game là **TypeScript thuần, xác định theo seed**, dùng chung cho client (dự đoán, hiển thị) và server (thẩm quyền).

### 2.1 Đã có trong code (19/10/2026)

- `src/core/match/`: trận online thuần. `settle` chạy bù hết giờ (mốc hết giờ là `deadline + 3 giây`, lượt AI và đồng hồ mới tính từ mốc đó), xử thua khi người chơi không tự ra tay quá 24 giờ, tối đa 120 lượt chạy bù mỗi request. Khi chạy bù, AI Trùm/Ác mộng chấm như Khó (không giả lập ô rơi). `humanAct` nhận hành động kèm `seq` client đang thấy; seq lệch sau khi chạy bù thì từ chối. `viewOf` bỏ `boardRng` và `aiRng` trước khi gửi client.
- `src/server/`: dịch vụ trận (`battles.ts`), kho lưu (`store.ts`: Postgres khi có `DATABASE_URL`, bộ nhớ khi dev), cookie khách có chữ ký HMAC (`guest.ts`, cần `SESSION_SECRET` ở production).
- API:

| Route | Việc |
|---|---|
| `POST /api/battles` | Tạo trận `{ mode, element, profession, companions, difficulty }`; tạo khách nếu chưa có cookie |
| `GET /api/battles/:id` | Trạng thái trận sau khi chạy bù (F5, báo hết giờ) |
| `POST /api/battles/:id/actions` | Một hành động `{ seq, action }` |

- Lỗi: 404 trận không có hoặc của người khác, 409 `staleSeq`/`conflict`, 422 lỗi luật (kèm view mới để client đồng bộ), 400 body sai.
- Trang `/play`: cùng giao diện với `/demo` nhưng mọi hành động gửi lên server. Client vẫn chạy `act` của core trên bản sao bàn cờ (không có seed) để báo lỗi tức thì, nhưng bàn cờ hiển thị chỉ lấy từ server. Đồng hồ 30 giây tính theo giờ server (mỗi response kèm `now`); quá hạn cộng ân hạn thì client gọi `GET /api/battles/:id` để chạy bù. Id trận lưu ở trình duyệt để tải lại trang vẫn "Tiếp tục trận dở". Chưa chạy trước hoạt ảnh trong lúc chờ server.
- `GET /api/health`: báo database đã nối và đã chạy hết migration chưa, có `SESSION_SECRET` chưa, nút đăng nhập nào đang bật (`oauth`).
- Đăng nhập (mục 4): `GET /api/auth/google|github?returnTo=/play` bắt đầu, nhà cung cấp chuyển về `/api/auth/<tên>/callback`, `POST /api/auth/logout` đăng xuất. Bảng `accounts` và `identities`.
- Chưa có: lưu hồ sơ tiến trình trên server, việc định kỳ (Vercel Cron) xử thua và xóa khách. Đội hình online tạm dùng bản Luyện tập (mở hết kỹ năng), đối thủ là các nhân vật kèm khởi đầu chọn theo seed.


## 3. Database

- **Postgres trên Neon + Drizzle** (Shan chốt 19/10/2026) là nguồn sự thật duy nhất, cho cả tài sản người chơi lẫn trận đang diễn ra.
  - Schema ở `src/server/db/schema.ts`; đổi schema thì chạy `pnpm db:generate` để sinh migration vào `drizzle/`.
  - `pnpm build` tự áp migration khi có `DATABASE_URL` (Vercel cấp khi gắn Neon vào project); không có thì bỏ qua. Chạy tay: `pnpm db:migrate`.
  - Test chạy cùng migration trên PGlite (Postgres trong tiến trình), không cần database thật.
- **Chống ghi trùng nước đi:** cột `seq` của bảng `matches`, cập nhật kèm điều kiện `WHERE seq = :expected`.
- **Kinh tế:** mọi thao tác trong transaction, kèm ràng buộc `CHECK (gold >= 0)`.
- **Notion** chỉ dùng cho **dữ liệu thiết kế** (nhân vật, kỹ năng, trang bị, màn chơi, lời thoại). Đồng bộ thành file tĩnh trong repo, không gọi Notion lúc đang chơi.

## 4. Tài khoản

- Đăng nhập **OAuth Google + GitHub**, tự viết luồng mã ủy quyền + PKCE (`src/server/oauth.ts`, không dùng thư viện), chỉ xin tên và ảnh đại diện, không lưu email.
- **Khách:** tài khoản ẩn danh trên server, xác định bằng cookie đã ký. Chơi đúng luồng online như người đăng ký. Liên kết OAuth thì chỉ gắn danh tính vào tài khoản đó, không cần gộp dữ liệu.
- **Quy tắc gắn** (`signIn` trong `src/server/accounts.ts`):
  - Danh tính chưa thuộc ai: gắn vào khách đang dùng (cookie giữ nguyên id, hạn tăng lên 1 năm).
  - Danh tính đã thuộc một tài khoản (đăng nhập ở máy khác): chuyển sang tài khoản đó; khách đang dùng trên máy này bị bỏ lại.
  - Đang ở tài khoản đã đăng nhập mà đăng nhập thêm nhà cung cấp kia: gắn cả hai vào cùng tài khoản.
  - Đăng xuất: xóa cookie; lần chơi sau là khách mới.
- **Cấu hình** (Vercel, Production): `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` và `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`. Thiếu cặp nào thì nút đó ẩn đi. Địa chỉ chuyển về phải khai trước ở nhà cung cấp: `https://<tên miền>/api/auth/google/callback` (Google Cloud Console, OAuth client loại Web) và `https://<tên miền>/api/auth/github/callback` (GitHub OAuth App chỉ nhận một địa chỉ). Bản xem trước có tên miền đổi theo nhánh nên không đăng nhập được, trừ khi khai thêm địa chỉ đó.
- Tài khoản khách **không hoạt động 30 ngày thì bị xóa**. Có cảnh báo mất dữ liệu nếu không đăng ký.
- Tạo tài khoản (kể cả khách) là lúc người chơi chọn nguyên tố ban đầu cho nhân vật chính (nghề mặc định Tướng sĩ, đổi được trước mỗi trận).

## 5. Bảng xếp hạng

- Xếp theo **tiến độ chiến dịch** (không phải trọng tâm của game).
- **Biệt danh:** tự đặt khi lần đầu có mặt trên BXH; 3–16 ký tự, cho phép tiếng Việt có dấu; không trùng (không phân biệt hoa thường và dấu); lọc từ thô tục; đổi tối đa 1 lần mỗi 30 ngày.
- Khách có mặt trên BXH với nhãn **"Khách"**.

## 6. Những gì cố ý không chặn

- Bot hoặc solver chơi hộ (giảm bằng giới hạn số trận mỗi giờ nếu cần; giới hạn này không chặn được bot ở Sinh tồn vì đó là một trận duy nhất).
- Cày vàng và sách bằng cách kéo dài trận (xem [Tiến trình & kinh tế](../design/08-tien-trinh-kinh-te.md#2-vàng)).
- Nhiều tài khoản (giảm nhờ chỉ dùng OAuth).
