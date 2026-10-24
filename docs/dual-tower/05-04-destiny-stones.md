# T05.04 — Thưởng đá mốc và chu kỳ Destiny

## Chính sách V1

- Mốc tầng 3, 5, 10 lần lượt cấp 3, 5, 10 Đá Cường Hóa.
- Thưởng kết thúc cycle dựa trên tầng cao nhất, không dựa trên thứ hạng: 0 tầng = 0; tầng 1–2 = 1; 3–4 = 2; 5–9 = 3; từ tầng 10 = 5 đá.
- Thưởng cycle được tự nhận trong lần server đầu tiên đồng bộ sau khi cycle hết hạn. Không cần cron hay nút claim và không có thời hạn claim riêng.

## Tính nhất quán

Mỗi khoản dùng receipt theo `player + cycle + milestone`; thưởng cycle dùng receipt riêng của cycle. Cộng ví, ghi receipt và cập nhật tiến trình diễn ra trong cùng profile CAS. Vì vậy retry, reload, nhiều run trong cùng cycle và hai tab không thể cấp lặp.

Reward giữa tầng vẫn chỉ là hồi phục/Phúc/lương nội bộ run. Nó không chứa đá, vàng, EXP hoặc trang bị. Trial và Tower legacy không bị thay đổi.
