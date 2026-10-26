# Cờ Lau (Reed Banner)

Game match-3 chiến đấu theo lượt, lấy cảm hứng từ thời kỳ Loạn 12 Sứ Quân (thế kỷ X). Người chơi vào vai Đinh Bộ Lĩnh, ghép ô trên bàn cờ 12×8 để tấn công, hồi máu và tung kỹ năng, đấu 1vs1 hoặc 3vs3 với các sứ quân do AI điều khiển.

Mini game thuộc ShanVerse.

**Trạng thái:** đã có lõi trận, server và tài khoản, tiến trình, Campaign V2 (6 chương, 24 nhiệm vụ), Đánh trùm, leo tháp, Song Tháp, sinh tồn, thử thách ngày, nhiệm vụ và đấu trường. Xem [Lộ trình](docs/09-roadmap/lo-trinh.md).

**Campaign V2:** 6 chương, 24 nhiệm vụ M01–M24 (965–968). Lời kể mang nhãn nguồn theo [sổ nguồn](docs/02-game-modes/campaign/history-sources.md). Thưởng lần đầu chỉ có vàng, Campaign không phát Đá Cường Hóa. Chi tiết ở [Chế độ chơi](docs/02-game-modes/README.md#2-chiến-dịch) và [nghiệm thu](docs/02-game-modes/campaign/final-acceptance.md).

## Phát triển

Cần Node 22+ và pnpm 10.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # node:test qua tsx
pnpm lint
pnpm typecheck
pnpm build
pnpm sim -- --mode all --battles 200   # mô phỏng cân bằng AI đấu AI
pnpm exec tsx scripts/campaign-balance.ts --runs 200   # mô phỏng 9 nhiệm vụ có trận của Campaign V2
```

- `src/app/`: giao diện Next.js (App Router).
- `src/core/`: logic trận đấu, TypeScript thuần, xác định theo seed. ESLint chặn import React/Next, `Math.random()`, `Date.now()` và API trình duyệt trong thư mục này ([kiến trúc](docs/07-architecture/kien-truc.md)).
- `tests/`: test cho `src/core/`, `src/server/` và một phần giao diện.

## Tài liệu

Toàn bộ thiết kế nằm trong [`docs/`](docs/README.md):

- [Tổng quan](docs/00-overview/tong-quan.md)
- [Mục lục đầy đủ](docs/README.md)
- [Lộ trình](docs/09-roadmap/lo-trinh.md)
- [Câu hỏi còn mở](docs/09-roadmap/cau-hoi-mo.md)

## Giấy phép

Xem [LICENSE](LICENSE).
