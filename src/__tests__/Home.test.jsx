import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
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

describe('Home Page', () => {
  const mockSignIn = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useToast.mockReturnValue({ addToast: mockAddToast });
    useAuth.mockReturnValue({ user: null, signIn: mockSignIn });
  });

  it('renders the hero section with title and description', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Empowering Every Citizen/i)).toBeInTheDocument();
    expect(screen.getByText(/from registration to results/i)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Election Journey Map')).toBeInTheDocument();
    expect(screen.getByText('AI Civic Assistant')).toBeInTheDocument();
    expect(screen.getByText('Glossary & Quiz')).toBeInTheDocument();
    expect(screen.getByText('Election Timeline')).toBeInTheDocument();
  });

  it('navigates to journey map when button is clicked', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const journeyButton = screen.getByText(/Start Your Journey/i);
    fireEvent.click(journeyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/journey');
  });

  it('shows sign in button for unauthenticated users', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign In with Google/i)).toBeInTheDocument();
  });

  it('hides sign in button for authenticated users', () => {
    useAuth.mockReturnValue({ user: { name: 'Test' }, signIn: mockSignIn });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Sign In with Google/i)).not.toBeInTheDocument();
  });
});
