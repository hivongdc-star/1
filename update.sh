#!/bin/bash

echo "🔄 Bắt đầu update bot..."

# 1. Backup dữ liệu
if [ -f "data/users.json" ]; then
  cp data/users.json data/users.json.bak
  echo "✅ Backup users.json -> data/users.json.bak"
fi

# 2. Lấy code mới
git fetch --all
git reset --hard origin/main
echo "✅ Code đã được cập nhật từ GitHub"

# 3. Khôi phục dữ liệu
if [ -f "data/users.json.bak" ]; then
  cp data/users.json.bak data/users.json
  echo "✅ Khôi phục users.json từ backup"
fi

# 4. Restart bot bằng pm2
pm2 restart tu-tien-bot
echo "🚀 Bot đã restart xong!"
