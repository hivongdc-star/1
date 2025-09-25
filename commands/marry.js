// commands/marry.js
const {
  ActionRowBuilder, StringSelectMenuBuilder, ComponentType,
  EmbedBuilder, ButtonBuilder, ButtonStyle
} = require("discord.js");
const { loadUsers, saveUsers } = require("../utils/storage");
const { eligiblePartners, isMarried, getSpouse, marryPair } = require("../utils/relaUtils");

module.exports = {
  name: "marry",
  run: async (client, msg) => {
    const userId = msg.author.id;
    const users = loadUsers();
    const me = users[userId];
    if (!me) return msg.reply("❌ Bạn chưa có nhân vật.");

    // Nếu đã kết hôn → hiển thị embed + nút ly hôn
    const spouseId = getSpouse(userId);
    if (spouseId) {
      const pair = users[userId].relationships.partners[spouseId];
      const embed = new EmbedBuilder()
        .setTitle("💍 Đạo lữ")
        .addFields(
          { name:"Đạo lữ", value:`<@${spouseId}>`, inline:true },
          { name:"Đạo duyên", value:String(pair.daoDuyen||0), inline:true },
          { name:"Ngày kết hôn", value: new Date(pair.marriedAt||Date.now()).toLocaleString("vi-VN"), inline:false },
          { name:"Nhẫn", value: pair.ringId ? `\`${pair.ringId}\`` : "—", inline:true },
        );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`divorce_${userId}_${spouseId}`).setLabel("Ly hôn").setStyle(ButtonStyle.Danger)
      );
      const sent = await msg.reply({ embeds:[embed], components:[row] });

      const c = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30_000 });
      c.on("collect", async i=>{
        if (i.user.id!==userId) return i.reply({ content:"Không phải nút của bạn.", ephemeral:true });
        await i.deferUpdate();
        // Xác nhận 2 bước
        await sent.edit({ components:[
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`divorce_confirm_${userId}_${spouseId}`).setLabel("Xác nhận ly hôn").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`divorce_cancel_${userId}`).setLabel("Hủy").setStyle(ButtonStyle.Secondary)
          )
        ]});
      });
      c.on("end", ()=> sent.edit({ components:[] }).catch(()=>{}));

      const c2 = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
      c2.on("collect", async i=>{
        if (i.user.id!==userId) return i.reply({ content:"Không phải nút của bạn.", ephemeral:true });
        if (i.customId===`divorce_confirm_${userId}_${spouseId}`) {
          const { divorce } = require("../utils/relaUtils");
          divorce(userId, spouseId);
          return sent.edit({ content:"✅ Đã ly hôn.", embeds:[], components:[] });
        }
        if (i.customId===`divorce_cancel_${userId}`) {
          return i.reply({ content:"Đã hủy.", ephemeral:true });
        }
      });
      return;
    }

    // Chưa kết hôn → yêu cầu có nhẫn trong inventory
    const inv = me.inventory || {};
    const ringIds = Object.keys(inv).filter(id=>id.startsWith("ring_") && inv[id]>0);
    if (!ringIds.length) return msg.reply("❌ Bạn cần một **nhẫn** trong túi để cầu hôn.");

    // Chọn partner có RELA ≥ 1000
    const candidates = eligiblePartners(userId, 1000).slice(0, 25);
    if (!candidates.length) return msg.reply("❌ Chưa có ai đạt **1000 RELA**.");

    const options = candidates.map(c=>({
      label: `@${c.partnerId}`.slice(0,100),
      value: c.partnerId,
      description: `${c.value} RELA`
    }));
    const ringOptions = ringIds.map(id=>({ label: id, value:id }));

    const rowPartner = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId(`marry_pick_${userId}`).setPlaceholder("Chọn người cầu hôn").addOptions(options)
    );
    const rowRing = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId(`marry_ring_${userId}`).setPlaceholder("Chọn nhẫn").addOptions(ringOptions)
    );
    const sent = await msg.reply({ content:"💍 Chọn **đối tượng** và **nhẫn** để cầu hôn.", components:[rowPartner, rowRing] });

    const picks = { partner:null, ring:null };
    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });
    collector.on("collect", async i=>{
      if (i.user.id!==userId) return i.reply({ content:"Không phải menu của bạn.", ephemeral:true });
      await i.deferUpdate();
      if (i.customId===`marry_pick_${userId}`) picks.partner = i.values[0];
      if (i.customId===`marry_ring_${userId}`) picks.ring = i.values[0];
      if (picks.partner && picks.ring) collector.stop("ready");
    });
    collector.on("end", async (_c, reason)=>{
      if (reason!=="ready") return sent.edit({ content:"⏰ Hết thời gian.", components:[] }).catch(()=>{});
      // Gửi select menu cho đối phương xác nhận
      const targetId = picks.partner; const ringId = picks.ring;
      const confirmMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`marry_accept_${userId}_${targetId}_${ringId}`)
          .setPlaceholder("Đồng ý kết hôn?")
          .addOptions(
            { label:"Đồng ý", value:"yes", description:"Chúng ta thành đạo lữ" },
            { label:"Từ chối", value:"no", description:"Xin lỗi" },
          )
      );
      const prompt = await msg.channel.send({ content: `💍 <@${targetId}>, bạn có đồng ý kết hôn với <@${userId}> không?`, components:[confirmMenu] });

      const c2 = prompt.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 30_000 });
      c2.on("collect", async i=>{
        if (i.user.id!==targetId) return i.reply({ content:"Không phải lời mời dành cho bạn.", ephemeral:true });
        await i.deferUpdate();
        const v = i.values[0];
        if (v!=="yes") { return prompt.edit({ content:"❌ Đối phương đã từ chối.", components:[] }); }

        // Re-check trạng thái và nhẫn
        const u2 = loadUsers();
        if (isMarried(userId, targetId) || getSpouse(userId) || getSpouse(targetId))
          return prompt.edit({ content:"⚠️ Một trong hai đã kết hôn.", components:[] });

        const inv2 = (u2[userId].inventory||{});
        if (!inv2[ringId] || inv2[ringId]<=0) return prompt.edit({ content:"⚠️ Bạn không còn nhẫn đã chọn.", components:[] });

        // Trừ nhẫn rồi marry
        inv2[ringId] -= 1; if (inv2[ringId]<=0) delete inv2[ringId];
        u2[userId].inventory = inv2; saveUsers(u2);

        const { marriedAt, gain } = marryPair(userId, targetId, ringId);

        // Mở khóa danh hiệu theo Đạo Duyên / nhẫn
        const { checkAndGrantTitles } = require("../utils/titleUtils");
        checkAndGrantTitles(userId, targetId, { ringId, daoDuyenAdded: gain });

        prompt.edit({ content:`🎉 <@${userId}> và <@${targetId}> đã kết hôn! (Đạo duyên +${gain})`, components:[] });
      });
      c2.on("end", ()=> prompt.edit({ components:[] }).catch(()=>{}));
    });
  }
};
