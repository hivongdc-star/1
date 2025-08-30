const { heal, addShield, addBuff } = require("./dmg");

const skills = {
  kim: [
    {
      name: "Kim Cương Trảm",
      type: "normal",
      cost: { mana: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Nhát chém cơ bản.",
    },
    {
      name: "Thiết Tỏa Liên",
      type: "buff",
      cost: { mana: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 mana, buff xuyên giáp 15 trong 3 lượt.",
      effect: (attacker) => {
        attacker.mana = Math.min(attacker.maxMana || 100, attacker.mana + 30);
        addBuff(attacker, "ignoreArmor", 15, 3);
        return 0;
      },
    },
    {
      name: "Ngân Thạch Quyền",
      type: "mana",
      cost: { mana: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Cú đấm xuyên thủng, sát thương lớn.",
      ignoreArmor: 20,
    },
    {
      name: "Thần Kim Giới",
      type: "fury",
      cost: { mana: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Kim chi cực hạn, sát thương khủng khiếp.",
      ignoreArmor: 30,
    },
  ],

  moc: [
    {
      name: "Thanh Mộc Kích",
      type: "normal",
      cost: { mana: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn đánh cơ bản.",
    },
    {
      name: "Sinh Cơ Vĩnh",
      type: "buff",
      cost: { mana: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 mana và 20% máu.",
      effect: (attacker) => {
        attacker.mana = Math.min(attacker.maxMana || 100, attacker.mana + 30);
        heal(attacker, Math.floor((attacker.maxHp || 100) * 0.2));
        return 0;
      },
    },
    {
      name: "Lục Diệp Trảm",
      type: "mana",
      cost: { mana: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Lá xanh hóa kiếm, sát thương cao.",
    },
    {
      name: "Thiên Mộc Diệt",
      type: "fury",
      cost: { mana: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Sức mạnh Mộc tộc, hủy diệt.",
    },
  ],

  thuy: [
    {
      name: "Lam Thủy Tiễn",
      type: "normal",
      cost: { mana: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn thủy tiễn cơ bản.",
    },
    {
      name: "Băng Tỏa Thuật",
      type: "buff",
      cost: { mana: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 mana và tạo khiên 25% HP (2 lượt).",
      effect: (attacker) => {
        attacker.mana = Math.min(attacker.maxMana || 100, attacker.mana + 30);
        addShield(attacker, Math.floor((attacker.maxHp || 100) * 0.25), 2);
        return 0;
      },
    },
    {
      name: "Hàn Băng Trảm",
      type: "mana",
      cost: { mana: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Kiếm băng, sát thương lớn.",
    },
    {
      name: "Thủy Long Ấn",
      type: "fury",
      cost: { mana: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Triệu hồi Thủy Long.",
    },
  ],

  hoa: [
    {
      name: "Xích Viêm Trảm",
      type: "normal",
      cost: { mana: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn lửa cơ bản.",
    },
    {
      name: "Liệt Diễm Cầu",
      type: "buff",
      cost: { mana: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 mana, buff +20% damage trong 2 lượt.",
      effect: (attacker) => {
        attacker.mana = Math.min(attacker.maxMana || 100, attacker.mana + 30);
        addBuff(attacker, "buffDmg", 1.2, 2);
        return 0;
      },
    },
    {
      name: "Hỏa Phượng Minh",
      type: "mana",
      cost: { mana: 40, fury: 0 },
      multiplier: 2.2,
      furyGain: 10,
      description: "Phượng hoàng lửa, sát thương cực mạnh.",
    },
    {
      name: "Vạn Hỏa Diệt",
      type: "fury",
      cost: { mana: 0, fury: 100 },
      multiplier: 3.8,
      furyGain: -100,
      description: "Ngọn lửa hủy diệt.",
    },
  ],

  tho: [
    {
      name: "Thạch Phách Quyền",
      type: "normal",
      cost: { mana: 0, fury: 0 },
      multiplier: 0.8,
      furyGain: 30,
      description: "Đòn đấm đất đá.",
    },
    {
      name: "Sơn Thể Thuật",
      type: "buff",
      cost: { mana: 0, fury: 0 },
      multiplier: 0,
      furyGain: 0,
      description: "Hồi 30 mana, buff +20% def/giáp trong 2 lượt.",
      effect: (attacker) => {
        attacker.mana = Math.min(attacker.maxMana || 100, attacker.mana + 30);
        addBuff(attacker, "buffDef", 0.2, 2);
        return 0;
      },
    },
    {
      name: "Thổ Long Kích",
      type: "mana",
      cost: { mana: 40, fury: 0 },
      multiplier: 2.0,
      furyGain: 10,
      description: "Triệu hồi thổ long, sát thương mạnh.",
    },
    {
      name: "Thiên Thạch Giới",
      type: "fury",
      cost: { mana: 0, fury: 100 },
      multiplier: 3.5,
      furyGain: -100,
      description: "Thiên thạch hủy diệt.",
    },
  ],
};

module.exports = skills;
