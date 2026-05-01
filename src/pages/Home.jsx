import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Map, Bot, BookOpen, Calendar, CheckCircle2, Users, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

const features = [
  {
    icon: Map,
    title: 'Election Journey Map',
    desc: 'A visual, interactive walkthrough of the entire voting process from registration to the final tally.',
    cta: 'LEARN MORE',
    route: '/journey',
    color: '#1A3A6B',
    bg: '#e9edff',
  },
  {
    icon: Bot,
    title: 'AI Civic Assistant',
    desc: 'Get instant, non-partisan answers to complex questions about election laws and voting procedures.',
    cta: 'ASK AI',
    route: '/chat',
    color: '#924c00',
    bg: '#fff3e0',
  },
  {
    icon: BookOpen,
    title: 'Glossary & Quiz',
    desc: 'Master the terminology of democracy and test your knowledge with interactive civic challenges.',
    cta: 'START QUIZ',
    route: '/glossary',
    color: '#1a5c35',
    bg: '#e8f5e9',
  },
  {
    icon: Calendar,
    title: 'Election Timeline',
    desc: 'Stay ahead with key dates, deadlines, and historical milestones of the upcoming election cycle.',
    cta: 'VIEW DATES',
    route: '/timeline',
    color: '#6a1a6a',
    bg: '#f3e5f5',
  },
];

const howItWorks = [
  { icon: CheckCircle2, step: '01', title: 'Register Your Voice', desc: 'Check your eligibility and register through your state\'s portal in minutes.' },
  { icon: Shield, step: '02', title: 'Educate & Inform', desc: 'Browse non-partisan guides and use our AI to clarify complex ballot measures.' },
  { icon: Users, step: '03', title: 'Cast Your Vote', desc: 'Find your polling place or request a mail-in ballot with confidence.' },
];

const stats = [
  { icon: Users, value: '968M+', label: 'Registered Voters in India' },
  { icon: BarChart3, value: '66%+', label: 'Average Voter Turnout' },
  { icon: CheckCircle2, value: '36', label: 'States & Union Territories' },
];

export default function Home() {
  const { user, signIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ElectWise — Empowering Every Citizen';
  }, []);

  const handleSignIn = async () => {
    try { await signIn(); addToast('Welcome!', 'success'); }
    catch { addToast('Sign in failed. Please try again.', 'error'); }
  };

  return (
    <main className="page-wrapper">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero-gradient text-white py-28 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fc8b19]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#fc8b19]/20 text-[#fc8b19] text-xs font-semibold uppercase tracking-widest mb-6 animate-fade-in">
            Hack2Skill PromptWars 2026
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-up font-serif">
            Empowering <span className="text-[#fc8b19]">Every Citizen</span><br />
            with Democratic Knowledge
          </h1>
          <p className="text-xl text-white/75 max-w-2xl mx-auto mb-10 animate-fade-up-delay">
            A step-by-step guide to how elections work — from registration to results. 
            Empowering every citizen with the knowledge to lead the future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay">
            <button onClick={() => navigate('/journey')} className="btn-primary text-base px-8 py-3">
              Start Your Journey <ArrowRight size={18} />
            </button>
            {!user && (
              <button onClick={handleSignIn} className="btn-secondary text-base px-8 py-3 border-white/40 text-white hover:bg-white hover:text-[#002451]">
                Sign In with Google
              </button>
            )}
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-[#fc8b19] font-serif">{s.value}</p>
                <p className="text-xs text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ────────────────────────── */}
      <section className="py-20 px-6 bg-[#f1f3ff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-3">Everything You Need to Participate</h2>
            <p className="text-[#43474f] max-w-xl mx-auto">Four powerful tools to guide your civic journey from start to finish.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title}
                onClick={() => navigate(f.route)}
                className="card p-6 cursor-pointer group"
                role="button" tabIndex={0}
                aria-label={`Go to ${f.title}`}
                onKeyDown={e => e.key === 'Enter' && navigate(f.route)}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 className="font-semibold text-[#0d1b35] text-lg mb-2 font-serif">{f.title}</h3>
                <p className="text-[#43474f] text-sm leading-relaxed mb-5">{f.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1A3A6B] group-hover:gap-2.5 transition-all">
                  {f.cta} <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif mb-3">How It Works</h2>
            <p className="text-[#43474f]">Three simple steps to become a fully informed voter.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((h, i) => (
              <div key={h.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[#c4c6d0] to-transparent z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[#e9edff] shadow-sm">
                  <div className="w-14 h-14 bg-[#e9edff] rounded-2xl flex items-center justify-center mb-4">
                    <h.icon size={24} className="text-[#1A3A6B]" />
                  </div>
                  <span className="text-xs font-bold text-[#fc8b19] uppercase tracking-wider mb-2">Step {h.step}</span>
                  <h3 className="font-semibold text-lg font-serif mb-2">{h.title}</h3>
                  <p className="text-[#43474f] text-sm">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section className="bg-[#1A3A6B] text-white py-16 px-6 mx-6 mb-16 rounded-2xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-serif mb-4">Ready to Lead the Future?</h2>
          <p className="text-white/75 mb-8">Join thousands of citizens who are educating themselves about India's democratic process.</p>
          <button onClick={() => navigate('/journey')} className="btn-primary text-base px-8 py-3">
            Begin Your Civic Journey <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
