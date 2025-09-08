const config = require("./noitu.config");
const { canChain, checkWordValid, rewardWord } = require("./noituUtils");

const noituState = {}; // { channelId: {...} }

function startGame(channelId) {
  noituState[channelId] = {
    active: true,
    wordCount: 0,
    maxWords: config.maxWords,
    lastWord: null,
    history: [],
    players: {},
  };
}

function stopGame(channelId) {
  const state = noituState[channelId];
  delete noituState[channelId];
  return state;
}

function getGame(channelId) {
  return noituState[channelId];
}

function addTurn(channelId, userId, word) {
  const state = noituState[channelId];
  if (!state) return { success: false };

  if (!checkWordValid(word)) {
    return { success: false };
  }

  if (!canChain(state.lastWord, word)) {
    return { success: false };
  }

  // Nếu hợp lệ
  state.lastWord = word;
  state.history.push(word);
  state.wordCount++;
  state.players[userId] = (state.players[userId] || 0) + 1;

  rewardWord(userId);

  return { success: true };
}

module.exports = { startGame, stopGame, getGame, addTurn };
