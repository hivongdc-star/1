const backgrounds = require("../data/br.json");

function getBackground(key) {
  return backgrounds[key] || backgrounds.default;
}

function listBackgrounds() {
  return backgrounds;
}

function isValidBackground(key) {
  return Boolean(backgrounds[key]);
}

module.exports = { getBackground, listBackgrounds, isValidBackground };
