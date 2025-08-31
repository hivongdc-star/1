const { heal, addShield, addBuff } = require("./dmg");

const skills = {
  kim: [
    {
      name: "Cương Phong Trảm Kích",
      type: "normal",
      cost: { mpPercent: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description:
        "Phong nhận cương mãnh, nhất trảm phá thiên, dư âm sát khí tứ tán.",
    },
    {
      name: "Kim Cang Trảm Giáp",
      type: "buff",
      cost: { mpPercent: 0, fury: 0 },
      cooldown: 3,
      furyGain: 0,
      description:
        "Kim quang hộ thể, linh lực tức tụ, phá giáp chi uy, bất khả ngăn cản.",
      effect: (attacker) => {
        attacker.mp = Math.min(
          attacker.maxMp,
          attacker.mp + Math.floor(attacker.maxMp * 0.5)
        );
        addBuff(attacker, "buffIgnoreArmor", 0.2, 2);
      },
    },
    {
      name: "Thiên Toái Kim Quang",
      type: "mana",
      cost: { mpPercent: 20, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description:
        "Thiên quang tụ hội, nhất kích khai sơn, kim mang chấn nhiếp cửu tiêu.",
    },
    {
      name: "Kim Lang Khiếu Nguyệt",
      type: "fury",
      cost: { mpPercent: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description:
        "Kim lang ngửa mặt tru nguyệt, thiên địa thất sắc, chiến ý tung hoành vạn dặm.",
    },
  ],

  moc: [
    {
      name: "Thanh Diệp Loạn Trảm",
      type: "normal",
      cost: { mpPercent: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description:
        "Diệp hóa trường kiếm, loạn vũ thương khung, vạn vật diệt diệt.",
    },
    {
      name: "Sinh Cơ Chi Khí",
      type: "buff",
      cost: { mpPercent: 0, fury: 0 },
      cooldown: 3,
      furyGain: 0,
      description:
        "Sinh cơ sinh diệp, linh khí thịnh thịnh, thương thế tiêu tán, sinh mệnh bất tuyệt.",
      effect: (attacker) => {
        attacker.mp = Math.min(
          attacker.maxMp,
          attacker.mp + Math.floor(attacker.maxMp * 0.5)
        );
        heal(attacker, Math.floor(attacker.maxHp * 0.2));
      },
    },
    {
      name: "Vạn Diệp Cuồng Trảm",
      type: "mana",
      cost: { mpPercent: 20, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description:
        "Vạn diệp tụ vũ, cuồng trảm phá không, lục quang che lấp nhật nguyệt.",
    },
    {
      name: "Thiên Mộc Giáng Lâm",
      type: "fury",
      cost: { mpPercent: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description:
        "Thiên mộc giáng hạ, cành lá phủ thiên, thiên địa đều phải khom lưng khuất phục.",
    },
  ],

  thuy: [
    {
      name: "Thủy Ảnh Hàn Tiễn",
      type: "normal",
      cost: { mpPercent: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Thủy ảnh hóa tiễn, hàn mang bức cốt, sát ý như băng.",
    },
    {
      name: "Băng Tâm Hộ Thể",
      type: "buff",
      cost: { mpPercent: 0, fury: 0 },
      cooldown: 3,
      furyGain: 0,
      description:
        "Tâm tĩnh như thủy, băng giáp tụ thân, hàn khí hộ thể, vạn pháp nan xâm.",
      effect: (attacker) => {
        attacker.mp = Math.min(
          attacker.maxMp,
          attacker.mp + Math.floor(attacker.maxMp * 0.5)
        );
        addShield(attacker, Math.floor(attacker.maxHp * 0.25), 2);
      },
    },
    {
      name: "Nguyệt Ảnh Thiên Hàn",
      type: "mana",
      cost: { mpPercent: 20, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description:
        "Nguyệt quang băng hàn, nhất kiếm đoạn thiên, hàn khí nhập cốt, phong ấn sinh cơ.",
    },
    {
      name: "Kính Hoa Thủy Nguyệt",
      type: "fury",
      cost: { mpPercent: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description:
        "Thủy kính phá diệt, hàn nguyệt giáng trần, băng long ngự thiên, vạn vật tận diệt.",
    },
  ],

  hoa: [
    {
      name: "Liệt Diễm Bạo Quyền",
      type: "normal",
      cost: { mpPercent: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description:
        "Hỏa diễm bạo động, quyền thế như sơn, nhật nguyệt thất sắc.",
    },
    {
      name: "Hỏa Linh Cuồng Thể",
      type: "buff",
      cost: { mpPercent: 0, fury: 0 },
      cooldown: 3,
      furyGain: 0,
      description:
        "Hỏa linh phụ thể, huyết khí sôi trào, uy thế như viêm long, thiên uy bạo khởi.",
      effect: (attacker) => {
        attacker.mp = Math.min(
          attacker.maxMp,
          attacker.mp + Math.floor(attacker.maxMp * 0.5)
        );
        addBuff(attacker, "buffAtk", 0.2, 2);
      },
    },
    {
      name: "Nhật Diễm Thiên Viêm",
      type: "mana",
      cost: { mpPercent: 20, fury: 0 },
      multiplier: 2.2,
      furyGain: 10,
      description:
        "Nhật viêm giáng thế, thiên hỏa diệt thiên, phượng hoàng tái sinh từ tịnh viêm.",
    },
    {
      name: "Phật Nộ Hỏa Liên",
      type: "fury",
      cost: { mpPercent: 0, fury: 100 },
      multiplier: 3.8,
      furyGain: -100,
      description:
        "Liên hỏa khai nở, Phật nộ thiên uy, nhất diễm vạn diệt, hồng trần hóa hư vô.",
    },
  ],

  tho: [
    {
      name: "Phá Địa Trấn Quyền",
      type: "normal",
      cost: { mpPercent: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description:
        "Nhất quyền phá địa, sơn xuyên chấn động, thiên địa cộng minh.",
    },
    {
      name: "Sơn Hà Thạch Thể",
      type: "buff",
      cost: { mpPercent: 0, fury: 0 },
      cooldown: 3,
      furyGain: 0,
      description:
        "Thân như thạch cốt, khí trụ sơn hà, thiên công nan phá, vạn pháp nan xâm.",
      effect: (attacker) => {
        attacker.mp = Math.min(
          attacker.maxMp,
          attacker.mp + Math.floor(attacker.maxMp * 0.5)
        );
        addBuff(attacker, "buffDef", 0.2, 2);
      },
    },
    {
      name: "Thổ Long Liệt Địa",
      type: "mana",
      cost: { mpPercent: 20, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description:
        "Địa long phá thổ, long ngâm chấn cửu châu, đại địa liệt khai.",
    },
    {
      name: "Thiên Diễn Đoạn Không",
      type: "fury",
      cost: { mpPercent: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description:
        "Thiên thạch hàng không, nhật nguyệt vô quang, vạn giới đoạn tuyệt, hư không sụp đổ.",
    },
  ],
};

module.exports = skills;
