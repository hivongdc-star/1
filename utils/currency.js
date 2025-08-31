const { loadUsers, saveUsers } = require("./storage");
const { dailyReward, maxDailyChatStones } = require("./config");

const chatTracker = {}; // track LT từ chat

// --- Cộng LT ---
function addLT(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return;

  users[userId].lt = (users[userId].lt || 0) + amount;
  saveUsers(users);
}

// --- Trừ LT ---
function removeLT(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return;

  users[userId].lt = Math.max(0, (users[userId].lt || 0) - amount);
  saveUsers(users);
}

// --- Lấy LT hiện tại ---
function getLT(userId) {
  const users = loadUsers();
  return users[userId]?.lt || 0;
}

// --- Kiếm LT từ chat ---
function earnFromChat(userId) {
  const today = new Date().toDateString();
  if (!chatTracker[userId]) chatTracker[userId] = { date: today, earned: 0 };

  if (chatTracker[userId].date !== today) {
    chatTracker[userId] = { date: today, earned: 0 };
  }

  if (chatTracker[userId].earned < maxDailyChatStones) {
    addLT(userId, 1);
    chatTracker[userId].earned++;
  }
}

// --- Nhận LT Daily ---
function claimDaily(userId) {
  const users = loadUsers();
  if (!users[userId])
    return { success: false, message: "Bạn chưa tạo nhân vật." };

  const today = new Date().toDateString();
  if (users[userId].lastDaily === today) {
    return { success: false, message: "❌ Bạn đã nhận daily hôm nay rồi." };
  }

  users[userId].lastDaily = today;
  users[userId].dailyStreak = (users[userId].dailyStreak || 0) + 1;

  const reward = dailyReward + (users[userId].dailyStreak - 1) * 5;
  users[userId].lt = (users[userId].lt || 0) + reward;

  saveUsers(users);

  return {
    success: true,
    message: `✅ Bạn đã nhận ${reward} 💎 Linh thạch (chuỗi ${users[userId].dailyStreak} ngày).`,
  };
}

// Xuất ra đầy đủ, có alias để code cũ không lỗi
module.exports = {
  addLT,
  removeLT,
  getLT,
  earnFromChat,
  claimDaily,
  addStones: addLT, // alias cho code cũ
};
