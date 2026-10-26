# T05.03 — Destiny leaderboard theo chu kỳ

## Xếp hạng

Mỗi tài khoản có tối đa một best row trong một `cycleId`. Thứ tự authoritative:

1. `cleared_floor` giảm dần;
2. `total_turns` tăng dần;
3. `completed_at` tăng dần;
4. `owner_id` tăng dần, chỉ để phân trang có thứ tự ổn định.

Settlement gửi `matchId` làm `event_id`. Store chỉ thay row khi kết quả mới tốt hơn theo ba tiêu chí công khai;
gửi lại cùng event hoặc kết quả kém hơn không đổi row.

## Lịch sử và phân trang

Rows không bị xóa khi cycle đổi, nên API có thể đọc cycle lịch sử bằng `?cycle=YYYY-MM-DD`. `cursor` hiện là
offset số nguyên không âm và `limit` nằm trong 1–50. Response không trả `ownerId`; tài khoản chưa có tên dùng nhãn
`Khách xxxx` từ bốn ký tự cuối.

## Index và migration

Migration `0008` tạo bảng riêng `destiny_leaderboard_scores`, không sửa `leaderboard_scores` của Tower legacy.
Primary key `(cycle_id, owner_id)` giữ một best row; `event_id` unique hỗ trợ dedup. Index
`destiny_leaderboard_rank_idx(cycle_id, cleared_floor, total_turns, completed_at, owner_id)` lọc một cycle và hỗ trợ
sort/pagination. Nếu dữ liệu một cycle tăng đủ lớn để offset pagination thành nút thắt, bước nâng cấp là cursor keyset
chứa đủ bốn trường tie-break; không cần đổi dữ liệu hay luật xếp hạng.
