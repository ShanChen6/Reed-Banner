# Kiến trúc & tích hợp ShanVerse

> Cập nhật: 18/10/2026

## 1. Repo

- Toàn bộ code Cờ Lau nằm trong repo [`ShanChen6/Reed-Banner`](https://github.com/ShanChen6/Reed-Banner), tách riêng khỏi repo ShanVerse.
- **Nguyên tắc clean-room:** không copy code hay asset nào của bản gốc (hay của game khác) vào repo.

## 2. Công nghệ

Cờ Lau viết mới hoàn toàn bằng **TypeScript**. Không dùng Java và không chuyển đổi code của game gốc.

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Ngôn ngữ | **TypeScript** (strict) | Một ngôn ngữ cho cả client, server, script và test |
| Framework | **Next.js** (App Router) + **React** | Đồng bộ phiên bản với ShanVerse (Next.js 16, React 19) |
| Giao diện | **Tailwind CSS** | Theo quy ước ShanVerse; animation bằng CSS/Canvas, chọn khi làm giai đoạn 1 |
| Logic trận đấu | **TypeScript thuần** | Không phụ thuộc React, DOM hay trình duyệt; xác định theo seed; dùng chung cho `/demo`, `/play` và API |
| PRNG | Thuật toán xác định có seed (ví dụ mulberry32) | Seed online bốc bằng `crypto` của server |
| API / server | **Next.js Route Handlers** | Server có thẩm quyền xử lý từng nước đi |
| Database | **Postgres** (Neon hoặc Supabase) | Nguồn sự thật duy nhất cho dữ liệu người chơi |
| ORM | **Prisma** hoặc **Drizzle** | Chọn ở giai đoạn 2 |
| Đăng nhập | **Auth.js**, OAuth Google + GitHub | Tài khoản khách bằng cookie đã ký |
| Dữ liệu thiết kế | **Notion** → script đồng bộ ra file JSON tĩnh trong repo | Không gọi Notion lúc đang chơi |
| Test | `node:test` qua **tsx** | Theo quy ước ShanVerse; bắt buộc cho logic và AI |
| Script cân bằng | **tsx** | Mô phỏng AI đấu AI hàng nghìn trận |
| Quản lý gói | **pnpm** | Như ShanVerse |
| Triển khai | **Vercel** | Deploy độc lập với ShanVerse |
| Việc định kỳ | **Vercel Cron** | Xử thua trận dở quá 24 giờ, xóa tài khoản khách sau 30 ngày |

**Nguyên tắc tổ chức code:** thư mục logic (ví dụ `src/core/`) chỉ import TypeScript thuần, **không** import React, Next.js, database hay `Math.random()`. Ranh giới này giúp:

- Chạy cùng một logic ở trình duyệt và server.
- Test nhanh, không cần trình duyệt.
- Thực thi được nguyên tắc ngang bằng thông tin cho AI.

## 3. Sơ đồ

```
┌────────────────────── ShanVerse (repo riêng) ─────────────────────────┐
│  /games/co-lau                                                        │
│  ┌──────────────────────────────────────────────┐                      │
│  │  iframe chạy màn chơi thử                     │   [Chơi bản đầy đủ →] │
│  └──────────────────────────────────────────────┘                      │
└───────────────────────────────│────────────────────────────────────────┘
                                │ nhúng trang /demo
┌───────────────────────────────▼──── Cờ Lau (repo Reed-Banner) ───────┐
│  colau.vercel.app (đề xuất, đổi sang tên miền riêng sau nếu muốn)    │
│   /           trang chủ game: giới thiệu, đăng nhập, chiến dịch, BXH   │
│   /play       game đầy đủ (online, server có thẩm quyền)               │
│   /demo       màn chơi thử: offline, không cần tài khoản, không lưu    │
│   /api/...    server: xử lý nước đi, tài khoản, kinh tế                │
│   Postgres    dữ liệu người chơi                                       │
└────────────────────────────────────────────────────────────────────────┘
```

## 4. Cờ Lau (repo Reed-Banner)

- Website Next.js riêng, deploy riêng trên Vercel. Chứa toàn bộ server, database, đăng nhập, chiến dịch, BXH.
- Logic trận đấu là TypeScript thuần, xác định theo seed. Cùng một đoạn code chạy ở `/demo` (offline), `/play` (dự đoán phía client) và `/api` (thẩm quyền phía server).
- Mọi mở rộng sau này (nhân vật, chế độ, PvP…) chỉ sửa ở repo này.

## 5. Màn chơi thử (`/demo`)

- Dùng chế độ Luyện tập offline: 1 trận cố định, nhân vật chính và nhân vật kèm khởi đầu, đối đầu Tianwu.
- Không cần đăng nhập, không gọi server, không lưu gì.
- Kết thúc trận: hiện nút **"Lưu tiến độ & chơi chiến dịch"**, mở trang chủ Cờ Lau trong tab mới.
- Nhận tham số `?theme=light|dark` để khớp giao diện ShanVerse.
- Báo chiều cao nội dung cho trang cha qua `postMessage`, hoặc dùng khung có tỉ lệ cố định (bàn ngang 12×8 hợp với khung 16:9).
- Nội dung trận demo có thể thay đổi theo mùa mà không cần sửa ShanVerse.

## 6. Phía ShanVerse (phần việc nhỏ)

- Thẻ Cờ Lau trong `/games`, danh mục **Puzzle & Logic**.
- Trang `/games/co-lau`: iframe nhúng `/demo` + nút "Chơi bản đầy đủ" mở trang chủ Cờ Lau.
- Địa chỉ game đặt trong biến môi trường (ví dụ `NEXT_PUBLIC_COLAU_URL`). Đổi tên miền chỉ cần đổi biến này.
- ShanVerse **không** chứa database, đăng nhập hay code game.
