# T04.06 — Phúc Destiny

> Cập nhật: 11/11/2026 (thêm 8 Phúc của luật V2, Shan chốt)
> Trạng thái: **IMPLEMENTED**

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

## Phúc thêm ở luật V2 (20 tầng, từ chu kỳ 16/11/2026)

Shan chốt 11/11/2026: thêm 8 Phúc **chỉ dùng hook có sẵn**, không sửa lõi trận đấu. Run V1 không được offer các Phúc này. Tổng cộng dồn tối đa của 15 Phúc là 34, đủ cho 19 lần chọn thưởng của run 20 tầng.

| ID | Tên hiển thị | Nhóm | Hiếm | Cap | Hiệu ứng mỗi cộng dồn |
|---|---|---|---:|---:|---|
| `granary` | Kho lương | logistics | common | 3 | +15 lương **ngay khi chọn**, kẹp ở 100; không offer khi lương đã 100 |
| `vanguard` | Tiên phong | offensive | common | 2 | Thủ lĩnh +8% ATK |
| `professionUnity` | Đồng nghề | defensive | rare | 2 | Tướng cùng nghề thủ lĩnh (kể cả thủ lĩnh) +8% DEF |
| `lastStand` | Tử chiến | offensive | rare | 2 | Tướng vào trận dưới 50% máu tối đa +12% ATK |
| `rearGuard` | Hậu quân | vitality | common | 2 | Sau mỗi tầng **thắng**, tướng dự bị còn sống hồi 5% máu tối đa |
| `terrain` | Địa lợi | tactical | rare | 2 | Chuyển 2 điểm tỉ lệ sinh ô (1 từ ô vàng, 1 từ ô sách) sang ô hợp hệ thủ lĩnh |
| `recuperate` | Dưỡng sức | vitality | rare | 2 | Sau mỗi tầng **thắng**, ba tướng vừa ra trận còn sống hồi 4% máu tối đa |
| `mandate` | Quân lệnh | tactical | epic | 2 | Cả đội +5% ATK, DEF và máu tối đa; chỉ offer từ phần thưởng tầng 11 |

- Tên hiển thị của 7 Phúc MVP: Mài gươm (`atk`), Giáp dày (`def`), Cường thân (`hp`), Đồng hệ (`elementalEdge`), Trận giáp (`armoredFormation`), Tiếp tế (`supplyCache`), Trống trận (`battleDrum`). Văn bản ở `src/app/game/destiny/destiny-ui.ts`.
- Mọi % chỉ số của các Phúc vẫn **cộng với nhau rồi nhân một lần**, sau trang bị và cộng hưởng hệ.
- Điều kiện Tử chiến xét máu lúc **tạo trận** so với máu tối đa gốc (chưa tính Phúc máu), nên không đổi giữa trận.
- Hậu quân và Dưỡng sức là ngoại lệ có chủ đích của luật "dự bị không tự hồi" (D-08): chỉ có khi người chơi đã chọn Phúc, không hồi người đã gục, không hồi khi thua, và tầng cuối không còn tác dụng.
- Ô hợp hệ của Địa lợi: Kim và Hỏa là ô kiếm, Mộc là ô tim, Thủy và Lôi là ô âm dương, Thổ là ô bánh chưng, Phong là ô trống (theo ô tăng nhiều nhất của sân nhà sứ quân, `HOME_TERRAIN`). Tỉ lệ luôn giữ tổng 100 và biên 8–35; ô cho đã ở mức tối thiểu thì chuyển ít hơn.

## TODO mở rộng

- Đã thêm 8 Phúc ở luật V2 (bảng trên). Phúc tiếp theo chỉ thêm khi có hook battle được test và version hóa.
- Chưa thêm crit, crit damage, dodge hoặc stat không tồn tại trong battle core.
- Phúc thay đổi board, skill cost, food upkeep hoặc hiệu ứng theo turn cần pipeline modifier riêng; không nhét trực tiếp vào settlement.
- Khi effect v2 thay đổi balance, run đang tồn tại phải tiếp tục dùng version đã snapshot hoặc được migrate có chủ đích.
