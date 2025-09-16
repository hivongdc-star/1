## [1.5.7.1] - 2025-09-16
### Added
- `-toprela`: hiển thị top 10 cặp có rela cao nhất.
- `-marry`: chọn partner đủ 1000 rela, gửi lời mời và xác nhận kết hôn.
- `-tang`: cập nhật, cho phép chọn vật phẩm trong túi và tặng trực tiếp.

### Changed
- Hệ thống rela: thêm rule cộng qua mention, reply, chat liền kề.
- Đồng bộ schema rela từ number → object `{ value, daily }`.
- Hook dispatcher để rela tự động cộng khi chat.

### Fixed
- Đồng bộ dữ liệu rela cũ với schema mới.

# Phiên bản 1.5.7

## Tính năng mới
- Thêm hệ thống Shop (item, nhẫn cưới, quà tặng).
- Thêm lệnh `-toprela` để xem top cặp đôi RELA cao nhất.
- Cải tiến canvas profile
 

## 1.5.6.1
- Fix hiển thị cảnh giới trong profile 
- Avatar, tên nhân vật, icon tộc/ngũ hành, thanh EXP, linh thạch, chỉ số được tối ưu hiển thị.


## 1.5.6
- Tối ưu bố cục `profile`: avatar bo tròn, tên có màu, cảnh giới rõ ràng.
- Thanh EXP có số trực tiếp bên trong.
- Thêm icon Tộc & Ngũ hành hiển thị trên thanh EXP.
- Linh thạch có icon 💎 riêng.
- Chỉ số chia thành 2 cột với icon trực quan.
- Lệnh `ver` được viết lại: luôn hiển thị số phiên bản và ghi chú mới nhất.
