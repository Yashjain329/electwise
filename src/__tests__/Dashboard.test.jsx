import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { ToastProvider } from '../components/Toast';
import { BrowserRouter } from 'react-router-dom';

// Mock Firebase
vi.mock('../firebase', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  }
}));

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-123', displayName: 'Test User', email: 'test@example.com' },
    loading: false
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('Dashboard Component', () => {
  it('renders loading state initially', async () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <Dashboard />
        </ToastProvider>
      </BrowserRouter>
    );
    
    expect(await screen.findByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Democracy Score/i)).toBeInTheDocument();
  });

  it('displays the stats cards', async () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <Dashboard />
        </ToastProvider>
      </BrowserRouter>
    );
    
    expect(await screen.findByText(/Day Streak/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Chats/i)).toBeInTheDocument();
    expect(screen.getByText(/Journey Progress/i)).toBeInTheDocument();
  });
});
