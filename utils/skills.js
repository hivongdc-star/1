const { heal, addShield, addBuff } = require("./dmg");

const skills = {
  kim: [
    {
      name: "Cương Phong Trảm Kích",
      type: "normal",
      cost: { mp: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Nhát chém cơ bản.",
    },
    {
      name: "Kim Cang Trảm Giáp",
      type: "buff",
      cost: { mp: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 MP, buff xuyên giáp 20% (2 lượt).",
      effect: (attacker) => {
        attacker.mp = Math.min(attacker.maxMp || 100, attacker.mp + 30);
        addBuff(attacker, "ignoreArmor", 0.2, 2);
        return 0;
      },
    },
    {
      name: "Thiên Toái Kim Quang",
      type: "mana",
      cost: { mp: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Cú đấm xuyên thủng, sát thương lớn.",
      ignoreArmor: 0.3,
    },
    {
      name: "Kim Lang Khiếu Nguyệt",
      type: "fury",
      cost: { mp: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Kim chi cực hạn, sát thương khủng khiếp.",
      ignoreArmor: 0.5,
    },
  ],

  moc: [
    {
      name: "Thanh Diệp Loạn Trảm",
      type: "normal",
      cost: { mp: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn đánh cơ bản.",
    },
    {
      name: "Sinh Cơ Chi Khí",
      type: "buff",
      cost: { mp: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 MP và 20% máu.",
      effect: (attacker) => {
        attacker.mp = Math.min(attacker.maxMp || 100, attacker.mp + 30);
        heal(attacker, Math.floor((attacker.maxHp || 100) * 0.2));
        return 0;
      },
    },
    {
      name: "Vạn Diệp Cuồng Trảm",
      type: "mana",
      cost: { mp: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Lá xanh hóa kiếm, sát thương cao.",
    },
    {
      name: "Thiên Mộc Giáng Lâm",
      type: "fury",
      cost: { mp: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Sức mạnh Mộc tộc, hủy diệt.",
    },
  ],

  thuy: [
    {
      name: "Thủy Ảnh Hàn Tiễn",
      type: "normal",
      cost: { mp: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn thủy tiễn cơ bản.",
    },
    {
      name: "Băng Tâm Hộ Thể",
      type: "buff",
      cost: { mp: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 MP và tạo khiên 25% HP (2 lượt).",
      effect: (attacker) => {
        attacker.mp = Math.min(attacker.maxMp || 100, attacker.mp + 30);
        addShield(attacker, Math.floor((attacker.maxHp || 100) * 0.25), 2);
        return 0;
      },
    },
    {
      name: "Nguyệt Ảnh Thiên Hàn",
      type: "mana",
      cost: { mp: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Kiếm băng, sát thương lớn.",
    },
    {
      name: "Kính Hoa Thủy Nguyệt",
      type: "fury",
      cost: { mp: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Triệu hồi Thủy Long.",
    },
  ],

  hoa: [
    {
      name: "Liệt Diễm Bạo Quyền",
      type: "normal",
      cost: { mp: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn lửa cơ bản.",
    },
    {
      name: "Hỏa Linh Cuồng Thể",
      type: "buff",
      cost: { mp: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 MP, buff +20% công (2 lượt).",
      effect: (attacker) => {
        attacker.mp = Math.min(attacker.maxMp || 100, attacker.mp + 30);
        addBuff(attacker, "buffDmg", 1.2, 2);
        return 0;
      },
    },
    {
      name: "Nhật Diễm Thiên Viêm",
      type: "mana",
      cost: { mp: 40, fury: 0 },
      multiplier: 2.2,
      furyGain: 10,
      description: "Phượng hoàng lửa, sát thương cực mạnh.",
    },
    {
      name: "Phật Nộ Hỏa Liên",
      type: "fury",
      cost: { mp: 0, fury: 100 },
      multiplier: 3.8,
      furyGain: -100,
      description: "Ngọn lửa hủy diệt.",
    },
  ],

  tho: [
    {
      name: "Phá Địa Trấn Quyền",
      type: "normal",
      cost: { mp: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn đấm đất đá.",
    },
    {
      name: "Sơn Hà Thạch Thể",
      type: "buff",
      cost: { mp: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 MP, buff +20% thủ (2 lượt).",
      effect: (attacker) => {
        attacker.mp = Math.min(attacker.maxMp || 100, attacker.mp + 30);
        addBuff(attacker, "buffDef", 0.2, 2);
        return 0;
      },
    },
    {
      name: "Thổ Long Liệt Địa",
      type: "mana",
      cost: { mp: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Triệu hồi thổ long, sát thương mạnh.",
    },
    {
      name: "Thiên Diễn Đoạn Không",
      type: "fury",
      cost: { mp: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Thiên thạch hủy diệt.",
    },
  ],
};

module.exports = skills;
