const fs = require("fs");
const path = "./data/lottery.json";
const { addLT, removeLT, getLT } = require("./currency");

let lottery = { jackpot: 0, tickets: {}, lastWinner: null };

// Load & Save
function loadLottery() {
  if (fs.existsSync(path)) {
    lottery = JSON.parse(fs.readFileSync(path));
  }
}
function saveLottery() {
  fs.writeFileSync(path, JSON.stringify(lottery, null, 2));
}

// Mua vé
function buyTicket(user, amount, ticketPrice = 10) {
  let totalCost = amount * ticketPrice;
  if (getLT(user) < totalCost)
    return { success: false, msg: "❌ Không đủ LT mua vé!" };

  removeLT(user, totalCost);
  lottery.jackpot += totalCost;
  lottery.tickets[user] = (lottery.tickets[user] || 0) + amount;
  saveLottery();
  return {
    success: true,
    msg: `🎟️ Bạn đã mua ${amount} vé với giá ${totalCost} LT`,
  };
}

// Cộng tiền vào hũ
function addToJackpot(amount) {
  lottery.jackpot += amount;
  saveLottery();
}

// Xem hũ + thông tin thêm
function getPot() {
  let ticketCount = Object.values(lottery.tickets).reduce((a, b) => a + b, 0);
  return {
    jackpot: lottery.jackpot,
    lastWinner: lottery.lastWinner,
    ticketCount,
  };
}

// Quay thưởng
function drawWinner() {
  let ticketsArray = [];
  for (let uid in lottery.tickets) {
    for (let i = 0; i < lottery.tickets[uid]; i++) {
      ticketsArray.push(uid);
    }
  }
  if (ticketsArray.length === 0)
    return { success: false, msg: "❌ Không có vé số nào!" };

  const winner = ticketsArray[Math.floor(Math.random() * ticketsArray.length)];
  let prize = lottery.jackpot;
  addLT(winner, prize);

  lottery.lastWinner = winner;
  lottery.jackpot = 0;
  lottery.tickets = {};
  saveLottery();

  return {
    success: true,
    msg: `🎉 Người trúng số hôm nay là <@${winner}>! Nhận ${prize} LT`,
    winner,
    prize,
  };
}

loadLottery();
module.exports = { buyTicket, getPot, addToJackpot, drawWinner };
