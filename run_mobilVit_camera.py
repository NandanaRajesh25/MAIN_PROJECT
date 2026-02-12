import cv2
import time
import torch
import timm
from torchvision import transforms
from PIL import Image
from collections import deque

# ---------------- CONFIG ----------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

NUM_CLASSES = 28
PRED_INTERVAL = 10          # seconds between character capture
STABILITY_FRAMES = 8        # frames needed for stable prediction

MODEL_PATH = "checkpoints_mobilevit/mobilevit_best.pth"
CLASS_FILE = "class_order.txt"

TEXT_COLOR = (0, 0, 0)      # BLACK (BGR)

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
model = timm.create_model(
    "mobilevit_s",
    pretrained=False,
    num_classes=NUM_CLASSES
)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# ---------------- BUFFERS & TIMERS ----------------
prediction_queue = deque(maxlen=STABILITY_FRAMES)
text_buffer = []

start_time = time.time()            # camera start time
last_accept_time = start_time       # prevents early capture

# ---------------- CAMERA ----------------
cap = cv2.VideoCapture(0)
print("📷 Camera started — Press Q to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    current_time = time.time()

    # ---------- PREPROCESS ----------
    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    x = transform(img).unsqueeze(0).to(DEVICE)

    # ---------- INFERENCE ----------
    with torch.no_grad():
        outputs = model(x)
        pred_idx = outputs.argmax(dim=1).item()
        pred_label = CLASS_NAMES[pred_idx]

    prediction_queue.append(pred_label)

    # ---------- STABILITY CHECK ----------
    stable_pred = max(set(prediction_queue), key=prediction_queue.count)
    stable_count = prediction_queue.count(stable_pred)

    # ---------- TIMER LOGIC ----------
    time_since_last = current_time - last_accept_time
    remaining_time = max(0, int(PRED_INTERVAL - time_since_last))

    # ---------- ACCEPT CHARACTER ----------
    if (
        stable_count == STABILITY_FRAMES
        and time_since_last >= PRED_INTERVAL
    ):
        last_accept_time = current_time

        if stable_pred == "nothing":
            pass

        elif stable_pred == "del":
            if text_buffer:
                text_buffer.pop()

        else:
            text_buffer.append(stable_pred.upper())

    # ---------- DISPLAY ----------
    cv2.putText(
        frame,
        f"Stable: {stable_pred.upper()}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        TEXT_COLOR,
        2
    )

    cv2.putText(
        frame,
        f"Text: {''.join(text_buffer)}",
        (20, 90),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        TEXT_COLOR,
        2
    )

    cv2.putText(
        frame,
        f"Next letter in: {remaining_time}s",
        (20, 140),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        TEXT_COLOR,
        2
    )

    cv2.imshow("MobileViT ISL Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
