import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

// Mock the hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
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

    const signInButtons = screen.getAllByText(/Sign In with Google/i);
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
    const signOutButtons = screen.getAllByText(/Sign Out/i);
    expect(signOutButtons.length).toBeGreaterThan(0);
  });

  it('calls signIn when sign in button is clicked', async () => {
    useAuth.mockReturnValue({ user: null, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const signInButton = screen.getAllByText(/Sign In with Google/i)[0];
    fireEvent.click(signInButton);

    expect(mockSignIn).toHaveBeenCalled();
  });

  it('calls signOut when sign out button is clicked', async () => {
    const mockUser = { displayName: 'John Doe' };
    useAuth.mockReturnValue({ user: mockUser, signIn: mockSignIn, signOut: mockSignOut });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const signOutButton = screen.getAllByText(/Sign Out/i)[0];
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });
});
