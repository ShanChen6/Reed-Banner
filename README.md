# Cờ Lau (Reed Banner)

Game match-3 chiến đấu theo lượt, lấy cảm hứng từ thời kỳ Loạn 12 Sứ Quân (thế kỷ X). Người chơi vào vai Đinh Bộ Lĩnh, ghép ô trên bàn cờ 12×8 để tấn công, hồi máu và tung kỹ năng, đấu 1vs1 hoặc 3vs3 với các sứ quân do AI điều khiển.

Mini game thuộc ShanVerse.

**Trạng thái:** giai đoạn 0, đã dựng khung Next.js.

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
```

- `src/app/`: giao diện Next.js (App Router).
- `src/core/`: logic trận đấu, TypeScript thuần, xác định theo seed. ESLint chặn import React/Next, `Math.random()`, `Date.now()` và API trình duyệt trong thư mục này ([kiến trúc](docs/tech/kien-truc.md)).
- `tests/`: test cho `src/core/`.

## Tài liệu

Toàn bộ thiết kế nằm trong [`docs/`](docs/README.md):

- [Tổng quan](docs/design/00-tong-quan.md)
- [Mục lục đầy đủ](docs/README.md)
- [Lộ trình](docs/lo-trinh.md)
- [Câu hỏi còn mở](docs/cau-hoi-mo.md)

## Giấy phép

Xem [LICENSE](LICENSE).
