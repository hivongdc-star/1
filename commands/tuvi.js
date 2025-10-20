const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

// Chuẩn hoá chuỗi: bỏ dấu, ký tự lạ
function norm(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

// Đồng nghĩa tên 12 cung (VN & EN)
const SIGN_SYNONYMS = {
  aries: ["aries", "bach duong", "bd"],
  taurus: ["taurus", "kim nguu", "kim ngu", "kn"],
  gemini: ["gemini", "song tu", "st"],
  cancer: ["cancer", "cu giai", "cg"],
  leo: ["leo", "su tu", "sutu"],
  virgo: ["virgo", "xu nu", "xn"],
  libra: ["libra", "thien binh", "tb"],
  scorpio: ["scorpio", "bo cap", "bocap", "thien yet", "thien y et"],
  sagittarius: ["sagittarius", "nhan ma", "nm"],
  capricorn: ["capricorn", "ma ket", "mk"],
  aquarius: ["aquarius", "bao binh", "bb"],
  pisces: ["pisces", "song ngu", "sn"],
};

// Map alias -> tên chuẩn
const SIGN_MAP = (() => {
  const m = {};
  for (const [canon, arr] of Object.entries(SIGN_SYNONYMS)) {
    for (const s of arr) m[norm(s)] = canon;
  }
  return m;
})();

// Tên hiển thị tiếng Việt
const SIGN_VI_NAME = {
  aries: "Bạch Dương",
  taurus: "Kim Ngưu",
  gemini: "Song Tử",
  cancer: "Cự Giải",
  leo: "Sư Tử",
  virgo: "Xử Nữ",
  libra: "Thiên Bình",
  scorpio: "Bọ Cạp",
  sagittarius: "Nhân Mã",
  capricorn: "Ma Kết",
  aquarius: "Bảo Bình",
  pisces: "Song Ngư",
};

module.exports = {
  name: "tuvi",
  description: "Xem tử vi HÔM NAY theo 12 cung hoàng đạo",
  aliases: ["tv", "horoscope", "zodiac"],
  usage: "-tuvi <cung>\nVD: -tuvi kim nguu | -tuvi bo cap",
  run: async (client, msg, args) => {
    try {
      if (!args || args.length === 0) {
        return msg.reply(
          "📌 Cách dùng: `-tuvi <cung>`\n" +
            "Ví dụ: `-tuvi kim nguu`, `-tuvi bo cap`.\n" +
            "Các cung: Bạch Dương, Kim Ngưu, Song Tử, Cự Giải, Sư Tử, Xử Nữ, Thiên Bình, Bọ Cạp, Nhân Mã, Ma Kết, Bảo Bình, Song Ngư."
        );
      }

      const signInput = args.join(" ");
      const signCanon = SIGN_MAP[norm(signInput)];
      if (!signCanon) {
        return msg.reply("❌ Không nhận dạng được **cung hoàng đạo**. Thử lại nhé!");
      }

      // Aztro API: chỉ 'today'
      const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(
        signCanon
      )}&day=today`;

      const { data } = await axios.post(url); // yêu cầu POST rỗng

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`🔮 Hôm nay · ${SIGN_VI_NAME[signCanon]} (${data.current_date})`)
        .setDescription(data.description || "Không có mô tả.")
        .addFields(
          { name: "🤝 Hợp cạ", value: data.compatibility || "—", inline: true },
          { name: "😊 Tâm trạng", value: data.mood || "—", inline: true },
          { name: "🎨 Màu may mắn", value: data.color || "—", inline: true },
          { name: "🔢 Số may mắn", value: String(data.lucky_number || "—"), inline: true },
          { name: "🕒 Giờ may mắn", value: data.lucky_time || "—", inline: true },
          { name: "📅 Khoảng ngày", value: data.date_range || "—", inline: true }
        )
        .setFooter({ text: "Nguồn: aztro · Tiễn Tình" })
        .setTimestamp();

      return msg.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Tử vi error:", err?.message || err);
      return msg.reply("⚠️ Xin lỗi, hiện chưa lấy được tử vi hôm nay. Thử lại sau nhé!");
    }
  },
};
