import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chat from '../pages/Chat';
import { useAuth } from '../hooks/useAuth';

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Chat Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: null });
  });

  it('renders the initial AI greeting', () => {
    render(<Chat />);
    // Check for key components of the greeting separately to avoid issues with split text nodes
    expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
    expect(screen.getByText(/ElectWise AI/i)).toBeInTheDocument();
  });

  it('allows user to send a message and receive a response', async () => {
    const mockResponse = { answer: 'The EVM is a battery-operated device.', model: 'gemini-pro' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<Chat />);

    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'How does EVM work?' } });
    fireEvent.click(sendButton);

    // Should show user message
    expect(await screen.findByText('How does EVM work?')).toBeInTheDocument();

    // Should show AI response
    expect(await screen.findByText((content) => content.includes('The EVM is a battery-operated device'))).toBeInTheDocument();
  });

  it('shows an error message when the API fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    render(<Chat />);

    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Fail test' } });
    fireEvent.click(sendButton);

    const errorElements = await screen.findAllByText(/Internal Server Error/i);
    expect(errorElements.length).toBeGreaterThan(0);
  });

  it('sends suggested questions when clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: 'Suggested answer', model: 'test' }),
    });

    render(<Chat />);

    const suggestion = screen.getAllByText('How does the EVM work?')[0];
    fireEvent.click(suggestion);

    await waitFor(() => {
      // One in suggestion chip, one in chat bubble
      expect(screen.getAllByText('How does the EVM work?').length).toBeGreaterThan(0);
      expect(screen.getByText('Suggested answer')).toBeInTheDocument();
    });
  });
});
