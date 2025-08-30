@echo off
echo ========================
echo  🚀 Updating TuTien Bot
echo ========================
cd /d %~dp0

set LOGFILE=logs\update.log
if not exist logs mkdir logs

echo [START] %date% %time% > %LOGFILE%
git reset --hard >> %LOGFILE% 2>&1
git pull origin main >> %LOGFILE% 2>&1
call npm install >> %LOGFILE% 2>&1
call pm2 restart index.js >> %LOGFILE% 2>&1
echo [END] %date% %time% >> %LOGFILE%

echo ========================
echo ✅ Update completed!
echo ========================
timeout /t 10 /nobreak >nul
