# VIBE SCENT: Luxury Interactive Scent Experience

## Overview
A high-end, interactive 3D frontend that lets users "feel" scents through physics-driven smoke and voice, powered by React, Three.js (React Three Fiber), and Web Speech API. Backend is FastAPI for scent analysis.

## Features
- 3D smoke moves with mouse (GPU-accelerated)
- Voice feedback for scent selection
- Two scent modes: Dark Woody & Fresh Citrus
- Backend API for scent analysis (extendable for AI)

## Setup Instructions

### Frontend
1. Open terminal in workspace root.
2. Run:
   ```bash
   npx create-react-app scent-vibe
   cd scent-vibe
   npm install three @react-three/fiber @react-three/drei framer-motion
   npm start
   ```
3. Replace `src/App.js` with the provided code.

### Backend
1. Open a new terminal.
2. Run:
   ```bash
   mkdir backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn openai
   ```
3. Add `main.py` (provided).
4. Start backend:
   ```bash
   uvicorn main:app --reload
   ```

## Deployment
- Frontend: Deploy to GitHub Pages, Netlify, or Vercel.
- Backend: Deploy to Render, Heroku, or any cloud supporting FastAPI.

## Judges' Experience
- Move mouse: smoke reacts in real time.
- Click scent buttons: voice speaks scent description.
- Backend ready for AI scent analysis.

## Customization
- Add more scents, connect OpenAI for advanced analysis.
- Change colors, add branding, update UI overlay.

---

For questions or demo links, contact the project owner.
