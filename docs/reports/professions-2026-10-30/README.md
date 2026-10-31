# PROF — Bằng chứng tích hợp Xạ thủ và Sát thủ

> Cập nhật: 31/10/2026
> Trạng thái: **AUDIT** — bản triển khai đang review, chưa nghiệm thu phát hành.

## Mốc và phạm vi

Bắt đầu từ `develop` tại `97ebd36d158e21323e5e022eafa1718d49daf525`. Thông số theo [nguồn canonical 30/10/2026](../../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md). Giá 1.500 vàng/người được Shan chốt trong task này. Không sửa tài liệu Viễn Chinh, không xóa lịch sử, không thêm loại ô/tầm bắn/crit/tốc độ/hệ chiến đấu. Không merge tự động.

## Trạng thái theo phase

| Phase | Đã có | Chưa nghiệm thu |
|---|---|---|
| PROF-01 | 8 ID canonical, alias đọc `cungThu→xaThu`, ô công kích tách ô tài nguyên nghề, giữ nguyên 7 loại ô và trọng số; migration bag/loadout và snapshot JSON | Review migration trên dữ liệu staging thật; danh sách phát hành vẫn sáu nghề vì flag tắt |
| PROF-02 | 6 chiêu nghề, reuse hai chiêu mỗi hệ, 14 tuyệt chiêu, P1/P2/P3/P4, poison riêng, nguồn phản kích và guard | Review ngữ nghĩa phản ứng toàn bộ matrix, AI và cân bằng rộng |
| PROF-03 | 14 registry RB-062..075, builder đồng hành riêng, base stats/tăng cấp/gear/save, shop 1.500 vàng được gate | Chưa mở bán hoặc cấp miễn phí; chưa mở hai nghề cho Đinh Bộ Lĩnh |
| PROF-04 | Dùng portrait/rig/pose hiện có, nhãn nghề/poison/tooltips, fallback SVG khi thiếu icon vẽ tay | Chưa kiểm hình động bằng mắt trên desktop/mobile hoặc nghiệm thu vũ khí/VFX từng người |
| PROF-05 | Hồi quy suite cũ của Campaign/Trial/Destiny/Survival/Arena/Daily/normal/practice; test engine 20 chiêu trong 1v1/3v3 cấp 1/3/5 | Chưa chạy luồng người dùng mới với flag ON qua từng mode và staging; không coi hồi quy legacy là bằng chứng này |
| PROF-06 | Harness có seed/ghế/lượt đầu đối xứng và cohort smoke thật | Chưa chạy hết cấp 1/10/20/30 × chiêu 1/3/5 × gear 0/đại diện; chưa đủ breakdown đóng góp sát thương P1–P4 và chuẩn chấp nhận cân bằng |

## Kiểm tra đã chạy

- Full suite sau tích hợp: **856/856 pass**, 172 suites, không skip/cancel (141,6 giây). Suite này giữ flag OFF; không thay thế kiểm thử luồng phát hành flag ON.
- Typecheck pass trên cây tích hợp cuối. Lint pass, không warning. `docs:check` pass, bao gồm báo cáo này.
- Test action mới: 20 chiêu × cấp 1/3/5 × solo/team; giữ một tác động bàn cờ/action, recipient HP/F riêng, execute trước hit cuối, chặn hoàn năng lượng trên Khiên.
- Test dữ liệu/migration: 14 bộ 6+4, chỉ số cấp 1/10/20/30; lưu/đọc lặp, key va chạm, giữ đầu tư và snapshot; asset/tooltip render tự động.
- Chưa chạy production build, staging database thực hoặc kiểm UI bằng mắt. Không đổi trạng thái canonical thành IMPLEMENTED khi chưa merge.

## Mô phỏng đã chạy

Lệnh `node --import tsx scripts/profession-acceptance.ts --quick`, dữ liệu [smoke.json](smoke.json).

- 14 nhân vật × 1v1/3v3 × 2 ghế × 2 phe đi trước = **112 trận**, seed 31.
- Cấp nhân vật 20, kỹ năng 3, không gear, AI normal, giới hạn 160 lượt và 1.000 hành động.
- 0 trận censored; tối đa quan sát 10 phản ứng/action, sâu 4, không phát hiện năng lượng ngoài 0–100.
- Win rate mỗi nhóm chỉ có 4 trận, biến thiên 0–100%; CI95% Wilson lưu trong JSON. Mẫu này quá nhỏ để kết luận cân bằng; seed/ghế ghép cặp cũng không phải mẫu độc lập hoàn toàn.
- **Poison damage = 0 trong smoke AI.** Kiểm thử action đã ép cast/tick độc thật; cohort AI này chưa chứng minh AI sử dụng tuyệt chiêu Độc Ảnh trong trận thường. Cần cohort chuyên biệt và kiểm định utility trước khi phát hành, không tự sửa giá/hệ số canonical.
- Contributions trong JSON là **số lần phản ứng/cơ hội được dùng**, chưa phải lượng sát thương/hồi/Khiên đóng góp từng ô bị động. Energy là tổng sự kiện cả hai phe; stats trong JSON là trước hệ số HP solo.
- Harness mặc định không có `--quick` mở matrix cấp/chiêu/gear và hai seed; file `matrix.json` chỉ tồn tại sau khi chạy xong. Chưa coi matrix đó là đã chạy.

## Assets và fallback

Kiểm tự động thấy đủ portrait, các lớp rig và pose attack/cast/ultimate/down của cả 14 người. Registry rig/portrait có sẵn được tái sử dụng; không tạo lại hình hay sửa prompt vũ khí.

Thiếu `public/art/professions/xaThu.webp` và `satThu.webp`: dùng SVG công kích chính xác/dao găm trung tính, không tải ảnh lỗi và không mượn biểu tượng nghề khác. Skill icon mới dùng fallback vector theo các bước chiêu; chưa có bộ icon vẽ tay riêng được nghiệm thu. Portrait fallback không gán vũ khí nghề cũ cho người mới. Pose/VFX vẫn cần kiểm bằng mắt; tồn tại file không đồng nghĩa art đã đạt.

## Migration và giới hạn phát hành

Alias chỉ đổi namespace; không nhân đôi nghề. Khi key vũ khí va chạm, key canonical giữ ô đang mặc, món còn lại giữ nguyên trong túi. Save cũ giữ XP, điểm, vàng, đồ; parse lặp idempotent. Nghề Đinh Bộ Lĩnh cũ chưa hỗ trợ được giữ trong `unavailableLeaderProfession`; không tự tạo tuyệt chiêu mới. Snapshot chỉ chuẩn hóa trường nghề, không retune skill/HP/ATK/DEF/energy/seed/sequence. Không có bulk migration hay ghi lại lịch sử trên production.

**31/10/2026:** Shan quyết định đưa Xạ thủ và Sát thủ vào trận, `NEW_PROFESSIONS_ENABLED=true`. 14 đồng hành (RB-062..075) nằm trong `ALL_COMPANIONS`, bán ở shop 1.500 vàng, dùng được trong đội và các mode; trang xem thử không còn coi họ là xem thử. Đinh Bộ Lĩnh vẫn chỉ có sáu nghề cũ (`isLeaderProfession`), nên mọi chỗ chọn nghề cho Đinh Bộ Lĩnh (hằng ngày, thử thách, Tháp, harness mô phỏng) dùng `LEGACY_PROFESSIONS`. Full suite 856/856 pass và lint sạch với cờ BẬT. Các khoảng trống ở bảng phase (cân bằng matrix đầy đủ, poison trong AI, kiểm hình động/VFX bằng mắt, staging) vẫn chưa đóng; đây là quyết định phát hành, không phải bằng chứng nghiệm thu.
