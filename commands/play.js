const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  NoSubscriberBehavior, 
  getVoiceConnection 
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");

const players = new Map();

module.exports = {
  name: "play",
  description: "Phát nhạc từ link YouTube 🎵",
  async run(client, message, args) {
    const url = args[0];
    if (!url) return message.reply("⚠️ Hãy nhập link YouTube hợp lệ!");
    if (!message.member.voice.channel) return message.reply("❗ Bạn cần vào voice channel trước!");

    const channel = message.member.voice.channel;

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const stream = await ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
        requestOptions: { maxReconnects: 5 },
      });

      const resource = createAudioResource(stream);
      const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
      player.play(resource);
      connection.subscribe(player);
      players.set(message.guild.id, player);

      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const duration = Math.floor(info.videoDetails.lengthSeconds / 60) + " phút " + (info.videoDetails.lengthSeconds % 60) + " giây";

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`🎶 Đang phát: ${title}`)
        .setURL(url)
        .setThumbnail(info.videoDetails.thumbnails[0]?.url || null)
        .setDescription(`⏱️ Thời lượng: ${duration}`)
        .setFooter({ text: `Người yêu cầu: ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("pause").setLabel("⏸️ Tạm dừng").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("resume").setLabel("▶️ Tiếp tục").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setLabel("⏹️ Dừng").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("replay").setLabel("🔁 Phát lại").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("leave").setLabel("🔇 Rời kênh").setStyle(ButtonStyle.Secondary)
      );

      const msg = await message.reply({ embeds: [embed], components: [buttons] });
      const collector = msg.createMessageComponentCollector({ time: 10 * 60 * 1000 });

      collector.on("collect", async (i) => {
        if (i.user.id !== message.author.id)
          return i.reply({ content: "🚫 Bạn không thể điều khiển nhạc của người khác!", ephemeral: true });

        const player = players.get(message.guild.id);
        if (!player) return i.reply({ content: "⚠️ Không tìm thấy trình phát!", ephemeral: true });

        switch (i.customId) {
          case "pause":
            player.pause();
            await i.reply({ content: "⏸️ Đã tạm dừng!", ephemeral: true });
            break;
          case "resume":
            player.unpause();
            await i.reply({ content: "▶️ Tiếp tục phát!", ephemeral: true });
            break;
          case "stop":
            player.stop();
            await i.reply({ content: "⏹️ Đã dừng phát!", ephemeral: true });
            break;
          case "replay":
            const replayStream = await ytdl(url, { filter: "audioonly", quality: "highestaudio" });
            player.play(createAudioResource(replayStream));
            await i.reply({ content: "🔁 Phát lại bài hát!", ephemeral: true });
            break;
          case "leave":
            const conn = getVoiceConnection(message.guild.id);
            conn?.destroy();
            players.delete(message.guild.id);
            await i.reply({ content: "👋 Bot đã rời kênh!", ephemeral: true });
            break;
        }
      });

      player.on(AudioPlayerStatus.Idle, () => {
        const conn = getVoiceConnection(message.guild.id);
        conn?.destroy();
        players.delete(message.guild.id);
      });
    } catch (err) {
      console.error("Music Error:", err);
      message.reply("❌ Có lỗi xảy ra khi phát nhạc!");
    }
  },
};
