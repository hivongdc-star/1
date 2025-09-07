module.exports = {
  maxWords: 1000, // số từ để kết thúc game
  rewardPerWord: 1, // mỗi từ hợp lệ = 1 LT
  strictMode: true, // true = chỉ chấp nhận từ có trong dictionary_vi.json
  bonusTop: {
    // thưởng thêm cho Top (tùy chọn)
    1: 500,
    2: 300,
    3: 200,
  },
};
