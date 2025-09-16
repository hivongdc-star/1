const { giftItem } = require("../shop/shopUtils");

module.exports = {
  name: "tang",
  aliases: ["gift"],
  run: async (client, msg, args) => {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("❌ Bạn phải mention một người để tặng.");

    const itemId = args[1];
    if (!itemId) return msg.reply("❌ Bạn phải ghi ID vật phẩm muốn tặng.");

    const res = giftItem(msg.author.id, target.id, itemId);
    msg.reply(res.message);
  },
};
