const { GlobalFonts } = require("@napi-rs/canvas");

function registerFonts() {
  GlobalFonts.registerFromPath("./assets/fonts/DejaVuSans.ttf", "DejaVu");
  GlobalFonts.registerFromPath("./assets/fonts/NotoSans-Regular.ttf", "NotoSans");
  GlobalFonts.registerFromPath("./assets/fonts/CinzelDecorative.ttf", "Cinzel");
}

const fonts = {
  title: "28px Cinzel",
  subtitle: "20px NotoSans",
  text: "16px DejaVu",
};

module.exports = { registerFonts, fonts };
