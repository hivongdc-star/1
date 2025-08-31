const { loadUsers, saveUsers } = require("../utils/storage");
const races = require("../utils/races");
const elements = require("../utils/element");
const { getRealm } = require("../utils/xp");
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: "fixdata",
  description: "Chuẩn hóa dữ liệu & đồng bộ chỉ số theo races/element",
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

      // --- migrate stat cũ -> mới ---
      if (u.linhthach !== undefined) {
        u.lt = (u.lt || 0) + u.linhthach;
        delete u.linhthach;
        changed = true;
      }
      if (u.mana !== undefined) { u.mp = u.mana; delete u.mana; changed = true; }
      if (u.maxMana !== undefined) { u.maxMp = u.maxMana; delete u.maxMana; changed = true; }
      if (u.attack !== undefined) { u.atk = u.attack; delete u.attack; changed = true; }
      if (u.defense !== undefined) { u.def = u.defense; delete u.defense; changed = true; }
      if (u.armor !== undefined) { delete u.armor; if (u.spd === undefined) u.spd = 10; changed = true; }

      // --- chuẩn hóa field mặc định ---
      if (!u.inventory) { u.inventory = {}; changed = true; }
      if (!u.dailyStones) { u.dailyStones = { date: null, earned: 0 }; changed = true; }
      if (!u.buffs) { u.buffs = []; changed = true; }
      if (u.shield === undefined) { u.shield = 0; changed = true; }
      if (u.lt === undefined) { u.lt = 0; changed = true; }
      if (u.fury === undefined) { u.fury = 0; changed = true; }
      if (!u.bio) u.bio = "";
      if (!u.title) u.title = null;

      // --- tái tính toàn bộ chỉ số ---
      const level = u.level || 1;
      const race = races[u.race] || races["nhan"];
      const element = elements[u.element] || elements["kim"];

      let hp = 100, mp = 100, atk = 10, def = 10, spd = 10;

      // cộng dồn cho từng level
      for (let lv = 2; lv <= level; lv++) {
        // theo race
        if (race.gain) {
          hp += race.gain.hp || 0;
          mp += race.gain.mp || 0;
          atk += race.gain.atk || 0;
          def += race.gain.def || 0;
          spd += race.gain.spd || 0;
        }
        // theo element
        if (element) {
          hp += element.hp || 0;
          mp += element.mp || 0;
          atk += element.atk || 0;
          def += element.def || 0;
          spd += element.spd || 0;
        }
        // ✅ thêm 100HP cố định mỗi level
        hp += 100;
      }

      // breakthrough multiplier
      let realmHp = hp, realmMp = mp, realmAtk = atk, realmDef = def, realmSpd = spd;
      for (let lv = 2; lv <= level; lv++) {
        if (lv % 10 === 1) {
          let multiplier = 1.5;
          if (u.race === "than") multiplier = 1.6;
          realmHp = Math.floor(realmHp * multiplier);
          realmMp = Math.floor(realmMp * multiplier);
          realmAtk = Math.floor(realmAtk * multiplier);
          realmDef = Math.floor(realmDef * multiplier);
          realmSpd = Math.floor(realmSpd * multiplier);
        }
      }

      // cập nhật lại user
      u.hp = realmHp;
      u.maxHp = realmHp;
