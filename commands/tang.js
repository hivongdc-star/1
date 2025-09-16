// commands/tang.js
const { loadUsers, saveUsers } = require("../utils/storage");
const { addRelaAmount } = require("../utils/relaUtils");
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
    if (!users[giverId]) return msg.reply("❌ Bạn chưa có hồ sơ nhân vật.");
    if (!users[receiverId]) return msg.reply("❌ Người nhận chưa có hồ sơ nhân vật.");

    const inv = Array.isArray(users[giverId].inventory) ? users[giverId].inventory : [];
    const available = inv.filter((it) => (it?.qty ?? 0) > 0);
    if (!available.length) {
      return msg.reply("📭 Túi của bạn đang trống, không có gì để tặng.");
    }

    // tối đa 25 option cho menu
    const options = available.slice(0, 25).map((it, idx) => ({
      label: `${it.name ?? `Item ${idx + 1}`}`,
      description: `Số lượng: x${it.qty}${it.rela ? ` • +${it.rela} rela` : (it.value ? ` • trị giá ${it.value}` : "")}`,
      value: String(idx),
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`gift_select_${giverId}_${receiverId}`)
        .setPlaceholder("Chọn vật phẩm để tặng")
        .addOptions(options)
    );

    const ui = await msg.channel.send({
      content: `🎁 Chọn vật phẩm để tặng cho <@${receiverId}>:`,
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
      await ui.edit({ content: "⏰ Hết thời gian chọn vật phẩm.", components: [] });
      return;
    }

    const selIdx = parseInt(selection.values[0], 10);
    if (isNaN(selIdx) || selIdx < 0 || selIdx >= available.length) {
      await selection.update({ content: "❌ Lựa chọn không hợp lệ.", components: [] });
      return;
    }

    const chosenItem = available[selIdx];
    const realIndex = inv.findIndex((x) => x === chosenItem);
    if (realIndex === -1 || inv[realIndex].qty <= 0) {
      await selection.update({ content: "⚠️ Vật phẩm không còn khả dụng.", components: [] });
      return;
    }

    // trừ vật phẩm
    inv[realIndex].qty -= 1;
    if (inv[realIndex].qty <= 0) inv.splice(realIndex, 1);
    users[giverId].inventory = inv;

    // cộng rela
    const relaGain = typeof chosenItem.rela === "number"
      ? chosenItem.rela
      : (typeof chosenItem.value === "number" ? chosenItem.value : 10);

    addRelaAmount(giverId, receiverId, Math.max(0, Math.floor(relaGain)));

    saveUsers(users);

    await selection.update({
      content: `🎉 <@${giverId}> đã tặng **${chosenItem.name ?? "vật phẩm"}** cho <@${receiverId}>!\n💞 Rela của hai bạn **+${Math.max(0, Math.floor(relaGain))}**.`,
      components: [],
    });
  },
};
