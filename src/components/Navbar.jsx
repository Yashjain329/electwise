import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Vote, LogIn, LogOut, LayoutDashboard, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';
import { useTheme } from '../hooks/useTheme';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/journey', label: 'Journey Map' },
  { to: '/chat', label: 'AI Assistant' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/glossary', label: 'Glossary & Quiz' },
];

export default function Navbar() {
  const { user, signIn, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn();
      addToast('Welcome to ElectWise!', 'success');
    } catch (err) {
      addToast('Sign in failed. Please try again.', 'error');
      console.error(err);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Logged out successfully.', 'info');
      navigate('/');
    } catch (err) {
      addToast('Error signing out.', 'error');
      console.error(err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#002451] dark:bg-[#001c40] border-b border-white/10 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl font-serif group">
          <Vote size={24} className="text-[#fc8b19] group-hover:rotate-12 transition-transform" />
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

        {/* Action Group */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt={user.displayName} className="w-7 h-7 rounded-full border border-white/20" />
                  )}
                  <span className="text-white/70 text-xs hidden lg:block">{user.displayName?.split(' ')[0]}</span>
                </div>
                <Link to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button onClick={handleSignOut}
                  aria-label="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30 transition-all">
                  <LogOut size={15} />
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
                  : <><LogIn size={15} /> Sign In</>
                }
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header Icons */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-white/80"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="text-white p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#001c40] border-t border-white/10 px-6 py-4 flex flex-col gap-2 overflow-hidden"
          >
            {navLinks.map((l, i) => (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                key={l.to}
              >
                <NavLink to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-[#fc8b19] bg-white/10' : 'text-white/80'}`
                  }
                >
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
            <div className="border-t border-white/10 pt-3 mt-1">
              {user ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
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
                </motion.div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
