const { loadImage } = require("@napi-rs/canvas");

// Cache icons để không load nhiều lần
const cache = {};

async function getIcon(name) {
  if (!cache[name]) {
    cache[name] = await loadImage(`./assets/icons/${name}.png`);
  }
  return cache[name];
}

module.exports = { getIcon };
