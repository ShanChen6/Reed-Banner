# T05.04 — Thưởng đá mốc và chu kỳ Destiny

> Cập nhật: 11/11/2026 (thêm chính sách V2 cho 20 tầng, Shan chốt)

## Chính sách V2 (20 tầng, chu kỳ từ 16/11/2026)

Shan chốt 11/11/2026: **giữ tổng 18 đá mốc mỗi chu kỳ**, chia lại cho 20 tầng; không bơm thêm đá khi chưa có hệ cường hóa.

| Mốc tầng | 5 | 10 | 15 | 20 | Tổng |
|---|---:|---:|---:|---:|---:|
| Đá | 3 | 4 | 5 | 6 | 18 |

- Thưởng kết thúc chu kỳ theo tầng cao nhất: 0 tầng = 0; tầng 1–4 = 1; 5–9 = 2; 10–14 = 3; 15–19 = 4; tầng 20 = 5 đá.
- So với V1, người chỉ tới tầng 10 nhận 7 đá mốc thay vì 18 (Shan đã chấp nhận khi chọn phương án).
- Id mốc V2 là `floor-5-v2` … `floor-20-v2`, không trùng V1. Bảng mốc chọn theo `rulesVersion` của run; chu kỳ đã nhận mốc của version khác thì không phát thêm mốc.
- Cách nhận, receipt và tính nhất quán giữ như V1 bên dưới. Code: `destinyStoneMilestones`, `destinyCycleStoneReward` trong `src/core/tower/destinyStones.ts`.

## Chính sách V1 (10 tầng, chu kỳ trước 16/11/2026)

- Mốc tầng 3, 5, 10 lần lượt cấp 3, 5, 10 Đá Cường Hóa.
- Thưởng kết thúc cycle dựa trên tầng cao nhất, không dựa trên thứ hạng: 0 tầng = 0; tầng 1–2 = 1; 3–4 = 2; 5–9 = 3; từ tầng 10 = 5 đá.
- Thưởng cycle được tự nhận trong lần server đầu tiên đồng bộ sau khi cycle hết hạn. Không cần cron hay nút claim và không có thời hạn claim riêng.

## Tính nhất quán

Mỗi khoản dùng receipt theo `player + cycle + milestone`; thưởng cycle dùng receipt riêng của cycle. Cộng ví, ghi receipt và cập nhật tiến trình diễn ra trong cùng profile CAS. Vì vậy retry, reload, nhiều run trong cùng cycle và hai tab không thể cấp lặp.

Reward giữa tầng vẫn chỉ là hồi phục/Phúc/lương nội bộ run. Nó không chứa đá, vàng, EXP hoặc trang bị. Trial và Tower legacy không bị thay đổi.
