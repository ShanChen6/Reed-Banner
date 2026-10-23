# Nâng cấp trang bị — FUTURE TODO

Chưa triển khai. Song Tháp V1.0 chỉ phát **Đá Cường Hóa** (lưu ở tài khoản, số nguyên không âm). Không thêm `enhanceLevel`, không tăng ATK/DEF/HP bằng đá, không có API tiêu đá, không đổi luật ghép trang bị.

| ID | Việc cần làm sau này |
|---|---|
| GEAR-01 | Quyết định mô hình dữ liệu cấp cường hóa của món trang bị (và migration an toàn cho kho cũ). |
| GEAR-02 | Bảng chi phí đá theo cấp và trần cấp. |
| GEAR-03 | Công thức tăng chỉ số ATK/DEF/HP theo cấp, cân bằng với chỉ số hiện có. |
| GEAR-04 | API tiêu đá phía server: nguyên tử, idempotent, không cho số dư âm. |
| GEAR-05 | Tương tác với ghép trang bị (merge) và bán (sell): giữ/hoàn đá, luật cấp khi ghép. |
| GEAR-06 | Giao diện cường hóa và hiển thị cấp. |
| GEAR-07 | Cân bằng lại nguồn đá Trial/Destiny sau khi có sink; mô phỏng kinh tế. |
| GEAR-08 | Test, tương thích dữ liệu cũ và kế hoạch rollback. |
