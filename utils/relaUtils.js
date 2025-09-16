// utils/relaUtils.js
// RELA = độ thân mật giữa 2 user
// Rule: mention +50 (tối đa 10/ngày), reply +20 (tối đa 10/ngày), chat liền kề +2
// Gift = cộng rela theo giá trị, không bị giới hạn

const { loadUsers, saveUsers } = require("./storage");

const TIMEZONE = "Asia/Tokyo";
const lastMessageByChannel = new Map(); // nhớ user cuối trong channel

function todayStr() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function normalize(cell) {
  if (typeof cell === "number") {
    return { value: cell, daily: { date: todayStr(), mention: 0, reply: 0 } };
  }
  if (!cell || typeof cell !== "object") {
    return { value: 0, daily: { date: todayStr(), mention: 0, reply: 0 } };
  }
  if (!cell.value) cell.value = 0;
  if (!cell.daily) cell.daily = { date: todayStr(), mention: 0, reply: 0 };
  if (cell.daily.date !== todayStr()) {
    cell.daily = { date: todayStr(), mention: 0, reply: 0 };
  }
  return cell;
}

function ensurePair(users, a, b) {
  if (!users[a]) users[a] = {};
  if (!users[a].rela) users[a].rela = {};
  if (!users[b]) users[b] = {};
  if (!users[b].rela) users[b].rela = {};
  users[a].rela[b] = normalize(users[a].rela[b]);
  users[b].rela[a] = normalize(users[b].rela[a]);
}

// cộng rela theo type (mention/reply/chat)
function addRelaByType(a, b, type) {
  if (a === b) return;
  const users = loadUsers();
  if (!users[a] || !users[b]) return;

  ensurePair(users, a, b);
  const cellA = users[a].rela[b];
  const cellB = users[b].rela[a];

  let amount = 0;
  if (type === "mention") {
    if (cellA.daily.mention < 10) {
      amount = 50;
      cellA.daily.mention++;
      cellB.daily.mention++;
    }
  } else if (type === "reply") {
    if (cellA.daily.reply < 10) {
      amount = 20;
      cellA.daily.reply++;
      cellB.daily.reply++;
    }
  } else if (type === "chat") {
    amount = 2;
  }

  if (amount > 0) {
    cellA.value += amount;
    cellB.value += amount;
  }

  saveUsers(users);
}

// cộng rela trực tiếp theo số điểm (gift, event đặc biệt…)
function addRelaAmount(a, b, amount) {
  if (a === b || !amount) return;
  const users = loadUsers();
  if (!users[a] || !users[b]) return;

  ensurePair(users, a, b);
  users[a].rela[b].value += amount;
  users[b].rela[a].value += amount;
  saveUsers(users);
}

// đọc rela
function getRela(a, b) {
  const users = loadUsers();
  const cell = users[a]?.rela?.[b];
  if (!cell) return 0;
  if (typeof cell === "number") return cell;
  return cell.value || 0;
}

// lấy partner đủ rela để marry
function getEligiblePartners(userId, threshold = 1000) {
  const users = loadUsers();
  const rela = users[userId]?.rela || {};
  return Object.entries(rela)
    .map(([pid, cell]) => ({
      partnerId: pid,
      value: typeof cell === "number" ? cell : (cell.value || 0),
    }))
    .filter((r) => r.value >= threshold)
    .sort((a, b) => b.value - a.value);
}

// top rela theo cặp
function getTopRelaPairs(limit = 10) {
  const users = loadUsers();
  const seen = new Set();
  const pairs = [];
  for (const a in users) {
    for (const b in users[a]?.rela || {}) {
      if (a >= b) continue;
      const val = getRela(a, b);
      const key = `${a}|${b}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ a, b, value: val });
      }
    }
  }
  return pairs.sort((x, y) => y.value - x.value).slice(0, limit);
}

// hook từ dispatcher
function handleMessageEvent({ channelId, authorId, mentionedIds = [], repliedUserId = null }) {
  mentionedIds.forEach((id) => addRelaByType(authorId, id, "mention"));
  if (repliedUserId) addRelaByType(authorId, repliedUserId, "reply");
  const last = lastMessageByChannel.get(channelId);
  if (last && last !== authorId) addRelaByType(authorId, last, "chat");
  lastMessageByChannel.set(channelId, authorId);
}

module.exports = {
  addRelaByType,
  addRelaAmount,
  getRela,
  getEligiblePartners,
  getTopRelaPairs,
  handleMessageEvent,
};
