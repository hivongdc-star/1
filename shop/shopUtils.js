const fs = require("fs");
const path = require("path");
const { loadUsers, saveUsers } = require("../utils/storage");

const itemsPath = path.join(__dirname, "items.json");
function loadItems() {
  return JSON.parse(fs.readFileSync(itemsPath, "utf8"));
}
function listItems() {
  return loadItems();
}

function ensureUserShape(user) {
  user.inventory = user.inventory || {};
  user.equipments = user.equipments || {};
  user.titles = user.titles || [];
  user.relationships = user.relationships || { partners: {} };
  return user;
}

function increaseRela(aId, bId, amount = 1) {
  const users = loadUsers();
  if (!users[aId] || !users[bId]) return { ok: false, message: "❌ Một trong hai người chưa có nhân vật." };
  const ua = ensureUserShape(users[aId]);
  const ub = ensureUserShape(users[bId]);

  ua.relationships.partners = ua.relationships.partners || {};
  ub.relationships.partners = ub.relationships.partners || {};

  const now = Date.now();
  const a2b = ua.relationships.partners[bId] || { rela: 0, status: "none", updatedAt: now };
  const b2a = ub.relationships.partners[aId] || { rela: 0, status: "none", updatedAt: now };

  a2b.rela = (a2b.rela || 0) + amount;
  b2a.rela = (b2a.rela || 0) + amount;
  a2b.updatedAt = b2a.updatedAt = now;

  ua.relationships.partners[bId] = a2b;
  ub.relationships.partners[aId] = b2a;

  users[aId] = ua;
  users[bId] = ub;
  saveUsers(users);
  return { ok: true, a2b, b2a };
}

function getRela(aId, bId) {
  const users = loadUsers();
  return users[aId]?.relationships?.partners?.[bId]?.rela || 0;
}

/**
 * Mua vật phẩm từ shop
 * - Với nhẫn cưới: chỉ cộng vào inventory (không cần partnerId)
 */
function buyItem(buyerId, itemId) {
  const users = loadUsers();
  const catalog = loadItems();
  const buyer = users[buyerId];
  if (!buyer) return { ok: false, message: "❌ Bạn chưa có nhân vật." };
  ensureUserShape(buyer);

  const item = catalog[itemId];
  if (!item) return { ok: false, message: "❌ Mặt hàng không tồn tại." };

  if ((buyer.lt || 0) < item.price) return { ok: false, message: "❌ Bạn không đủ LT để mua." };

  buyer.lt -= item.price;
  buyer.inventory[itemId] = (buyer.inventory[itemId] || 0) + 1;

  users[buyerId] = buyer;
  saveUsers(users);

  return { ok: true, message: `✅ Đã mua **${item.emoji} ${item.name}** với giá **${item.price} LT**.` };
}

/**
 * Tặng item cho người khác
 */
function giftItem(fromId, toId, itemId) {
  const users = loadUsers();
  const catalog = loadItems();
  const from = users[fromId], to = users[toId];
  if (!from || !to) return { ok: false, message: "❌ Người gửi hoặc người nhận chưa có nhân vật." };
  ensureUserShape(from); ensureUserShape(to);

  const item = catalog[itemId];
  if (!item) return { ok: false, message: "❌ Mặt hàng không tồn tại." };
  if ((from.inventory[itemId] || 0) < 1) return { ok: false, message: "❌ Bạn không có vật phẩm để tặng." };

  from.inventory[itemId] -= 1;
  if (from.inventory[itemId] <= 0) delete from.inventory[itemId];

  to.inventory[itemId] = (to.inventory[itemId] || 0) + 1;

  const inc = item.effect?.rela || 0;
  if (inc > 0) increaseRela(fromId, toId, inc);

  const users2 = loadUsers();
  users2[fromId] = from; users2[toId] = to;
  saveUsers(users2);

  return { ok: true, message: `🎁 Đã tặng **${item.emoji} ${item.name}** cho <@${toId}>.` };
}

module.exports = { listItems, buyItem, giftItem, increaseRela, getRela };
