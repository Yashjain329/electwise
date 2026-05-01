import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GlossaryQuiz from '../pages/GlossaryQuiz';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

// Mock hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../components/Toast', () => ({
  useToast: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('GlossaryQuiz Page', () => {
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useToast.mockReturnValue({ addToast: mockAddToast });
    useAuth.mockReturnValue({ user: null });
    
    // Mock fetch response for questions
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ questions: [] }),
    });
  });

  it('renders the glossary and quiz titles', () => {
    render(
      <MemoryRouter>
        <GlossaryQuiz />
      </MemoryRouter>
    );

    expect(screen.getByText('Election Glossary')).toBeInTheDocument();
    expect(screen.getByText('Civic Quiz')).toBeInTheDocument();
  });

  it('filters glossary terms based on search input', () => {
    render(
      <MemoryRouter>
        <GlossaryQuiz />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search terms...');
    // "Electoral Roll" is unique enough
    fireEvent.change(searchInput, { target: { value: 'Electoral Roll' } });

    expect(screen.getByText('Electoral Roll')).toBeInTheDocument();
    expect(screen.queryByText('NOTA')).not.toBeInTheDocument();
  });

  it('allows answering a quiz question and proceeding to next', async () => {
    render(
      <MemoryRouter>
        <GlossaryQuiz />
      </MemoryRouter>
    );

    // Initial question (using local fallback as fetch returns empty)
    expect(screen.getByText(/What is the minimum age to vote/i)).toBeInTheDocument();

    // Select an option (index 1 is 18)
    const optionButton = screen.getByText('18');
    fireEvent.click(optionButton);

    // Should show "Next Question" or "See Results" button
    const nextButton = await screen.findByText(/Next Question/i);
    fireEvent.click(nextButton);

    // Should show second question
    expect(screen.getByText(/How many phases did the 2026 Lok Sabha election have/i)).toBeInTheDocument();
  });

  it('shows results at the end of the quiz', async () => {
    // We'll skip most questions by mocking the state or just clicking through if it's small.
    // For simplicity, let's just test that the results card appears if we finish.
    // However, questions is a long array. Let's mock the fetch to return only 1 question.
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ q: 'Short Quiz?', options: ['A', 'B'], correct: 0 }]),
    });

    render(
      <MemoryRouter>
        <GlossaryQuiz />
      </MemoryRouter>
    );

    const optionA = await screen.findByText('A');
    fireEvent.click(optionA);

    const resultsButton = await screen.findByText('See Results');
    fireEvent.click(resultsButton);

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Score
  });

  it('saves score if user is logged in', async () => {
    const mockUser = { uid: 'user123' };
    useAuth.mockReturnValue({ user: mockUser });

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ q: 'Test?', options: ['A'], correct: 0 }]),
    });

    render(
      <MemoryRouter>
        <GlossaryQuiz />
      </MemoryRouter>
    );

    const optionA = await screen.findByText('A');
    fireEvent.click(optionA);

    // Mock the score save call
    global.fetch.mockResolvedValueOnce({ ok: true });

    const resultsButton = await screen.findByText('See Results');
    fireEvent.click(resultsButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/scores'), expect.any(Object));
    });
  });
});
