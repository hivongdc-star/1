const { loadUsers, saveUsers } = require("../utils/storage");
const { addRelaAmount } = require("../utils/relaUtils");
const { listItems } = require("../shop/shopUtils");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  name: "tang",
  aliases: ["tặng", "gift"],
  run: async (client, msg, args) => {
    const giverId = msg.author.id;
    const mentioned = msg.mentions.users.first();

    if (!mentioned || mentioned.bot || mentioned.id === giverId) {
      return msg.reply("❌ Bạn phải mention đúng người muốn tặng.");
    }
    const receiverId = mentioned.id;

    const users = loadUsers();
    const giver = users[giverId];
    const receiver = users[receiverId];
    if (!giver) return msg.reply("❌ Bạn chưa có hồ sơ nhân vật.");
    if (!receiver) return msg.reply("❌ Người nhận chưa có hồ sơ nhân vật.");

    const inv = giver.inventory || {};
    const catalog = listItems();

    // lọc item có qty > 0 và tồn tại trong catalog
    const available = Object.entries(inv)
      .filter(([id, qty]) => qty > 0 && catalog[id])
      .map(([id, qty]) => ({
        id,
        qty,
        ...catalog[id],
      }));

    if (!available.length) {
      return msg.reply("📭 Túi của bạn đang trống, không có gì để tặng.");
    }

    // tối đa 25 option cho select menu
    const options = available.slice(0, 25).map((it) => ({
      label: it.name,
      description: `Số lượng: x${it.qty} • ${it.description || ""}`,
      emoji: it.emoji || "🎁",
      value: it.id,
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`gift_select_${giverId}_${receiverId}`)
        .setPlaceholder("Chọn vật phẩm để tặng")
        .addOptions(options)
    );

    const ui = await msg.channel.send({
      content: `🎁 Chọn vật phẩm để tặng cho **${receiver.name || "Người nhận"}**:`,
      components: [row],
    });

    // collector
    const filter = (i) =>
      i.customId === `gift_select_${giverId}_${receiverId}` &&
      i.user.id === giverId;

    let selection;
    try {
      selection = await ui.awaitMessageComponent({
        filter,
        componentType: ComponentType.StringSelect,
        time: 30000,
      });
    } catch {
      await ui.edit({
        content: "⏰ Hết thời gian chọn vật phẩm.",
        components: [],
      });
      return;
    }

    const itemId = selection.values[0];
    const item = catalog[itemId];
    if (!item || !inv[itemId] || inv[itemId] <= 0) {
      await selection.update({
        content: "⚠️ Vật phẩm không khả dụng.",
        components: [],
      });
      return;
    }

    // trừ số lượng
    inv[itemId]--;
    if (inv[itemId] <= 0) delete inv[itemId];
    giver.inventory = inv;

    // cộng rela
    const relaGain = item.effect?.rela || 10;
    addRelaAmount(giverId, receiverId, relaGain);

    saveUsers(users);

    await selection.update({
      content: `🎉 **${giver.name || msg.author.username}** đã tặng **${
        item.emoji || "🎁"
     } ${item.name}** cho **${receiver.name || "Người nhận"}**!\n💞 Rela tăng **+${relaGain}**.`,
      components: [],
    });
  },
};
