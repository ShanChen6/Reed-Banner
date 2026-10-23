# T00.02 — Chốt luật Song Tháp

Design-only. Dựa trên [00-01-audit.md](./00-01-audit.md). Mọi con số ghi **[TBD]** hoặc **[TEST]** chưa được duyệt, không được coi là balance chính thức. Nâng cấp trang bị nằm ở [equipment-enhancement-todo.md](../design/equipment-enhancement-todo.md) (GEAR-01–08), ngoài phạm vi.

## 1. Thuật ngữ

| Từ | Nghĩa |
|---|---|
| Đá Cường Hóa ("đá") | Tiền tệ **tài khoản**, số nguyên ≥ 0. V1.0 chỉ được cộng, không có API tiêu. |
| Reward nội bộ run | Heal / Lương / Phúc chọn giữa tầng Destiny. Mất khi run kết thúc, không bao giờ là đá. |
| Active | 3 tướng ra trận ở một tầng (battle 3v3). |
| Roster khóa | Danh sách tướng bị đóng băng lúc bắt đầu một run Destiny. |
| Thủ lĩnh | Đinh Bộ Lĩnh (`MAIN_ID = "dinhBoLinh"`), luôn ở active slot thủ lĩnh. |
| Tower cũ | `profile.tower` (`best`, `run`) và board `tower`. Giữ nguyên, gọi là **Legacy**. |

## 2. Bảng luật chung

| # | Luật |
|---|---|
| C1 | Battle là 3v3; **không đổi tướng trong trận** (cả hai mode). Thay tướng chỉ xảy ra ở phase chuẩn bị, trước khi tạo trận. |
| C2 | Đinh Bộ Lĩnh bắt buộc ở active slot thủ lĩnh; không thể bị bỏ ra khỏi active. |
| C3 | Trước mỗi tầng được đổi nghề và hệ của Đinh Bộ Lĩnh; lựa chọn phải hợp luật tầng, kiểm tra ở server. Lựa chọn hợp lệ cuối cùng ghi vào hồ sơ như `createTowerBattle` đang làm. |
| C4 | Đội active phải hợp luật tầng (xem §3.2, §4.2). Server là nguồn xác thực; client chỉ gợi ý. |
| C5 | Chỉ dùng tướng đang sở hữu. Tướng không sở hữu bị từ chối, không lặng lẽ bỏ qua (khác `towerTeam` hiện tại). |
| C6 | Trận Trial/Destiny **không** phát vàng, EXP hay trang bị rơi, kể cả qua `applyRewards`/`rollDrop`. Phần thưởng duy nhất là đá tài khoản. |
| C7 | Đá chỉ tăng, số nguyên ≥ 0, mỗi khoản thưởng có khóa idempotent (một lần cho mỗi điều kiện). |
| C8 | Ngày/tuần tính theo giờ Việt Nam (UTC+7); tuần bắt đầu thứ Hai 00:00. |
| C9 | Không đụng `tower.best`, `tower.run`, board `tower`, `a.tower10/25`, `w.tower10`. Song Tháp dùng state và board mới song song (xem §7). |
| C10 | Không thêm `enhanceLevel`, không đổi chỉ số bằng đá, không đổi luật ghép trang bị. |

## 3. Trial — Tháp Thí Luyện

### 3.1 Bảng luật

| Mục | Luật |
|---|---|
| Số tầng | 20, thiết kế cố định ở bản đầu (nội dung từng tầng do task thiết kế/balance sau; không sinh từ seed run). Số tầng **[TBD nội dung]**. |
| Mở tầng | Phải thắng tầng N mới mở N+1. Tiến trình vĩnh viễn: `trialCleared` (tầng cao nhất đã qua). |
| Thử lại | Đánh lại tầng đã qua tùy ý; không giới hạn lượt. |
| Reset mỗi lần thử | HP và lương về mức khởi đầu mỗi lần thử (một "lần thử" = một trận một tầng). Không mang phúc/HP giữa các tầng. Mức khởi đầu **[TBD]**. |
| Đội | Tự do chọn 3 active từ tướng sở hữu (gồm Đinh Bộ Lĩnh ở slot thủ lĩnh + 2 tướng kèm khác nhau), hợp luật tầng. Không dùng `profile.team` mặc định nếu không hợp luật. |
| Thưởng lần đầu | Mỗi tầng thưởng đá **một lần duy nhất** khi qua lần đầu. Lượng đá **[TBD]**. |
| Đánh lại | Không thưởng đá. |
| Quét | Nhận Đá Cường Hóa, **một lần/ngày** (ngày VN). Điều kiện đủ để quét và lượng đá **[TBD]**; quét không chạy trận, không thưởng gì khác. |
| Thua | Trận kết thúc; không mất tiến trình, không mất đá. |
| Bỏ trận giữa chừng | Tính là thua (trận bị hủy/hết hạn); không thưởng. |

### 3.2 Luật tầng
Mỗi tầng có thể khai báo ràng buộc (hệ, nghề, giới hạn tướng...). Danh sách ràng buộc cụ thể **[TBD]**; cơ chế: tầng có `rules` thuần dữ liệu, server `validateLineup(rules, team, leaderChoice)` trả hợp lệ/từ chối kèm lý do.

### 3.3 Phase

| Phase | Nghĩa |
|---|---|
| `Idle` | Chưa có thử nào đang diễn ra. |
| `Prep` | Người chơi chọn tầng, 3 active, nghề/hệ thủ lĩnh. |
| `InBattle` | Đã tạo trận, khóa đội. |
| `Settled` | Trận xong, kết quả đã áp (thưởng lần đầu nếu có). Quay về `Idle`. |

Trial không cần lưu run dài hạn: chỉ lưu tiến trình vĩnh viễn, mốc thưởng đã nhận, ngày quét gần nhất, và trận đang chạy (qua `MatchRecord`).

### 3.4 Transition

| Từ | Sự kiện | Điều kiện | Đến | Hiệu ứng |
|---|---|---|---|---|
| Idle | chọn tầng | tầng ≤ `trialCleared + 1` | Prep | — |
| Prep | bắt đầu | đội hợp luật (C2–C5) | InBattle | ghi nghề/hệ; tạo trận; đặt HP/lương reset |
| InBattle | thắng | — | Settled | nếu tầng chưa nhận thưởng: +đá một lần, ghi mốc; cập nhật `trialCleared` |
| InBattle | thua | — | Settled | không đổi gì |
| Settled | — | — | Idle | — |
| Idle | quét | chưa quét hôm nay (VN) và đủ điều kiện **[TBD]** | Idle | +đá, ghi ngày quét (atomic) |

Settle phải idempotent: settle lặp cùng trận không cộng đá lần hai (khóa theo id trận và theo mốc tầng).

## 4. Destiny — Tháp Vận Mệnh

### 4.1 Bảng luật

| Mục | Luật |
|---|---|
| Chu kỳ | Mặc định 7 ngày, bắt đầu thứ Hai 00:00 VN. Độ dài **[TEST]** (cấu hình được). |
| Luật tầng | Cố định trong cả chu kỳ, sinh xác định từ id chu kỳ (không đổi giữa chừng). Nội dung luật **[TBD]**. |
| Run | Một run hoạt động mỗi người mỗi chu kỳ [giả định, xem D-04]. |
| Roster khóa | Lúc bắt đầu run chọn roster từ tướng sở hữu, tối đa **8** **[TEST]**, bắt buộc có Đinh Bộ Lĩnh. Khóa suốt run, không thêm/bớt. |
| Active | Mỗi tầng chọn 3 active từ roster (thủ lĩnh bắt buộc), hợp luật tầng. Được thay tướng **giữa các tầng**, không trong trận. |
| HP / lương | Xuyên tầng, HP theo **id tướng** (không theo vị trí). Tướng ở dự bị giữ nguyên HP, **không hồi tự động**. |
| Tướng ngã | HP 0 = ngã, không thể ra trận cho tới khi được hồi bằng lựa chọn trong run. |
| Reward giữa tầng | Chọn 1 trong: Hồi phục (heal), Lương, Phúc. Đây là reward nội bộ, **không có đá**. Phạm vi/lượng hồi **[TBD]**. |
| Phúc | Cộng dồn đến hết run. Danh sách/giá trị **[TBD]** (code cũ: atk/def/hp). |
| Đá | Thưởng tài khoản theo **mốc tầng** trong chu kỳ và **mốc chu kỳ** khi kết thúc. Lượng **[TBD]**. Mỗi mốc nhận một lần. |
| Thất bại | Xem §4.5. |

### 4.2 Hợp lệ đội theo tầng
Giống Trial (C2–C5) cộng điều kiện: mọi active phải còn sống (HP > 0) và thuộc roster khóa. Nếu không tìm được đội 3 hợp lệ → ngoại lệ ở §4.5.

### 4.3 Phase

| Phase | Nghĩa |
|---|---|
| `NoRun` | Chưa có run trong chu kỳ hiện tại. |
| `RosterSelect` | Chọn roster khóa (có thể gộp với bước xác nhận bắt đầu). |
| `Prep` | Chuẩn bị tầng: chọn 3 active, nghề/hệ thủ lĩnh. |
| `InBattle` | Trận đang chạy, đội khóa. |
| `Reward` | Thắng tầng, phải chọn reward nội bộ. |
| `Ended` | Run kết thúc (thua, bỏ, hoàn thành, hoặc hết chu kỳ). |

### 4.4 Transition

| Từ | Sự kiện | Điều kiện | Đến | Hiệu ứng |
|---|---|---|---|---|
| NoRun | bắt đầu | chu kỳ đang mở, roster hợp lệ (≤8, có thủ lĩnh, sở hữu) | RosterSelect → Prep | khóa roster, HP/lương khởi đầu, tầng 1 |
| Prep | đổi active/nghề/hệ | hợp luật, tướng còn sống | Prep | — |
| Prep | bắt đầu trận | đội hợp luật | InBattle | ghi nghề/hệ; tạo trận với HP theo id |
| InBattle | thắng | — | Reward | ghi HP/lương theo id; ghi mốc tầng; phát đá mốc nếu đạt (một lần) |
| InBattle | thua | — | Ended | xem §4.5 |
| Reward | chọn | index hợp lệ, chưa chọn | Prep (tầng+1) | áp reward vào run |
| Prep | không còn đội hợp lệ | — | Ended | xem §4.5 |
| Prep | bỏ run | không có trận chạy | Ended | giữ đá mốc đã nhận |
| mọi phase | hết chu kỳ | giờ VN ≥ cuối chu kỳ | Ended | tính thưởng chu kỳ (idempotent) |

### 4.5 Thất bại và kết thúc
- Thua trận → run kết thúc (D-05). Đá mốc đã nhận được giữ; tiến trình đạt được xác định thưởng mốc chu kỳ.
- Không còn đội 3 hợp lệ còn sống (ví dụ thủ lĩnh ngã mà không còn cách hồi, hoặc luật tầng không đáp ứng được) → run kết thúc như thua. Không có ngoại lệ nào cho phép đánh với ít hơn 3 (D-06). Thủ lĩnh ngã mà không có reward hồi thì chấm dứt run.
- Chu kỳ mới: run cũ không tiếp tục; run mới có luật tầng mới.

### 4.6 Thưởng đá Destiny
- Mốc tầng và mốc chu kỳ là bảng cố định **[TBD]**; lượng đá chỉ do mốc, không do reward giữa tầng.
- Khóa idempotent: `(cycleId, milestoneId)`. Cộng đá và ghi mốc trong cùng một lần ghi hồ sơ.

## 5. Ma trận quyền action

Ký hiệu: ✔ cho phép, ✖ từ chối, — không áp dụng.

### 5.1 Trial

| Action | Idle | Prep | InBattle | Settled |
|---|---|---|---|---|
| Chọn tầng | ✔ | ✔ | ✖ | ✔ |
| Đổi active (3) | — | ✔ | ✖ | — |
| Đổi nghề/hệ thủ lĩnh | — | ✔ | ✖ | — |
| Bắt đầu trận | — | ✔ | ✖ | — |
| Đánh nước đi (battle) | — | — | ✔ | — |
| Quét | ✔ | ✖ | ✖ | ✔ |
| Nhận thưởng đá lần đầu | — | — | — | tự động, một lần |

### 5.2 Destiny

| Action | NoRun | Prep | InBattle | Reward | Ended |
|---|---|---|---|---|---|
| Bắt đầu run / chọn roster | ✔ | ✖ | ✖ | ✖ | ✔ (chỉ nếu chu kỳ mới, D-04) |
| Đổi roster | ✔ (trước khóa) | ✖ | ✖ | ✖ | ✖ |
| Đổi active | — | ✔ | ✖ | ✖ | ✖ |
| Đổi nghề/hệ thủ lĩnh | — | ✔ | ✖ | ✖ | ✖ |
| Bắt đầu trận | — | ✔ | ✖ | ✖ | ✖ |
| Chọn reward (heal/lương/Phúc) | — | ✖ | ✖ | ✔ | ✖ |
| Bỏ run | — | ✔ | ✖ | ✔ | ✖ |
| Đánh nước đi | — | — | ✔ | — | — |
| Hồi HP dự bị tự động | ✖ ở mọi phase | | | | |

Quy tắc chung: mọi action kiểm tra ở server, xác thực chủ sở hữu, phase và phiên bản hồ sơ (ghi có điều kiện version, như `updateProfile`). Action lặp cùng id không áp hiệu ứng hai lần.

## 6. Ngoại lệ đã biết

| Tình huống | Quy tắc |
|---|---|
| Đinh Bộ Lĩnh không hợp luật tầng với mọi nghề/hệ | Tầng không vào được; Trial: không bắt đầu; Destiny: kết thúc run theo §4.5. Luật tầng phải được thiết kế sao cho luôn tồn tại ít nhất một lựa chọn nghề/hệ cho thủ lĩnh (kiểm tra bằng test dữ liệu). |
| Không đủ 3 tướng sở hữu | Trial/Destiny không bắt đầu được (đội 3 active là bắt buộc). |
| Tướng bị gỡ khỏi danh sách game sau cập nhật | Trial: yêu cầu chọn lại. Destiny: tướng đó coi là ngã vĩnh viễn trong run. |
| Hết chu kỳ khi đang `InBattle` | Trận được phép kết thúc, kết quả tính vào chu kỳ cũ; thưởng chu kỳ tính sau khi trận settle hoặc hết hạn (D-07). |
| Quét vào ranh giới 00:00 VN | Dùng ngày VN tại thời điểm server xử lý; một lần/ngày, atomic. |
| Tower Legacy đang dở | Không chạm. Song Tháp độc lập với `tower.run`. |

## 7. Tách khỏi Tower cũ

- `tower.best`, `tower.run`, board `tower`, `a.tower10/25`, `w.tower10`, `applyTowerResult` giữ nguyên hành vi cho Legacy.
- Song Tháp dùng state mới (ví dụ `profile.dualTower`, `profile.stones`), cờ `match` mới (không tái dùng `match.tower` để tránh `applyTowerResult` chạy lên run Song Tháp), và board mới nếu cần.
- Vì vậy việc bỏ vàng/EXP/drop (C6) chỉ áp cho trận Song Tháp; Legacy giữ thưởng cũ cho tới khi có quyết định riêng (D-09).
- Thêm trường hồ sơ theo kiểu optional + default trong `parse*`; không phá run cũ. Kế hoạch migration chi tiết: task sau.

## 8. Tham số chỉ để thử nghiệm

| Tham số | Giá trị | Trạng thái |
|---|---|---|
| Giới hạn roster Destiny | 8 | [TEST] đề xuất |
| Độ dài chu kỳ | 7 ngày, thứ Hai 00:00 VN | Mặc định, cấu hình được |
| Số tầng Trial | 20 | Cố định ở bản đầu |
| Mọi lượng đá, mốc, mức HP/lương khởi đầu, lượng hồi, giá trị Phúc, số tầng Destiny | — | [TBD] — cần simulation + duyệt |

## 9. Decision log

| ID | Quyết định | Lý do | Trạng thái |
|---|---|---|---|
| D-01 | Hai mode độc lập với Legacy Tower | Bảo vệ `tower.best/run`, BXH | Chốt |
| D-02 | Đá chỉ ở tài khoản; reward giữa tầng không có đá | Yêu cầu sản phẩm | Chốt |
| D-03 | HP Destiny theo id tướng, không theo vị trí | Cho phép thay tướng giữa tầng; code cũ theo vị trí là rủi ro (audit §3.6) | Chốt |
| D-04 | Một run Destiny/người/chu kỳ; run mới chỉ ở chu kỳ mới | Đơn giản, tránh farm; yêu cầu gốc không nói rõ | **Cần duyệt** |
| D-05 | Thua một trận = run Destiny kết thúc | Hợp "HP xuyên tầng" và "không hồi tự động"; chưa có yêu cầu hồi sinh | **Cần duyệt** |
| D-06 | Không cho đánh với <3 active | Giữ battle 3v3 | Chốt |
| D-07 | Trận đang chạy lúc hết chu kỳ vẫn tính vào chu kỳ cũ | Tránh mất kết quả hợp lệ | **Cần duyệt** |
| D-08 | Heal là reward chọn trong run, không tự động | Yêu cầu "không hồi HP dự bị tự động" | Chốt |
| D-09 | Legacy Tower giữ thưởng cũ (vàng/EXP/drop) tới quyết định riêng | Không phá dữ liệu/kinh tế hiện có; audit §4 | **Cần duyệt** |
| D-10 | Trial thua/bỏ không mất đá hay tiến trình | Thử lại tự do | Chốt |
| D-11 | Mọi thưởng đá idempotent theo khóa | Chống settle lặp | Chốt |
| D-12 | Số liệu balance không chốt ở task này | Ranh giới task | Chốt |

## 10. Kiểm tra nhất quán
- "HP/lương reset" (Trial) và "xuyên tầng" (Destiny) áp cho hai mode khác nhau, không xung đột.
- "Không đổi tướng trong trận" không mâu thuẫn "thay active giữa tầng" (khác phase).
- "Hồi phục là lựa chọn" khớp "không hồi dự bị tự động".
- "Đá ở mốc/chu kỳ" khớp "reward giữa tầng không có đá".
- Quy tắc không dùng số balance mới: mọi số là [TBD]/[TEST].
