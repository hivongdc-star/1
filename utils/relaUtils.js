// utils/relaUtils.js
// Nguồn sự thật duy nhất cho RELA/ĐẠO DUYÊN
const { loadUsers, saveUsers } = require("./storage");

const TIMEZONE = "Asia/Tokyo";
const CHAT_COOLDOWN_MS = 10_000;
const DAILY_LIMIT = { mention: 10, reply: 10 };
const GAIN = { mention: 50, reply: 20, chat: 2 };

function todayStr() {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year:"numeric", month:"2-digit", day:"2-digit" });
  return fmt.format(new Date());
}

function ensureUser(u) {
  if (!u) u = {};
  u.relationships = u.relationships || { partners: {} };
  return u;
}

function ensurePair(users, a, b) {
  users[a] = ensureUser(users[a]);
  users[b] = ensureUser(users[b]);
  const A = users[a].relationships; const B = users[b].relationships;
  A.partners[b] = A.partners[b] || { rela:0, daoDuyen:0, status:"none", daily:{ date: todayStr(), mention:0, reply:0 }, chatCdAt:0 };
  B.partners[a] = B.partners[a] || { rela:0, daoDuyen:0, status:"none", daily:{ date: todayStr(), mention:0, reply:0 }, chatCdAt:0 };
  const ab = A.partners[b], ba = B.partners[a];
  // reset daily theo NGÀY cho từng chiều
  const t = todayStr();
  if (!ab.daily || ab.daily.date !== t) ab.daily = { date:t, mention:0, reply:0 };
  if (!ba.daily || ba.daily.date !== t) ba.daily = { date:t, mention:0, reply:0 };
  return { ab, ba };
}

function addRela(a, b, amount) {
  if (a === b) return { ok:false, message:"self" };
  if (!Number.isFinite(amount) || amount <= 0) return { ok:false, message:"amount<=0" };
  const users = loadUsers();
  const { ab, ba } = ensurePair(users, a, b);
  ab.rela = (ab.rela||0) + amount;
  ba.rela = (ba.rela||0) + amount;
  saveUsers(users);
  return { ok:true, value:ab.rela };
}

function addDaoDuyen(a, b, amount) {
  if (a === b) return { ok:false };
  if (!Number.isFinite(amount) || amount <= 0) return { ok:false };
  const users = loadUsers();
  const { ab, ba } = ensurePair(users, a, b);
  ab.daoDuyen = (ab.daoDuyen||0) + amount;
  ba.daoDuyen = (ba.daoDuyen||0) + amount;
  saveUsers(users);
  return { ok:true, value:ab.daoDuyen };
}

function getRela(a,b){ const u=loadUsers(); return u[a]?.relationships?.partners?.[b]?.rela||0; }
function getDaoDuyen(a,b){ const u=loadUsers(); return u[a]?.relationships?.partners?.[b]?.daoDuyen||0; }
function getSpouse(a){ const u=loadUsers(); const ps=u[a]?.relationships?.partners||{}; for(const pid in ps){ if(ps[pid].status==="married") return pid; } return null; }
function isMarried(a,b){ const u=loadUsers(); return u[a]?.relationships?.partners?.[b]?.status==="married"; }

function eligiblePartners(a, threshold=1000) {
  const u = loadUsers(); const ps = u[a]?.relationships?.partners||{};
  return Object.entries(ps).map(([pid,cell]) => ({ partnerId: pid, value: cell.rela||0 }))
    .filter(x => x.value >= threshold && pidNotSelf(a,x.partnerId))
    .sort((m,n)=>n.value-m.value);
}
const pidNotSelf=(a,b)=>a!==b;

function recordRing(a,b,ringId){
  const users=loadUsers(); const {ab,ba}=ensurePair(users,a,b);
  ab.ringId = ringId; ba.ringId = ringId;
  saveUsers(users);
}

function convertRelaToDaoDuyen(a,b){
  const users=loadUsers(); const {ab,ba}=ensurePair(users,a,b);
  const gain = (ab.rela||0);
  ab.rela = 0; ba.rela = 0;
  ab.daoDuyen = (ab.daoDuyen||0) + gain;
  ba.daoDuyen = (ba.daoDuyen||0) + gain;
  saveUsers(users);
  return gain;
}

function marryPair(a,b,ringId){
  const users=loadUsers(); const {ab,ba}=ensurePair(users,a,b);
  const now=Date.now();
  ab.status="married"; ba.status="married";
  ab.marriedAt = ba.marriedAt = now;
  ab.ringId = ba.ringId = ringId;
  // chuyển RELA thành Đạo Duyên khởi đầu
  const gain = (ab.rela||0);
  ab.rela=0; ba.rela=0;
  ab.daoDuyen=(ab.daoDuyen||0)+gain;
  ba.daoDuyen=(ba.daoDuyen||0)+gain;
  saveUsers(users);
  return { marriedAt: now, gain };
}

function divorce(a,b){
  const users=loadUsers(); const {ab,ba}=ensurePair(users,a,b);
  ab.status="none"; ba.status="none";
  // Không reset daoDuyen theo yêu cầu mặc định. Thay đổi nếu bạn muốn.
  saveUsers(users);
}

function addByType(a,b,type){ // mention/reply/chat
  if (a===b) return;
  const users=loadUsers(); const {ab,ba}=ensurePair(users,a,b);
  let delta=0;
  if (type==="mention") {
    if (ab.daily.mention < DAILY_LIMIT.mention) { ab.daily.mention++; delta = GAIN.mention; }
  } else if (type==="reply") {
    if (ab.daily.reply < DAILY_LIMIT.reply) { ab.daily.reply++; delta = GAIN.reply; }
  } else if (type==="chat") {
    const now=Date.now(); if ((ab.chatCdAt||0) + CHAT_COOLDOWN_MS <= now) { ab.chatCdAt = now; delta = GAIN.chat; }
  }
  if (delta>0) { ab.rela=(ab.rela||0)+delta; ba.rela=(ba.rela||0)+delta; }
  saveUsers(users);
}

function handleMessageEvent({ channelId, authorId, mentionedIds=[], repliedUserId=null }, lastByChannelMap){
  mentionedIds.forEach(id=>addByType(authorId,id,"mention"));
  if (repliedUserId) addByType(authorId,repliedUserId,"reply");
  const last = lastByChannelMap.get(channelId);
  if (last && last!==authorId) addByType(authorId,last,"chat");
  lastByChannelMap.set(channelId, authorId);
}

function getTopPairs(limit=10){
  const u=loadUsers(); const pairs=[];
  for(const a in u){
    const ps=u[a]?.relationships?.partners||{};
    for(const b in ps){ if (a<b){ const cell=ps[b]; pairs.push({ a, b, value:(cell.status==="married" ? cell.daoDuyen||0 : cell.rela||0) }); } }
  }
  return pairs.sort((x,y)=>y.value-x.value).slice(0,limit);
}

module.exports = {
  addRela, addDaoDuyen, getRela, getDaoDuyen, eligiblePartners, recordRing,
  convertRelaToDaoDuyen, marryPair, divorce, isMarried, getSpouse,
  handleMessageEvent, getTopPairs
};
