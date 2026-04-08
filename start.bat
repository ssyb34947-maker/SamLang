@echo off
echo Starting...
echo.

REM Start backend in new window (using root project venv)
start "Backend Server" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe start_backend.py"

REM Wait for backend to start
timeout /t 8 /nobreak >nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this script
pause >nul
