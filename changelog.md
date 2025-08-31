# 📦 Cultivation Bot – CHANGELOG

## v1.3.1 (2025-09-01)

### 🔹 Combat System

- **Fix lỗi không chuyển lượt**: sau khi người chơi dùng skill, lượt sẽ luôn được chuyển sang đối thủ (`state.turn = defenderId`).
- **Update giao diện combat** (`duelMenu`):
  - Menu kỹ năng giờ hiển thị cho cả 2 người chơi.
  - Buff skill có cooldown 3 lượt, hiển thị trực tiếp trong menu chọn skill.
- **Chuẩn hoá hệ thống skill**:
  - Buff dùng %MP thay vì số tuyệt đối.
  - Fury skill yêu cầu 100 Nộ.
  - Reset `buffCooldowns`, `buff`, `shield`, `hp/mp` sau trận đấu.

### 🔹 Admin Command

- Thêm lệnh `-cancel` (alias: `-endall`):
  - Chỉ admin (OWNER_ID) được dùng.
  - Hủy toàn bộ **trận đấu** và **lời thách đấu** đang tồn tại.
  - Gọi hàm mới `cancelAll()` trong `utils/duel.js`.

### 🔹 Stability & Code Cleanup

- Đảm bảo cooldown buff giảm đúng sau mỗi lượt.
- Combat code được đồng bộ, dễ mở rộng skill trong tương lai.

---

## v1.3.0

> 🔥 Bản cập nhật lớn với hệ thống stat mới và skill huyền huyễn.

- **Stat**: `hp, mp, atk, def, spd, fury, lt`.
- **SPD** ảnh hưởng né tránh (0–30%).
- **HP +100 mỗi cấp** (tự động fix bằng `fixdata`).
- **Race** & **Element**: mỗi level tăng +50 theo Tộc và +50 theo Hệ.
- **EXP**: chat +5–20 exp / 15s.
- **Skills**: Normal / Buff / Mana / Fury, mô tả theo văn phong huyền huyễn Hán-Việt.
- **Buff skill**: hồi 50% MP + hiệu ứng riêng theo ngũ hành (Kim xuyên thủ, Mộc hồi máu, Thủy khiên, Hỏa +ATK, Thổ +DEF).
- **Fixdata**: migrate stat cũ sang stat mới, auto nâng HP chuẩn theo cấp.

---
