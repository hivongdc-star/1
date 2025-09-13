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

  const width = 650, height = 460;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  const bg = getBackground(user.bg || "default");
  const bgImg = await getImage(`./assets/backgrounds/${bg.file}`);
  ctx.drawImage(bgImg, 0, 0, width, height);

  // Nền mờ
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, width, height);

  // --- Avatar (bo tròn, to hơn) ---
  const avatar = await getImage(
    avatarUrl || user.avatar || "./assets/default_avatar.png"
  );
  const avSize = 140;
  ctx.save();
  ctx.beginPath();
  ctx.arc(80, 80, avSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 10, 10, avSize, avSize);
  ctx.restore();

  // --- Tên nhân vật (to hơn, màu nổi bật) ---
  ctx.font = "32px Cinzel";
  ctx.fillStyle = "#4fc3f7";
  ctx.fillText(user.name || "Vô Danh", 180, 60);

  // --- Cảnh giới ---
  const realmName = getRealm(user.level || 1);
  ctx.font = "22px NotoSans";
  ctx.fillStyle = "#ddd";
  ctx.fillText(realmName || "Luyện Khí", 180, 95);

  // --- Icon Tộc & Ngũ hành (to gấp đôi) ---
  try {
    const raceKey = (user.race || "nhan").toLowerCase();
    const elemKey = (user.element || "kim").toLowerCase();
    const raceIcon = await getIcon(raceKey);
    const elemIcon = await getIcon(elemKey);
    ctx.drawImage(raceIcon, 180, 110, 80, 80);
    ctx.drawImage(elemIcon, 270, 110, 80, 80);
  } catch {}

  // --- Thanh EXP (đẹp hơn) ---
  const expNow = user.exp || 0;
  const expNeed = getExpNeeded(user.level || 1);
  const barX = 180,
    barY = 210,
    barW = 430,
    barH = 24;

  // viền
  ctx.fillStyle = "#333";
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

  // nền
  ctx.fillStyle = "#555";
  ctx.fillRect(barX, barY, barW, barH);

  // progress gradient
  const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  grad.addColorStop(0, "#4fc3f7");
  grad.addColorStop(1, "#81c784");
  ctx.fillStyle = grad;
  ctx.fillRect(barX, barY, Math.floor((barW * expNow) / expNeed), barH);

  // text trong bar
  ctx.font = "14px DejaVu";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(`EXP: ${expNow}/${expNeed}`, barX + barW / 2, barY + 17);
  ctx.textAlign = "left";

  // --- Linh thạch ---
  try {
    const ltIcon = await getIcon("lt");
    ctx.drawImage(ltIcon, 180, 250, 28, 28);
  } catch {}
  ctx.font = "20px DejaVu";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${user.lt || 0}`, 215, 272);

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

  let sy = 300;
  for (const [key, val] of statsLeft) {
    try {
      const ic = await getIcon(key);
      ctx.drawImage(ic, 180, sy - 18, 22, 22);
    } catch {}
    ctx.font = "16px DejaVu";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${val}`, 210, sy);
    sy += 30;
  }

  sy = 300;
  for (const [key, val] of statsRight) {
    try {
      const ic = await getIcon(key);
      ctx.drawImage(ic, 320, sy - 18, 22, 22);
    } catch {}
    ctx.font = "16px DejaVu";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${val}`, 350, sy);
    sy += 30;
  }

  // --- Bio (in nghiêng) ---
  ctx.font = "italic 16px DejaVu";
  ctx.fillStyle = "#ccc";
  ctx.fillText(`"${user.bio || "Chưa có mô tả."}"`, 180, 400);

  return canvas.toBuffer("image/png");
}

module.exports = { drawProfile };
