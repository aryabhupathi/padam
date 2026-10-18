@echo off
title Padavinodam Telugu Crossword Launcher
echo ===================================================
echo     Launching Padavinodam - Telugu Crossword Platform
echo ===================================================
echo.

cd /d "%~dp0padavinodam-backend"
echo [1/2] Starting Python FastAPI Backend on port 8000...
start "Padavinodam Backend (Port 8000)" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

cd /d "%~dp0padavinodam-frontend"
echo [2/2] Starting React Vite Frontend on port 5173...
start "Padavinodam Frontend (Port 5173)" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 2 /nobreak >nul
echo.
echo Opening Padavinodam in your browser...
start http://127.0.0.1:5173/

echo.
echo Done! Both backend and frontend are running.
echo To stop them, simply close the opened terminal windows.
pause
