// scripts/buildDict.js
const fs = require("fs");
const path = require("path");

// đường dẫn tới thư mục dict của repo telexyz-data
const dictPath = path.join(__dirname, "../telexyz-data/dict");
// file output JSON cho bot
const outPath = path.join(__dirname, "../data/dictionary_vi.json");

function buildDict() {
  const files = fs.readdirSync(dictPath).filter((f) => f.endsWith(".txt"));
  const dict = {};

  files.forEach((file) => {
    const lines = fs
      .readFileSync(path.join(dictPath, file), "utf8")
      .split("\n");
    for (let line of lines) {
      const word = line.trim().toLowerCase();
      if (!word) continue;
      // chỉ giữ cụm từ 2 tiếng
      if (word.split(" ").length === 2) {
        dict[word] = true;
      }
    }
  });

  fs.writeFileSync(outPath, JSON.stringify(dict, null, 2), "utf8");
  console.log(
    `✅ Xuất ra ${Object.keys(dict).length} cụm từ 2 tiếng từ toàn bộ dict/`
  );
}

buildDict();
