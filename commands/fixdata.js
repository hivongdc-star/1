const { loadUsers, saveUsers } = require("../utils/storage");
const races = require("../utils/races");
const elements = require("../utils/element");
const { getRealm } = require("../utils/xp");
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: "fixdata",
  description:
    "Chuẩn hóa dữ liệu nhân vật và tính lại chỉ số theo level hiện tại (admin only)",
  aliases: ["fd"],

  run(client, msg) {
    if (msg.author.id !== OWNER_ID) {
      return msg.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const users = loadUsers();
    let fixed = 0;

    for (const id in users) {
      const u = users[id];
      if (!u) continue;

      const level = u.level || 1;
      const race = u.race || "nhan";
      const element = u.element || "kim";

      // Reset base stats về level 1
      let hp = 100,
        maxHp = 100;
      let mp = 100,
        maxMp = 100;
      let atk = 10,
        def = 10,
        spd = 10;

      // Loop lại từ lv2 -> level hiện tại
      for (let lv = 2; lv <= level; lv++) {
        // tăng theo Tộc
        const raceGain = races[race]?.gain || {};
        for (let stat in raceGain) {
          if (stat === "hp") maxHp += raceGain[stat];
          else if (stat === "mp") maxMp += raceGain[stat];
          else if (stat === "atk") atk += raceGain[stat];
          else if (stat === "def") def += raceGain[stat];
          else if (stat === "spd") spd += raceGain[stat];
        }

        // tăng theo Ngũ hành
        const eleGain = elements[element] || {};
        for (let stat in eleGain) {
          if (stat === "hp") maxHp += eleGain[stat];
          else if (stat === "mp") maxMp += eleGain[stat];
          else if (stat === "atk") atk += eleGain[stat];
          else if (stat === "def") def += eleGain[stat];
          else if (stat === "spd") spd += eleGain[stat];
        }

        // cộng thêm máu/mana cơ bản mỗi cấp
        maxHp += 100;
        maxMp += 20;

        // breakthrough mỗi cảnh giới
        if (lv % 10 === 1) {
          let multiplier = race === "than" ? 1.6 : 1.5;
          atk = Math.floor(atk * multiplier);
          def = Math.floor(def * multiplier);
          spd = Math.floor(spd * multiplier);
          maxHp = Math.floor(maxHp * multiplier);
          maxMp = Math.floor(maxMp * multiplier);
        }
      }

      // hp hiện tại không vượt quá maxHp
      hp = Math.min(u.hp || maxHp, maxHp);

      // Ghi đè lại dữ liệu user
      users[id] = {
        id,
        name: u.name || "Chưa đặt tên",
        exp: u.exp || 0,
        level,
        realm: getRealm(level),
        race,
        element,
        hp,
        maxHp,
        mp,
        maxMp,
        atk,
        def,
        spd,
        fury: u.fury || 0,
        lt: u.lt || 0,
        bio: u.bio || "",
        title: u.title || null,
        inventory: u.inventory || {},
        dailyStones: u.dailyStones || { date: null, earned: 0 },
        buffs: [],
        shield: 0,
      };

      fixed++;
    }

    saveUsers(users);
    msg.reply(`✅ Đã chuẩn hóa và fix chỉ số cho **${fixed}** nhân vật.`);
  },
};
