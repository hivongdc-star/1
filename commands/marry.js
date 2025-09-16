const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { loadUsers, saveUsers } = require("../utils/storage");
const { getRela, listItems } = require("../shop/shopUtils");

module.exports = {
  name: "marry",
  aliases: ["relationship", "quanhe"],
  run: async (client, msg) => {
    const users = loadUsers();
    const user = users[msg.author.id];
    if (!user) return msg.reply("❌ Bạn chưa có nhân vật.");

    // tìm partner đủ rela
    const partnerIds = Object.entries(user.relationships?.partners || {})
      .filter(([id, rel]) => rel.rela >= 1000)
      .map(([id]) => id);

    if (partnerIds.length === 0) {
      return msg.reply("❌ Bạn chưa có partner nào đạt đủ 1000 điểm rela để kết hôn.");
    }

    // tạo menu chọn partner
    const partnerOptions = partnerIds.map((id) => ({
      label: users[id]?.name || `ID:${id}`,
      value: id,
      description: `Rela: ${getRela(msg.author.id, id)}`,
    }));

    const partnerMenu = new StringSelectMenuBuilder()
      .setCustomId(`marry_partner_${msg.author.id}`)
      .setPlaceholder("Chọn partner để cầu hôn...")
      .addOptions(partnerOptions);

    const row = new ActionRowBuilder().addComponents(partnerMenu);
    const sent = await msg.reply({ content: "💞 Hãy chọn partner bạn muốn cầu hôn:", components: [row] });

    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== msg.author.id)
        return i.reply({ content: "❌ Đây không phải menu của bạn.", ephemeral: true });

      const partnerId = i.values[0];
      const partner = users[partnerId];
      if (!partner) return i.reply({ content: "❌ Partner không tồn tại.", ephemeral: true });

      // kiểm tra inventory nhẫn
      const inv = user.inventory || {};
      const ringIds = Object.keys(inv).filter((id) => id.startsWith("ring_") && inv[id] > 0);
      if (ringIds.length === 0) {
        return i.update({ content: "❌ Bạn không có nhẫn nào trong túi.", components: [] });
      }

      // menu chọn nhẫn
      const items = listItems();
      const ringOptions = ringIds.map((id) => ({
        label: items[id]?.name || id,
        value: id,
        description: items[id]?.description || "",
        emoji: items[id]?.emoji || "💍",
      }));

      const ringMenu = new StringSelectMenuBuilder()
        .setCustomId(`marry_ring_${msg.author.id}_${partnerId}`)
        .setPlaceholder("Chọn nhẫn cưới để cầu hôn...")
        .addOptions(ringOptions);

      const row2 = new ActionRowBuilder().addComponents(ringMenu);
      await i.update({ content: `💍 Chọn nhẫn để cầu hôn **${partner.name}**:`, components: [row2] });
    });

    // bước 2: chọn nhẫn
    client.on("interactionCreate", async (i) => {
      if (!i.isStringSelectMenu()) return;
      if (!i.customId.startsWith("marry_ring_")) return;

      const [_, __, authorId, partnerId] = i.customId.split("_");
      if (i.user.id !== authorId) return;

      const ringId = i.values[0];
      const users2 = loadUsers();
      const u = users2[authorId];
      const p = users2[partnerId];
      if (!u || !p) return i.reply({ content: "❌ Lỗi dữ liệu.", ephemeral: true });

      const item = listItems()[ringId];
      if (!item) return i.reply({ content: "❌ Nhẫn cưới không hợp lệ.", ephemeral: true });

      // hỏi partner đồng ý
      const rowConfirm = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`accept_marry_${authorId}_${partnerId}_${ringId}`).setLabel("Đồng ý 💖").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`deny_marry_${authorId}_${partnerId}`).setLabel("Từ chối 💔").setStyle(ButtonStyle.Danger)
      );

      await i.update({
        content: `💍 **${u.name}** muốn kết hôn với **${p.name}** bằng **${item.emoji} ${item.name}**.\n${p.name}, bạn có đồng ý không?`,
        components: [rowConfirm],
      });
    });

    // bước 3: partner đồng ý / từ chối
    client.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;

      if (i.customId.startsWith("accept_marry_")) {
        const [_, __, authorId, partnerId, ringId] = i.customId.split("_");
        if (i.user.id !== partnerId) {
          return i.reply({ content: "❌ Đây không phải lời cầu hôn gửi cho bạn.", ephemeral: true });
        }

        const users3 = loadUsers();
        const u = users3[authorId];
        const p = users3[partnerId];
        if (!u || !p) return i.reply({ content: "❌ Lỗi dữ liệu.", ephemeral: true });

        if ((u.inventory[ringId] || 0) <= 0) {
          return i.reply({ content: "❌ Người cầu hôn không còn nhẫn.", ephemeral: true });
        }

        const item = listItems()[ringId];

        // cập nhật quan hệ
        u.relationships.partnerId = partnerId;
        u.relationships.status = "married";
        u.relationships.since = Date.now();
        u.relationships.ringBonus = item.bonus || {};

        p.relationships.partnerId = authorId;
        p.relationships.status = "married";
        p.relationships.since = Date.now();
        p.relationships.ringBonus = item.bonus || {};

        // trừ nhẫn
        u.inventory[ringId] -= 1;
        if (u.inventory[ringId] <= 0) delete u.inventory[ringId];

        // mở khóa danh hiệu
        if (item.bonus?.title_unlock && !u.titles.includes(item.bonus.title_unlock)) {
          u.titles.push(item.bonus.title_unlock);
        }

        users3[authorId] = u;
        users3[partnerId] = p;
        saveUsers(users3);

        await i.update({ content: `🎉 Chúc mừng! 💍 **${u.name}** và **${p.name}** đã kết hôn bằng **${item.name}**!`, components: [] });
      }

      if (i.customId.startsWith("deny_marry_")) {
        const [_, __, authorId, partnerId] = i.customId.split("_");
        if (i.user.id !== partnerId) {
          return i.reply({ content: "❌ Đây không phải lời cầu hôn gửi cho bạn.", ephemeral: true });
        }

        await i.update({ content: `💔 **${users[partnerId].name}** đã từ chối lời cầu hôn của **${users[authorId].name}**.`, components: [] });
      }
    });
  },
};
