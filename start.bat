@echo off
echo =====================================================================
echo  Starting Expense Tracker & Budget Management System (Full Stack)
echo =====================================================================

start "Backend Server (Port 5000)" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start "Frontend Client (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Application launched!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo.
pause
