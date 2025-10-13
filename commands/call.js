const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { EmbedBuilder } = require("discord.js");

// 💫 API key Gemini
const GEMINI_API_KEY = "AIzaSyCacDkHISpdCEhSaErVztXr82YdMeA4EZQ"; // Thay bằng key thật của bạn
const GEMINI_MODEL = "gemini-2.0-flash";

module.exports = {
  name: "call",
  aliases: ["tiëntình", "tientinh", "ask"],
  description: "Gọi Tiễn Tình để trò chuyện hoặc hỏi đáp.",

  async run(client, msg, args) {
    if (!args.length) {
      return msg.reply("💭 Hãy nói gì đó với **Tiễn Tình**, ví dụ: `-call Bạn nghĩ gì về tình yêu?`");
    }

    const question = args.join(" ");

    try {
      const thinking = await msg.channel.send("🌸 **Tiễn Tình** đang lắng nghe...");

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: question }],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      console.log("Gemini raw:", JSON.stringify(data, null, 2));

      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "❌ Tiễn Tình im lặng một lúc lâu... (không có phản hồi hợp lệ)";

      const embed = new EmbedBuilder()
        .setColor(0xffaacc)
        .setAuthor({
          name: "Tiễn Tình ✨",
          iconURL: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
        })
        .addFields(
          { name: "💌 Bạn hỏi:", value: question.slice(0, 1024) },
          { name: "🌷 Tiễn Tình nói:", value: answer.slice(0, 1024) }
        )
        .setFooter({
          text: "Trò chuyện cùng Tiễn Tình • Gemini 2.0 Flash",
          iconURL: client.user.displayAvatarURL(),
        });

      await thinking.edit({ content: "", embeds: [embed] });
    } catch (err) {
      console.error("💔 Tiễn Tình error:", err);
      msg.reply("⚠️ Tiễn Tình gặp chút trục trặc, hãy thử lại sau nhé...");
    }
  },
};
