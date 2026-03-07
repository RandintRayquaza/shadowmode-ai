# ShadowMode AI - Forensic Image Analysis

ShadowMode is a state-of-the-art AI-powered forensic image analysis dashboard designed to detect deepfakes, AI-generated content, and digital manipulations.

## 🚀 Overview

ShadowMode provides high-fidelity results across multiple detection signals, enabling investigators to verify image authenticity with confidence. The platform combines advanced computer vision models with statistical analysis to reveal hidden synthetic patterns and pixel-level inconsistencies.

## 🏗️ System Architecture

ShadowMode consists of three core components:

1.  **Frontend (React + Vite)**: A cinematic, high-end dashboard built with React, Redux Toolkit, Framer Motion, and GSAP. It handles user interactions, image uploads, and visualizes complex analysis results.
2.  **Backend API (Node.js + Express)**: Orchestrates authentication via Firebase and persists analysis history in Firestore. It acts as a secure bridge between the frontend and the AI microservice.
3.  **AI Analysis Service (Flask)**: A Python-based microservice that runs the heavy computational models. It performs ensemble AI detection, Error Level Analysis (ELA), and metadata extraction.

---

## 🧠 AI Analysis Pipeline

ShadowMode uses a multi-layered verification strategy:

### 1. Ensemble AI Detection

We employ two independent local HuggingFace transformers to cross-verify synthetic patterns:

- **Model 1 (`umm-maybe/AI-image-detector`)**: Optimized for synthetic texture detection.
- **Model 2 (`prithivMLmods/AI-Image-Detector`)**: Provides a second independent validation layer.
- **Ensemble Score**: The final AI probability is an ensemble of both models, ensuring high reliability even if one model is less confident.

### 2. Error Level Analysis (ELA)

Identifies differences in JPEG compression levels. Significant variations in ELA help reveal where an image has been modified by showing high-contrast "noise" in specific areas.

### 3. Metadata Integrity

Examines the EXIF data stored within the image. It looks for missing camera headers, timestamps, or software fingerprints (like Adobe Photoshop) to assess the likelihood of tampering.

### 4. Heuristic Scoring

An integrated logic engine assesses the combined output of all signals to calculate a final **Authenticity Score** (0-100) and provides a clear verdict (Authentic, Possibly Edited, Likely Manipulated, or AI Generated).

---

## ⚙️ Tech Stack

### Frontend

- **Framework**: React (Vite)
- **State Management**: Redux Toolkit (RTK)
- **Animations**: Framer Motion & GSAP
- **Styling**: Vanilla CSS & TailwindCSS
- **Authentication**: Firebase SDK

### Backend

- **Platform**: Node.js (Express)
- **Database**: Google Firestore
- **Auth**: Firebase Admin SDK
- **Storage**: Multer (In-memory)

### AI Microservice

- **Platform**: Python (Flask)
- **Deep Learning**: PyTorch & Transformers (HuggingFace)
- **Image Processing**: Pillow & NumPy

---

## 🛠️ Setup & Installation

### 1. AI Analysis Service

```bash
cd ai-service
pip install -r requirements.txt
py app.py
```

_Note: On the first run, it will download the HuggingFace model weights (~1GB each)._

### 2. Backend API

```bash
cd backend
npm install
npm run dev
```

_Ensure you have a `.env` file with Firebase Admin SDK credentials._

### 3. Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Data Isolation

ShadowMode uses strict session-based data isolation. Every API request is protected by Firebase ID Token validation. The Redux store is completely reset on logout, ensuring that switching accounts never leaks history or analysis results between users.
