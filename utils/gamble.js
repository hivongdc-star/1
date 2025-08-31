// utils/gamble.js
const { addLT, removeLT, getLT } = require("./currency");
const { addToJackpot } = require("./lottery");

// 🎲 Tài Xỉu
function playTaiXiu(user, bet) {
  if (getLT(user) < bet)
    return { success: false, msg: "❌ Bạn không đủ LT để cược!" };

  removeLT(user, bet);
  const dice = Array.from(
    { length: 3 },
    () => Math.floor(Math.random() * 6) + 1
  );
  const total = dice.reduce((a, b) => a + b, 0);
  let result = `🎲 Tung xúc xắc: ${dice.join(" + ")} = ${total}\n`;

  if (total >= 13) {
    let win = bet * 2;
    let tax = Math.floor(win * 0.05);
    win -= tax;
    addLT(user, win);
    addToJackpot(tax);
    result += `✨ Bạn thắng! Nhận ${win} LT (trích ${tax} LT vào Jackpot)`;
  } else {
    result += "💀 Bạn thua!";
  }
  return { success: true, msg: result };
}

// 🪙 Tung Xu
function playFlip(user, bet, choice) {
  if (getLT(user) < bet)
    return { success: false, msg: "❌ Bạn không đủ LT để cược!" };

  removeLT(user, bet);
  const side = Math.random() < 0.5 ? "ngửa" : "sấp";
  let result = `🪙 Tung đồng xu: ${side}\n`;

  if (side === choice) {
    let win = bet * 2;
    let tax = Math.floor(win * 0.05);
    win -= tax;
    addLT(user, win);
    addToJackpot(tax);
    result += `✨ Bạn đoán đúng! Nhận ${win} LT (trích ${tax} LT vào Jackpot)`;
  } else {
    result += "💀 Bạn đoán sai!";
  }
  return { success: true, msg: result };
}

// 🎰 Slot Machine
function playSlot(user, bet) {
  if (getLT(user) < bet)
    return { success: false, msg: "❌ Bạn không đủ LT để cược!" };

  removeLT(user, bet);
  const symbols = ["⚔️", "🌲", "💧", "🔥", "🪨", "💎"];
  const spin = Array.from(
    { length: 3 },
    () => symbols[Math.floor(Math.random() * symbols.length)]
  );
  let result = `🎰 [ ${spin.join(" | ")} ]\n`;

  if (spin.every((s) => s === spin[0])) {
    let win = spin[0] === "💎" ? bet * 50 : bet * 5;
    let tax = Math.floor(win * 0.05);
    win -= tax;
    addLT(user, win);
    addToJackpot(tax);
    result += `✨ Jackpot! Bạn thắng ${win} LT (trích ${tax} LT vào Jackpot)`;
  } else if (
    spin[0] === spin[1] ||
    spin[1] === spin[2] ||
    spin[0] === spin[2]
  ) {
    let win = bet * 2;
    let tax = Math.floor(win * 0.05);
    win -= tax;
    addLT(user, win);
    addToJackpot(tax);
    result += `✨ Bạn thắng nhỏ! Nhận ${win} LT (trích ${tax} LT vào Jackpot)`;
  } else {
    result += "💀 Bạn thua!";
  }
  return { success: true, msg: result };
}

module.exports = { playTaiXiu, playFlip, playSlot };
