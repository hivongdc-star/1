const dictionary = require("../data/dictionary_vi.json");
const { addLT } = require("../utils/currency");
const config = require("./noitu.config");

// Kiểm tra từ hợp lệ trong từ điển
function checkWordValid(word) {
  const clean = word.toLowerCase().trim();
  if (config.strictMode) {
    return !!dictionary[clean];
  }
  return true;
}

// Tách tiếng đầu và cuối
function getFirstLast(word) {
  const parts = word.toLowerCase().trim().split(" ");
  return {
    first: parts[0],
    last: parts[parts.length - 1],
  };
}

// Kiểm tra nối từ có hợp lệ không
function canChain(prevWord, newWord) {
  if (!prevWord) return true; // từ đầu tiên luôn hợp lệ
  const prev = getFirstLast(prevWord);
  const curr = getFirstLast(newWord);
  return prev.last === curr.first;
}

// Cộng LT khi nhập từ hợp lệ
function rewardWord(userId, amount = config.rewardPerWord) {
  addLT(userId, amount);
}

module.exports = {
  checkWordValid,
  getFirstLast,
  canChain,
  rewardWord,
};
