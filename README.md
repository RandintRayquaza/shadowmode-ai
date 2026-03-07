# ShadowMode AI - Forensic Image Analysis

ShadowMode is a state-of-the-art AI-powered forensic image analysis dashboard designed to detect deepfakes, AI-generated content, and digital manipulations.

## 🚀 Recent Developments & Fixes

We have undergone a massive overhaul to stabilize the AI pipeline and refine the user experience. Below are the key improvements implemented:

### 1. Robust AI Analysis Pipeline

We have fully wired the analytical pipeline to provide high-fidelity results across six key detection signals:

- **Neural Pattern Match:** Uses a local HuggingFace Swin Transformer model (`umm-maybe/AI-image-detector`) to detect synthetic textures. _Fixed a critical architecture mismatch where the model was incorrectly loading into a ViT class._
- **Hive AI Integration:** Seamless integration with The Hive AI API for world-class deepfake and synthetic detection.
- **Error Level Analysis (ELA):** Identifies differences in JPEG compression levels to reveal pixel-level inconsistencies.
- **Metadata Integrity:** Deep EXIF forensic scan to check for camera signatures and software processing traces (Photoshop, GIMP, etc.).
- **Compression Consistency & Noise Distribution:** Heuristic analysis of image artifacts and noise patterns.

### 2. UI/UX & Visibility Improvements

- **Semantic Theming:** Replaced hardcoded color values with Tailwind CSS semantic variables (`text-foreground`, `bg-card`, etc.). The dashboard now scales perfectly between Light and Dark modes with full element visibility.
- **Real-time Feedback:** The analysis page now displays real percentages and a cumulative **Risk Score** instead of placeholder values.
- **Forensic Gauge:** Implemented a dynamic SVG gauge that animates the Trust/Risk score based on the scan results.

### 3. Core Reliability & System Fixes

- **Local File Serving:** Replaced the unstable ImageKit integration with a robust local file serving mechanism. Images are now stored in `backend/public/uploads` and served directly, eliminating 404 errors.
- **Crash Prevention:** Added optional chaining to user data rendering in `SettingsPage.jsx` to prevent "TypeError: charAt of undefined" during initial loads.
- **Process Management:** Resolved multiple `EADDRINUSE` port conflicts by implementing a robust cleanup strategy for orphaned Node and Python processes.

---

## 🛠️ Architecture

The project follows a 4-layer React architecture and a microservices-based backend:

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion.
- **Backend API:** Node.js + Express (Port 3001) + Firestore Database.
- **AI Microservice:** Python Flask (Port 5001) + PyTorch + Transformers + OpenCV.
- **External API:** Hive AI Detection.

## 🚦 Getting Started

### 1. Requirements

- Node.js v18+
- Python 3.10+
- Hive AI API Key (stored in `backend/.env`)

### 2. Installation

```bash
# Install Node dependencies
cd backend && npm install
cd ../frontend && npm install

# Install Python dependencies
cd ../ai-service
pip install -r requirements.txt
```

### 3. Running the App

Open three terminals:

1. **Frontend:** `cd frontend && npm run dev`
2. **Backend:** `cd backend && npm run dev`
3. **AI Service:** `cd ai-service && py app.py`

---

## 👤 Credits

Developed for a high-performance production-ready hackathon environment.
