import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Vote, LogIn, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/journey', label: 'Journey Map' },
  { to: '/chat', label: 'AI Assistant' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/glossary', label: 'Glossary & Quiz' },
];

export default function Navbar() {
  const { user, signIn, signOut } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn();
      addToast('Welcome to ElectWise! 🗳️', 'success');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        addToast('Sign-in cancelled.', 'info');
      } else if (code === 'auth/popup-blocked') {
        addToast('Pop-up blocked — redirecting to Google sign-in...', 'info');
      } else {
        addToast(`Sign-in failed: ${err?.message || 'Please try again.'}`, 'error');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      addToast('Signed out successfully.', 'info');
    } catch {
      addToast('Sign out failed.', 'error');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#002451] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl font-serif">
          <Vote size={24} className="text-[#fc8b19]" />
          <span>Elect<span className="text-[#fc8b19]">Wise</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'text-[#fc8b19] bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt={user.displayName} className="w-7 h-7 rounded-full border border-white/20" />
                )}
                <span className="text-white/70 text-xs">{user.displayName?.split(' ')[0]}</span>
              </div>
              <Link to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-all">
                <LogOut size={15} />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fc8b19] text-white text-sm font-semibold hover:bg-[#e07a10] transition-all shadow-md disabled:opacity-70"
            >
              {signingIn
                ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
                : <><LogIn size={15} /> Sign In with Google</>
              }
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#001c40] border-t border-white/10 px-6 py-4 flex flex-col gap-2">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-[#fc8b19] bg-white/10' : 'text-white/80'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="border-t border-white/10 pt-3 mt-1">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />}
                  <span className="text-white/70 text-xs">{user.displayName}</span>
                </div>
                <Link to="/dashboard" onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white">
                  Dashboard
                </Link>
                <button onClick={() => { handleSignOut(); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-300">
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { handleSignIn(); setOpen(false); }}
                disabled={signingIn}
                className="w-full px-4 py-2.5 rounded-lg bg-[#fc8b19] text-white text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {signingIn ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : 'Sign In with Google'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
