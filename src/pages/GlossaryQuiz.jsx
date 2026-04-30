import { useReducer, useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Search, BookOpen, CheckCircle2, XCircle, RotateCcw, Share2, Trophy } from 'lucide-react';

const glossaryTerms = [
  { term: 'Electoral Roll', def: 'The official list of all registered voters in a constituency, maintained by the ECI.' },
  { term: 'Constituency', def: 'A geographical division of the country for election purposes. Each constituency elects one representative.' },
  { term: 'EVM', def: 'Electronic Voting Machine — a battery-operated device used to record votes in Indian elections.' },
  { term: 'VVPAT', def: 'Voter Verified Paper Audit Trail — a slip printed for 7 seconds confirming which party was voted for.' },
  { term: 'Model Code of Conduct', def: 'A set of guidelines issued by the ECI that governs political parties and candidates during election campaigns.' },
  { term: 'Returning Officer', def: 'An official responsible for conducting elections in a constituency and declaring results.' },
  { term: 'NOTA', def: 'None of the Above — an option on EVMs allowing voters to reject all candidates without abstaining.' },
  { term: 'Lok Sabha', def: 'The lower house of India\'s Parliament. Members are directly elected by citizens every 5 years.' },
  { term: 'Rajya Sabha', def: 'The upper house of India\'s Parliament. Members are elected by state legislatures, not directly.' },
  { term: 'Booth Level Officer', def: 'A government official responsible for updating voter rolls at the polling booth level.' },
  { term: 'Affidavit', def: 'A sworn statement that candidates must file with their nomination, disclosing criminal records and assets.' },
  { term: 'Floor Crossing', def: 'When a member of parliament or assembly votes against or abstains from their party\'s official position.' },
  { term: 'Delimitation', def: 'The process of redrawing electoral constituency boundaries based on population census data.' },
  { term: 'Defection', def: 'Changing political party allegiance after being elected, regulated by the Anti-Defection Law (10th Schedule).' },
  { term: 'Panchayati Raj', def: 'The system of local self-governance at village, block, and district levels as per the 73rd Amendment.' },
  { term: 'Proxy Voting', def: 'Voting on behalf of someone else. Not permitted in Indian general elections; only for service voters.' },
  { term: 'Postal Ballot', def: 'A facility allowing certain categories of voters (service personnel, senior citizens) to vote by mail.' },
  { term: 'Election Petition', def: 'A legal challenge to an election result, filed in a High Court within 45 days of result declaration.' },
  { term: 'By-Election', def: 'An election held to fill a vacant seat between general elections due to resignation, death, or disqualification.' },
  { term: 'First Past the Post', def: 'India\'s voting system where the candidate with the most votes in a constituency wins, regardless of majority.' },
  { term: 'Security Deposit', def: 'Amount paid by candidates when filing nominations (₹25,000 for LS). Forfeited if less than 1/6 votes secured.' },
  { term: 'Anti-Defection Law', def: 'The 10th Schedule of the Constitution that disqualifies MPs/MLAs who switch parties without cause.' },
];

const questions = [
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

const initialState = { current: 0, selected: null, score: 0, done: false, answers: [] };
function quizReducer(state, action) {
  switch (action.type) {
    case 'SELECT': return { ...state, selected: action.idx };
    case 'NEXT': {
      const isCorrect = action.idx === questions[state.current].correct;
      const answers = [...state.answers, { selected: action.idx, correct: questions[state.current].correct }];
      const score = state.score + (isCorrect ? 1 : 0);
      const next = state.current + 1;
      if (next >= questions.length) return { ...state, score, answers, done: true, selected: null };
      return { ...state, score, answers, current: next, selected: null };
    }
    case 'RESET': return initialState;
    default: return state;
  }
}

export default function GlossaryQuiz() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    document.title = 'Glossary & Quiz — ElectWise';
  }, []);

  useEffect(() => {
    if (state.done) saveScore();
  }, [state.done]);

  const saveScore = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'quizScores', user.uid), {
        score: state.score, totalQuestions: questions.length, completedAt: serverTimestamp()
      });
      addToast(`Score saved! You got ${state.score}/10.`, 'success');
    } catch {
      addToast('Could not save your score.', 'error');
    }
  };

  const handleShare = () => {
    const text = `I scored ${state.score}/10 on the ElectWise Civic Quiz! 🗳️ Test your knowledge at electwise.app`;
    if (navigator.share) {
      navigator.share({ title: 'ElectWise Quiz', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      addToast('Score copied to clipboard!', 'success');
    }
  };

  const filtered = glossaryTerms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.def.toLowerCase().includes(search.toLowerCase())
  );

  const q = questions[state.current];
  const pct = Math.round((state.score / questions.length) * 100);

  return (
    <main className="page-wrapper">
      {/* Header */}
      <section className="hero-gradient text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Glossary & Civic Quiz</h1>
          <p className="text-white/75">Master election terminology and test your democratic knowledge.</p>
        </div>
      </section>

      <section className="py-12 px-6 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── GLOSSARY ─────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-[#1A3A6B]" />
              <h2 className="text-2xl font-bold font-serif">Election Glossary</h2>
            </div>
            <p className="text-[#43474f] text-sm mb-4">{filtered.length} of {glossaryTerms.length} terms</p>

            {/* Search */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43474f]" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search terms..."
                aria-label="Search glossary"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e9edff] rounded-xl text-sm text-[#0d1b35] outline-none focus:border-[#1A3A6B] transition"
              />
            </div>

            {/* Terms list */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(item => (
                <div key={item.term} className="bg-white border border-[#e9edff] rounded-xl p-4 hover:border-[#1A3A6B]/40 transition">
                  <h4 className="font-semibold text-[#002451] font-serif">{item.term}</h4>
                  <p className="text-sm text-[#43474f] mt-1 leading-relaxed">{item.def}</p>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-[#43474f] text-sm text-center py-12">No terms match your search.</p>
              )}
            </div>
          </div>

          {/* ── QUIZ ─────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={20} className="text-[#fc8b19]" />
              <h2 className="text-2xl font-bold font-serif">Civic Quiz</h2>
            </div>

            {!state.done ? (
              <div className="card p-6">
                {/* Progress */}
                <div className="flex justify-between text-xs text-[#43474f] mb-2">
                  <span>Question {state.current + 1} of {questions.length}</span>
                  <span>Score: {state.score}</span>
                </div>
                <div className="progress-bar mb-6">
                  <div className="progress-fill" style={{ width: `${((state.current) / questions.length) * 100}%` }} />
                </div>

                <h3 className="font-semibold text-[#0d1b35] text-lg font-serif mb-5">{q.q}</h3>

                <div className="flex flex-col gap-3 mb-6">
                  {q.options.map((opt, i) => {
                    let cls = 'border border-[#e9edff] bg-[#f9f9ff] text-[#0d1b35] hover:border-[#1A3A6B] hover:bg-[#e9edff]';
                    if (state.selected !== null) {
                      if (i === q.correct) cls = 'border-2 border-green-500 bg-green-50 text-green-800';
                      else if (i === state.selected && i !== q.correct) cls = 'border-2 border-red-400 bg-red-50 text-red-700';
                      else cls = 'border border-[#e9edff] bg-[#f9f9ff] text-[#43474f] opacity-60';
                    }
                    return (
                      <button key={i} onClick={() => state.selected === null && dispatch({ type: 'SELECT', idx: i })}
                        className={`p-3 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between ${cls}`}
                        aria-label={`Option: ${opt}`}
                      >
                        <span>{opt}</span>
                        {state.selected !== null && i === q.correct && <CheckCircle2 size={16} className="text-green-600" />}
                        {state.selected === i && i !== q.correct && <XCircle size={16} className="text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {state.selected !== null && (
                  <button onClick={() => dispatch({ type: 'NEXT', idx: state.selected })}
                    className="btn-primary w-full justify-center">
                    {state.current + 1 < questions.length ? 'Next Question →' : 'See Results'}
                  </button>
                )}
              </div>
            ) : (
              /* Results card */
              <div className="card p-8 text-center animate-fade-up">
                <div className="w-20 h-20 bg-[#e9edff] rounded-full flex items-center justify-center mx-auto mb-5">
                  <Trophy size={36} className="text-[#fc8b19]" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2">Quiz Complete!</h3>
                <div className="text-6xl font-bold text-[#002451] font-serif my-4 animate-count-up">
                  {state.score}<span className="text-2xl text-[#43474f]">/{questions.length}</span>
                </div>
                <div className="w-full max-w-xs mx-auto mb-4">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-sm text-[#43474f] mt-2">{pct}% correct</p>
                </div>
                <p className="text-[#43474f] text-sm mb-6">
                  {pct >= 80 ? '🎉 Excellent! You\'re a civic champion!' :
                   pct >= 60 ? '👍 Good job! Keep studying the glossary.' :
                   '📚 Keep learning! Review the glossary and try again.'}
                </p>
                {!user && <p className="text-xs text-yellow-700 bg-yellow-50 p-3 rounded-lg mb-5">Sign in to save your score.</p>}
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => dispatch({ type: 'RESET' })}
                    className="btn-secondary flex items-center gap-2">
                    <RotateCcw size={15} /> Retry Quiz
                  </button>
                  <button onClick={handleShare}
                    className="btn-primary flex items-center gap-2">
                    <Share2 size={15} /> Share Score
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
