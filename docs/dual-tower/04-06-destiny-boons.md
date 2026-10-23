# T04.06 — Phúc Destiny MVP

Phúc chỉ tồn tại trong một Destiny run. Thứ tự chỉ số là: build/cấp → trang bị và cộng hưởng hệ → tổng phần trăm Phúc → làm tròn. Bonus năng lượng/nộ khí đầu trận là tạm thời và bị loại khỏi runtime khi settle để không cộng lặp qua tầng.

| ID | Nhóm | Hiếm | Cap | Effect v1 |
|---|---|---:|---:|---|
| `atk` | offensive | common | 3 | +10% ATK/stack |
| `def` | defensive | common | 3 | +15% DEF/stack |
| `hp` | vitality | common | 3 | +10% max HP/stack |
| `elementalEdge` | offensive | rare | 2 | +8% ATK/stack nếu cùng hệ thủ lĩnh |
| `armoredFormation` | defensive | rare | 2 | +8% DEF/stack nếu có trang bị |
| `supplyCache` | logistics | common | 2 | +10 energy đầu trận/stack |
| `battleDrum` | tactical | rare | 2 | +10 rage đầu trận/stack |

## TODO mở rộng

- Thêm tối đa 8 Phúc sau MVP chỉ khi có hook battle được test và version hóa.
- Chưa thêm crit, crit damage, dodge hoặc stat không tồn tại trong battle core.
- Phúc thay đổi board, skill cost, food upkeep hoặc hiệu ứng theo turn cần pipeline modifier riêng; không nhét trực tiếp vào settlement.
- Khi effect v2 thay đổi balance, run đang tồn tại phải tiếp tục dùng version đã snapshot hoặc được migrate có chủ đích.
