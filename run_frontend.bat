@echo off
cd /d "%~dp0frontend"
echo ====================================================
echo Starting FinPilot AI Frontend on Port 3000
echo ====================================================
cmd.exe /c "npm run dev"
pause
