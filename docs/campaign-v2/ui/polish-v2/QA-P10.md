# P10 — Nghiệm thu Campaign Atlas Polish V2

> 26/10/2026 · `develop` sau PR #171 · Audio/Voice vẫn **TODO — DEFERRED**

## Các PR của vòng Polish V2

| Task | PR | Nội dung chính |
|---|---|---|
| P00 | (báo cáo) | Audit, ảnh gốc, contract thưởng và tài khoản |
| P01 | #163 | Token `--atlas-*`, `.atlas-frame`, `AtlasFrame.tsx` (hoa văn 4 góc) |
| P02 | #164 | Đại card `.atlas-shell`, lưới 3 cột cùng chiều cao, tuyến dưới nằm trong |
| P03 | #165 | Hồ sơ / Trận thường lên header chung, avatar chữ cái đầu, khách "Khách"; tab cao đều |
| P04 | #166 | 6 thẻ chương cao đều, ảnh + nhãn tiến độ, chương khóa ảnh xám |
| P05 | #167 | Nhãn bản đồ nền giấy, `--map-*` lấy từ `--atlas-*`, Bình Kiều chung hàng chú giải |
| P06 | #168 | Cờ riêng 13 điểm (`factionMarks.ts`), nền cờ vẫn theo thế cục server |
| P07 | #169 | `MissionRewardCard` chỉ hiện thưởng thật; bỏ mã Mxx khỏi giao diện người chơi |
| P08 | #170 | `RouteSummary` hai tuyến song song từ Chương IV, nút Đỗ Động theo `campaignFinaleGate` |
| P09 | #171 | Vùng chạm 44px, nút phóng/thu không che nhãn, gợi ý xoay ngang trên điện thoại |
| P10 | PR này | Nghiệm thu, tài liệu; bỏ mã Mxx còn sót ở Đánh trùm (`RaidPanel.tsx`) |

## Lệnh đã chạy thật (26/10)

| Lệnh | Kết quả |
|---|---|
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS, 781/781 |
| `pnpm build` | PASS (không có `DATABASE_URL`, dùng kho bộ nhớ) |

## QA trình duyệt

Playwright trên `pnpm dev`, hồ sơ dựng bằng một API chỉ có ở máy dev (không commit). Ảnh ở `/mnt/project-files/demo/polish-v2/p10/`.

| # | Tình huống | Kết quả |
|---|---|---|
| 1 | Khách mới, 1440×900 | Header "Khách" + Đăng nhập; chỉ nhiệm vụ đầu Chương I mở, Chương II–VI khóa; 12 cờ trên bản đồ + Bình Kiều ở ô "vị trí còn tranh luận" = 13 điểm |
| 2 | Xong 15 nhiệm vụ | Bố Hải Khẩu: liên minh, vàng lần đầu "✓ đã nhận", ghi chú xem lại không nhận lại; Tam Đái: tan rã theo tổng thuật, không có nhiệm vụ công phá; Chương IV và V cùng mở |
| 3 | Xong tới Tế Giang, thiếu Tây Phù Liệt | Chương VI khóa; tuyến dưới "Đỗ Động 🔒, còn thiếu: Tây Phù Liệt" |
| 4 | Xong 20 nhiệm vụ | Chương VI mở, Đỗ Động "Đang mở"; panel Đỗ Động Giang: 250 vàng lần đầu, 250 vàng xong chương, mở Đánh trùm Đỗ Cảnh Thạc, kết cục ẩn tới khi đi qua nhiệm vụ |
| 5 | Xong 24, đã đăng nhập | Header avatar chữ cái đầu + tên tài khoản (không đặt cứng); 24/24 đã hoàn thành; mở Đại Lễ Đăng Quang ở chế độ xem lại |
| 6 | Điện thoại 390×844 | Không tràn ngang; gợi ý xoay ngang; danh sách cứ điểm thay cho chạm cờ nhỏ |

Mọi tình huống: 6 chương × 4 nhiệm vụ đúng registry, không có mã `M01–M24` trong chữ người chơi thấy (bản đồ và toàn bộ `main`), không lỗi JavaScript. P09 đã đo thêm 8 cỡ màn, Tab, `prefers-reduced-motion` và ảnh hỏng (ảnh ở `p09/`).

Ghi chú: vàng ở header là 0 trong tình huống 2–5 vì hồ sơ dựng tay, không đi qua cộng thưởng thật.

## Tồn đọng

- Cờ trên bản đồ nhỏ hơn 44px ở màn ≤768px; bù bằng danh sách cứ điểm (hiện dưới `lg`).
- Nút Đăng nhập trông 28px cao, vùng chạm nới bằng `::before`.
- iOS Safari không cho khóa xoay ngang, chỉ hiện lời nhắc.
- Sổ Sử ký vẫn giữ mã nhiệm vụ làm số tham chiếu (cố ý).

## Asset

`NOT_REQUIRED`: hoa văn góc, khung, cờ 13 điểm đều là CSS/SVG trong code. Không cần Shan vẽ thêm cho vòng này.
