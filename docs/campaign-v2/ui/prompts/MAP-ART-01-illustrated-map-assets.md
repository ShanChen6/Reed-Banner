# Codex prompt MAP-ART-01 — Tạo asset sách mở và bản đồ minh họa

> Phải đọc: docs/campaign-v2/ui/08-atlas-sach-mo-asset-production.md  
> Sau MAP-01. Không thay gameplay. Audio/Voice TODO — DEFERRED.

## Mục tiêu
Tạo asset map như ảnh sách địa chí do người dùng cung cấp: sách hai trang mở, trái panel màu than sẫm dành cho text, phải bản đồ **vẽ tay thực sự** với sông, rừng, thành đất, làng, núi và con đường. Không chỉ tạo background giấy dó.

## Làm từng bước
1. Kiểm asset atlas đã có trong public/art/campaign/atlas. Không ghi đè asset đã duyệt.
2. Dùng Prompt IMAGE 01 trong file 08 để tạo 2–3 phiên bản book-shell sạch chữ; chọn một.
3. Dùng Prompt IMAGE 02 để tạo 2–3 phiên bản map-ch01 minh họa Hoa Lư, phong cách đồng nhất. Không tự thêm tên địa danh, sứ quân hay marker Mxx vào ảnh.
4. Nếu môi trường Codex không có công cụ tạo ảnh: KHÔNG giả vờ đã tạo ảnh. Xuất danh sách prompt và file manifest với trạng thái NEEDS_GENERATION, hướng dẫn để người dùng tạo ảnh và đặt đúng chỗ. Dừng production art tại đây.
5. Khi có ảnh thật, ghép thử bản desktop và mobile với tiêu đề sử ký/4 mission do HTML code và marker do SVG code. Báo rõ mismatch nghệ thuật.
6. Chỉ sau duyệt pilot mới tạo map-ch02..map-ch06 theo biến thể trong tài liệu, tối ưu WebP và manifest.
7. Gửi QA report theo chương, đường dẫn asset thật, kích thước và dung lượng.

## Không được
- Không dùng ảnh sách Cổ Loa để thay cho bản đồ Hoa Lư.
- Không đặt chính sử, trích dẫn hay text UI thành chữ raster.
- Không xóa CampaignMap/mapLayout, không thay 24 mission/graph, không tạo TTS/audio.
- Không tự commit/push/deploy.

## Hoàn thành khi
- Ít nhất pilot book shell + map-ch01 có thật và được kiểm duyệt; hoặc báo rõ chưa có công cụ ảnh.
- Cảnh map có nội dung vẽ tay (sông/rừng/thành), không phải giấy trống.
- Asset tách thành hai lớp độc lập, Có plan cho 5 chương còn lại.
