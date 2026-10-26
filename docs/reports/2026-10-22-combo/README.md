# Dữ liệu kỹ năng phiên bản 2 / combo đồng đội

[Báo cáo](../2026-10-22-combo.md) · [Thiết kế và chuyển hồ sơ](../../03-characters/ky-nang/lich-su/21-combo-dong-doi.md) · [Ma trận 61 nhân vật](roster-matrix.md).

## Các tệp

- `catalog.json`: 61 nhân vật và 13 preset chiến dịch; nghề/hệ, mẫu bị động và kỹ năng sáu ô lấy từ dữ liệu thực.
- `screen/focused/campaign-on/off.jsonl.gz`: 3.120 quan sát chính ghép cặp. `off` xóa bị động phối hợp khỏi FighterConfig **trước khi tạo trận**, các thông số khác giữ nguyên. Spirit luôn A, cap120 lượt thường tổng, tối đa60/phe. Censored không coi là hòa/kết thúc tự nhiên.
- `summary.csv`, `modes.csv`, `passives.csv`: số mẫu, thắng/thua/cap, Kaplan–Meier, tài nguyên và cơ hội mở/dùng/hết hạn/bị phá/còn cuối mẫu. CSV dùng LF. Log kiểm tra `.txt` được chuẩn hóa kết thúc dòng và bỏ khoảng trắng cuối dòng; không đổi thông báo hoặc kết quả.
- `paired-comparisons.json`: 2.000 bootstrap theo seed bàn thật; hai thứ tự cùng cụm. Thời lượng bị chặn tại cap không phải thời điểm kết thúc của trận censored.
- `validation.json`: bất biến nguồn mẫu và combo; 736 cặp solo trùng hoàn toàn kết quả, counts, kỹ năng và lương. Combo là tương tác đồng đội, không tự tăng sức mạnh solo.
- `pre-dispel-*.jsonl.gz`, `ai-before-dispel.txt`, `pre-dispel-source-sha256.json`: giữ lần chạy đầu trước khi sửa AI định giá Xua tan cơ hội. Đây là dữ liệu trung gian, **không cộng** vào cỡ mẫu chính hoặc gộp với kết quả cuối.
- `ai-revision-reuse.json`: sửa duy nhất việc chấm bước `dispel`, cộng giá trị cơ hội còn sẵn. Chạy lại236 case ON screen +35 ON focused. Mọi OFF không có cơ hội; ON không có người mang bước dispel không đi vào nhánh đổi; ON chưa từng mở cơ hội giữ đúng chuỗi cũ theo quy nạp vì giá trị mới luôn0. Vì vậy dùng lại2.849 quan sát không bị ảnh hưởng; giữ lý do theo từng case. Không dùng kết quả trận từ thí nghiệm Spirit cũ làm đối chứng mới.
- `trace-manifest.json`, `trace-*.json.gz`: 4 tiêu chí × ON/OFF, replay không cộng vào n. Script kiểm tra lại kết quả, lượt, damage/heal/shield/absorption/starvation và số dùng combo trùng quan sát chính.
- `trace-counterfactuals.json`: với mỗi hành động thực sự dùng combo, sau khi AI chọn mới chạy thêm bản sao cùng trạng thái/seed và cùng hành động nhưng bỏ cơ hội của người hành động. Không đưa kết quả phản thực cho AI. Ghi cast chỉ hợp lệ nhờ giảm giá, KO tăng thêm trong hành động, HP/sustain chênh. Đây là phân tích cục bộ của hành động, không phải kết quả toàn trận nếu người chơi chọn kế hoạch khác.
- `browser.txt`, ảnh `*-combo-ready.png`: Chromium desktop/mobile; fixture chỉ chặn route trong context Playwright, không thêm endpoint test vào ứng dụng.
- `source-sha256.json`, `data-sha256.json`: định danh nguồn và dữ liệu; các báo cáo Spirit cũ thuộc PR #108, không sửa lại số liệu lịch sử cho code mới.

## Tái lập

Node >=22, pnpm10.28.0; chạy từ gốc repository:

```sh
pnpm exec tsx scripts/combo-catalog.ts
pnpm exec tsx scripts/combo-audit.ts --group pilot --mode on
pnpm exec tsx scripts/combo-audit.ts --group pilot --mode off
pnpm exec tsx scripts/combo-audit.ts --group screen --mode on --shard 0 --shards 2
pnpm exec tsx scripts/combo-audit.ts --group screen --mode on --shard 1 --shards 2
pnpm exec tsx scripts/combo-audit.ts --group focused --mode on
pnpm exec tsx scripts/combo-audit.ts --group campaign --mode on
# Lặp ba nhóm chính cho mode off; screen có hai shard.
python3 scripts/analyze-combo-audit.py /workspace/combo-audit
pnpm exec tsx scripts/combo-traces.ts
pnpm exec tsx scripts/browser-combo-audit.cjs
```

Ghi stdout từng lần vào `<group>-<mode>-<shard>.jsonl` trong thư mục đưa cho script phân tích. Kết quả full-run bằng code AI cuối có thể tái lập trực tiếp, không bắt buộc dùng lại dữ liệu trung gian hoặc chạy refinement. `refine-combo-audit.ts` dành riêng cho lần sửa AI đã lưu, đọc `pre-dispel/` và chỉ chạy lại các case bị ảnh hưởng; không tái sử dụng cách chứng minh đó cho thay đổi AI/gameplay khác.

Pilot24 case mỗi mode,3vs3 cấp20, không cộng vào mẫu chính. Nhóm screen đủ6 nghề ×7 hệ ×4 cấp9/10/15/20 ×2 mode1vs1/3vs3 ×2seed ×2thứ tự. Nhóm focused gồm128 spirit cases +64 pressure cases (Binh lính/Y sư vs tấn công, nhiều hồi, Y sư mirror). Campaign gồm Phong Châu/Tam Đái, hai đội hình,3seed ×2thứ tự, không đồ. Không đổi lương, chỉ số trùm hoặc luật Spirit giữa hai mode.

Các mẫu ở cùng seed không độc lập; campaign chỉ3 cụm. Cỡ mẫu không chứng minh cảm giác chơi, cân bằng mọi cặp tướng hoặc khả năng AI lập kế hoạch combo nhiều lượt. Không quy đổi lượt thành phút chơi.
