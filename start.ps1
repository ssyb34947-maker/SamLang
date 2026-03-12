# Start Script for Pixel Chatbot
# Starts both backend and frontend

Write-Host "Starting Pixel Chatbot..." -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; uvicorn main:app --reload"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend in new window
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
