@echo off
cd /d "%~dp0backend"
echo ====================================================
echo Starting FinPilot AI Backend Server on Port 8000
echo ====================================================
".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
