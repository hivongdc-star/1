const { EmbedBuilder } = require("discord.js");
const { loadUsers, saveUsers } = require("../utils/storage");

const items = {
  weapons: [
    { id: "w1", name: "⚔️ Trảm Yêu Kiếm", price: 100, stat: { attack: 5 } },
    { id: "w2", name: "🗡️ Huyết Ảnh Đao", price: 200, stat: { attack: 10 } },
    { id: "w3", name: "🔱 Long Vũ Thương", price: 400, stat: { attack: 20 } },
  ],
  armors: [
    { id: "a1", name: "🛡️ Thiết Giáp", price: 100, stat: { defense: 5 } },
    { id: "a2", name: "🥋 Linh Vân Y", price: 200, stat: { defense: 10 } },
    {
      id: "a3",
      name: "👘 Huyền Thiên Khải",
      price: 400,
      stat: { defense: 20 },
    },
  ],
  rings: [
    { id: "r1", name: "💍 Linh Thạch Giới", price: 100, stat: { mana: 20 } },
    { id: "r2", name: "💎 Ngọc Tâm Giới", price: 200, stat: { mana: 40 } },
    { id: "r3", name: "🔮 Thần Vũ Giới", price: 400, stat: { mana: 80 } },
  ],
  boots: [
    { id: "b1", name: "👢 Thảo Vân Hài", price: 100, stat: { hp: 10 } },
    { id: "b2", name: "🥾 Thiết Hài", price: 200, stat: { hp: 20 } },
    { id: "b3", name: "🦶 Vân Du Hài", price: 400, stat: { hp: 40 } },
  ],
};

function renderShop() {
  let desc = "";
  for (const cat in items) {
    desc += `**${cat.toUpperCase()}**\n`;
    items[cat].forEach((it) => {
      desc += `\`${it.id}\` - ${it.name} | 💎 ${it.price}\n`;
    });
    desc += "\n";
  }
  return desc;
}

module.exports = {
  name: "shop",
  run: (client, msg, args) => {
    const users = loadUsers();
    const user = users[msg.author.id];
    if (!user) return msg.channel.send("❌ Bạn chưa có nhân vật.");

    if (args.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("🏪 Cửa Hàng")
        .setDescription(renderShop())
        .setColor(0x00ffcc)
        .setFooter({ text: "Dùng: -shop buy <id> | -shop sell <slot>" });
      return msg.channel.send({ embeds: [embed] });
    }

    const action = args[0].toLowerCase();

    if (action === "buy") {
      const id = args[1];
      if (!id) return msg.channel.send("❌ Hãy nhập ID trang bị muốn mua.");

      let found;
      for (const cat in items) {
        found = items[cat].find((it) => it.id === id);
        if (found) break;
      }
      if (!found) return msg.channel.send("❌ Không tìm thấy trang bị.");

      if (user.currency < found.price)
        return msg.channel.send("❌ Không đủ linh thạch.");

      // trang bị vào slot
      if (!user.equipment) user.equipment = {};
      if (found.id.startsWith("w")) user.equipment.weapon = found;
      else if (found.id.startsWith("a")) user.equipment.armor = found;
      else if (found.id.startsWith("r")) user.equipment.ring = found;
      else if (found.id.startsWith("b")) user.equipment.boots = found;

      user.currency -= found.price;
      saveUsers(users);

      msg.channel.send(`✅ Bạn đã mua ${found.name}`);
    }

    if (action === "sell") {
      const slot = args[1];
      if (!slot)
        return msg.channel.send("❌ Hãy nhập slot (weapon/armor/ring/boots).");
      if (!user.equipment || !user.equipment[slot])
        return msg.channel.send("❌ Bạn không có trang bị ở slot này.");

      const sold = user.equipment[slot];
      user.currency += Math.floor(sold.price / 2);
      delete user.equipment[slot];
      saveUsers(users);

      msg.channel.send(
        `✅ Bạn đã bán ${sold.name} được 💎 ${Math.floor(sold.price / 2)}`
      );
    }
  },
};
