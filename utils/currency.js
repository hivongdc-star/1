const { loadUsers, saveUsers } = require("./storage");
const { dailyReward, maxDailyChatStones } = require("./config");

const chatTracker = {}; // track LT từ chat

function addStones(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return;

  users[userId].lt = (users[userId].lt || 0) + amount; // ✅ dùng lt
  saveUsers(users);
}

function earnFromChat(userId) {
  const today = new Date().toDateString();
  if (!chatTracker[userId]) chatTracker[userId] = { date: today, earned: 0 };

  if (chatTracker[userId].date !== today) {
    chatTracker[userId] = { date: today, earned: 0 };
  }

  if (chatTracker[userId].earned < maxDailyChatStones) {
    addStones(userId, 1);
    chatTracker[userId].earned++;
  }
}

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
  users[userId].lt = (users[userId].lt || 0) + reward; // ✅ dùng lt

  saveUsers(users);

  return {
    success: true,
    message: `✅ Bạn đã nhận ${reward} 💎 Linh thạch (chuỗi ${users[userId].dailyStreak} ngày).`,
  };
}

module.exports = { addStones, earnFromChat, claimDaily };
