const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const { listItems, buyItem } = require("../shop/shopUtils");

module.exports = {
  name: "shop",
  aliases: [],
  run: async (client, msg, args) => {
    const catalog = listItems();
    const entries = Object.entries(catalog);

    const options = entries.slice(0,25).map(([id, it]) => ({
      label: `${it.emoji || ""} ${it.name}`.trim().slice(0, 100),
      value: id,
      description: `${(it.price||0)} LT • ${it.type}`.slice(0, 100),
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`shop_${msg.author.id}`)
      .setPlaceholder("Chọn vật phẩm để mua...")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);
    const sent = await msg.reply({
      content: "🛒 **Shop** — chọn vật phẩm bên dưới để mua (nhẫn cần mention partner).",
      components: [row]
    });

    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== msg.author.id)
        return i.reply({ content: "❌ Đây không phải menu của bạn.", ephemeral: true });

      const itemId = i.values[0];
      const target = msg.mentions.users.first();
      const targetId = target ? target.id : null;

      const res = buyItem(msg.author.id, itemId, targetId);
      await i.reply({ content: res.message, ephemeral: true });
    });

    collector.on("end", () => {
      sent.edit({ components: [] }).catch(()=>{});
    });
  },
};
