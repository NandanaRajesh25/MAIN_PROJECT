"""
FastAPI WebSocket server for real-time hand sign detection
Integrates MobileViT model with React frontend
"""

import cv2
import base64
import json
import time
import torch
import timm
import asyncio
import numpy as np
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from torchvision import transforms
from collections import deque
from typing import Optional

# ---------------- CONFIG ----------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
NUM_CLASSES = 28
MODEL_PATH = "mobilevit_epoch_5.pth"  # Updated to correct path
CLASS_FILE = "class_order.txt"
PRED_INTERVAL = 10  # seconds between character capture
STABILITY_FRAMES = 8  # frames needed for stable prediction

# ---------------- LOAD CLASSES ----------------
with open(CLASS_FILE, "r") as f:
    CLASS_NAMES = f.read().splitlines()

assert len(CLASS_NAMES) == NUM_CLASSES, "Class count mismatch!"

# ---------------- TRANSFORM ----------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ---------------- LOAD MODEL ----------------
print(f"🔥 Loading model on {DEVICE}...")
model = timm.create_model(
    "mobilevit_s",
    pretrained=False,
    num_classes=NUM_CLASSES
)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()
print("✅ Model loaded successfully!")

# ---------------- FASTAPI APP ----------------
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SESSION STATE ----------------
class DetectionSession:
    def __init__(self):
        self.prediction_queue = deque(maxlen=STABILITY_FRAMES)
        self.last_accept_time = time.time()
        self.text_buffer = []
        
    def reset(self):
        self.prediction_queue.clear()
        self.last_accept_time = time.time()
        self.text_buffer = []

sessions = {}

# ---------------- HELPER FUNCTIONS ----------------
def decode_base64_image(base64_string: str) -> Optional[Image.Image]:
    """Decode base64 image to PIL Image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        img_data = base64.b64decode(base64_string)
        img = Image.open(BytesIO(img_data))
        return img.convert('RGB')
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def predict_sign(image: Image.Image) -> tuple[str, float]:
    """Run model inference on image"""
    try:
        # Transform and prepare image
        x = transform(image).unsqueeze(0).to(DEVICE)
        
        # Inference
        with torch.no_grad():
            outputs = model(x)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, pred_idx = probabilities.max(dim=1)
            
            pred_label = CLASS_NAMES[pred_idx.item()]
            confidence_score = confidence.item()
            
        return pred_label, confidence_score
    except Exception as e:
        print(f"Error in prediction: {e}")
        return "nothing", 0.0

# ---------------- WEBSOCKET ENDPOINT ----------------
@app.websocket("/ws/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = id(websocket)
    sessions[session_id] = DetectionSession()
    session = sessions[session_id]
    
    print(f"🔌 Client connected: {session_id}")
    
    try:
        while True:
            # Receive frame from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                # Decode image
                img = decode_base64_image(message["data"])
                if img is None:
                    continue
                
                # Get prediction
                pred_label, confidence = predict_sign(img)
                
                # Add to stability queue
                session.prediction_queue.append(pred_label)
                
                # Calculate stable prediction
                if len(session.prediction_queue) > 0:
                    stable_pred = max(set(session.prediction_queue), key=session.prediction_queue.count)
                    stable_count = session.prediction_queue.count(stable_pred)
                else:
                    stable_pred = "nothing"
                    stable_count = 0
                
                # Check timing
                current_time = time.time()
                time_since_last = current_time - session.last_accept_time
                remaining_time = max(0, int(PRED_INTERVAL - time_since_last))
                
                # Determine if we should accept this as a letter
                should_accept = (
                    stable_count == STABILITY_FRAMES
                    and time_since_last >= PRED_INTERVAL
                    and stable_pred not in ["nothing", "del"]
                )
                
                should_delete = (
                    stable_count == STABILITY_FRAMES
                    and time_since_last >= PRED_INTERVAL
                    and stable_pred == "del"
                )
                
                # Send response
                response = {
                    "type": "prediction",
                    "current_prediction": pred_label,
                    "stable_prediction": stable_pred,
                    "stable_count": stable_count,
                    "confidence": confidence,
                    "remaining_time": remaining_time,
                    "should_accept": should_accept,
                    "should_delete": should_delete
                }
                
                # If accepting, update session state
                if should_accept:
                    session.last_accept_time = current_time
                    session.text_buffer.append(stable_pred.upper())
                    response["accepted_letter"] = stable_pred.upper()
                    response["text_buffer"] = "".join(session.text_buffer)
                
                if should_delete:
                    session.last_accept_time = current_time
                    if session.text_buffer:
                        session.text_buffer.pop()
                    response["text_buffer"] = "".join(session.text_buffer)
                
                await websocket.send_text(json.dumps(response))
            
            elif message.get("type") == "reset":
                session.reset()
                await websocket.send_text(json.dumps({
                    "type": "reset_complete"
                }))
    
    except WebSocketDisconnect:
        print(f"🔌 Client disconnected: {session_id}")
        if session_id in sessions:
            del sessions[session_id]
    except Exception as e:
        print(f"Error in WebSocket: {e}")
        if session_id in sessions:
            del sessions[session_id]

@app.get("/")
async def root():
    return {
        "message": "Hand Sign Detection API",
        "status": "running",
        "device": DEVICE,
        "model": "MobileViT"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": True}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
