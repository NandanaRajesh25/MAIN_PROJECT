# 🚀 Quick Start Reference

## Start the Application (2 Terminals)

### Terminal 1 - Backend
```powershell
python backend_server.py
```
Wait for: `✅ Model loaded successfully!`

### Terminal 2 - Frontend
```powershell
npm run dev
```
Open browser to the URL shown (usually http://localhost:5173)

## Usage Flow

1. Click **"Start Camera Detection"** button
2. Allow camera access when prompted
3. Make hand signs in front of camera
4. Letters appear in "Building Your Word" after:
   - 8 consecutive stable frames
   - 10 second cooldown
5. Click **"Done"** to check spelling
6. View correct sign videos if needed

## Hand Signs Detected

- **a-z**: 26 letters of the alphabet
- **del**: Removes last letter
- **nothing**: No action (empty sign)

## Timing

- **Detection Stability**: 8 frames
- **Letter Cooldown**: 10 seconds
- **Frame Rate**: 5 fps (every 200ms)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | `pip install -r requirements.txt` |
| Frontend won't start | `npm install` |
| No camera feed | Allow camera permissions in browser |
| No detections | Ensure backend is running, check lighting |
| Wrong port | Backend: port 8000, Frontend: port 5173 |

## Test Mode

Can't start backend? Use the test keyboard:
1. In camera panel, click "Show Test Keyboard"
2. Click letters to test word building
3. Works offline without model

## File Checklist

✅ `mobilevit_epoch_5.pth` (model weights)  
✅ `class_order.txt` (28 class labels)  
✅ `backend_server.py` (API server)  
✅ `requirements.txt` (Python deps)  
