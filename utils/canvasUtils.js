const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getRealm, getExpNeeded } = require("./xp");
const { getBackground } = require("./backgrounds");
const { fonts } = require("./fontUtils");
const { loadUsers } = require("./storage");
const races = require("./races");
const elements = require("./element");

// Màu viền avatar theo ngũ hành
const elementColors = {
  kim: [200, 200, 200],
  moc: [34, 139, 34],
  thuy: [30, 144, 255],
  hoa: [220, 20, 60],
  tho: [139, 69, 19],
};

// Vẽ icon + giá trị
async function drawStat(ctx, iconPath, value, x, y) {
  try {
    const icon = await loadImage(iconPath);
    ctx.drawImage(icon, x, y, 20, 20);
  } catch {
    console.error("Không load được icon:", iconPath);
  }
  if (value !== "" && value !== null && value !== undefined) {
    ctx.font = fonts.text;
    ctx.fillStyle = "#fff";
    ctx.fillText(String(value), x + 28, y + 16);
  }
}

// Wrap text đơn giản
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let sy = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, sy);
      line = words[n] + " ";
      sy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, sy);
}

async function drawProfile(userId, discordAvatarUrl) {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return null;

  const width = 600, height = 460;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // --- Background ---
  const bg = getBackground(user.background);
  try {
    const bgImg = await loadImage(`./assets/backgrounds/${bg.file}`);
    ctx.drawImage(bgImg, 0, 0, width, height);
  } catch {
    ctx.fillStyle = bg.color || "#000";
    ctx.fillRect(0, 0, width, height);
  }

  // Overlay tối
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(15, 15, width - 30, height - 30);

  // --- Avatar + viền sáng ---
  try {
    const avatar = await loadImage(discordAvatarUrl);
    const size = 80;
    const x = 25, y = 30;

    const borderSize = size + 8;
    const color = elementColors[user.element] || [255, 255, 255];
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, borderSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`;
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();
  } catch {}

  // --- Tên ---
  ctx.font = fonts.title;
  const nameX = 120, nameY = 55;
  for (let dx of [-2, 2, 0, 0]) {
    for (let dy of [0, 0, -2, 2]) {
      ctx.fillStyle = "#000";
      ctx.fillText(user.name || "Chưa đặt tên", nameX + dx, nameY + dy);
    }
  }
  ctx.fillStyle = "gold";
  ctx.fillText(user.name || "Chưa đặt tên", nameX, nameY);

  // --- Danh hiệu ---
  ctx.font = fonts.subtitle;
  ctx.fillStyle = "#ccc";
  ctx.fillText(user.title || "Chưa có danh hiệu", 120, 90);

  // --- Tộc ---
  if (user.race) {
    await drawStat(ctx, `./assets/icons/${user.race}.png`, "", 120, 110);
    ctx.font = fonts.subtitle;
    ctx.fillStyle = "#fff";
    ctx.fillText(races[user.race]?.name || "Chưa chọn", 150, 128);
  } else {
    ctx.fillText("Tộc: Chưa chọn", 120, 128);
  }

  // --- Ngũ hành ---
  if (user.element) {
    await drawStat(ctx, `./assets/icons/${user.element}.png`, "", 120, 140);
    ctx.font = fonts.subtitle;
    ctx.fillStyle = "#fff";
    ctx.fillText(elements.display?.[user.element] || "Chưa chọn", 150, 158);
  } else {
    ctx.fillText("Ngũ hành: Chưa chọn", 120, 158);
  }

  // --- Realm + Level ---
  const realm = getRealm(user.level);
  ctx.font = fonts.subtitle;
  ctx.fillStyle = "#fff";
  ctx.fillText(`${realm} (Lv.${user.level})`, 25, 190);

  // --- Exp bar ---
  const expNow = user.exp;
  const expNeed = getExpNeeded(user.level);
  const barX = 25, barY = 210, barW = 550, barH = 16;

  ctx.fillStyle = "#444";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = "#4fc3f7";
  ctx.fillRect(barX, barY, Math.floor(barW * expNow / expNeed), barH);

  // --- Linh thạch ---
  await drawStat(ctx, "./assets/icons/lt.png", user.lt, 25, 240);

  // --- Stats ---
  let sx = 120, sy = 240;
  await drawStat(ctx, "./assets/icons/hp.png", user.maxHp, sx, sy);
  await drawStat(ctx, "./assets/icons/mp.png", user.maxMp, sx + 90, sy);
  await drawStat(ctx, "./assets/icons/atk.png", user.atk, sx + 180, sy);
  await drawStat(ctx, "./assets/icons/def.png", user.def, sx + 270, sy);
  await drawStat(ctx, "./assets/icons/spd.png", user.spd, sx + 360, sy);
  

  // --- Bio ---
  ctx.font = fonts.subtitle;
  ctx.fillStyle = "#ffd700";
  ctx.fillText("About me", 25, 300);

  ctx.font = fonts.text;
  ctx.fillStyle = "#eee";
  const bio = user.bio || "Chưa có";
  wrapText(ctx, bio, 25, 325, 550, 20);

  return canvas.toBuffer("image/png");
}

module.exports = { drawProfile };
