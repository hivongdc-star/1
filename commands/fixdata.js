const { loadUsers, saveUsers } = require("../utils/storage");
const races = require("../utils/races");
const elements = require("../utils/element");
const { getRealm } = require("../utils/xp");
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: "fixdata",
  description:
    "Chuẩn hóa dữ liệu & đồng bộ lại chỉ số theo races/element (chỉ admin)",
  aliases: ["fd"],

  run(client, msg) {
    if (msg.author.id !== OWNER_ID) {
      return msg.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const users = loadUsers();
    let fixed = 0;

    for (const id in users) {
      const u = users[id];
      let changed = false;

      // --- migrate cũ -> mới ---
      if (u.linhthach !== undefined) {
        u.lt = (u.lt || 0) + u.linhthach;
        delete u.linhthach;
        changed = true;
      }
      if (u.mana !== undefined) {
        u.mp = u.mana;
        delete u.mana;
        changed = true;
      }
      if (u.maxMana !== undefined) {
        u.maxMp = u.maxMana;
        delete u.maxMana;
        changed = true;
      }
      if (u.attack !== undefined) {
        u.atk = u.attack;
        delete u.attack;
        changed = true;
      }
      if (u.defense !== undefined) {
        u.def = u.defense;
        delete u.defense;
        changed = true;
      }
      if (u.armor !== undefined) {
        delete u.armor;
        if (u.spd === undefined) u.spd = 10;
        changed = true;
      }

      // --- chuẩn hóa field mặc định ---
      if (!u.inventory) {
        u.inventory = {};
        changed = true;
      }
      if (!u.dailyStones) {
        u.dailyStones = { date: null, earned: 0 };
        changed = true;
      }
      if (!u.buffs) {
        u.buffs = [];
        changed = true;
      }
      if (u.shield === undefined) {
        u.shield = 0;
        changed = true;
      }
      if (u.lt === undefined) {
        u.lt = 0;
        changed = true;
      }
      if (u.fury === undefined) {
        u.fury = 0;
        changed = true;
      }
      if (!u.bio) u.bio = "";
      if (!u.title) u.title = null;

      // --- tái tính chỉ số dựa theo race/element ---
      const level = u.level || 1;
      const race = races[u.race] || races["nhan"];
      const element = elements[u.element] || elements["kim"];

      let hp = 100,
        mp = 100,
        atk = 10,
        def = 10,
        spd = 10;

      // cộng chỉ số cho từng level (trừ level 1 base)
      for (let lv = 2; lv <= level; lv++) {
        // cộng theo race
        if (race.gain) {
          hp += race.gain.hp || 0;
          mp += race.gain.mp || 0;
          atk += race.gain.atk || 0;
          def += race.gain.def || 0;
          spd += race.gain.spd || 0;
        }
        // cộng theo element
        if (element) {
          hp += element.hp || 0;
          mp += element.mp || 0;
          atk += element.atk || 0;
          def += element.def || 0;
          spd += element.spd || 0;
        }
      }

      u.hp = hp;
      u.maxHp = hp;
      u.mp = mp;
      u.maxMp = mp;
      u.atk = atk;
      u.def = def;
      u.spd = spd;
      u.realm = getRealm(level);

      changed = true;

      if (changed) fixed++;
    }

    saveUsers(users);
    msg.reply(`✅ Đã fix dữ liệu & re-sync chỉ số cho **${fixed}** nhân vật.`);
  },
};
