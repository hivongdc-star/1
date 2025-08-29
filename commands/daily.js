const { claimDaily } = require("../utils/currency");

module.exports = {
  name: "daily",
  run: (client, msg) => {
    const result = claimDaily(msg.author.id);
    msg.channel.send(result.message);
  },
};
