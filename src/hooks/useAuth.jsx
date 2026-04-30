import { useState, useEffect, createContext, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle redirect result after page reload (mobile / popup-blocked)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch((err) => {
        // Ignore "no redirect" non-errors
        if (err.code !== 'auth/no-auth-event') {
          console.error('Redirect result error:', err.code, err.message);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    setAuthError(null);
    try {
      // Try popup first (best UX on desktop)
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.warn('Popup auth failed:', err.code);

      const shouldRedirect = [
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment',
        'auth/web-storage-unsupported',
      ].includes(err.code);

      if (shouldRedirect) {
        try {
          // Redirect flow — page will reload after Google sign-in
          await signInWithRedirect(auth, googleProvider);
          return null; // Will complete on reload via getRedirectResult
        } catch (redirectErr) {
          console.error('Redirect sign-in failed:', redirectErr);
          setAuthError(
            'Sign-in failed. Please ensure pop-ups are allowed or try a different browser.'
          );
          throw redirectErr;
        }
      }

      // Unauthorized domain — most common cause of "Sign in failed"
      if (err.code === 'auth/unauthorized-domain') {
        const msg =
          'This domain is not authorized in Firebase. Add it to Firebase Console → Authentication → Settings → Authorized domains.';
        setAuthError(msg);
        throw new Error(msg);
      }

      setAuthError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
