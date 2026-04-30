/**
 * ElectWise — Firebase Cloud Functions
 * Endpoints:
 *   POST /api/chat    — Gemini 2.5 Flash proxy with rate limiting
 *   GET  /api/questions — Returns quiz questions (server-side)
 *   POST /api/scores  — Validates and writes quiz score
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are ElectWise, a civic education assistant. Answer only questions related to election processes, voter rights, and democratic procedures in India. Be clear, factual, and concise. If asked anything unrelated, politely redirect to election topics.`;

// ── RATE LIMIT HELPER ────────────────────────────────────────────────────────
async function checkRateLimit(uid) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const MAX_REQUESTS = 20;

  const ref = db.collection('rateLimits').doc(uid);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({ count: 1, windowStart: now });
    return true;
  }

  const data = snap.data();
  if (now - data.windowStart > windowMs) {
    // Reset window
    await ref.set({ count: 1, windowStart: now });
    return true;
  }

  if (data.count >= MAX_REQUESTS) return false;

  await ref.update({ count: admin.firestore.FieldValue.increment(1) });
  return true;
}

// ── POST /chat ────────────────────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { question, uid } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'question is required' });
    }

    // Rate limit (only for authenticated users)
    if (uid) {
      const allowed = await checkRateLimit(uid);
      if (!allowed) {
        return res.status(429).json({ error: 'Rate limit exceeded. Try again in an hour.' });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured.' });
    }

    const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest'];
    let answer = null;
    let usedModel = null;

    for (const model of MODELS) {
      try {
        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: question.trim() }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
          }
        );

        if (apiRes.status === 429 || apiRes.status === 503) continue;
        if (!apiRes.ok) {
          const err = await apiRes.json().catch(() => ({}));
          throw new Error(err?.error?.message || `API error ${apiRes.status}`);
        }

        const data = await apiRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) { answer = text; usedModel = model; break; }
      } catch (e) {
        if (e.message?.includes('fetch')) throw e;
      }
    }

    if (!answer) {
      return res.status(503).json({ error: 'All Gemini models are busy. Please try again.' });
    }

    // Optionally save to Firestore
    if (uid) {
      await db
        .collection('chatHistory')
        .doc(uid)
        .collection('messages')
        .add({ question: question.trim(), answer, model: usedModel, createdAt: admin.firestore.FieldValue.serverTimestamp() })
        .catch(() => {});
    }

    res.json({ answer, model: usedModel });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── GET /questions ────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: 'What is the minimum age to vote in Indian elections?', options: ['16', '18', '21', '25'], correct: 1 },
  { q: 'How many phases did the 2024 Lok Sabha election have?', options: ['5', '6', '7', '9'], correct: 2 },
  { q: 'Which form is used to register as a new voter in India?', options: ['Form 1', 'Form 6', 'Form 8', 'Form 12'], correct: 1 },
  { q: 'What does NOTA stand for?', options: ['None of The Applicants', 'None of the Above', 'Not One True Answer', 'No Other Than Abstain'], correct: 1 },
  { q: 'The Model Code of Conduct is enforced by which body?', options: ['Supreme Court', 'President of India', 'Election Commission of India', 'Ministry of Law'], correct: 2 },
  { q: 'How many days before polling must campaigning stop?', options: ['24 hours', '36 hours', '48 hours', '72 hours'], correct: 2 },
  { q: 'VVPAT slip is visible for how many seconds?', options: ['3 seconds', '5 seconds', '7 seconds', '10 seconds'], correct: 2 },
  { q: 'Which Constitutional amendment established Panchayati Raj elections?', options: ['70th', '71st', '73rd', '74th'], correct: 2 },
  { q: 'An Election Petition must be filed within how many days of result?', options: ['30 days', '45 days', '60 days', '90 days'], correct: 1 },
  { q: 'What system does India use for voting?', options: ['Proportional Representation', 'Single Transferable Vote', 'First Past the Post', 'Approval Voting'], correct: 2 },
];

app.get('/questions', (req, res) => {
  // Return questions without correct answers for client; send separately on submit
  const safeQuestions = QUIZ_QUESTIONS.map(({ q, options }) => ({ q, options }));
  res.json({ questions: safeQuestions });
});

// ── POST /scores ──────────────────────────────────────────────────────────
app.post('/scores', async (req, res) => {
  try {
    const { uid, answers } = req.body;
    if (!uid || !Array.isArray(answers) || answers.length !== QUIZ_QUESTIONS.length) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Server-side scoring
    let score = 0;
    answers.forEach((ans, i) => {
      if (ans === QUIZ_QUESTIONS[i].correct) score++;
    });

    await db.collection('quizScores').doc(uid).set({
      score,
      totalQuestions: QUIZ_QUESTIONS.length,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ score, totalQuestions: QUIZ_QUESTIONS.length });
  } catch (err) {
    console.error('Score error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── Export ────────────────────────────────────────────────────────────────────
exports.api = functions.https.onRequest(app);
