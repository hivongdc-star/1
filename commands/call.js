// ✅ Tương thích Node.js 16+
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { EmbedBuilder } = require("discord.js");

// 💫 API key (ghi trực tiếp)
const GEMINI_API_KEY = "AIzaSyCacDkHISpdCEhSaErVztXr82YdMeA4EZQ";
const GEMINI_MODEL = "gemini-2.0-flash";

module.exports = {
  name: "call",
  aliases: ["tientinh", "tt", "talk"],
  description: "Trò chuyện với Tiễn Tình ✨",

  async run(client, msg, args) {
    if (!args.length) {
      return msg.reply("🌸 Hãy nói gì đó với **Tiễn Tình**, ví dụ: `-call Hôm nay trời đẹp nhỉ?`");
    }

    const question = args.join(" ");

    try {
      const thinking = await msg.channel.send("💭 **Tiễn Tình** đang suy nghĩ...");

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: question }] }],
          }),
        }
      );

      const data = await res.json();
      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Tiễn Tình khẽ cười nhưng không nói gì...";

      // 🌷 Embed phong cách nhẹ nhàng
      const embed = new EmbedBuilder()
        .setColor(0xf5b7d1)
        .setAuthor({
          name: "Tiễn Tình ✨",
          iconURL: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
        })
        .setDescription(`**💌 Bạn:** ${question}\n\n**🌸 Tiễn Tình:** ${answer}`)
        .setFooter({
          text: "Một lời từ Tiễn Tình",
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await thinking.edit({ content: "", embeds: [embed] });
    } catch (err) {
      console.error("Tiễn Tình error:", err);
      msg.reply("⚠️ Tiễn Tình thoáng ngẩn ngơ... hãy thử lại sau nhé.");
    }
  },
};
