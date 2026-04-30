# ElectWise — Civic Education Platform
### 🏆 Hack2Skill Virtual PromptWars Hackathon 2024

> **Live Demo:** [https://electwise-frontend-pnvu67pqfq-uc.a.run.app](https://electwise-frontend-pnvu67pqfq-uc.a.run.app)  
> [![Hack2Skill](https://img.shields.io/badge/Hack2Skill-PromptWars%202024-orange)](https://hack2skill.com)

A full-stack Election Process Education web application empowering every Indian citizen with knowledge about voter rights, election procedures, and democratic participation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Fonts | Newsreader (headings) + Work Sans (body) |
| Design System | Google Stitch (project: `10852318437017309646`) |
| Icons | Lucide React |
| Charts | React Google Charts (Timeline/Gantt) |
| AI | Google Gemini 2.0 Flash API |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting + Google Cloud Run |
| Containerization | Docker (nginx:stable-alpine, port 8080) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│          React 19 + Vite + Tailwind CSS v4              │
│   Home | Journey | Chat | Timeline | Glossary | Dashboard│
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
          ┌──────────┴──────────┐
          │                     │
  ┌───────▼───────┐    ┌────────▼────────┐
  │  Firebase     │    │  Google Cloud   │
  │  Hosting      │    │  Run (nginx)    │
  │  (Frontend)   │    │  Port 8080      │
  └───────┬───────┘    └────────┬────────┘
          └──────────┬──────────┘
                     │
         ┌───────────▼────────────┐
         │   Firebase Services    │
         │  ┌──────────────────┐  │
         │  │  Auth (Google)   │  │
         │  ├──────────────────┤  │
         │  │  Firestore DB    │  │
         │  └──────────────────┘  │
         └───────────┬────────────┘
                     │
              ┌──────▼──────┐
              │  Gemini 2.0 │
              │  Flash API  │
              └─────────────┘
```

---

## Pages

| Page | Route | Features |
|---|---|---|
| Home | `/` | Hero, 4 feature cards, How It Works, CTA |
| Election Journey | `/journey` | 5-step accordion, progress tracking, confetti |
| AI Civic Assistant | `/chat` | Gemini AI chat, typing indicator, Firestore history |
| Election Timeline | `/timeline` | Google Charts Gantt, 3 filter tabs, key dates |
| Glossary & Quiz | `/glossary` | 22-term searchable glossary, 10-question quiz, share |
| Dashboard | `/dashboard` | Democracy Score, streak, parallel Firestore data |

---

## Firestore Schema

| Collection | Document | Fields |
|---|---|---|
| `userProgress` | `{uid}` | `completedSteps[]`, `updatedAt` |
| `chatHistory/{uid}/messages` | `{id}` | `question`, `answer`, `createdAt` |
| `quizScores` | `{uid}` | `score`, `totalQuestions`, `completedAt` |

---

## Local Setup

### Prerequisites
- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud CLI (for Cloud Run deploy)

### 1. Clone & Install
```bash
git clone https://github.com/Yashjain329/electwise.git
cd electwise
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=       # Get from https://aistudio.google.com
```

### 3. Firebase Setup
```bash
firebase login
firebase use electwise-ebb29
firebase deploy --only firestore
```

### 4. Run Locally
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Firebase Config Guide

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `electwise-ebb29`
3. Project Settings → Your Apps → Web App → Get SDK config
4. Enable **Authentication** → Sign-in method → Google
5. Enable **Cloud Firestore** → Create database → Production mode
6. Copy config values to `.env`

---

## Cloud Run Deployment

### Prerequisites: Enable Billing on GCP
1. Go to: https://console.cloud.google.com/billing/projects
2. Link billing account to project `electwise-ebb29`

### Build & Deploy
```bash
# Enable APIs (requires billing)
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build Docker image (env vars baked in at build time)
gcloud builds submit \
  --tag gcr.io/electwise-ebb29/electwise-frontend \
  --build-arg VITE_FIREBASE_API_KEY=... \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=electwise-ebb29.firebaseapp.com \
  --build-arg VITE_FIREBASE_PROJECT_ID=electwise-ebb29 \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=electwise-ebb29.firebasestorage.app \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=302794556819 \
  --build-arg VITE_FIREBASE_APP_ID=1:302794556819:web:3892536de72c0971539466 \
  --build-arg VITE_GEMINI_API_KEY=...

# Deploy to Cloud Run
gcloud run deploy electwise-frontend \
  --image gcr.io/electwise-ebb29/electwise-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

---

## Key Design Decisions

- **Stitch Design Tokens**: Colors, typography, and spacing faithfully ported from Google Stitch Civic Modernism design system
- **Offline-friendly**: Journey, Glossary, Timeline pages work fully without Firestore (static data fallback)  
- **Security**: API keys in environment variables only; Firestore rules enforce user-level isolation
- **Accessibility**: ARIA labels on all interactive elements; keyboard navigation supported

---

## License
MIT — Feel free to fork and adapt for your civic education needs.
