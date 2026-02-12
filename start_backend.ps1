# Start Backend Server (Windows PowerShell)
# This script starts the FastAPI backend server for hand sign detection

Write-Host "🚀 Starting Hand Sign Detection Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found! Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Check if requirements are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi, torch, timm, cv2" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Some dependencies are missing. Installing requirements..." -ForegroundColor Yellow
        python -m pip install -r requirements.txt
    }
} catch {
    Write-Host "⚠️ Installing requirements..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt
}

Write-Host ""
Write-Host "✅ Dependencies ready!" -ForegroundColor Green
Write-Host "🎥 Starting server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "📡 WebSocket endpoint: ws://localhost:8000/ws/detect" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python backend_server.py
