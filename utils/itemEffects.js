// utils/itemEffects.js
const { addRela } = require("./relaUtils");

function applyItemEffect(users, actorId, targetId, item, consume=true){
  // gift.rela
  const gain = Number(item?.effect?.rela||0);
  if (gain>0) addRela(actorId, targetId||actorId, gain);

  // race change
  if (item?.effect?.race_change){
    const race = String(item.effect.race_change);
    users[actorId].race = race;
  }

  // stat buffs
  if (item?.effect?.stats && typeof item.effect.stats==="object"){
    users[actorId].stats = Object.assign({}, users[actorId].stats||{}, item.effect.stats);
  }

  if (consume){
    const inv = users[actorId].inventory||{};
    if ((inv[item.id]||0)<=0) return { ok:false, message:"❌ Không có vật phẩm." };
    inv[item.id]-=1; if (inv[item.id]<=0) delete inv[item.id];
    users[actorId].inventory = inv;
  }
  return { ok:true, message:"✅ Đã sử dụng vật phẩm." };
}

module.exports = { applyItemEffect };
