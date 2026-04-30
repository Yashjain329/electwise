import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import {
  Trophy, Flame, MessageSquare, Map, BookOpen,
  ArrowRight, Star, TrendingUp, CheckCircle2, Clock
} from 'lucide-react';

function CountUp({ target, duration = 1500 }) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target]);

  return <span>{value}</span>;
}

function calcStreak(messages) {
  if (!messages.length) return 0;
  const dates = [...new Set(messages.map(m => {
    const ts = m.createdAt?.toDate?.();
    return ts ? ts.toDateString() : null;
  }).filter(Boolean))].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let current = new Date();
  for (const d of dates) {
    const diff = Math.round((current - new Date(d)) / 86400000);
    if (diff <= 1) { streak++; current = new Date(d); }
    else break;
  }
  return streak;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [progress, setProgress] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const [chatCount, setChatCount] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Dashboard — ElectWise';
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progSnap, quizSnap, chatSnap] = await Promise.all([
        getDoc(doc(db, 'userProgress', user.uid)),
        getDoc(doc(db, 'quizScores', user.uid)),
        getDocs(query(collection(db, 'chatHistory', user.uid, 'messages'), orderBy('createdAt', 'desc'), limit(50)))
      ]);
      if (progSnap.exists()) setProgress(progSnap.data());
      if (quizSnap.exists()) setQuizScore(quizSnap.data());
      const msgs = chatSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatHistory(msgs);
      setChatCount(msgs.length);
    } catch (e) {
      addToast('Some data could not be loaded.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = progress?.completedSteps || [];
  const latestQuizScore = quizScore?.score || 0;
  const stepScore = Math.round((completedSteps.length / 5) * 40);
  const quizScorePoints = Math.round((latestQuizScore / 10) * 40);
  const chatPoints = chatCount > 5 ? 20 : chatCount * 4;
  const democracyScore = stepScore + quizScorePoints + chatPoints;
  const streak = calcStreak(chatHistory);

  const steps = ['registration', 'nomination', 'campaigning', 'polling', 'results'];
  const stepLabels = { registration: 'Voter Registration', nomination: 'Candidate Nomination', campaigning: 'Election Campaign', polling: 'Polling Day', results: 'Counting & Results' };
  const firstIncomplete = steps.find(s => !completedSteps.includes(s));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1A3A6B] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#43474f]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="page-wrapper">
      {/* Header */}
      <section className="hero-gradient text-white py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6">
          {user.photoURL && (
            <img src={user.photoURL} alt={user.displayName} className="w-20 h-20 rounded-2xl border-4 border-white/20" />
          )}
          <div>
            <p className="text-[#fc8b19] text-sm font-semibold uppercase tracking-wider mb-1">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-bold font-serif">{user.displayName || 'Civic Champion'}</h1>
            <p className="text-white/70 mt-1">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── DEMOCRACY SCORE ─────── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Big score card */}
            <div className="md:col-span-2 card p-8 bg-gradient-to-br from-[#002451] to-[#1A3A6B] text-white">
              <div className="flex items-center gap-2 mb-3">
                <Star size={18} className="text-[#fc8b19]" />
                <span className="text-sm font-semibold uppercase tracking-wider text-white/70">Democracy Score</span>
              </div>
              <div className="text-7xl font-bold font-serif mb-2">
                <CountUp target={democracyScore} />
                <span className="text-3xl text-white/50">/100</span>
              </div>
              <div className="progress-bar mb-3 bg-white/20">
                <div className="progress-fill bg-[#fc8b19]" style={{ width: `${democracyScore}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mt-4">
                <div className="text-center">
                  <p className="text-white/50 mb-1">Journey</p>
                  <p className="font-bold text-[#fc8b19]">{stepScore}/40</p>
                </div>
                <div className="text-center">
                  <p className="text-white/50 mb-1">Quiz</p>
                  <p className="font-bold text-[#fc8b19]">{quizScorePoints}/40</p>
                </div>
                <div className="text-center">
                  <p className="text-white/50 mb-1">AI Chat</p>
                  <p className="font-bold text-[#fc8b19]">{chatPoints}/20</p>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={18} className="text-orange-500" />
                <span className="text-sm font-semibold text-[#43474f] uppercase tracking-wider">Day Streak</span>
              </div>
              <p className="text-5xl font-bold font-serif text-[#002451]"><CountUp target={streak} /></p>
              <p className="text-xs text-[#43474f] mt-2">consecutive days active</p>
              {streak > 0 && <p className="text-xs text-orange-500 mt-2 font-medium">🔥 Keep it up!</p>}
            </div>

            {/* Chat count */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-[#1A3A6B]" />
                <span className="text-sm font-semibold text-[#43474f] uppercase tracking-wider">AI Chats</span>
              </div>
              <p className="text-5xl font-bold font-serif text-[#002451]"><CountUp target={chatCount} /></p>
              <p className="text-xs text-[#43474f] mt-2">questions asked</p>
              {chatCount >= 5 && <p className="text-xs text-green-600 mt-2 font-medium">✅ Max bonus earned!</p>}
            </div>
          </div>

          {/* ── JOURNEY PROGRESS ────── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Map size={18} className="text-[#1A3A6B]" />
                <h2 className="text-xl font-bold font-serif">Journey Progress</h2>
              </div>
              <span className="text-sm text-[#43474f]">{completedSteps.length}/5 steps</span>
            </div>
            <div className="progress-bar mb-5">
              <div className="progress-fill" style={{ width: `${(completedSteps.length / 5) * 100}%` }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {steps.map(s => (
                <div key={s} className={`p-3 rounded-xl text-center text-xs font-medium border ${
                  completedSteps.includes(s) ? 'bg-green-50 border-green-200 text-green-800' : 'bg-[#f9f9ff] border-[#e9edff] text-[#43474f]'
                }`}>
                  {completedSteps.includes(s) ? <CheckCircle2 size={14} className="text-green-500 mx-auto mb-1" /> : <Clock size={14} className="text-[#43474f] mx-auto mb-1" />}
                  {stepLabels[s]}
                </div>
              ))}
            </div>
          </div>

          {/* ── STATS ROW ────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Quiz */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-[#924c00]" />
                <h3 className="font-semibold font-serif">Latest Quiz Score</h3>
              </div>
              {quizScore ? (
                <>
                  <p className="text-4xl font-bold font-serif text-[#002451]">
                    <CountUp target={latestQuizScore} /><span className="text-xl text-[#43474f]">/10</span>
                  </p>
                  <p className="text-xs text-[#43474f] mt-2">{Math.round((latestQuizScore / 10) * 100)}% correct</p>
                </>
              ) : (
                <p className="text-sm text-[#43474f]">No quiz completed yet.</p>
              )}
              <Link to="/glossary" className="mt-4 flex items-center gap-1 text-xs text-[#1A3A6B] font-semibold hover:underline">
                Take Quiz <ArrowRight size={12} />
              </Link>
            </div>

            {/* Continue learning */}
            {firstIncomplete && (
              <div className="card p-6 border-2 border-[#fc8b19]/30 bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-[#fc8b19]" />
                  <h3 className="font-semibold font-serif">Continue Learning</h3>
                </div>
                <p className="text-sm text-[#43474f] mb-4">
                  Your next step: <strong className="text-[#002451]">{stepLabels[firstIncomplete]}</strong>
                </p>
                <Link to="/journey" className="btn-primary text-xs px-4 py-2">
                  Resume Journey <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Quick actions */}
            <div className="card p-6">
              <h3 className="font-semibold font-serif mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {[
                  { to: '/chat', label: 'Ask AI Assistant', icon: MessageSquare },
                  { to: '/timeline', label: 'View Timeline', icon: TrendingUp },
                  { to: '/glossary', label: 'Browse Glossary', icon: BookOpen },
                ].map(a => (
                  <Link key={a.to} to={a.to}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#f1f3ff] hover:bg-[#e9edff] transition text-sm text-[#0d1b35] font-medium">
                    <a.icon size={15} className="text-[#1A3A6B]" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RECENT CHAT ──────────── */}
          {chatHistory.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#1A3A6B]" />
                  <h2 className="text-xl font-bold font-serif">Recent Questions</h2>
                </div>
                <Link to="/chat" className="text-xs text-[#1A3A6B] font-semibold hover:underline">Ask More →</Link>
              </div>
              <div className="space-y-3">
                {chatHistory.slice(0, 5).map(m => (
                  <div key={m.id} className="p-3 bg-[#f9f9ff] border border-[#e9edff] rounded-xl">
                    <p className="text-sm font-medium text-[#002451]">Q: {m.question}</p>
                    <p className="text-xs text-[#43474f] mt-1 line-clamp-2">{m.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
