@echo off
echo Starting SmartSpend AI Background Services...

REM Start Backend (Node.js + MongoDB API)
echo Starting Backend...
start cmd /k "cd backend && npm start"

REM Start Frontend (React/Vite)
echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo All services started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000/api
pause
