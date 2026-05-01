import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { useTheme } from '../hooks/useTheme';

// Mock the hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../components/Toast', () => ({
  useToast: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useToast.mockReturnValue({ addToast: mockAddToast });
    useTheme.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });
  });

  it('renders the logo and navigation links', () => {
    useAuth.mockReturnValue({ user: null, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Elect/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Wise/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Journey Map')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('shows sign in button when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const signInButtons = screen.getAllByText(/Sign In/i);
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('shows user info and dashboard link when authenticated', () => {
    const mockUser = {
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
    };
    useAuth.mockReturnValue({ user: mockUser, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    const dashboardLinks = screen.getAllByText(/Dashboard/i);
    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Sign Out')).toBeInTheDocument();
  });

  it('calls signIn when sign in button is clicked', async () => {
    useAuth.mockReturnValue({ user: null, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const signInButton = screen.getAllByText(/Sign In/i)[0];
    await act(async () => {
      fireEvent.click(signInButton);
    });

    await vi.waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('calls signOut when sign out button is clicked', async () => {
    const mockUser = { displayName: 'John Doe' };
    useAuth.mockReturnValue({ user: mockUser, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const signOutButton = screen.getByLabelText('Sign Out');
    fireEvent.click(signOutButton);

    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
