const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getRealm, getExpNeeded } = require("./xp");
const { getBackground } = require("./backgrounds");
const { fonts } = require("./fontUtils");
const elements = require("./element");
const races = require("./races");
const { loadUsers } = require("./storage");

async function drawProfile(userId) {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return null;

  // Canvas kích thước chuẩn
  const width = 600,
    height = 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  const bg = getBackground(user.background);
  try {
    const bgImg = await loadImage(`./assets/backgrounds/${bg.file}`);
    ctx.drawImage(bgImg, 0, 0, width, height);
  } catch {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, width, height);
  }

  // Nền mờ cho text
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(20, 20, width - 40, height - 40);

  // --- Avatar ---
  try {
    const avatar = await loadImage(
      user.avatar || "./assets/default_avatar.png"
    );
    const size = 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(70, 70, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 20, 20, size, size);
    ctx.restore();
  } catch {}

  // --- Tên + Cảnh giới ---
  ctx.font = fonts.title;
  ctx.fillStyle = "#fff";
  ctx.fillText(user.name, 140, 60);

  const realm = getRealm(user.level);
  ctx.font = fonts.subtitle;
  ctx.fillStyle = "#ddd";
  ctx.fillText(`${realm} (Lv.${user.level})`, 140, 90);

  // --- Thanh EXP ---
  const expNow = user.exp;
  const expNeed = getExpNeeded(user.level);
  const barX = 140,
    barY = 110,
    barW = 400,
    barH = 18;

  ctx.fillStyle = "#444";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = "#4fc3f7";
  ctx.fillRect(barX, barY, Math.floor((barW * expNow) / expNeed), barH);

  ctx.font = fonts.text;
  ctx.fillStyle = "#fff";
  ctx.fillText(`EXP: ${expNow}/${expNeed}`, barX, barY - 5);

  // --- Stats ---
  const stats = [
    ["⚔ Công", user.atk],
    ["🛡 Thủ", user.def],
    ["❤️ Máu", user.maxHp],
    ["🔮 Mana", user.maxMp],
    ["💢 Nộ", user.fury],
    ["💎 LT", user.lt],
  ];

  let sy = 160;
  stats.forEach(([label, val]) => {
    ctx.fillText(`${label}: ${val}`, 140, sy);
    sy += 25;
  });

  // --- Bio ---
  ctx.fillStyle = "#eee";
  ctx.font = fonts.text;
  ctx.fillText(`"${user.bio || "Chưa có mô tả."}"`, 140, sy + 20);

  return canvas.toBuffer("image/png");
}

module.exports = { drawProfile };
