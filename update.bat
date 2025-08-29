@echo off
echo ============================
echo 🚀 Bắt đầu cập nhật bot...
echo ============================

REM Pull code mới nhất từ GitHub
git pull origin main

REM Cài lại dependencies nếu có thay đổi
npm install

REM Restart bot bằng PM2
pm2 restart index

echo ============================
echo ✅ Bot đã được cập nhật xong!
echo ============================

pause
