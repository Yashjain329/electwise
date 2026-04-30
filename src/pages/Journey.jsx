import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import {
  ChevronDown, ChevronUp, CheckCircle2, Lock, ClipboardList,
  UserCheck, FileText, Building2, BarChart3, Trophy
} from 'lucide-react';

const steps = [
  {
    id: 'registration',
    title: 'Voter Registration',
    icon: UserCheck,
    summary: 'The foundational step — enrolling your name in the Electoral Roll.',
    detailHTML: `
      <p>Voter registration is the process by which eligible citizens enroll themselves on the <strong>Electoral Roll</strong>, maintained by the Election Commission of India (ECI). Without registration, you cannot vote.</p>
      <h4>Who Can Register?</h4>
      <ul>
        <li>Indian citizen aged 18 or above</li>
        <li>Ordinary resident of the constituency</li>
        <li>Not disqualified under any law</li>
      </ul>
      <h4>How to Register</h4>
      <ul>
        <li>Online: Visit <strong>voters.eci.gov.in</strong> and fill Form 6</li>
        <li>Offline: Submit Form 6 at your local Electoral Registration Officer</li>
        <li>Mobile: Use the <strong>Voter Helpline App</strong> or dial 1950</li>
      </ul>
      <h4>Key Documents Required</h4>
      <ul>
        <li>Proof of Age (Birth Certificate / 10th Certificate)</li>
        <li>Proof of Residence (Aadhaar / Electricity Bill / Passport)</li>
        <li>Recent passport-size photograph</li>
      </ul>
    `,
  },
  {
    id: 'nomination',
    title: 'Candidate Nomination',
    icon: ClipboardList,
    summary: 'Learn how political candidates formally declare their candidacy.',
    detailHTML: `
      <p>Nomination is the formal process by which a candidate declares their intention to contest an election. This is governed by the <strong>Representation of the People Act, 1951</strong>.</p>
      <h4>Nomination Process</h4>
      <ul>
        <li>Candidates file nomination papers at the Returning Officer's office</li>
        <li>Papers must be filed within the period specified in the Election Schedule</li>
        <li>A security deposit is required (₹25,000 for Lok Sabha, ₹12,500 for Vidhan Sabha)</li>
      </ul>
      <h4>Scrutiny & Withdrawal</h4>
      <ul>
        <li>The Returning Officer scrutinizes all nomination papers</li>
        <li>Candidates can withdraw their nomination within 2 days of scrutiny</li>
        <li>Final candidate list (final roll) is published after the withdrawal deadline</li>
      </ul>
    `,
  },
  {
    id: 'campaigning',
    title: 'Election Campaign',
    icon: FileText,
    summary: 'Discover the rules and limits around political campaigning in India.',
    detailHTML: `
      <p>Campaigning is the period during which candidates and parties try to persuade voters. The <strong>Model Code of Conduct (MCC)</strong> comes into force as soon as election dates are announced.</p>
      <h4>Model Code of Conduct</h4>
      <ul>
        <li>No party in power can use government resources for campaign advantage</li>
        <li>No hate speech, communal appeals, or voter bribery</li>
        <li>Campaign expenditure limits apply (₹95 lakh for Lok Sabha)</li>
      </ul>
      <h4>Campaign Activities</h4>
      <ul>
        <li>Public meetings and rallies (require police permission)</li>
        <li>Door-to-door canvassing</li>
        <li>Print / digital media advertisements (must be pre-certified)</li>
      </ul>
      <h4>Silence Period</h4>
      <p>Campaigning must stop 48 hours before polling. This "campaign silence" prevents last-minute influence.</p>
    `,
  },
  {
    id: 'polling',
    title: 'Polling Day',
    icon: Building2,
    summary: 'What happens on the actual day of voting — from booth setup to closing.',
    detailHTML: `
      <p>Polling Day is when registered voters cast their ballots using <strong>Electronic Voting Machines (EVMs)</strong>. India runs the world's largest democratic exercise.</p>
      <h4>At the Polling Station</h4>
      <ul>
        <li>Bring your Voter ID card or alternate valid photo ID</li>
        <li>Your name is verified against the Electoral Roll</li>
        <li>Your finger is marked with indelible ink</li>
        <li>You press the button next to your preferred candidate on the EVM</li>
        <li>The VVPAT slip shows your vote for 7 seconds for verification</li>
      </ul>
      <h4>Key Facts</h4>
      <ul>
        <li>Polling hours: 7:00 AM to 6:00 PM (general)</li>
        <li>You can vote at any time during polling hours</li>
        <li>Voting is by secret ballot — no one can know your choice</li>
        <li>NOTA (None of the Above) is an option on every EVM</li>
      </ul>
    `,
  },
  {
    id: 'results',
    title: 'Counting & Results',
    icon: BarChart3,
    summary: 'Understand how votes are counted, results declared, and disputes resolved.',
    detailHTML: `
      <p>After polling, the EVMs are sealed and stored in strong rooms under security. Counting takes place on a date specified by the ECI, typically 1–2 days after the final phase of polling.</p>
      <h4>Counting Process</h4>
      <ul>
        <li>Counting agents from each candidate are present at the Counting Centre</li>
        <li>EVMs are opened round by round</li>
        <li>Results are displayed live on ECI's <strong>results.eci.gov.in</strong></li>
      </ul>
      <h4>Declaration & Certificate</h4>
      <ul>
        <li>The candidate with the most votes wins (First Past the Post system)</li>
        <li>The Returning Officer declares the result and issues the Election Certificate</li>
        <li>The elected candidate then takes the oath of office</li>
      </ul>
      <h4>Election Petitions</h4>
      <p>Any candidate or voter can challenge the result by filing an <strong>Election Petition</strong> in the High Court within 45 days of declaration.</p>
    `,
  },
];

export default function Journey() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    document.title = 'Journey Map — ElectWise';
    if (user) loadProgress();
  }, [user]);

  useEffect(() => {
    if (completedSteps.length === steps.length && !confettiFired) {
      fireConfetti();
      setConfettiFired(true);
    }
  }, [completedSteps]);

  const loadProgress = async () => {
    try {
      const ref = doc(db, 'userProgress', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setCompletedSteps(snap.data().completedSteps || []);
    } catch (e) {
      addToast('Could not load progress.', 'error');
    }
  };

  const markComplete = async (stepId) => {
    if (!user || completedSteps.includes(stepId)) return;
    const updated = [...completedSteps, stepId];
    setCompletedSteps(updated);
    try {
      const ref = doc(db, 'userProgress', user.uid);
      await setDoc(ref, { completedSteps: updated, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      addToast('Could not save progress.', 'error');
    }
  };

  const fireConfetti = async () => {
    try {
      const { default: confetti } = await import('canvas-confetti');
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, colors: ['#002451', '#fc8b19', '#ffffff'] });
    } catch {}
  };

  const toggle = (id) => {
    setExpanded(prev => {
      const next = prev === id ? null : id;
      if (next) markComplete(id);
      return next;
    });
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <main className="page-wrapper">
      {/* Header */}
      <section className="hero-gradient text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Your Election Journey</h1>
          <p className="text-white/75 text-lg">A step-by-step guide to India's democratic process — from registration to results.</p>
          {!user && (
            <p className="mt-4 text-sm text-[#fc8b19] bg-white/10 rounded-full px-4 py-2 inline-block">
              💡 Sign in to save your progress
            </p>
          )}
        </div>
      </section>

      <section className="py-12 px-6 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between text-sm font-medium text-[#43474f] mb-2">
              <span>{completedSteps.length} of {steps.length} steps completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            {completedSteps.length === steps.length && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium text-center flex items-center justify-center gap-2">
                <Trophy size={16} className="text-green-600" />
                🎉 You've completed the entire Election Journey! Your Democracy Score is updated.
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const isExpanded = expanded === step.id;
              const isDone = completedSteps.includes(step.id);
              const Icon = step.icon;
              return (
                <div key={step.id}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isDone ? 'border-green-200 bg-green-50/50' : 'border-[#e9edff] bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggle(step.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-black/[0.02] transition"
                    aria-expanded={isExpanded}
                    aria-label={`${step.title} — click to ${isExpanded ? 'collapse' : 'expand'}`}
                  >
                    {/* Step number */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isDone ? 'bg-green-500 text-white' : 'bg-[#e9edff] text-[#1A3A6B]'
                    }`}>
                      {isDone ? <CheckCircle2 size={18} /> : `0${i + 1}`}
                    </div>
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-[#f1f3ff] rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-[#1A3A6B]" />
                    </div>
                    {/* Title + summary */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0d1b35] font-serif">{step.title}</h3>
                      <p className="text-sm text-[#43474f] mt-0.5">{step.summary}</p>
                    </div>
                    {/* Chevron */}
                    <div className="flex-shrink-0 text-[#43474f]">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div
                      className="px-6 pb-6 border-t border-[#e9edff] prose-sm max-w-none text-[#0d1b35] animate-fade-in"
                      style={{ fontSize: '0.9rem', lineHeight: '1.7' }}
                      dangerouslySetInnerHTML={{ __html: step.detailHTML }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
