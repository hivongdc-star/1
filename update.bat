@echo off
cd /d C:\Users\Administrator\1

echo ============================
echo 🔄 Updating Bot...
echo ============================

:: Lấy code mới nhất từ git
git pull origin main

:: Cài dependencies nếu có
npm install

:: Dừng tiến trình Node cũ (nếu đang chạy)
taskkill /F /IM node.exe >nul 2>&1

:: Khởi động lại bot
start cmd /k "cd /d C:\Users\Administrator\1 && node index.js"

echo ============================
echo ✅ Update & Restart Completed
echo ============================
exit
