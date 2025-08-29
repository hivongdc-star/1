const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms"); // Danh sách cảnh giới
const elements = require("./element"); // Ngũ hành và chỉ số cộng thêm
const { baseExp, expMultiplier } = require("./config"); // Tham số exp

/**
 * 🔹 Tính số EXP cần để lên 1 cấp độ cụ thể
 * @param {number} level - cấp độ hiện tại
 * @returns {number} exp cần để lên cấp
 */
function getExpNeeded(level) {
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

/**
 * 🔹 Cộng EXP cho user, kiểm tra lên cấp và cộng chỉ số theo ngũ hành
 * @param {string} userId - ID Discord của user
 * @param {number} amount - số EXP cộng thêm
 * @returns {boolean} - true nếu user có lên cấp, false nếu không
 */
function addXp(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return false; // chưa có nhân vật thì bỏ qua

  // Cộng EXP
  users[userId].exp += amount;
  let leveledUp = false;

  // Kiểm tra nếu đủ exp để lên cấp
  while (users[userId].exp >= getExpNeeded(users[userId].level)) {
    // Trừ exp cần thiết
    users[userId].exp -= getExpNeeded(users[userId].level);
    // Tăng level
    users[userId].level++;
    leveledUp = true;

    // Lấy ngũ hành của nhân vật
    const ele = (users[userId].element || "").toLowerCase();
    if (elements[ele]) {
      const gains = elements[ele];
      // Cộng chỉ số theo ngũ hành
      for (let stat in gains) {
        users[userId][stat] = (users[userId][stat] || 0) + gains[stat];
      }
    }
  }

  // Lưu lại dữ liệu
  saveUsers(users);
  return leveledUp;
}

/**
 * 🔹 Lấy cảnh giới và tầng hiện tại dựa trên level
 * @param {number} level - cấp độ của user
 * @returns {string} - ví dụ: "Trúc Cơ - Tầng 3"
 */
function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10); // mỗi cảnh giới có 10 tầng
  const stage = ((level - 1) % 10) + 1; // tầng từ 1 → 10
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
