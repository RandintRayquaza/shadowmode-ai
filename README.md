# ShadowMode

**AI-powered image forensics platform.** Upload any image and ShadowMode runs a full forensic pipeline — neural AI detection, Error Level Analysis (ELA), metadata extraction, and compression analysis — to determine whether the image is authentic, edited, or AI-generated.

---

## Architecture

ShadowMode is a **three-tier monorepo**:

```
shadowmode/
├── frontend/       # React 19 + Vite SPA
├── backend/        # Node.js + Express REST API
└── ai-service/     # Python + Flask forensic engine
```

| Layer | Stack | Responsibility |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Redux Toolkit, GSAP, Framer Motion | UI, auth flows, analysis UI, dashboard, history |
| **Backend** | Node.js, Express, Firebase Admin, ImageKit, Multer | API gateway, auth middleware, image storage, Firestore, score aggregation |
| **AI Service** | Python, Flask, PyTorch, HuggingFace Transformers, OpenCV, Pillow | Neural detection, ELA, EXIF metadata, heuristic signals |

---

## Features

- **Neural AI Detection** — HuggingFace `umm-maybe/AI-image-detector` model classifies images as human-captured or AI-generated
- **Error Level Analysis (ELA)** — Detects re-saved or locally-edited regions by analysing JPEG compression inconsistencies
- **Metadata Forensics** — EXIF extraction flags missing camera make/model/datetime fields common in synthetic images
- **Compression & Noise Signals** — Heuristics-based checks for noise distribution and compression artifacts
- **Forensic Score** — A single 0–100 authenticity score synthesised from all signals, with verdict: Authentic / Possibly Edited / AI Generated
- **Analysis History** — All scans stored in Firestore and accessible per-user from the dashboard
- **Firebase Auth** — Email/password + OTP-based sign-up with protected routes
- **Image CDN** — Original and ELA heatmap images stored on ImageKit

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- A Firebase project (Firestore + Authentication enabled)
- An ImageKit account

### 1. Clone

```bash
git clone https://github.com/your-username/shadowmode.git
cd shadowmode
```

### 2. Environment Variables

**`backend/.env`**
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
AI_SERVICE_URL=http://localhost:8000
```

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. AI Service

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # macOS/Linux

# Install dependencies (downloads PyTorch + HuggingFace model on first run)
pip install -r ai-service/requirements.txt

# Start
cd ai-service
python app.py
# Runs on http://localhost:8000
```

> The HuggingFace model (`umm-maybe/AI-image-detector`) is downloaded and cached on first startup.

### 4. Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Project Structure

```
frontend/src/
├── app/
│   ├── layout/              # Root layout wrappers
│   ├── providers/           # AuthContext, SmoothScroll (Lenis)
│   └── router/              # AppRouter, ProtectedRoute
├── features/
│   ├── ai-analysis/         # Upload, scan, result report (AnalysisPage)
│   ├── auth/                # Login, Signup, OTP, ForgotPassword
│   ├── dashboard/           # Overview stats + recent scans
│   ├── history/             # Full scan history table
│   ├── landing/             # Hero, Features, HowItWorks, CTA sections
│   └── settings/            # Account settings
├── shared/
│   ├── components/          # Navbar, Footer, Preloader, ErrorBoundary, shadcn/ui
│   └── utils/               # apiClient, firebase, cn utility
└── store/                   # Redux store (analysis slice, dashboard slice)

backend/src/
├── controllers/             # analyzeController, historyController, resultController
├── middleware/              # authMiddleware (Firebase token verify), validate
├── routes/                  # /api/analyze, /api/history, /api/result, /api/auth
├── services/                # firestoreService, imagekitService, llmService, pythonBridge, scoreService
└── config/                  # Firebase Admin init

ai-service/
├── app.py                   # Flask app + /analyze endpoint
└── services/
    ├── ai_detector.py       # HuggingFace neural model inference
    ├── ela.py               # Error Level Analysis (OpenCV + Pillow)
    ├── heuristics.py        # Compression/noise heuristics
    └── metadata.py          # EXIF extraction (exifread)
```

---

## API Reference

### Backend (`localhost:5000`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Upload image, run forensic pipeline, return analysis ID |
| `GET` | `/api/result/:id` | Fetch full analysis result by ID |
| `GET` | `/api/history` | Fetch authenticated user's scan history |
| `GET` | `/api/health` | Service health check |

All endpoints except `/api/health` require a Firebase ID token in the `Authorization: Bearer <token>` header.

### AI Service (`localhost:8000`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Accepts multipart `image` file, returns JSON with score, signals, ELA heatmap |
| `GET` | `/health` | Service health check |

---

## Tech Stack

**Frontend**
- React 19 + Vite 6
- Tailwind CSS v4 (`@theme` configuration)
- GSAP 3 + `@gsap/react` (scroll animations, stagger effects)
- Framer Motion 12 (component transitions, SVG animations)
- Lenis (smooth scroll)
- Redux Toolkit (global analysis + dashboard state)
- React Router DOM v7
- Firebase JS SDK v12
- Lucide React icons

**Backend**
- Node.js + Express 4
- Firebase Admin SDK (Firestore + Auth token verification)
- ImageKit SDK (image CDN upload)
- Multer (multipart file handling)
- Axios (AI service bridge)

**AI Service**
- Python 3.10+
- Flask + flask-cors
- PyTorch + HuggingFace Transformers (`umm-maybe/AI-image-detector`)
- OpenCV (headless) + Pillow (ELA processing)
- exifread (EXIF metadata extraction)
- NumPy

**Infrastructure**
- Firebase — Authentication + Firestore database
- ImageKit — Image storage and CDN delivery

---

## Scripts

| Directory | Command | Action |
|---|---|---|
| `frontend` | `npm run dev` | Start Vite dev server (port 5173) |
| `frontend` | `npm run build` | Production build to `dist/` |
| `frontend` | `npm run lint` | Run ESLint |
| `backend` | `npm run dev` | Start backend with nodemon (port 5000) |
| `backend` | `npm start` | Start backend (production) |
| `ai-service` | `python app.py` | Start Flask AI service (port 8000) |

---

## License

MIT
