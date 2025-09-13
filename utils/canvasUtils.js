const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getRealm, getExpNeeded } = require("./xp");
const { getBackground } = require("./backgrounds");
const { fonts } = require("./fontUtils");
const races = require("./races");
const elements = require("./element");
const { loadUsers } = require("./storage");
const { getIcon } = require("./iconUtils");

// cache ảnh để tránh load lại nhiều lần
const __imgCache = new Map();
async function getImage(p) {
  if (!__imgCache.has(p)) {
    __imgCache.set(p, loadImage(p));
  }
  return __imgCache.get(p);
}

async function drawProfile(userId, avatarUrl = null) {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return null;

  const width = 600, height = 420;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  const bg = getBackground(user.bg || "default");
  const bgImg = await getImage(`./assets/backgrounds/${bg.file}`);
  ctx.drawImage(bgImg, 0, 0, width, height);

  // Nền mờ
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, width, height);

  // --- Avatar (bo tròn) ---
  const avatar = await getImage(avatarUrl || user.avatar || "./assets/default_avatar.png");
  const avSize = 120;
  ctx.save();
  ctx.beginPath();
  ctx.arc(60, 60, avSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 0, 0, avSize, avSize);
  ctx.restore();

  // --- Tên nhân vật ---
  ctx.font = "28px Cinzel";
  ctx.fillStyle = "#4fc3f7";
  ctx.fillText(user.name || "Vô Danh", 150, 50);

  // --- Cảnh giới ---
  const realm = getRealm(user.level || 1);
  ctx.font = "20px NotoSans";
  ctx.fillStyle = "#ddd";
  ctx.fillText(realm.name || "Luyện Khí", 150, 80);

  // --- Icon Tộc & Ngũ hành (trên exp bar) ---
  try {
    const raceKey = (user.race || "nhan").toLowerCase();
    const elemKey = (user.element || "kim").toLowerCase();
    const raceIcon = await getIcon(raceKey);
    const elemIcon = await getIcon(elemKey);
    ctx.drawImage(raceIcon, 150, 100, 40, 40);
    ctx.drawImage(elemIcon, 200, 100, 40, 40);
  } catch {}

  // --- Thanh EXP ---
  const expNow = user.exp || 0;
  const expNeed = getExpNeeded(user.level || 1);
  const barX = 150, barY = 150, barW = 400, barH = 20;

  ctx.fillStyle = "#444";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = "#81c784";
  ctx.fillRect(barX, barY, Math.floor((barW * expNow) / expNeed), barH);

  ctx.font = "14px DejaVu";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(`EXP: ${expNow}/${expNeed}`, barX + barW / 2, barY + 15);
  ctx.textAlign = "left";

  // --- Linh thạch ---
  try {
    const ltIcon = await getIcon("lt");
    ctx.drawImage(ltIcon, 150, 190, 24, 24);
  } catch {}
  ctx.font = "18px DejaVu";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${user.lt || 0}`, 180, 210);

  // --- Chỉ số (2 cột, có icon) ---
  const statsLeft = [
    ["hp", user.hp || 0],
    ["mp", user.mp || 0],
    ["atk", user.atk || 0],
  ];
  const statsRight = [
    ["def", user.def || 0],
    ["spd", user.spd || 0],
  ];

  let sy = 250;
  for (const [key, val] of statsLeft) {
    try {
      const ic = await getIcon(key);
      ctx.drawImage(ic, 150, sy - 18, 20, 20);
    } catch {}
    ctx.font = "16px DejaVu";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${val}`, 180, sy);
    sy += 30;
  }

  sy = 250;
  for (const [key, val] of statsRight) {
    try {
      const ic = await getIcon(key);
      ctx.drawImage(ic, 300, sy - 18, 20, 20);
    } catch {}
    ctx.font = "16px DejaVu";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${val}`, 330, sy);
    sy += 30;
  }

  // --- Bio (in nghiêng) ---
  ctx.font = "italic 14px DejaVu";
  ctx.fillStyle = "#ccc";
  ctx.fillText(`"${user.bio || "Chưa có mô tả."}"`, 150, 350);

  return canvas.toBuffer("image/png");
}

module.exports = { drawProfile };
