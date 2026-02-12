#!/bin/bash
# Start Backend Server (Linux/Mac)
# This script starts the FastAPI backend server for hand sign detection

echo "🚀 Starting Hand Sign Detection Backend Server..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found! Please install Python 3.8 or higher."
    exit 1
fi

# Check if requirements are installed
echo "📦 Checking dependencies..."
if ! python3 -c "import fastapi, torch, timm, cv2" 2>/dev/null; then
    echo "⚠️ Some dependencies are missing. Installing requirements..."
    pip3 install -r requirements.txt
fi

echo ""
echo "✅ Dependencies ready!"
echo "🎥 Starting server on http://localhost:8000"
echo "📡 WebSocket endpoint: ws://localhost:8000/ws/detect"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 backend_server.py
