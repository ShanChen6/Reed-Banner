# Nhân vật tổng hợp

> Cập nhật: 31/10/2026
> Trạng thái: **DRAFT** — hướng thiết kế do Shan thống nhất ngày 31/10/2026; con số, cách nhận và mô hình dữ liệu dưới đây là đề xuất để review. Chưa có code, roster hay mô phỏng.

Nhân vật tổng hợp là nhân vật đặc biệt mang **hai nghề và hai hệ** thay vì một. Đây là nguồn chính của khái niệm; [Đinh Ngọc](dinh-ngoc.md) là trường hợp cực đoan (tám nghề/bảy hệ) và là nguồn chính của riêng nhân vật đó.

## Nguyên tắc đã chốt

| Mục | Luật |
|---|---|
| Phòng thủ | Chịu khắc theo **hệ chính** duy nhất; hệ phụ không đổi hệ phòng thủ |
| Đòn đánh thường | Theo **hệ chính** |
| Độ hiếm | Nhân vật đặc biệt, giá cao hơn nhiều so với nhân vật thường |
| Cách nhận | Có cách nhận đặc biệt, không chỉ mua bằng tiền thường (xem [Cách nhận](#cách-nhận)) |
| Icon | Dùng icon tổng hợp (`tongHop`) cho nghề và hệ ở thẻ, hồ sơ, shop; xem [Hiển thị](#hiển-thị) |

## Đề xuất: chính và phụ

Giữ một hệ chính và một nghề chính quyết định mọi thứ liên quan luật khắc hệ và nội tại nghề; hệ phụ và nghề phụ chỉ mở rộng bộ kỹ năng.

| | Hệ / nghề chính | Hệ / nghề phụ |
|---|---|---|
| Khắc hệ, phòng thủ | Có | Không |
| Đòn đánh thường, vũ khí | Có | Không |
| Nội tại nghề | Nghề chính | Không tự nhận; nếu có thì là một nội tại đã chọn sẵn trong loadout |
| Chiêu thức | Phần lớn bộ chiêu | Một hoặc hai chiêu mang nghề/hệ phụ |

Lý do: nếu phòng thủ hai hệ và đủ cả hai bộ kỹ năng thì người chơi chỉ chọn nhân vật tổng hợp, luật khắc hệ mất ý nghĩa. Giá cao được bù bằng **độ linh hoạt** (thêm chiêu từ hệ/nghề phụ), không bù bằng chỉ số nền cao hơn nhân vật thường. Chỉ số nền là điểm xuất phát, cần mô phỏng.

Hệ phụ chỉ ảnh hưởng damage của **chiêu mang hệ đó**, theo cùng contract per-skill `damageElement` mà [Đinh Ngọc](dinh-ngoc.md#thứ-tự-và-nguyên-tố-sát-thương) đã yêu cầu. Không có chiêu nào tính hai hệ cùng lúc.

## Ví dụ

| Nhân vật | Chính | Phụ | Ghi chú |
|---|---|---|---|
| Sát thủ Kim–Mộc (tên chưa đặt) | Sát thủ, Kim | Tướng sĩ, Mộc | Chịu khắc theo Kim. Chiêu Mộc dùng damage Mộc. Hai chiêu Tướng sĩ thêm khả năng cận chiến. |
| [Đinh Ngọc](dinh-ngoc.md) | Kim (phòng thủ) | Bảy hệ qua chiêu | Dùng khuôn `specialHybrid` riêng; không theo mô hình chính/phụ vì nghề lấy từ cả tám nghề |

Shan xác nhận "kiếm sĩ" là cách gọi nhầm của Tướng sĩ, nên ví dụ trên đúng. Từ 31/10/2026 Xạ thủ và Sát thủ đã vào trận ([thiết kế](../06-art/prompts/v4-2/08-new-professions-14-skill-kits.md)), nên nhân vật tổng hợp dùng hai nghề này không còn bị chặn bởi runtime.

## Cách nhận

Đề xuất, chưa chốt:

- Chuỗi nhiệm vụ riêng, hoặc phần thưởng khi hoàn thành chương/mốc lớn của Campaign.
- Một loại vật phẩm hoặc tiền riêng để đổi, không dùng chung với tiền thường.
- Giá cao chỉ là một phần của cảm giác đặc biệt, không là cách duy nhất.

> TODO: Chốt cách nhận cụ thể (nhiệm vụ, mốc chương, vật phẩm đổi), mức giá so với nhân vật thường, và giới hạn số lượng nhân vật tổng hợp trong đội. Shan chưa nghĩ ra ngày 31/10/2026; sẽ chốt sau khi thiết kế thêm một vài nhân vật tổng hợp để so sánh.

## Hiển thị

Hệ chính quyết định khắc hệ, nên người chơi phải luôn thấy hệ chính ở nơi liên quan đến trận.

| Nơi | Hiển thị |
|---|---|
| Thẻ nhân vật, hồ sơ, shop | Icon tổng hợp cho nghề và hệ (`/art/professions/tongHop.webp`, `/art/elements/tongHop.webp`) |
| Trong trận, bảng khắc hệ | Icon hệ chính, thêm dấu nhỏ báo có hệ phụ |
| Màn chi tiết | Liệt kê rõ hệ chính, hệ phụ, nghề chính, nghề phụ |

Hai icon tổng hợp đã có trong code: `ProfessionIcon` và `ElementIcon` nhận `"tongHop"` ([icons.tsx](../../src/app/game/art/icons.tsx)). Trang [xem thử nhân vật](../../src/app/demo/characters/CharacterPreviewer.tsx) đã dùng chúng cho Đinh Ngọc.

## Tác động lên code (chưa làm)

Hiện mỗi nhân vật chỉ có một `element` và một `profession` trong `src/core`. Triển khai cần, theo thứ tự:

1. Mô hình dữ liệu: thêm hệ phụ/nghề phụ tùy chọn, không phá save hiện có.
2. Per-skill `damageElement` (đã nêu ở Đinh Ngọc).
3. Roster/shop/mở khóa cho nhân vật đặc biệt.
4. UI theo mục [Hiển thị](#hiển-thị).
5. Mô phỏng cân bằng trước khi báo là có trong trận.
