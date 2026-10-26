# 12 — Liệt Truyện: Test strategy, rollout và task roadmap

> Implementation chạy ở PR độc lập **sau LT-00 design freeze**. Task docs-only cho tới khi sản phẩm duyệt cơ chế.

## Roadmap

| Task | Scope | Dependency | Nghiệm thu |
|---|---|---|---|
| LT-00 | Audit nhân vật, art, 7 hệ + chốt ruleset, recipes và hint, ADR | Docs này | Decision table approved/proposed, rulebook freeze |
| LT-01 | Thiết kế catalog slice **3 nhân vật** + validation graph | LT-00 | No conflicts/cycles/unreachable; lore/portrait checked |
| LT-02 | Pure combination engine, reducer, unit/property tests | LT-01 | Pair order independent, repeat idempotent, invalid no mutation |
| LT-03 | UI Vạn Vật Lục, Đài Hợp Nguyên, Tướng Lục, mobile/touch | LT-02 | A11y + snapshot desktop/mobile |
| LT-04 | Offline/local save/resume/version/migration/tutorial/hints | LT-03 | Fallback safe, guest flow verified, no server rewards |
| LT-05 | Mở nội dung lên 10–12 hero / 30–50 intermediate nodes (đề xuất) | LT-01/04 | Pack tested, balanced, historical and art audit |
| LT-06 | Nếu approve: account progress, verified economy/achievements, release flag | LT-05 | Security/economy review, idempotent receipts, migration |
| LT-07 | Regression và phát hành theo feature flag | LT-04/05/06 optional | QA pass, rollback plan, not gameplay regression |

**Thứ tự chiến lược:** Binh Pháp tiếp tục là luồng thiết kế trước; Liệt Truyện bắt đầu như một mini game **low-art-cost** sau khi P0 engine/asset strategy rõ ràng. Không tạo thêm nhân vật hoặc storyboard chỉ để thử ghép.

## Pure engine tests

- Starter seed có đúng 7 hệ, không bị tiêu hao khi ghép.
- `A+B` = `B+A`; `A+A` khi có recipe vs không recipe.
- Nhập ID giả hoặc yếu tố chưa khám phá => invalid, không cập nhật progress.
- Trùng canonical recipe key => registry fail.
- No recipe => no mutation.
- Recipe lặp => returned `alreadyKnown`, không tăng count/reward/achievement.
- `A+B` tạo node có thể dùng tiếp và tiến trình được mở; character terminal theo v0.1.
- Completed pack dựa vào danh sách `characterIds` đã publish, không dựa tổng danh sách trong source dev.
- Bộ 3 ví dụ Châu Ngọc, Tô Kim, Vi Triều có thể khám phá từ starter bằng những nhánh hợp lệ.
- Test collision & cycle & unreachable & pack dependency / migration.
- Không duplicate discovery khi hai tab gửi đồng thời nếu có backend; server receipt idempotent.

## Content/gameplay research

- Đếm số tổ hợp khả dụng theo mỗi mốc mở; ghi độ sâu nhỏ nhất để đạt 3/10 nhân vật.
- Thử agent tìm kiếm (bfs/guided/naive) đo số thao tác ghép tới tướng đầu, tới hết slice.
- Hạn chế graph tuyến tính dài mà không có kết quả trung gian đáng giá; tránh nghiệm có quá nhiều dead-end.
- Kiểm tra hint không spoil toàn bộ sách quá sớm, không “paywall” hints trong MVP.
- Không tạo quy tắc ngẫu nhiên gây cảm giác ghép vô lý; recipe phải có lý do biểu trưng đọc hiểu được.

## UI/E2E

- Click/touch/drag/keyboard, fast double click, browse back, resume, reload, offline guest.
- 320/390/768/1024/1440 px, screen reader output, reduced motion.
- Placeholder portrait/missing icon; không leak unearned name trong aria.
- Tab filter với từ khóa tiếng Việt, không áp category filter làm mất selected inputs.
- Kết quả khám phá không thưởng tướng, không đổi profile/coins/gear.

## Economy hard gate

Nếu mở reward/chiêu mộ tương lai:
- Không sử dụng client `discoveredNodeIds` để cấp vàng/tướng.
- Server kiểm tra `recipeId`, inputs đã mở, publish version, auth/nonce; transactional idempotent receipt.
- Replay/duplicate/migration tests + rate limit.
- Điểm / số trang đã tìm không được xem là điều kiện sở hữu hero mặc định.

## Trạng thái hiện tại

- [x] Concept và tài liệu draft.
- [ ] LT-00 sign-off.
- [ ] Engine/tests.
- [ ] UI/asset approved.
- [ ] Persistence.
- [ ] Release.

**No production changes in this docs PR.**
