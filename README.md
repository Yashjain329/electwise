# 🗳️ ElectWise — AI-Powered Civic Education Platform

[![Hack2Skill PromptWars 2026](https://img.shields.io/badge/Hack2Skill-PromptWars%202026-FF6B00?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCA0IDgtNE0yIDEybDggNCA4LTQiLz48L3N2Zz4=)](https://hack2skill.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/run)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Click_Here-1A3A6B?style=for-the-badge)](https://electwise-frontend-REPLACE.run.app)

> **Empowering every Indian citizen with democratic knowledge — from registration to results.**

ElectWise is a full-stack civic education web app built for the **Hack2Skill Virtual PromptWars 2026** hackathon. It combines an interactive Election Journey Map, an AI-powered Civic Assistant (Google Gemini), an Election Timeline, a Glossary, a Quiz, and a personal Dashboard — all backed by Firebase.

---

## 🚀 Live Demo

> **[https://electwise-frontend-REPLACE.run.app](https://electwise-frontend-REPLACE.run.app)**  
> _(Replace URL after Cloud Run deployment completes)_

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite + React Router v6 |
| **Styling** | Tailwind CSS v4 (custom design tokens) |
| **Fonts** | Newsreader (serif) + Work Sans (sans) via Google Fonts |
| **Charts** | React Google Charts (Timeline/Gantt) |
| **Icons** | Lucide React |
| **AI** | Google Gemini 2.0 Flash API |
| **Auth** | Firebase Authentication (Google Sign-In) |
| **Database** | Cloud Firestore |
| **Backend** | Firebase Cloud Functions (Node.js 20) |
| **Hosting** | Firebase Hosting + Google Cloud Run |
| **CI/CD** | Google Cloud Build (triggered from GitHub) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  React 19 + Vite + Tailwind CSS v4                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Home    │ │ Journey  │ │  Chat    │ │ Timeline │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐                                     │
│  │ Glossary │ │Dashboard │                                     │
│  └──────────┘ └──────────┘                                     │
└───────────────┬─────────────────┬───────────────────────────────┘
                │                 │
        Firebase SDK          HTTPS calls
                │                 │
┌───────────────▼──────┐  ┌──────▼──────────────────────────────┐
│   Firebase Services  │  │   Firebase Cloud Functions (API)    │
│  ┌────────────────┐  │  │  POST /api/chat  → Gemini AI        │
│  │  Firestore DB  │  │  │  GET  /api/questions                │
│  ├────────────────┤  │  │  POST /api/scores                   │
│  │  Auth (Google) │  │  └─────────────────────────────────────┘
│  └────────────────┘  │
└──────────────────────┘

                CI/CD Pipeline
┌──────────────────────────────────────────────────────────────┐
│  GitHub (main branch push)                                   │
│       → Cloud Build (cloudbuild.yaml)                        │
│       → Docker multi-stage build (node:20-slim + nginx)      │
│       → Push to Container Registry (gcr.io)                  │
│       → Deploy to Cloud Run (us-central1, port 8080)         │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Election Journey Map** | 5-step interactive accordion with Firestore progress tracking & confetti |
| 🤖 **AI Civic Assistant** | Gemini-powered chat with suggested questions & typing indicator |
| 📅 **Election Timeline** | Gantt-style Google Charts timeline for National / State / Local elections |
| 📖 **Glossary** | Searchable glossary with 22 civic terms |
| 🎯 **Civic Quiz** | 10-question quiz with score saved to Firestore & Web Share API |
| 📊 **Personal Dashboard** | Democracy Score, streaks, quiz history — protected by Firebase Auth |

---

## 📋 Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud SDK (for Cloud Run deployment)
- A Firebase project with Firestore + Google Auth enabled
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

---

## ⚙️ Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/Yashjain329/electwise.git
cd electwise

# 2. Install frontend dependencies
npm install

# 3. Copy and fill in the environment variables
cp .env.example .env
# Edit .env with your Firebase config and Gemini API key

# 4. Start the dev server
npm run dev
# → http://localhost:5173

# 5. (Optional) Install and run Cloud Functions locally
cd functions && npm install && cd ..
firebase emulators:start --only functions,firestore
```

---

## 🔥 Firebase Configuration

### 1. Create Firebase Project
```bash
firebase login
firebase projects:create electwise-ebb29
```

### 2. Enable Services in Firebase Console
- **Authentication** → Sign-in Methods → Enable Google
- **Firestore** → Create database (nam5 region, production mode)

### 3. Set Environment Variables

Create `.env` from `.env.example` and fill in all values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Deploy Firestore Rules & Cloud Functions
```bash
firebase deploy --only firestore:rules
cd functions && npm install && cd ..
firebase deploy --only functions
```

---

## 🐳 Google Cloud Run Deployment

### Step 1: Create Secrets in Secret Manager
```bash
gcloud secrets create VITE_FIREBASE_API_KEY --data-file=<(echo -n "YOUR_VALUE")
gcloud secrets create VITE_FIREBASE_AUTH_DOMAIN --data-file=<(echo -n "YOUR_VALUE")
gcloud secrets create VITE_FIREBASE_PROJECT_ID --data-file=<(echo -n "YOUR_VALUE")
gcloud secrets create VITE_FIREBASE_STORAGE_BUCKET --data-file=<(echo -n "YOUR_VALUE")
gcloud secrets create VITE_FIREBASE_MESSAGING_SENDER_ID --data-file=<(echo -n "YOUR_VALUE")
gcloud secrets create VITE_FIREBASE_APP_ID --data-file=<(echo -n "YOUR_VALUE")
gcloud secrets create VITE_GEMINI_API_KEY --data-file=<(echo -n "YOUR_VALUE")
```

### Step 2: Grant Cloud Build Permissions
```bash
# Get your Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:${CB_SA}" --role="roles/run.admin"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:${CB_SA}" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:${CB_SA}" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:${CB_SA}" --role="roles/secretmanager.secretAccessor"
```

### Step 3: Connect GitHub Repo to Cloud Build
1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Connect Repository** → GitHub → `Yashjain329/electwise`
3. Create a trigger: **Push to main branch** → use `cloudbuild.yaml`

### Step 4: Manual Deploy (or push to main)
```bash
gcloud builds submit --config cloudbuild.yaml --project electwise-ebb29
```

### Step 5: Allow Unauthenticated Access
```bash
gcloud run services add-iam-policy-binding electwise-frontend \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

---

## 📁 Project Structure

```
electwise/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          # Landing page with hero + feature cards
│   │   ├── Journey.jsx       # 5-step interactive stepper
│   │   ├── Chat.jsx          # AI Civic Assistant (Gemini)
│   │   ├── Timeline.jsx      # Gantt election timeline
│   │   ├── GlossaryQuiz.jsx  # Glossary + 10-question quiz
│   │   └── Dashboard.jsx     # Protected user dashboard
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Toast.jsx
│   │   └── ProtectedRoute.jsx
│   ├── hooks/
│   │   ├── useAuth.jsx       # Google Sign-In hook
│   │   └── useFirestore.js   # Firestore CRUD hook
│   ├── firebase.js           # Firebase initialization
│   ├── App.jsx               # Router setup
│   └── index.css             # Tailwind + design tokens
├── functions/
│   ├── index.js              # Cloud Functions (chat, questions, scores)
│   └── package.json
├── Dockerfile                # Multi-stage build (node:20 → nginx)
├── nginx.conf                # SPA routing, gzip, port 8080
├── cloudbuild.yaml           # Cloud Build CI/CD pipeline
├── firebase.json             # Firebase Hosting + Functions config
├── firestore.rules           # Security rules (auth-scoped)
├── .env.example              # Environment variable template
└── README.md
```

---

## 🔐 Security

- **Firestore rules**: Users can only read/write their own documents (`auth.uid == userId`)
- **API keys**: Never exposed in frontend code — stored in Cloud Run env vars and Secret Manager
- **Rate limiting**: 20 AI chat requests per user per hour (enforced in Cloud Functions)
- **CORS**: Cloud Functions only accept requests from allowed origins

---

## 📊 Lighthouse Targets

| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

---

## 🤝 Contributing

This project was built for the **Hack2Skill Virtual PromptWars 2026** hackathon.  
Feel free to fork, star ⭐, and contribute!

---

## 📄 License

MIT © 2026 [Yash Jain](https://github.com/Yashjain329)
