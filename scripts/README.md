# Script

Công cụ chạy tay, không nằm trong game. Chạy TypeScript bằng `pnpm exec tsx scripts/<tên>`; Python cần `ffmpeg`/`numpy`/`Pillow` tùy script (ghi ở đầu file). Mỗi file có hướng dẫn dùng ở mấy dòng đầu.

Nơi dùng trong quy trình: [quy trình test](../docs/07-architecture/quy-trinh-test.md) mục 4 (checklist trước phát hành).

| Nhóm | Script | Việc |
|---|---|---|
| Kiểm tra | `check-docs.ts` | `pnpm docs:check`: link, anchor, nhãn trạng thái tài liệu |
| | `ui-audit.mjs` | Kiểm kê giao diện 4 cỡ màn (tràn ngang, lỗi JS, vùng chạm, chữ nhỏ); `ui-mock-data.ts` sinh dữ liệu giả nhiều cho nó |
| | `trial-puzzle-qa.ts` | Kiểm nội dung Tháp Thí Luyện: registry hợp lệ, mỗi tầng có cặp tướng hợp luật và thắng được ở cấp chuẩn |
| | `trial-content-report.ts` | In bảng nội dung từng tầng Tháp Thí Luyện (đội hợp luật, tỉ lệ thắng mẫu, lý do thiết kế) |
| | `profession-acceptance.ts` | Bằng chứng nghiệm thu nghề Xạ thủ, Sát thủ |
| Mô phỏng cân bằng | `balance.ts` | `pnpm sim`: AI đấu AI, thời lượng và tỉ lệ thắng; có chế độ Đánh trùm, Sinh tồn |
| | `profession-balance.ts`, `special-balance.ts` | Vòng tròn 56 dựng nghề × hệ của Đinh Bộ Lĩnh; nhân vật đặc biệt so với 56 dựng đó |
| | `campaign-balance.ts` | Mọi nhiệm vụ có trận của Bình Loạn theo đúng cách server chốt |
| | `survival-v11-balance.ts` | Trấn Ải V1.1 |
| | `destiny-stone-sim.ts` | Tháp Thiên Mệnh và đá mỗi tuần |
| | `binh-phap-sim.ts` | Trận Đồ |
| | `tam-tuong-ky-sim.ts` | Tầm Tướng Ký |
| | `expedition-sim.ts` | Viễn Chinh |
| Dữ liệu và database | `export-skill-chase.ts` | Sinh `docs/03-characters/ky-nang/data/` từ code |
| | `migrate.mts` | `pnpm db:migrate`, chạy trước `pnpm build`; bỏ qua khi không có `DATABASE_URL` |
| | `neon-staging-audit.mts` | Đọc (không ghi) Neon staging: danh tính và số liệu tổng |
| Tranh và âm thanh | `cutout-formation-icon.py` | Cắt nền giả của icon thành nền trong suốt |
| | `make-music-loop.py` | Biến bản nhạc dài thành vòng lặp liền mạch (.ogg, .m4a) |
| | `slice-sfx.py` | Cắt tiếng đơn sạch nhất từ tệp âm thanh dài làm hiệu ứng |
| | `slice-voice.py` | Cắt tệp giọng đọc dài thành từng câu thoại nhân vật |

Script một lần cho một đợt việc thì xóa khi đợt đó xong, cùng báo cáo của nó ([quy định tài liệu](../docs/00-overview/quy-dinh-tai-lieu.md#5-thêm-chuyển-gộp-xóa-file)).
