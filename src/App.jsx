import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './hooks/useTheme';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages for better efficiency
const Home = lazy(() => import('./pages/Home'));
const Journey = lazy(() => import('./pages/Journey'));
const Chat = lazy(() => import('./pages/Chat'));
const Timeline = lazy(() => import('./pages/Timeline'));
const GlossaryQuiz = lazy(() => import('./pages/GlossaryQuiz'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Loading fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-[#1A3A6B]/20 border-t-[#1A3A6B] rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/journey" element={<Journey />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/glossary" element={<GlossaryQuiz />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
            <Footer />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
