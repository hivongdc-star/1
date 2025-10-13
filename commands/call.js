const fetch = require("node-fetch");
const { EmbedBuilder } = require("discord.js");

// 💫 API key của Gemini (ghi trực tiếp tại đây)
const GEMINI_API_KEY = "AIza..."; // ⬅️ Thay bằng key thật của bạn

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

      // Gửi yêu cầu tới Gemini
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyCacDkHISpdCEhSaErVztXr82YdMeA4EZQ}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: question }] }],
          }),
        }
      );

      const data = await res.json();
      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "❌ Tiễn Tình im lặng một lúc lâu... (không có phản hồi hợp lệ)";

      // Embed trả lời của Tiễn Tình
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
          text: "Trò chuyện cùng Tiễn Tình",
          iconURL: client.user.displayAvatarURL(),
        });

      await thinking.edit({ content: "", embeds: [embed] });
    } catch (err) {
      console.error("Tiễn Tình error:", err);
      msg.reply("⚠️ Tiễn Tình gặp chút trục trặc, hãy thử lại sau nhé...");
    }
  },
};
