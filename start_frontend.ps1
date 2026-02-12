# Start Frontend (Windows PowerShell)
# This script starts the React/Vite frontend

Write-Host "🎨 Starting Sign & Spell Frontend..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found! Please install Node.js." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "✅ Dependencies ready!" -ForegroundColor Green
Write-Host "🌐 Starting development server..." -ForegroundColor Cyan
Write-Host ""

# Start the frontend
npm run dev
