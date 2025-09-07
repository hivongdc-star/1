const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../data/dictionary_vi.json");
const outputPath = path.join(__dirname, "../data/dictionary_vi_clean.json");

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const cleanDict = {};

Object.keys(raw).forEach((key) => {
  let word = key;

  // Bỏ ký hiệu đầu
  if (word.startsWith("@") || word.startsWith("-") || word.startsWith("!")) {
    word = word.slice(1);
  }

  // Lấy phần trước dấu "/" (nếu có)
  if (word.includes("/")) {
    word = word.split("/")[0].trim();
  }

  // Chỉ giữ chữ + khoảng trắng
  word = word
    .replace(/[^a-zA-ZÀ-ỹ\s]/g, "")
    .trim()
    .toLowerCase();

  // Giữ cụm 2 từ
  if (word.split(" ").length === 2) {
    cleanDict[word] = true;
  }
});

fs.writeFileSync(outputPath, JSON.stringify(cleanDict, null, 2), "utf8");
console.log(`✅ Xuất ra ${Object.keys(cleanDict).length} từ/cụm từ 2 tiếng`);
