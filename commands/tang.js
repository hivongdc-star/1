// commands/tang.js
const { loadUsers, saveUsers } = require("../utils/storage");
const { addRela } = require("../utils/relaUtils");
const { listItems } = require("../shop/shopUtils");
const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");

module.exports = {
  name: "tang",
  aliases: ["tặng","gift"],
  run: async (client, msg) => {
    const giverId = msg.author.id;
    const to = msg.mentions.users.first();
    if (!to || to.bot || to.id===giverId) return msg.reply("❌ Mention người nhận hợp lệ.");
    const receiverId = to.id;

    const users = loadUsers(); const catalog = listItems();
    const giver = users[giverId]; const receiver = users[receiverId];
    if (!giver) return msg.reply("❌ Bạn chưa có nhân vật.");
    if (!receiver) return msg.reply("❌ Người nhận chưa có nhân vật.");

    const inv = giver.inventory||{};
    const avail = Object.entries(inv).filter(([id,qty])=>qty>0 && catalog[id]).slice(0,25);
    if (!avail.length) return msg.reply("📭 Túi trống.");

    const options = avail.map(([id,qty])=>{
      const it=catalog[id]; return { label:`${it.emoji||"🎁"} ${it.name}`.slice(0,100), value:id, description:`x${qty}`.slice(0,100) };
    });

    const row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
      .setCustomId(`gift_${giverId}_${receiverId}`).setPlaceholder("Chọn vật phẩm để tặng").addOptions(options));

    const sent = await msg.reply({ content:`🎁 Chọn vật phẩm tặng cho **${receiver.name||"Người nhận"}**`, components:[row] });

    const col = sent.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 30_000 });
    col.on("collect", async i=>{
      if (i.user.id!==giverId) return i.reply({ content:"Không phải menu của bạn.", ephemeral:true });
      await i.deferUpdate();
      const itemId = i.values[0];
      const it = catalog[itemId];
      const qty = inv[itemId]||0;
      if (!it || qty<=0) return sent.edit({ content:"⚠️ Vật phẩm không khả dụng.", components:[] });

      // trừ và cộng
      inv[itemId]-=1; if (inv[itemId]<=0) delete inv[itemId];
      users[giverId].inventory = inv;
      users[receiverId].inventory = users[receiverId].inventory||{};
      users[receiverId].inventory[itemId] = (users[receiverId].inventory[itemId]||0)+1;

      // rela effect
      const gain = Number(it.effect?.rela||0);
      if (Number.isFinite(gain) && gain>0) addRela(giverId, receiverId, gain);

      saveUsers(users);
      return sent.edit({ content:`🎉 **${giver.name||msg.author.username}** đã tặng **${it.emoji||"🎁"} ${it.name}** cho <@${receiverId}>${gain>0?` • RELA +${gain}`:""}.`, components:[] });
    });
    col.on("end", ()=> sent.edit({ components:[] }).catch(()=>{}));
  }
};
