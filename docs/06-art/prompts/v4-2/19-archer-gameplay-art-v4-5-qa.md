# Reed Banner — Báo cáo QA Cung thủ V4.5 (RB-062–RB-068)

> **29/10/2026** · Trạng thái: **HOÀN THÀNH TÀI LIỆU ĐỀ XUẤT / CHƯA BUILD ẢNH / CHƯA IMPLEMENT GAMEPLAY**. Nhánh `develop`.

## Nguồn hiện hành (sau khi chuyển cấu trúc docs)

- [Chiêu thức và định hướng gameplay — 08](./08-new-professions-14-skill-kits.md)
- [Character DNA & 84 prompts (42 Cung thủ + 42 Sát thủ) — 09](./09-14-heroes-character-and-frame-prompts-v4-3.md)
- Cơ chế đang chạy để đối chiếu: `src/core/battle/skills.ts`, `src/core/battle/chase.ts`, `src/core/battle/rules.ts`.

**Không dùng đường dẫn cũ** `docs/design/v4-2`; tài liệu art đã chuyển vào `docs/06-art/prompts/v4-2`. Phần 7 Sát thủ RB-069–075 giữ nguyên bản gốc.

## Quyết định gameplay / art direction

1. **Đánh thường không nhất thiết bắn**: đá tống, quét chân, thúc gối, chỏ, đẩy tay, gạt tay, đổi trụ — nhịp ngắn để giữ khoảng cách với mục tiêu chưa xuất hiện trong sprite.
2. **Ra chiêu (frame 3):** luôn thể hiện `Khoan Giáp Tiễn` / `role_cungThu_khoanGiap` với cú bắn một tên vào khe giáp; cách ngắm và tấn chân riêng theo từng tướng.
3. **Tuyệt chiêu (frame 4):** kỹ năng cá nhân ô 4 của từng tướng, khác biệt về **thấp/cao**, **góc thân**, **trọng tâm**, **vector bắn**, **cách nâng cung/nỏ**.
4. **Weapon DNA không đổi**: chính xác một cây cung/nỏ canonical; không thêm dây đeo, cung/nỏ dự phòng, dây cung làm roi hoặc vật liệu mới. Cung uốn cong tự nhiên khi kéo dây, thân nỏ/cơ cấu cò không biến dạng. Không áp đặt bàn tay nắm sai để đuổi theo pose.
5. **Đánh thường kiểu cận chiến chỉ là animation/art**: trong match-3 hiện tại, không tự tồn tại tầm cận chiến, cự ly va chạm, sát thương tay/chân hoặc animation theo khoảng cách. Mọi thay đổi luật cần thiết kế riêng sau khi duyệt.
6. **Skill numbers = proposal**: hệ số, cost, damage, shield, freeze, burn, destroy, energy và whirl là điểm xuất phát, **chưa mô phỏng cân bằng** và chưa đăng ký 2 nghề vào `src/core/battle/skills.ts`.
7. **4 bị động không phải 5**: theo chú thích trong `chase.ts`, engine hiện tính 1 cơ hội chuẩn bị + 3 chase. Phương án mới cho Cung thủ là 1 cơ hội nghề + 1 chase nghề + 1 chase hệ + 1 chase cá nhân (**thay thế chase hệ thứ hai**, chưa code). Nếu muốn giữ cả hai chase hệ phải bỏ chase cá nhân hoặc thống nhất luật 5 ô; không tự cộng dồn.

## Ma trận khác biệt đã được áp dụng

| Nhân vật | Frame 2 — Đánh thường | Frame 3 — Ra chiêu | Frame 4 — Tuyệt chiêu |
|---|---|---|---|
| Bạch Nỏ Lang | Đá tống ngắn, nỏ ôm trước ngực | Bắn ngang chắc tay | Quỳ một gối ghì nỏ phá thành |
| Thanh Lâm Xạ | Quét chân và lách người | Bắn khe giáp tầm vai | Hạ người khóa lối rút từ sườn |
| Lam Giang Nỗ | Thúc gối, nỏ nấp sát ngực | Bắn tầm ngang sát vai | Nửa quỳ ngắm chéo thấp điểm neo |
| Xích Diệm Tiễn | Thúc khuỷu, cung giữ dọc | Bắn ngắm đơn chính xác | Thế cao chéo rộng ra lệnh loạt tên |
| Trấn Sơn Cung | Đẩy tay giữ khoảng cách | Bắn trụ vững | Hạ cung chắn đường xung phong |
| Lôi Minh Xạ | Gạt cẳng tay, cung thấp | Ngắm chéo nông | Xoay thân bắn chéo cao sau hiệu chuông |
| Tật Phong Tiễn | Đổi trụ quét chân | Dừng nhịp ngắm | Bước lùi chéo vừa bắn, không bản sao |

## Kết quả kiểm tra tự động theo Markdown

| Mục | Kết quả |
|---|---|
| Cung thủ | **7/7** |
| Prompt Cung thủ | **42/42** |
| Mỗi prompt độc lập có mặt/áo/Weapon ID/Color DNA | **7/7 hồ sơ đạt** |
| Khung 2 ghi đòn không bắn | **7/7** |
| Khung 3 ghi ID `role_cungThu_khoanGiap` | **7/7** |
| Khung 4 ghi ID tuyệt chiêu riêng | **7/7** |
| 4 ô bị động đề xuất trong skill kit | **7/7** |
| Tổng 14 nhân vật trong file prompt chung | **14/14** |
| Tổng 6 khung × 14 nhân vật | **84/84** |

**Lưu ý về phạm vi kiểm chứng:** Việc kiểm bằng văn bản không xác thực được rằng công cụ tạo ảnh sẽ dựng đúng anatomy, góc kéo dây, vị trí tên và chuyển động tự nhiên. Cần nghiệm thu từng ảnh so với Master trước khi chốt asset.

## Chốt thay đổi / phạm vi bảo vệ

- **Đã thay:** 7 định hướng gameplay, 7 bảng kỹ năng chủ động/bị động, 42 prompt Cung thủ; sửa một số câu có nguy cơ gây lỗi tay và số lượng vật thể.
- **Không đổi:** bảy Weapon DNA, diện mạo, y phục, màu hành; bảy Sát thủ RB-069–075; toàn bộ RB-001–061 và RB-076–078; không sửa code, không tạo ảnh.
- **Các mục cần mô phỏng nếu triển khai sau:** cap truy kích và stacking P4, nguồn `shieldAbsorbed`/ `healed`, tần suất mất năng lượng, burn AoE, interaction `whirl`/cascade và tương tác ô match-3.

## Kiểm thử ảnh thủ công đề xuất sau này

Bắt đầu bằng **Bạch Nỏ Lang** ở ba khung 2/3/4 trên cùng một Weapon Reference: basic phải là **đá tống không bắn**, chiêu nghề là **đứng ngắm**, ultimate là **quỳ ghì nỏ**. Nếu ảnh lặp hoặc tay bị ghép, ưu tiên thay đổi hình bóng tư thế theo Master trước, **không giải phẫu hóa quá mức mô tả ngón tay**. Khi ổn định có thể kiểm thử lần lượt sáu nhân vật tiếp theo.
