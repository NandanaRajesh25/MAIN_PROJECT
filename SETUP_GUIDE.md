# 🤟 Sign & Spell - Setup & Integration Guide

## Overview
This project integrates a **MobileViT hand sign detection model** with a **React/TypeScript frontend** for real-time sign language learning. The system uses WebSocket communication for live video processing.

## 🏗️ Architecture

```
┌─────────────────────────────┐       WebSocket        ┌──────────────────────────┐
│   React Frontend            │◄─────────────────────►│   Python Backend         │
│   - Webcam capture          │     (8000/ws/detect)   │   - MobileViT model      │
│   - Video display           │                        │   - Frame processing     │
│   - Word building           │                        │   - Stability detection  │
│   - Spelling check          │                        │   - Letter prediction    │
└─────────────────────────────┘                        └──────────────────────────┘
```

## 📋 Prerequisites

### Backend Requirements
- **Python 3.8+** (3.9 or 3.10 recommended)
- **CUDA** (optional, for GPU acceleration)
- **Model file**: `mobilevit_epoch_5.pth` (in project root)
- **Class file**: `class_order.txt` (in project root)

### Frontend Requirements
- **Node.js 16+** (18+ recommended)
- **npm** or **bun**
- Modern web browser with webcam access

## 🚀 Quick Start

### Option 1: Using PowerShell Scripts (Windows)

1. **Start Backend** (Terminal 1):
   ```powershell
   .\start_backend.ps1
   ```

2. **Start Frontend** (Terminal 2):
   ```powershell
   .\start_frontend.ps1
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Verify model files exist**:
   - `mobilevit_epoch_5.pth` (model weights)
   - `class_order.txt` (class labels)

3. **Start the backend server**:
   ```bash
   python backend_server.py
   ```

   The server will start on `http://localhost:8000`

#### Frontend Setup

1. **Install Node dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173` (or similar)

## 🎯 How to Use

1. **Open the app** in your browser (`http://localhost:5173`)

2. **Click "Start Camera Detection"** button in the header
   - Browser will ask for camera permission - allow it
   - You should see your webcam feed on the left panel

3. **Make hand signs** in front of the camera
   - The model detects letters continuously
   - **Stable detection required**: Same sign must be detected for 8 consecutive frames
   - **Cooldown period**: 10 seconds between accepting letters

4. **Build your word**
   - Detected letters automatically appear in the "Building Your Word" section
   - Use the **"del" hand sign** to remove the last letter
   - Or click **"Undo"** button

5. **Check spelling**
   - Click **"Done"** button when word is complete
   - System checks if the word is spelled correctly
   - Get suggestions if spelling is incorrect

6. **View sign videos**
   - After checking, view videos of how to sign the word correctly

## 🔧 Configuration

### Backend Settings (backend_server.py)

```python
PRED_INTERVAL = 10          # Seconds between accepting letters
STABILITY_FRAMES = 8         # Frames needed for stable prediction
MODEL_PATH = "mobilevit_epoch_5.pth"
CLASS_FILE = "class_order.txt"
```

### Frontend Settings (src/hooks/useSignDetection.ts)

```typescript
const WS_URL = 'ws://localhost:8000/ws/detect';
const FRAME_INTERVAL = 200;  // Send frame every 200ms
```

## 📁 Project Structure

```
.
├── backend_server.py           # FastAPI WebSocket server
├── requirements.txt            # Python dependencies
├── mobilevit_epoch_5.pth      # Model weights
├── class_order.txt            # Class labels (a-z, del, nothing)
├── start_backend.ps1          # Backend startup script (Windows)
├── start_frontend.ps1         # Frontend startup script (Windows)
├── package.json               # Node dependencies
├── src/
│   ├── hooks/
│   │   └── useSignDetection.ts    # WebSocket + webcam handler
│   ├── components/
│   │   ├── CameraPanel.tsx        # Video display + status
│   │   └── WordBuilder.tsx        # Letter collection
│   └── pages/
│       └── Index.tsx              # Main app page
```

## 🔍 Troubleshooting

### Backend Issues

**"Model file not found"**
- Ensure `mobilevit_epoch_5.pth` is in the project root
- Check the file path in `backend_server.py`

**"CUDA out of memory"**
- Model will automatically fall back to CPU
- Or reduce batch size/image resolution

**Port 8000 already in use**
- Change port in `backend_server.py`: `uvicorn.run(app, port=8001)`
- Update frontend `WS_URL` accordingly

### Frontend Issues

**"Failed to connect to WebSocket"**
- Ensure backend is running first
- Check backend is on `http://localhost:8000`
- Verify firewall isn't blocking the connection

**Camera not working**
- Grant camera permissions in browser
- Check camera isn't being used by another app
- Try different browser (Chrome/Firefox recommended)

**No letters detected**
- Ensure good lighting
- Make clear, distinct hand signs
- Hold sign steady for full 8 frames
- Wait for cooldown period (watch timer)

## 🧪 Testing Without Backend

The app includes a **test keyboard** for debugging:
1. In the camera panel, click "Show Test Keyboard"
2. Click letters to simulate detection
3. This works without the backend running

## 📊 Model Details

- **Architecture**: MobileViT-S
- **Classes**: 28 (a-z, del, nothing)
- **Input**: 224x224 RGB images
- **Framework**: PyTorch + timm

## 🔐 Security Notes

For production deployment:
- Update CORS settings in `backend_server.py`
- Use HTTPS/WSS instead of HTTP/WS
- Add authentication/rate limiting
- Validate and sanitize all inputs

## 📝 Key Features

✅ Real-time hand sign detection  
✅ WebSocket for low-latency communication  
✅ Stability checking (8-frame consensus)  
✅ Automatic cooldown (10s between letters)  
✅ Delete gesture support  
✅ Word building and spell checking  
✅ Visual feedback and timers  
✅ Test mode for debugging  

## 🤝 Support

If you encounter issues:
1. Check both backend and frontend consoles for errors
2. Verify all dependencies are installed
3. Ensure model files are present
4. Test with the keyboard simulator first

## 📜 License

This project uses:
- FastAPI (MIT License)
- React (MIT License)
- PyTorch (BSD License)
- MobileViT architecture

---

**Happy Signing!** 🤟✨
