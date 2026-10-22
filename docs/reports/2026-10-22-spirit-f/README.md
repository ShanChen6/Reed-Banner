# Dữ liệu bổ sung phương án F

Đọc [báo cáo](../2026-10-22-tinh-than-F.md) để biết phạm vi, kết luận và giới hạn. Dữ liệu cũ giữ nguyên trong [đợt A–E](../2026-10-22-spirit/).

- `pilot-F.jsonl`, `pressure-pilot-F.jsonl`: pilot ngân sách; telemetry giai đoạn đầu chưa dùng cho thống kê hoặc phép đối soát chính.
- `reuse-source-verification.json`: đối chiếu SHA-256 trước khi sửa F.
- `replay-equivalence.json`: đối chứng chạy lại phải trùng kết quả, counts, kỹ năng, đội hình, seed và lương với dữ liệu cũ; bỏ qua thời gian chạy máy và telemetry mới.
- `reuse-manifest.json`: số chạy mới và các nguồn dùng lại. `screen-D/E/F.jsonl.gz` chứa 506 trận chạy mới + 838 kết quả A kết thúc trước lượt 25; trường `reusedFrom` phân biệt rõ.
- `summary.csv`, `groups.csv`: thắng/thua/chạm cap, trung vị/P90 Kaplan–Meier và các chỉ số tài nguyên. Hòa tự nhiên bằng 0; cap không gộp vào thua/hòa. Lượt mỗi phe trong bảng tổng = tổng lượt thường / 2; cột focal/opponent lưu từng phe thực tế.
- `paired-comparisons.json`: bootstrap 2.000 lần theo seed bàn thực tế; hai chiều đi trước cùng cụm. `restrictedDuration` là thời lượng bị chặn tại cap, không giả định trận censored đã kết thúc.
- `phases.csv`: dùng vòng chung `ceil(lượt tổng/2)`, các khoảng trước25,25–33,34–43,44+. Sàng lọc chỉ 506 trận có telemetry mới; 838 trận còn lại kết thúc trước25 nên đóng góp **0** cho mọi khoảng sau25. Không so trực tiếp tổng trước25 của sàng lọc với một tập đầy đủ. Một phe có thể còn ở lượt43 khi phe kia bắt đầu44; vì vậy D vẫn có thể cấp chút Khiên trong vòng44 cho người nhận chưa tới lượt44. `trace-receiver-windows.csv` phân mốc chính xác theo lượt riêng của người nhận trong từng trace.
- `recipient-support.csv`: nghề **người nhận**, không phải người tung kỹ năng. Khóa `nghề:phase` ghi hồi/Khiên mới; khóa chỉ nghề ghi hấp thụ/hết hạn của các khoản Khiên theo FIFO. Dùng `phases.csv` để xét thời điểm hấp thụ thực tế.
- `skill-sustain-value.csv`: hồi tức thì và Khiên gia tăng từ một lần cast; Khiên tiêu thụ quy FIFO cho các khoản gia tăng, refresh giữ khoản cũ. `zeroImmediate` chỉ là không sinh hồi/Khiên tức thì, **không** đồng nghĩa vô dụng: buff, giải hiệu ứng, regen, khiêu khích và tiết kiệm lương chưa được quy ra HP phản thực.
- Khiên đối soát: cấp gia tăng = hấp thụ + hết hạn/bị gỡ + còn khi người nhận gục + còn cuối mẫu. `nonStackLost` là phần không cộng dồn theo luật max, không phải Khiên từng được cấp rồi bị thay thế. Engine không phát lý do riêng cho expiry/dispel nên gộp hai loại này. Phần còn sống cuối trận không tự coi là phí.
- `trace-manifest.json`, `trace-*.jsonl.gz`, `trace-windows.csv`, `trace-receiver-windows.csv`: trace theo tiêu chí định trước; replay trace không cộng vào cỡ mẫu chính.
- `*-late-floor.png`, `browser.log`: fixture chỉ trong Playwright, không có endpoint hoặc tùy chọn production để bật F.

Tái lập từ thư mục repo, dùng Node >=22 và pnpm10.28.0:

```sh
pnpm exec tsx scripts/spirit-f-audit.ts --group pilot --rule F
pnpm exec tsx scripts/spirit-f-audit.ts --group screen --rule F --shard 0 --shards 2
pnpm exec tsx scripts/spirit-f-audit.ts --group screen --rule F --shard 1 --shards 2
pnpm exec tsx scripts/spirit-f-audit.ts --group spirit --rule F
pnpm exec tsx scripts/spirit-f-audit.ts --group focused --rule F
pnpm exec tsx scripts/spirit-f-audit.ts --group pressure --rule F
pnpm exec tsx scripts/spirit-f-audit.ts --group campaign --rule F
pnpm exec tsx scripts/spirit-f-audit.ts --group campaign-gear --rule F
AUDIT_ONLY_FIXTURE=1 AUDIT_RULE=F pnpm exec tsx scripts/browser-spirit-audit.cjs
python3 scripts/analyze-spirit-f.py /workspace/spirit-f
python3 scripts/trace-spirit-f.py
python3 scripts/receiver-spirit-f.py
python3 scripts/plot-spirit-f.py
```

Lặp screen cho D/E; spirit/focused/pressure cho A/D/E; campaign-gear cho D. Ghi stdout đúng tên `<group>-<rule>-<shard>.jsonl` vào thư mục đưa cho script phân tích. Campaign A/D/E và gear A/E đọc trực tiếp dữ liệu cũ. Cap luôn120 lượt thường tổng, tối đa60/phe; lượt thêm không tiêu thêm cap hoặc giảm Tinh thần. `trace` nhận ID đầy đủ; `focused` dùng thêm seed3119,4567,6079,7919. Các preset không có trang bị; riêng campaign-gear là ba món trắng cùng hệ của phe người chơi, giữ nguyên phía trùm.
