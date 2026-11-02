@echo off
echo ====================================================
echo Launching FinPilot AI Platform
echo ====================================================
echo 1. Starting Backend API on http://127.0.0.1:8000
start "FinPilot Backend API (Port 8000)" cmd /k ""%~dp0run_backend.bat""

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Terminal on http://localhost:3000
start "FinPilot Frontend (Port 3000)" cmd /k ""%~dp0run_frontend.bat""

echo.
echo ====================================================
echo FinPilot AI is now launching!
echo - Frontend:  http://localhost:3000
echo - Swagger:   http://127.0.0.1:8000/docs
echo ====================================================
pause
