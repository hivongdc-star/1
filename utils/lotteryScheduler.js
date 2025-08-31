// utils/lotteryScheduler.js
const schedule = require("node-schedule");
const { drawWinner } = require("./lottery");

const CHANNEL_ID = "ID_CHANNEL_THONG_BAO"; // 🔴 thay bằng channel ID thật

function start(client) {
  // Nhắc nhở lúc 19:50
  schedule.scheduleJob("50 19 * * *", () => {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel)
      channel.send(
        "⏰ 10 phút nữa quay số! Ai chưa mua vé thì nhanh tay `-lottery buy` nhé!"
      );
  });

  // Quay thưởng 20h
  schedule.scheduleJob("0 20 * * *", () => {
    const result = drawWinner();
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) channel.send(result.msg);
  });
}

module.exports = (client) => start(client);
