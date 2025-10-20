const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

// ===== Helpers =====
function norm(s = "") {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "").trim();
}

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

const SIGN_MAP = (() => {
  const m = {};
  for (const [canon, arr] of Object.entries(SIGN_SYNONYMS)) {
    for (const s of arr) m[norm(s)] = canon;
  }
  return m;
})();

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Primary: Ohmanda (free, no key) -> GET https://ohmanda.com/api/horoscope/{sign}
async function fetchOhmanda(sign) {
  const url = `https://ohmanda.com/api/horoscope/${encodeURIComponent(sign)}`;
  const { data } = await axios.get(url, { timeout: 7000 });
  // { sign, date, horoscope }
  if (!data?.horoscope) throw new Error("ohmanda: empty data");
  return {
    src: "Ohmanda",
    current_date: data.date || "",
    description: data.horoscope || "",
    compatibility: "—",
    mood: "—",
    color: "—",
    lucky_number: "—",
    lucky_time: "—",
    date_range: "—",
  };
}

// Fallback 1: Vercel wrapper (free, no key)
async function fetchVercel(sign) {
  const url = "https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily";
  const { data } = await axios.get(url, { params: { sign, day: "today" }, timeout: 7000 });
  const d = data?.data;
  if (!d?.horoscope_data) throw new Error("vercel: empty data");
  return {
    src: "Horoscope Fallback",
    current_date: d.date || "",
    description: d.horoscope_data || "",
    compatibility: "—",
    mood: "—",
    color: "—",
    lucky_number: "—",
    lucky_time: "—",
    date_range: "—",
  };
}

// Fallback 2: Aztro (POST, no key) — phòng khi 503; thử 2 lần backoff
async function fetchAztro(sign) {
  const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(sign)}&day=today`;
  const headers = { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "cultivation-bot/1.5.6" };
  let last;
  for (let i = 0; i < 2; i++) {
    try {
      const { data } = await axios.post(url, "", { headers, timeout: 7000 });
      if (!data?.description) throw new Error("aztro: empty data");
      return { src: "Aztro", ...data };
    } catch (e) {
      last = e;
      const code = e?.response?.status;
      if (code && code < 500) break;
      await sleep(800 * (i + 1));
    }
  }
  throw last || new Error("aztro failed");
}

module.exports = {
  name: "tuvi",
  description: "Xem tử vi HÔM NAY theo 12 cung hoàng đạo (API mới + dự phòng)",
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
      const signCanon = SIGN_MAP[norm(args.join(" "))];
      if (!signCanon) return msg.reply("❌ Không nhận dạng được **cung hoàng đạo**. Thử lại nhé!");

      let result = null;
      // Thứ tự: Ohmanda -> Vercel -> Aztro
      try {
        result = await fetchOhmanda(signCanon);
      } catch (e1) {
        try {
          result = await fetchVercel(signCanon);
        } catch (e2) {
          result = await fetchAztro(signCanon);
        }
      }

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`🔮 Hôm nay · ${SIGN_VI_NAME[signCanon]}${result.current_date ? ` (${result.current_date})` : ""}`)
        .setDescription(result.description || "Không có dữ liệu.")
        .addFields(
          { name: "🤝 Hợp cạ", value: result.compatibility || "—", inline: true },
          { name: "😊 Tâm trạng", value: result.mood || "—", inline: true },
          { name: "🎨 Màu may mắn", value: result.color || "—", inline: true },
          { name: "🔢 Số may mắn", value: String(result.lucky_number || "—"), inline: true },
          { name: "🕒 Giờ may mắn", value: result.lucky_time || "—", inline: true },
          { name: "📅 Khoảng ngày", value: result.date_range || "—", inline: true },
        )
        .setFooter({ text: `Nguồn: ${result.src} · Tiễn Tình` })
        .setTimestamp();

      return msg.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("tuvi error:", err?.response?.status || err?.message || err);
      return msg.reply("⚠️ Hệ thống tử vi đang bận. Thử lại sau một lát nhé!");
    }
  },
};
